// src/lib/analisar/descarga/dwmd.js
// Exportador de Reporte ATS en formato Markdown (.md) estructurado

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

export const descargarMdReporte = (report, lang = 'es') => {
  if (!report) return;
  const isEn = lang === 'en';
  const score = report.score || 0;
  
  let md = '';
  md += `# ${isEn ? 'ATS Compatibility Report' : 'Reporte de Compatibilidad ATS'} - Workwii\n\n`;
  
  // Banda de compatibilidad
  const label = score >= 90 
    ? (isEn ? '🟢 Excellent Match — Ready to apply' : '🟢 Excelente Match — Listo para postular') 
    : score >= 75 
      ? (isEn ? '🔵 Good Match — Passes most filters' : '🔵 Buen Match — Supera la mayoría de filtros') 
      : score >= 50 
        ? (isEn ? '🟡 Average Match — May pass some filters' : '🟡 Match Regular — Puede pasar algunos filtros') 
        : (isEn ? '🔴 Low Match — Urgent review required' : '🔴 Coincidencia Baja — Necesita revisión urgente');
        
  md += `> **${isEn ? 'Match Score' : 'Puntaje de Match'}: ${score}%**  \n`;
  md += `> ${label}\n\n`;
  
  // Diagnóstico
  md += `## 📋 ${isEn ? 'Analysis' : 'Análisis'}\n`;
  md += `${report.summary || (isEn ? 'Analysis completed.' : 'Análisis completado.')}\n\n`;
  
  // Lo que el ATS vio en tu CV
  const profile = report.detectedProfile || {};
  md += `## 🔍 ${isEn ? 'What the ATS saw in your CV' : 'Lo que el ATS "vio" en tu CV'}\n\n`;
  
  md += `* **${isEn ? 'Full Name' : 'Nombre Completo'}:** ${isValidValue(profile.fullName) ? profile.fullName : '—'}\n`;
  md += `* **${isEn ? 'Email' : 'Correo electrónico'}:** ${isValidValue(profile.email) ? profile.email : '—'}\n`;
  md += `* **${isEn ? 'Phone' : 'Teléfono'}:** ${isValidValue(profile.phone) ? profile.phone : '—'}\n`;
  md += `* **LinkedIn:** ${isValidValue(profile.linkedin) ? `[${profile.linkedin}](${profile.linkedin})` : '—'}\n`;
  md += `* **${isEn ? 'Job Title' : 'Puesto / Título'}:** ${isValidValue(profile.currentTitle) ? profile.currentTitle : '—'}\n`;
  md += `* **${isEn ? 'Current Company' : 'Empresa actual'}:** ${isValidValue(profile.currentCompany) ? profile.currentCompany : '—'}\n`;
  md += `* **${isEn ? 'Education Level' : 'Nivel educativo'}:** ${isValidValue(profile.educationLevel) ? profile.educationLevel : '—'}\n`;
  md += `* **${isEn ? 'Estimated Exp.' : 'Años de exp. estimados'}:** ${profile.estimatedYearsExp != null && String(profile.estimatedYearsExp).toLowerCase().trim() !== 'null' ? profile.estimatedYearsExp + (isEn ? ' years' : ' años') : '—'}\n`;
  md += `* **${isEn ? 'Total Words' : 'Total palabras'}:** ${profile.totalWords || '—'}\n`;
  md += `* **${isEn ? 'Estimated Pages' : 'Páginas estimadas'}:** ${profile.estimatedPages || 1}\n\n`;
  
  // Secciones encontradas
  const sects = profile.sectionsFound || [];
  if (sects.length > 0) {
    md += `### ${isEn ? 'Recognized Sections' : 'Secciones Reconocidas'}\n`;
    const allSects = ['Experiencia', 'Educación', 'Habilidades', 'Proyectos', 'Certificaciones', 'Idiomas'];
    allSects.forEach(s => {
      const found = sects.some(x => x.toLowerCase().includes(s.substring(0, 5).toLowerCase()));
      md += `- [${found ? 'x' : ' '}] ${s}\n`;
    });
    md += `\n`;
  }

  // Calidad del Lenguaje
  const lq = report.languageQuality || {};
  md += `## ✍️ ${isEn ? 'Language Quality' : 'Calidad del Lenguaje'}\n\n`;
  md += `* **${isEn ? 'Action Verbs Found' : 'Verbos de Acción Encontrados'}:** ${lq.actionVerbsFound?.length || 0}\n`;
  md += `* **${isEn ? 'Quantified Achievements' : 'Logros Cuantificados'}:** ${lq.quantifiedAchievements || 0}\n`;
  md += `* **${isEn ? 'Keyword Density' : 'Densidad de Palabras Clave'}:** ${lq.keywordDensity || '—'}\n\n`;
  
  // Palabras Clave
  md += `## 🔑 ${isEn ? 'Keywords' : 'Palabras Clave'}\n\n`;
  
  md += `### 🟥 ${isEn ? 'Missing Keywords (Add these)' : 'Palabras clave faltantes (Recomendado agregar)'}\n`;
  md += `\`\`\`text\n`;
  md += `${(report.missingKeywords || []).join(', ') || (isEn ? 'None (Great job!)' : 'Ninguna (¡Excelente!)')}\n`;
  md += `\`\`\`\n\n`;
  
  md += `### 🟩 ${isEn ? 'Matched Keywords (Found)' : 'Palabras clave encontradas'}\n`;
  md += `\`\`\`text\n`;
  md += `${(report.matchedKeywords || []).join(', ') || '—'}\n`;
  md += `\`\`\`\n\n`;

  // Desglose
  const bd = report.breakdown || {};
  md += `## 📊 ${isEn ? 'Analysis Breakdown' : 'Desglose del Análisis'}\n\n`;
  md += `| ${isEn ? 'Category' : 'Categoría'} | ${isEn ? 'Score' : 'Calificación'} |\n`;
  md += `| :--- | :--- |\n`;
  md += `| ${isEn ? 'Contact Info' : 'Datos de Contacto'} | ${bd.contactInfo || 0}% |\n`;
  md += `| ${isEn ? 'Work Experience' : 'Experiencia Laboral'} | ${bd.experience || 0}% |\n`;
  md += `| ${isEn ? 'Education' : 'Educación'} | ${bd.education || 0}% |\n`;
  md += `| ${isEn ? 'Skills' : 'Habilidades'} | ${bd.skills || 0}% |\n\n`;

  // Benchmark
  const bm = report.benchmark || {};
  md += `## 📈 ${isEn ? 'How do you compare?' : '¿Como te comparas?'}\n\n`;
  md += `* **${isEn ? 'Sector Average' : 'Media del sector'}:** ${bm.sectorAverage || 61}%\n`;
  md += `* **${isEn ? 'Top Candidates' : 'Top candidatos'}:** ${bm.topCandidates || 88}%\n`;
  md += `* **${isEn ? 'Recommended Threshold' : 'Umbral recomendado'}:** ${bm.passThreshold || 75}%\n\n`;

  // Plan de Acción
  md += `## 🚀 ${isEn ? 'Action Plan (Quick Recommendations)' : 'Plan de Acción (Recomendaciones Rápidas)'}\n\n`;
  if (report.recommendations && report.recommendations.length > 0) {
    md += `| ${isEn ? 'Priority' : 'Prioridad'} | ${isEn ? 'Section' : 'Sección'} | ${isEn ? 'Recommendation' : 'Recomendación'} | ${isEn ? 'Time' : 'Tiempo'} |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;
    report.recommendations.forEach(rec => {
      const priorityLabel = rec.priority === 'Alta' || rec.priority === 'High' ? '🔴' : rec.priority === 'Media' || rec.priority === 'Medium' ? '🟡' : '🟢';
      md += `| ${priorityLabel} ${rec.priority} | **${rec.section}** | ${rec.advice} | ${rec.estimatedMinutes ? `~${rec.estimatedMinutes} min` : '—'} |\n`;
    });
    md += `\n`;
  } else {
    md += `*${isEn ? 'No recommendations needed. Your CV is optimal!' : 'No se necesitan recomendaciones. ¡Tu CV está óptimo!'}*\n\n`;
  }

  // Advertencias de Formato
  if (report.atsWarnings && report.atsWarnings.length > 0) {
    md += `## ⚠️ ${isEn ? 'ATS Format Warnings' : 'Advertencias de Formato ATS'}\n\n`;
    report.atsWarnings.forEach(warn => {
      md += `* **[WARNING]** ${warn}\n`;
    });
    md += `\n`;
  }
  
  md += `---\n*Reporte generado automáticamente por [Workwii](https://workwii.app)*\n`;

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Reporte_ATS_Workwii_${score}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
