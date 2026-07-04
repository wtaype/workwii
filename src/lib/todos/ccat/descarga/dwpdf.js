// src/lib/todos/ccat/descarga/dwpdf.js
// Exportador de reporte CCAT en PDF vectorial premium con pdfMake

export const descargarPdfReporte = async (results, lang = 'es') => {
  if (!results) return;

  // Cargar pdfMake y vfs_fonts si no están cargados
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

  const isEn = lang === 'en';
  const score = results.score || 0;
  const percentile = results.percentile || 0;

  // Color principal (púrpura de Workwii)
  const primaryColor = '#6d28d9';
  const textColor = '#1f2937';
  const correctColor = '#16a34a';
  const incorrectColor = '#dc2626';

  const docDefinition = {
    content: [
      // Encabezado
      {
        text: isEn ? 'CCAT PRACTICE TEST REPORT' : 'REPORTE DE SIMULADOR CCAT',
        style: 'header',
        alignment: 'center'
      },
      {
        text: `WORKWII — ${new Date().toLocaleString()}`,
        style: 'subheader',
        alignment: 'center'
      },
      { text: '', margin: [0, 10] },

      // Tarjetas de Resumen
      {
        columns: [
          {
            width: '50%',
            style: 'summaryCard',
            text: [
              { text: (isEn ? 'Correct Answers' : 'Respuestas Correctas') + '\n', bold: true, fontSize: 12, color: '#666666' },
              { text: `${score} / 50\n`, fontSize: 32, bold: true, color: primaryColor },
              { text: isEn ? 'out of 50 total questions' : 'de un total de 50 preguntas', fontSize: 9, color: '#888888' }
            ]
          },
          {
            width: '50%',
            style: 'summaryCard',
            text: [
              { text: (isEn ? 'Estimated Percentile' : 'Percentil Estimado') + '\n', bold: true, fontSize: 12, color: '#666666' },
              { text: `${percentile}%\n`, fontSize: 32, bold: true, color: '#2563eb' },
              { text: isEn ? 'compared to global norm' : 'comparado con la norma global', fontSize: 9, color: '#888888' }
            ]
          }
        ],
        columnGap: 15
      },
      { text: '', margin: [0, 15] },

      // Desglose por categorías
      { text: isEn ? 'Category Breakdown' : 'Rendimiento por Categoría', style: 'sectionHeader' },
      {
        table: {
          widths: ['50%', '25%', '25%'],
          body: [
            [
              { text: isEn ? 'Category' : 'Categoría', style: 'tableHeader' },
              { text: isEn ? 'Correct' : 'Correctas', style: 'tableHeader', alignment: 'center' },
              { text: isEn ? 'Percentage' : 'Porcentaje', style: 'tableHeader', alignment: 'center' }
            ],
            [
              { text: isEn ? 'Verbal Reasoning' : 'Razonamiento Verbal', style: 'tableCell' },
              { text: `${results.categories.verbal.correct} / ${results.categories.verbal.total}`, style: 'tableCell', alignment: 'center' },
              { text: `${Math.round((results.categories.verbal.correct / results.categories.verbal.total) * 100)}%`, style: 'tableCell', alignment: 'center' }
            ],
            [
              { text: isEn ? 'Numerical Reasoning' : 'Razonamiento Numérico', style: 'tableCell' },
              { text: `${results.categories.numerical.correct} / ${results.categories.numerical.total}`, style: 'tableCell', alignment: 'center' },
              { text: `${Math.round((results.categories.numerical.correct / results.categories.numerical.total) * 100)}%`, style: 'tableCell', alignment: 'center' }
            ],
            [
              { text: isEn ? 'Spatial Reasoning' : 'Razonamiento Espacial', style: 'tableCell' },
              { text: `${results.categories.spatial.correct} / ${results.categories.spatial.total}`, style: 'tableCell', alignment: 'center' },
              { text: `${Math.round((results.categories.spatial.correct / results.categories.spatial.total) * 100)}%`, style: 'tableCell', alignment: 'center' }
            ]
          ]
        },
        layout: 'lightHorizontalLines'
      },
      { text: '', margin: [0, 20] },

      // Desglose de preguntas
      { text: isEn ? 'Detailed Question Review' : 'Revisión Detallada de Preguntas', style: 'sectionHeader', pageBreak: 'before' }
    ],
    styles: {
      header: {
        fontSize: 22,
        bold: true,
        color: primaryColor,
        margin: [0, 0, 0, 5]
      },
      subheader: {
        fontSize: 10,
        color: '#666666',
        margin: [0, 0, 0, 10]
      },
      summaryCard: {
        background: '#f9fafb',
        padding: 15,
        borderRadius: 8,
        borderColor: '#e5e7eb',
        borderWidth: 1
      },
      sectionHeader: {
        fontSize: 15,
        bold: true,
        color: primaryColor,
        margin: [0, 10, 0, 10]
      },
      tableHeader: {
        bold: true,
        fontSize: 10,
        color: '#ffffff',
        fillColor: primaryColor,
        margin: [8, 6, 8, 6]
      },
      tableCell: {
        fontSize: 10,
        margin: [8, 6, 8, 6]
      },
      questionTitle: {
        fontSize: 11,
        bold: true,
        margin: [0, 10, 0, 5]
      },
      optionText: {
        fontSize: 9.5,
        margin: [15, 2, 0, 2]
      },
      explanationBox: {
        fontSize: 9,
        italics: true,
        color: '#4b5563',
        background: '#f3e8ff',
        margin: [15, 5, 0, 10],
        padding: 8
      }
    }
  };

  // Agregar preguntas dinámicamente al contenido
  results.answers.forEach((ans, idx) => {
    const statusText = ans.isCorrect
      ? `[${isEn ? 'Correct' : 'Correcto'}]`
      : ans.isSkipped
        ? `[${isEn ? 'Skipped' : 'Omitido'}]`
        : `[${isEn ? 'Incorrect' : 'Incorrecto'}]`;

    const statusColor = ans.isCorrect
      ? correctColor
      : ans.isSkipped
        ? '#6b7280'
        : incorrectColor;

    docDefinition.content.push({
      text: [
        { text: `${idx + 1}. `, bold: true, color: primaryColor },
        { text: ans.questionText + ' ', bold: true, color: textColor },
        { text: statusText, bold: true, color: statusColor }
      ],
      style: 'questionTitle'
    });

    // Opciones
    ans.options.forEach((opt, optIdx) => {
      const letter = String.fromCharCode(65 + optIdx);
      let optColor = '#1f2937';
      let isBoldOpt = false;
      let suffix = '';

      if (optIdx === ans.correctAnswerIndex) {
        optColor = correctColor;
        isBoldOpt = true;
        suffix = ` (${isEn ? 'Correct' : 'Correcta'})`;
      } else if (optIdx === ans.userAnswerIndex) {
        optColor = incorrectColor;
        isBoldOpt = true;
        suffix = ` (${isEn ? 'Your Choice' : 'Tu Selección'})`;
      }

      docDefinition.content.push({
        text: `${letter}. ${opt}${suffix}`,
        style: 'optionText',
        color: optColor,
        bold: isBoldOpt
      });
    });

    // Explicación
    docDefinition.content.push({
      text: [
        { text: (isEn ? 'Explanation: ' : 'Explicación: '), bold: true, color: primaryColor },
        { text: ans.explanation }
      ],
      style: 'explanationBox'
    });
  });

  pdfMake.createPdf(docDefinition).download(`ccat_simulador_reporte_${new Date().toISOString().slice(0, 10)}.pdf`);
};
