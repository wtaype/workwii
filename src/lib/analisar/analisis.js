import { llamarGemini } from '../api/gemini.js';

export const analizarCvConGemini = async (cvData, jobDesc, type) => {
  const systemInstruction = `Eres un experto en Selección de Personal y filtros de contratación automatizados ATS (Applicant Tracking Systems). Tu tarea es evaluar el Currículum Vitae (CV) proporcionado contra la Descripción de la Vacante de Empleo.

Genera un informe detallado y estructurado en formato JSON. El formato JSON devuelto debe cumplir EXACTAMENTE con esta estructura, sin textos adicionales markdown ni explicaciones fuera del JSON (devuelve solo el JSON puro):
{
  "score": 85, // número entero de 0 a 100 que representa la compatibilidad general
  "summary": "Resumen ejecutivo del análisis (máximo 120 palabras)...",
  "matchedKeywords": ["habilidad1", "habilidad2"], // palabras clave importantes del puesto encontradas en el CV (máximo 15)
  "missingKeywords": ["habilidad3", "habilidad4"], // palabras clave importantes del puesto que FALTAN en el CV y son críticas (máximo 15)
  "recommendations": [
    {
      "section": "Experiencia Laboral" | "Habilidades" | "Educación" | "Formato y Visual",
      "advice": "Explicación detallada y accionable de la mejora recomendada...",
      "priority": "Alta" | "Media" | "Baja"
    }
  ],
  "atsWarnings": ["Advertencias de formato: por ejemplo, uso de tablas complejas, diseño de dos columnas, falta de datos de contacto legibles, fuentes no estándar, elementos visuales que confunden a los ATS, etc. Si el formato es limpio, dejar array vacío"]
}`;

  let contents = [];
  if (type === 'pdf') {
    // PDF Directo: Enviar como inlineData (multimodal)
    contents = [
      {
        parts: [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: cvData
            }
          },
          {
            text: `Por favor, lee el archivo PDF adjunto que representa el currículum del candidato, compáralo con la oferta de empleo siguiente y genera el reporte JSON.\n\nOFERTA DE EMPLEO:\n${jobDesc}`
          }
        ]
      }
    ];
  } else {
    // Word o Texto Manual
    contents = [
      {
        parts: [
          {
            text: `CURRÍCULUM DEL CANDIDATO:\n"""\n${cvData}\n"""\n\nOFERTA DE EMPLEO:\n"""\n${jobDesc}\n"""`
          }
        ]
      }
    ];
  }

  const cleanJsonStr = await llamarGemini({
    contents,
    systemInstruction,
    responseMimeType: 'application/json'
  });

  return JSON.parse(cleanJsonStr);
};

