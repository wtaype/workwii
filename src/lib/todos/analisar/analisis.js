import { llamarGemini } from '../../api/gemini.js';

export const analizarCvConGemini = async (cvData, jobDesc, type, targetRole = '', language = 'es') => {
  let langInstruction = '';
  if (language === 'en') {
    langInstruction = `
IMPORTANT: All text values and descriptive fields in the returned JSON (including "summary", "matchedKeywords", "missingKeywords", "advice" inside recommendations, "atsWarnings", "detectedProfile", "actionVerbs", "tips") MUST be written in English. Maintain the exact JSON keys as specified.`;
  } else {
    langInstruction = `
IMPORTANTE: Todos los textos y campos descriptivos del JSON de salida DEBEN estar escritos en Español. Mantén las claves JSON exactamente como se especifican.`;
  }

  let roleInstruction = '';
  if (targetRole && targetRole.trim()) {
    roleInstruction = `
El candidato está aplicando específicamente para el puesto de: "${targetRole}".
Evalúa el currículum poniendo especial foco en los requisitos típicos y palabras clave de esta posición.`;
  }

  const systemInstruction = `Eres un experto en Selección de Personal y filtros de contratación automatizados ATS (Applicant Tracking Systems). Tu tarea es evaluar el Currículum Vitae (CV) proporcionado.
${roleInstruction}
${langInstruction}

Genera un informe detallado y estructurado en formato JSON. Devuelve SOLO el JSON puro sin markdown ni texto adicional:
{
  "score": 85,
  "breakdown": {
    "contactInfo": 90,
    "experience": 75,
    "education": 80,
    "skills": 65
  },
  "summary": "Resumen ejecutivo del análisis (máximo 120 palabras)",
  "matchedKeywords": ["habilidad1", "habilidad2"],
  "missingKeywords": ["habilidad3", "habilidad4"],
  "recommendations": [
    {
      "section": "Experiencia Laboral",
      "advice": "Explicación detallada y accionable",
      "priority": "Alta",
      "estimatedMinutes": 15,
      "pointsGain": 8
    }
  ],
  "atsWarnings": ["Advertencia de formato 1"],
  "detectedProfile": {
    "fullName": "Juan Pérez López",
    "email": "juan.perez@email.com",
    "phone": "+52 55 1234 5678",
    "linkedin": "linkedin.com/in/juanperez",
    "currentTitle": "Desarrollador Full Stack",
    "currentCompany": "TechCorp S.A.",
    "estimatedYearsExp": 5,
    "educationLevel": "Licenciatura en Ciencias Computacionales",
    "totalWords": 450,
    "estimatedPages": 1,
    "sectionsFound": ["Experiencia", "Educación", "Habilidades"],
    "atsParseable": true,
    "parsingIssues": []
  },
  "languageQuality": {
    "actionVerbsFound": ["desarrollé", "optimicé", "implementé"],
    "actionVerbsMissing": ["lideré", "aumenté", "reduje"],
    "quantifiedAchievements": 2,
    "keywordDensity": "normal"
  },
  "benchmark": {
    "sectorAverage": 61,
    "topCandidates": 88,
    "passThreshold": 75
  }
}`;

  let contents = [];
  if (type === 'pdf') {
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
            text: `Lee el PDF adjunto (currículum del candidato) y genera el reporte JSON solicitado.\n\nPUESTO OBJETIVO: ${targetRole || 'No especificado'}`
          }
        ]
      }
    ];
  } else {
    contents = [
      {
        parts: [
          {
            text: `CURRÍCULUM DEL CANDIDATO:\n"""\n${cvData}\n"""\n\nPUESTO OBJETIVO: ${targetRole || 'No especificado'}`
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
