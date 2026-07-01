import { Notificacion, wiSmart } from '../../widev/widev.js';
import { abrirModal, cerrarTodos } from '../../widev/modales.js';
import { removels } from '../../widev/storage.js';
import { getCvData as getCvState, updateCvData, loadFromLocalStorage, resetCvData, subscribe } from './estado.js';
import { estructurarCvConIA } from './progreso/bootwii.js';
import { descargarPdfDirecto, imprimirPdf, descargarDocx, descargarTxt, descargarMd, descargarJson } from './preview/descarga/descargas.js';
import { isEditingPreview } from './preview/editarPreview.js';
import { updateA4Preview, updateScorecard } from './preview/renderPreview.js';
import { SECCIONES } from './estado.js';
import { iniciarProgresoVisual } from './progreso/barra.js';
import {
  renderContactoForm,
  renderPerfilForm,
  renderExperienciasForm,
  renderEducacionForm,
  renderProyectosForm,
  renderCertificadosForm,
  renderSkillsForm,
  validarFormularios
} from './preview/renderForms.js';

// Cargar librerías de forma diferida en interacción del usuario
export const cargarLibreriasExtraccion = () => {
  wiSmart({ js: 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.11.0/mammoth.browser.min.js' });
  wiSmart({ js: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js' });
};

let selectedFile = null;
let fileBase64 = null;
let fileTextContent = null;
let activeTab = 'contacto';

// Selectores de DOM
let atsDropzone, fileInput, filePreviewContainer;
let btnTranslateAction, atsTargetLang, trUploadContainer, traducirWorkspace;
let trBtnResetUpload, trDownloadDropdown, trHeroHeader, trEditorHeader, body_traducir;

export const initTraducir = () => {
  atsDropzone = document.getElementById('atsDropzone');
  fileInput = document.getElementById('fileInput');
  filePreviewContainer = document.getElementById('filePreviewContainer');

  btnTranslateAction = document.getElementById('btnTranslateAction');
  atsTargetLang = document.getElementById('atsTargetLang');
  trUploadContainer = document.getElementById('trUploadContainer');
  traducirWorkspace = document.getElementById('traducirWorkspace');

  trBtnResetUpload = document.getElementById('tr_btn_reset_upload');
  trDownloadDropdown = document.getElementById('trDownloadDropdown');
  trHeroHeader = document.getElementById('trHeroHeader');
  trEditorHeader = document.getElementById('trEditorHeader');
  body_traducir = document.getElementById('body_traducir');

  setupListeners();

  // Cargar caché si existe al refrescar (F5) para cuidar recursos
  loadFromLocalStorage();
  const cv = getCvState();

  if (cv && cv.nombre && (cv.nombre.trim() !== '' || cv.resumen.trim() !== '')) {
    // Ocultar pantalla de subida y cabecera de héroe
    if (trHeroHeader) trHeroHeader.style.display = 'none';
    if (body_traducir) body_traducir.style.display = 'none';
    if (trUploadContainer) trUploadContainer.style.display = 'none';

    // Revelar editor de doble panel y cabecera de controles
    if (traducirWorkspace) traducirWorkspace.classList.remove('dpn');
    if (trEditorHeader) trEditorHeader.classList.remove('dpn');

    // Inicializar listeners del editor reactivo
    subscribe(onStateChange);

    // Forzar primera carga de la UI
    renderTabs(cv);
    renderFormContent(cv);
    updateA4Preview(cv);
  }
};

const setupListeners = () => {
  // Drag & Drop
  atsDropzone?.addEventListener('mouseenter', cargarLibreriasExtraccion, { once: true });
  atsDropzone?.addEventListener('click', () => {
    cargarLibreriasExtraccion();
    fileInput?.click();
  });
  atsDropzone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    atsDropzone.classList.add('dragover');
  });
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

  // Botón de Traducir
  btnTranslateAction?.addEventListener('click', ejecutarTraduccionCompleta);

  // Botón de Reiniciar (ahora abre modal de confirmación)
  trBtnResetUpload?.addEventListener('click', () => abrirModal('cr_reset_modal'));

  // Listeners del Modal de Confirmación
  document.getElementById('cr_btn_confirm_reset')?.addEventListener('click', () => {
    reiniciarTraductor();
    cerrarTodos();
  });
  document.getElementById('cr_btn_cancel_reset')?.addEventListener('click', cerrarTodos);
  document.getElementById('cr_btn_close_reset_modal')?.addEventListener('click', cerrarTodos);

  // Listeners de Descarga
  document.getElementById('cr_btn_download_final')?.addEventListener('click', () => descargarPdfDirecto(getCvState()));
  document.getElementById('cr_btn_dw_pdf')?.addEventListener('click', () => descargarPdfDirecto(getCvState()));
  document.getElementById('cr_btn_dw_docx')?.addEventListener('click', () => descargarDocx(getCvState()));
  document.getElementById('cr_btn_dw_txt')?.addEventListener('click', () => descargarTxt(getCvState()));
  document.getElementById('cr_btn_dw_md')?.addEventListener('click', () => descargarMd(getCvState()));
  document.getElementById('cr_btn_dw_json')?.addEventListener('click', () => descargarJson(getCvState()));

  // Sincronización clic en preview -> cambiar pestaña de formulario
  const printableArea = document.getElementById('cr_cv_printable_area');
  if (printableArea) {
    printableArea.addEventListener('click', (event) => {
      const target = event.target.closest('[data-click-tab]');
      if (target) {
        const tabId = target.getAttribute('data-click-tab');
        if (tabId && tabId !== activeTab) {
          activeTab = tabId;
          renderTabs(getCvState());
          renderFormContent(getCvState());
        }
      }
    });
  }
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

  renderFilePreview();

  try {
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      fileBase64 = await convertFileToBase64(file);
      const parsed = await parsePdf(file);
      fileTextContent = parsed.text || '';
    } else {
      fileTextContent = await extractTextFromDocx(file);
    }
  } catch (err) {
    console.error(err);
    Notificacion('Error al leer y extraer texto del documento.', 'error');
    removeFile();
  }

  validateInputs();
};

const renderFilePreview = () => {
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

  filePreviewContainer.style.display = 'block';
  filePreviewContainer.classList.remove('dpn');
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
    filePreviewContainer.classList.add('dpn');
  }
  if (atsDropzone) atsDropzone.style.display = 'flex';
  if (fileInput) fileInput.value = '';
  
  validateInputs();
};

const validateInputs = () => {
  const hasCv = selectedFile !== null && (fileBase64 !== null || fileTextContent !== null || fileTextContent === '');
  if (btnTranslateAction) {
    btnTranslateAction.disabled = !hasCv;
  }
};

const ejecutarTraduccionCompleta = async () => {
  if (!selectedFile) return;

  const targetLang = atsTargetLang?.value || 'en';
  const isPdf = selectedFile.type === 'application/pdf' || selectedFile.name.endsWith('.pdf');
  const inputType = (isPdf && fileTextContent.trim().length < 100) ? 'pdf' : 'text';
  const payload = inputType === 'pdf' ? fileBase64 : fileTextContent;

  if (btnTranslateAction) btnTranslateAction.disabled = true;

  let translationError = null;
  let parsedData = null;

  // 1. Lanzar el stepper y rotador de tips premium
  const finalizarProgreso = iniciarProgresoVisual(8000, targetLang, () => {
    if (translationError) {
      Notificacion(translationError, 'error');
      if (btnTranslateAction) btnTranslateAction.disabled = false;
      
      // Restaurar interfaz inicial de subida
      if (trHeroHeader) trHeroHeader.style.display = 'block';
      if (body_traducir) body_traducir.style.display = 'block';
      if (trUploadContainer) trUploadContainer.style.display = 'flex';
      return;
    }

    // Ocultar pantalla de subida y cabecera de héroe
    if (trHeroHeader) trHeroHeader.style.display = 'none';
    if (body_traducir) body_traducir.style.display = 'none';
    if (trUploadContainer) trUploadContainer.style.display = 'none';

    // Revelar editor de doble panel y cabecera de controles
    if (traducirWorkspace) traducirWorkspace.classList.remove('dpn');
    if (trEditorHeader) trEditorHeader.classList.remove('dpn');

    // Inicializar listeners del editor reactivo
    subscribe(onStateChange);

    // Guardar los datos traducidos en el estado global
    updateCvData(parsedData);
    
    // Forzar primera carga de la UI
    renderTabs(parsedData);
    renderFormContent(parsedData);
    updateA4Preview(parsedData);
    
    Notificacion(targetLang === 'en' ? 'Resume translated successfully!' : '¡Currículum traducido y cargado exitosamente!', 'success');
  });

  // 2. Ejecutar la llamada a la IA en segundo plano
  try {
    parsedData = await estructurarCvConIA(payload, '', targetLang, inputType);
    if (!parsedData) {
      throw new Error('No se pudo estructurar la traducción del currículum.');
    }
  } catch (err) {
    console.error(err);
    translationError = err.message || 'Error en el servicio de traducción de la IA.';
  } finally {
    // Concluir animación
    finalizarProgreso();
  }
};

const onStateChange = (cv) => {
  const activeEl = document.activeElement;
  const isTyping = activeEl && (
    activeEl.tagName === 'TEXTAREA' ||
    (activeEl.tagName === 'INPUT' && ['text','email','tel','url'].includes(activeEl.type))
  );

  if (!isTyping) {
    renderTabs(cv);
    renderFormContent(cv);
  } else {
    validarFormularios();
  }

  if (!isEditingPreview()) {
    updateA4Preview(cv);
  }
  updateScorecard(cv);
};

// ─── Renderizado de Formularios y Pestañas del Editor ──────────────────────────

const renderTabs = (cv) => {
  const container = document.getElementById('crTabsHeader');
  if (!container) return;

  const isEn = cv.idioma === 'en';
  
  const tabs = SECCIONES.map(sec => ({
    id: sec.id,
    label: isEn ? sec.label.en : sec.label.es,
    icon: sec.icon
  }));

  container.innerHTML = tabs.map(tab => `
    <button class="conv_tab_btn ${tab.id === activeTab ? 'active' : ''}" data-tab="${tab.id}">
      <i class="fas ${tab.icon}"></i>
      <span>${tab.label}</span>
    </button>
  `).join('');

  container.querySelectorAll('.conv_tab_btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      if (tabId) {
        activeTab = tabId;
        renderTabs(getCvState());
        renderFormContent(getCvState());
      }
    });
  });
};

const renderFormContent = (cv) => {
  const container = document.getElementById('crFormContent');
  if (!container) return;
  container.innerHTML = '';

  switch (activeTab) {
    case 'contacto':     renderContactoForm(container, cv);    break;
    case 'perfil':       renderPerfilForm(container, cv);      break;
    case 'experiencia':  renderExperienciasForm(container, cv);break;
    case 'educacion':    renderEducacionForm(container, cv);   break;
    case 'proyectos':    renderProyectosForm(container, cv);   break;
    case 'certificados': renderCertificadosForm(container, cv);break;
    case 'skills':       renderSkillsForm(container, cv);      break;
  }

  validarFormularios();
};

const reiniciarTraductor = () => {
  resetCvData();
  removeFile();

  // Restaurar pantalla de subida y cabecera de héroe
  if (trHeroHeader) trHeroHeader.style.display = 'block';
  if (body_traducir) {
    body_traducir.style.display = 'block';
    if (trUploadContainer) trUploadContainer.style.display = 'flex';
  }

  // Ocultar editor de doble panel y cabecera de controles
  if (traducirWorkspace) traducirWorkspace.classList.add('dpn');
  if (trEditorHeader) trEditorHeader.classList.add('dpn');
};

// ─── Helpers de Lectura ──────────────────────────────────────────────────────

const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
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
            if (!text.trim()) reject(new Error('El archivo de Word está vacío.'));
            else resolve(text);
          })
          .catch((err) => reject(err));
      } else {
        reject(new Error('Lector de Word no listo.'));
      }
    };
    reader.onerror = (e) => reject(e);
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
        resolve({ text: fullText });
      } catch (err) {
        console.error('Pdfjs error:', err);
        reject(new Error('Error al decodificar las páginas del PDF.'));
      }
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo PDF.'));
  });
};
