/**
 * auditor.js - Auditor ATS de calidad de Curriculum Vitae (CV)
 * Calcula de forma reactiva y pura el score ATS y sugerencias de mejora.
 * Escrito en espanol sin tildes para maxima compatibilidad.
 */

export const auditarCV = (cv) => {
  if (!cv) return { score: 0, recommendations: [], level: 'Bajo' };

  let score = 0;
  const recommendations = [];

  // 1. Datos Personales (max 20 pts)
  if (cv.nombre && cv.nombre.trim().length > 2) {
    score += 5;
  } else {
    recommendations.push('<i class="fas fa-circle-exclamation cr_auditor_icon error"></i> Añade tu nombre completo.');
  }

  if (cv.titulo && cv.titulo.trim().length > 2) {
    score += 5;
  } else {
    recommendations.push('<i class="fas fa-circle-exclamation cr_auditor_icon error"></i> Agrega tu titulo profesional (ej. Frontend Engineer).');
  }

  if (cv.resumen && cv.resumen.trim().length > 15) {
    score += 5;
    if (cv.resumen.trim().length < 60) {
      recommendations.push('<i class="fas fa-triangle-exclamation cr_auditor_icon warning"></i> Tu resumen profesional es muy corto, amplialo un poco.');
    }
  } else {
    recommendations.push('<i class="fas fa-circle-exclamation cr_auditor_icon error"></i> Escribe un resumen profesional introductorio.');
  }

  if (cv.ubicacion && cv.ubicacion.trim().length > 2) {
    score += 5;
  } else {
    recommendations.push('<i class="fas fa-circle-info cr_auditor_icon info"></i> Añade tu ubicacion (ej. Lima, Peru).');
  }

  // 2. Habilidades / Skills (max 20 pts)
  if (cv.skills && cv.skills.trim().length > 0) {
    const listado = cv.skills.split(',').map(s => s.trim()).filter(Boolean);
    if (listado.length >= 10) {
      score += 20;
    } else if (listado.length >= 5) {
      score += 15;
      recommendations.push('<i class="fas fa-circle-info cr_auditor_icon info"></i> Añade mas palabras clave o habilidades tecnicas (minimo 10).');
    } else {
      score += 5;
      recommendations.push('<i class="fas fa-triangle-exclamation cr_auditor_icon warning"></i> Tienes muy pocas habilidades registradas, agrega al menos 5.');
    }
  } else {
    recommendations.push('<i class="fas fa-circle-exclamation cr_auditor_icon error"></i> Agrega habilidades y tecnologias clave (skills).');
  }

  // 3. Experiencias Laborales (max 40 pts)
  const experiencias = cv.experiencias || [];
  if (experiencias.length > 0) {
    score += Math.min(20, experiencias.length * 10);
    if (experiencias.length < 2) {
      recommendations.push('<i class="fas fa-circle-info cr_auditor_icon info"></i> Agrega al menos dos experiencias laborales si las tienes.');
    }

    // Buscar metricas cuantitativas (porcentajes o numeros) en logros
    let contadorNumeros = 0;
    experiencias.forEach(exp => {
      if (exp.logros) {
        const matches = exp.logros.match(/\d+|%/g);
        if (matches) {
          contadorNumeros += matches.length;
        }
      }
    });

    if (contadorNumeros >= 3) {
      score += 20;
    } else if (contadorNumeros >= 1) {
      score += 10;
      recommendations.push('<i class="fas fa-lightbulb cr_auditor_icon warning"></i> <strong>Consejo ATS:</strong> Añade mas metricas numericas o porcentajes en tus logros.');
    } else {
      recommendations.push('<i class="fas fa-lightbulb cr_auditor_icon warning"></i> <strong>Importante ATS:</strong> No tienes metricas en tus logros. Los reclutadores prefieren resultados medibles (ej: "Reduje latencia en 30%").');
    }
  } else {
    recommendations.push('<i class="fas fa-circle-exclamation cr_auditor_icon error"></i> Añade experiencias laborales en tu CV.');
  }

  // 4. Proyectos y Certificaciones (max 20 pts)
  const proyectos = cv.proyectos || [];
  const certificaciones = cv.certificaciones || [];

  if (proyectos.length > 0) {
    score += 10;
  } else {
    recommendations.push('<i class="fas fa-circle-info cr_auditor_icon info"></i> Añadir proyectos destacados (SaaS, apps) fortalece mucho tu perfil.');
  }

  if (certificaciones.length > 0) {
    score += 10;
  } else {
    recommendations.push('<i class="fas fa-circle-info cr_auditor_icon info"></i> Agrega certificaciones o cursos relevantes.');
  }

  // Calcular Nivel
  let level = 'Bajo';
  if (score >= 80) {
    level = 'Excelente';
  } else if (score >= 55) {
    level = 'Aceptable';
  }

  return {
    score,
    recommendations,
    level
  };
};
