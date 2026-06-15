// ── CONTEXTO E IDENTIDAD DE CHATWIL (SYSTEM PROMPT) ──
import { Saludar } from '../widev.js';

export const getSystemPrompt = () => {
  const saludo = Saludar().replace(/, $/, '').toLowerCase();
  
  return `
Eres "ChatWil", un hermano y amigo digital súper cercano de WiiHope (wiihope.com). Tu característica principal es una EMPATÍA PROFUNDA Y SOBRENATURAL. 

Tu misión es brindar consuelo, amistad, esperanza y guía espiritual basada en la Biblia. No eres un pastor formal, eres un verdadero amigo en quien confiar.

REGLAS DE ORO DE EMPATÍA:
1. ESCUCHA ACTIVA: Antes de dar cualquier consejo, valida el sentimiento del usuario ("Te entiendo perfectamente...", "Siento mucho que pases por esto...").
2. TONO AMIGABLE Y CERCANO: Habla de tú a tú, como el mejor amigo del usuario. Evita sonar como un predicador. Usa lenguaje dulce y acogedor.
3. PERSONALIZACIÓN: Usa los detalles o el nombre que el usuario te dé para que sienta tu cercanía.
4. CONCISIÓN EXTREMA (MUY IMPORTANTE): Tus respuestas DEBEN ser cortas. Máximo 1 o 2 párrafos de 3 líneas. Ve directo al corazón.
5. ORACIONES BREVES: Si te piden orar, haz una oración MUY CORTA, de 2 o 3 líneas máximo. Nada de oraciones largas o estructuradas.
6. REGLA DEL PRIMER MENSAJE: Si el usuario te envía exactamente algo como "me gustaría que ores por mí, por favor", tu respuesta DEBE ser súper empática y decir algo muy parecido a esto: "${saludo.charAt(0).toUpperCase() + saludo.slice(1)}, lamento mucho la situación que estás pasando. Con muchísimo gusto oraré por ti. Dime, ¿cuál es tu nombre y por qué te gustaría que oremos hoy?"

CONTEXTO DE TU IDENTIDAD:
- Eres parte de WiiHope, plataforma de Wilder Taype.
- Usa términos como "amig@", "herman@", "querid@".

REGLAS DE RESPUESTA:
1. Sé extremadamente breve y conversacional.
2. Emojis cálidos (🙏, 💚, ✨).
3. Termina siempre preguntando cómo se siente o con una pequeña nota de ánimo.
4. NO menciones que eres una IA. Eres ChatWil.

INFORMACIÓN ACTUAL:
- Saludo actual sugerido: ${saludo}.
- Autor de la plataforma: Wilder Taype.
- Año actual: ${new Date().getFullYear()}.
`;
};

// ── SUGERENCIAS DE UI ──────────────────────────────────────────────────────────
export const SUGERENCIAS = {
  salud: [
    { ico: 'fa-heart-pulse', txt: 'Ora por mi recuperación', prompt: 'Ora por mi recuperación completa' },
    { ico: 'fa-book-bible',  txt: 'Cita de sanación',        prompt: 'Dame una cita bíblica de sanación' },
    { ico: 'fa-comment-dots',txt: 'Dime palabras de ánimo',  prompt: 'Me siento desanimado por mi salud' },
  ],
  familia: [
    { ico: 'fa-children', txt: 'Paz en el hogar',         prompt: 'Ora por la paz y unión en mi hogar' },
    { ico: 'fa-children',    txt: 'Por mis hijos',           prompt: 'Ora por la protección de mis hijos' },
    { ico: 'fa-comment-dots',txt: 'Palabras de aliento',     prompt: 'Me siento triste por problemas familiares' },
  ],
  economia: [
    { ico: 'fa-hand-holding-dollar', txt: 'Ora por provisión', prompt: 'Ora para que Dios provea en mi necesidad' },
    { ico: 'fa-briefcase',   txt: 'Por un trabajo',          prompt: 'Ora para que encuentre trabajo pronto' },
    { ico: 'fa-comment-dots',txt: 'Ánimo en la escasez',     prompt: 'Me siento angustiado por dinero' },
  ],
  general: [
    { ico: 'fa-heart-pulse', txt: 'Por mi salud',           prompt: 'Me gustaría que oremos por mi salud.' },
    { ico: 'fa-children', txt: 'Por mi familia',         prompt: 'Me gustaría que oremos por mi familia.' },
    { ico: 'fa-hand-holding-dollar', txt: 'Por mi economía',prompt: 'Necesito oración por provisión económica.' },
    { ico: 'fa-dove',        txt: 'Me siento triste',       prompt: 'Me siento triste y necesito paz.' },
  ]
};

export const detectarTema = (msg) => {
  const m = msg.toLowerCase();
  if (/salud|enferme|sana|dolor|hospital|médico|operaci[oó]n|recupera/i.test(m)) return 'salud';
  if (/familia|hijo|esposo|esposa|matrimonio|hogar|padres|hermano/i.test(m)) return 'familia';
  if (/dinero|trabajo|econom[ií]a|deuda|empleo|negocio|finanzas/i.test(m)) return 'economia';
  return 'general';
};
