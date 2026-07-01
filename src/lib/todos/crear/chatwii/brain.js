/**
 * brain.js - Motor logico de Chatwii. Se conecta con Gemini API y maneja el historial.
 * Escrito en espanol sin tildes para evitar problemas de codificacion.
 */

import { llamarGeminiStream } from '../../../api/gemini.js';
import { wiRateLimit, Notificacion } from '../../../widev/widev.js';
import { chatwiiPersona } from './personalidad.js';
import { promptNuevo } from './skills/nuevo.js';
import { promptSubido } from './skills/subido.js';
import { promptPuesto } from './skills/puesto.js';
import { promptTraducir } from './skills/traducir.js';
import { isCvVacio, CLAVES_VALIDAS_CV } from '../centralcv.js';

let _lang = 'es';
let _getCvData = null;
let _updateCvData = null;
let _historial = []; // [{role: 'user'|'model', parts: [{text}]}]
let _lastPatch = null; // ultimo(s) patch(es) propuesto(s) (puede ser array)

const getCacheKey = () => `chatwii_crear_${_lang}`;

/**
 * Inicializa el estado del cerebro del chat
 */
export const initChatwii = (lang, getCvData, updateCvData) => {
  _lang = lang;
  _getCvData = getCvData;
  _updateCvData = updateCvData;

  try {
    const saved = localStorage.getItem(getCacheKey());
    if (saved) {
      _historial = JSON.parse(saved);
    } else {
      _historial = [];
    }
  } catch (_) {
    _historial = [];
  }
};

/**
 * Devuelve el ultimo parche propuesto por la IA
 */
export const obtenerUltimoPatch = () => _lastPatch;

/**
 * Limpia el ultimo parche propuesto
 */
export const limpiarUltimoPatch = () => {
  _lastPatch = null;
};

/**
 * Devuelve el historial actual
 */
export const obtenerHistorial = () => _historial;

/**
 * Limpia el historial de la conversacion de forma permanente
 */
export const limpiarHistorial = () => {
  _historial = [];
  _lastPatch = null;
  try {
    localStorage.removeItem(getCacheKey());
  } catch (_) {}
};

const persistirHistorial = () => {
  try {
    localStorage.setItem(getCacheKey(), JSON.stringify(_historial));
  } catch (_) {}
};



const contieneSolicitudPuesto = (texto) => {
  if (!texto) return false;
  const t = texto.toLowerCase();
  return (
    t.includes('puesto:') || 
    t.includes('vacante:') || 
    t.includes('oferta:') || 
    t.includes('adaptar a') || 
    t.includes('de acuerdo a') ||
    t.includes('perfil de')
  );
};

const contieneSolicitudTraduccion = (texto) => {
  if (!texto) return false;
  const t = texto.toLowerCase();
  return (
    t.includes('traducir') ||
    t.includes('traduccion') ||
    t.includes('translate') ||
    t.includes('translation') ||
    t.includes('en ingles') ||
    t.includes('en espanol') ||
    t.includes('al ingles') ||
    t.includes('al espanol')
  );
};

const obtenerIdiomaDestino = (texto) => {
  if (!texto) return 'en';
  const t = texto.toLowerCase();
  if (t.includes('espanol') || t.includes('spanish') || t.includes('castellano')) {
    return 'es';
  }
  return 'en';
};

export const CHATWII_MAX_USES = 100;
export const CHATWII_LIMIT_KEY = 'chatwii_uses';

/**
 * Envia el mensaje del usuario a Gemini y procesa la respuesta por chunks
 */
export const enviarMensaje = async (textoUsuario, onChunk) => {
  const rate = wiRateLimit(CHATWII_LIMIT_KEY, CHATWII_MAX_USES, 'dia');
  if (!rate.ok) {
    const msgError = _lang === 'en'
      ? `You have reached the ${CHATWII_MAX_USES}-message limit. Please try again later.`
      : `Has alcanzado el limite de ${CHATWII_MAX_USES} respuestas. ¡Por favor intenta mas tarde!`;
    Notificacion(msgError, 'warning', 6000);
    throw new Error('Rate limit reached');
  }

  // Añadir mensaje del usuario al historial
  _historial.push({ role: 'user', parts: [{ text: textoUsuario }] });
  persistirHistorial();

  // Obtener contexto dinámico del CV actual y elegir prompt especifico
  const cv = _getCvData ? _getCvData() : {};
  const esVacio = isCvVacio(cv);
  
  let promptEspecifico = '';
  if (esVacio) {
    promptEspecifico = promptNuevo(cv, _lang);
  } else if (contieneSolicitudTraduccion(textoUsuario)) {
    const targetLang = obtenerIdiomaDestino(textoUsuario);
    promptEspecifico = promptTraducir(cv, _lang, targetLang);
  } else if (contieneSolicitudPuesto(textoUsuario)) {
    promptEspecifico = promptPuesto(cv, _lang);
  } else {
    promptEspecifico = promptSubido(cv, _lang);
  }

  // Turno inicial de contexto para Gemini
  const contextTurn = {
    role: 'user',
    parts: [{ text: `INFORMACION Y CONTEXTO DEL CURRICULUM DEL CANDIDATO A AUDITAR:\n${promptEspecifico}` }]
  };
  
  const contextAckTurn = {
    role: 'model',
    parts: [{ text: `¡Hola! Entendido perfectamente. He cargado todos los datos del curriculum y el perfil objetivo. Estoy listo para ayudarte a optimizar con total libertad, cercania y enfoque ATS. Dime, ¿como empezamos a mejorar tu perfil?` }]
  };

  // Ventana deslizable para limitar el historial activo de la llamada a la API a un maximo de 10 mensajes
  const maxHistory = 10;
  let historySlice = _historial;
  if (_historial.length > maxHistory) {
    let startIdx = _historial.length - maxHistory;
    while (startIdx > 0 && _historial[startIdx].role !== 'user') {
      startIdx--;
    }
    historySlice = _historial.slice(startIdx);
  }

  // Limpiar parches en el historial para evitar bucles de repeticion en la API de Gemini
  const cleanHistorySlice = historySlice.map(msg => {
    return {
      role: msg.role,
      parts: msg.parts.map(p => {
        let cleanText = p.text || '';
        cleanText = cleanText.replace(/__PATCH__(\[.*?\]|\{.*?\})/gs, '').trim();
        return { text: cleanText };
      })
    };
  });

  const apiContents = [
    contextTurn,
    contextAckTurn,
    ...cleanHistorySlice
  ];

  const systemInstruction = chatwiiPersona.actitud;

  try {
    const rawResponse = await llamarGeminiStream({
      contents: apiContents,
      systemInstruction,
      temperature: 0.3,
      responseMimeType: 'text/plain',
      onChunk
    });

    if (rate) {
      rate.fail();
    }

    // Extraer parches de forma compacta y limpia de la respuesta
    let textoLimpio = rawResponse;
    const patches = [];
    const rangesToRemove = [];
    
    // Regex para buscar bloques de código Markdown que contengan JSON
    const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/gi;
    let match;
    
    while ((match = codeBlockRegex.exec(rawResponse)) !== null) {
      const content = match[1].replace(/__PATCH__/g, '').trim();
      try {
        const parsed = JSON.parse(content);
        const target = parsed.patch || parsed;
        
        // Verificar si contiene claves del CV para validarlo como parche legítimo
        const tieneClavesCv = CLAVES_VALIDAS_CV.some(k => k in target);
        
        if (tieneClavesCv) {
          if (Array.isArray(parsed)) {
            patches.push(...parsed);
          } else {
            patches.push(parsed);
          }
          // Registrar el rango completo del bloque de código markdown para removerlo
          rangesToRemove.push({ from: match.index, to: match.index + match[0].length });
        }
      } catch (e) {
        // Si no es un JSON válido, lo ignoramos para que se renderice como texto/código común
      }
    }

    // Remover los bloques de código detectados de derecha a izquierda
    rangesToRemove.sort((a, b) => b.from - a.from);
    for (const r of rangesToRemove) {
      textoLimpio = textoLimpio.substring(0, r.from) + textoLimpio.substring(r.to);
    }
    textoLimpio = textoLimpio.trim();

    _lastPatch = patches.length > 0 ? patches : null;

    // Guardar respuesta completa del modelo en el historial persistido
    _historial.push({ role: 'model', parts: [{ text: rawResponse }] });
    persistirHistorial();

    return { texto: textoLimpio, patches };
  } catch (err) {
    _historial.pop();
    persistirHistorial();
    throw err;
  }
};
