import { wiSmart, Notificacion } from '../widev.js';

// Cargar librerías de forma diferida en interacción del usuario
export const cargarLibreriasExtraccion = () => {
  wiSmart({
    js: 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.11.0/mammoth.browser.min.js'
  });
  wiSmart({
    js: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
  });
};

let selectedFile = null;
let fileBase64 = null;
let fileTextContent = null;
let onValidateCallback = null;

// Selectores de DOM
let atsDropzone, fileInput, filePreviewContainer;
let uploadProgressContainer, uploadProgressBar, uploadProgressPercent;

export const initEntrada = (onValidate) => {
  onValidateCallback = onValidate;

  atsDropzone = document.getElementById('atsDropzone');
  fileInput = document.getElementById('fileInput');
  filePreviewContainer = document.getElementById('filePreviewContainer');

  uploadProgressContainer = document.getElementById('uploadProgressContainer');
  uploadProgressBar = document.getElementById('uploadProgressBar');
  uploadProgressPercent = document.getElementById('uploadProgressPercent');

  setupListeners();
};

const setupListeners = () => {
  // Drag & Drop
  atsDropzone?.addEventListener('mouseenter', cargarLibreriasExtraccion, { once: true });
  atsDropzone?.addEventListener('click', () => {
    cargarLibreriasExtraccion();
    fileInput?.click();
  });
  atsDropzone?.addEventListener('dragover', (e) => { e.preventDefault(); atsDropzone.classList.add('dragover'); });
  atsDropzone?.addEventListener('dragleave', () => atsDropzone.classList.remove('dragover'));
  atsDropzone?.addEventListener('drop', (e) => {
    e.preventDefault();
    atsDropzone.classList.remove('dragover');
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

  const roleInput = document.getElementById('atsTargetRole');
  roleInput?.addEventListener('input', validate);
};

// switchTab removida (sólo modo archivo soportado)

const runProgress = (duration = 600) => {
  return new Promise((resolve) => {
    if (!uploadProgressContainer) {
      resolve();
      return;
    }
    uploadProgressContainer.style.display = 'block';
    if (atsDropzone) atsDropzone.style.display = 'none';
    let start = 0;
    const intervalTime = 20;
    const steps = duration / intervalTime;
    const increment = 100 / steps;
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= 100) {
        start = 100;
        clearInterval(timer);
        if (uploadProgressBar) uploadProgressBar.style.width = '100%';
        if (uploadProgressPercent) uploadProgressPercent.textContent = '100%';
        setTimeout(() => {
          uploadProgressContainer.style.display = 'none';
          resolve();
        }, 150);
      } else {
        const rounded = Math.round(start);
        if (uploadProgressBar) uploadProgressBar.style.width = `${rounded}%`;
        if (uploadProgressPercent) uploadProgressPercent.textContent = `${rounded}%`;
      }
    }, intervalTime);
  });
};

const handleFileSelection = async (file) => {
  const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const maxBytes = 4 * 1024 * 1024; // 4MB

  if (!validTypes.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.docx')) {
    Notificacion('Formato no permitido. Solo se admiten archivos PDF o DOCX.', 'error');
    return;
  }

  if (file.size > maxBytes) {
    Notificacion('El tamaño del archivo excede el límite de 4MB.', 'error');
    return;
  }

  selectedFile = file;
  fileBase64 = null;
  fileTextContent = null;
  
  await runProgress(600);

  renderPreview();

  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    try {
      fileBase64 = await convertFileToBase64(file);
      fileTextContent = await parsePdf(file);
    } catch (err) {
      console.error(err);
      Notificacion('Error al leer y extraer texto del PDF.', 'error');
      removeFile();
    }
  } else {
    try {
      fileTextContent = await extractTextFromDocx(file);
    } catch (err) {
      console.error(err);
      Notificacion('Error al extraer texto del Word.', 'error');
      removeFile();
    }
  }
  validate();
};

const renderPreview = () => {
  if (!selectedFile || !filePreviewContainer) return;
  const isPdf = selectedFile.type === 'application/pdf' || selectedFile.name.endsWith('.pdf');
  const iconClass = isPdf ? 'fa-file-pdf' : 'fa-file-word';
  const readableSize = (selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB';

  filePreviewContainer.innerHTML = `
    <div class="file_preview">
      <i class="fas ${iconClass} file_icon"></i>
      <div class="file_info">
        <div class="file_name">${selectedFile.name}</div>
        <div class="file_size">${readableSize}</div>
      </div>
      <button class="file_remove" id="btnRemoveFile" title="Quitar archivo">&times;</button>
    </div>
  `;

  filePreviewContainer.style.display = 'flex';
  if (atsDropzone) atsDropzone.style.display = 'none';

  document.getElementById('btnRemoveFile')?.addEventListener('click', removeFile);
};

const removeFile = () => {
  selectedFile = null;
  fileBase64 = null;
  fileTextContent = null;

  if (filePreviewContainer) {
    filePreviewContainer.style.display = 'none';
    filePreviewContainer.innerHTML = '';
  }
  if (uploadProgressContainer) {
    uploadProgressContainer.style.display = 'none';
    if (uploadProgressBar) uploadProgressBar.style.width = '0%';
    if (uploadProgressPercent) uploadProgressPercent.textContent = '0%';
  }
  if (atsDropzone) atsDropzone.style.display = 'flex';
  if (fileInput) fileInput.value = '';
  
  validate();
};

const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64Data = (reader.result).split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = (e) => reject(e);
  });
};

const extractTextFromDocx = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = (e) => {
      const arrayBuffer = e.target.result;
      if (window.mammoth) {
        window.mammoth.extractRawText({ arrayBuffer: arrayBuffer })
          .then((result) => {
            const text = result.value || '';
            if (!text.trim()) {
              reject(new Error('El archivo de Word está vacío.'));
            } else {
              resolve(text);
            }
          })
          .catch((err) => reject(err));
      } else {
        reject(new Error('Lector de Word no listo.'));
      }
    };
    reader.onerror = (e) => reject(e);
  });
};

const validate = () => {
  const roleInput = document.getElementById('atsTargetRole');
  const hasRole = roleInput && roleInput.value.trim().length >= 2;
  const hasCv = selectedFile !== null && (fileBase64 !== null || fileTextContent !== null);

  if (onValidateCallback) {
    onValidateCallback(hasRole && hasCv);
  }
};

export const getCvData = () => {
  if (selectedFile && (selectedFile.type === 'application/pdf' || selectedFile.name.endsWith('.pdf'))) {
    return { type: 'pdf', data: fileBase64, name: selectedFile.name };
  } else {
    return { type: 'text', data: fileTextContent, name: selectedFile ? selectedFile.name : '' };
  }
};

export const getJobDescription = () => {
  return '';
};

export const getCvTextContent = () => {
  return fileTextContent || '';
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
        reject(new Error('Error al decodificar las páginas del PDF.'));
      }
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo PDF.'));
  });
};

export const resetEntrada = () => {
  removeFile();
  validate();
};
