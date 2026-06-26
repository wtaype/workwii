/**
 * tips_ats.js — Sistema de tips contextuales para el analizador ATS
 * Muestra consejos relevantes durante la carga y en los resultados
 */

// Tips generales mostrados durante la carga (rotación cada 4s)
export const TIPS_LOADING = [
  { icon: 'fa-lightbulb', text: 'Los CVs con más de 500 palabras tienen un 40% mayor tasa de detección de keywords por los ATS.' },
  { icon: 'fa-file-alt', text: 'Evita tablas y columnas múltiples. Los ATS leen los CVs de izquierda a derecha en una sola columna.' },
  { icon: 'fa-tags', text: 'Incluye las palabras clave exactas de la oferta de empleo — los ATS hacen búsquedas de términos exactos.' },
  { icon: 'fa-percentage', text: 'Candidatos con un score ATS ≥75% tienen 3× más probabilidad de obtener una entrevista.' },
  { icon: 'fa-font', text: 'Usa fuentes estándar: Arial, Calibri o Times New Roman. Las fuentes decorativas confunden los parsers.' },
  { icon: 'fa-id-card', text: 'Siempre incluye tu correo, teléfono y LinkedIn en la parte superior del CV — es lo primero que busca el ATS.' },
  { icon: 'fa-chart-bar', text: 'Cuantifica tus logros: "Aumenté ventas 30%" supera a "Mejoré las ventas" en cualquier evaluación ATS.' },
  { icon: 'fa-spell-check', text: 'Adapta tu CV para cada puesto. Un CV genérico puede tener un score ATS 30% menor que uno personalizado.' },
  { icon: 'fa-graduation-cap', text: 'Incluye el nombre completo de tus títulos y certificaciones — las siglas pueden no ser reconocidas.' },
  { icon: 'fa-robot', text: 'El 98% de las empresas Fortune 500 usan ATS. Superar el filtro automático es el primer paso clave.' },
];

// Tips basados en score obtenido
export const getTipsByScore = (score) => {
  if (score < 50) {
    return [
      { icon: 'fa-exclamation-circle', color: 'var(--error)', text: 'Prioridad urgente: agrega las keywords faltantes a tu sección de Habilidades.' },
      { icon: 'fa-file-alt', color: 'var(--error)', text: 'Revisa el formato: un score bajo puede indicar problemas de parsing (tablas, imágenes, columnas).' },
      { icon: 'fa-redo', color: 'var(--warning)', text: 'Considera usar la herramienta "Corregir con IA" para obtener una versión ATS-optimizada automáticamente.' },
    ];
  } else if (score < 75) {
    return [
      { icon: 'fa-arrow-up', color: 'var(--warning)', text: 'Estás cerca del umbral de 75%. Añadir las keywords faltantes puede darte el empujón necesario.' },
      { icon: 'fa-pen', color: 'var(--warning)', text: 'Mejora los verbos de acción en tu experiencia laboral para aumentar el impacto percibido.' },
      { icon: 'fa-trophy', color: 'var(--mco)', text: 'Agrega logros cuantificados (números, porcentajes) para destacar entre los candidatos.' },
    ];
  } else {
    return [
      { icon: 'fa-check-circle', color: 'var(--success)', text: '¡Excelente! Tu CV supera el umbral de 75% recomendado por los reclutadores.' },
      { icon: 'fa-search', color: 'var(--success)', text: 'Ahora enfócate en adaptar tu CV a cada oferta específica para maximizar el match.' },
      { icon: 'fa-user-tie', color: 'var(--mco)', text: 'Con este score, el próximo paso es asegurarte de que la narrativa de tu CV impacte al reclutador humano.' },
    ];
  }
};

// Estadísticas motivacionales
export const STATS_FACTS = [
  { value: '75%', label: 'Score mínimo recomendado para pasar filtros ATS en grandes empresas' },
  { value: '98%', label: 'De las empresas Fortune 500 usan sistemas ATS para filtrar candidatos' },
  { value: '3×', label: 'Más posibilidades de entrevista con un CV ATS optimizado correctamente' },
  { value: '6 seg', label: 'Tiempo promedio que un reclutador dedica a revisar un CV manualmente' },
];

/**
 * Inicializa el rotador de tips durante la pantalla de carga
 * @param {string} containerId - ID del elemento donde se inyectan los tips
 * @returns {Function} - Función para detener el rotador
 */
export const initTipsRotator = (containerId) => {
  const container = document.getElementById(containerId);
  if (!container) return () => {};

  let index = 0;
  const tips = [...TIPS_LOADING].sort(() => Math.random() - 0.5); // Aleatorio

  const render = () => {
    const tip = tips[index % tips.length];
    container.style.opacity = '0';
    setTimeout(() => {
      container.innerHTML = `
        <i class="fas ${tip.icon}" style="color: var(--mco); font-size: 1.4rem; flex-shrink: 0;"></i>
        <span>${tip.text}</span>
      `;
      container.style.opacity = '1';
    }, 300);
    index++;
  };

  render();
  const interval = setInterval(render, 4500);
  return () => clearInterval(interval);
};

/**
 * Renderiza los tips contextuales según el score en un contenedor
 * @param {string} containerId - ID del contenedor destino
 * @param {number} score - Puntuación ATS obtenida
 */
export const renderScoreTips = (containerId, score) => {
  const container = document.getElementById(containerId);
  if (!container) return;

  const tips = getTipsByScore(score);
  container.innerHTML = tips.map(tip => `
    <div class="score_tip_item">
      <i class="fas ${tip.icon}" style="color: ${tip.color};"></i>
      <span>${tip.text}</span>
    </div>
  `).join('');
};
