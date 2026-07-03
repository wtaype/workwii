/**
 * brain.js - Motor logico de Coach Wii para Postulaciones.
 * Solo coaching: analiza CV + oferta y guia la preparacion.
 * NO edita el CV ni genera patches.
 * Escrito sin tildes para maxima compatibilidad.
 */

import { llamarGeminiStream } from '../../../api/gemini.js';
import { wiRateLimit, Notificacion } from '../../../widev/widev.js';
import { coachPersona } from './personalidad.js';
import { promptPuesto } from './skills/puesto.js';

let _lang = 'es';
let _getCvData  = null;  // () => objeto JSON del CV (puede ser null)
let _getOferta  = null;  // () => string de la oferta/notas del panel derecho
let _getPostInfo = null; // () => { nombre, empresa, cargo } de la postulacion activa
let _historial  = [];

// Key dinamico basado en el nombre de la postulacion activa
const obtenerCacheKey = () => {
  const info = _getPostInfo ? _getPostInfo() : null;
  const nombrePost = info?.nombre ? info.nombre.trim().replace(/\s+/g, '_') : 'defecto';
  return `chatwii_post_${nombrePost}`;
};

export const POST_LIMIT_KEY = 'chatwii_post_uses';
export const POST_MAX_USES  = 80;

// ── Init ────────────────────────────────────────────────────────────────────

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

// ── Historial ────────────────────────────────────────────────────────────────

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

// ── Enviar Mensaje ──────────────────────────────────────────────────────────

export const enviarMensaje = async (textoUsuario, onChunk) => {
  const rate = wiRateLimit(POST_LIMIT_KEY, POST_MAX_USES, 'dia');
  if (!rate.ok) {
    const msgError = _lang === 'en'
      ? `You have reached the ${POST_MAX_USES}-message limit. Please try again later.`
      : `Has alcanzado el limite de ${POST_MAX_USES} respuestas del dia. ¡Vuelve manana!`;
    Notificacion(msgError, 'warning', 6000);
    throw new Error('Rate limit reached');
  }

  // Agregar mensaje del usuario al historial local
  _historial.push({ role: 'user', parts: [{ text: textoUsuario }] });
  persistir();

  // Construir contexto usando la vacante y el CV
  const cv = _getCvData ? _getCvData() : null;
  const vacante = _getOferta ? _getOferta() : '';
  const promptContexto = promptPuesto(cv, _lang, vacante);

  const contextTurn = {
    role: 'user',
    parts: [{ text: `CONTEXTO DE LA SESION DE COACHING:\n${promptContexto}` }]
  };

  const contextAckTurn = {
    role: 'model',
    parts: [{ text: 'Entendido perfectamente. He leido tu perfil y los detalles de la vacante. Estoy listo para ayudarte a preparar tu entrevista o responder preguntas sobre la postulacion.' }]
  };

  // Ventana deslizable de historial (max 10 turnos)
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

// ── Saludo inicial ──────────────────────────────────────────────────────────

export const obtenerSaludo = () => {
  const saludos = coachPersona.saludos[_lang] || coachPersona.saludos.es;
  return saludos[Math.floor(Math.random() * saludos.length)];
};
