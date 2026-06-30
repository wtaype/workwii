// src/lib/analisar/descarga/dwdocx.js
// Exportador de Reporte ATS en formato Microsoft Word (.docx) nativo estructurado

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

export const descargarDocxReporte = async (report, lang = 'es') => {
  if (!report) return;
  if (!window.docx) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/docx@7.8.2/build/index.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType } = window.docx;
  const isEn = lang === 'en';
  const score = report.score || 0;

  const docElements = [];

  // 1. Título principal
  docElements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 100 },
      children: [
        new TextRun({
          text: isEn ? 'ATS COMPATIBILITY REPORT' : 'REPORTE DE COMPATIBILIDAD ATS',
          bold: true,
          size: 32,
          font: 'Arial',
          color: '6d28d9'
        })
      ]
    })
  );

  // Subtítulo
  docElements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 200 },
      children: [
        new TextRun({
          text: `WORKWII — ${new Date().toLocaleDateString()}`,
          size: 18,
          font: 'Arial',
          color: '666666'
        })
      ]
    })
  );

  // 2. Score de Match
  const label = score >= 90 
    ? (isEn ? 'Excellent Match' : 'Excelente Match') 
    : score >= 75 
      ? (isEn ? 'Good Match' : 'Buen Match') 
      : score >= 50 
        ? (isEn ? 'Average Match' : 'Match Regular') 
        : (isEn ? 'Low Match' : 'Coincidencia Baja');

  docElements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 300 },
      children: [
        new TextRun({
          text: `${isEn ? 'Score Match' : 'Puntaje de Match'}: ${score}% (${label})`,
          bold: true,
          size: 26,
          font: 'Arial',
          color: score >= 75 ? '10b981' : score >= 50 ? 'f59e0b' : 'ef4444'
        })
      ]
    })
  );

  // 3. Diagnóstico
  docElements.push(
    new Paragraph({
      spacing: { before: 200, after: 100 },
      children: [
        new TextRun({ text: isEn ? 'Diagnosis:' : 'Diagnóstico:', bold: true, size: 24, font: 'Arial', color: '111111' })
      ]
    })
  );
  docElements.push(
    new Paragraph({
      spacing: { before: 0, after: 300 },
      children: [
        new TextRun({ text: report.summary || '', size: 21, font: 'Arial', color: '333333' })
      ]
    })
  );

  // 4. Lo que el ATS vio en el CV
  docElements.push(
    new Paragraph({
      spacing: { before: 200, after: 100 },
      children: [
        new TextRun({ text: isEn ? 'What the ATS saw in your CV:' : 'Lo que el ATS "vio" en tu CV:', bold: true, size: 24, font: 'Arial', color: '6d28d9' })
      ]
    })
  );

  const profile = report.detectedProfile || {};
  const addProfileField = (field, val) => {
    docElements.push(
      new Paragraph({
        bullet: { level: 0 },
        spacing: { before: 40, after: 40 },
        children: [
          new TextRun({ text: `${field}: `, bold: true, size: 20, font: 'Arial' }),
          new TextRun({ text: String(isValidValue(val) ? val : '—'), size: 20, font: 'Arial' })
        ]
      })
    );
  };

  addProfileField(isEn ? 'Full Name' : 'Nombre Completo', profile.fullName);
  addProfileField(isEn ? 'Email' : 'Correo electrónico', profile.email);
  addProfileField(isEn ? 'Phone' : 'Teléfono', profile.phone);
  addProfileField('LinkedIn', profile.linkedin);
  addProfileField(isEn ? 'Job Title' : 'Puesto / Título', profile.currentTitle);
  addProfileField(isEn ? 'Current Company' : 'Empresa actual', profile.currentCompany);
  addProfileField(isEn ? 'Education Level' : 'Nivel educativo', profile.educationLevel);
  addProfileField(isEn ? 'Estimated Exp.' : 'Años de exp. estimados', profile.estimatedYearsExp != null && String(profile.estimatedYearsExp).toLowerCase().trim() !== 'null' ? `${profile.estimatedYearsExp} ${isEn ? 'years' : 'años'}` : null);
  addProfileField(isEn ? 'Total Words' : 'Total palabras', profile.totalWords);
  addProfileField(isEn ? 'Estimated Pages' : 'Páginas estimadas', profile.estimatedPages);
  addProfileField(isEn ? 'Sections Found' : 'Secciones reconocidas', (profile.sectionsFound || []).join(', '));

  docElements.push(new Paragraph({ spacing: { before: 0, after: 200 } }));

  // 5. Calidad del Lenguaje
  const lq = report.languageQuality || {};
  docElements.push(
    new Paragraph({
      spacing: { before: 200, after: 100 },
      children: [
        new TextRun({ text: isEn ? 'Language Quality:' : 'Calidad del Lenguaje:', bold: true, size: 24, font: 'Arial', color: '6d28d9' })
      ]
    })
  );
  docElements.push(
    new Paragraph({
      bullet: { level: 0 },
      children: [
        new TextRun({ text: `${isEn ? 'Action Verbs Found' : 'Verbos de Acción Encontrados'}: `, bold: true, size: 20, font: 'Arial' }),
        new TextRun({ text: (lq.actionVerbsFound || []).join(', ') || '—', size: 20, font: 'Arial' })
      ]
    })
  );
  docElements.push(
    new Paragraph({
      bullet: { level: 0 },
      children: [
        new TextRun({ text: `${isEn ? 'Action Verbs Missing' : 'Verbos de Acción Faltantes'}: `, bold: true, size: 20, font: 'Arial' }),
        new TextRun({ text: (lq.actionVerbsMissing || []).join(', ') || '—', size: 20, font: 'Arial' })
      ]
    })
  );
  docElements.push(
    new Paragraph({
      bullet: { level: 0 },
      children: [
        new TextRun({ text: `${isEn ? 'Quantified Achievements' : 'Logros Cuantificados'}: `, bold: true, size: 20, font: 'Arial' }),
        new TextRun({ text: String(lq.quantifiedAchievements || 0), size: 20, font: 'Arial' })
      ]
    })
  );
  docElements.push(
    new Paragraph({
      bullet: { level: 0 },
      children: [
        new TextRun({ text: `${isEn ? 'Keyword Density' : 'Densidad de Palabras Clave'}: `, bold: true, size: 20, font: 'Arial' }),
        new TextRun({ text: String(lq.keywordDensity || '—'), size: 20, font: 'Arial' })
      ]
    })
  );

  docElements.push(new Paragraph({ spacing: { before: 0, after: 200 } }));

  // 6. Keywords
  docElements.push(
    new Paragraph({
      spacing: { before: 200, after: 100 },
      children: [
        new TextRun({ text: isEn ? 'Keywords:' : 'Palabras Clave:', bold: true, size: 24, font: 'Arial', color: '6d28d9' })
      ]
    })
  );
  docElements.push(
    new Paragraph({
      spacing: { before: 40, after: 40 },
      children: [
        new TextRun({ text: `${isEn ? 'Missing Keywords (Recommended to add)' : 'Palabras clave faltantes (Recomendado agregar)'}:\n`, bold: true, size: 20, font: 'Arial', color: 'ef4444' }),
        new TextRun({ text: (report.missingKeywords || []).join(', ') || '—', size: 20, font: 'Arial' })
      ]
    })
  );
  docElements.push(
    new Paragraph({
      spacing: { before: 40, after: 100 },
      children: [
        new TextRun({ text: `${isEn ? 'Matched Keywords (Found)' : 'Palabras clave encontradas'}:\n`, bold: true, size: 20, font: 'Arial', color: '10b981' }),
        new TextRun({ text: (report.matchedKeywords || []).join(', ') || '—', size: 20, font: 'Arial' })
      ]
    })
  );

  docElements.push(new Paragraph({ spacing: { before: 0, after: 200 } }));

  // 7. Plan de Acción (Tabla)
  docElements.push(
    new Paragraph({
      spacing: { before: 200, after: 150 },
      children: [
        new TextRun({ text: isEn ? 'Action Plan (Quick Recommendations):' : 'Plan de Acción (Recomendaciones Rápidas):', bold: true, size: 24, font: 'Arial', color: '6d28d9' })
      ]
    })
  );

  const tableHeaderCell = (text) => new TableCell({
    width: { size: 25, type: WidthType.PERCENTAGE },
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 20, font: 'Arial', color: 'ffffff' })], alignment: AlignmentType.CENTER })],
    shading: { fill: '6d28d9' }
  });

  const tableHeaderCellWide = (text) => new TableCell({
    width: { size: 50, type: WidthType.PERCENTAGE },
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 20, font: 'Arial', color: 'ffffff' })] })],
    shading: { fill: '6d28d9' }
  });

  const tableCell = (text, isCenter = false, isBold = false) => new TableCell({
    width: { size: 25, type: WidthType.PERCENTAGE },
    children: [new Paragraph({ children: [new TextRun({ text, size: 19, font: 'Arial', bold: isBold })], alignment: isCenter ? AlignmentType.CENTER : AlignmentType.LEFT })]
  });

  const tableCellWide = (text) => new TableCell({
    width: { size: 50, type: WidthType.PERCENTAGE },
    children: [new Paragraph({ children: [new TextRun({ text, size: 19, font: 'Arial' })] })]
  });

  const tableRows = [
    new TableRow({
      children: [
        tableHeaderCell(isEn ? 'Priority' : 'Prioridad'),
        tableHeaderCell(isEn ? 'Section' : 'Sección'),
        tableHeaderCellWide(isEn ? 'Recommendation' : 'Recomendación'),
        tableHeaderCell(isEn ? 'Time' : 'Tiempo')
      ]
    })
  ];

  if (report.recommendations && report.recommendations.length > 0) {
    report.recommendations.forEach(rec => {
      tableRows.push(
        new TableRow({
          children: [
            tableCell(rec.priority || 'ALTA', true, true),
            tableCell(rec.section || '', false, true),
            tableCellWide(rec.advice || ''),
            tableCell(rec.estimatedMinutes ? `~${rec.estimatedMinutes} min` : '—', true)
          ]
        })
      );
    });
  }

  docElements.push(new Table({ rows: tableRows }));

  docElements.push(new Paragraph({ spacing: { before: 0, after: 200 } }));

  // 8. Advertencias de Formato
  if (report.atsWarnings && report.atsWarnings.length > 0) {
    docElements.push(
      new Paragraph({
        spacing: { before: 200, after: 100 },
        children: [
          new TextRun({ text: isEn ? 'ATS Format Warnings:' : 'Advertencias de Formato ATS:', bold: true, size: 24, font: 'Arial', color: 'ef4444' })
        ]
      })
    );
    report.atsWarnings.forEach(warn => {
      docElements.push(
        new Paragraph({
          bullet: { level: 0 },
          children: [
            new TextRun({ text: warn, size: 20, font: 'Arial', color: 'ef4444' })
          ]
        })
      );
    });
  }

  // Packer & Download
  const doc = new Document({
    sections: [{
      children: docElements
    }]
  });

  Packer.toBlob(doc).then(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_ATS_Workwii_${score}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
};
