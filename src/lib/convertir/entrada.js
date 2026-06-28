import { wiSmart, Notificacion } from '../widev/widev.js';

// Carga bajo demanda desde CDN cuando el usuario interactúa
export const cargarLibreriasExtraccion = () => {
  wiSmart({
    js: 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.11.0/mammoth.browser.min.js'
  });
  wiSmart({
    js: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
  });
};

let selectedFile = null;
let extractedText = '';
let onTextExtractedCallback = null;
let onResetCallback = null;

// Referencias de elementos DOM
let dropzone, fileInput, previewContainer, cvTextarea, progressContainer, progressBar, progressPercent;

export const initEntrada = (onTextExtracted, onReset) => {
  onTextExtractedCallback = onTextExtracted;
  onResetCallback = onReset;

  dropzone = document.getElementById('convDropzone');
  fileInput = document.getElementById('convFileInput');
  previewContainer = document.getElementById('convPreviewContainer');
  cvTextarea = document.getElementById('convTextarea');
  progressContainer = document.getElementById('convProgressContainer');
  progressBar = document.getElementById('convProgressBar');
  progressPercent = document.getElementById('convProgressPercent');

  setupListeners();
};

const setupListeners = () => {
  // Cargar librerías al pasar el cursor sobre el dropzone
  dropzone?.addEventListener('mouseenter', cargarLibreriasExtraccion, { once: true });
  dropzone?.addEventListener('click', () => {
    cargarLibreriasExtraccion();
    fileInput?.click();
  });

  // Drag & Drop
  dropzone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });
  dropzone?.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
  dropzone?.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    cargarLibreriasExtraccion();
    if (e.dataTransfer?.files.length) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  });

  fileInput?.addEventListener('change', (e) => {
    if (e.target.files?.length) {
      handleFileSelection(e.target.files[0]);
    }
  });

  cvTextarea?.addEventListener('input', () => {
    extractedText = cvTextarea.value;
    onTextExtractedCallback?.(extractedText);
  });
};

const handleFileSelection = async (file) => {
  const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
  const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx');

  if (!isPdf && !isDocx) {
    Notificacion('Formato no válido. Solo se admiten archivos PDF y Word (.docx)', 'error');
    return;
  }

  if (file.size > 4 * 1024 * 1024) {
    Notificacion('El tamaño del archivo supera el límite de 4MB.', 'error');
    return;
  }

  selectedFile = file;
  extractedText = '';
  renderProgressState(true);

  try {
    await simularProgreso(500); // Feedback visual premium
    if (isPdf) {
      extractedText = await parsePdf(file);
    } else {
      extractedText = await parseDocx(file);
    }

    if (!extractedText.trim()) {
      throw new Error('No se pudo extraer texto del archivo o el documento está vacío.');
    }

    renderProgressState(false);
    renderPreview();
    if (cvTextarea) {
      cvTextarea.value = extractedText;
      cvTextarea.dispatchEvent(new Event('input')); // Actualizar contadores y habilitar botón
    }
    onTextExtractedCallback?.(extractedText);
  } catch (err) {
    console.error(err);
    Notificacion(err.message || 'Error al procesar el archivo.', 'error');
    removeFile();
  }
};

const simularProgreso = (duration) => {
  return new Promise((resolve) => {
    let start = 0;
    const intervalTime = 15;
    const steps = duration / intervalTime;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= 100) {
        clearInterval(timer);
        if (progressBar) progressBar.style.width = '100%';
        if (progressPercent) progressPercent.textContent = '100%';
        setTimeout(resolve, 100);
      } else {
        const rounded = Math.round(start);
        if (progressBar) progressBar.style.width = `${rounded}%`;
        if (progressPercent) progressPercent.textContent = `${rounded}%`;
      }
    }, intervalTime);
  });
};

const renderProgressState = (show) => {
  if (show) {
    if (progressContainer) progressContainer.style.display = 'block';
    if (dropzone) dropzone.style.display = 'none';
  } else {
    if (progressContainer) progressContainer.style.display = 'none';
    if (progressBar) progressBar.style.width = '0%';
    if (progressPercent) progressPercent.textContent = '0%';
  }
};

const renderPreview = () => {
  if (!selectedFile || !previewContainer) return;
  const isPdf = selectedFile.type === 'application/pdf' || selectedFile.name.endsWith('.pdf');
  const iconClass = isPdf ? 'fa-file-pdf' : 'fa-file-word';
  const readableSize = (selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB';

  previewContainer.innerHTML = `
    <div class="file_preview">
      <i class="fas ${iconClass} file_icon"></i>
      <div class="file_info">
        <div class="file_name">${selectedFile.name}</div>
        <div class="file_size">${readableSize}</div>
      </div>
      <button class="file_remove" id="btnRemoveConvFile" title="Quitar archivo">&times;</button>
    </div>
  `;
  previewContainer.style.display = 'flex';
  if (dropzone) dropzone.style.display = 'none';

  document.getElementById('btnRemoveConvFile')?.addEventListener('click', removeFile);
};

export const removeFile = () => {
  selectedFile = null;
  extractedText = '';
  if (previewContainer) {
    previewContainer.style.display = 'none';
    previewContainer.innerHTML = '';
  }
  if (cvTextarea) cvTextarea.value = '';
  if (dropzone) dropzone.style.display = 'flex';
  if (fileInput) fileInput.value = '';
  renderProgressState(false);
  onResetCallback?.();
};

const parseDocx = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = (e) => {
      const arrayBuffer = e.target.result;
      if (window.mammoth) {
        window.mammoth.extractRawText({ arrayBuffer })
          .then((res) => resolve(res.value || ''))
          .catch((err) => reject(new Error('Mammoth falló al extraer texto de Word.')));
      } else {
        reject(new Error('Librería de Word no está cargada en el cliente. Intenta nuevamente.'));
      }
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo Word.'));
  });
};

const parsePdf = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async (e) => {
      const arrayBuffer = e.target.result;
      const pdfjsLib = window['pdfjs-dist/build/pdf'] || window.pdfjsLib;

      if (!pdfjsLib) {
        reject(new Error('Librería PDF no está lista en el cliente. Intenta de nuevo.'));
        return;
      }

      try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += pageText + '\n';
        }
        resolve(fullText);
      } catch (err) {
        console.error('Pdfjs error:', err);
        reject(new Error('Error al decodificar las páginas del PDF. Asegúrate de que no esté protegido.'));
      }
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo PDF.'));
  });
};
