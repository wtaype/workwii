import { wiSmart, Notificacion } from '../widev.js';

// Cargar Mammoth.js de forma diferida en interacción del usuario
wiSmart({
  js: 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js'
});

let selectedFile = null;
let fileBase64 = null;
let fileTextContent = null;
let manualMode = false;
let onValidateCallback = null;

// Selectores de DOM
let tabUpload, tabText, panelUpload, panelText, atsDropzone, fileInput, filePreviewContainer, cvTextarea, jobTextarea, cvCounter, jobCounter;
let uploadProgressContainer, uploadProgressBar, uploadProgressPercent;

export const initEntrada = (onValidate) => {
  onValidateCallback = onValidate;

  tabUpload = document.getElementById('tabUpload');
  tabText = document.getElementById('tabText');
  panelUpload = document.getElementById('panelUpload');
  panelText = document.getElementById('panelText');
  atsDropzone = document.getElementById('atsDropzone');
  fileInput = document.getElementById('fileInput');
  filePreviewContainer = document.getElementById('filePreviewContainer');
  cvTextarea = document.getElementById('cvTextarea');
  jobTextarea = document.getElementById('jobTextarea');
  cvCounter = document.getElementById('cvCounter');
  jobCounter = document.getElementById('jobCounter');

  uploadProgressContainer = document.getElementById('uploadProgressContainer');
  uploadProgressBar = document.getElementById('uploadProgressBar');
  uploadProgressPercent = document.getElementById('uploadProgressPercent');

  setupListeners();
};

const setupListeners = () => {
  tabUpload?.addEventListener('click', () => switchTab(false));
  tabText?.addEventListener('click', () => switchTab(true));

  // Drag & Drop
  atsDropzone?.addEventListener('click', () => fileInput?.click());
  atsDropzone?.addEventListener('dragover', (e) => { e.preventDefault(); atsDropzone.classList.add('dragover'); });
  atsDropzone?.addEventListener('dragleave', () => atsDropzone.classList.remove('dragover'));
  atsDropzone?.addEventListener('drop', (e) => {
    e.preventDefault();
    atsDropzone.classList.remove('dragover');
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
    if (cvCounter) cvCounter.textContent = `${cvTextarea.value.length.toLocaleString()} / 25,000 caracteres`;
    validate();
  });

  jobTextarea?.addEventListener('input', () => {
    if (jobCounter) jobCounter.textContent = `${jobTextarea.value.length.toLocaleString()} / 15,000 caracteres`;
    validate();
  });
};

const switchTab = (isTextMode) => {
  manualMode = isTextMode;
  if (isTextMode) {
    tabText?.classList.add('active');
    tabUpload?.classList.remove('active');
    if (panelText) panelText.style.display = 'flex';
    if (panelUpload) panelUpload.style.display = 'none';
  } else {
    tabUpload?.classList.add('active');
    tabText?.classList.remove('active');
    if (panelUpload) panelUpload.style.display = 'flex';
    if (panelText) panelText.style.display = 'none';
  }
  validate();
};

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
    } catch (err) {
      console.error(err);
      Notificacion('Error al leer el archivo PDF.', 'error');
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
  const hasJob = jobTextarea && jobTextarea.value.trim().length >= 10;
  let hasCv = false;

  if (manualMode) {
    hasCv = cvTextarea && cvTextarea.value.trim().length >= 50;
  } else {
    hasCv = selectedFile !== null && (fileBase64 !== null || fileTextContent !== null);
  }

  if (onValidateCallback) {
    onValidateCallback(hasJob && hasCv);
  }
};

export const getCvData = () => {
  if (manualMode) {
    return { type: 'text', data: cvTextarea ? cvTextarea.value.trim() : '' };
  } else {
    if (selectedFile && (selectedFile.type === 'application/pdf' || selectedFile.name.endsWith('.pdf'))) {
      return { type: 'pdf', data: fileBase64, name: selectedFile.name };
    } else {
      return { type: 'text', data: fileTextContent, name: selectedFile ? selectedFile.name : '' };
    }
  }
};

export const getJobDescription = () => {
  return jobTextarea ? jobTextarea.value.trim() : '';
};

export const resetEntrada = () => {
  removeFile();
  if (cvTextarea) {
    cvTextarea.value = '';
    if (cvCounter) cvCounter.textContent = '0 / 25,000 caracteres';
  }
  if (jobTextarea) {
    jobTextarea.value = '';
    if (jobCounter) jobCounter.textContent = '0 / 15,000 caracteres';
  }
  validate();
};
