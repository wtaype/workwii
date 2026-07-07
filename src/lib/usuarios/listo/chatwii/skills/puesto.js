// src/lib/usuarios/listo/chatwii/skills/puesto.js
// Generador de prompt de contexto para ChatWii en Listo (incorpora CV, vacante y citas contextuales)

export const promptPuesto = (cv, lang, vacanteDesc, quotedMsg = null) => {
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
  }, null, 2) : 'Ningún CV cargado por el momento.';

  let citaContexto = '';
  if (quotedMsg) {
    citaContexto = `
EL USUARIO ESTÁ RESPONDIENDO ESPECÍFICAMENTE A ESTE MENSAJE CITADO:
Role: ${quotedMsg.role}
Texto Citado: "${quotedMsg.text}"
Por favor, enfoca tu respuesta directamente en responder o elaborar sobre este mensaje citado.
`;
  }

  return `
DATOS DEL PERFIL DEL CANDIDATO (CV):
${cvDataJson}

DESCRIPCIÓN DEL PUESTO O REQUISITOS DE LA VACANTE:
${vacanteDesc || 'Ninguna descripción ingresada aún.'}
${citaContexto}

INSTRUCCIONES DE CONTEXTO PARA CHATWII:
1. Compara el CV con la vacante para sugerir optimizaciones estratégicas.
2. Si el usuario te indica modificar secciones específicas (resumen, logros, skills), enfoca tu respuesta JSON solo en esos campos.
3. Si el usuario te cita un mensaje, prioriza responder a esa referencia.
4. Comunícate en: ${idiomaNombre}.
5. Si decides sugerir optimizaciones al CV, recuerda usar obligatoriamente las etiquetas XML <explicacion> y <cambio_cv> con JSON válido.
`.trim();
};
