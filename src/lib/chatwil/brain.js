// ========== MÓDULO PRINCIPAL DE PROCESAMIENTO - BRAIN.JS ==========
import { AI_CONFIG } from './config.js';
import { getSystemPrompt } from './contexto.js';

/**
 * PROCESAR MENSAJE
 * Recurre a la IA (Gemini) usando el prompt pastoral
 */
export const procesar = async (mensaje, historial = []) => {
  
  if (AI_CONFIG.GEMINI_KEY) {
    try {
      // Importación dinámica del SDK (Carga perezosa)
      const { GoogleGenerativeAI } = await import('https://esm.run/@google/generative-ai');
      
      const genAI = new GoogleGenerativeAI(AI_CONFIG.GEMINI_KEY);
      
      const safetySettings = [
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
      ];

      const model = genAI.getGenerativeModel({ 
        model: AI_CONFIG.MODEL,
        systemInstruction: getSystemPrompt(),
        safetySettings
      });

      // Preparar historial para el chat
      const history = historial.map(h => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }],
      }));

      const chat = model.startChat({ history });
      const result = await chat.sendMessage(mensaje);
      const response = await result.response;
      return response.text();

    } catch (err) {
      console.error('❌ Error en Gemini:', err);
    }
  }
  
  // Fallback inteligente si falla API
  const fallbacks = [
    '💙😊 Me gustaría ayudarte, herman@. ¿Puedes contarme un poco más sobre lo que necesitas? Estoy aquí para ti con todo mi corazón. 💚✨',
    '🙏 Entiendo. A veces es difícil encontrar las palabras. Si te gustaría que oremos juntos por algo en específico, dímelo con confianza.',
    '🕊️ Dios te ama infinitamente. Si necesitas que hablemos de algún problema o elevemos una oración al Padre, estoy aquí para escucharte.'
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
};
