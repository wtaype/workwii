// ── CONFIGURACIÓN CENTRALIZADA DE IA - GEMINI API ──
export const GEMINI_CONFIG = {
  GEMINI_KEY: import.meta.env.PUBLIC_GEMINI_KEY,
  MODEL: 'gemini-3.1-flash-lite-preview', // Modelo ultrarrápido y económico de Gemini
  TEMPERATURE: 0.15,
  MAX_TOKENS: 2500,
};

/**
 * Realiza una petición estructurada a la API de Gemini.
 * Soporta entrada de texto básica y formato multimodal (e.g. PDF en base64).
 *
 * @param {object} params
 * @param {Array} params.contents - Estructura de contenido oficial de la API de Gemini (con parts).
 * @param {string} [params.systemInstruction] - Instrucción de sistema para definir el comportamiento de la IA.
 * @param {string} [params.responseMimeType='text/plain'] - Tipo de respuesta (e.g. 'application/json').
 * @param {number} [params.temperature] - Grado de creatividad/precisión de la respuesta.
 * @returns {Promise<string>} Texto de respuesta limpio.
 */
export const llamarGemini = async ({
  contents,
  systemInstruction = '',
  responseMimeType = 'text/plain',
  temperature = GEMINI_CONFIG.TEMPERATURE
}) => {
  const apiKey = GEMINI_CONFIG.GEMINI_KEY;
  if (!apiKey) {
    throw new Error('La clave API de Gemini no está configurada.');
  }

  const model = GEMINI_CONFIG.MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body = {
    contents,
    generationConfig: {
      responseMimeType,
      temperature,
      maxOutputTokens: GEMINI_CONFIG.MAX_TOKENS
    }
  };

  // Añadir la instrucción de sistema si es provista
  if (systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`Error en el servicio de IA de Gemini: ${response.statusText}`);
  }

  const data = await response.json();

  // Detectar bloqueo por filtros de seguridad a nivel de prompt
  if (data.promptFeedback?.blockReason) {
    throw new Error(`Gemini bloqueó la solicitud: ${data.promptFeedback.blockReason}`);
  }

  // Detectar respuesta vacía o sin candidatos
  const candidate = data.candidates?.[0];
  if (!candidate) {
    throw new Error('Gemini devolvió una respuesta vacía (sin candidatos). Intenta de nuevo.');
  }

  // Detectar candidato bloqueado por finishReason (SAFETY, RECITATION, etc.)
  if (candidate.finishReason && candidate.finishReason !== 'STOP' && candidate.finishReason !== 'MAX_TOKENS') {
    throw new Error(`Gemini rechazó la respuesta: finishReason="${candidate.finishReason}"`);
  }

  const rawText = candidate.content?.parts?.[0]?.text ?? '';

  if (!rawText) {
    throw new Error('Gemini devolvió un candidato sin texto. El modelo no generó contenido.');
  }

  // Limpiar posibles bloques markdown del JSON si la respuesta los incluye de forma redundante
  return rawText.trim().replace(/^```[a-z]*\s*/i, '').replace(/```$/, '').trim();
};
