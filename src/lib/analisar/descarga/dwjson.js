// src/lib/analisar/descarga/dwjson.js
// Exportador de Reporte ATS en formato JSON estructurado

export const descargarJsonReporte = (report) => {
  if (!report) return;
  const jsonStr = JSON.stringify(report, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const score = report.score || 0;
  a.download = `Reporte_ATS_Workwii_${score}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
