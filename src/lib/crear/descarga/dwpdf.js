// src/lib/crear/descarga/dwpdf.js
// Descarga de CV en formato PDF e Impresión Nativa

export const descargarPdfDirecto = async (cv) => {
  if (!window.html2pdf) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.12.1/html2pdf.bundle.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  const printableArea = document.getElementById('cr_cv_printable_area');
  if (!printableArea) return;

  const filename = `${(cv.nombre || 'CV_ATS').replace(/\s+/g, '_')}_CV_ATS.pdf`;

  const opt = {
    margin:       [10, 12, 10, 12],
    filename,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2.5, useCORS: true, logging: false, backgroundColor: '#ffffff' },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak:    { mode: 'css', before: '.cr_cv_page_next' }
  };

  // Inject temporary styles for centering name/title when no avatar is present
  const style = document.createElement('style');
  style.id = 'html2pdf-style-overrides';
  style.innerHTML = `
    .html2pdf__container .cr_cv_header {
      display: block !important;
      text-align: center !important;
      width: 100% !important;
    }
    .html2pdf__container .cr_cv_name {
      text-align: center !important;
      display: block !important;
      width: 100% !important;
    }
    .html2pdf__container .cr_cv_title {
      text-align: center !important;
      display: block !important;
      width: 100% !important;
    }
    .html2pdf__container .cr_cv_header.has_avatar {
      display: flex !important;
      text-align: left !important;
    }
    .html2pdf__container .cr_cv_header.has_avatar .cr_cv_name,
    .html2pdf__container .cr_cv_header.has_avatar .cr_cv_title {
      text-align: left !important;
    }
  `;
  document.head.appendChild(style);

  try {
    await window.html2pdf().from(printableArea).set(opt).save();
  } catch (err) {
    console.error('Error al generar PDF directo:', err);
    window.print();
  } finally {
    if (style.parentNode) {
      style.parentNode.removeChild(style);
    }
  }
};

export const imprimirPdf = () => {
  window.print();
};
