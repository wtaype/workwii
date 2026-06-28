// src/lib/widev/saludo.js
// Saludar v11.0: Saludos inteligentes localizados con soporte i18n via langwii

import { langwii } from './langwii.js';

export const Saludar = (nombre = '', lang = '') => {
  const hrs = new Date().getHours();
  const isEn = langwii.esEn(lang);
  
  const saludo = hrs >= 5 && hrs < 12 
    ? (isEn ? 'Good morning' : 'Buenos días')
    : hrs >= 12 && hrs < 18 
      ? (isEn ? 'Good afternoon' : 'Buenas tardes')
      : (isEn ? 'Good evening' : 'Buenas noches');
  
  return nombre ? `${saludo}, ${nombre}` : `${saludo}, `;
};