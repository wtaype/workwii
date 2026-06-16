// ── CONFIGURACIÓN DE IA - CHATWIL / ATS ──
export const AI_CONFIG = {
  GEMINI_KEY: import.meta.env.PUBLIC_GEMINI_KEY,
  MODEL: 'gemini-3.1-flash-lite-preview', // Usamos gemini-2.0-flash para un análisis rápido de CV
  TEMPERATURE: 0.15,
  MAX_TOKENS: 2500,
};