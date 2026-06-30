// src/lib/blog/post/idiomaPost.js
// Traducciones para la visualización de un artículo de blog

export const idiomaPost = {
  es: {
    back: 'Blog',
    tocTitle: 'En este artículo',
    prev: 'Anterior',
    next: 'Siguiente',
    share: 'Compartir',
    copyLink: 'Copiar enlace',
    copied: '¡Enlace copiado! 🔗',
    author: 'Autor',
    latest: 'Últimas historias',
    related: 'Más historias de',
    pin: 'Destacada',
    views: 'Vistas',
    likes: 'Me encanta',
    dateLocale: 'es-PE'
  },
  en: {
    back: 'Blog',
    tocTitle: 'In this article',
    prev: 'Previous',
    next: 'Next',
    share: 'Share',
    copyLink: 'Copy link',
    copied: 'Link copied! 🔗',
    author: 'Author',
    latest: 'Latest stories',
    related: 'More stories from',
    pin: 'Pinned',
    views: 'Views',
    likes: 'Likes',
    dateLocale: 'en-US'
  }
};

/**
 * Mapea las categorías de la base de datos a sus etiquetas localizadas para la interfaz.
 * @param {string} categoryKey Categoría en crudo de la base de datos (ej. 'Cv', 'Entrevistas')
 * @param {string} lang Idioma ('es' o 'en')
 * @returns {string} Categoría localizada
 */
export function getCategoryLabel(categoryKey, lang) {
  if (!categoryKey) return '';
  const mapping = {
    es: {
      'Cv': 'Currículum',
      'ATS': 'ATS',
      'Entrevistas': 'Entrevistas',
      'Teletrabajo': 'Teletrabajo',
      'Marca personal': 'Marca Personal',
      'Buscar trabajo': 'Buscar Trabajo',
      'Empleo': 'Empleo'
    },
    en: {
      'Cv': 'Resume',
      'ATS': 'ATS',
      'Entrevistas': 'Interviews',
      'Teletrabajo': 'Remote Work',
      'Marca personal': 'Personal Brand',
      'Buscar trabajo': 'Job Search',
      'Empleo': 'Jobs'
    }
  };
  return mapping[lang]?.[categoryKey] || categoryKey;
}
