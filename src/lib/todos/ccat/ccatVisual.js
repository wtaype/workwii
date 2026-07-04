// src/lib/todos/ccat/ccatVisual.js
// Orquestador interactivo de cliente para el test CCAT con soporte de descargas y persistencia en caché

import { bancoPreguntas } from './preguntas/banco.js';
import { respuestasCcat } from './preguntas/respuestas.js';
import { idiomaCcat } from './idiomaCcat.js';
import { descargarPdfReporte, descargarDocxReporte, descargarMdReporte, descargarJsonReporte } from './descarga/descargas.js';

// Estado global de la sesión del test activo
let state = {
  questions: [],      // 50 preguntas seleccionadas al azar
  userAnswers: {},    // mapa de { questionIndex: selectedOptionIndex }
  currentIndex: 0,    // pregunta actual (0 a 49)
  timeLeft: 900,      // 15 minutos en segundos (900s)
  timerInterval: null // temporizador
};

let _lang = 'es';
let _lg = {}; // etiquetas localizadas

export const initCcat = () => {
  const root = document.querySelector('.ccat_root');
  if (!root) return;

  _lang = root.getAttribute('data-ccat-lang') || 'es';
  _lg = idiomaCcat[_lang] || idiomaCcat.es;

  // 1. Cablear botones de navegación principal y controles
  document.getElementById('ccat_btn_start')?.addEventListener('click', iniciarTest);
  document.getElementById('ccat_btn_retry')?.addEventListener('click', reiniciarTest);
  document.getElementById('ccat_btn_quit')?.addEventListener('click', confirmarYFinalizar);
  document.getElementById('ccat_btn_prev')?.addEventListener('click', irAnterior);
  document.getElementById('ccat_btn_next')?.addEventListener('click', irSiguiente);
  document.getElementById('ccat_btn_skip')?.addEventListener('click', saltarPregunta);

  // 2. Verificar caché local para restaurar sesión anterior
  const cacheKey = _lang === 'en' ? 'ccat_respuestas_en' : 'ccat_respuestas_es';
  const cachedData = localStorage.getItem(cacheKey);
  if (cachedData) {
    try {
      const parsed = JSON.parse(cachedData);
      cargarResultadoGuardado(parsed);
    } catch (_) {
      localStorage.removeItem(cacheKey);
    }
  }
};

// Restaura los resultados desde la caché
const cargarResultadoGuardado = (savedResults) => {
  // Ocultar intro e ir directo a la pantalla de resultados
  document.getElementById('ccat-intro')?.classList.add('ccat_hidden');
  document.getElementById('ccat-quiz')?.classList.add('ccat_hidden');
  document.getElementById('ccat-results')?.classList.remove('ccat_hidden');

  renderizarDashboardResultados(savedResults);
};

// ── CONTROL DE FLUJO ─────────────────────────────────────────────────────────

const iniciarTest = () => {
  // 1. Resetear estado
  state.currentIndex = 0;
  state.timeLeft = 900;
  state.userAnswers = {};
  
  // 2. Seleccionar 50 preguntas aleatorias de las 60
  state.questions = shuffleArray([...bancoPreguntas]).slice(0, 50);

  // 3. Ocultar intro, mostrar examen
  document.getElementById('ccat-intro')?.classList.add('ccat_hidden');
  document.getElementById('ccat-quiz')?.classList.remove('ccat_hidden');
  document.getElementById('ccat-results')?.classList.add('ccat_hidden');

  // 4. Arrancar cronómetro
  iniciarCronometro();

  // 5. Renderizar primera pregunta
  renderPreguntaActual();
};

const reiniciarTest = () => {
  // Limpiar timers activos
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
  
  // Borrar caché correspondiente del idioma al reintentar
  const cacheKey = _lang === 'en' ? 'ccat_respuestas_en' : 'ccat_respuestas_es';
  localStorage.removeItem(cacheKey);

  // Volver a la introducción
  document.getElementById('ccat-results')?.classList.add('ccat_hidden');
  document.getElementById('ccat-intro')?.classList.remove('ccat_hidden');
  
  // Resetear estilos del timer
  const timerContainer = document.getElementById('ccat_timer');
  timerContainer?.classList.remove('ccat_exam_timer--warning');
};

const iniciarCronometro = () => {
  if (state.timerInterval) clearInterval(state.timerInterval);
  
  actualizarTimerUI();

  state.timerInterval = setInterval(() => {
    state.timeLeft--;
    actualizarTimerUI();

    // Alerta visual de pánico (menos de 2 minutos = 120 segundos)
    if (state.timeLeft <= 120) {
      document.getElementById('ccat_timer')?.classList.add('ccat_exam_timer--warning');
    }

    if (state.timeLeft <= 0) {
      clearInterval(state.timerInterval);
      finalizarExamen(true); // Terminar automáticamente por tiempo
    }
  }, 1000);
};

const actualizarTimerUI = () => {
  const timerVal = document.getElementById('ccat_timer_val');
  if (!timerVal) return;

  const min = Math.floor(state.timeLeft / 60);
  const sec = state.timeLeft % 60;
  timerVal.textContent = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};

const confirmarYFinalizar = () => {
  if (confirm(_lg.quiz?.confirmFinish || '¿Finalizar el examen?')) {
    finalizarExamen(false);
  }
};

const finalizarExamen = (porTiempo = false) => {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }

  if (porTiempo) {
    alert(_lang === 'en' ? 'Time is up! Calculating results.' : '¡Se agotó el tiempo! Calculando resultados.');
  }

  // Ocultar examen, mostrar resultados
  document.getElementById('ccat-quiz')?.classList.add('ccat_hidden');
  document.getElementById('ccat-results')?.classList.remove('ccat_hidden');

  // Calcular métricas activas
  procesarYGuardarResultadosNuevos();
};

// ── RENDERIZADO DE PREGUNTA ──────────────────────────────────────────────────

const renderPreguntaActual = () => {
  const q = state.questions[state.currentIndex];
  if (!q) return;

  // 1. Actualizar barra de progreso
  const progressNum = state.currentIndex + 1;
  const progressPercent = Math.round((progressNum / 50) * 100);
  
  const progText = document.getElementById('ccat_progress_num');
  const progPctText = document.getElementById('ccat_progress_percent');
  const progFill = document.getElementById('ccat_progress_fill');
  
  if (progText) progText.textContent = progressNum.toString();
  if (progPctText) progPctText.textContent = `${progressPercent}%`;
  if (progFill) progFill.style.width = `${progressPercent}%`;

  // 2. Cargar Badge de Categoría
  const badge = document.getElementById('ccat_category_badge');
  if (badge) {
    badge.className = 'ccat_badge'; // Reset
    if (q.categoria === 'verbal') {
      badge.textContent = _lg.results?.catVerbal || 'Verbal';
      badge.classList.add('ccat_badge--verbal');
    } else if (q.categoria === 'numerical') {
      badge.textContent = _lg.results?.catNumerical || 'Numerical';
      badge.classList.add('ccat_badge--numerical');
    } else {
      badge.textContent = _lg.results?.catSpatial || 'Spatial';
      badge.classList.add('ccat_badge--spatial');
    }
  }

  // 3. Cargar pregunta
  const qText = document.getElementById('ccat_question_text');
  if (qText) {
    qText.textContent = q[_lang]?.pregunta || q.es.pregunta;
  }

  // 4. Cargar Área Espacial (SVG) si aplica
  const spatialArea = document.getElementById('ccat_spatial_area');
  if (spatialArea) {
    if (q.categoria === 'spatial' && q.svg) {
      spatialArea.innerHTML = q.svg;
      spatialArea.classList.remove('ccat_hidden');
    } else {
      spatialArea.innerHTML = '';
      spatialArea.classList.add('ccat_hidden');
    }
  }

  // 5. Cargar Opciones
  const optionsContainer = document.getElementById('ccat_options_container');
  if (optionsContainer) {
    optionsContainer.innerHTML = '';
    const optionsList = q[_lang]?.opciones || q.es.opciones;
    
    optionsList.forEach((optText, index) => {
      const card = document.createElement('div');
      const letter = String.fromCharCode(65 + index); // A, B, C, D, E
      
      card.className = 'ccat_option_card';
      if (state.userAnswers[state.currentIndex] === index) {
        card.classList.add('ccat_option_card--selected');
      }

      card.innerHTML = `
        <div class="ccat_option_bullet">${letter}</div>
        <div class="ccat_option_text">${optText}</div>
      `;

      card.addEventListener('click', () => seleccionarOpcion(index));
      optionsContainer.appendChild(card);
    });
  }

  // 6. Configurar botones
  const btnPrev = document.getElementById('ccat_btn_prev');
  if (btnPrev) {
    btnPrev.disabled = state.currentIndex === 0;
  }
};

const seleccionarOpcion = (index) => {
  state.userAnswers[state.currentIndex] = index;

  // Remarcar opciones visualmente
  const cards = document.querySelectorAll('.ccat_option_card');
  cards.forEach((c, idx) => {
    c.classList.toggle('ccat_option_card--selected', idx === index);
  });

  // Auto-avanzar suavemente tras 300ms
  setTimeout(() => {
    if (state.currentIndex < 49) {
      state.currentIndex++;
      renderPreguntaActual();
    }
  }, 300);
};

const irAnterior = () => {
  if (state.currentIndex > 0) {
    state.currentIndex--;
    renderPreguntaActual();
  }
};

const irSiguiente = () => {
  if (state.currentIndex < 49) {
    state.currentIndex++;
    renderPreguntaActual();
  }
};

const saltarPregunta = () => {
  irSiguiente();
};

// ── PROCESAMIENTO Y RENDERIZADO DE RESULTADOS ─────────────────────────────────

const procesarYGuardarResultadosNuevos = () => {
  let correctasTotal = 0;
  const stats = {
    verbal: { correct: 0, total: 0 },
    numerical: { correct: 0, total: 0 },
    spatial: { correct: 0, total: 0 }
  };

  // Mapear el historial de respuestas recopilando la info de respuestas.js
  const answersList = state.questions.map((q, idx) => {
    const userAns = state.userAnswers[idx];
    const r = respuestasCcat[q.id];
    const isCorrect = userAns === r.correctIndex;
    const isSkipped = userAns === undefined;

    stats[q.categoria].total++;
    if (isCorrect) {
      correctasTotal++;
      stats[q.categoria].correct++;
    }

    return {
      id: q.id,
      category: q.categoria,
      questionText: q[_lang]?.pregunta || q.es.pregunta,
      options: q[_lang]?.opciones || q.es.opciones,
      userAnswerIndex: userAns !== undefined ? userAns : null,
      correctAnswerIndex: r.correctIndex,
      isCorrect: isCorrect,
      isSkipped: isSkipped,
      explanation: r[_lang]?.explicacion || r.es.explicacion
    };
  });

  const percentil = calcularPercentil(correctasTotal);

  const resultsData = {
    score: correctasTotal,
    percentile: percentil,
    categories: stats,
    answers: answersList
  };

  // Guardar en caché local
  const cacheKey = _lang === 'en' ? 'ccat_respuestas_en' : 'ccat_respuestas_es';
  localStorage.setItem(cacheKey, JSON.stringify(resultsData));

  // Renderizar
  renderizarDashboardResultados(resultsData);
};

const renderizarDashboardResultados = (results) => {
  // 1. Score circular
  const scoreNum = document.getElementById('ccat_score_num');
  if (scoreNum) scoreNum.textContent = results.score.toString();
  
  const scoreSub = document.getElementById('ccat_score_sub');
  if (scoreSub) {
    scoreSub.textContent = `${results.score} ${_lg.results?.correctOf || 'de 50 correctas'}`;
  }

  // Gradiente cónico
  const percentScore = (results.score / 50) * 100;
  const circleEl = document.getElementById('ccat_results_circle');
  if (circleEl) {
    circleEl.style.background = `radial-gradient(closest-side, var(--wb) 79%, transparent 80% 100%), conic-gradient(var(--mco) ${percentScore}%, var(--brd) ${percentScore}%)`;
  }

  // 2. Percentil
  const percentileVal = document.getElementById('ccat_percentile_val');
  if (percentileVal) percentileVal.textContent = `${results.percentile}%`;

  const percentileDesc = document.getElementById('ccat_percentile_desc');
  if (percentileDesc) {
    const rawDesc = _lg.results?.percentileDesc || '';
    percentileDesc.innerHTML = rawDesc.replace('{pct}', results.percentile.toString());
  }

  // 3. Desglose por categoría
  const fillCategory = (cat) => {
    const cScore = document.getElementById(`ccat_cat_${cat}_score`);
    const cFill = document.getElementById(`ccat_cat_${cat}_fill`);
    const s = results.categories[cat] || { correct: 0, total: 0 };
    
    if (cScore) cScore.textContent = `${s.correct} / ${s.total}`;
    if (cFill) {
      const pct = s.total > 0 ? (s.correct / s.total) * 100 : 0;
      cFill.style.width = `${pct}%`;
    }
  };

  fillCategory('verbal');
  fillCategory('numerical');
  fillCategory('spatial');

  // 4. Adecuación laboral (Benchmarks)
  const actualizarBenchmarkStatus = (elementId, reqScore) => {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    const cumple = results.score >= reqScore;
    el.textContent = cumple ? (_lg.results?.statusOk || 'Cumple Target') : (_lg.results?.statusFail || 'Bajo Target');
    el.className = `ccat_bench_status ${cumple ? 'ccat_bench_status--success' : 'ccat_bench_status--fail'}`;
  };

  actualizarBenchmarkStatus('ccat_bench_soft_status', 35);
  actualizarBenchmarkStatus('ccat_bench_analyst_status', 32);
  actualizarBenchmarkStatus('ccat_bench_manager_status', 28);
  actualizarBenchmarkStatus('ccat_bench_admin_status', 25);
  actualizarBenchmarkStatus('ccat_bench_support_status', 20);

  // 5. Renderizar acordeones de revisión paso a paso
  renderRevisionTest(results.answers);

  // 6. Conectar los botones de descargas premium
  const btnPdf = document.getElementById('ccat_btn_pdf');
  const btnWord = document.getElementById('ccat_btn_word');
  const btnMd = document.getElementById('ccat_btn_md');
  const btnJson = document.getElementById('ccat_btn_json');

  if (btnPdf) btnPdf.onclick = () => descargarPdfReporte(results, _lang);
  if (btnWord) btnWord.onclick = () => descargarDocxReporte(results, _lang);
  if (btnMd) btnMd.onclick = () => descargarMdReporte(results, _lang);
  if (btnJson) btnJson.onclick = () => descargarJsonReporte(results, _lang);
};

const calcularPercentil = (score) => {
  if (score >= 48) return 99;
  if (score >= 45) return 98;
  if (score >= 42) return 97;
  if (score >= 40) return 95;
  if (score >= 38) return 92;
  if (score >= 35) return 85;
  if (score >= 32) return 78;
  if (score >= 30) return 72;
  if (score >= 28) return 65;
  if (score >= 26) return 58;
  if (score >= 24) return 50; // Promedio global
  if (score >= 22) return 42;
  if (score >= 20) return 35;
  if (score >= 18) return 28;
  if (score >= 15) return 18;
  if (score >= 12) return 10;
  if (score >= 8)  return 4;
  return 1;
};

// ── RENDERIZADO DE LA REVISIÓN ACORDEÓN ──────────────────────────────────────

const renderRevisionTest = (answersList) => {
  const container = document.getElementById('ccat_review_container');
  if (!container) return;

  container.innerHTML = '';

  answersList.forEach((ans, idx) => {
    // Crear ítem de revisión (acordeón colapsable)
    const item = document.createElement('div');
    item.className = 'ccat_review_item';

    // Estado del badge de revisión
    let statusIcon = '';
    let statusText = '';
    let statusClass = '';

    if (ans.isCorrect) {
      statusIcon = '<i class="fas fa-check-circle ccat_review_icon_status ccat_review_icon_status--correct"></i>';
      statusText = _lg.results?.reviewCorrect || 'Correcto';
      statusClass = 'ccat_review_icon_status--correct';
    } else if (ans.isSkipped) {
      statusIcon = '<i class="fas fa-minus-circle ccat_review_icon_status ccat_review_icon_status--skipped"></i>';
      statusText = _lg.results?.reviewSkipped || 'Omitido';
      statusClass = 'ccat_review_icon_status--skipped';
    } else {
      statusIcon = '<i class="fas fa-times-circle ccat_review_icon_status ccat_review_icon_status--incorrect"></i>';
      statusText = _lg.results?.reviewIncorrect || 'Incorrecto';
      statusClass = 'ccat_review_icon_status--incorrect';
    }

    const qNum = idx + 1;
    const qTexto = ans.questionText;

    // Header del acordeón
    const header = document.createElement('div');
    header.className = 'ccat_review_header';
    header.innerHTML = `
      <div class="ccat_review_title_left">
        ${statusIcon}
        <span><strong>${qNum}.</strong> ${qTexto.substring(0, 70)}${qTexto.length > 70 ? '...' : ''}</span>
      </div>
      <div class="ccat_review_header_right">
        <span class="ccat_rule_desc ${statusClass} ccat_option_text">${statusText}</span>
        <i class="fas fa-chevron-down ccat_review_arrow"></i>
      </div>
    `;

    // Cuerpo del acordeón (se muestra al abrir)
    const content = document.createElement('div');
    content.className = 'ccat_review_content';

    // Construcción de las opciones en el reporte
    let optionsHtml = '';
    
    ans.options.forEach((optText, optIdx) => {
      let optClass = '';
      if (optIdx === ans.correctAnswerIndex) {
        optClass = 'ccat_review_opt--correct';
      } else if (optIdx === ans.userAnswerIndex && optIdx !== ans.correctAnswerIndex) {
        optClass = 'ccat_review_opt--user-wrong';
      }

      const letter = String.fromCharCode(65 + optIdx);
      optionsHtml += `
        <div class="ccat_review_opt ${optClass}">
          <strong>${letter}.</strong> ${optText}
        </div>
      `;
    });

    // Encontrar la pregunta original en bancoPreguntas para dibujar su SVG
    let svgHtml = '';
    const originalQ = bancoPreguntas.find(bq => bq.id === ans.id);
    if (originalQ && originalQ.categoria === 'spatial' && originalQ.svg) {
      svgHtml = `<div class="ccat_spatial_container ccat_margin_bottom_2vh">${originalQ.svg}</div>`;
    }

    content.innerHTML = `
      <p class="ccat_review_item_text">${qTexto}</p>
      ${svgHtml}
      <div class="ccat_review_options_list">
        ${optionsHtml}
      </div>
      <div class="ccat_review_explanation">
        <p><strong>${_lg.results?.explanationLabel || 'Explicación:'}</strong> ${ans.explanation}</p>
      </div>
    `;

    // Toggler colapsable
    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('ccat_review_item--open');
      
      // Cerrar todos los demás para mantenerlo limpio (comportamiento acordeón puro)
      document.querySelectorAll('.ccat_review_item').forEach(el => el.classList.remove('ccat_review_item--open'));

      if (!isOpen) {
        item.classList.add('ccat_review_item--open');
      }
    });

    item.appendChild(header);
    item.appendChild(content);
    container.appendChild(item);
  });
};

// ── UTILS ────────────────────────────────────────────────────────────────────

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};
