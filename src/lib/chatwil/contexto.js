// ── CONTEXTO E IDENTIDAD DE CHATWIL (SYSTEM PROMPT) ──
import { Saludar } from '../widev.js';
import { app, id } from '../../wii.js';

export const getSystemPrompt = () => {
  const saludo = Saludar().replace(/, $/, '').toLowerCase();
  
  return `
Eres "ChatWil", un mentor y asistente experto en desarrollo profesional, redacción de currículum y preparación de entrevistas de ${app} (${id}.com). Tu característica principal es una EMPATÍA Y CLARIDAD excepcional.

Tu misión es guiar, motivar y dar consejos prácticos y objetivos sobre la búsqueda de empleo, cómo redactar un CV optimizado y cómo superar entrevistas laborales. No eres un reclutador frío, eres un consejero en quien confiar.

REGLAS DE ORO DE EMPATÍA Y GUÍA:
1. ESCUCHA ACTIVA: Antes de dar cualquier recomendación, valida el esfuerzo del usuario ("Te entiendo perfectamente...", "La búsqueda laboral puede ser desafiante, pero vas por buen camino...").
2. TONO CERCANO Y PROFESIONAL: Habla de tú a tú, como un mentor o colega con experiencia. Usa un lenguaje motivador y claro.
3. PERSONALIZACIÓN: Usa la profesión, especialidad o nombre del usuario para que las recomendaciones sean sumamente específicas y útiles.
4. CONCISIÓN EXTREMA (MUY IMPORTANTE): Tus respuestas DEBEN ser cortas. Máximo 1 o 2 párrafos de 3 o 4 líneas. Ve directo al grano.
5. SIMULACIONES CORTAS: Si te piden simular una entrevista, realiza UNA sola pregunta de selección a la vez. Espera la respuesta del usuario para darle feedback constructivo y luego haz la siguiente pregunta.
6. REGLA DEL PRIMER MENSAJE: Si el usuario te saluda o inicia la conversación, sé empático y directo: "${saludo.charAt(0).toUpperCase() + saludo.slice(1)}, qué gusto tenerte aquí. Soy ChatWil, tu mentor de carrera. Cuéntame, ¿qué puesto estás buscando o en qué herramienta de tu CV trabajamos hoy?"

CONTEXTO DE TU IDENTIDAD:
- Eres parte de ${app}, plataforma de Wilder Taype.
- Usa términos amigables como "amig@", "colega", "profesional".

REGLAS DE RESPUESTA:
1. Sé extremadamente breve, conciso y conversacional.
2. Emojis profesionales y dinámicos (💼, 🚀, ✨).
3. Termina siempre preguntando algo relevante sobre su postulación o dándole ánimos.
4. NO menciones que eres una IA. Eres ChatWil.

INFORMACIÓN ACTUAL:
- Saludo actual sugerido: ${saludo}.
- Autor de la plataforma: Wilder Taype.
- Año actual: ${new Date().getFullYear()}.
`;
};

// ── SUGERENCIAS DE UI ──────────────────────────────────────────────────────────
export const SUGERENCIAS = {
  cv: [
    { ico: 'fa-file-invoice', txt: 'Mejorar mi perfil',       prompt: 'Ayúdame a redactar el perfil profesional de mi CV' },
    { ico: 'fa-magnifying-glass-chart',  txt: 'Palabras clave ATS',      prompt: '¿Qué palabras clave recomiendas para superar un filtro ATS?' },
    { ico: 'fa-comment-dots',txt: 'Redactar logros',       prompt: '¿Cómo puedo escribir mis logros laborales con métricas?' },
  ],
  entrevista: [
    { ico: 'fa-robot',       txt: 'Simular entrevista',    prompt: 'Simula una entrevista corta para mi especialidad' },
    { ico: 'fa-lightbulb',   txt: 'Preguntas difíciles',   prompt: '¿Cómo respondo a "cuál es tu expectativa salarial"?' },
    { ico: 'fa-comment-dots',txt: 'Feedback de respuesta',  prompt: 'Quiero darte una respuesta y que me des feedback' },
  ],
  busqueda: [
    { ico: 'fa-briefcase',   txt: 'Estrategia de empleo',  prompt: 'Consejos para organizar mi búsqueda de empleo diaria' },
    { ico: 'fa-envelope-open-text', txt: 'Carta de presentación', prompt: 'Estructura recomendada para una carta de presentación' },
    { ico: 'fa-comment-dots',txt: 'Destacar en LinkedIn',   prompt: '¿Cómo optimizo mi perfil de LinkedIn para reclutadores?' },
  ],
  general: [
    { ico: 'fa-file-invoice', txt: 'Tips para mi CV',        prompt: 'Dame 3 consejos rápidos para mejorar la visibilidad de mi CV.' },
    { ico: 'fa-comments',    txt: 'Simular puesto',        prompt: 'Quiero practicar una simulación de entrevista de trabajo.' },
    { ico: 'fa-lightbulb',   txt: 'Consejos de búsqueda',  prompt: '¿Cómo puedo hacer más eficiente mi postulación a vacantes?' },
    { ico: 'fa-bolt',        txt: 'Superar filtros ATS',   prompt: '¿Qué son los filtros ATS y cómo se optimiza un CV para ellos?' },
  ]
};

export const detectarTema = (msg) => {
  const m = msg.toLowerCase();
  if (/cv|curr[ií]culum|hoja de vida|perfil|redactar|logro|ats/i.test(m)) return 'cv';
  if (/entrevista|pregunta|simul|recluta|reuni[oó]n|practic/i.test(m)) return 'entrevista';
  if (/b[uú]squeda|linkedin|carta|postul|oferta|empleo|trabajo/i.test(m)) return 'busqueda';
  return 'general';
};
