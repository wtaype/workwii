/**
 * seguridad.js - Validador de entrada, prevencion de XSS y control de bloqueos temporales
 * Escrito en espanol sin tildes para evitar problemas de codificacion.
 */

import { wiRateLimit } from '../../../../widev/widev.js';

const PALABRAS_PROHIBIDAS = [
  '<script',
  'javascript:',
  'fetch(',
  'ajax(',
  'XMLHttpRequest',
  'eval(',
  'execCommand',
  'document.write',
  'onload=',
  'onerror=',
  'onclick=',
  'localStorage',
  'sessionStorage',
  'cookie'
];

const LIMIT_KEY = '_blocked_chat';
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 86400000; // 24 horas

/**
 * Verifica si el texto ingresado contiene codigo de script o metodos peligrosos.
 */
export const contieneCodigoProhibido = (texto) => {
  if (!texto) return false;
  
  const textoMinuscula = texto.toLowerCase();
  
  for (const palabra of PALABRAS_PROHIBIDAS) {
    if (textoMinuscula.includes(palabra.toLowerCase())) {
      return true;
    }
  }

  const inyeccionScript = /<iframe|<embed|<object|<applet/gi;
  if (inyeccionScript.test(textoMinuscula)) {
    return true;
  }

  return false;
};

/**
 * Escapa HTML basico para prevenir inyecciones visuales directas
 */
export const escaparHtml = (texto) => {
  if (!texto) return '';
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Retorna true si el usuario se encuentra bloqueado temporalmente por 24h
 */
export const estaBloqueadoTemporalmente = () => {
  if (typeof window === 'undefined') return false;
  const rate = wiRateLimit(LIMIT_KEY, MAX_ATTEMPTS, LOCKOUT_MS);
  return !rate.ok;
};

/**
 * Registra un intento de inyeccion fallido en el rate limiter
 */
export const registrarIntentoBloqueo = () => {
  if (typeof window === 'undefined') return;
  const rate = wiRateLimit(LIMIT_KEY, MAX_ATTEMPTS, LOCKOUT_MS);
  rate.fail();
};

/**
 * Obtiene el numero de intentos restantes de 5 antes de lockout
 */
export const obtenerIntentosRestantes = () => {
  if (typeof window === 'undefined') return MAX_ATTEMPTS;
  try {
    const raw = localStorage.getItem(`limiteHoy_${LIMIT_KEY}`);
    if (!raw) return MAX_ATTEMPTS;
    const data = JSON.parse(raw);
    const n = data.n ?? 0;
    return Math.max(0, MAX_ATTEMPTS - n);
  } catch (_) {
    return MAX_ATTEMPTS;
  }
};

/**
 * Obtiene el tiempo restante formateado del bloqueo de 24h
 */
export const obtenerTiempoRestanteBloqueo = () => {
  if (typeof window === 'undefined') return '';
  const rate = wiRateLimit(LIMIT_KEY, MAX_ATTEMPTS, LOCKOUT_MS);
  if (rate.ok) return '';
  
  const totalMinutos = rate.min ?? 0;
  const horas = Math.floor(totalMinutos / 60);
  const minutos = totalMinutos % 60;
  
  if (horas > 0) {
    return `${horas} ${horas === 1 ? 'hora' : 'horas'} y ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`;
  }
  return `${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`;
};
