// src/lib/analisar/visual.js
// Controlador de eventos del cliente y lógica visual del Módulo de Análisis

import { wiRateLimit, Notificacion, wiTip, abrirModal, cerrarTodos } from '../../widev/widev.js';
import { descargarPdfReporte, descargarDocxReporte, descargarTxtReporte, descargarMdReporte, descargarJsonReporte } from './descarga/descargas.js';
import { initEntrada, getCvData, getJobDescription, resetEntrada } from './entrada.js';
import { analizarCvConGemini } from './analisis.js';
import { initResultado, startLoader, finishLoader, displayResults, copyActionPlan, resetResults, LIMITE_ANALISIS } from './resultado.js';

let btnAnalyze = null;
let currentLang = 'es';

export const initVisual = (lang = 'es') => {
  currentLang = lang;
  btnAnalyze = document.getElementById('btnAnalyze');

  initEntrada(validateForm);
  initResultado();
  wiTip(); // Inicializar tooltips dinámicos en la página

  btnAnalyze?.addEventListener('click', startAnalysis);
  document.getElementById('btnBack')?.addEventListener('click', () => {
    abrirModal('modalConfirmBack');
  });
  document.getElementById('btnConfirmReset')?.addEventListener('click', () => {
    cerrarTodos();
    resetWorkspace();
  });
  document.getElementById('btnCopyReport')?.addEventListener('click', copyActionPlan);

  // Dropdown de descarga
  const ddBtn = document.getElementById('btnDownloadDropdown');
  const ddMenu = document.getElementById('downloadMenu');
  const arrow = document.getElementById('dropdownArrow');

  ddBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    ddMenu?.classList.toggle('show');
    if (arrow) {
      const isShow = ddMenu?.classList.contains('show');
      arrow.style.transform = isShow ? 'rotate(180deg)' : 'rotate(0deg)';
    }
  });

  // Cerrar dropdown al hacer click fuera
  document.addEventListener('click', () => {
    ddMenu?.classList.remove('show');
    if (arrow) arrow.style.transform = 'rotate(0deg)';
  });

  // Descarga TXT
  document.getElementById('btnDownloadTxt')?.addEventListener('click', () => {
    const report = getActiveReport();
    if (report) descargarTxtReporte(report, currentLang);
  });

  // Descarga MD
  document.getElementById('btnDownloadMd')?.addEventListener('click', () => {
    const report = getActiveReport();
    if (report) descargarMdReporte(report, currentLang);
  });

  // Descarga Word (DOCX)
  document.getElementById('btnDownloadDocx')?.addEventListener('click', () => {
    const report = getActiveReport();
    if (report) descargarDocxReporte(report, currentLang);
  });

  // Descarga PDF
  document.getElementById('btnDownloadPdf')?.addEventListener('click', () => {
    const report = getActiveReport();
    if (report) descargarPdfReporte(report, currentLang);
  });

  // Descarga JSON
  document.getElementById('btnDownloadJson')?.addEventListener('click', () => {
    const report = getActiveReport();
    if (report) descargarJsonReporte(report);
  });
};

const getActiveReport = () => {
  try {
    const raw = localStorage.getItem('ats_last_report');
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
};

const validateForm = (isValid) => {
  if (btnAnalyze) btnAnalyze.disabled = !isValid;
};

const startAnalysis = async () => {
  const isLogged = localStorage.getItem('wiSmile');
  let rate = null;

  if (!isLogged) {
    rate = wiRateLimit('guest_ats_cv_analysis', LIMITE_ANALISIS, 315360000000);
    if (!rate.ok) {
      const msg = currentLang === 'en'
        ? `You have reached the limit of ${LIMITE_ANALISIS} test uses. Register for free to continue without limits.`
        : `Has alcanzado el límite de ${LIMITE_ANALISIS} usos de prueba. Regístrate gratis para continuar sin límites.`;
      Notificacion(msg, 'warning', 6000);
      const { abrirLogin } = await import('../../wiauth/visual.js');
      abrirLogin('registrar');
      return;
    }
  } else {
    // Validar límite diario para registrados (Anti-Abuso)
    rate = wiRateLimit('ats_cv_analysis', LIMITE_ANALISIS, 'dia');
    if (!rate.ok) {
      const msg = currentLang === 'en'
        ? `Daily limit reached (${LIMITE_ANALISIS} analyses). Try again in ${rate.min} minutes.`
        : `Límite diario alcanzado (${LIMITE_ANALISIS} análisis). Intenta nuevamente en ${rate.min} minutos.`;
      Notificacion(msg, 'warning', 5000);
      return;
    }
  }

  // ── Stepper premium loader ────────────────────────────────────────────
  const loaderHandles = startLoader();

  try {
    const cvInfo = getCvData();
    const jobDesc = getJobDescription();
    const targetRole = document.getElementById('atsTargetRole')?.value || '';
    const targetLang = document.getElementById('atsTargetLang')?.value || 'es';

    const report = await analizarCvConGemini(cvInfo.data, jobDesc, cvInfo.type, targetRole, targetLang);
    rate.fail();

    finishLoader(loaderHandles);
    // Breve pausa para que el usuario vea el 100% completado
    await new Promise(r => setTimeout(r, 400));
    displayResults(report);

  } catch (err) {
    console.error(err);
    finishLoader(loaderHandles);
    const errMsg = currentLang === 'en'
      ? 'Could not complete the analysis with the AI. Check your connection and try again.'
      : 'No se pudo completar el análisis con la IA. Verifica tu conexión e intenta de nuevo.';
    Notificacion(errMsg, 'error');
    resetWorkspace();
  }
};

export const resetWorkspace = () => {
  resetResults();
  resetEntrada();
  const roleInput = document.getElementById('atsTargetRole');
  if (roleInput) roleInput.value = '';
  const langSelect = document.getElementById('atsTargetLang');
  if (langSelect) langSelect.value = 'es';
  if (btnAnalyze) btnAnalyze.disabled = true;
};
