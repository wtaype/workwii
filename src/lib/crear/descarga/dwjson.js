// src/lib/crear/descarga/dwjson.js
// Exportador de CV en formato JSON estructurado

export const descargarJson = (cv) => {
  const jsonStr = JSON.stringify(cv, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(cv.nombre || 'CV_ATS').replace(/\s+/g, '_')}_datos_CV.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
