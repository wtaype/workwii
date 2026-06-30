// src/lib/analisar/descarga/dwpdf.js
// Exportador de Reporte ATS en PDF Vectorial Premium con pdfmake

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

export const descargarPdfReporte = async (report, lang = 'es') => {
  if (!report) return;

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

  const isEn = lang === 'en';
  const score = report.score || 0;
  const colorScore = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  const label = score >= 90 
    ? (isEn ? 'Excellent Match' : 'Excelente Match') 
    : score >= 75 
      ? (isEn ? 'Good Match' : 'Buen Match') 
      : score >= 50 
        ? (isEn ? 'Average Match' : 'Match Regular') 
        : (isEn ? 'Low Match' : 'Coincidencia Baja');

  // Fecha completa con horas y segundos
  const now = new Date();
  const fechaCompleta = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;

  const content = [];
  const profile = report.detectedProfile || {};

  // Cabecera Principal (Nombre del candidato en grande y título de reporte arriba)
  content.push({ text: isEn ? 'WORKWII - ATS COMPATIBILITY REPORT' : 'WORKWII - REPORTE DE COMPATIBILIDAD ATS', style: 'brand', alignment: 'center' });
  content.push({ text: profile.fullName || (isEn ? 'Candidate Report' : 'Reporte de Candidato'), style: 'title', alignment: 'center' });
  content.push({ text: `${isEn ? 'Date' : 'Fecha'}: ${fechaCompleta}`, style: 'date', alignment: 'center' });
  content.push({ text: ' ', margin: [0, 5] });

  // Cuadro de Puntaje (Score Card)
  content.push({
    table: {
      widths: ['*'],
      body: [
        [
          {
            fillColor: '#f3f4f6',
            margin: [20, 12, 20, 12],
            stack: [
              { text: `${isEn ? 'Score Match' : 'Puntaje de Match'}: ${score}%`, style: 'scoreText', alignment: 'center', color: colorScore },
              { text: label, style: 'scoreLabel', alignment: 'center' }
            ]
          }
        ]
      ]
    },
    layout: 'noBorders',
    margin: [0, 0, 0, 15]
  });

  // Barra de Progreso en Canvas
  content.push({
    canvas: [
      { type: 'rect', x: 0, y: 0, w: 515, h: 10, color: '#e2e8f0', r: 5 },
      { type: 'rect', x: 0, y: 0, w: (score / 100) * 515, h: 10, color: colorScore, r: 5 }
    ],
    margin: [0, 5, 0, 20]
  });

  // Análisis (anteriormente Diagnóstico)
  content.push({ text: isEn ? 'Analysis' : 'Análisis', style: 'sectionHeader' });
  content.push({ text: report.summary || '', style: 'bodyText', margin: [0, 0, 0, 15] });

  // Lo que el ATS vio en tu CV
  content.push({ text: isEn ? 'What the ATS saw in your CV' : 'Lo que el ATS "vio" en tu CV', style: 'sectionHeader' });
  
  const profileData = [
    [isEn ? 'Full Name' : 'Nombre Completo', isValidValue(profile.fullName) ? profile.fullName : '—'],
    [isEn ? 'Email' : 'Correo electrónico', isValidValue(profile.email) ? profile.email : '—'],
    [isEn ? 'Phone' : 'Teléfono', isValidValue(profile.phone) ? profile.phone : '—'],
    ['LinkedIn', isValidValue(profile.linkedin) ? { text: profile.linkedin, link: getHref(profile.linkedin), color: '#6d28d9', decoration: 'underline' } : '—'],
    [isEn ? 'Job Title' : 'Puesto / Título', isValidValue(profile.currentTitle) ? profile.currentTitle : '—'],
    [isEn ? 'Current Company' : 'Empresa actual', isValidValue(profile.currentCompany) ? profile.currentCompany : '—'],
    [isEn ? 'Education Level' : 'Nivel educativo', isValidValue(profile.educationLevel) ? profile.educationLevel : '—'],
    [isEn ? 'Estimated Exp.' : 'Años de exp. estimados', profile.estimatedYearsExp != null && String(profile.estimatedYearsExp).toLowerCase().trim() !== 'null' ? `${profile.estimatedYearsExp} ${isEn ? 'years' : 'años'}` : '—'],
    [isEn ? 'Total Words' : 'Total palabras', profile.totalWords || '—'],
    [isEn ? 'Estimated Pages' : 'Páginas estimadas', profile.estimatedPages || 1],
    [isEn ? 'Sections Found' : 'Secciones reconocidas', (profile.sectionsFound || []).join(', ') || '—']
  ];

  content.push({
    table: {
      widths: [150, '*'],
      body: profileData.map(([label, val]) => [
        { text: label, bold: true, fontSize: 10, color: '#4b5563' },
        typeof val === 'object' ? val : { text: String(val), fontSize: 10, color: '#1f2937' }
      ])
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0,
      hLineColor: () => '#e5e7eb'
    },
    margin: [0, 0, 0, 20]
  });

  // Calidad del Lenguaje
  content.push({ text: isEn ? 'Language Quality' : 'Calidad del Lenguaje', style: 'sectionHeader' });
  const lq = report.languageQuality || {};
  content.push({
    ul: [
      { text: `${isEn ? 'Action Verbs Found' : 'Verbos de Acción Encontrados'}: ${(lq.actionVerbsFound || []).join(', ') || '—'}`, fontSize: 10, color: '#2d3748' },
      { text: `${isEn ? 'Action Verbs Missing' : 'Verbos de Acción Faltantes'}: ${(lq.actionVerbsMissing || []).join(', ') || '—'}`, fontSize: 10, color: '#2d3748' },
      { text: `${isEn ? 'Quantified Achievements' : 'Logros Cuantificados'}: ${lq.quantifiedAchievements || 0}`, fontSize: 10, color: '#2d3748' },
      { text: `${isEn ? 'Keyword Density' : 'Densidad de Palabras Clave'}: ${lq.keywordDensity || '—'}`, fontSize: 10, color: '#2d3748' }
    ],
    margin: [0, 0, 0, 20]
  });

  // Keywords (Faltantes y Encontradas)
  content.push({ text: isEn ? 'Keywords' : 'Palabras Clave (Keywords)', style: 'sectionHeader' });
  content.push({
    table: {
      widths: ['*'],
      body: [
        [
          {
            fillColor: '#fef2f2',
            margin: [10, 10, 10, 10],
            stack: [
              { text: isEn ? 'Missing Keywords (Add these):' : 'Palabras clave faltantes (Recomendado agregar):', bold: true, fontSize: 10, color: '#ef4444' },
              { text: (report.missingKeywords || []).join(', ') || '—', fontSize: 9.5, color: '#991b1b', margin: [0, 4, 0, 0] }
            ]
          }
        ],
        [
          {
            fillColor: '#f0fdf4',
            margin: [10, 10, 10, 10],
            stack: [
              { text: isEn ? 'Matched Keywords (Found):' : 'Palabras clave encontradas:', bold: true, fontSize: 10, color: '#10b981' },
              { text: (report.matchedKeywords || []).join(', ') || '—', fontSize: 9.5, color: '#166534', margin: [0, 4, 0, 0] }
            ]
          }
        ]
      ]
    },
    layout: 'noBorders',
    margin: [0, 0, 0, 20]
  });

  // Desglose del análisis & Benchmark
  content.push({ text: isEn ? 'Analysis Breakdown' : 'Desglose del Análisis', style: 'sectionHeader' });
  const bd = report.breakdown || {};
  const bm = report.benchmark || {};
  content.push({
    columns: [
      {
        width: '50%',
        stack: [
          { text: `${isEn ? 'Contact Info' : 'Datos de Contacto'}: ${bd.contactInfo || 0}%`, fontSize: 10 },
          { text: `${isEn ? 'Work Experience' : 'Experiencia Laboral'}: ${bd.experience || 0}%`, fontSize: 10 },
          { text: `${isEn ? 'Education' : 'Educación'}: ${bd.education || 0}%`, fontSize: 10 },
          { text: `${isEn ? 'Skills' : 'Habilidades'}: ${bd.skills || 0}%`, fontSize: 10 }
        ]
      },
      {
        width: '50%',
        stack: [
          { text: `${isEn ? 'Sector Average' : 'Media del sector'}: ${bm.sectorAverage || 61}%`, fontSize: 10 },
          { text: `${isEn ? 'Top Candidates' : 'Top candidatos'}: ${bm.topCandidates || 88}%`, fontSize: 10 },
          { text: `${isEn ? 'Recommended Threshold' : 'Umbral recomendado'}: ${bm.passThreshold || 75}%`, fontSize: 10 }
        ]
      }
    ],
    margin: [0, 0, 0, 20]
  });

  // Recomendaciones Rápidas (Plan de Acción) - Sin pageBreak para fluir de forma compacta
  content.push({ text: isEn ? 'Action Plan (Quick Recommendations)' : 'Plan de Acción (Recomendaciones Rápidas)', style: 'sectionHeader' });
  
  const recHeaders = [
    { text: isEn ? 'Priority' : 'Prioridad', style: 'tableHeader', alignment: 'center' },
    { text: isEn ? 'Section' : 'Sección', style: 'tableHeader' },
    { text: isEn ? 'Recommendation' : 'Recomendación', style: 'tableHeader' },
    { text: isEn ? 'Time' : 'Tiempo', style: 'tableHeader', alignment: 'center' }
  ];

  const recRows = [recHeaders];
  if (report.recommendations && report.recommendations.length > 0) {
    report.recommendations.forEach(rec => {
      recRows.push([
        { text: rec.priority || 'ALTA', fontSize: 9.5, bold: true, alignment: 'center', color: rec.priority === 'Alta' || rec.priority === 'High' ? '#ef4444' : '#f59e0b' },
        { text: rec.section || '', fontSize: 9.5, bold: true },
        { text: rec.advice || '', fontSize: 9 },
        { text: rec.estimatedMinutes ? `~${rec.estimatedMinutes} min` : '—', fontSize: 9, alignment: 'center' }
      ]);
    });
  } else {
    recRows.push([
      { text: isEn ? 'No recommendations. Good job!' : 'Sin recomendaciones. ¡Buen trabajo!', colSpan: 4, alignment: 'center', italic: true, fontSize: 10 }
    ]);
  }

  content.push({
    table: {
      widths: [60, 100, '*', 50],
      headerRows: 1,
      body: recRows
    },
    layout: {
      fillColor: (rowIndex) => {
        if (rowIndex === 0) return '#6d28d9';
        return rowIndex % 2 === 0 ? '#f9fafb' : '#ffffff';
      },
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => '#cbd5e1',
      vLineColor: () => '#cbd5e1'
    },
    unbreakable: true,
    margin: [0, 0, 0, 20]
  });

  // Advertencias de Formato ATS
  if (report.atsWarnings && report.atsWarnings.length > 0) {
    content.push({ text: isEn ? 'ATS Format Warnings' : 'Advertencias de Formato ATS', style: 'sectionHeader', color: '#ef4444' });
    content.push({
      ul: report.atsWarnings.map(warn => ({ text: warn, fontSize: 9.5, color: '#ef4444' })),
      margin: [0, 0, 0, 15]
    });
  }

  // Footer de página con el dominio workwii.app
  content.push({ text: 'Report generated by Workwii (workwii.app)', fontSize: 9, italic: true, alignment: 'center', color: '#9ca3af', margin: [0, 20, 0, 0] });

  // Estilos del documento pdfmake
  const docDefinition = {
    content,
    pageMargins: [40, 50, 40, 50],
    defaultStyle: {
      font: 'Roboto',
      lineHeight: 1.35
    },
    styles: {
      brand: { fontSize: 10, bold: true, color: '#6d28d9', margin: [0, 0, 0, 2] },
      title: { fontSize: 20, bold: true, color: '#1f2937', margin: [0, 0, 0, 2] },
      date: { fontSize: 9, color: '#6b7280', margin: [0, 0, 0, 15] },
      scoreText: { fontSize: 24, bold: true },
      scoreLabel: { fontSize: 13, bold: true, color: '#4b5563' },
      sectionHeader: { fontSize: 12, bold: true, color: '#6d28d9', margin: [0, 10, 0, 6] },
      bodyText: { fontSize: 10, color: '#374151' },
      tableHeader: { fontSize: 10, bold: true, color: '#ffffff' }
    }
  };

  const filename = `Reporte_ATS_Workwii_${score}.pdf`;
  try {
    window.pdfMake.createPdf(docDefinition).download(filename);
  } catch (err) {
    console.error('Error pdfMake:', err);
    window.print();
  }
};

export const imprimirPdf = () => {
  window.print();
};
