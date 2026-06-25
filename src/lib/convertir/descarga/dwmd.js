/**
 * Genera y descarga el currículum en formato Markdown (.md) estructurado para repositorios y lectura técnica.
 * Soporta traducción automática de encabezados si el currículum está en inglés.
 * 
 * @param {object} cv - Objeto con los datos estructurados del currículum.
 */
export const descargarMd = (cv) => {
  const isEn = cv.idioma === 'en';

  const textContacto = isEn ? 'Contact Info' : 'Contacto';
  const textTelefono = isEn ? 'Phone' : 'Teléfono';
  const textUbicacion = isEn ? 'Location' : 'Ubicación';
  const textWeb = isEn ? 'Website' : 'Sitio Web';
  const textPerfil = isEn ? 'Professional Summary' : 'Perfil Profesional';
  const textExperiencia = isEn ? 'Work Experience' : 'Experiencia Laboral';
  const textPresente = isEn ? 'Present' : 'Presente';
  const textEducacion = isEn ? 'Education' : 'Educación';
  const textSkills = isEn ? 'Skills' : 'Habilidades';
  const textIdiomas = isEn ? 'Languages' : 'Idiomas';

  let md = '';

  // Encabezado principal
  md += `# ${cv.nombre || 'Nombre Completo'}\n`;
  if (cv.titulo) md += `## ${cv.titulo}\n\n`;

  // Datos de contacto
  md += `**${textContacto}:**\n`;
  md += `- **Email:** ${cv.email || ''}\n`;
  if (cv.telefono) md += `- **${textTelefono}:** ${cv.telefono}\n`;
  if (cv.ubicacion) md += `- **${textUbicacion}:** ${cv.ubicacion}\n`;
  if (cv.linkedin) md += `- **LinkedIn:** [${cv.linkedin}](${cv.linkedin})\n`;
  if (cv.web) md += `- **${textWeb}:** [${cv.web}](${cv.web})\n`;
  md += `\n---\n\n`;

  // Resumen
  if (cv.resumen) {
    md += `### ${textPerfil}\n\n`;
    md += `${cv.resumen}\n\n`;
  }

  // Experiencia Laboral
  if (cv.experiencias && cv.experiencias.length > 0) {
    md += `### ${textExperiencia}\n\n`;
    cv.experiencias.forEach((exp) => {
      md += `#### ${exp.puesto} — **${exp.empresa}** (${exp.ubicacion || ''})\n`;
      md += `*${exp.inicio} – ${exp.fin || textPresente}*\n\n`;
      if (exp.logros) {
        const logrosFormateados = exp.logros.split('\n').map(l => {
          const clean = l.trim().replace(/^-\s*/, '');
          return clean ? `- ${clean}` : '';
        }).filter(Boolean).join('\n');
        md += `${logrosFormateados}\n`;
      }
      md += `\n`;
    });
  }

  // Educación
  if (cv.educacion && cv.educacion.length > 0) {
    md += `### ${textEducacion}\n\n`;
    cv.educacion.forEach((edu) => {
      md += `#### ${edu.grado} — **${edu.institucion}** (${edu.ubicacion || ''})\n`;
      md += `*${edu.inicio} – ${edu.fin}*\n\n`;
    });
  }

  // Habilidades
  if (cv.skills) {
    md += `### ${textSkills}\n\n`;
    md += `${cv.skills}\n\n`;
  }

  // Idiomas
  if (cv.idiomas && cv.idiomas.length > 0) {
    md += `### ${textIdiomas}\n\n`;
    md += `${cv.idiomas.filter(Boolean).join(', ')}\n\n`;
  }

  // Descarga del Blob
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(cv.nombre || 'CV_ATS').replace(/\s+/g, '_')}_CV_ATS.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
