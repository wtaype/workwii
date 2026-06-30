// src/lib/convertir/descarga/dwmd.js
// Exportador de Currículum optimizado en formato Markdown (.md) estructurado

const isValidValue = (val) => {
  if (!val) return false;
  const lower = String(val).toLowerCase().trim();
  return lower !== 'null' && 
         lower !== 'no detectado' && 
         lower !== 'not detected' && 
         lower !== 'no especificado' && 
         lower !== 'not specified' && 
         lower !== 'no encontrado' && 
         lower !== 'not found' && 
         lower !== '—' && 
         lower !== '';
};

const getHref = (url) => {
  if (!url) return '';
  const clean = url.trim();
  if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
  return `https://${clean}`;
};

export const descargarMd = (cv) => {
  if (!cv) return;
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
  if (isValidValue(cv.email)) md += `- **Email:** ${cv.email}\n`;
  if (isValidValue(cv.telefono)) md += `- **${textTelefono}:** ${cv.telefono}\n`;
  if (isValidValue(cv.ubicacion)) md += `- **${textUbicacion}:** ${cv.ubicacion}\n`;
  if (isValidValue(cv.linkedin)) md += `- **LinkedIn:** [${cv.linkedin}](${getHref(cv.linkedin)})\n`;
  if (isValidValue(cv.web)) md += `- **${textWeb}:** [${cv.web}](${getHref(cv.web)})\n`;
  md += `\n---\n\n`;

  // Resumen
  if (cv.resumen) {
    md += `### ${textPerfil}\n\n`;
    md += `${cv.resumen}\n\n`;
  }

  // Experiencia Laboral
  const hasExp = cv.experiencias && cv.experiencias.some(exp => exp.puesto || exp.empresa);
  if (hasExp) {
    md += `### ${textExperiencia}\n\n`;
    cv.experiencias.forEach((exp) => {
      if (!exp.puesto && !exp.empresa) return;
      md += `#### ${exp.puesto || ''} — **${exp.empresa || ''}** (${exp.ubicacion || ''})\n`;
      md += `*${exp.inicio || ''} – ${exp.fin || textPresente}*\n\n`;
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
      if (!edu.institucion && !edu.grado) return;
      md += `#### ${edu.grado || ''} — **${edu.institucion || ''}** (${edu.ubicacion || ''})\n`;
      md += `*${edu.inicio || ''} – ${edu.fin || ''}*\n\n`;
    });
  }

  // Proyectos Destacados
  const hasProj = cv.proyectos && cv.proyectos.length > 0;
  if (hasProj) {
    const textProyectos = isEn ? 'Featured Projects' : 'Proyectos Destacados';
    md += `### ${textProyectos}\n\n`;
    cv.proyectos.forEach((proj) => {
      if (!proj.nombre && !proj.descripcion) return;
      md += `#### ${proj.nombre || ''}${proj.link ? ` — [Link](${getHref(proj.link)})` : ''}\n`;
      if (proj.tecnologias) md += `*${isEn ? 'Technologies:' : 'Tecnologías:'} ${proj.tecnologias}*\n\n`;
      if (proj.descripcion) md += `${proj.descripcion}\n\n`;
    });
  }

  // Certificaciones
  const hasCert = cv.certificaciones && cv.certificaciones.length > 0;
  if (hasCert) {
    const textCertificaciones = isEn ? 'Certifications' : 'Certificaciones';
    md += `### ${textCertificaciones}\n\n`;
    cv.certificaciones.forEach((cert) => {
      if (!cert.nombre && !cert.emisor) return;
      md += `#### ${cert.nombre || ''} — **${cert.emisor || ''}**\n`;
      if (cert.fecha) md += `*${cert.fecha}*\n\n`;
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
