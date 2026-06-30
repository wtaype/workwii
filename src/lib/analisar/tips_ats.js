/**
 * tips_ats.js — Sistema de tips contextuales para el analizador ATS
 * Muestra consejos relevantes durante la carga y en los resultados con soporte multilingüe.
 */

const getLang = () => {
  const workspace = document.getElementById('atsWorkspace');
  return workspace?.getAttribute('data-locale') || 'es';
};

// Tips generales mostrados durante la carga (rotación cada 4.5s)
export const TIPS_LOADING_ES = [
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

export const TIPS_LOADING_EN = [
  { icon: 'fa-lightbulb', text: 'Resumes with more than 500 words have a 40% higher keyword detection rate by ATS systems.' },
  { icon: 'fa-file-alt', text: 'Avoid tables and multiple columns. ATS scanners read resumes from left to right in a single column.' },
  { icon: 'fa-tags', text: 'Include the exact keywords from the job description — ATS search for exact matches.' },
  { icon: 'fa-percentage', text: 'Candidates with an ATS score of ≥75% are 3× more likely to land an interview.' },
  { icon: 'fa-font', text: 'Use standard fonts: Arial, Calibri, or Times New Roman. Decorative fonts confuse parsers.' },
  { icon: 'fa-id-card', text: 'Always place email, phone, and LinkedIn at the top of your resume — it is the first thing ATS look for.' },
  { icon: 'fa-chart-bar', text: 'Quantify your achievements: "Increased sales by 30%" beats "Improved sales" in any ATS assessment.' },
  { icon: 'fa-spell-check', text: 'Tailor your CV for every job. A generic CV can score up to 30% lower than a targeted one.' },
  { icon: 'fa-graduation-cap', text: 'Spell out titles and certifications in full — acronyms might not be recognized.' },
  { icon: 'fa-robot', text: '98% of Fortune 500 companies use ATS. Beating the automatic filter is the first key step.' },
];

// Tips basados en score obtenido
export const getTipsByScore = (score) => {
  const isEn = getLang() === 'en';
  if (score < 50) {
    return isEn ? [
      { icon: 'fa-exclamation-circle', color: 'var(--error)', text: 'Urgent priority: add missing keywords to your Skills section.' },
      { icon: 'fa-file-alt', color: 'var(--error)', text: 'Check formatting: a low score can indicate parser issues (tables, columns, images).' },
      { icon: 'fa-redo', color: 'var(--warning)', text: 'Consider using the "Optimize with AI" tool to get an ATS-ready version automatically.' },
    ] : [
      { icon: 'fa-exclamation-circle', color: 'var(--error)', text: 'Prioridad urgente: agrega las keywords faltantes a tu sección de Habilidades.' },
      { icon: 'fa-file-alt', color: 'var(--error)', text: 'Revisa el formato: un score bajo puede indicar problemas de parsing (tablas, imágenes, columnas).' },
      { icon: 'fa-redo', color: 'var(--warning)', text: 'Considera usar la herramienta "Corregir con IA" para obtener una versión ATS-optimizada automáticamente.' },
    ];
  } else if (score < 75) {
    return isEn ? [
      { icon: 'fa-arrow-up', color: 'var(--warning)', text: 'You are close to the 75% threshold. Adding missing keywords can give you the push you need.' },
      { icon: 'fa-pen', color: 'var(--warning)', text: 'Improve action verbs in your work experience to increase perceived impact.' },
      { icon: 'fa-trophy', color: 'var(--mco)', text: 'Add quantified achievements (numbers, percentages) to stand out among candidates.' },
    ] : [
      { icon: 'fa-arrow-up', color: 'var(--warning)', text: 'Estás cerca del umbral de 75%. Añadir las keywords faltantes puede darte el empujón necesario.' },
      { icon: 'fa-pen', color: 'var(--warning)', text: 'Mejora los verbos de acción en tu experiencia laboral para aumentar el impacto percibido.' },
      { icon: 'fa-trophy', color: 'var(--mco)', text: 'Agrega logros cuantificados (números, porcentajes) para destacar entre los candidatos.' },
    ];
  } else {
    return isEn ? [
      { icon: 'fa-check-circle', color: 'var(--success)', text: 'Excellent! Your CV exceeds the 75% threshold recommended by recruiters.' },
      { icon: 'fa-search', color: 'var(--success)', text: 'Now focus on tailoring your CV to each job description to maximize matches.' },
      { icon: 'fa-user-tie', color: 'var(--mco)', text: 'With this score, the next step is making sure your resume narrative impacts the human recruiter.' },
    ] : [
      { icon: 'fa-check-circle', color: 'var(--success)', text: '¡Excelente! Tu CV supera el umbral de 75% recomendado por los reclutadores.' },
      { icon: 'fa-search', color: 'var(--success)', text: 'Ahora enfócate en adaptar tu CV a cada oferta específica para maximizar el match.' },
      { icon: 'fa-user-tie', color: 'var(--mco)', text: 'Con este score, el próximo paso es asegurarte de que la narrativa de tu CV impacte al reclutador humano.' },
    ];
  }
};

/**
 * Inicializa el rotador de tips durante la pantalla de carga
 * @param {string} containerId - ID del elemento donde se inyectan los tips
 * @returns {Function} - Función para detener el rotador
 */
export const initTipsRotator = (containerId) => {
  const container = document.getElementById(containerId);
  if (!container) return () => {};

  const isEn = getLang() === 'en';
  const sourceTips = isEn ? TIPS_LOADING_EN : TIPS_LOADING_ES;

  let index = 0;
  const tips = [...sourceTips].sort(() => Math.random() - 0.5); // Aleatorio

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
