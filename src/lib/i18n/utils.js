// src/lib/i18n/utils.js
// Utilidades de traducción y enrutamiento i18n para Workwii

import { ui, defaultLang } from './ui.js';

/**
 * Retorna la función de traducción lg() correspondiente al idioma indicado.
 * @param {string} lang Idioma ('es' o 'en')
 * @param {any} [localDict] Diccionario local opcional.
 * @returns {Function} Función lg(key) que retorna la traducción.
 */
export function useTranslations(lang, localDict = null) {
  return function lg(key) {
    if (localDict && localDict[lang]?.[key]) {
      return localDict[lang][key];
    }
    return ui[lang]?.[key] || ui[defaultLang]?.[key] || key;
  };
}

/**
 * Genera la URL relativa correspondiente al idioma actual.
 * Si es el idioma por defecto (es), la URL no lleva prefijo.
 * Si es inglés (en), le añade el prefijo /en.
 * 
 * @param {string} lang Idioma actual ('es' o 'en')
 * @param {string} path Ruta base (ej: '/' o '/crear')
 * @returns {string} Ruta adaptada al idioma
 */
export function getRelativeLocaleUrl(lang, path) {
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  if (lang === 'es' || !lang) {
    return cleanPath;
  }
  if (cleanPath === '/') {
    return '/en';
  }
  // Evitar duplicar el prefijo /en si ya lo tiene
  if (cleanPath.startsWith('/en/') || cleanPath === '/en') {
    return cleanPath;
  }
  return `/en${cleanPath}`;
}
