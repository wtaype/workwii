// src/lib/usuarios/listo/chatwii/brain.js
// Motor lógico de ChatWii para Listo.
// Gestiona el historial de chat, contexto del puesto/CV y llamadas en streaming a Gemini.

import { llamarGeminiStream } from '../../../api/gemini.js';
import { wiRateLimit, Notificacion } from '../../../widev/widev.js';
import { Saludar } from '../../../widev/saludo.js';
import { getNombre } from '../../../widev/nombre.js';
import { getls } from '../../../widev/storage.js';
import { coachPersona } from './personalidad.js';
import { promptPuesto } from './skills/puesto.js';

let _lang = 'es';
let _getCvData  = null;  // () => objeto JSON del CV
let _getOferta  = null;  // () => string de la vacante
let _getPostInfo = null; // () => { nombre, empresa, cargo }
let _historial  = [];

const obtenerCacheKey = () => {
  const info = _getPostInfo ? _getPostInfo() : null;
  const nombrePost = info?.nombre ? info.nombre.trim().replace(/\s+/g, '_') : 'defecto';
  return `chatwii_listo_${nombrePost}`;
};

export const POST_LIMIT_KEY = 'chatwii_listo_uses';
export const POST_MAX_USES  = 80;

export const initCoach = (lang, getCvData, getOferta, getPostInfo) => {
  _lang        = lang;
  _getCvData   = getCvData;
  _getOferta   = getOferta;
  _getPostInfo = getPostInfo;

  try {
    const key = obtenerCacheKey();
    const saved = localStorage.getItem(key);
    _historial = saved ? JSON.parse(saved) : [];
  } catch (_) {
    _historial = [];
  }
};

export const obtenerHistorial  = () => _historial;

export const limpiarHistorial  = () => {
  _historial = [];
  try {
    const key = obtenerCacheKey();
    localStorage.removeItem(key);
  } catch (_) {}
};

export const cargarHistorial   = (hist) => {
  _historial = Array.isArray(hist) ? hist : [];
  persistir();
};

const persistir = () => {
  try {
    const key = obtenerCacheKey();
    localStorage.setItem(key, JSON.stringify(_historial));
  } catch (_) {}
};

export const enviarMensaje = async (textoUsuario, onChunk, quotedMsg = null) => {
  const rate = wiRateLimit(POST_LIMIT_KEY, POST_MAX_USES, 'dia');
  if (!rate.ok) {
    const msgError = _lang === 'en'
      ? `You have reached the ${POST_MAX_USES}-message limit. Please try again later.`
      : `Has alcanzado el límite de ${POST_MAX_USES} respuestas del día. ¡Vuelve mañana!`;
    Notificacion(msgError, 'warning', 6000);
    throw new Error('Rate limit reached');
  }

  // Si hay mensaje citado, agregarlo visualmente al historial del usuario
  let textoParaGuardar = textoUsuario;
  if (quotedMsg) {
    textoParaGuardar = `[Citado: "${quotedMsg.text}"]\n\n${textoUsuario}`;
  }

  _historial.push({ role: 'user', parts: [{ text: textoParaGuardar }] });
  persistir();

  const cv = _getCvData ? _getCvData() : null;
  const vacante = _getOferta ? _getOferta() : '';
  const promptContexto = promptPuesto(cv, _lang, vacante, quotedMsg);

  const contextTurn = {
    role: 'user',
    parts: [{ text: `CONTEXTO DE LA SESIÓN DE COACHING:\n${promptContexto}` }]
  };

  const contextAckTurn = {
    role: 'model',
    parts: [{ text: 'Entendido. Analicé el CV del candidato y la oferta laboral. Estoy listo para diagnosticar vacíos y formular propuestas de optimización estructuradas.' }]
  };

  const maxHistory = 10;
  let histSlice = _historial.length > maxHistory
    ? _historial.slice(_historial.length - maxHistory)
    : _historial;

  const contents = [contextTurn, contextAckTurn, ...histSlice];
  let respuestaCompleta = '';

  try {
    await llamarGeminiStream({
      contents,
      systemInstruction: coachPersona.actitud,
      onChunk: (chunk) => {
        respuestaCompleta += chunk;
        onChunk(chunk);
      }
    });

    _historial.push({ role: 'model', parts: [{ text: respuestaCompleta }] });
    persistir();

    return respuestaCompleta;
  } catch (err) {
    _historial.pop();
    persistir();
    throw err;
  }
};

export const obtenerSaludo = () => {
  const wiSmile = getls('wiSmile');
  const nombreCompleto = wiSmile?.nombre || '';
  const primerNombre = getNombre(nombreCompleto);
  const saludoHora = Saludar(primerNombre, _lang);

  const info = _getPostInfo ? _getPostInfo() : null;
  const empresa = info?.empresa || '';
  const cargo   = info?.cargo   || '';

  const cv = _getCvData ? _getCvData() : null;
  const primerSkill = cv?.skills
    ? cv.skills.split(',')[0].trim()
    : cv?.experiencias?.[0]?.puesto || '';

  const isEn = _lang === 'en';

  if (isEn) {
    let msg = `${saludoHora} 👋`;
    if (empresa && cargo) {
      msg += ` I'm ready to help you with your application to **${empresa}** as **${cargo}**`;
      if (primerSkill) msg += `. I can see you have experience in **${primerSkill}** — that's a great asset for this role`;
      msg += `. Shall we start the optimization? 🚀`;
    } else if (cargo) {
      msg += ` Let's prepare you for the **${cargo}** role. What would you like to work on?`;
    } else {
      msg += ` I'm ChatWii. Tell me about the position you're applying for!`;
    }
    return msg;
  }

  let msg = `${saludoHora} 👋`;
  if (empresa && cargo) {
    msg += ` Estoy listo para ayudarte con tu postulación a **${empresa}** como **${cargo}**`;
    if (primerSkill) msg += `. Veo que tienes experiencia en **${primerSkill}** — eso es clave para este puesto`;
    msg += `. ¿Iniciamos la optimización? 🚀`;
  } else if (cargo) {
    msg += ` Vamos a prepararte para el puesto de **${cargo}**. ¿Por dónde empezamos?`;
  } else {
    msg += ` Soy ChatWii, tu asistente de optimización. ¡Cuéntame sobre el puesto al que estás aplicando!`;
  }
  return msg;
};
