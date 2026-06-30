// src/lib/remotos/idiomaRemotos.js
// Diccionario de traducción bilingüe para el listado curado de plataformas de empleo remoto

export const idiomaRemotos = {
  es: {
    header: {
      tit: 'Trabajos Remotos Seguros',
      desc: 'Encontrar empleo remoto no debería ser una ruleta rusa de estafas virtuales. Analizamos de forma honesta las mejores plataformas reales en 2026 para que postules de manera inteligente y segura.'
    },
    sidebar: {
      toggle: 'Colapsar Índice',
      index: 'Los Más Recomendados',
      searchPlaceholder: 'Buscar plataforma por nombre, categoría o descripción...',
      searchCount: 'plataformas',
      empty: 'No se encontraron plataformas coincidentes.',
      advice: 'Consejos de Oro',
      adviceTag: 'Seguro'
    },
    card: {
      trustScore: 'Puntuación de Confianza',
      metricsTitle: 'Métricas de Evaluación',
      metrics: {
        seguridad: 'Seguridad',
        vacantes: 'Vacantes',
        soporte: 'Soporte',
        gratuito: 'Gratis'
      },
      paises: 'Países Disponibles',
      ingles: 'Nivel de Inglés',
      requisitos: 'Requisitos de Postulación',
      pros: 'Pros',
      contras: 'Contras',
      tip: 'Opinión del Experto',
      estafas: 'Evitar Estafas',
      visit: 'Sitio Web',
      howToApply: 'Cómo Postular'
    },
    advice: {
      tit: '3 Consejos de Oro para Evitar Estafas Remotas',
      sub: 'El mercado del trabajo remoto es muy competitivo, lo que atrae a delincuentes que suplantan empresas legítimas. Sigue estas reglas de oro:',
      goldTip: 'Consejo de Oro:',
      item1: {
        tit: 'Jamás pagues por trabajar o por recibir equipo',
        desc: 'Ninguna empresa real te pedirá dinero para "capacitación", "comprar software" o enviar un cheque digital para que compres una laptop. Si te piden un depósito o transferencia, es 100% una estafa.',
        tip: 'Las corporaciones serias te envían el equipo físico directamente a tu casa sin coste alguno, o te proveen accesos a su entorno virtual de forma remota.'
      },
      item2: {
        tit: 'Desconfía de procesos de selección "demasiado rápidos"',
        desc: 'Si postulas y a las pocas horas te hacen una oferta formal únicamente respondiendo preguntas por un chat de Telegram o WhatsApp, sin haber hecho una videollamada real cara a cara, es sumamente sospechoso.',
        tip: 'Investiga siempre al reclutador en LinkedIn. Verifica si tiene contactos mutuos y si trabaja oficialmente para la empresa de la vacante.'
      },
      item3: {
        tit: 'FlexJobs (La mejor opción de pago)',
        desc: 'Aunque requiere una suscripción mensual, vale totalmente la pena si quieres evitar al 100% ofertas basura o dudosas. Cada oferta es revisada manualmente por un equipo de personas reales para garantizar tu seguridad.',
        tip: 'Contrata su suscripción de prueba de una semana (es muy económica), descarga las vacantes directas de las páginas corporativas y ponte en contacto con los reclutadores directamente en LinkedIn.'
      },
      closing: '"La clave del éxito en el trabajo remoto no es postular de forma masiva, sino la especificidad. Elige tus batallas, optimiza tu CV con IA para pasar los filtros ATS de estas plataformas, y sé de los primeros en enviar tu solicitud. ¡Tú puedes, mucho éxito en tu camino!"'
    },
    plataformas: [
      {
        id: 'weworkremotely',
        nombre: 'We Work Remotely',
        url: 'https://weworkremotely.com',
        logo: 'https://www.google.com/s2/favicons?sz=128&domain=weworkremotely.com',
        categoria: 'tech',
        categoriaLabel: 'Tech & Startups',
        ingles: 'Intermedio - Avanzado',
        paises: 'Mundial (Worldwide - Contrata en cualquier país)',
        descripcion: 'La bolsa de trabajo remoto más grande del mundo. Altamente confiable y muy orientada al ecosistema tecnológico global.',
        pros: [
          'Acceso 100% gratuito para candidatos.',
          'Las empresas pagan $299 por oferta publicada, lo que ahuyenta a los estafadores.',
          'Gran volumen de vacantes en desarrollo de software y marketing.'
        ],
        contras: [
          'Altísima competencia (cientos de aplicaciones por puesto).',
          'El inglés conversacional fluido es obligatorio para la mayoría de roles.'
        ],
        requisitos: 'Tener portafolio online (GitHub, Behance, etc.) y enviar CV detallado en inglés.',
        tipExperto: 'Postula en las primeras 24 horas de la publicación. Las ofertas de calidad se llenan rápido de aplicantes calificados.',
        evitarEstafas: 'Ten cuidado si te redirigen a formularios de terceros no oficiales de la empresa que te piden número de seguridad social o datos bancarios en el primer paso.',
        metrics: { seguridad: 98, vacantes: 96, soporte: 90, gratuito: 100 }
      },
      {
        id: 'prosmarketplace',
        nombre: 'Pros Marketplace',
        url: 'https://prosmarketplace.com',
        logo: 'https://www.google.com/s2/favicons?sz=128&domain=prosmarketplace.com',
        categoria: 'latam',
        categoriaLabel: 'LATAM Friendly',
        ingles: 'Intermedio - Avanzado',
        paises: 'América Latina (Exclusivo para talento de LATAM)',
        descripcion: 'Mercado especializado en talento de Latinoamérica que conecta profesionales de forma directa con empresas de EE.UU.',
        pros: [
          'Vacantes adaptadas a la zona horaria de LATAM.',
          'Pagos estables y directos en dólares.',
          'Te guían y preparan para la entrevista final con el cliente.'
        ],
        contras: [
          'Proceso de registro inicial estricto con videollamada obligatoria en inglés.',
          'Vacantes concentradas en roles técnicos y de asistencia avanzada.'
        ],
        requisitos: 'Aprobar la entrevista inicial de inglés conversacional y verificación de identidad.',
        tipExperto: 'Prepárate bien para el video de introducción. Un inglés fluido y una buena iluminación en tu video te aseguran entrevistas de inmediato.',
        evitarEstafas: 'Pros Marketplace gestiona todo dentro de su plataforma segura; reporta si una empresa cliente te pide tus datos personales de contacto por fuera.',
        metrics: { seguridad: 98, vacantes: 95, soporte: 92, gratuito: 100 }
      },
      {
        id: 'flexjobs',
        nombre: 'FlexJobs',
        url: 'https://www.flexjobs.com',
        logo: 'https://www.google.com/s2/favicons?sz=128&domain=flexjobs.com',
        categoria: 'premium',
        categoriaLabel: 'Hand-Screened Premium',
        ingles: 'Básico - Avanzado',
        paises: 'Mundial (Foco principal en empresas de EE.UU.)',
        descripcion: 'Plataforma líder que verifica manualmente cada vacante para garantizar que sea 100% real, segura y libre de estafas.',
        pros: [
          'Listados 100% libres de estafas y publicidad molesta.',
          'Soporte directo y revisión personalizada de perfiles.',
          'Acceso a coaching laboral y tests de habilidades.'
        ],
        contras: [
          'Requiere suscripción de pago para acceder a las ofertas.',
          'Pocas ofertas exclusivas que no se encuentren en la web corporativa.'
        ],
        requisitos: 'Crear una cuenta, pagar la membresía y subir tu currículum optimizado.',
        tipExperto: 'Es ideal si valoras tu tiempo y quieres evitar al 100% ofertas dudosas. Se enfoca fuertemente en corporaciones y multinacionales estadounidenses.',
        evitarEstafas: 'Aunque FlexJobs filtra todo de forma manual, nunca aceptes propuestas de reclutadores que te contacten por fuera pidiéndote depósitos para herramientas.',
        metrics: { seguridad: 100, vacantes: 100, soporte: 95, gratuito: 20 }
      },
      {
        id: 'remote-co',
        nombre: 'Remote.co',
        url: 'https://remote.co',
        logo: 'https://www.google.com/s2/favicons?sz=128&domain=remote.co',
        categoria: 'general',
        categoriaLabel: 'General Remoto',
        ingles: 'Intermedio - Avanzado',
        paises: 'Mundial (Filtra ofertas buscando "Worldwide")',
        descripcion: 'Portal curado de ofertas remotas en diseño, servicio al cliente, redacción, desarrollo y asistencia virtual.',
        pros: [
          'Excelente segmentación por roles.',
          'Solo listan empresas con una cultura de trabajo remoto consolidada.',
          'Es completamente gratuita para postular.'
        ],
        contras: [
          'Muchas vacantes se limitan únicamente a residentes fiscales en EE.UU.',
          'El diseño de la web es sencillo pero a veces tiene ofertas repetidas.'
        ],
        requisitos: 'Subir currículum adaptado al mercado ATS internacional.',
        tipExperto: 'Filtra siempre buscando el término "Worldwide" en la descripción de la oferta para asegurarte de que contratan talento en Latinoamérica.',
        evitarEstafas: 'Desconfía si te ofrecen una entrevista por chat escrito (Telegram/WhatsApp). Las empresas en Remote.co siempre hacen videollamadas formales.',
        metrics: { seguridad: 95, vacantes: 94, soporte: 85, gratuito: 100 }
      },
      {
        id: 'dynamitejobs',
        nombre: 'Dynamite Jobs',
        url: 'https://dynamitejobs.com',
        logo: 'https://www.google.com/s2/favicons?sz=128&domain=dynamitejobs.com',
        categoria: 'general',
        categoriaLabel: 'General Remoto',
        ingles: 'Intermedio - Avanzado',
        paises: 'Mundial (Foco en vacantes de EE.UU. y Europa)',
        descripcion: 'Plataforma con un equipo humano detrás que verifica manualmente que cada oferta tenga una compensación económica clara.',
        pros: [
          'Verificación humana estricta de salarios y condiciones.',
          'Excelente panel interactivo para el candidato.',
          'Muchas ofertas en marketing y ventas.'
        ],
        contras: [
          'La mayoría de puestos exigen disponibilidad en horarios de EE.UU.',
          'El proceso de selección inicial de la plataforma puede ser algo lento.'
        ],
        requisitos: 'Completar tu perfil en la plataforma y subir un video corto de presentación (opcional pero sugerido).',
        tipExperto: 'Rellena tu perfil de candidato al 100%. Los reclutadores suelen buscar en su base de datos interna antes de publicar la oferta al público.',
        evitarEstafas: 'Nunca aceptes recibir pagos a través de cheques digitales para comprar equipo. Es la estafa más común de falsos reclutadores en internet.',
        metrics: { seguridad: 95, vacantes: 92, soporte: 85, gratuito: 100 }
      },
      {
        id: 'remotive',
        nombre: 'Remotive',
        url: 'https://remotive.com',
        logo: 'https://www.google.com/s2/favicons?sz=128&domain=remotive.com',
        categoria: 'tech',
        categoriaLabel: 'Tech & Startups',
        ingles: 'Intermedio - Avanzado',
        paises: 'Mundial (Soporta huso horario de Latinoamérica)',
        descripcion: 'Bolsa de trabajo enfocada en startups que destaca por mostrar de forma transparente los salarios en gran parte de sus anuncios.',
        pros: [
          'Transparencia salarial visible en muchas ofertas.',
          'Filtros rápidos muy intuitivos por zona horaria compatible.',
          'Comunidad activa y boletín con ofertas frescas.'
        ],
        contras: [
          'Poca variedad en roles de administración tradicionales.',
          'Enfoque predominantemente tecnológico.'
        ],
        requisitos: 'CV en PDF en inglés y perfil de LinkedIn actualizado.',
        tipExperto: 'Utiliza su filtro de "Timezone" para seleccionar vacantes alineadas con el huso horario de Latinoamérica (EST/PST).',
        evitarEstafas: 'Si una startup te ofrece contratarte inmediatamente sin una entrevista técnica detallada, retrocede; podría ser una estafa.',
        metrics: { seguridad: 94, vacantes: 93, soporte: 80, gratuito: 100 }
      },
      {
        id: 'torre',
        nombre: 'Torre.ai',
        url: 'https://torre.ai',
        logo: 'https://www.google.com/s2/favicons?sz=128&domain=torre.ai',
        categoria: 'latam',
        categoriaLabel: 'LATAM Friendly',
        ingles: 'Básico - Avanzado',
        paises: 'América Latina y Global (Fuerte en vacantes hispanas)',
        descripcion: 'Plataforma de emparejamiento inteligente que utiliza inteligencia artificial y un Genoma Profesional para conectarte con oportunidades remotas.',
        pros: [
          'Fuerte presencia en Latinoamérica y ofertas en español.',
          'Algoritmo de emparejamiento automático por habilidades.',
          'Es completamente gratuita para candidatos.'
        ],
        contras: [
          'Crear y perfeccionar tu "Genoma Profesional" requiere bastante tiempo.',
          'La interfaz puede resultar abrumadora por la gran cantidad de datos.'
        ],
        requisitos: 'Registrar tu perfil detallado (Genoma) y realizar tests rápidos de aptitudes.',
        tipExperto: 'Participa en los tests de habilidades de Torre. Los perfiles con insignias de aptitudes aprobadas aparecen primero en las búsquedas de las empresas.',
        evitarEstafas: 'Verifica la reputación de la empresa dentro de Torre. Si una compañía no tiene historial ni reseñas de otros candidatos, postula con cautela.',
        metrics: { seguridad: 92, vacantes: 90, soporte: 88, gratuito: 100 }
      },
      {
        id: 'workingnomads',
        nombre: 'Working Nomads',
        url: 'https://www.workingnomads.com/jobs',
        logo: 'https://www.google.com/s2/favicons?sz=128&domain=workingnomads.com',
        categoria: 'general',
        categoriaLabel: 'General Remoto',
        ingles: 'Intermedio - Avanzado',
        paises: 'Mundial (Contratos B2B e independientes)',
        descripcion: 'Un portal clásico curado enfocado en profesionales independientes y nómadas digitales que buscan contratos B2B.',
        pros: [
          'Categorización de ofertas sumamente limpia.',
          'Excelente para perfiles no tecnológicos como redactores, traductores y soporte.',
          'Sencilla de usar, sin registros obligatorios al inicio.'
        ],
        contras: [
          'El volumen diario de nuevas ofertas es menor que en LinkedIn.',
          'Muchas vacantes requieren experiencia remota previa demostrable.'
        ],
        requisitos: 'Enviar CV y portafolio adaptados a contratos por servicios internacionales.',
        tipExperto: 'Explora la sección de "Writing" y "Customer Success" si buscas puestos sin experiencia en desarrollo.',
        evitarEstafas: 'Si te piden descargar programas raros (.exe) o extensiones de navegador para realizar una "prueba técnica", cancélalo de inmediato.',
        metrics: { seguridad: 92, vacantes: 90, soporte: 75, gratuito: 100 }
      },
      {
        id: 'workana',
        nombre: 'Workana',
        url: 'https://www.workana.com',
        logo: 'https://www.google.com/s2/favicons?sz=128&domain=workana.com',
        categoria: 'latam',
        categoriaLabel: 'LATAM Friendly',
        ingles: 'Básico - Intermedio',
        paises: 'América Latina y España (Trabajo por proyectos)',
        descripcion: 'La plataforma líder de trabajo remoto y freelance en español. Excelente para ganar experiencia y construir reputación inicial.',
        pros: [
          'Soporte 100% en español.',
          'Sistema de pago en garantía (Escrow): el cliente deposita y liberas al entregar.',
          'Ideal para construir portafolio local rápido.'
        ],
        contras: [
          'Cobran comisiones altas (hasta el 20% al inicio por proyecto).',
          'Mucha competencia de precios bajos.'
        ],
        requisitos: 'Completar tu perfil con ejemplos de trabajos previos y pasar una prueba de políticas.',
        tipExperto: 'Nunca envíes propuestas genéricas copiadas y pegadas. Lee bien lo que pide el cliente y explícale exactamente cómo vas a resolver su problema.',
        evitarEstafas: 'Bajo ninguna circunstancia aceptes que un cliente te pague por fuera de Workana (como Western Union o transferencia directa) antes de entregar; podrías no cobrar.',
        metrics: { seguridad: 90, vacantes: 88, soporte: 85, gratuito: 100 }
      },
      {
        id: 'linkedin',
        nombre: 'LinkedIn Jobs',
        url: 'https://www.linkedin.com/jobs',
        logo: 'https://www.google.com/s2/favicons?sz=128&domain=linkedin.com',
        categoria: 'general',
        categoriaLabel: 'General Remoto',
        ingles: 'Básico - Avanzado',
        paises: 'Local y Global (Filtros por país y región)',
        descripcion: 'La sección de empleo de la red profesional más grande del mundo. Millones de ofertas pero requiere filtros de seguridad.',
        pros: [
          'El mayor volumen de ofertas remotas del mercado.',
          'Permite contactar directamente al reclutador que publicó el puesto.',
          'Alertas de empleo configurables en tiempo real.'
        ],
        contras: [
          'Alto nivel de spam y ofertas fantasma (ghost jobs).',
          'Es donde ocurren más intentos de estafas de suplantación de identidad.'
        ],
        requisitos: 'Perfil optimizado con palabras clave, foto profesional y portafolio en destacados.',
        tipExperto: 'Cuando encuentres una vacante remota en LinkedIn, no uses "Solicitud Sencilla". Ve al sitio web oficial de la empresa y postula directamente desde allí.',
        evitarEstafas: 'Desconfía de ofertas rápidas por Telegram, correos con dominios falsos (ej. @gmail en vez de @empresa.com) o cuestionarios escritos en Google Forms.',
        metrics: { seguridad: 75, vacantes: 90, soporte: 70, gratuito: 100 }
      }
    ]
  },
  en: {
    header: {
      tit: 'Secure Remote Jobs',
      desc: 'Finding a remote job shouldn\'t be a Russian roulette of virtual scams. We honestly analyze the best real platforms in 2026 so you can apply smartly and safely.'
    },
    sidebar: {
      toggle: 'Collapse Index',
      index: 'Most Recommended',
      searchPlaceholder: 'Search platform by name, category or description...',
      searchCount: 'platforms',
      empty: 'No matching platforms found.',
      advice: 'Gold Tips',
      adviceTag: 'Safe'
    },
    card: {
      trustScore: 'Trust Score',
      metricsTitle: 'Evaluation Metrics',
      metrics: {
        seguridad: 'Security',
        vacantes: 'Vacancies',
        soporte: 'Support',
        gratuito: 'Free'
      },
      paises: 'Available Countries',
      ingles: 'English Level',
      requisitos: 'Application Requirements',
      pros: 'Pros',
      contras: 'Cons',
      tip: 'Expert Opinion',
      estafas: 'Avoid Scams',
      visit: 'Website',
      howToApply: 'How to Apply'
    },
    advice: {
      tit: '3 Gold Tips to Avoid Remote Scams',
      sub: 'The remote job market is highly competitive, which attracts criminals impersonating legitimate companies. Follow these golden rules:',
      goldTip: 'Gold Tip:',
      item1: {
        tit: 'Never pay to work or to receive equipment',
        desc: 'No real company will ask for money for "training", "buying software", or send you a digital check to buy a laptop. If they ask for a deposit or transfer, it is 100% a scam.',
        tip: 'Serious corporations send physical equipment directly to your home at no cost, or provide access to their virtual environment remotely.'
      },
      item2: {
        tit: 'Beware of "too fast" hiring processes',
        desc: 'If you apply and within a few hours they make a formal offer simply by answering questions via a Telegram or WhatsApp chat, without having done a real face-to-face video call, it is highly suspicious.',
        tip: 'Always research the recruiter on LinkedIn. Verify if they have mutual connections and if they officially work for the company offering the vacancy.'
      },
      item3: {
        tit: 'FlexJobs (The best paid option)',
        desc: 'Although it requires a monthly subscription, it is totally worth it if you want to completely avoid trash or questionable offers. Every offer is manually reviewed by a team of real people to guarantee your safety.',
        tip: 'Get their one-week trial subscription (it is very cheap), download the vacancies directly from the corporate pages, and contact the recruiters directly on LinkedIn.'
      },
      closing: '"The key to success in remote work is not mass applying, but specificity. Choose your battles, optimize your CV with AI to pass the ATS filters of these platforms, and be among the first to send your application. You can do it, we wish you great success!"'
    },
    plataformas: [
      {
        id: 'weworkremotely',
        nombre: 'We Work Remotely',
        url: 'https://weworkremotely.com',
        logo: 'https://www.google.com/s2/favicons?sz=128&domain=weworkremotely.com',
        categoria: 'tech',
        categoriaLabel: 'Tech & Startups',
        ingles: 'Intermediate - Advanced',
        paises: 'Worldwide (Worldwide - Hires in any country)',
        descripcion: 'The world\'s largest remote job board. Highly trusted and closely aligned with the global tech ecosystem.',
        pros: [
          '100% free access for candidates.',
          'Companies pay $299 per job posting, which keeps scammers away.',
          'High volume of vacancies in software development and marketing.'
        ],
        contras: [
          'Very high competition (hundreds of applications per post).',
          'Fluent conversational English is mandatory for most roles.'
        ],
        requisitos: 'Have an online portfolio (GitHub, Behance, etc.) and send a detailed CV in English.',
        tipExperto: 'Apply within the first 24 hours of posting. High-quality offers fill up quickly with qualified applicants.',
        evitarEstafas: 'Be careful if they redirect you to unofficial third-party forms asking for your social security number or bank details in the first step.',
        metrics: { seguridad: 98, vacantes: 96, soporte: 90, gratuito: 100 }
      },
      {
        id: 'prosmarketplace',
        nombre: 'Pros Marketplace',
        url: 'https://prosmarketplace.com',
        logo: 'https://www.google.com/s2/favicons?sz=128&domain=prosmarketplace.com',
        categoria: 'latam',
        categoriaLabel: 'LATAM Friendly',
        ingles: 'Intermediate - Advanced',
        paises: 'Latin America (Exclusive for LATAM talent)',
        descripcion: 'A specialized marketplace for Latin American talent connecting professionals directly with US companies.',
        pros: [
          'Vacancies tailored to the LATAM time zone.',
          'Stable and direct payments in US dollars.',
          'They guide and prepare you for the final interview with the client.'
        ],
        contras: [
          'Strict initial registration process with a mandatory video call in English.',
          'Vacancies concentrated in technical and advanced assistance roles.'
        ],
        requisitos: 'Pass the initial conversational English interview and identity verification.',
        tipExperto: 'Prepare well for your introduction video. Fluent English and good lighting in your video will secure interviews immediately.',
        evitarEstafas: 'Pros Marketplace manages everything within its secure platform; report if a client company asks you for your personal contact details outside.',
        metrics: { seguridad: 98, vacantes: 95, soporte: 92, gratuito: 100 }
      },
      {
        id: 'flexjobs',
        nombre: 'FlexJobs',
        url: 'https://www.flexjobs.com',
        logo: 'https://www.google.com/s2/favicons?sz=128&domain=flexjobs.com',
        categoria: 'premium',
        categoriaLabel: 'Hand-Screened Premium',
        ingles: 'Basic - Advanced',
        paises: 'Worldwide (Main focus on US companies)',
        descripcion: 'A leading platform that manually verifies every job post to guarantee it is 100% real, safe, and scam-free.',
        pros: [
          '100% scam-free and ad-free listings.',
          'Direct support and personalized profile reviews.',
          'Access to career coaching and skills tests.'
        ],
        contras: [
          'Requires a paid subscription to access offers.',
          'Few exclusive offers that cannot be found on the corporate website.'
        ],
        requisitos: 'Create an account, pay the membership fee, and upload your optimized resume.',
        tipExperto: 'It is ideal if you value your time and want to completely avoid questionable offers. It heavily focuses on US corporations and multinationals.',
        evitarEstafas: 'Even though FlexJobs manually filters everything, never accept proposals from recruiters contacting you outside asking for deposits for tools.',
        metrics: { seguridad: 100, vacantes: 100, soporte: 95, gratuito: 20 }
      },
      {
        id: 'remote-co',
        nombre: 'Remote.co',
        url: 'https://remote.co',
        logo: 'https://www.google.com/s2/favicons?sz=128&domain=remote.co',
        categoria: 'general',
        categoriaLabel: 'General Remote',
        ingles: 'Intermediate - Advanced',
        paises: 'Worldwide (Filter offers by searching for "Worldwide")',
        descripcion: 'A curated portal of remote opportunities in design, customer service, writing, development, and virtual assistance.',
        pros: [
          'Excellent segmentation by role.',
          'They only list companies with a solid remote work culture.',
          'Completely free to apply.'
        ],
        contras: [
          'Many vacancies are limited only to US tax residents.',
          'The website layout is simple but sometimes has duplicate postings.'
        ],
        requisitos: 'Upload your resume tailored to the international ATS market.',
        tipExperto: 'Always filter by searching for "Worldwide" in the job description to ensure they hire talent in Latin America.',
        evitarEstafas: 'Distrust if they offer you an interview via written chat (Telegram/WhatsApp). Companies on Remote.co always conduct formal video calls.',
        metrics: { seguridad: 95, vacantes: 94, soporte: 85, gratuito: 100 }
      },
      {
        id: 'dynamitejobs',
        nombre: 'Dynamite Jobs',
        url: 'https://dynamitejobs.com',
        logo: 'https://www.google.com/s2/favicons?sz=128&domain=dynamitejobs.com',
        categoria: 'general',
        categoriaLabel: 'General Remote',
        ingles: 'Intermediate - Advanced',
        paises: 'Worldwide (Focus on US and European vacancies)',
        descripcion: 'A platform with a human team behind it that manually verifies that every job offer has a clear economic compensation.',
        pros: [
          'Strict human verification of salaries and conditions.',
          'Excellent interactive candidate dashboard.',
          'Many offers in marketing and sales.'
        ],
        contras: [
          'Most roles require availability during US hours.',
          'The platform\'s initial screening process can be somewhat slow.'
        ],
        requisitos: 'Complete your profile on the platform and upload a short introduction video (optional but suggested).',
        tipExperto: 'Fill out your candidate profile to 100%. Recruiters usually search their internal database before publishing the offer to the public.',
        evitarEstafas: 'Never accept payments via digital checks to buy equipment. It is the most common scam from fake recruiters on the internet.',
        metrics: { seguridad: 95, vacantes: 92, soporte: 85, gratuito: 100 }
      }
    ]
  }
};
// Add remaining platforms for EN to keep it robust
idiomaRemotos.en.plataformas = [
  ...idiomaRemotos.en.plataformas,
  {
    id: 'remotive',
    nombre: 'Remotive',
    url: 'https://remotive.com',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=remotive.com',
    categoria: 'tech',
    categoriaLabel: 'Tech & Startups',
    ingles: 'Intermediate - Advanced',
    paises: 'Worldwide (Supports Latin American timezone)',
    descripcion: 'A tech-focused job board that stands out for transparently showing salaries in many of its job posts.',
    pros: [
      'Salary transparency visible in many offers.',
      'Highly intuitive quick filters by compatible time zone.',
      'Active community and newsletter with fresh job listings.'
    ],
    contras: [
      'Little variety in traditional administrative roles.',
      'Predominantly tech-focused.'
    ],
    requisitos: 'English resume in PDF and updated LinkedIn profile.',
    tipExperto: 'Use their "Timezone" filter to select vacancies aligned with the Latin American time zone (EST/PST).',
    evitarEstafas: 'If a startup offers to hire you immediately without a detailed technical interview, step back; it could be a scam.',
    metrics: { seguridad: 94, vacantes: 93, soporte: 80, gratuito: 100 }
  },
  {
    id: 'torre',
    nombre: 'Torre.ai',
    url: 'https://torre.ai',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=torre.ai',
    categoria: 'latam',
    categoriaLabel: 'LATAM Friendly',
    ingles: 'Basic - Advanced',
    paises: 'Latin America and Global (Strong in Spanish vacancies)',
    descripcion: 'A smart matching platform that uses artificial intelligence and a Professional Genome to connect you with remote opportunities.',
    pros: [
      'Strong presence in Latin America and Spanish offers.',
      'Automatic matching algorithm based on skills.',
      'Completely free for candidates.'
    ],
    contras: [
      'Creating and perfecting your "Professional Genome" requires a lot of time.',
      'The interface can be overwhelming due to the large amount of data.'
    ],
    requisitos: 'Register your detailed profile (Genome) and take quick skills tests.',
    tipExperto: 'Take Torre\'s skills tests. Profiles with verified skill badges appear first in corporate searches.',
    evitarEstafas: 'Verify the company\'s reputation within Torre. If a company has no history or candidate reviews, apply with caution.',
    metrics: { seguridad: 92, vacantes: 90, soporte: 88, gratuito: 100 }
  },
  {
    id: 'workingnomads',
    nombre: 'Working Nomads',
    url: 'https://www.workingnomads.com/jobs',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=workingnomads.com',
    categoria: 'general',
    categoriaLabel: 'General Remote',
    ingles: 'Intermediate - Advanced',
    paises: 'Worldwide (B2B and independent contracts)',
    descripcion: 'A classic curated portal focused on freelancers and digital nomads looking for B2B contracts.',
    pros: [
      'Extremely clean job categorization.',
      'Excellent for non-tech profiles like writers, translators, and support.',
      'Simple to use, with no mandatory registration at the beginning.'
    ],
    contras: [
      'The daily volume of new offers is lower than on LinkedIn.',
      'Many vacancies require demonstrable prior remote experience.'
    ],
    requisitos: 'Send CV and portfolio tailored to international services contracts.',
    tipExperto: 'Explore the "Writing" and "Customer Success" sections if you are looking for roles without development experience.',
    evitarEstafas: 'If they ask you to download suspicious programs (.exe) or browser extensions to complete a "technical test," cancel immediately.',
    metrics: { seguridad: 92, vacantes: 90, soporte: 75, gratuito: 100 }
  },
  {
    id: 'workana',
    nombre: 'Workana',
    url: 'https://www.workana.com',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=workana.com',
    categoria: 'latam',
    categoriaLabel: 'LATAM Friendly',
    ingles: 'Basic - Intermediate',
    paises: 'Latin America and Spain (Project-based work)',
    descripcion: 'The leading remote and freelance work platform in Spanish. Excellent for gaining experience and building initial reputation.',
    pros: [
      '100% Spanish support.',
      'Escrow payment system: client deposits and you release upon delivery.',
      'Ideal for building local portfolio fast.'
    ],
    contras: [
      'High commissions (up to 20% at start per project).',
      'A lot of low-price competition.'
    ],
    requisitos: 'Complete your profile with examples of previous work and pass a policies test.',
    tipExperto: 'Never send generic copied and pasted proposals. Read what the client wants and explain exactly how you will solve their problem.',
    evitarEstafas: 'Under no circumstances accept out-of-platform payments (like Western Union or direct transfer) before delivery; you might not get paid.',
    metrics: { seguridad: 90, vacantes: 88, soporte: 85, gratuito: 100 }
  },
  {
    id: 'linkedin',
    nombre: 'LinkedIn Jobs',
    url: 'https://www.linkedin.com/jobs',
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=linkedin.com',
    categoria: 'general',
    categoriaLabel: 'General Remote',
    ingles: 'Basic - Advanced',
    paises: 'Local and Global (Filters by country and region)',
    descripcion: 'The job section of the world\'s largest professional network. Millions of offers but requires security filters.',
    pros: [
      'The largest volume of remote offers on the market.',
      'Allows contacting the recruiter who published the post directly.',
      'Configurable job alerts in real time.'
    ],
    contras: [
      'High level of spam and ghost jobs.',
      'It is where most phishing and impersonation attempts occur.'
    ],
    requisitos: 'Optimized profile with keywords, professional photo, and featured portfolio.',
    tipExperto: 'When you find a remote vacancy on LinkedIn, don\'t use "Easy Apply". Go to the company\'s official website and apply directly from there.',
    evitarEstafas: 'Be suspicious of quick offers via Telegram, emails with false domains (e.g. @gmail instead of @company.com) or written questionnaires in Google Forms.',
    metrics: { seguridad: 75, vacantes: 90, soporte: 70, gratuito: 100 }
  }
];
