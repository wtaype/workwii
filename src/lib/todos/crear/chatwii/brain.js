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

const isCvVacio = (cv) => {
  if (!cv) return true;
  const tieneNombre = !!(cv.nombre && cv.nombre.trim());
  const tieneTitulo = !!(cv.titulo && cv.titulo.trim());
  const tieneResumen = !!(cv.resumen && cv.resumen.trim());
  const tieneExp = cv.experiencias && cv.experiencias.some(exp => exp && (exp.puesto || exp.empresa || exp.logros));
  const tieneEdu = cv.educacion && cv.educacion.some(edu => edu && (edu.institucion || edu.grado));
  return !tieneNombre && !tieneTitulo && !tieneResumen && !tieneExp && !tieneEdu;
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

/**
 * Envia el mensaje del usuario a Gemini y procesa la respuesta por chunks
 */
export const enviarMensaje = async (textoUsuario, onChunk) => {
  const isLogged = typeof localStorage !== 'undefined' ? localStorage.getItem('wiSmile') : null;
  const maxUses = isLogged ? 88 : 7;
  const limitKey = isLogged ? 'logged_chatwii_uses' : 'guest_chatwii_uses';

  const rate = wiRateLimit(limitKey, maxUses, 315360000000);
  if (!rate.ok) {
    const msgError = _lang === 'en'
      ? `You have reached the ${maxUses}-message limit. Please try again later.`
      : `Has alcanzado el limite de ${maxUses} respuestas. ¡Por favor intenta mas tarde!`;
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
    let idx = 0;

    while ((idx = rawResponse.indexOf('__PATCH__', idx)) !== -1) {
      const start = idx + 9;
      let depth = 0, end = start;
      
      for (let i = start; i < rawResponse.length; i++) {
        const char = rawResponse[i];
        if (char === '{' || char === '[') depth++;
        else if (char === '}' || char === ']') {
          if (--depth === 0) {
            end = i;
            break;
          }
        }
      }

      if (end > start) {
        const jsonStr = rawResponse.substring(start, end + 1);
        try {
          const parsed = JSON.parse(jsonStr);
          if (Array.isArray(parsed)) {
            patches.push(...parsed);
          } else {
            patches.push(parsed);
          }
        } catch (e) {
          console.error('Error parseando __PATCH__ de Chatwii:', e);
        }
        textoLimpio = textoLimpio.replace('__PATCH__' + jsonStr, '');
        idx = end + 1;
      } else {
        idx = start + 1;
      }
    }

    _lastPatch = patches.length > 0 ? patches : null;
    textoLimpio = textoLimpio.trim();

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
