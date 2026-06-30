// src/lib/todos/blog/slug/idiomaSlug.js
// Diccionario estructurado para la visualización del artículo de blog

export const idiomaSlug = {
  es: {
    nav: {
      back: 'Blog'
    },
    toc: {
      title: 'En este artículo'
    },
    actions: {
      prev: 'Anterior',
      next: 'Siguiente',
      share: 'Compartir',
      copyLink: 'Copiar enlace',
      copied: '¡Enlace copiado! 🔗'
    },
    meta: {
      author: 'Autor',
      latest: 'Últimas historias',
      related: 'Más historias de',
      pin: 'Destacada',
      views: 'Vistas',
      likes: 'Me encanta',
      dateLocale: 'es-PE'
    }
  },
  en: {
    nav: {
      back: 'Blog'
    },
    toc: {
      title: 'In this article'
    },
    actions: {
      prev: 'Previous',
      next: 'Next',
      share: 'Share',
      copyLink: 'Copy link',
      copied: 'Link copied! 🔗'
    },
    meta: {
      author: 'Author',
      latest: 'Latest stories',
      related: 'More stories from',
      pin: 'Pinned',
      views: 'Views',
      likes: 'Likes',
      dateLocale: 'en-US'
    }
  }
};

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
