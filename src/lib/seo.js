// --- [Metadatos SEO] titulo = 47 caracteres, descripcion = 150 caracteres, keywords = 5 palabras -> no eliminar esta linea. 
import { app, titulo, descri, keywii } from '../wii.js';

export const seo = {
  inicio: {
    es: {
      title: titulo,
      description: descri,
      path: '/',
      keywords: keywii,
      audience: ['candidatos', 'profesionales', 'desempleados', 'reclutadores', 'estudiantes'],
      intent: 'optimizar curriculum y buscar trabajo con IA'
    },
    en: {
      title: `ATS Resume Builder & Careers | ${app}`,
      description: "Optimize your resume with AI to beat recruiters' ATS filters. Create a professional profile in minutes.",
      path: '/en',
      keywords: ['create resume free', 'ats resume templates', 'ai resume builder', 'professional profile'],
      audience: ['candidates', 'professionals', 'students'],
      intent: 'optimize resume and job search with AI'
    }
  },
  crear: {
    es: {
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
    en: {
      title: `Free AI Resume Builder & ATS Templates | ${app}`,
      description: "Create and optimize your resume for ATS filters with our AI builder. Get a professional resume in minutes.",
      path: '/en/crear',
      keywords: ['create resume free', 'ats resume templates', 'ai resume builder', 'professional profile'],
      audience: ['candidates', 'professionals', 'students'],
      intent: 'create resume profile'
    }
  },
  analisar: {
    es: {
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
    en: {
      title: `Analyze Resume: Score & ATS Filters | ${app}`,
      description: "Analyze your resume compatibility with real job offers and find out how to beat ATS filters with our AI suggestions in 2026.",
      path: '/en/analisar',
      keywords: ['analyze resume free', 'scan cv', 'ats compatibility', 'optimize resume ai', 'evaluate resume'],
      audience: ['candidates', 'professionals'],
      intent: 'analyze resume compatibility'
    }
  },
  remotos: {
    es: {
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
    en: {
      title: `Secure Remote Jobs | Real Job Boards 2026`,
      description: "Find secure remote jobs in 2026. We analyze the best platforms with pros and cons so you can apply successfully and avoid scams online.",
      path: '/en/remotos',
      keywords: ['remote jobs', 'secure remote work', 'best job boards', 'avoid scams', 'workwii'],
      audience: ['candidates', 'professionals', 'unemployed', 'students'],
      intent: 'find secure remote jobs and avoid scams'
    }
  },
  convertirAts: {
    es: {
      title: `Conversión de CV a Formato ATS con IA | ${app}`,
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
    },
    en: {
      title: `Convert Resume to ATS Format with AI | ${app}`,
      description: "Convert your resume from PDF or Word to an ATS optimized format with our AI. Pass recruitment filters in 2026.",
      path: '/en/convertir-ats',
      keywords: ['convert resume to ats', 'ats compatible resume', 'optimize cv ai', 'free ats cv format', 'pass hiring filters'],
      audience: ['candidates', 'professionals', 'unemployed', 'students'],
      intent: 'convert resume to ats format'
    }
  },
  comparar: {
    es: {
      title: `Comparativa de Creadores de CV y Filtros ATS | ${app}`,
      description: "Compara de manera transparente a Workwii frente a otras herramientas como Rezi, Resume.io, Novoresume y Jobscan. Descubre por qué somos la mejor opción.",
      path: '/comparar',
      keywords: [
        'comparativa creadores cv',
        'rezi vs workwii',
        'resume io alternativa gratis',
        'ats checker gratuito',
        'mejor creador de curriculum'
      ],
      audience: ['candidatos', 'profesionales', 'reclutadores'],
      intent: 'comparar plataformas de curriculum vitae y herramientas de empleo'
    },
    en: {
      title: `Compare CV Builders & ATS Filters | ${app}`,
      description: "Transparently compare Workwii against other tools like Rezi, Resume.io, Novoresume, and Jobscan. Discover why we are the best choice.",
      path: '/en/comparar',
      keywords: [
        'cv builders comparison',
        'rezi vs workwii',
        'free resume io alternative',
        'free ats checker',
        'best resume builder'
      ],
      audience: ['candidates', 'professionals', 'recruiters'],
      intent: 'compare curriculum vitae platforms and employment tools'
    }
  },
  blog: {
    es: {
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
    en: {
      title: `AI & Job Blog: Tips, Guides & Careers | ${app}`,
      description: "Practical guides and tips to optimize your CV with AI, bypass ATS filters, and prep for your job interviews. Power your career today.",
      path: '/en/blog',
      keywords: [
        'career blog',
        'resume tips',
        'bypass ats filters',
        'job interview prep',
        'ai for careers'
      ],
      audience: ['people looking for job guides', 'job seekers', 'readers wanting to optimize career paths'],
      intent: 'read guides and thoughts about job searching'
    }
  },
  acerca: {
    es: {
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
    en: {
      title: `About ${app}: Your AI Career Mentor.`,
      description: "Learn about the purpose of our web platform designed to democratize free recruitment tools and guide professionals in their career.",
      path: '/en/acerca',
      keywords: [
        'about workwii',
        'app creator',
        'workwii mission',
        'professional development',
        'ai employability'
      ],
      audience: ['candidates', 'recruiters'],
      intent: 'about the creator and project mission'
    }
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
    es: {
      title: `Contacto: Soporte y Dudas de Usuario | ${app}.`,
      description: "¿Tienes alguna duda, reporte de error o sugerencia para mejorar nuestras herramientas? Ponte en contacto con el equipo de soporte técnico de Workwii.a",
      path: '/contacto',
      keywords: ['contacto workwii', 'soporte tecnico cv', 'sugerencias de funciones', 'reportar error editor', 'ayuda al candidato'],
      audience: ['candidatos', 'usuarios de la plataforma'],
      intent: 'contactar soporte'
    },
    en: {
      title: `Contact: User Support & Questions | ${app}.`,
      description: "Do you have any questions, bug reports, or feature suggestions? Contact the Workwii support team.",
      path: '/en/contacto',
      keywords: ['contact workwii', 'cv support', 'feature suggestions', 'bug report', 'candidate help'],
      audience: ['candidates', 'users'],
      intent: 'contact support'
    }
  },
  cookies: {
    es: {
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
    en: {
      title: `Cookies Policy | ${app} Platform.`,
      description: "Transparency and clarity about how we use cookies and local storage to optimize your experience and preferences in our editor.",
      path: '/en/cookies',
      keywords: [
        'cookies policy',
        'supabase cookies',
        'local storage resume',
        'adsense cookies',
        'cookie privacy'
      ],
      audience: ['cookie-conscious users'],
      intent: 'view cookies policy'
    }
  },
  privacidad: {
    es: {
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
    en: {
      title: `Privacy Policy: Your Data | ${app} Web`,
      description: "Your personal data, notes, and resume drafts are securely protected. Learn about our commitment to the confidentiality of your information.",
      path: '/en/privacidad',
      keywords: [
        'privacy policy',
        'resume data security',
        'candidate privacy',
        'ai data protection',
        'secure account workwii'
      ],
      audience: ['privacy-conscious users'],
      intent: 'view privacy policy'
    }
  },
  terminos: {
    es: {
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
    en: {
      title: `Terms and Conditions of Use | ${app} Portal.`,
      description: "Rules, responsibilities, intellectual property, and conditions of use under which we offer our free career preparation tools.",
      path: '/en/terminos',
      keywords: [
        'terms of service',
        'terms and conditions',
        'platform rules',
        'resume intellectual property',
        'candidate rights'
      ],
      audience: ['platform users'],
      intent: 'view terms of service'
    }
  },
  feedback: {
    es: {
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
    en: {
      title: `Feedback: Help Us Improve This Site | ${app}`,
      description: "Your opinion and bug reports help us perfect the resume builder and interview simulator. Join the community.",
      path: '/en/feedback',
      keywords: [
        'workwii feedback',
        'review resume editor',
        'suggest features',
        'improve ai simulator',
        'candidates community'
      ],
      audience: ['candidates', 'active users'],
      intent: 'submit feedback'
    }
  },
  traducir: {
    es: {
      title: `Traducir CV con IA: Localización ATS | ${app}`,
      description: "Traduce y localiza tu currículum al inglés o español con nuestra IA. Optimiza la terminología técnica para pasar filtros ATS internacionales en 2026.",
      path: '/traducir',
      keywords: [
        'traducir cv gratis',
        'traducir curriculum ingles',
        'curriculum en ingles ia',
        'localizacion cv ats',
        'pasar filtros ats'
      ],
      audience: ['candidatos', 'profesionales', 'desempleados', 'estudiantes'],
      intent: 'traducir curriculum vitae a ingles o espanol'
    },
    en: {
      title: `AI Resume Translator: ATS Localization | ${app}`,
      description: "Translate and localize your resume into Spanish or English with our AI. Optimize technical keywords to bypass international ATS hiring filters in 2026.",
      path: '/en/traducir',
      keywords: [
        'translate resume free',
        'translate cv to spanish',
        'resume in spanish ai',
        'ats cv localization',
        'bypass hiring filters'
      ],
      audience: ['candidates', 'professionals', 'unemployed', 'students'],
      intent: 'translate resume to spanish or english'
    }
  },
  ccat: {
    es: {
      title: `Simulador de Test CCAT Gratis (50q/15m) | ${app}`,
      description: "Practica con nuestro simulador gratuito del test CCAT (Criteria Cognitive Aptitude Test). 50 preguntas, 15 minutos, sin calculadora. ¡Prepárate gratis!",
      path: '/ccat-test',
      keywords: [
        'simulador test ccat',
        'practicar ccat gratis',
        'ccat 50 preguntas 15 minutos',
        'criteria cognitive aptitude test',
        'preparar test de aptitud'
      ],
      audience: ['candidatos', 'profesionales', 'postulantes', 'estudiantes'],
      intent: 'practicar y simular el examen de aptitud cognitiva ccat'
    },
    en: {
      title: `Free CCAT Practice Test Simulator (50q/15m) | ${app}`,
      description: "Practice with our free CCAT simulator (Criteria Cognitive Aptitude Test). 50 questions, 15 minutes, no calculator. Prep for success today!",
      path: '/en/ccat-test',
      keywords: [
        'ccat practice test free',
        'ccat simulator',
        'ccat 50 questions 15 minutes',
        'criteria cognitive aptitude exam',
        'cognitive test practice'
      ],
      audience: ['candidates', 'professionals', 'job seekers', 'students'],
      intent: 'practice and simulate the ccat cognitive aptitude test'
    }
  }
};
