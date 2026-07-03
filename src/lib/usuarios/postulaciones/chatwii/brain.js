/**
 * brain.js - Motor logico de Coach Wii para Postulaciones.
 * Solo coaching: analiza CV + oferta y guia la preparacion.
 * NO edita el CV ni genera patches.
 * Escrito sin tildes para maxima compatibilidad.
 */

import { llamarGeminiStream } from '../../../api/gemini.js';
import { wiRateLimit, Notificacion } from '../../../widev/widev.js';
import { Saludar } from '../../../widev/saludo.js';
import { getNombre } from '../../../widev/nombre.js';
import { getls } from '../../../widev/storage.js';
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

// ── Saludo inicial dinámico (local, 0ms, sin tokens de IA) ──────────────────────────

export const obtenerSaludo = () => {
  // 1. Nombre del usuario desde wiSmile
  const wiSmile = getls('wiSmile');
  const nombreCompleto = wiSmile?.nombre || '';
  const primerNombre = getNombre(nombreCompleto);

  // 2. Saludo por hora del dia
  const saludoHora = Saludar(primerNombre, _lang);

  // 3. Info de la postulacion activa
  const info = _getPostInfo ? _getPostInfo() : null;
  const empresa = info?.empresa || '';
  const cargo   = info?.cargo   || '';

  // 4. Primer skill o titulo del CV (si ya esta cargado)
  const cv = _getCvData ? _getCvData() : null;
  const primerSkill = cv?.skills
    ? cv.skills.split(',')[0].trim()
    : cv?.experiencias?.[0]?.puesto || '';

  // ── Armar el mensaje segun contexto disponible ──
  const isEn = _lang === 'en';

  if (isEn) {
    let msg = `${saludoHora} 👋`;
    if (empresa && cargo) {
      msg += ` I'm ready to help you with your application to **${empresa}** as **${cargo}**`;
      if (primerSkill) msg += `. I can see you have experience in **${primerSkill}** — that's a great asset for this role`;
      msg += `. Are you ready to start your preparation? 🚀`;
    } else if (cargo) {
      msg += ` Let's prepare you for the **${cargo}** role. What would you like to work on?`;
    } else {
      msg += ` I'm Coach Wii, your interview mentor. Tell me about the position you're applying for!`;
    }
    return msg;
  }

  // Espanol
  let msg = `${saludoHora} 👋`;
  if (empresa && cargo) {
    msg += ` Estoy listo para ayudarte con tu postulacion a **${empresa}** como **${cargo}**`;
    if (primerSkill) msg += `. Veo que tienes experiencia en **${primerSkill}** — eso es clave para este puesto`;
    msg += `. ¿Ya estamos listos para prepararnos? 🚀`;
  } else if (cargo) {
    msg += ` Vamos a prepararte para el puesto de **${cargo}**. ¿Por dónde empezamos?`;
  } else {
    msg += ` Soy Coach Wii, tu mentor de entrevistas. ¡Cuéntame sobre el puesto al que estás aplicando!`;
  }
  return msg;
};
