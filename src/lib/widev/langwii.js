// src/lib/widev/langwii.js
// langwii v1.2: Gestor centralizado de idiomas, traducciones inline, interpolación dinámica y traducción automática de DOM

export const langwii = {
  /**
   * Opción 1: Obtener idioma activo ('es' o 'en')
   * Prioriza: 1. Parámetro explícito, 2. Atributo HTML lang, 3. Preferencia del navegador
   */
  get(l = '') {
    // Si l es el objeto Astro global, extraemos su locale
    if (l && typeof l === 'object' && 'currentLocale' in l) {
      l = l.currentLocale;
    }
    if (l && typeof l === 'string') return l.startsWith('en') ? 'en' : 'es';
    if (typeof document !== 'undefined') {
      const htmlLang = document.documentElement.lang;
      if (htmlLang) return htmlLang.startsWith('en') ? 'en' : 'es';
    }
    if (typeof navigator !== 'undefined') {
      return navigator.language?.startsWith('en') ? 'en' : 'es';
    }
    return 'es';
  },

  /**
   * Opción 2: Consultar si el idioma activo es inglés (booleano rápido)
   */
  esEn(l = '') {
    return this.get(l) === 'en';
  },

  /**
   * Opción 3: Traducir diccionario con soporte de interpolación de variables
   */
  nw(dict, params = {}, l = '') {
    if (!dict) return '';
    const activeLang = this.get(l);
    let str = dict[activeLang] || dict['es'] || '';
    
    // Interpolación de variables {key}
    Object.entries(params).forEach(([k, v]) => {
      str = str.replace(new RegExp(`{${k}}`, 'g'), String(v));
    });
    return str;
  },

  /**
   * Opción 4: Cambiar idioma activo en el DOM (documentElement.lang)
   */
  set(l) {
    if (typeof document === 'undefined') return;
    const cleanLang = l.startsWith('en') ? 'en' : 'es';
    document.documentElement.lang = cleanLang;
    return cleanLang;
  },

  /**
   * Opción 5: Formatear plantilla rápida bilingüe directa en una línea (alias: line / n)
   */
  n(esStr, enStr, params = {}, l = '') {
    // Si params es el objeto Astro global o un string de locale, lo desplazamos a l
    if (typeof params === 'string' || (params && typeof params === 'object' && 'currentLocale' in params)) {
      l = params;
      params = {};
    }
    return this.nw({ es: esStr, en: enStr }, params, l);
  },

  line(esStr, enStr, params = {}, l = '') {
    return this.n(esStr, enStr, params, l);
  },

  /**
   * Opción 6: Traductor automático del DOM por atributos data-es y data-en (Emergencias cliente)
   */
  dom(sel = '[data-es]') {
    if (typeof document === 'undefined') return;
    const isEnglish = this.esEn();
    document.querySelectorAll(sel).forEach(el => {
      const txt = isEnglish ? el.getAttribute('data-en') : el.getAttribute('data-es');
      if (txt !== null) el.textContent = txt;
    });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   📖 GUÍA DE USO DE LANGWII (6 OPCIONES DE INTEGRACIÓN)
   
   Opción 1: Obtener el idioma de forma limpia y segura
   const lang = langwii.get(); // Retorna 'es' o 'en' (resuelve SSR y DOM automáticamente)
   
   Opción 2: Validación booleana rápida para inglés
   if (langwii.esEn()) {
     // Lógica exclusiva para inglés
   }
   
   Opción 3: Diccionario bilingüe con interpolación de variables dinámicas (nw)
   const text = langwii.nw(
     { es: 'Hola {user}, tienes {n} mensajes', en: 'Hello {user}, you have {n} messages' },
     { user: 'Wilder', n: 3 }
   );
   
   Opción 4: Forzar/Cambiar el idioma en el navegador
   langwii.set('en'); // Actualiza <html lang="en"> en tiempo real
   
   Opción 5: Traducción directa de una sola letra (n) para líneas inline
   const msg = langwii.n('¡Proceso finalizado!', 'Process complete!');
   
   Opción 6: Traducción automática del DOM (para emergencias en el cliente)
   langwii.dom('.traducir'); // Escanea y traduce elementos con data-es/data-en
   ───────────────────────────────────────────────────────────────────────────── */
