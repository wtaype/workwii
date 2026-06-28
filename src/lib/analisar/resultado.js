import { Mensaje, Notificacion, wiTip } from '../widev/widev.js';
import { getCvTextContent, getJobDescription } from './entrada.js';
import { initTipsRotator, renderScoreTips } from './tips_ats.js';

// ─── Clave de persistencia ─────────────────────────────────────────────────
const STORAGE_KEY = 'ats_last_report';

let atsWorkspace, atsLoader, atsResults, atsHeader;
let gaugeCircle, gaugeNum, gaugeStatus, resultSummary;
let matchedKeywordsContainer, missingKeywordsContainer, recommendationsContainer;
let activeReport = null;
let stopTipsRotator = null;

// Desglose
let scoreContact, scoreExperience, scoreEducation, scoreSkills;
let barContact, barExperience, barEducation, barSkills;
let btnOptimizeEditor;

// Plan + Auditoría
let atsAuditList, planProgressWrap, planProgressPercent, planProgressBar, planProgressText;

export const initResultado = () => {
  atsWorkspace  = document.getElementById('atsWorkspace');
  atsLoader     = document.getElementById('atsLoader');
  atsResults    = document.getElementById('atsResults');
  atsHeader     = document.querySelector('.ats_header');

  gaugeCircle   = document.getElementById('gaugeCircle');
  gaugeNum      = document.getElementById('gaugeNum');
  gaugeStatus   = document.getElementById('gaugeStatus');
  resultSummary = document.getElementById('resultSummary');

  matchedKeywordsContainer  = document.getElementById('matchedKeywordsContainer');
  missingKeywordsContainer  = document.getElementById('missingKeywordsContainer');
  recommendationsContainer  = document.getElementById('recommendationsContainer');

  scoreContact    = document.getElementById('scoreContact');
  scoreExperience = document.getElementById('scoreExperience');
  scoreEducation  = document.getElementById('scoreEducation');
  scoreSkills     = document.getElementById('scoreSkills');

  barContact    = document.getElementById('barContact');
  barExperience = document.getElementById('barExperience');
  barEducation  = document.getElementById('barEducation');
  barSkills     = document.getElementById('barSkills');

  btnOptimizeEditor = document.getElementById('btnOptimizeEditor');
  atsAuditList      = document.getElementById('atsAuditList');
  planProgressWrap  = document.getElementById('planProgressWrap');
  planProgressPercent = document.getElementById('planProgressPercent');
  planProgressBar   = document.getElementById('planProgressBar');
  planProgressText  = document.getElementById('planProgressText');

  setupDashboardEvents();
  _restoreFromStorage();
};

// ─── Restaurar reporte guardado ────────────────────────────────────────────
const _restoreFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (!saved || typeof saved.score === 'undefined') return;
    displayResults(saved, false);
  } catch (_) {
    localStorage.removeItem(STORAGE_KEY);
  }
};

// ─── Stepper loader ────────────────────────────────────────────────────────
const LOADER_STEPS = [
  { icon: 'fa-file-import',      label: 'Leyendo el documento...',                sub: 'Verificando formato y estructura del archivo' },
  { icon: 'fa-sitemap',          label: 'Identificando secciones...',             sub: 'Mapeando Experiencia, Educación, Habilidades' },
  { icon: 'fa-brain',            label: 'Extrayendo habilidades y logros...',     sub: 'Analizando verbos de acción y logros cuantificados' },
  { icon: 'fa-magnifying-glass-chart', label: 'Comparando con el puesto objetivo...', sub: 'Buscando coincidencias de keywords críticas' },
  { icon: 'fa-wand-magic-sparkles', label: 'Generando tu reporte personalizado...', sub: 'Calculando score, plan de acción y recomendaciones' },
];

export const startLoader = () => {
  if (atsWorkspace) atsWorkspace.style.display = 'none';
  if (atsHeader) atsHeader.classList.add('ats_header_hidden');
  if (atsLoader) atsLoader.style.display = 'flex';

  // Render stepper
  const stepperEl = document.getElementById('loaderStepper');
  const barFill   = document.getElementById('loaderBarFill');
  const barPct    = document.getElementById('loaderBarPct');
  const etaEl     = document.getElementById('loaderEta');

  if (stepperEl) {
    stepperEl.innerHTML = LOADER_STEPS.map((s, i) => `
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

  let currentStep = 0;
  let pct = 0;
  const totalSteps = LOADER_STEPS.length;
  const stepDuration = 2800; // ms por paso
  const totalDuration = stepDuration * totalSteps;

  const activateStep = (idx) => {
    // Marcar el paso anterior como completado
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

  // Barra de progreso suave
  const startTime = performance.now();
  const animBar = (now) => {
    const elapsed = now - startTime;
    pct = Math.min(Math.round((elapsed / totalDuration) * 95), 95); // Llega hasta 95%, el 100% lo hace displayResults
    if (barFill) barFill.style.width = `${pct}%`;
    if (barPct)  barPct.textContent  = `${pct}%`;

    const remaining = Math.max(0, Math.round((totalDuration - elapsed) / 1000));
    if (etaEl) etaEl.textContent = remaining > 0 ? `~${remaining}s restantes` : 'Finalizando...';

    if (pct < 95) requestAnimationFrame(animBar);
  };
  requestAnimationFrame(animBar);

  // Activar pasos secuencialmente
  activateStep(0);
  const stepTimers = [];
  for (let i = 1; i < totalSteps; i++) {
    const t = setTimeout(() => activateStep(i), stepDuration * i);
    stepTimers.push(t);
  }

  // Tips rotator
  stopTipsRotator = initTipsRotator('loaderTipContent');

  // Retornar función para limpiar
  return { stepTimers, barFill, barPct, etaEl };
};

export const finishLoader = ({ stepTimers, barFill, barPct, etaEl }) => {
  stepTimers.forEach(t => clearTimeout(t));
  if (stopTipsRotator) { stopTipsRotator(); stopTipsRotator = null; }

  // Completar el último step y la barra
  const lastStep = document.getElementById(`lstep_${LOADER_STEPS.length - 1}`);
  if (lastStep) { lastStep.classList.remove('active'); lastStep.classList.add('done'); }
  if (barFill) barFill.style.width = '100%';
  if (barPct)  barPct.textContent  = '100%';
  if (etaEl)   etaEl.textContent   = '¡Análisis completado!';
};

// ─── Eventos del dashboard ─────────────────────────────────────────────────
const setupDashboardEvents = () => {
  const tabs = document.querySelectorAll('.ats_dash_tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.getAttribute('data-dash-tab');
      if (!tabId) return;
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.ats_dash_pane').forEach(p => p.classList.remove('active'));
      const target = document.getElementById('pane' + tabId.charAt(0).toUpperCase() + tabId.slice(1));
      if (target) target.classList.add('active');
    });
  });

  btnOptimizeEditor?.addEventListener('click', () => {
    const text = getCvTextContent();
    const jobDesc = getJobDescription();
    const roleEl = document.getElementById('atsTargetRole');
    const targetRole = roleEl ? roleEl.value : '';

    if (!text?.trim()) {
      Notificacion('No se detectó texto extraído del CV. Por favor analiza un archivo primero.', 'warning');
      return;
    }
    localStorage.setItem('convertir_ats_raw_text', text);
    localStorage.setItem('convertir_ats_target_role', targetRole || jobDesc);
    localStorage.setItem('convertir_ats_job_desc', jobDesc);
    Notificacion('¡Datos de CV listos! Redirigiendo al optimizador con IA...', 'success', 3000);
    setTimeout(() => { window.location.href = '/convertir-ats'; }, 850);
  });
};

// ─── Renderizar resultados ─────────────────────────────────────────────────
export const displayResults = (report, saveToStorage = true) => {
  activeReport = report;

  if (saveToStorage) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(report)); } catch (_) {}
  }

  if (atsHeader)    atsHeader.classList.add('ats_header_hidden');
  if (atsLoader)    atsLoader.style.display = 'none';
  if (atsWorkspace) atsWorkspace.style.display = 'none';
  if (atsResults)   atsResults.style.display = 'flex';

  const score = parseInt(report.score) || 0;

  // 1. Gauge + badge
  setGaugeValue(score);
  if (gaugeStatus) {
    const label = score >= 90 ? 'Excelente Match' : score >= 75 ? 'Buen Match' : score >= 50 ? 'Match Regular' : 'Coincidencia Baja';
    const cls   = score >= 75 ? 'ats_status_excelente' : score >= 50 ? 'ats_status_aceptable' : 'ats_status_critico';
    gaugeStatus.textContent = label;
    gaugeStatus.className = `ats_status_badge ${cls}`;
  }

  // 2. Score context band
  const contextEl = document.getElementById('scoreContextBand');
  if (contextEl) {
    const bands = [
      { min: 90, label: '🏆 Listo para postular — Top candidatos', cls: 'band_excellent' },
      { min: 75, label: '✅ Supera la mayoría de filtros ATS',     cls: 'band_good'      },
      { min: 50, label: '⚠️ Puede pasar algunos filtros',          cls: 'band_medium'    },
      { min: 0,  label: '🔴 Necesita revisión urgente',            cls: 'band_critical'  },
    ];
    const band = bands.find(b => score >= b.min);
    contextEl.className = `score_context_band ${band.cls}`;
    contextEl.textContent = band.label;
  }

  // 3. Mini stat chips
  const profile = report.detectedProfile || {};
  _renderStatChips(score, profile);

  // 4. Semáforo de legibilidad ATS
  _renderSemaforo(profile);

  // 5. Benchmark
  _renderBenchmark(score, report.benchmark);

  // 6. Resumen
  if (resultSummary) {
    resultSummary.textContent = report.summary || 'Análisis completado.';
  }

  // 7. Perfil detectado por ATS
  _renderDetectedProfile(profile);

  // 8. Calidad del lenguaje
  _renderLanguageQuality(report.languageQuality);

  // 9. Keywords
  _renderKeywords(report.matchedKeywords, report.missingKeywords);

  // 10. Plan de Acción
  _renderPlan(report.recommendations);

  // 11. Auditoría de Formato
  _renderAudit(report.atsWarnings);

  // 12. Tips contextuales según score
  renderScoreTips('scoreTipsContainer', score);

  // 13. Desglose analítico animado
  _renderBreakdown(score, report.breakdown);
};

// ─── Chips de estadísticas ─────────────────────────────────────────────────
const _renderStatChips = (score, profile) => {
  const el = document.getElementById('statChips');
  if (!el) return;
  const pages   = profile.estimatedPages || 1;
  const words   = profile.totalWords || '—';
  const sects   = profile.sectionsFound?.length || 0;
  const sectMax = 6;
  el.innerHTML = `
    <span class="stat_chip"><i class="fas fa-file-lines"></i> ${pages} ${pages === 1 ? 'página' : 'páginas'}</span>
    <span class="stat_chip"><i class="fas fa-align-left"></i> ${words} palabras</span>
    <span class="stat_chip"><i class="fas fa-layer-group"></i> ${sects}/${sectMax} secciones</span>
  `;
};

// ─── Semáforo de legibilidad ───────────────────────────────────────────────
const _renderSemaforo = (profile) => {
  const el = document.getElementById('atsSemaforo');
  if (!el) return;
  const ok = profile.atsParseable !== false;
  el.className = `ats_semaforo ${ok ? 'sem_ok' : 'sem_error'}`;
  el.innerHTML = `
    <span class="sem_dot"></span>
    <span>${ok ? 'Texto extraíble — Alta legibilidad ATS' : 'Problemas de parseo detectados'}</span>
  `;
};

// ─── Benchmark comparativo ─────────────────────────────────────────────────
const _renderBenchmark = (score, bench) => {
  const el = document.getElementById('benchmarkCard');
  if (!el) return;
  const avg = bench?.sectorAverage  || 61;
  const top = bench?.topCandidates  || 88;
  const thr = bench?.passThreshold  || 75;

  const vsAvg = score > avg ? `<span class="bch_up">+${score - avg}% sobre la media ✅</span>` : `<span class="bch_down">${score - avg}% bajo la media</span>`;
  const vsTop = score >= top ? `<span class="bch_up">¡Estás entre los mejores! 🏆</span>` : `<span class="bch_neutral">Meta: alcanzar ${top}% 🎯</span>`;

  el.innerHTML = `
    <div class="bch_row">
      <span class="bch_label"><i class="fas fa-users"></i> Media del sector</span>
      <span class="bch_val">${avg}%</span>
      ${vsAvg}
    </div>
    <div class="bch_row">
      <span class="bch_label"><i class="fas fa-trophy"></i> Top candidatos</span>
      <span class="bch_val">${top}%</span>
      ${vsTop}
    </div>
    <div class="bch_row bch_threshold">
      <span class="bch_label"><i class="fas fa-flag-checkered"></i> Umbral recomendado</span>
      <span class="bch_val">${thr}%</span>
      ${score >= thr ? '<span class="bch_up">Superado ✅</span>' : '<span class="bch_down">Aún no alcanzado</span>'}
    </div>
  `;
};

// ─── Perfil detectado por el ATS ──────────────────────────────────────────
const _renderDetectedProfile = (profile) => {
  const el = document.getElementById('detectedProfileCard');
  if (!el) return;

  // Inicializar wiTip para los tooltips del perfil
  wiTip();

  // Helper: fila de dato extraído
  const dataRow = (icon, label, value, tipOk, tipMissing) => {
    const hasValue = value && String(value).trim() && value !== 'null' && value !== 'No detectado';
    const tipText  = hasValue ? tipOk : tipMissing;
    const tipAttr  = wiTip(tipText, undefined, 'top');

    return `
      <div class="profile_row ${hasValue ? 'prow_ok' : 'prow_missing'}" ${tipAttr}>
        <div class="prow_icon">
          <i class="fas ${icon}"></i>
        </div>
        <div class="prow_body">
          <span class="prow_label">${label}</span>
          <span class="prow_value">${hasValue ? value : '—  No encontrado'}</span>
        </div>
        <div class="prow_status">
          <i class="fas ${hasValue ? 'fa-circle-check' : 'fa-circle-xmark'}"></i>
        </div>
      </div>
    `;
  };

  const sects = (profile.sectionsFound || []);
  const issues = (profile.parsingIssues || []);

  el.innerHTML = `
    ${dataRow('fa-user',       'Nombre completo',     profile.fullName,       'Nombre legible por el ATS ✅ El sistema puede identificarte correctamente.', 'No se encontró un nombre claro. Asegúrate de incluirlo en texto plano al inicio del CV.')}
    ${dataRow('fa-envelope',   'Correo electrónico',  profile.email,          'Email detectado ✅ Los reclutadores pueden contactarte directamente.', 'Email no detectado. Inclúyelo en formato texto, no como imagen.')}
    ${dataRow('fa-phone',      'Teléfono',            profile.phone,          'Teléfono encontrado ✅ Información de contacto completa.', 'Teléfono no encontrado. Añade tu número en el encabezado del CV.')}
    ${dataRow('fa-linkedin',   'LinkedIn',            profile.linkedin,       'Perfil LinkedIn detectado ✅ Aumenta tu visibilidad ante el reclutador.', 'Sin LinkedIn. Agregar tu URL de LinkedIn puede aumentar un 10–15% tus chances.')}
    ${dataRow('fa-briefcase',  'Puesto / Título',     profile.currentTitle,   'Título profesional detectado ✅ El ATS puede clasificarte correctamente.', 'Título no detectado. Agrega un encabezado con tu perfil profesional.')}
    ${dataRow('fa-building',   'Empresa actual',      profile.currentCompany, 'Empresa detectada ✅ Historial laboral reconocido por el sistema.', 'Empresa actual no encontrada. Verifica que la sección de experiencia sea legible.')}
    ${dataRow('fa-graduation-cap', 'Nivel educativo', profile.educationLevel, 'Educación detectada ✅ El sistema reconoce tu formación académica.', 'Nivel educativo no detectado. Agrega una sección de Educación clara.')}

    <div class="prow_chips_wrap">
      <span class="prow_chip neutral" ${wiTip('Años de experiencia estimados por la IA según el historial laboral del CV', undefined, 'top')}>
        <i class="fas fa-clock"></i> ${profile.estimatedYearsExp != null ? profile.estimatedYearsExp + ' años exp.' : '—'}
      </span>
      <span class="prow_chip neutral" ${wiTip('Número de palabras detectadas en el CV. +500 palabras mejora la detección de keywords.', undefined, 'top')}>
        <i class="fas fa-align-left"></i> ${profile.totalWords || '—'} palabras
      </span>
      <span class="prow_chip neutral" ${wiTip('Páginas estimadas del documento. Lo ideal es 1 página para perfiles con menos de 5 años de experiencia.', undefined, 'top')}>
        <i class="fas fa-file-lines"></i> ${profile.estimatedPages || 1} ${profile.estimatedPages === 1 ? 'página' : 'páginas'}
      </span>
    </div>

    ${sects.length > 0 ? `
      <div class="prow_sections">
        <span class="prow_sections_label"><i class="fas fa-layer-group"></i> Secciones reconocidas:</span>
        <div class="prow_sections_tags">
          ${sects.map(s => `<span class="prow_sect_tag">${s}</span>`).join('')}
        </div>
      </div>
    ` : ''}

    ${issues.length > 0 ? `
      <div class="profile_issue">
        <i class="fas fa-exclamation-triangle"></i>
        ${issues.join(' · ')}
      </div>
    ` : ''}
  `;
};

// ─── Calidad del lenguaje ──────────────────────────────────────────────────
const _renderLanguageQuality = (lq) => {
  const el = document.getElementById('languageQualityCard');
  if (!el || !lq) return;

  const density = lq.keywordDensity === 'low' ? '⚠️ Baja' : lq.keywordDensity === 'high' ? '⚠️ Alta (riesgo de spam)' : '✅ Óptima';
  const verbsFound   = (lq.actionVerbsFound || []).join(', ') || '—';
  const verbsMissing = (lq.actionVerbsMissing || []).map(v => `<span class="verb_missing">${v}</span>`).join('') || '<span class="verb_none">—</span>';

  el.innerHTML = `
    <div class="lq_row">
      <i class="fas fa-bolt"></i>
      <div>
        <span class="lq_label">Verbos de acción detectados</span>
        <span class="lq_val">${verbsFound}</span>
      </div>
    </div>
    <div class="lq_row">
      <i class="fas fa-plus-circle" style="color: var(--warning);"></i>
      <div>
        <span class="lq_label">Verbos recomendados a agregar</span>
        <div class="verb_missing_wrap">${verbsMissing}</div>
      </div>
    </div>
    <div class="lq_row">
      <i class="fas fa-chart-pie"></i>
      <div>
        <span class="lq_label">Logros cuantificados</span>
        <span class="lq_val">${lq.quantifiedAchievements || 0} encontrados</span>
      </div>
    </div>
    <div class="lq_row">
      <i class="fas fa-percent"></i>
      <div>
        <span class="lq_label">Densidad de keywords</span>
        <span class="lq_val">${density}</span>
      </div>
    </div>
  `;
};

// ─── Keywords ─────────────────────────────────────────────────────────────
const _renderKeywords = (matched = [], missing = []) => {
  if (matchedKeywordsContainer) {
    matchedKeywordsContainer.innerHTML = matched.length > 0
      ? matched.map(kw => `<span class="ats_badge matched"><i class="fas fa-check-circle"></i> ${kw}</span>`).join('')
      : '<span class="kw_empty">No se detectaron palabras clave coincidentes con el puesto.</span>';
  }
  if (missingKeywordsContainer) {
    missingKeywordsContainer.innerHTML = missing.length > 0
      ? missing.map(kw => `<span class="ats_badge missing"><i class="fas fa-plus-circle"></i> ${kw}</span>`).join('')
      : '<span class="kw_empty">¡Buen trabajo! No faltan palabras clave importantes.</span>';
  }
};

// ─── Plan de Acción ────────────────────────────────────────────────────────
const _renderPlan = (recs = []) => {
  if (!recommendationsContainer) return;
  recommendationsContainer.innerHTML = '';

  const priorityWeight = { 'Alta': 3, 'Media': 2, 'Baja': 1 };
  recs.sort((a, b) => (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0));

  const totalRecs = recs.length;
  let completedRecs = 0;

  const updateProgress = () => {
    if (!planProgressWrap || totalRecs === 0) return;
    planProgressWrap.style.display = 'flex';
    const pct = Math.round((completedRecs / totalRecs) * 100);
    if (planProgressPercent) planProgressPercent.textContent = `${pct}%`;
    if (planProgressBar)     planProgressBar.style.width     = `${pct}%`;
    if (planProgressText)    planProgressText.textContent    = `Has completado ${completedRecs} de ${totalRecs} mejoras sugeridas.`;
  };

  if (recs.length > 0) {
    updateProgress();
    recs.forEach((rec, idx) => {
      const mins   = rec.estimatedMinutes || null;
      const pts    = rec.pointsGain       || null;
      const metaHtml = (mins || pts) ? `
        <div class="rec_meta">
          ${mins ? `<span class="rec_meta_chip time"><i class="fas fa-clock"></i> ~${mins} min</span>` : ''}
          ${pts  ? `<span class="rec_meta_chip pts"><i class="fas fa-arrow-up"></i> +${pts} pts</span>` : ''}
        </div>` : '';

      const card = document.createElement('div');
      card.className = `rec_card pri_${rec.priority}`;
      card.innerHTML = `
        <div class="rec_checkbox_wrap">
          <div class="rec_checkbox" id="chk_rec_${idx}"><i class="fas fa-check"></i></div>
        </div>
        <div class="rec_content">
          <span class="rec_section">${rec.section || 'Sección'}</span>
          <div class="rec_advice">${rec.advice}</div>
          ${metaHtml}
        </div>
        <span class="rec_pri_badge ${rec.priority}">${rec.priority}</span>
      `;
      card.addEventListener('click', (e) => {
        e.preventDefault();
        const cb = card.querySelector('.rec_checkbox');
        const done = card.classList.contains('completed');
        if (done) {
          card.classList.remove('completed');
          cb?.classList.remove('checked');
          completedRecs = Math.max(0, completedRecs - 1);
        } else {
          card.classList.add('completed');
          cb?.classList.add('checked');
          completedRecs = Math.min(totalRecs, completedRecs + 1);
          Mensaje('¡Tarea completada! 🎉', 'success');
        }
        updateProgress();
      });
      recommendationsContainer.appendChild(card);
    });
  } else {
    if (planProgressWrap) planProgressWrap.style.display = 'none';
    recommendationsContainer.innerHTML = '<div class="rec_card" style="border-left:5px solid var(--success);"><p class="rec_advice">Tu currículum cumple perfectamente con los requisitos sugeridos.</p></div>';
  }
};

// ─── Auditoría de Formato ──────────────────────────────────────────────────
const _renderAudit = (warnings = []) => {
  if (!atsAuditList) return;
  atsAuditList.innerHTML = '';

  const formatChecks = [
    { id: 'fonts',   title: 'Tipografías y Fuentes',           desc: 'Fuentes legibles (Arial, Calibri, Times New Roman) para máxima compatibilidad.', keywords: ['fuente','letra','tipografía','sans','serif','font'], successMsg: 'Fuentes compatibles detectadas. Texto perfectamente legible.' },
    { id: 'tables',  title: 'Tablas de Datos',                  desc: 'Ausencia de tablas complejas que rompen el flujo de lectura del ATS.',             keywords: ['tabla','celda','grid','cuadrícula'],                    successMsg: 'Sin tablas conflictivas. La información fluye sin interrupciones.' },
    { id: 'columns', title: 'Columnas y Layout',                desc: 'Diseño de una sola columna para garantizar el orden correcto de lectura.',         keywords: ['columna','dos columnas','columnas','layout','distribución'], successMsg: 'Distribución compatible. Bloques de texto en orden cronológico correcto.' },
    { id: 'graphics',title: 'Elementos Gráficos y Visuales',   desc: 'Ausencia de imágenes, iconos o barras gráficas de habilidades.',                   keywords: ['imagen','gráfico','icono','visual','barra de nivel'],   successMsg: 'Estructura limpia. Sin gráficos bloqueando datos críticos.' },
    { id: 'contact', title: 'Datos de Contacto Legibles',       desc: 'Correo, teléfono y LinkedIn en formato texto plano en la cabecera.',              keywords: ['contacto','correo','teléfono','linkedin','enlace','email'], successMsg: 'Información de contacto identificada correctamente.' },
    { id: 'headers', title: 'Títulos de Sección Estándar',      desc: 'Nombres de sección reconocibles (Experiencia, Educación, Habilidades).',          keywords: ['encabezado','título','sección','secciones','estructur'], successMsg: 'Secciones estándar detectadas. ATS clasificará tu experiencia con precisión.' },
  ];

  const matched = new Set();
  formatChecks.forEach(check => {
    const hits = warnings.filter(w => {
      if (!w) return false;
      const low = w.toLowerCase();
      const m = check.keywords.some(kw => low.includes(kw));
      if (m) matched.add(w);
      return m;
    });
    const ok = hits.length === 0;
    const card = document.createElement('div');
    card.className = `audit_card ${ok ? 'audit_ok' : 'audit_warn'}`;
    card.style.cssText = `display:flex;align-items:start;gap:2vh;padding:2.5vh 3vh;border-radius:1.8vh;border:1px solid var(--brd);background:${ok ? 'rgba(60,215,65,0.03)' : 'rgba(255,167,38,0.03)'};border-left:6px solid ${ok ? 'var(--success)' : 'var(--warning)'};transition:all var(--tr_m);`;
    card.innerHTML = `
      <div style="margin-top:0.3vh;font-size:var(--fz_m4);color:${ok ? 'var(--success)' : 'var(--warning)'};">
        <i class="fas ${ok ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i>
      </div>
      <div style="flex:1;">
        <div style="display:flex;align-items:center;gap:1.2vh;flex-wrap:wrap;margin-bottom:0.8vh;">
          <span style="font-weight:800;font-size:var(--fz_m1);color:var(--tx1);">${check.title}</span>
          <span style="font-size:var(--fz_s3);font-weight:800;padding:0.3vh 1.2vh;border-radius:50px;text-transform:uppercase;letter-spacing:0.5px;background:${ok ? 'rgba(60,215,65,0.1)' : 'rgba(255,167,38,0.1)'};color:${ok ? 'var(--success)' : 'var(--warning)'};">${ok ? 'Correcto' : 'Sugerencia'}</span>
        </div>
        <p style="font-size:var(--fz_s3);color:var(--tx3);margin:0 0 1vh;font-weight:500;line-height:1.5;">${check.desc}</p>
        <div style="font-size:var(--fz_m1);color:var(--tx2);font-weight:600;line-height:1.6;">
          ${ok
            ? `<i class="fas fa-check" style="color:var(--success);margin-right:0.8vh;"></i>${check.successMsg}`
            : hits.map(w => `<div style="display:flex;gap:1vh;align-items:start;margin-bottom:0.8vh;"><i class="fas fa-exclamation-triangle" style="color:var(--warning);margin-top:0.3vh;flex-shrink:0;"></i><span>${w}</span></div>`).join('')
          }
        </div>
      </div>
    `;
    atsAuditList.appendChild(card);
  });

  // Advertencias huérfanas
  const orphans = warnings.filter(w => w && !matched.has(w));
  if (orphans.length > 0) {
    const card = document.createElement('div');
    card.className = 'audit_card audit_warn';
    card.style.cssText = `display:flex;align-items:start;gap:2vh;padding:2.5vh 3vh;border-radius:1.8vh;border:1px solid var(--brd);background:rgba(255,167,38,0.03);border-left:6px solid var(--warning);transition:all var(--tr_m);`;
    card.innerHTML = `
      <div style="margin-top:0.3vh;font-size:var(--fz_m4);color:var(--warning);"><i class="fas fa-circle-exclamation"></i></div>
      <div style="flex:1;">
        <div style="display:flex;align-items:center;gap:1.2vh;margin-bottom:0.8vh;">
          <span style="font-weight:800;font-size:var(--fz_m1);color:var(--tx1);">Observaciones Adicionales</span>
          <span style="font-size:var(--fz_s3);font-weight:800;padding:0.3vh 1.2vh;border-radius:50px;text-transform:uppercase;background:rgba(255,167,38,0.1);color:var(--warning);">Advertencia</span>
        </div>
        <div style="font-size:var(--fz_m1);color:var(--tx2);font-weight:600;line-height:1.6;">
          ${orphans.map(w => `<div style="display:flex;gap:1vh;align-items:start;margin-bottom:0.8vh;"><i class="fas fa-exclamation-triangle" style="color:var(--warning);margin-top:0.3vh;flex-shrink:0;"></i><span>${w}</span></div>`).join('')}
        </div>
      </div>
    `;
    atsAuditList.appendChild(card);
  }
};

// ─── Gauge animado ─────────────────────────────────────────────────────────
const setGaugeValue = (val) => {
  if (!gaugeCircle) return;
  const r = 45;
  const offset = 2 * Math.PI * r * (1 - val / 100);
  gaugeCircle.style.strokeDashoffset = `${offset}`;
  gaugeCircle.style.stroke = val >= 75 ? 'var(--success)' : val >= 50 ? 'var(--warning)' : 'var(--error)';

  let cur = 0;
  const step = Math.max(Math.floor(1500 / (val || 1)), 15);
  if (gaugeNum) gaugeNum.textContent = '0%';
  const timer = setInterval(() => {
    if (cur >= val) { clearInterval(timer); cur = val; }
    if (gaugeNum) gaugeNum.textContent = `${cur}%`;
    cur++;
  }, step);
};

// ─── Desglose analítico ────────────────────────────────────────────────────
const _renderBreakdown = (score, breakdown) => {
  const bd = breakdown || {
    contactInfo: Math.min(score + 10, 100),
    experience:  score,
    education:   Math.min(score + 5,  100),
    skills:      Math.max(score - 5,  0),
  };
  const areas = [
    { scoreEl: scoreContact,    barEl: barContact,    val: bd.contactInfo },
    { scoreEl: scoreExperience, barEl: barExperience, val: bd.experience  },
    { scoreEl: scoreEducation,  barEl: barEducation,  val: bd.education   },
    { scoreEl: scoreSkills,     barEl: barSkills,     val: bd.skills      },
  ];
  areas.forEach(({ scoreEl, barEl, val }) => {
    if (scoreEl) scoreEl.textContent = `${val}%`;
    if (barEl) setTimeout(() => {
      barEl.style.width      = `${val}%`;
      barEl.style.background = val >= 75 ? 'linear-gradient(90deg,var(--success),#2beb47)' : val >= 50 ? 'linear-gradient(90deg,var(--warning),#ffa726)' : 'linear-gradient(90deg,var(--error),#ff6b6b)';
    }, 100);
  });
};

// ─── Copiar Guía ──────────────────────────────────────────────────────────
export const copyActionPlan = () => {
  if (!activeReport) return;
  const { score = 0, summary = '', missingKeywords = [], recommendations = [], atsWarnings = [] } = activeReport;
  const text = `================================================
REPORTE ATS DE COMPATIBILIDAD - WORKWII
================================================
Puntaje de Match: ${score}%
Diagnóstico: ${summary}

PALABRAS CLAVE QUE DEBES AGREGAR:
${missingKeywords.join(', ') || 'Ninguna (¡Buen trabajo!)'}

PLAN DE CAMBIOS RECOMENDADOS:
${recommendations.map(r => `[${r.priority}] ${r.section}: ${r.advice}${r.estimatedMinutes ? ` (~${r.estimatedMinutes} min)` : ''}`).join('\n') || 'Tu CV está óptimo.'}
${atsWarnings.length ? `\nADVERTENCIAS DE FORMATO:\n${atsWarnings.map(w => `- ${w}`).join('\n')}` : ''}
================================================`;

  const btn = document.getElementById('btnCopyReport');
  navigator.clipboard.writeText(text).then(() => {
    if (btn) {
      const prev = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-check-circle"></i> ¡Copiado!';
      btn.style.cssText = 'background:var(--success);color:#fff;border-color:var(--success);';
      setTimeout(() => { btn.innerHTML = prev; btn.style.cssText = ''; }, 2200);
    }
    Mensaje('Informe de mejoras copiado ✅', 'success');
  }).catch(() => Notificacion('Error al copiar al portapapeles.', 'error'));
};

// ─── Reset ─────────────────────────────────────────────────────────────────
export const resetResults = () => {
  activeReport = null;
  localStorage.removeItem(STORAGE_KEY);
  if (stopTipsRotator) { stopTipsRotator(); stopTipsRotator = null; }

  if (atsResults)   atsResults.style.display   = 'none';
  if (atsLoader)    atsLoader.style.display     = 'none';
  if (atsWorkspace) atsWorkspace.style.display  = 'grid';
  if (atsHeader)    atsHeader.classList.remove('ats_header_hidden');

  document.querySelectorAll('.ats_dash_tab').forEach((t, i) => {
    if (i === 0) t.classList.add('active'); else t.classList.remove('active');
  });
  document.querySelectorAll('.ats_dash_pane').forEach((p, i) => {
    if (i === 0) p.classList.add('active'); else p.classList.remove('active');
  });
};
