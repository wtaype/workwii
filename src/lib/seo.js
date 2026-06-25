// --- [Metadatos SEO] titulo = 47 caracteres, descripcion = 150 caracteres, keywords = 5 palabras -> no eliminar esta linea. 
import { app, titulo, descri, keywii } from '../wii.js';

export const seo = {
  inicio: {
    title: titulo,
    description: descri,
    path: '/',
    keywords: keywii,
    audience: ['candidatos', 'profesionales', 'desempleados', 'reclutadores', 'estudiantes'],
    intent: 'optimizar curriculum y buscar trabajo con IA'
  },
  crear: {
    title: `Creador de CV con IA y Plantillas ATS | ${app}`,
    description: "Diseña y escribe tu currículum optimizado para filtros ATS con nuestra inteligencia artificial. Crea un perfil profesional impecable en pocos minutos.",
    path: '/crear',
    keywords: [
      'crear cv gratis',
      'plantillas cv ats',
      'curriculum con ia',
      'creador curriculum',
      'perfil profesional'
    ],
    audience: ['candidatos', 'profesionales', 'estudiantes'],
    intent: 'crear curriculum vitae'
  },
  analisar: {
    title: `Analizar CV: Puntuación y Filtros ATS | ${app}`,
    description: "Analiza la compatibilidad de tu currículum con ofertas de empleo reales y descubre cómo superar los filtros ATS con sugerencias de nuestra IA en 2026.",
    path: '/analisar',
    keywords: [
      'analizar cv gratis',
      'escanear curriculum',
      'compatibilidad ats',
      'optimizar cv ia',
      'evaluar curriculum'
    ],
    audience: ['candidatos', 'profesionales'],
    intent: 'analizar compatibilidad cv'
  },
  blog: {
    title: `Blog de Empleo e IA: Consejos y Guías | ${app}`,
    description: "Guías y consejos prácticos para optimizar tu CV con IA, superar filtros ATS y preparar tus entrevistas de trabajo. Potencia tu perfil profesional hoy.",
    path: '/blog',
    keywords: [
      'blog de empleo',
      'consejos curriculum',
      'superar filtros ats',
      'preparar entrevistas',
      'ia para empleo'
    ],
    audience: ['personas buscando guías de empleo', 'candidatos en búsqueda de trabajo', 'lectores que quieren optimizar su trayectoria'],
    intent: 'leer guías y reflexiones sobre búsqueda de empleo'
  },
  acerca: {
    title: `Acerca de ${app}: Tu Mentor de Carrera con IA.`,
    description: "Conoce el propósito de nuestra plataforma web diseñada para democratizar herramientas de reclutamiento gratuitas y guiar a profesionales en su empleo.",
    path: '/acerca',
    keywords: [
      'sobre workwii',
      'creador de la app',
      'mision de workwii',
      'desarrollo profesional',
      'empleabilidad ia'
    ],
    audience: ['candidatos', 'reclutadores'],
    intent: 'acerca del creador y la mision del proyecto'
  },
  descubre: {
    title: `Descubre todas nuestras herramientas | ${app}.`,
    description: "Explora el ecosistema de herramientas de preparación laboral: editor, simulador de entrevistas y analizador de CV. Todo lo que necesitas para destacar",
    path: '/descubre',
    keywords: [
      'herramientas de empleo',
      'simulador entrevista ia',
      'analizador curriculum',
      'escribir cv online',
      'recursos profesionales'
    ],
    audience: ['candidatos', 'estudiantes'],
    intent: 'descubrir herramientas de la plataforma'
  },
  contacto: {
    title: `Contacto: Soporte y Dudas de Usuario | ${app}.`,
    description: "¿Tienes alguna duda, reporte de error o sugerencia para mejorar nuestras herramientas? Ponte en contacto con el equipo de soporte técnico de Workwii.a",
    path: '/contacto',
    keywords: [
      'contacto workwii',
      'soporte tecnico cv',
      'sugerencias de funciones',
      'reportar error editor',
      'ayuda al candidato'
    ],
    audience: ['candidatos', 'usuarios de la plataforma'],
    intent: 'contactar soporte'
  },
  cookies: {
    title: `Política de Cookies de la Plataforma | ${app}.`,
    description: "Transparencia y claridad sobre cómo usamos las cookies y el almacenamiento local para optimizar tu experiencia y tus preferencias en nuestro editor...",
    path: '/cookies',
    keywords: [
      'politica de cookies',
      'cookies de supabase',
      'almacenamiento local cv',
      'cookies de adsense',
      'privacidad de cookies'
    ],
    audience: ['usuarios preocupados por cookies'],
    intent: 'ver politica de cookies'
  },
  privacidad: {
    title: `Política de Privacidad: Tus Datos | ${app} Web`,
    description: "Tus datos personales, notas y borradores de CV están protegidos de forma segura. Conoce nuestro compromiso con la confidencialidad de tu información..",
    path: '/privacidad',
    keywords: [
      'politica de privacidad',
      'seguridad de datos cv',
      'privacidad de candidatos',
      'proteccion de datos ia',
      'cuenta segura workwii'
    ],
    audience: ['usuarios preocupados por privacidad'],
    intent: 'ver politica de privacidad'
  },
  terminos: {
    title: `Términos y Condiciones de Uso | ${app} Portal.`,
    description: "Reglas, responsabilidades, propiedad intelectual y condiciones de uso bajo las cuales ofrecemos nuestras herramientas gratuitas de preparación laboral",
    path: '/terminos',
    keywords: [
      'terminos de servicio',
      'condiciones de uso',
      'reglas de la plataforma',
      'propiedad intelectual cv',
      'derechos del candidato'
    ],
    audience: ['usuarios de la plataforma'],
    intent: 'ver terminos de servicio'
  },
  feedback: {
    title: `Feedback: Ayúdanos a Mejorar esta Web | ${app}`,
    description: "Tu opinión y reportes de errores nos ayudan a perfeccionar el editor de CV y simulador de entrevistas. Participa activamente en la mejora de la web...",
    path: '/feedback',
    keywords: [
      'feedback workwii',
      'opinar sobre editor',
      'sugerir nuevas funciones',
      'mejorar simulador ia',
      'comunidad de candidatos'
    ],
    audience: ['candidatos', 'usuarios activos'],
    intent: 'dejar feedback'
  },
  remotos: {
    title: "Trabajos Remotos Seguros | Portales Reales 2026",
    description: "Encuentra trabajo remoto seguro en 2026. Analizamos las mejores plataformas con pros y contras para que postules con éxito y evites estafas en la red.",
    path: '/remotos',
    keywords: [
      'trabajo remoto',
      'empleo remoto seguro',
      'mejores plataformas',
      'evitar estafas',
      'workwii'
    ],
    audience: ['candidatos', 'profesionales', 'desempleados', 'estudiantes'],
    intent: 'encontrar trabajo remoto seguro y evitar estafas'
  },
  convertirAts: {
    title: `Convertir CV a Formato ATS con IA | ${app}`,
    description: "Convierte tu currículum de PDF o Word a un formato optimizado para ATS con nuestra Inteligencia Artificial. Pasa los filtros de contratación en 2026.",
    path: '/convertir-ats',
    keywords: [
      'convertir cv a ats',
      'cv compatible con ats',
      'optimizar curriculum ia',
      'formato cv ats gratis',
      'pasar filtros de contratacion'
    ],
    audience: ['candidatos', 'profesionales', 'desempleados', 'estudiantes'],
    intent: 'convertir curriculum vitae a formato ats'
  }
};
