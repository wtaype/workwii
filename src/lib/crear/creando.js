import { AI_CONFIG } from './config.js';
import { wiRateLimit, Notificacion } from '../widev.js';

let activeTextarea = null;
let onApply = null;

/**
 * Llama a la API de Gemini para optimizar el logro de experiencia del candidato.
 */
export const optimizarLogroConGemini = async (textoOriginal, puesto, empresa) => {
  const apiKey = AI_CONFIG.GEMINI_KEY;
  const model = AI_CONFIG.MODEL || 'gemini-3.1-flash-lite-preview';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const prompt = `Eres un experto redactor de currículums y optimización de perfiles para superar filtros ATS internacionales. 
Toma la siguiente descripción de logros o funciones del puesto de "${puesto || 'Profesional'}" en la empresa "${empresa || 'Empresa'}", y reescríbela de forma impecable y profesional en español.

Sigue estrictamente estas reglas:
1. Redáctalo en forma de lista de 2 a 4 viñetas (bullets) claras e impactantes.
2. Comienza cada viñeta con un verbo de acción fuerte (ej: Lideré, Implementé, Automaticé, Reduje, Incrementé).
3. Enfócate en el resultado o impacto de la acción (si es posible, añade porcentajes o cifras de ejemplo coherentes para dar impacto cuantitativo).
4. Devuelve ÚNICAMENTE el texto optimizado con guiones (-) o viñetas. No incluyas explicaciones previas, saludos, comentarios ni bloques markdown de código de ningún tipo (como \`\`\` o similares).

Texto original del candidato:
"""
${textoOriginal}
"""`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: AI_CONFIG.TEMPERATURE || 0.25 }
    })
  });

  if (!response.ok) {
    throw new Error(`Error en el servicio de Gemini: ${response.statusText}`);
  }

  const data = await response.json();
  let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return text.trim().replace(/^```[a-z]*\s*/i, '').replace(/```$/, '');
};

/**
 * Inicializa los eventos del modal de IA.
 */
export const initIA = () => {
  const closeModal = () => {
    document.getElementById('cr_ai_modal')?.classList.remove('active');
    activeTextarea = null;
    onApply = null;
  };

  document.getElementById('cr_btn_close_modal')?.addEventListener('click', closeModal);
  document.getElementById('cr_btn_discard_ai')?.addEventListener('click', closeModal);

  document.getElementById('cr_btn_apply_ai')?.addEventListener('click', () => {
    const optimizedText = document.getElementById('cr_ai_optimized_text')?.textContent || '';
    if (activeTextarea && optimizedText) {
      activeTextarea.value = optimizedText;
      activeTextarea.dispatchEvent(new Event('input')); // Disparar input para auto-save y preview
      onApply?.(optimizedText);
    }
    closeModal();
  });
};

/**
 * Abre el modal y ejecuta la optimización por IA.
 */
export const abrirModalIA = async (puesto, empresa, textareaElement, onApplyCallback) => {
  const isLogged = localStorage.getItem('wiSmile');
  let rate = null;

  if (!isLogged) {
    rate = wiRateLimit('guest_cv_creator_uses', 5, 315360000000);
    if (!rate.ok) {
      Notificacion('Has alcanzado el límite de 5 usos de prueba. Regístrate gratis para continuar sin límites.', 'warning', 6000);
      const { abrirLogin } = await import('../login.js');
      abrirLogin('registrar');
      return;
    }
  }

  activeTextarea = textareaElement;
  onApply = onApplyCallback;

  const originalText = textareaElement.value.trim();
  if (!originalText) {
    alert('Por favor redacta alguna descripción o funciones en el puesto primero, para que la IA pueda optimizarla.');
    return;
  }

  const modal = document.getElementById('cr_ai_modal');
  const originalContainer = document.getElementById('cr_ai_original_text');
  const optimizedBox = document.getElementById('cr_ai_optimized_text');
  const loader = document.getElementById('cr_ai_loading');
  const applyBtn = document.getElementById('cr_btn_apply_ai');

  if (!modal || !originalContainer || !optimizedBox || !loader || !applyBtn) return;

  // Set initial modal states
  originalContainer.textContent = originalText;
  optimizedBox.classList.add('dpn');
  optimizedBox.textContent = '';
  loader.classList.remove('dpn');
  applyBtn.disabled = true;
  modal.classList.add('active');

  try {
    const result = await optimizarLogroConGemini(originalText, puesto, empresa);
    if (rate) rate.fail(); // Registrar consumo exitoso en el navegador del invitado
    loader.classList.add('dpn');
    optimizedBox.textContent = result;
    optimizedBox.classList.remove('dpn');
    applyBtn.disabled = false;
  } catch (error) {
    console.error('Error de optimización IA:', error);
    loader.classList.add('dpn');
    optimizedBox.textContent = 'Ocurrió un error al contactar al servicio de optimización de Gemini. Inténtalo de nuevo más tarde.';
    optimizedBox.classList.remove('dpn');
  }
};
