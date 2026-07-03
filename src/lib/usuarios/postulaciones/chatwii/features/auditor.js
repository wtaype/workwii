/**
 * auditor.js - Analizador de consistencia y coincidencia entre el CV y la vacante activa
 * Escrito en espanol sin tildes para evitar problemas de codificacion.
 */

/**
 * Realiza una auditoria simple del CV contra la vacante activa
 * @param {object} cv - JSON del CV
 * @param {string} vacante - Texto de la vacante/requisitos
 * @returns {object} Puntuacion e items clave
 */
export const auditarCompatibilidad = (cv, vacante) => {
  if (!cv || !cv.nombre) {
    return { score: 0, matched: [], missing: [], feedback: 'Carga tu CV para analizar la compatibilidad.' };
  }

  if (!vacante || !vacante.trim()) {
    return { score: 10, matched: [], missing: [], feedback: 'Pega la descripcion del puesto para auditar tu perfil.' };
  }

  const vText = vacante.toLowerCase();
  const cvSkills = (cv.skills || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);

  // Intentamos buscar coincidencia de habilidades en la descripcion
  const matched = [];
  const missing = [];

  // Palabras clave comunes a buscar
  const keywordsComunes = [
    'react', 'vue', 'angular', 'javascript', 'typescript', 'node', 'python', 'java', 'c#', 'php',
    'sql', 'nosql', 'mongodb', 'docker', 'kubernetes', 'aws', 'cloud', 'git', 'agile', 'scrum',
    'css', 'html', 'sass', 'tailwind', 'figma', 'english', 'ingles', 'excel', 'liderazgo', 'teamwork'
  ];

  keywordsComunes.forEach(kw => {
    if (vText.includes(kw)) {
      if (cvSkills.some(s => s.includes(kw))) {
        matched.push(kw);
      } else {
        missing.push(kw);
      }
    }
  });

  const totalKw = matched.length + missing.length;
  let score = 30; // base score if CV and vacancy are present
  if (totalKw > 0) {
    score = Math.round(30 + (matched.length / totalKw) * 70);
  }

  return {
    score,
    matched,
    missing,
    feedback: score > 75 
      ? '¡Buen match! Tu perfil tiene una gran compatibilidad con este puesto.' 
      : 'Compatibilidad moderada. Considera dialogar con Coach Wii para destacar tus habilidades en las brechas encontradas.'
  };
};
