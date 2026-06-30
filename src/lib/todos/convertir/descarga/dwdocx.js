/**
 * Genera y descarga el currículum en formato Microsoft Word (.docx) nativo.
 * Utiliza la librería docx.js desde CDN para crear un archivo binario válido.
 * Garantiza tablas sin bordes ni cuadrículas para una presentación ATS limpia.
 * 
 * @param {object} cv - Objeto con los datos estructurados del currículum.
 */
export const descargarDocx = async (cv) => {
  if (!window.docx) {
    // Carga dinámica de docx.js desde jsDelivr
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/docx@7.8.2/build/index.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, WidthType, AlignmentType } = window.docx;

  const isEn = cv.idioma === 'en';

  // Cabeceras de sección dinámicas según el idioma
  const textPerfil = isEn ? 'Professional Summary' : 'Perfil Profesional';
  const textExperiencia = isEn ? 'Work Experience' : 'Experiencia Laboral';
  const textEducacion = isEn ? 'Education' : 'Educación';
  const textSkills = isEn ? 'Skills & Languages' : 'Habilidades e Idiomas';
  const textSkillsLabel = isEn ? 'Skills' : 'Habilidades';
  const textIdiomasLabel = isEn ? 'Languages' : 'Idiomas';
  const textPresente = isEn ? 'Present' : 'Presente';

  // Colección de elementos del documento
  const docElements = [];

  // 1. Nombre (Centrado, Grande, Negrita)
  docElements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 60 },
      children: [
        new TextRun({
          text: cv.nombre || 'Currículum Vitae',
          bold: true,
          size: 40, // 20pt
          font: 'Arial',
          color: '111111'
        })
      ]
    })
  );

  // 2. Cargo / Título Profesional
  if (cv.titulo) {
    docElements.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 120 },
        children: [
          new TextRun({
            text: cv.titulo.toUpperCase(),
            bold: true,
            size: 23, // 11.5pt
            font: 'Arial',
            color: '444444'
          })
        ]
      })
    );
  }

  // 3. Información de Contacto (Centrada, separada por barras)
  const contactParts = [];
  if (cv.email) contactParts.push(cv.email);
  if (cv.telefono) contactParts.push(cv.telefono);
  if (cv.ubicacion) contactParts.push(cv.ubicacion);
  if (cv.linkedin) contactParts.push(cv.linkedin);
  if (cv.web) contactParts.push(cv.web);

  docElements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 360 }, // Espacio mayor antes del perfil
      children: [
        new TextRun({
          text: contactParts.join('   |   '),
          size: 19, // 9.5pt
          font: 'Arial',
          color: '555555'
        })
      ]
    })
  );

  // Helper para generar títulos de secciones con borde inferior sólido (línea divisoria)
  const createSectionHeading = (titleText) => {
    return new Paragraph({
      spacing: { before: 360, after: 160 },
      border: {
        bottom: {
          color: '222222',
          space: 4,
          style: BorderStyle.SINGLE,
          size: 12 // 1.5 pt
        }
      },
      children: [
        new TextRun({
          text: titleText.toUpperCase(),
          bold: true,
          size: 22, // 11pt
          font: 'Arial',
          color: '111111'
        })
      ]
    });
  };

  // 4. Perfil Profesional
  if (cv.resumen) {
    docElements.push(createSectionHeading(textPerfil));
    docElements.push(
      new Paragraph({
        alignment: AlignmentType.JUSTIFY,
        spacing: { before: 0, after: 120, line: 288 }, // 1.2 interlineado
        children: [
          new TextRun({
            text: cv.resumen,
            size: 21, // 10.5pt
            font: 'Arial',
            color: '333333'
          })
        ]
      })
    );
  }

  // Helper para generar celdas sin bordes (Para evitar gridlines raros en Word)
  const getBorderlessCell = (contentParagraph, widthPct) => {
    return new TableCell({
      width: { size: widthPct, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE }
      },
      children: [contentParagraph]
    });
  };

  // 5. Experiencia Laboral
  if (cv.experiencias && cv.experiencias.length > 0) {
    docElements.push(createSectionHeading(textExperiencia));

    cv.experiencias.forEach((exp) => {
      const textParts = [
        new TextRun({
          text: (exp.puesto || '').toUpperCase(),
          bold: true,
          size: 21,
          font: 'Arial',
          color: '111111'
        })
      ];

      if (exp.empresa) {
        textParts.push(
          new TextRun({
            text: `   |   ${exp.empresa}`,
            bold: true,
            size: 20,
            font: 'Arial',
            color: '333333'
          })
        );
      }

      if (exp.ubicacion) {
        textParts.push(
          new TextRun({
            text: `   |   ${exp.ubicacion}`,
            italic: true,
            size: 20,
            font: 'Arial',
            color: '555555'
          })
        );
      }

      docElements.push(
        new Paragraph({
          spacing: { before: 120, after: 40 },
          children: textParts
        })
      );

      // Fechas en la siguiente línea
      docElements.push(
        new Paragraph({
          spacing: { before: 0, after: 120 },
          children: [
            new TextRun({
              text: `${exp.inicio || ''} – ${exp.fin || textPresente}`,
              bold: true,
              italic: true,
              size: 19,
              font: 'Arial',
              color: '666666'
            })
          ]
        })
      );

      if (exp.logros) {
        exp.logros.split('\n').forEach((logro) => {
          const cleanLogro = logro.trim().replace(/^[-\*\•\s]+/, '');
          if (cleanLogro) {
            docElements.push(
              new Paragraph({
                bullet: { level: 0 },
                spacing: { before: 60, after: 60, line: 240 },
                children: [
                  new TextRun({
                    text: cleanLogro,
                    size: 20,
                    font: 'Arial',
                    color: '333333'
                  })
                ]
              })
            );
          }
        });
      }

      docElements.push(new Paragraph({ spacing: { before: 0, after: 120 } }));
    });
  }

  // 6. Educación
  if (cv.educacion && cv.educacion.length > 0) {
    docElements.push(createSectionHeading(textEducacion));

    cv.educacion.forEach((edu) => {
      const textParts = [
        new TextRun({
          text: edu.grado || '',
          bold: true,
          size: 21,
          font: 'Arial',
          color: '111111'
        })
      ];

      if (edu.institucion) {
        textParts.push(
          new TextRun({
            text: `   |   ${edu.institucion}`,
            bold: true,
            size: 20,
            font: 'Arial',
            color: '333333'
          })
        );
      }

      if (edu.ubicacion) {
        textParts.push(
          new TextRun({
            text: `   |   ${edu.ubicacion}`,
            italic: true,
            size: 20,
            font: 'Arial',
            color: '555555'
          })
        );
      }

      docElements.push(
        new Paragraph({
          spacing: { before: 120, after: 40 },
          children: textParts
        })
      );

      // Fechas en la siguiente línea
      docElements.push(
        new Paragraph({
          spacing: { before: 0, after: 120 },
          children: [
            new TextRun({
              text: `${edu.inicio || ''} – ${edu.fin || ''}`,
              bold: true,
              italic: true,
              size: 19,
              font: 'Arial',
              color: '666666'
            })
          ]
        })
      );

      docElements.push(new Paragraph({ spacing: { before: 0, after: 120 } }));
    });
  }

  // 7. Habilidades e Idiomas
  if (cv.skills) {
    docElements.push(createSectionHeading(textSkills));

    const skillRuns = [
      new TextRun({ text: `${textSkillsLabel}: `, bold: true, size: 20, font: 'Arial', color: '111111' }),
      new TextRun({ text: cv.skills, size: 20, font: 'Arial', color: '333333' })
    ];

    docElements.push(
      new Paragraph({
        spacing: { before: 60, after: 60, line: 240 },
        children: skillRuns
      })
    );

    if (cv.idiomas && cv.idiomas.length > 0) {
      const languageRuns = [
        new TextRun({ text: `${textIdiomasLabel}: `, bold: true, size: 20, font: 'Arial', color: '111111' }),
        new TextRun({ text: cv.idiomas.filter(Boolean).join(', '), size: 20, font: 'Arial', color: '333333' })
      ];

      docElements.push(
        new Paragraph({
          spacing: { before: 60, after: 60, line: 240 },
          children: languageRuns
        })
      );
    }
  }

  // Documento principal estructurado en secciones con márgenes de 1 pulgada
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 pulgada en twips
              bottom: 1440,
              left: 1440,
              right: 1440
            }
          }
        },
        children: docElements
      }
    ]
  });

  // Empaquetado y descarga del archivo .docx binario real
  Packer.toBlob(doc).then((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(cv.nombre || 'CV_ATS').replace(/\s+/g, '_')}_CV_ATS.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }).catch((err) => {
    console.error('Error al empaquetar .docx nativo:', err);
    Notificacion('No se pudo generar el archivo Word nativo.', 'error');
  });
};
