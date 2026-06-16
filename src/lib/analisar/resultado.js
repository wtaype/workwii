import { Mensaje, Notificacion } from '../widev.js';

let atsWorkspace, atsLoader, atsResults, gaugeCircle, gaugeNum, gaugeStatus, resultSummary, matchedKeywordsContainer, missingKeywordsContainer, recommendationsContainer, warningBox, warningList;
let activeReport = null;

export const initResultado = () => {
  atsWorkspace = document.getElementById('atsWorkspace');
  atsLoader = document.getElementById('atsLoader');
  atsResults = document.getElementById('atsResults');
  gaugeCircle = document.getElementById('gaugeCircle');
  gaugeNum = document.getElementById('gaugeNum');
  gaugeStatus = document.getElementById('gaugeStatus');
  resultSummary = document.getElementById('resultSummary');
  matchedKeywordsContainer = document.getElementById('matchedKeywordsContainer');
  missingKeywordsContainer = document.getElementById('missingKeywordsContainer');
  recommendationsContainer = document.getElementById('recommendationsContainer');
  warningBox = document.getElementById('warningBox');
  warningList = document.getElementById('warningList');
};

export const displayResults = (report) => {
  activeReport = report;
  
  if (atsLoader) atsLoader.style.display = 'none';
  if (atsResults) atsResults.style.display = 'flex';

  // 1. Gauge circular SVG
  const score = parseInt(report.score) || 0;
  setGaugeValue(score);

  // 2. Badge de estado
  if (gaugeStatus) {
    gaugeStatus.textContent = score >= 75 ? 'Excelente Match' : score >= 50 ? 'Match Regular' : 'Coincidencia Baja';
    gaugeStatus.className = 'ats_status_badge ' + (score >= 75 ? 'ats_status_excelente' : score >= 50 ? 'ats_status_aceptable' : 'ats_status_critico');
  }

  // 3. Resumen diagnóstico
  if (resultSummary) {
    resultSummary.textContent = report.summary || 'Análisis completado sin observaciones.';
  }

  // 4. Coincidentes
  if (matchedKeywordsContainer) {
    matchedKeywordsContainer.innerHTML = '';
    const matched = report.matchedKeywords || [];
    if (matched.length > 0) {
      matched.forEach((kw) => {
        const badge = document.createElement('span');
        badge.className = 'ats_badge matched';
        badge.innerHTML = `<i class="fas fa-check-circle"></i> ${kw}`;
        matchedKeywordsContainer.appendChild(badge);
      });
    } else {
      matchedKeywordsContainer.innerHTML = '<span class="kw_empty">No se detectaron palabras clave coincidentes con el puesto.</span>';
    }
  }

  // 5. Faltantes
  if (missingKeywordsContainer) {
    missingKeywordsContainer.innerHTML = '';
    const missing = report.missingKeywords || [];
    if (missing.length > 0) {
      missing.forEach((kw) => {
        const badge = document.createElement('span');
        badge.className = 'ats_badge missing';
        badge.innerHTML = `<i class="fas fa-plus-circle"></i> ${kw}`;
        missingKeywordsContainer.appendChild(badge);
      });
    } else {
      missingKeywordsContainer.innerHTML = '<span class="kw_empty">¡Buen trabajo! No faltan palabras clave importantes.</span>';
    }
  }

  // 6. Plan de mejoras (Recomendaciones)
  if (recommendationsContainer) {
    recommendationsContainer.innerHTML = '';
    const recs = report.recommendations || [];
    
    const priorityWeight = { 'Alta': 3, 'Media': 2, 'Baja': 1 };
    recs.sort((a, b) => (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0));

    if (recs.length > 0) {
      recs.forEach((rec) => {
        const card = document.createElement('div');
        card.className = `rec_card pri_${rec.priority}`;
        card.innerHTML = `
          <div class="rec_content">
            <span class="rec_section">${rec.section || 'Sección'}</span>
            <div class="rec_advice">${rec.advice}</div>
          </div>
          <span class="rec_pri_badge ${rec.priority}">${rec.priority}</span>
        `;
        recommendationsContainer.appendChild(card);
      });
    } else {
      recommendationsContainer.innerHTML = '<div class="rec_card" style="border-left: 5px solid var(--success);"><p class="rec_advice">Tu currículum cumple perfectamente con los requisitos sugeridos.</p></div>';
    }
  }

  // 7. Alertas de Formato ATS
  if (warningBox && warningList) {
    const warnings = report.atsWarnings || [];
    if (warnings.length > 0) {
      warningList.innerHTML = '';
      warnings.forEach((warn) => {
        const item = document.createElement('div');
        item.className = 'ats_warn_item';
        item.innerHTML = `<i class="fas fa-exclamation-triangle"></i><span>${warn}</span>`;
        warningList.appendChild(item);
      });
      warningBox.style.display = 'flex';
    } else {
      warningBox.style.display = 'none';
    }
  }
};

const setGaugeValue = (val) => {
  if (!gaugeCircle) return;

  const r = 45;
  const circ = 2 * Math.PI * r;
  const offset = circ - (val / 100) * circ;

  gaugeCircle.style.strokeDashoffset = `${offset}`;

  let strokeColor = 'var(--error)';
  if (val >= 75) {
    strokeColor = 'var(--success)';
  } else if (val >= 50) {
    strokeColor = 'var(--warning)';
  }
  gaugeCircle.style.stroke = strokeColor;

  let current = 0;
  const duration = 1500;
  const stepTime = Math.max(Math.floor(duration / val), 15);
  
  if (gaugeNum) gaugeNum.textContent = '0%';

  const timer = setInterval(() => {
    if (current >= val) {
      clearInterval(timer);
      current = val;
    }
    if (gaugeNum) gaugeNum.textContent = `${current}%`;
    current += 1;
  }, stepTime);
};

export const copyActionPlan = () => {
  if (!activeReport) return;

  const score = activeReport.score || 0;
  const summary = activeReport.summary || '';
  const missingKws = (activeReport.missingKeywords || []).join(', ');
  const recs = (activeReport.recommendations || []).map((r) => `[Prioridad ${r.priority}] En ${r.section}: ${r.advice}`).join('\n');
  const warnings = (activeReport.atsWarnings || []).map((w) => `- ${w}`).join('\n');

  const reportText = `================================================
REPORTE ATS DE COMPATIBILIDAD - WORKWII
================================================
Puntaje de Match: ${score}%
Diagnóstico Inicial: ${summary}

------------------------------------------------
PALABRAS CLAVE QUE DEBES AGREGAR:
${missingKws || 'Ninguna (¡Buen trabajo!)'}

------------------------------------------------
PLAN DE CAMBIOS RECOMENDADOS:
${recs || 'Tu CV está óptimo.'}

${warnings ? `\n------------------------------------------------\nADVERTENCIAS DE FORMATO PARA ATS:\n${warnings}` : ''}
================================================`;

  const btn = document.getElementById('btnCopyReport');
  navigator.clipboard.writeText(reportText).then(() => {
    if (btn) {
      const prevText = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-check-circle"></i> ¡Copiado!';
      btn.style.background = 'var(--success)';
      setTimeout(() => {
        btn.innerHTML = prevText;
        btn.style.background = '';
      }, 2000);
    }
    Mensaje('Informe de mejoras copiado ✅', 'success');
  }).catch(() => {
    Notificacion('Error al copiar al portapapeles.', 'error');
  });
};

export const resetResults = () => {
  activeReport = null;
  if (atsResults) atsResults.style.display = 'none';
  if (atsLoader) atsLoader.style.display = 'none';
  if (atsWorkspace) atsWorkspace.style.display = 'grid';
};
