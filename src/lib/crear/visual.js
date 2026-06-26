import { getCvData, updateCvData, loadFromLocalStorage, resetCvData, subscribe } from './estado.js';
import { optimizarLogroConIA, optimizarCvCompletoConIA, estructurarCvConIA } from './wiibot.js';
import { descargarPdfDirecto, imprimirPdf, descargarDocx, descargarTxt, descargarMd, descargarJson } from './descarga/descargas.js';
import { Notificacion, wiSmart, abrirModal, cerrarModal, wiRateLimit } from '../widev.js';
import { isEditingPreview } from './preview/editarPreview.js';
import { updateA4Preview, updateScorecard } from './preview/renderPreview.js';
import {
  locales,
  setAbrirModalIA,
  renderContactoForm,
  renderPerfilForm,
  renderExperienciasForm,
  renderEducacionForm,
  renderSkillsForm,
  validarFormularios
} from './preview/renderForms.js';

let activeTab = 'contacto';

// ─── Punto de entrada público ─────────────────────────────────────────────────

export const initVisual = () => {
  const cv = loadFromLocalStorage();
  
  // Sincronizar el idioma del CV según la URL actual si está vacío
  const workspace = document.getElementById('crearWorkspace');
  const pageLang = workspace?.getAttribute('data-locale') || 'es';
  if (!cv.nombre && !cv.resumen && (!cv.experiencias || cv.experiencias.length <= 1) && cv.idioma !== pageLang) {
    updateCvData({ idioma: pageLang });
  }

  subscribe(onStateChange);
  setupGlobalListeners();
  setAbrirModalIA(abrirModalIA); // Inyectar callback de modal IA en renderForms
  cargarLibreriasExtraccion();
};

// ─── Pre-carga de librerías externas ─────────────────────────────────────────

const cargarLibreriasExtraccion = () => {
  wiSmart({ js: 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.11.0/mammoth.browser.min.js' });
  wiSmart({ js: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js' });
};

// ─── Reacción al cambio de estado ────────────────────────────────────────────

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

  if (!isEditingPreview()) updateA4Preview(cv);
  updateScorecard(cv);
};

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const renderTabs = (cv) => {
  const container = document.getElementById('crTabsHeader');
  if (!container) return;

  const isEn = cv.idioma === 'en';
  const tabLang = isEn ? locales.en.tabs : locales.es.tabs;

  const tabs = [
    { id: 'contacto',    label: tabLang.contacto,    icon: 'fa-address-card' },
    { id: 'perfil',      label: tabLang.perfil,      icon: 'fa-user' },
    { id: 'experiencia', label: tabLang.experiencia, icon: 'fa-briefcase' },
    { id: 'educacion',   label: tabLang.educacion,   icon: 'fa-graduation-cap' },
    { id: 'skills',      label: tabLang.skills,      icon: 'fa-sliders-h' }
  ];

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
        renderTabs(getCvData());
        renderFormContent(getCvData());
      }
    });
  });
};

// ─── Contenido del formulario activo ─────────────────────────────────────────

const renderFormContent = (cv) => {
  const container = document.getElementById('crFormContent');
  if (!container) return;
  container.innerHTML = '';

  switch (activeTab) {
    case 'contacto':    renderContactoForm(container, cv);    break;
    case 'perfil':      renderPerfilForm(container, cv);      break;
    case 'experiencia': renderExperienciasForm(container, cv);break;
    case 'educacion':   renderEducacionForm(container, cv);   break;
    case 'skills':      renderSkillsForm(container, cv);      break;
  }

  validarFormularios();
};

// ─── Listeners globales ───────────────────────────────────────────────────────

const setupGlobalListeners = () => {
  // Descargas
  document.getElementById('cr_btn_download_final')?.addEventListener('click', () => descargarPdfDirecto(getCvData()));
  document.getElementById('cr_btn_print')?.addEventListener('click', imprimirPdf);
  document.getElementById('cr_btn_dw_pdf')?.addEventListener('click',  () => descargarPdfDirecto(getCvData()));
  document.getElementById('cr_btn_dw_docx')?.addEventListener('click', () => descargarDocx(getCvData()));
  document.getElementById('cr_btn_dw_txt')?.addEventListener('click',  () => descargarTxt(getCvData()));
  document.getElementById('cr_btn_dw_md')?.addEventListener('click',   () => descargarMd(getCvData()));
  document.getElementById('cr_btn_dw_json')?.addEventListener('click', () => descargarJson(getCvData()));

  // Reset
  document.getElementById('cr_btn_reset_all')?.addEventListener('click',    () => abrirModal('cr_reset_modal'));
  document.getElementById('cr_btn_confirm_reset')?.addEventListener('click', () => {
    resetCvData();
    cerrarModal('cr_reset_modal');
    Notificacion('Se ha creado un nuevo currículum desde cero.', 'success');
  });
  document.getElementById('cr_btn_cancel_reset')?.addEventListener('click',     () => cerrarModal('cr_reset_modal'));
  document.getElementById('cr_btn_close_reset_modal')?.addEventListener('click', () => cerrarModal('cr_reset_modal'));

  // Optimizar Todo con Botwii
  document.getElementById('cr_btn_optimize_all')?.addEventListener('click', async () => {
    const cv = getCvData();
    const btn = document.getElementById('cr_btn_optimize_all');
    if (!btn) return;
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Optimizando...';
    try {
      const optimized = await optimizarCvCompletoConIA(cv, cv.titulo || '', cv.idioma || 'es');
      updateCvData(optimized);
      Notificacion('¡Currículum optimizado con Botwii exitosamente!', 'success');
    } catch (err) {
      console.error(err);
      Notificacion('No se pudo optimizar el currículum. Verifica tu conexión e intenta de nuevo.', 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  });

  // Modal IA (Wiibot - Optimizar Logro)
  document.getElementById('cr_btn_discard_ai')?.addEventListener('click', closeAIModal);
  document.getElementById('cr_btn_close_modal')?.addEventListener('click', closeAIModal);
  document.getElementById('cr_btn_apply_ai')?.addEventListener('click', applyAIOptimization);

  // Subida y autocompletado de CV (parser)
  const uploadCvBtn   = document.getElementById('cr_btn_upload_cv');
  const uploadCvInput = document.getElementById('cr_header_cv_file');

  uploadCvBtn?.addEventListener('click', () => {
    cargarLibreriasExtraccion();
    uploadCvInput?.click();
  });

  uploadCvInput?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleCvFileUpload(file, uploadCvInput);
  });

  // Clics en el preview sincronizan tab del formulario
  const printableArea = document.getElementById('cr_cv_printable_area');
  if (printableArea) {
    printableArea.addEventListener('click', (event) => {
      const target = event.target.closest('[data-click-tab]');
      if (target) {
        const tabId = target.getAttribute('data-click-tab');
        if (tabId && tabId !== activeTab) {
          activeTab = tabId;
          renderTabs(getCvData());
          renderFormContent(getCvData());
        }
      }
    });
  }
};

// ─── Modal de IA (Optimizar Logro) ───────────────────────────────────────────

let activeExpId = null;

// optimizarLogroConIA ya importado estáticamente arriba

const abrirModalIA = (exp) => {
  activeExpId = exp.id;
  const modal    = document.getElementById('cr_ai_modal');
  const origText = document.getElementById('cr_ai_original_text');
  const optText  = document.getElementById('cr_ai_optimized_text');
  const loader   = document.getElementById('cr_ai_loading');
  const applyBtn = document.getElementById('cr_btn_apply_ai');
  if (!modal || !origText || !optText || !loader || !applyBtn) return;

  const cv = getCvData();
  optText.setAttribute('lang', cv.idioma || 'es');
  optText.setAttribute('spellcheck', 'true');

  origText.textContent = exp.logros || '';
  optText.textContent  = '';
  optText.classList.add('dpn');
  loader.classList.remove('dpn');
  applyBtn.disabled = true;
  modal.classList.add('active');

  setTimeout(async () => {
    try {
      const result = await optimizarLogroConGemini(exp.logros, exp.puesto, exp.empresa);
      loader.classList.add('dpn');
      optText.textContent = result;
      optText.classList.remove('dpn');
      applyBtn.disabled = false;
    } catch (e) {
      loader.classList.add('dpn');
      optText.textContent = 'Hubo un error al optimizar con Gemini. Inténtalo de nuevo.';
      optText.classList.remove('dpn');
    }
  }, 0);
};

const optimizarLogroConGemini = async (textoOriginal, puesto, empresa) => {
  const isLogged = localStorage.getItem('wiSmile');
  let rate = null;
  if (!isLogged) {
    rate = wiRateLimit('guest_cv_creator_uses', 5, 315360000000);
    if (!rate.ok) {
      Notificacion('Has alcanzado el límite de 5 optimizaciones de prueba. Regístrate para continuar ilimitadamente.', 'warning', 6000);
      closeAIModal();
      const { abrirLogin } = await import('../login.js');
      abrirLogin('registrar');
      throw new Error('Limit reached');
    }
  }
  const result = await optimizarLogroConIA(textoOriginal, puesto, empresa);
  if (rate) rate.fail();
  return result;
};

const closeAIModal = () => {
  document.getElementById('cr_ai_modal')?.classList.remove('active');
  activeExpId = null;
};

const applyAIOptimization = () => {
  const optText = document.getElementById('cr_ai_optimized_text')?.textContent || '';
  if (activeExpId && optText) {
    const cv  = getCvData();
    const idx = cv.experiencias.findIndex(e => e.id === activeExpId);
    if (idx > -1) {
      const list = [...cv.experiencias];
      list[idx].logros = optText;
      updateCvData({ experiencias: list });
      if (activeTab === 'experiencia') renderFormContent(getCvData());
    }
  }
  closeAIModal();
};

// ─── Upload de CV (Parser PDF/DOCX) ──────────────────────────────────────────

const handleCvFileUpload = async (file, uploadCvInput) => {
  const isPdf  = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
              || file.name.toLowerCase().endsWith('.docx');

  if (!isPdf && !isDocx) {
    Notificacion('Formato no válido. Solo se admiten archivos PDF y Word (.docx)', 'error');
    return;
  }
  if (file.size > 4 * 1024 * 1024) {
    Notificacion('El archivo no debe superar los 4MB.', 'error');
    return;
  }

  const loaderOverlay = document.createElement('div');
  loaderOverlay.className = 'cr_loader_overlay';
  loaderOverlay.innerHTML = `
    <div class="conv_loader">
      <div class="cr_loader_header_zone">
        <h3>Analizando tu CV actual...</h3>
        <p>Wiibot está leyendo tu archivo y estructurando tus datos en el editor.</p>
      </div>
      <div class="cr_loader_progress_bar_bg">
        <div id="cr_loader_progress_fill" class="cr_loader_progress_fill"></div>
      </div>
      <div class="cr_loader_steps">
        <div class="cr_loader_step active" id="cr_step_1">
          <span class="cr_loader_step_icon"><i class="fas fa-file-pdf"></i></span>
          <span class="cr_loader_step_text">Leyendo y decodificando archivo...</span>
          <span class="cr_loader_step_check"><i class="fas fa-check"></i></span>
        </div>
        <div class="cr_loader_step" id="cr_step_2">
          <span class="cr_loader_step_icon"><i class="fas fa-brain"></i></span>
          <span class="cr_loader_step_text">Extrayendo textos y secciones...</span>
          <span class="cr_loader_step_check"><i class="fas fa-check"></i></span>
        </div>
        <div class="cr_loader_step" id="cr_step_3">
          <span class="cr_loader_step_icon"><i class="fas fa-keyboard"></i></span>
          <span class="cr_loader_step_text">Estructurando datos en el editor...</span>
          <span class="cr_loader_step_check"><i class="fas fa-check"></i></span>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(loaderOverlay);

  const progressFill = loaderOverlay.querySelector('#cr_loader_progress_fill');
  const steps = [1,2,3].map(n => loaderOverlay.querySelector(`#cr_step_${n}`));

  const updateLoader = (percent, activeStep, doneSteps = []) => {
    if (progressFill) progressFill.style.width = `${percent}%`;
    steps.forEach((step, idx) => {
      if (!step) return;
      step.className = 'cr_loader_step';
      if (doneSteps.includes(idx + 1)) step.classList.add('done');
      else if (activeStep === idx + 1) step.classList.add('active');
    });
  };

  // estructurarCvConIA ya importado estáticamente arriba
  let progressTimer = null;

  try {
    updateLoader(15, 1, []);
    let parsedData = null;
    let pdfWarnings = [];

    if (isPdf) {
      let extractedText = '';
      try { extractedText = (await parsePdf(file)).text || ''; } catch (e) { /* fallback */ }
      updateLoader(50, 2, [1]);
      let currentPercent = 50;
      progressTimer = setInterval(() => {
        if (currentPercent < 90) { currentPercent += 2; if (progressFill) progressFill.style.width = `${currentPercent}%`; }
      }, 300);

      if (extractedText.trim().length < 100) {
        const base64 = await convertFileToBase64(file);
        parsedData = await estructurarCvConIA(base64, '', 'auto', 'pdf');
        pdfWarnings = [{ type: 'tabla', text: 'Tu PDF anterior usaba tablas o columnas. Los escáneres ATS no pueden leer tablas correctamente: esto puede hacer que tu CV sea rechazado automáticamente en muchos sistemas. Revisa que tus datos estén bien cargados y usa el botón "Optimizar con Botwii" para mejorar el texto.' }];
      } else {
        parsedData = await estructurarCvConIA(extractedText, '', 'auto', 'text');
      }
    } else {
      const parseResult = await parseDocx(file);
      if (!parseResult.text.trim()) throw new Error('El archivo de Word está vacío.');
      updateLoader(50, 2, [1]);
      let currentPercent = 50;
      progressTimer = setInterval(() => {
        if (currentPercent < 90) { currentPercent += 2; if (progressFill) progressFill.style.width = `${currentPercent}%`; }
      }, 300);
      parsedData = await estructurarCvConIA(parseResult.text, '', 'auto', 'text');
    }

    if (progressTimer) clearInterval(progressTimer);
    if (!parsedData) throw new Error('No se pudieron procesar los datos del currículum.');

    updateLoader(100, 3, [1, 2, 3]);
    await new Promise(resolve => setTimeout(resolve, 500));

    parsedData._pdfWarnings = pdfWarnings;
    updateCvData(parsedData);

    // Redirección inteligente i18n
    const currentPath = window.location.pathname;
    const isCurrentlyEn = currentPath.includes('/en/crear');
    if (parsedData.idioma === 'en' && !isCurrentlyEn) {
      localStorage.setItem('crear_cv_en', JSON.stringify(parsedData));
      window.location.href = '/en/crear';
      return;
    } else if (parsedData.idioma === 'es' && isCurrentlyEn) {
      localStorage.setItem('crear_cv_es', JSON.stringify(parsedData));
      window.location.href = '/crear';
      return;
    }
    const msgExtra = pdfWarnings.length > 0 ? ' ⚠️ Revisa las alertas en el panel de compatibilidad.' : '';
    Notificacion(`¡CV cargado exitosamente! Revisa los campos y usa Botwii si deseas optimizarlo.${msgExtra}`, 'success', 6000);
  } catch (err) {
    console.error(err);
    if (progressTimer) clearInterval(progressTimer);
    Notificacion(err.message || 'Error al analizar e importar el CV.', 'error');
  } finally {
    loaderOverlay.remove();
    uploadCvInput.value = '';
  }
};

// ─── Helpers de parseo ────────────────────────────────────────────────────────

const convertFileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload  = () => resolve(reader.result.split(',')[1]);
  reader.onerror = (e) => reject(e);
});

const parseDocx = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const mammothLib = window.mammoth;
    if (!mammothLib) { reject(new Error('Librería de Word no está cargada en el cliente. Intenta de nuevo en unos segundos.')); return; }
    mammothLib.extractRawText({ arrayBuffer: e.target.result })
      .then(res => resolve({ text: res.value || '', chars: res.value?.length || 0, bytesRead: e.target.result.byteLength }))
      .catch(() => reject(new Error('Falló Mammoth al extraer Word.')));
  };
  reader.onerror = () => reject(new Error('Error de lectura del archivo Word.'));
  reader.readAsArrayBuffer(file);
});

const parsePdf = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = async (e) => {
    const pdfjsLib = window['pdfjs-dist/build/pdf'] || window.pdfjsLib;
    if (!pdfjsLib) { reject(new Error('Librería PDF no lista en el cliente. Intenta de nuevo en unos segundos.')); return; }
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(e.target.result) }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const tc   = await page.getTextContent();
        fullText += tc.items.map(item => item.str).join(' ') + '\n';
      }
      resolve({ text: fullText, pages: pdf.numPages, chars: fullText.length, bytesRead: e.target.result.byteLength });
    } catch (err) {
      reject(new Error('Error al parsear el PDF. Asegúrate de que no esté protegido o escaneado sin texto.'));
    }
  };
  reader.onerror = () => reject(new Error('Error de lectura del archivo PDF.'));
  reader.readAsArrayBuffer(file);
});
