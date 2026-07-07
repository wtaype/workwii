// src/lib/usuarios/listo/chatwii/features/seguridad.js
// Validador de entrada, prevención de XSS y control de bloqueos temporales para Listo

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

const LIMIT_KEY = '_blocked_chat_listo';
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 86400000;

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

export const escaparHtml = (texto) => {
  if (!texto) return '';
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

export const estaBloqueadoTemporalmente = () => {
  if (typeof window === 'undefined') return false;
  const rate = wiRateLimit(LIMIT_KEY, MAX_ATTEMPTS, LOCKOUT_MS);
  return !rate.ok;
};

export const registrarIntentoBloqueo = () => {
  if (typeof window === 'undefined') return;
  const rate = wiRateLimit(LIMIT_KEY, MAX_ATTEMPTS, LOCKOUT_MS);
  rate.fail();
};
