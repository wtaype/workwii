// src/lib/crear/descarga/dwtxt.js
// Exportador de CV en formato de Texto Plano (.txt) estructurado para filtros ATS

export const descargarTxt = (cv) => {
  const isEn = cv.idioma === 'en';

  const textContacto = isEn ? 'Contact Info' : 'Contacto';
  const textTelefono = isEn ? 'Phone' : 'Teléfono';
  const textUbicacion = isEn ? 'Location' : 'Ubicación';
  const textWeb = isEn ? 'Website' : 'Sitio Web';
  const textPerfil = isEn ? 'PROFESSIONAL SUMMARY' : 'PERFIL PROFESIONAL';
  const textExperiencia = isEn ? 'WORK EXPERIENCE' : 'EXPERIENCIA LABORAL';
  const textPeriodo = isEn ? 'Period' : 'Período';
  const textPresente = isEn ? 'Present' : 'Presente';
  const textEducacion = isEn ? 'EDUCATION' : 'EDUCACIÓN';
  const textSkills = isEn ? 'SKILLS' : 'HABILIDADES';
  const textIdiomas = isEn ? 'LANGUAGES' : 'IDIOMAS';

  let txt = '';

  // Encabezado
  txt += `${(cv.nombre || 'Nombre Completo').toUpperCase()}\n`;
  if (cv.titulo) txt += `${cv.titulo.toUpperCase()}\n`;
  txt += `======================================================================\n`;
  
  // Datos de contacto
  txt += `${textContacto}:\n`;
  txt += `Email: ${cv.email || ''}\n`;
  if (cv.telefono) txt += `${textTelefono}: ${cv.telefono}\n`;
  if (cv.ubicacion) txt += `${textUbicacion}: ${cv.ubicacion}\n`;
  if (cv.linkedin) txt += `LinkedIn: ${cv.linkedin}\n`;
  if (cv.web) txt += `${textWeb}: ${cv.web}\n`;
  txt += `======================================================================\n\n`;

  // Resumen Profesional
  if (cv.resumen) {
    txt += `${textPerfil}\n`;
    txt += `----------------------------------------------------------------------\n`;
    txt += `${cv.resumen}\n\n`;
  }

  // Experiencia Laboral
  if (cv.experiencias && cv.experiencias.length > 0) {
    txt += `${textExperiencia}\n`;
    txt += `----------------------------------------------------------------------\n`;
    cv.experiencias.forEach((exp) => {
      if (!exp.puesto && !exp.empresa) return;
      txt += `${(exp.puesto || '').toUpperCase()} | ${exp.empresa || ''} | ${exp.ubicacion || ''}\n`;
      txt += `${textPeriodo}: ${exp.inicio || ''} - ${exp.fin || textPresente}\n`;
      if (exp.logros) {
        const logrosFormateados = exp.logros.split('\n').map(l => {
          const clean = l.trim().replace(/^-\s*/, '');
          return clean ? `- ${clean}` : '';
        }).filter(Boolean).join('\n');
        txt += `${logrosFormateados}\n`;
      }
      txt += `\n`;
    });
  }

  // Educación
  if (cv.educacion && cv.educacion.length > 0) {
    txt += `${textEducacion}\n`;
    txt += `----------------------------------------------------------------------\n`;
    cv.educacion.forEach((edu) => {
      if (!edu.grado && !edu.institucion) return;
      txt += `${edu.grado || ''} | ${edu.institucion || ''} | ${edu.ubicacion || ''}\n`;
      txt += `${textPeriodo}: ${edu.inicio || ''} - ${edu.fin || ''}\n\n`;
    });
  }

  // Habilidades
  if (cv.skills) {
    txt += `${textSkills}\n`;
    txt += `----------------------------------------------------------------------\n`;
    txt += `${cv.skills}\n\n`;
  }

  // Idiomas
  if (cv.idiomas && cv.idiomas.length > 0) {
    txt += `${textIdiomas}\n`;
    txt += `----------------------------------------------------------------------\n`;
    txt += `${cv.idiomas.filter(Boolean).join(', ')}\n\n`;
  }

  // Crear y descargar archivo
  const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(cv.nombre || 'CV_ATS').replace(/\s+/g, '_')}_CV_ATS.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
