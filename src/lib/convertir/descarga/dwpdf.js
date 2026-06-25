/**
 * Descarga el currículum como PDF directamente usando la librería html2pdf.js desde CDN.
 * Mantiene la fidelidad visual idéntica a la vista previa.
 * 
 * @param {object} cv - Datos estructurados del currículum.
 */
export const descargarPdfDirecto = async (cv) => {
  if (!window.html2pdf) {
    // Cargar dinámicamente html2pdf.js de CDN
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.12.1/html2pdf.bundle.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  const element = document.getElementById('convPreviewA4');
  if (!element) return;

  const opt = {
    margin:       [10, 12, 10, 12],
    filename:     `${(cv.nombre || 'CV_ATS').replace(/\s+/g, '_')}_CV_ATS.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2.5, useCORS: true, logging: false, backgroundColor: '#ffffff' },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak:    { mode: 'css', before: '.cr_cv_page_next' }
  };

  window.html2pdf().from(element).set(opt).save();
};

/**
 * Abre el diálogo de impresión nativo del navegador (Recomendado para ATS).
 */
export const imprimirPdf = () => {
  window.print();
};
