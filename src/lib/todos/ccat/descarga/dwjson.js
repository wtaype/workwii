// src/lib/todos/ccat/descarga/dwjson.js
// Exportador de reporte CCAT en formato JSON (.json)

export const descargarJsonReporte = (results, lang = 'es') => {
  if (!results) return;

  const dataStr = JSON.stringify(results, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `ccat_simulador_reporte_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
