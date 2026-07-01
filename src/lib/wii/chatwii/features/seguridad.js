/**
 * seguridad.js - Escudo de protección contra códigos prohibidos y XSS en Chatwii
 */

// 1. Validar si el texto contiene códigos de scripts o funciones reservadas de JS
export const contieneCodigoProhibido = (texto) => {
  if (!texto) return false;
  const txt = texto.toLowerCase();
  const palabrasProhibidas = [
    '<script',
    '</script',
    'fetch(',
    'eval(',
    'document.cookie',
    'localstorage.',
    'sessionstorage.',
    'window.',
    'onload=',
    'onerror=',
    'onclick='
  ];
  return palabrasProhibidas.some(palabra => txt.includes(palabra));
};

// 2. Escapar caracteres HTML especiales para evitar ejecuciones
// Permite usar operadores como '<', '>', '->' sin peligro de ejecutar HTML
export const escaparHtml = (texto) => {
  if (!texto) return '';
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// 3. Sanitizador general secundario para logs y textos editables
export const sanitizarMensaje = (texto) => {
  if (!texto) return '';
  let limpio = texto.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, '');
  limpio = limpio.replace(/<script\b[^>]*/gi, '');
  limpio = limpio.replace(/javascript\s*:\s*[^"'\s]*/gi, '');
  return limpio.trim();
};
