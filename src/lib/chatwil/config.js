// ── CONFIGURACIÓN DE IA - CHATWIL ──
export const AI_CONFIG = {
  GEMINI_KEY: import.meta.env.PUBLIC_GEMINI_KEY ?? '',
  MODEL: 'gemini-3.1-flash-lite-preview',
  TEMPERATURE: 1.0,
  MAX_TOKENS: 500,
};
