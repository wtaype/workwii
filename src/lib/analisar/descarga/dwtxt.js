// src/lib/analisar/descarga/dwtxt.js
// Exportador de Reporte ATS en formato de Texto Plano (.txt) estructurado

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

export const descargarTxtReporte = (report, lang = 'es') => {
  if (!report) return;
  const isEn = lang === 'en';
  const score = report.score || 0;
  
  let txt = '';
  txt += `======================================================================\n`;
  txt += `${isEn ? 'WORKWII - ATS COMPATIBILITY REPORT' : 'WORKWII - REPORTE DE COMPATIBILIDAD ATS'}\n`;
  txt += `======================================================================\n`;
  txt += `${isEn ? 'Match Score' : 'Puntaje de Match'}: ${score}%\n`;
  txt += `${isEn ? 'Diagnosis' : 'Diagnóstico'}: ${report.summary || ''}\n\n`;
  
  // Lo que el ATS vio en tu CV
  const profile = report.detectedProfile || {};
  txt += `----------------------------------------------------------------------\n`;
  txt += `${isEn ? 'WHAT THE ATS SAW IN YOUR CV' : 'LO QUE EL ATS VIO EN TU CV'}\n`;
  txt += `----------------------------------------------------------------------\n`;
  txt += `${isEn ? 'Full Name' : 'Nombre Completo'}: ${isValidValue(profile.fullName) ? profile.fullName : '—'}\n`;
  txt += `${isEn ? 'Email' : 'Correo electrónico'}: ${isValidValue(profile.email) ? profile.email : '—'}\n`;
  txt += `${isEn ? 'Phone' : 'Teléfono'}: ${isValidValue(profile.phone) ? profile.phone : '—'}\n`;
  txt += `${isEn ? 'LinkedIn' : 'LinkedIn'}: ${isValidValue(profile.linkedin) ? profile.linkedin : '—'}\n`;
  txt += `${isEn ? 'Job Title' : 'Puesto / Título'}: ${isValidValue(profile.currentTitle) ? profile.currentTitle : '—'}\n`;
  txt += `${isEn ? 'Current Company' : 'Empresa actual'}: ${isValidValue(profile.currentCompany) ? profile.currentCompany : '—'}\n`;
  txt += `${isEn ? 'Education Level' : 'Nivel educativo'}: ${isValidValue(profile.educationLevel) ? profile.educationLevel : '—'}\n`;
  txt += `${isEn ? 'Estimated Exp.' : 'Años de exp. estimados'}: ${profile.estimatedYearsExp != null && String(profile.estimatedYearsExp).toLowerCase().trim() !== 'null' ? profile.estimatedYearsExp + (isEn ? ' years' : ' años') : '—'}\n`;
  txt += `${isEn ? 'Total Words' : 'Total palabras'}: ${profile.totalWords || '—'}\n`;
  txt += `${isEn ? 'Estimated Pages' : 'Páginas estimadas'}: ${profile.estimatedPages || 1}\n`;
  txt += `${isEn ? 'Sections Found' : 'Secciones reconocidas'}: ${(profile.sectionsFound || []).join(', ') || '—'}\n\n`;
  
  // Calidad del Lenguaje
  const lq = report.languageQuality || {};
  txt += `----------------------------------------------------------------------\n`;
  txt += `${isEn ? 'LANGUAGE QUALITY' : 'CALIDAD DEL LENGUAJE'}\n`;
  txt += `----------------------------------------------------------------------\n`;
  txt += `${isEn ? 'Action Verbs Found' : 'Verbos de Acción Encontrados'}: ${(lq.actionVerbsFound || []).join(', ') || '—'}\n`;
  txt += `${isEn ? 'Action Verbs Missing' : 'Verbos de Acción Faltantes'}: ${(lq.actionVerbsMissing || []).join(', ') || '—'}\n`;
  txt += `${isEn ? 'Quantified Achievements' : 'Logros Cuantificados'}: ${lq.quantifiedAchievements || 0}\n`;
  txt += `${isEn ? 'Keyword Density' : 'Densidad de Palabras Clave'}: ${lq.keywordDensity || '—'}\n\n`;
  
  // Keywords
  txt += `----------------------------------------------------------------------\n`;
  txt += `${isEn ? 'KEYWORDS (PALABRAS CLAVE)' : 'PALABRAS CLAVE (KEYWORDS)'}\n`;
  txt += `----------------------------------------------------------------------\n`;
  txt += `${isEn ? 'Missing Keywords' : 'Palabras clave faltantes'}:\n`;
  txt += `  ${(report.missingKeywords || []).join(', ') || '—'}\n\n`;
  txt += `${isEn ? 'Matched Keywords' : 'Palabras clave encontradas'}:\n`;
  txt += `  ${(report.matchedKeywords || []).join(', ') || '—'}\n\n`;

  // Desglose
  const bd = report.breakdown || {};
  txt += `----------------------------------------------------------------------\n`;
  txt += `${isEn ? 'ANALYSIS BREAKDOWN' : 'DESGLOSE DE ANÁLISIS'}\n`;
  txt += `----------------------------------------------------------------------\n`;
  txt += `${isEn ? 'Contact Info' : 'Datos de Contacto'}: ${bd.contactInfo || 0}%\n`;
  txt += `${isEn ? 'Work Experience' : 'Experiencia Laboral'}: ${bd.experience || 0}%\n`;
  txt += `${isEn ? 'Education' : 'Educación'}: ${bd.education || 0}%\n`;
  txt += `${isEn ? 'Skills' : 'Habilidades'}: ${bd.skills || 0}%\n\n`;

  // Benchmark
  const bm = report.benchmark || {};
  txt += `----------------------------------------------------------------------\n`;
  txt += `${isEn ? 'HOW DO YOU COMPARE?' : '¿CÓMO TE COMPARAS?'}\n`;
  txt += `----------------------------------------------------------------------\n`;
  txt += `${isEn ? 'Sector Average' : 'Media del sector'}: ${bm.sectorAverage || 61}%\n`;
  txt += `${isEn ? 'Top Candidates' : 'Top candidatos'}: ${bm.topCandidates || 88}%\n`;
  txt += `${isEn ? 'Recommended Threshold' : 'Umbral recomendado'}: ${bm.passThreshold || 75}%\n\n`;

  // Recomendaciones Rápidas
  txt += `----------------------------------------------------------------------\n`;
  txt += `${isEn ? 'RECOMMENDED ACTION PLAN' : 'RECOMENDACIONES RÁPIDAS (PLAN DE ACCIÓN)'}\n`;
  txt += `----------------------------------------------------------------------\n`;
  if (report.recommendations && report.recommendations.length > 0) {
    report.recommendations.forEach((rec, idx) => {
      txt += `${idx + 1}. [${rec.priority || 'ALTA'}] ${rec.section || ''}: ${rec.advice || ''}`;
      if (rec.estimatedMinutes) txt += ` (~${rec.estimatedMinutes} min)`;
      txt += `\n`;
    });
  } else {
    txt += `${isEn ? 'No recommendations needed. Good job!' : 'No se necesitan recomendaciones. ¡Buen trabajo!'}\n`;
  }
  txt += `\n`;

  // Advertencias de Formato
  if (report.atsWarnings && report.atsWarnings.length > 0) {
    txt += `----------------------------------------------------------------------\n`;
    txt += `${isEn ? 'ATS FORMAT WARNINGS' : 'ADVERTENCIAS DE FORMATO ATS'}\n`;
    txt += `----------------------------------------------------------------------\n`;
    report.atsWarnings.forEach((warn) => {
      txt += `- ${warn}\n`;
    });
    txt += `\n`;
  }
  
  txt += `======================================================================\n`;
  
  const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Reporte_ATS_Workwii_${score}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
