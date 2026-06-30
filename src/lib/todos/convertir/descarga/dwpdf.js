// src/lib/convertir/descarga/dwpdf.js
// Exportador de Currículum estructurado en formato PDF Vectorial Premium con pdfmake (Estilo Harvard de una sola columna)

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

export const descargarPdfDirecto = async (cv) => {
  if (!cv) return;

  // Cargar pdfMake y fuentes si no existen en el cliente
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
  
  // Traducciones
  const textPerfil = isEn ? 'Professional Summary' : 'Perfil Profesional';
  const textExperiencia = isEn ? 'Work Experience' : 'Experiencia Laboral';
  const textEducacion = isEn ? 'Education' : 'Educación';
  const textSkills = isEn ? 'Skills & Languages' : 'Habilidades e Idiomas';
  const textSkillsLabel = isEn ? 'Skills' : 'Habilidades';
  const textIdiomasLabel = isEn ? 'Languages' : 'Idiomas';
  const textPresente = isEn ? 'Present' : 'Presente';

  const content = [];

  // 1. Cabecera (Nombre y Título)
  content.push({ text: cv.nombre || 'Currículum Vitae', style: 'nameHeader', alignment: 'center' });
  if (cv.titulo) {
    content.push({ text: String(cv.titulo).toUpperCase(), style: 'titleHeader', alignment: 'center' });
  }

  // 2. Datos de contacto en una sola línea (Separados por barras)
  const contactItems = [];
  if (isValidValue(cv.email)) {
    contactItems.push({ text: cv.email, link: `mailto:${cv.email}`, color: '#4b5563', decoration: 'underline' });
  }
  if (isValidValue(cv.telefono)) {
    contactItems.push({ text: cv.telefono });
  }
  if (isValidValue(cv.ubicacion)) {
    contactItems.push({ text: cv.ubicacion });
  }
  if (isValidValue(cv.linkedin)) {
    contactItems.push({ text: 'LinkedIn', link: getHref(cv.linkedin), color: '#6d28d9', decoration: 'underline' });
  }
  if (isValidValue(cv.web)) {
    contactItems.push({ text: isEn ? 'Portfolio' : 'Portafolio', link: getHref(cv.web), color: '#6d28d9', decoration: 'underline' });
  }

  // Combinar con separador "  |  "
  const contactLine = [];
  contactItems.forEach((item, idx) => {
    contactLine.push(item);
    if (idx < contactItems.length - 1) {
      contactLine.push({ text: '   |   ', color: '#9ca3af' });
    }
  });

  content.push({ text: contactLine, fontSize: 9.5, color: '#4b5563', alignment: 'center', margin: [0, 6, 0, 15] });

  // Ayudante de cabecera de sección (Harvard style: Uppercase con línea inferior fina)
  const addSectionHeader = (title) => {
    content.push({
      stack: [
        { text: String(title).toUpperCase(), style: 'sectionHeader' },
        {
          canvas: [
            { type: 'line', x1: 0, y1: 2, x2: 515, y2: 2, lineWidth: 1, color: '#374151' }
          ]
        }
      ],
      margin: [0, 15, 0, 10],
      keepWithNext: true
    });
  };

  // 3. Perfil Profesional
  if (cv.resumen) {
    addSectionHeader(textPerfil);
    content.push({ text: cv.resumen, style: 'bodyText', alignment: 'justify' });
  }

  // 4. Experiencia Laboral
  const hasExp = cv.experiencias && cv.experiencias.some(exp => exp.puesto || exp.empresa);
  if (hasExp) {
    addSectionHeader(textExperiencia);
    cv.experiencias.forEach((exp) => {
      if (!exp.puesto && !exp.empresa) return;

      // Fila 1: Puesto (Negrita) e Inicio-Fin (Negrita/Cursiva, alineado a la derecha)
      content.push({
        columns: [
          { text: exp.puesto || '', bold: true, fontSize: 10.5, color: '#1f2937' },
          { text: `${exp.inicio || ''} – ${exp.fin || textPresente}`, bold: true, italic: true, fontSize: 9.5, color: '#4b5563', alignment: 'right' }
        ],
        margin: [0, 4, 0, 1],
        keepWithNext: true
      });

      // Fila 2: Empresa (Cursiva/Negrita) y Ubicación (Cursiva, alineada a la derecha)
      content.push({
        columns: [
          { text: exp.empresa || '', italic: true, bold: true, fontSize: 9.5, color: '#374151' },
          { text: exp.ubicacion || '', italic: true, fontSize: 9.5, color: '#6b7280', alignment: 'right' }
        ],
        margin: [0, 0, 0, 6],
        keepWithNext: true
      });

      // Logros en viñetas
      if (exp.logros) {
        const bulletPoints = exp.logros
          .split('\n')
          .map(line => line.trim().replace(/^-\s*/, ''))
          .filter(Boolean);

        if (bulletPoints.length > 0) {
          content.push({
            ul: bulletPoints.map(bp => ({ text: bp, style: 'bodyText' })),
            margin: [8, 0, 0, 10]
          });
        }
      }
    });
  }

  // 5. Educación
  if (cv.educacion && cv.educacion.length > 0) {
    addSectionHeader(textEducacion);
    cv.educacion.forEach((edu) => {
      if (!edu.institucion && !edu.grado) return;

      // Fila 1: Grado (Negrita) e Inicio-Fin (Negrita/Cursiva, alineado a la derecha)
      content.push({
        columns: [
          { text: edu.grado || '', bold: true, fontSize: 10.5, color: '#1f2937' },
          { text: `${edu.inicio || ''} – ${edu.fin || ''}`, bold: true, italic: true, fontSize: 9.5, color: '#4b5563', alignment: 'right' }
        ],
        margin: [0, 4, 0, 1],
        keepWithNext: true
      });

      // Fila 2: Institución y Ubicación
      content.push({
        columns: [
          { text: edu.institucion || '', italic: true, bold: true, fontSize: 9.5, color: '#374151' },
          { text: edu.ubicacion || '', italic: true, fontSize: 9.5, color: '#6b7280', alignment: 'right' }
        ],
        margin: [0, 0, 0, 8]
      });
    });
  }

  // 5b. Proyectos Destacados
  const hasProj = cv.proyectos && cv.proyectos.length > 0;
  if (hasProj) {
    const textProyectos = isEn ? 'Featured Projects' : 'Proyectos Destacados';
    addSectionHeader(textProyectos);
    cv.proyectos.forEach((proj) => {
      if (!proj.nombre && !proj.descripcion) return;

      // Fila 1: Nombre (Negrita) y Link (Alineado a la derecha)
      const projectRow = [
        { text: proj.nombre || '', bold: true, fontSize: 10.5, color: '#1f2937' }
      ];
      if (proj.link) {
        projectRow.push({ text: proj.link, link: getHref(proj.link), italic: true, fontSize: 9, color: '#6d28d9', alignment: 'right' });
      } else {
        projectRow.push({ text: '' });
      }

      content.push({
        columns: projectRow,
        margin: [0, 4, 0, 1],
        keepWithNext: true
      });

      // Fila 2: Tecnologías
      if (proj.tecnologias) {
        content.push({
          text: [
            { text: isEn ? 'Technologies: ' : 'Tecnologías: ', bold: true, fontSize: 9, color: '#374151' },
            { text: proj.tecnologias, fontSize: 9, color: '#4b5563' }
          ],
          margin: [0, 0, 0, 4],
          keepWithNext: true
        });
      }

      // Fila 3: Descripción
      if (proj.descripcion) {
        content.push({ text: proj.descripcion, style: 'bodyText', alignment: 'justify', margin: [0, 0, 0, 8] });
      }
    });
  }

  // 5c. Certificaciones
  const hasCert = cv.certificaciones && cv.certificaciones.length > 0;
  if (hasCert) {
    const textCertificaciones = isEn ? 'Certifications' : 'Certificaciones';
    addSectionHeader(textCertificaciones);
    cv.certificaciones.forEach((cert) => {
      if (!cert.nombre && !cert.emisor) return;

      // Fila 1: Nombre (Negrita) y Fecha (Alineado a la derecha)
      content.push({
        columns: [
          { text: cert.nombre || '', bold: true, fontSize: 10.5, color: '#1f2937' },
          { text: cert.fecha || '', bold: true, italic: true, fontSize: 9.5, color: '#4b5563', alignment: 'right' }
        ],
        margin: [0, 4, 0, 1],
        keepWithNext: true
      });

      // Fila 2: Emisor
      content.push({
        text: cert.emisor || '',
        italic: true,
        fontSize: 9.5,
        color: '#374151',
        margin: [0, 0, 0, 6]
      });
    });
  }

  // 6. Habilidades e Idiomas
  if (cv.skills) {
    addSectionHeader(textSkills);
    
    const skillList = [];
    skillList.push({ text: `${textSkillsLabel}: `, bold: true, fontSize: 10, color: '#1f2937' });
    skillList.push({ text: cv.skills, fontSize: 9.5, color: '#374151' });

    content.push({ text: skillList, margin: [0, 2, 0, 8] });

    if (cv.idiomas && cv.idiomas.length > 0) {
      const languageList = [];
      languageList.push({ text: `${textIdiomasLabel}: `, bold: true, fontSize: 10, color: '#1f2937' });
      languageList.push({ text: cv.idiomas.filter(Boolean).join(', '), fontSize: 9.5, color: '#374151' });

      content.push({ text: languageList, margin: [0, 2, 0, 8] });
    }
  }

  // Estilos del documento pdfmake
  const docDefinition = {
    content,
    pageMargins: [54, 54, 54, 54], // ~1 pulgada (72pt es una pulgada, pero 54pt es el estándar óptimo de márgenes en pdfmake)
    defaultStyle: {
      font: 'Roboto',
      lineHeight: 1.3
    },
    styles: {
      nameHeader: { fontSize: 21, bold: true, color: '#111111', margin: [0, 0, 0, 2] },
      titleHeader: { fontSize: 10.5, bold: true, color: '#4b5563', letterSpacing: 0.5, margin: [0, 0, 0, 4] },
      sectionHeader: { fontSize: 11, bold: true, color: '#111111', letterSpacing: 0.5 },
      bodyText: { fontSize: 9.5, color: '#374151', margin: [0, 0, 0, 3] }
    }
  };

  const filename = `${(cv.nombre || 'CV_ATS').replace(/\s+/g, '_')}_CV_ATS.pdf`;
  try {
    window.pdfMake.createPdf(docDefinition).download(filename);
  } catch (err) {
    console.error('Error pdfMake CV:', err);
    window.print();
  }
};

export const imprimirPdf = () => {
  window.print();
};
