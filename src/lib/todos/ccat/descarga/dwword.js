// src/lib/todos/ccat/descarga/dwword.js
// Exportador de reporte CCAT en formato Word (.docx) nativo con docx.js

export const descargarDocxReporte = async (results, lang = 'es') => {
  if (!results) return;

  // Cargar biblioteca docx si no está en el cliente
  if (!window.docx) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/docx@7.8.2/build/index.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  const { Document, Packer, Paragraph, TextRun, AlignmentType, Table, TableRow, TableCell, WidthType } = window.docx;
  const isEn = lang === 'en';

  const children = [];

  // Título
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 100 },
      children: [
        new TextRun({
          text: isEn ? 'CCAT SIMULATOR PRACTICE REPORT' : 'REPORTE DE SIMULADOR CCAT',
          bold: true,
          size: 32,
          font: 'Arial',
          color: '6d28d9'
        })
      ]
    })
  );

  // Subtítulo
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 200 },
      children: [
        new TextRun({
          text: `WORKWII — ${new Date().toLocaleString()}`,
          size: 18,
          font: 'Arial',
          color: '666666'
        })
      ]
    })
  );

  // Resumen de puntajes
  children.push(
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 200, after: 100 },
      children: [
        new TextRun({ text: `${isEn ? 'Correct Answers' : 'Respuestas Correctas'}: `, bold: true, font: 'Arial' }),
        new TextRun({ text: `${results.score} / 50\n`, font: 'Arial' }),
        new TextRun({ text: `${isEn ? 'Estimated Percentile' : 'Percentil Estimado'}: `, bold: true, font: 'Arial' }),
        new TextRun({ text: `${results.percentile}%\n`, font: 'Arial' })
      ]
    })
  );

  // Separador
  children.push(new Paragraph({ spacing: { before: 100, after: 100 } }));

  // Encabezado de Desglose
  children.push(
    new Paragraph({
      spacing: { before: 100, after: 100 },
      children: [
        new TextRun({ text: isEn ? 'Category Performance:' : 'Rendimiento por Categoría:', bold: true, size: 24, font: 'Arial', color: '111111' })
      ]
    })
  );

  // Desglose por categoría
  const cats = [
    { name: isEn ? 'Verbal Reasoning' : 'Razonamiento Verbal', key: 'verbal' },
    { name: isEn ? 'Numerical Reasoning' : 'Razonamiento Numérico', key: 'numerical' },
    { name: isEn ? 'Spatial Reasoning' : 'Razonamiento Espacial', key: 'spatial' }
  ];

  cats.forEach(c => {
    const stats = results.categories[c.key] || { correct: 0, total: 0 };
    const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    children.push(
      new Paragraph({
        bullet: { level: 0 },
        children: [
          new TextRun({ text: `${c.name}: `, bold: true, font: 'Arial' }),
          new TextRun({ text: `${stats.correct} / ${stats.total} (${pct}%)`, font: 'Arial' })
        ]
      })
    );
  });

  // Espaciador
  children.push(new Paragraph({ spacing: { before: 200, after: 200 } }));

  // Encabezado de Preguntas
  children.push(
    new Paragraph({
      spacing: { before: 100, after: 100 },
      children: [
        new TextRun({ text: isEn ? 'Question Review Details:' : 'Detalles de Revisión de Preguntas:', bold: true, size: 24, font: 'Arial', color: '111111' })
      ]
    })
  );

  // Preguntas paso a paso
  results.answers.forEach((ans, idx) => {
    const statusText = ans.isCorrect 
      ? (isEn ? 'Correct' : 'Correcto') 
      : ans.isSkipped 
        ? (isEn ? 'Skipped' : 'Omitido') 
        : (isEn ? 'Incorrect' : 'Incorrecto');

    const statusColor = ans.isCorrect ? '16a34a' : ans.isSkipped ? '666666' : 'ef4444';

    children.push(
      new Paragraph({
        spacing: { before: 200, after: 50 },
        children: [
          new TextRun({ text: `${idx + 1}. `, bold: true, font: 'Arial' }),
          new TextRun({ text: ans.questionText, bold: true, font: 'Arial' }),
          new TextRun({ text: `  [${statusText}]`, bold: true, font: 'Arial', color: statusColor })
        ]
      })
    );

    // Opciones
    ans.options.forEach((opt, optIdx) => {
      const letter = String.fromCharCode(65 + optIdx);
      let optTextSuffix = '';
      let isBoldOpt = false;
      let optColor = '000000';

      if (optIdx === ans.correctAnswerIndex) {
        optTextSuffix = ` (${isEn ? 'Correct' : 'Correcto'})`;
        isBoldOpt = true;
        optColor = '16a34a';
      } else if (optIdx === ans.userAnswerIndex) {
        optTextSuffix = ` (${isEn ? 'Your Choice' : 'Tu Selección'})`;
        isBoldOpt = true;
        optColor = 'ef4444';
      }

      children.push(
        new Paragraph({
          spacing: { left: 400, before: 30, after: 30 },
          children: [
            new TextRun({ text: `${letter}. ${opt}${optTextSuffix}`, bold: isBoldOpt, color: optColor, font: 'Arial' })
          ]
        })
      );
    });

    // Explicación
    children.push(
      new Paragraph({
        spacing: { left: 400, before: 100, after: 150 },
        children: [
          new TextRun({ text: `${isEn ? 'Explanation' : 'Explicación'}: `, bold: true, font: 'Arial', color: '6d28d9' }),
          new TextRun({ text: ans.explanation, font: 'Arial', italics: true, color: '555555' })
        ]
      })
    );
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `ccat_simulador_reporte_${new Date().toISOString().slice(0, 10)}.docx`;
  document.body.appendChild(a);
  a.click();
  
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
