// src/lib/crear/descarga/dwpdf.js
// Descarga de CV en formato PDF (Vectorial ATS) e Impresión Nativa

// Configuración de estilos tipográficos y maquetación del PDF
const estilosPdf = {
  margenes: [40, 45, 40, 45], // [izquierda, arriba, derecha, abajo] en puntos (pt)
  fuenteDefault: 'Roboto',
  interlineado: 1.35,
  
  // Cabecera (Nombre, Título, Contacto)
  name: { fontSize: 22, bold: true, color: '#1a202c', spaceAfter: 3 },
  title: { fontSize: 13, color: '#4a5568', spaceAfter: 5 },
  contact: { fontSize: 10, color: '#718096', spaceAfter: 8 },
  
  // Encabezados de Sección y Texto General
  sectionHeader: { fontSize: 12, bold: true, color: '#1a202c', spaceBefore: 10, spaceAfter: 8 },
  bodyText: { fontSize: 10.5, color: '#2d3748', spaceAfter: 12 },
  
  // Experiencia Laboral y Educación
  puesto: { fontSize: 11, bold: true },
  empresa: { fontSize: 11, bold: true, color: '#2d3748' },
  fecha: { fontSize: 10.5, color: '#4a5568' },
  ubicacion: { fontSize: 9, color: '#718096', italic: true, spaceAfter: 4 },
  logros: { fontSize: 10.5, color: '#2d3748', spaceLeft: 10, spaceBefore: 3, spaceAfter: 8, lineHeight: 1.3 },
  
  // Habilidades e Idiomas
  skills: { fontSize: 10.5, color: '#2d3748', spaceBefore: 2, spaceAfter: 4 },
  idiomas: { fontSize: 10.5, color: '#2d3748', spaceAfter: 2 }
};

export const descargarPdfDirecto = async (cv) => {
  // 1. Cargar dinámicamente pdfmake y vfs_fonts v0.2.7 desde CDN si no están disponibles
  if (!window.pdfMake) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  const isEn = cv.idioma === 'en';

  const textPerfil      = isEn ? 'Professional Summary' : 'Perfil Profesional';
  const textExperiencia = isEn ? 'Work Experience'      : 'Experiencia Laboral';
  const textEducacion   = isEn ? 'Education'            : 'Educación';
  const textSkills      = isEn ? 'Skills & Languages'   : 'Habilidades e Idiomas';
  const textSkillsLabel = isEn ? 'Skills'               : 'Habilidades';
  const textIdiomasLabel= isEn ? 'Languages'            : 'Idiomas';
  const textPresente    = isEn ? 'Present'              : 'Presente';

  // ── Contacto ──
  const personal = [];
  if (cv.email)    personal.push(cv.email);
  if (cv.telefono) personal.push(cv.telefono);
  if (cv.ubicacion)personal.push(cv.ubicacion);
  const personalText = personal.join('   |   ');

  const links = [];
  if (cv.linkedin) links.push(cv.linkedin);
  if (cv.web)      links.push(cv.web);
  const linksText = links.join('   |   ');

  // ── Estructura de Contenido del PDF (pdfmake) ──
  const docContent = [
    // Header principal
    { text: cv.nombre || 'Nombre Completo', style: 'name' },
    { text: cv.titulo || 'Título o Profesión', style: 'title' },
    { text: personalText || '', style: 'contact' }
  ];

  if (linksText) {
    docContent.push({ text: linksText, style: 'contact', margin: [0, -4, 0, 4] });
  }

  docContent.push({
    canvas: [
      {
        type: 'line',
        x1: 0, y1: 5,
        x2: 515, y2: 5, // Ancho A4 (595pt) - márgenes laterales (40pt * 2) = 515pt
        lineWidth: 0.75,
        lineColor: '#cbd5e0'
      }
    ],
    margin: [0, 0, 0, estilosPdf.contact.spaceAfter]
  });

  // ── Resumen / Perfil ──
  if (cv.resumen) {
    docContent.push(
      { text: textPerfil, style: 'sectionHeader' },
      {
        canvas: [
          { type: 'line', x1: 0, y1: 2, x2: 515, y2: 2, lineWidth: 0.5, lineColor: '#a0aec0' }
        ],
        margin: [0, 2, 0, estilosPdf.sectionHeader.spaceAfter]
      },
      { text: cv.resumen, style: 'bodyText', margin: [0, 2, 0, estilosPdf.bodyText.spaceAfter] }
    );
  }

  // ── Experiencia Laboral ──
  const validExps = cv.experiencias?.filter(e => e.puesto?.trim() || e.empresa?.trim()) || [];
  if (validExps.length > 0) {
    docContent.push(
      { text: textExperiencia, style: 'sectionHeader' },
      {
        canvas: [
          { type: 'line', x1: 0, y1: 2, x2: 515, y2: 2, lineWidth: 0.5, lineColor: '#a0aec0' }
        ],
        margin: [0, 2, 0, estilosPdf.sectionHeader.spaceAfter]
      }
    );

    validExps.forEach((exp, idx) => {
      const dateText = `${exp.inicio || ''} – ${exp.fin === 'Presente' || !exp.fin ? textPresente : exp.fin}`;
      
      const expStack = [];
      expStack.push({
        columns: [
          {
            text: exp.puesto || 'Puesto / Cargo',
            bold: estilosPdf.puesto.bold,
            fontSize: estilosPdf.puesto.fontSize,
            width: '*'
          },
          {
            text: dateText,
            alignment: 'right',
            fontSize: estilosPdf.fecha.fontSize,
            color: estilosPdf.fecha.color,
            width: 'auto'
          }
        ],
        margin: [0, 0, 0, 2]
      });

      const subrowColumns = [];
      subrowColumns.push({
        text: exp.empresa || '',
        fontSize: estilosPdf.fecha.fontSize,
        color: '#4a5568',
        italic: true,
        width: '*'
      });
      if (exp.ubicacion) {
        subrowColumns.push({
          text: exp.ubicacion,
          fontSize: estilosPdf.ubicacion.fontSize,
          color: estilosPdf.ubicacion.color,
          italic: true,
          alignment: 'right',
          width: 'auto'
        });
      }
      expStack.push({
        columns: subrowColumns,
        margin: [0, 0, 0, exp.logros ? 2 : estilosPdf.ubicacion.spaceAfter]
      });

      if (exp.logros) {
        const logrosStr = Array.isArray(exp.logros)
          ? exp.logros.join('\n')
          : (typeof exp.logros === 'string' ? exp.logros : '');

        if (logrosStr) {
          const achievementsList = logrosStr
            .split('\n')
            .map(l => l.trim())
            .filter(l => l.length > 0)
            .map(line => line.replace(/^[-\*\•\s]+/, '').trim());

          if (achievementsList.length > 0) {
            expStack.push({
              ul: achievementsList,
              fontSize: estilosPdf.logros.fontSize,
              color: estilosPdf.logros.color,
              margin: [estilosPdf.logros.spaceLeft, estilosPdf.logros.spaceBefore, 0, 0],
              lineHeight: estilosPdf.logros.lineHeight
            });
          }
        }
      }

      docContent.push({
        stack: expStack,
        unbreakable: true,
        margin: [0, idx === 0 ? 2 : estilosPdf.sectionHeader.spaceAfter, 0, 2]
      });
    });
  }

  // ── Educación ──
  const validEdus = cv.educacion?.filter(e => e.grado?.trim() || e.institucion?.trim()) || [];
  if (validEdus.length > 0) {
    docContent.push(
      { text: textEducacion, style: 'sectionHeader', margin: [0, 12, 0, 0] },
      {
        canvas: [
          { type: 'line', x1: 0, y1: 2, x2: 515, y2: 2, lineWidth: 0.5, lineColor: '#a0aec0' }
        ],
        margin: [0, 2, 0, estilosPdf.sectionHeader.spaceAfter]
      }
    );

    validEdus.forEach((edu, idx) => {
      const dateText = `${edu.inicio || ''} – ${edu.fin || ''}`;
      
      const eduStack = [];
      eduStack.push({
        columns: [
          {
            text: edu.grado || 'Grado / Certificación',
            bold: estilosPdf.puesto.bold,
            fontSize: estilosPdf.puesto.fontSize,
            width: '*'
          },
          {
            text: dateText,
            alignment: 'right',
            fontSize: estilosPdf.fecha.fontSize,
            color: estilosPdf.fecha.color,
            width: 'auto'
          }
        ],
        margin: [0, 0, 0, 2]
      });

      const subrowColumns = [];
      subrowColumns.push({
        text: edu.institucion || '',
        fontSize: estilosPdf.fecha.fontSize,
        color: '#4a5568',
        italic: true,
        width: '*'
      });
      if (edu.ubicacion) {
        subrowColumns.push({
          text: edu.ubicacion,
          fontSize: estilosPdf.ubicacion.fontSize,
          color: estilosPdf.ubicacion.color,
          italic: true,
          alignment: 'right',
          width: 'auto'
        });
      }
      eduStack.push({
        columns: subrowColumns,
        margin: [0, 0, 0, estilosPdf.ubicacion.spaceAfter]
      });

      docContent.push({
        stack: eduStack,
        unbreakable: true,
        margin: [0, idx === 0 ? 2 : estilosPdf.sectionHeader.spaceAfter, 0, 2]
      });
    });
  }

  // ── Certificaciones ──
  const validCerts = cv.certificaciones?.filter(c => c.nombre?.trim() || c.emisor?.trim()) || [];
  if (validCerts.length > 0) {
    const textCertificaciones = isEn ? 'Certifications' : 'Certificaciones';
    docContent.push(
      { text: textCertificaciones, style: 'sectionHeader', margin: [0, 12, 0, 0] },
      {
        canvas: [
          { type: 'line', x1: 0, y1: 2, x2: 515, y2: 2, lineWidth: 0.5, lineColor: '#a0aec0' }
        ],
        margin: [0, 2, 0, estilosPdf.sectionHeader.spaceAfter]
      }
    );

    validCerts.forEach((cert, idx) => {
      const certStack = [];
      certStack.push({
        columns: [
          {
            text: cert.nombre || 'Certificación',
            bold: estilosPdf.puesto.bold,
            fontSize: estilosPdf.puesto.fontSize,
            width: '*'
          },
          {
            text: cert.fecha || '',
            alignment: 'right',
            fontSize: estilosPdf.fecha.fontSize,
            color: estilosPdf.fecha.color,
            width: 'auto'
          }
        ],
        margin: [0, 0, 0, 2]
      });

      if (cert.emisor) {
        certStack.push({
          text: cert.emisor,
          fontSize: estilosPdf.fecha.fontSize,
          color: '#4a5568',
          italic: true,
          margin: [0, 0, 0, estilosPdf.ubicacion.spaceAfter]
        });
      }

      docContent.push({
        stack: certStack,
        unbreakable: true,
        margin: [0, idx === 0 ? 2 : estilosPdf.sectionHeader.spaceAfter, 0, 2]
      });
    });
  }

  // ── Proyectos Destacados ──
  const validProjs = cv.proyectos?.filter(p => p.nombre?.trim()) || [];
  if (validProjs.length > 0) {
    const textProyectos = isEn ? 'Featured Projects' : 'Proyectos Destacados';
    docContent.push(
      { text: textProyectos, style: 'sectionHeader', margin: [0, 12, 0, 0] },
      {
        canvas: [
          { type: 'line', x1: 0, y1: 2, x2: 515, y2: 2, lineWidth: 0.5, lineColor: '#a0aec0' }
        ],
        margin: [0, 2, 0, estilosPdf.sectionHeader.spaceAfter]
      }
    );

    validProjs.forEach((proj, idx) => {
      const projStack = [];
      projStack.push({
        columns: [
          {
            text: proj.nombre || 'Nombre del Proyecto',
            bold: estilosPdf.puesto.bold,
            fontSize: estilosPdf.puesto.fontSize,
            width: '*'
          },
          {
            text: proj.enlace || '',
            alignment: 'right',
            fontSize: estilosPdf.fecha.fontSize,
            color: estilosPdf.fecha.color,
            width: 'auto'
          }
        ],
        margin: [0, 0, 0, 2]
      });

      if (proj.descripcion) {
        projStack.push({
          text: proj.descripcion,
          fontSize: estilosPdf.bodyText.fontSize,
          color: estilosPdf.bodyText.color,
          margin: [0, 2, 0, 2]
        });
      }

      if (proj.tecnologias) {
        projStack.push({
          text: [
            { text: `${isEn ? 'Technologies' : 'Tecnologías'}: `, bold: true },
            { text: proj.tecnologias }
          ],
          fontSize: estilosPdf.ubicacion.fontSize,
          color: '#555555',
          margin: [0, 0, 0, estilosPdf.ubicacion.spaceAfter]
        });
      }

      docContent.push({
        stack: projStack,
        unbreakable: true,
        margin: [0, idx === 0 ? 2 : estilosPdf.sectionHeader.spaceAfter, 0, 2]
      });
    });
  }

  // ── Habilidades e Idiomas ──
  if (cv.skills || (cv.idiomas && cv.idiomas.length > 0)) {
    docContent.push(
      { text: textSkills, style: 'sectionHeader', margin: [0, 12, 0, 0] },
      {
        canvas: [
          { type: 'line', x1: 0, y1: 2, x2: 515, y2: 2, lineWidth: 0.5, lineColor: '#a0aec0' }
        ],
        margin: [0, 2, 0, estilosPdf.sectionHeader.spaceAfter]
      }
    );

    const skillsStack = [];
    if (cv.skills) {
      skillsStack.push({
        text: [
          { text: `${textSkillsLabel}: `, bold: true },
          { text: cv.skills }
        ],
        fontSize: estilosPdf.skills.fontSize,
        color: estilosPdf.skills.color,
        margin: [0, estilosPdf.skills.spaceBefore, 0, estilosPdf.skills.spaceAfter]
      });
    }

    if (cv.idiomas && cv.idiomas.length > 0) {
      skillsStack.push({
        text: [
          { text: `${textIdiomasLabel}: `, bold: true },
          { text: cv.idiomas.filter(Boolean).join(', ') }
        ],
        fontSize: estilosPdf.idiomas.fontSize,
        color: estilosPdf.idiomas.color,
        margin: [0, 0, 0, estilosPdf.idiomas.spaceAfter]
      });
    }

    docContent.push({
      stack: skillsStack,
      margin: [0, 2, 0, 0]
    });
  }

  // ── Definición del Documento de pdfmake ──
  const docDefinition = {
    content: docContent,
    pageMargins: estilosPdf.margenes,
    defaultStyle: {
      font: estilosPdf.fuenteDefault,
      lineHeight: estilosPdf.interlineado
    },
    styles: {
      name: { fontSize: estilosPdf.name.fontSize, bold: estilosPdf.name.bold, alignment: 'center', color: estilosPdf.name.color, margin: [0, 0, 0, estilosPdf.name.spaceAfter] },
      title: { fontSize: estilosPdf.title.fontSize, alignment: 'center', color: estilosPdf.title.color, margin: [0, 0, 0, estilosPdf.title.spaceAfter] },
      contact: { fontSize: estilosPdf.contact.fontSize, alignment: 'center', color: estilosPdf.contact.color, margin: [0, 0, 0, estilosPdf.contact.spaceAfter] },
      sectionHeader: { fontSize: estilosPdf.sectionHeader.fontSize, bold: estilosPdf.sectionHeader.bold, color: estilosPdf.sectionHeader.color, margin: [0, estilosPdf.sectionHeader.spaceBefore, 0, 0] },
      bodyText: { fontSize: estilosPdf.bodyText.fontSize, color: estilosPdf.bodyText.color }
    }
  };

  const filename = `${(cv.nombre || 'CV_ATS').replace(/\s+/g, '_')}_CV_ATS.pdf`;

  // Generar y descargar el PDF
  try {
    window.pdfMake.createPdf(docDefinition).download(filename);
  } catch (err) {
    console.error('Error al generar PDF vectorial con pdfMake:', err);
    // Fallback nativo
    window.print();
  }
};

export const imprimirPdf = () => {
  window.print();
};
