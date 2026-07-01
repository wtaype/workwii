// src/lib/crear/auditor.js
// Auditor ATS y Calculador de Puntaje de CV en Tiempo Real

const SPANISH_ACTION_VERBS = [
  'lideré', 'diseñé', 'implementé', 'desarrollé', 'automaticé', 'reduje', 'incrementé', 'coordiné', 'gestioné', 'ejecuté', 
  'administré', 'dirigí', 'creé', 'optimicé', 'negocié', 'logré', 'conseguí', 'superé', 'establecí', 'formulé', 
  'reestructuré', 'planifiqué', 'conducí', 'monitoreé', 'liderar', 'diseñar', 'implementar', 'desarrollar', 
  'automatizar', 'reducir', 'incrementar', 'coordinar', 'gestionar', 'ejecutar', 'administrar', 'dirigir', 
  'crear', 'optimizar', 'negociar', 'lograr', 'conseguir', 'superar', 'establecer', 'formular', 'reestructurar', 
  'planificar', 'monitorear', 'colaboré', 'apoyé', 'participe', 'realicé', 'elaboré', 'supervisé', 'fomenté',
  'aumenté', 'disminuí', 'ahorré', 'generé', 'capté', 'retuve'
];

const ENGLISH_ACTION_VERBS = [
  'led', 'designed', 'implemented', 'developed', 'automated', 'reduced', 'increased', 'coordinated', 'managed', 'executed', 
  'administered', 'directed', 'created', 'optimized', 'negotiated', 'achieved', 'exceeded', 'established', 'formulated', 
  'restructured', 'planned', 'monitored', 'collaborated', 'assisted', 'participated', 'performed', 'prepared', 'supervised', 
  'promoted', 'saved', 'generated', 'acquired', 'retained', 'built', 'improved', 'increased', 'decreased'
];

const ACTION_VERBS = new Set([...SPANISH_ACTION_VERBS, ...ENGLISH_ACTION_VERBS]);

/**
 * Analiza la estructura de los logros en la experiencia laboral
 * para determinar si cumplen con el formato de viñetas y usan verbos de acción.
 */
const analizarLogrosATS = (experiencias) => {
  let totalBullets = 0;
  let bulletsWithVerbs = 0;

  const validExps = experiencias.filter(e => e.puesto?.trim() || e.empresa?.trim());
  if (validExps.length === 0) {
    return { hasBullets: false, hasActionVerbs: false };
  }

  let hasAnyLogro = false;

  validExps.forEach(exp => {
    const logrosStr = Array.isArray(exp.logros)
      ? exp.logros.join('\n')
      : (typeof exp.logros === 'string' ? exp.logros : '');

    if (!logrosStr || !logrosStr.trim()) return;

    // Los logros se guardan SIN viñeta (texto limpio — la viñeta es visual)
    const lines = logrosStr.split('\n').map(l => l.replace(/^[-\*\•\s]+/, '').trim()).filter(l => l.length > 0);

    if (lines.length > 0) hasAnyLogro = true;

    lines.forEach(line => {
      totalBullets++;
      const firstWord = line.split(/\s+/)[0]
        .toLowerCase()
        .replace(/[^a-záéíóúüñ]/g, '');
      if (ACTION_VERBS.has(firstWord)) bulletsWithVerbs++;
    });
  });

  if (!hasAnyLogro) return { hasBullets: false, hasActionVerbs: false };

  // hasBullets = true si hay al menos una línea de logro con contenido
  const hasBullets = totalBullets > 0;
  const ratio = totalBullets > 0 ? (bulletsWithVerbs / totalBullets) : 0;
  const hasActionVerbs = ratio >= 0.5;

  return { hasBullets, hasActionVerbs };
};

/**
 * Evalúa los datos actuales del CV y retorna un puntaje sobre 100
 * junto con un listado de advertencias y consejos formativos.
 * 
 * @param {object} cv - Objeto de datos del currículum
 * @returns {object} { score: number, checklist: Array<{ type: string, text: string }> }
 */
export const auditarCvAts = (cv) => {
  let score = 0;
  const checklist = [];

  if (!cv) return { score: 0, checklist: [] };

  // 1. EVALUAR DATOS DE CONTACTO BASICOS (Máx: 20 puntos)
  if (cv.nombre && cv.nombre.trim().length > 3) {
    score += 5;
  } else {
    checklist.push({ type: 'danger', text: 'Falta tu Nombre Completo.' });
  }

  if (cv.email && cv.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(cv.email.trim())) {
      score += 5;
    } else {
      checklist.push({ type: 'danger', text: 'El formato de tu Correo Electrónico no es válido.' });
    }
  } else {
    checklist.push({ type: 'danger', text: 'Falta tu Correo de contacto.' });
  }

  if (cv.telefono && cv.telefono.trim().length > 5) {
    score += 5;
  } else {
    checklist.push({ type: 'danger', text: 'Agrega un Teléfono de contacto.' });
  }

  if (cv.ubicacion && cv.ubicacion.trim().length > 3) {
    score += 5;
  } else {
    checklist.push({ type: 'warning', text: 'Agrega tu Ubicación (Ciudad, País).' });
  }

  // 2. ENLACES Y TITULO (Máx: 10 puntos)
  const isLinkedinValid = cv.linkedin && cv.linkedin.trim().length > 5;
  const isLinkedinPlaceholder = isLinkedinValid && (
    cv.linkedin.toLowerCase().includes('/in/usuario') || 
    cv.linkedin.toLowerCase().includes('linkedin.com/in/usuario') ||
    cv.linkedin.toLowerCase() === 'https://linkedin.com/in/usuario' ||
    cv.linkedin.toLowerCase() === 'usuario'
  );

  if (isLinkedinValid && !isLinkedinPlaceholder) {
    score += 5;
  } else if (isLinkedinPlaceholder) {
    checklist.push({ type: 'danger', text: 'Personaliza tu enlace de LinkedIn (actualmente contiene el valor de plantilla "/in/usuario").' });
  } else {
    checklist.push({ type: 'warning', text: 'Agrega tu enlace de LinkedIn para mejorar la visibilidad.' });
  }

  if (cv.titulo && cv.titulo.trim().length > 3) {
    score += 5;
  } else {
    checklist.push({ type: 'warning', text: 'Agrega un Título Profesional (ej: Desarrollador React).' });
  }

  // 3. EVALUAR RESUMEN PROFESIONAL (Máx: 10 puntos)
  if (cv.resumen && cv.resumen.trim()) {
    score += 5;
    const wordCount = cv.resumen.trim().split(/\s+/).length;
    if (wordCount >= 40 && wordCount <= 120) {
      score += 5;
    } else if (wordCount < 40) {
      checklist.push({ type: 'warning', text: 'Tu resumen profesional es muy corto (menos de 40 palabras).' });
    } else {
      checklist.push({ type: 'info', text: 'Tu resumen profesional es muy largo. Redúcelo a menos de 120 palabras.' });
    }
  } else {
    checklist.push({ type: 'danger', text: 'Falta tu Resumen Profesional.' });
  }

  // 4. EVALUAR HABILIDADES E IDIOMAS (Máx: 15 puntos)
  if (cv.skills && cv.skills.trim()) {
    score += 5;
    const skillsList = cv.skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
    if (skillsList.length >= 8) {
      score += 5;
    } else {
      checklist.push({ type: 'info', text: 'Agrega al menos 8 habilidades clave relevantes en tu perfil.' });
    }
  } else {
    checklist.push({ type: 'warning', text: 'No has agregado Habilidades técnicas o blandas.' });
  }

  if (cv.idiomas && cv.idiomas.length > 0) {
    score += 5;
  } else {
    checklist.push({ type: 'info', text: 'Agrega Idiomas para incrementar tu empleabilidad.' });
  }

  // 5. EVALUAR EXPERIENCIA LABORAL Y CALIDAD ATS (Máx: 50 puntos)
  if (cv.experiencias && cv.experiencias.length > 0) {
    const validExps = cv.experiencias.filter(e => e.puesto?.trim() || e.empresa?.trim());
    if (validExps.length > 0) {
      score += 10; // Presencia de experiencia
      
      const { hasBullets, hasActionVerbs } = analizarLogrosATS(cv.experiencias);

      // Formato de viñetas
      if (hasBullets) {
        score += 10;
      } else {
        checklist.push({ type: 'warning', text: 'Escribe tus logros en forma de lista con viñetas (comenzando con guión "- "). Evita párrafos largos de texto.' });
      }

      // Verbos de acción
      if (hasActionVerbs) {
        score += 15;
      } else {
        checklist.push({ type: 'warning', text: 'Comienza cada logro con un verbo de acción fuerte (ej: "Lideré", "Diseñé", "Optimicé"). Usa "Optimizar con Botwii" para corregirlo.' });
      }

      // Métricas
      const metricRegex = /(\d+%\s*|\d+\s*(?:dólares|USD|usuarios|clientes|proyectos|ventas|empleados|tickets|%|horas|meses|años|dollars|users|clients|projects|sales|employees|leads|conversion|downloads))/i;
      let hasMetrics = false;
      validExps.forEach(exp => {
        if (exp.logros && metricRegex.test(exp.logros)) {
          hasMetrics = true;
        }
      });

      if (hasMetrics) {
        score += 15;
      } else {
        checklist.push({ type: 'warning', text: 'Tus logros carecen de métricas o resultados cuantitativos (ej: "reduje tiempos en un 15%"). Los ATS los priorizan.' });
      }
    } else {
      checklist.push({ type: 'danger', text: 'Agrega al menos una Experiencia Laboral.' });
    }
  } else {
    checklist.push({ type: 'danger', text: 'Agrega al menos una Experiencia Laboral.' });
  }

  // 6. PENALIZACIONES DE ATS (Filtros automáticos)
  if (cv.incluirFoto) {
    score -= 15;
    checklist.push({ type: 'danger', text: 'La foto en el currículum puede causar que los robots ATS rechacen o corrompan tu CV en mercados tecnológicos.' });
  }

  // Asegurar límites del puntaje
  score = Math.min(Math.max(score, 0), 100);

  return {
    score,
    checklist
  };
};
