/**
 * puesto.js - Promptero de contexto para Coach Wii adaptando perfil y vacante.
 * Escrito en espanol sin tildes para evitar problemas de codificacion.
 */

export const promptPuesto = (cv, lang, vacanteDesc) => {
  const idiomaNombre = lang === 'en' ? 'English' : 'Español latinoamericano';

  const cvDataJson = cv && cv.nombre ? JSON.stringify({
    nombre: cv.nombre || '',
    titulo: cv.titulo || '',
    resumen: cv.resumen || '',
    skills: cv.skills || '',
    experiencias: cv.experiencias || [],
    educacion: cv.educacion || [],
    proyectos: cv.proyectos || [],
    certificaciones: cv.certificaciones || []
  }, null, 2) : 'Ningun CV cargado por el momento.';

  return `
DATOS DEL PERFIL DEL CANDIDATO (CV):
${cvDataJson}

DESCRIPCION DEL PUESTO O REQUISITOS DE LA VACANTE:
${vacanteDesc || 'Ninguna descripcion ingresada aun.'}

INSTRUCCIONES DE CONTEXTO PARA COACH WII:
1. Analiza si el perfil del candidato cumple con los requisitos del puesto.
2. Identifica puntos debiles del perfil (ej: falta de experiencia en herramientas criticas de la vacante, certificaciones requeridas faltantes).
3. Ayuda al candidato a prepararse para preguntas de entrevista basadas en estas brechas, enseñandole a justificar y reencuadrar su experiencia de forma persuasiva.
4. Si el usuario te pide una simulacion de entrevista, genera preguntas especificas para este puesto y evalua las respuestas del candidato.
5. Comunicate en: ${idiomaNombre}.
`.trim();
};
