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

/**
 * Realiza una petición estructurada y en streaming (SSE) a la API de Gemini.
 *
 * @param {object} params
 * @param {Array} params.contents - Estructura de contenido oficial de la API.
 * @param {string} [params.systemInstruction] - Instrucción del sistema.
 * @param {string} [params.responseMimeType='text/plain'] - Tipo de respuesta.
 * @param {number} [params.temperature] - Creatividad.
 * @param {function} params.onChunk - Callback ejecutado con cada trozo de texto nuevo.
 * @returns {Promise<string>} Respuesta completa acumulada.
 */
export const llamarGeminiStream = async ({
  contents,
  systemInstruction = '',
  responseMimeType = 'text/plain',
  temperature = GEMINI_CONFIG.TEMPERATURE,
  onChunk
}) => {
  const apiKey = GEMINI_CONFIG.GEMINI_KEY;
  if (!apiKey) {
    throw new Error('La clave API de Gemini no está configurada.');
  }

  const model = GEMINI_CONFIG.MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;

  const body = {
    contents,
    generationConfig: {
      responseMimeType,
      temperature,
      maxOutputTokens: GEMINI_CONFIG.MAX_TOKENS
    }
  };

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
    throw new Error(`Error en el servicio de IA de Gemini (Streaming): ${response.statusText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let fullText = '';

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const cleanLine = line.trim();
        if (!cleanLine) continue;

        if (cleanLine.startsWith('data: ')) {
          const dataStr = cleanLine.slice(6).trim();
          if (dataStr === '[DONE]') continue;

          try {
            const parsed = JSON.parse(dataStr);

            if (parsed.promptFeedback?.blockReason) {
              throw new Error(`Gemini bloqueó la solicitud: ${parsed.promptFeedback.blockReason}`);
            }

            const candidate = parsed.candidates?.[0];
            if (candidate) {
              if (candidate.finishReason && candidate.finishReason !== 'STOP' && candidate.finishReason !== 'MAX_TOKENS') {
                throw new Error(`Gemini rechazó la respuesta: finishReason="${candidate.finishReason}"`);
              }

              const text = candidate.content?.parts?.[0]?.text || '';
              if (text) {
                fullText += text;
                if (onChunk) {
                  onChunk(text);
                }
              }
            }
          } catch (jsonErr) {
            // Ignorar errores menores de parsing por chunks cortados temporalmente
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return fullText.trim().replace(/^```[a-z]*\s*/i, '').replace(/```$/, '').trim();
};
