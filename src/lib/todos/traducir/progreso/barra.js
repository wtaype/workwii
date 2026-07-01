/**
 * barra.js - Control visual premium del stepper de carga y tips rotativos.
 * Escrito en espanol sin tildes para evitar problemas de codificacion.
 */

const tipsEs = [
  { icon: 'fa-lightbulb', text: 'El 70% de las empresas multinacionales descartan curriculos con traducciones literales hechas por traductores genericos.' },
  { icon: 'fa-file-alt', text: 'Evita tablas y columnas multiples. Los ATS leen los CVs de izquierda a derecha en una sola columna.' },
  { icon: 'fa-tags', text: 'Los verbos de accion en ingles (como Led, Designed, Spearheaded) tienen el doble de impacto para reclutadores internacionales.' },
  { icon: 'fa-percentage', text: 'No traduzcas siglas de certificaciones globales (como Scrum, PMP, AWS) para evitar que los ATS las omitan.' },
  { icon: 'fa-font', text: 'Al traducir tu CV, manten los nombres de herramientas de software e idiomas de programacion en su formato estandar (ej: React, Python, Git).' },
  { icon: 'fa-id-card', text: 'Los curriculos en ingles suelen requerir una seccion de contacto limpia sin foto, estado civil, o direccion exacta en mercados de EE.UU./Reino Unido.' }
];

const tipsEn = [
  { icon: 'fa-lightbulb', text: '70% of multinational companies reject resumes with literal translations done by generic translators.' },
  { icon: 'fa-file-alt', text: 'Avoid tables and multiple columns. ATS scanners read resumes from left to right in a single column.' },
  { icon: 'fa-tags', text: 'Action verbs (like Led, Designed, Spearheaded) carry double the impact for international recruiters.' },
  { icon: 'fa-percentage', text: 'Keep global certification acronyms (like Scrum, PMP, AWS) in their original format so ATS scanners don\'t miss them.' },
  { icon: 'fa-font', text: 'Keep software names and programming languages in their standard formatting (e.g. React, Python, Git) when translating.' },
  { icon: 'fa-id-card', text: 'Resumes in English usually require a clean contact section without photo, marital status, or full address for US/UK job markets.' }
];

let tipsInterval = null;

/**
 * Inicializa la barra de carga premium con stepper de 5 fases y tips de optimizacion rotativos.
 * 
 * @param {number} duracionTotal - Duracion aproximada del proceso en ms (ej: 8000).
 * @param {string} targetLang - Idioma destino ('es' o 'en') para localizar los textos y tips.
 * @param {function} alFinalizar - Callback ejecutado cuando se completa el proceso.
 * @returns {function} - Funcion para detener y limpiar los timers del loader.
 */
export const iniciarProgresoVisual = (duracionTotal = 8000, targetLang = 'en', alFinalizar) => {
  const loaderContainer = document.getElementById('atsLoader');
  const trUploadContainer = document.getElementById('trUploadContainer');
  const headerClean = document.getElementById('trHeroHeader');

  const barFill   = document.getElementById('loaderBarFill');
  const barPct    = document.getElementById('loaderBarPct');
  const etaEl     = document.getElementById('loaderEta');
  const stepperEl = document.getElementById('loaderStepper');
  const tipEl     = document.getElementById('loaderTipContent');

  if (!loaderContainer) {
    if (alFinalizar) alFinalizar();
    return () => {};
  }

  // Ocultar la tarjeta de bienvenida y mostrar el loader
  if (trUploadContainer) trUploadContainer.style.display = 'none';
  if (headerClean) headerClean.style.display = 'none';
  loaderContainer.style.display = 'flex';
  loaderContainer.classList.remove('dpn');

  const isEn = targetLang === 'en';

  const steps = [
    { icon: 'fa-file-import', label: isEn ? 'Reading document...' : 'Leyendo el documento...', sub: isEn ? 'Verifying file format and structure' : 'Verificando formato y estructura del archivo' },
    { icon: 'fa-sitemap', label: isEn ? 'Analyzing structure...' : 'Analizando estructura original...', sub: isEn ? 'Mapping original experiences and sections' : 'Mapeando experiencias y secciones de origen' },
    { icon: 'fa-language', label: isEn ? 'Translating achievements...' : 'Traduciendo logros con Bootwii...', sub: isEn ? 'Translating verbs to impact-focused keywords' : 'Traduciendo verbos hacia keywords de impacto' },
    { icon: 'fa-wand-magic-sparkles', label: isEn ? 'Localizing to ATS standard...' : 'Localizando al estandar ATS...', sub: isEn ? 'Aligning skills and acronyms to global filters' : 'Alineando habilidades y siglas a filtros globales' },
    { icon: 'fa-arrows-spin', label: isEn ? 'Syncing workspace...' : 'Sincronizando el editor...', sub: isEn ? 'Preparing the dual-pane view and preview' : 'Preparando los formularios y vista previa' }
  ];

  // Renderizar los 5 pasos del stepper
  if (stepperEl) {
    stepperEl.innerHTML = steps.map((s, i) => `
      <div class="loader_step" id="lstep_${i}">
        <div class="loader_step_icon pending"><i class="fas ${s.icon}"></i></div>
        <div class="loader_step_body">
          <span class="loader_step_label">${s.label}</span>
          <span class="loader_step_sub">${s.sub}</span>
        </div>
        <div class="loader_step_check"><i class="fas fa-check"></i></div>
      </div>
    `).join('');
  }

  const activateStep = (idx) => {
    if (idx > 0) {
      const prev = document.getElementById(`lstep_${idx - 1}`);
      if (prev) {
        prev.classList.remove('active');
        prev.classList.add('done');
      }
    }
    const curr = document.getElementById(`lstep_${idx}`);
    if (curr) curr.classList.add('active');
  };

  activateStep(0);
  const totalSteps = steps.length;
  const stepDuration = duracionTotal / totalSteps;
  const stepTimers = [];

  for (let i = 1; i < totalSteps; i++) {
    const t = setTimeout(() => activateStep(i), stepDuration * i);
    stepTimers.push(t);
  }

  // Rotador de tips positivos
  const activeTips = [...(isEn ? tipsEn : tipsEs)].sort(() => Math.random() - 0.5);
  let tipIndex = 0;

  const renderTip = () => {
    if (!tipEl) return;
    const tip = activeTips[tipIndex % activeTips.length];
    tipEl.style.opacity = '0';
    setTimeout(() => {
      tipEl.innerHTML = `
        <i class="fas ${tip.icon}"></i>
        <span>${tip.text}</span>
      `;
      tipEl.style.opacity = '1';
    }, 300);
    tipIndex++;
  };

  renderTip();
  if (tipsInterval) clearInterval(tipsInterval);
  tipsInterval = setInterval(renderTip, 4500);

  // Barra de progreso fluida
  let pct = 0;
  const startTime = performance.now();
  let animationFrameId = null;

  const animBar = (now) => {
    const elapsed = now - startTime;
    pct = Math.min(Math.round((elapsed / duracionTotal) * 95), 95);
    
    if (barFill) barFill.style.width = `${pct}%`;
    if (barPct) barPct.textContent = `${pct}%`;

    const remaining = Math.max(0, Math.round((duracionTotal - elapsed) / 1000));
    if (etaEl) {
      etaEl.textContent = remaining > 0 
        ? (isEn ? `~${remaining}s remaining` : `~${remaining}s restantes`) 
        : (isEn ? 'Finishing...' : 'Finalizando...');
    }

    if (pct < 95) {
      animationFrameId = requestAnimationFrame(animBar);
    }
  };

  animationFrameId = requestAnimationFrame(animBar);

  // Retornar funcion de finalizacion/destruccion limpia
  return () => {
    stepTimers.forEach(t => clearTimeout(t));
    if (tipsInterval) {
      clearInterval(tipsInterval);
      tipsInterval = null;
    }
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }

    // Marcar el ultimo paso como hecho
    const lastStep = document.getElementById(`lstep_${totalSteps - 1}`);
    if (lastStep) {
      lastStep.classList.remove('active');
      lastStep.classList.add('done');
    }

    if (barFill) barFill.style.width = '100%';
    if (barPct) barPct.textContent = '100%';
    if (etaEl) etaEl.textContent = isEn ? 'Translation completed!' : '¡Traducción completada!';

    setTimeout(() => {
      loaderContainer.style.display = 'none';
      loaderContainer.classList.add('dpn');
      if (alFinalizar) alFinalizar();
    }, 500);
  };
};
