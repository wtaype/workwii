/**
 * procesarJson.js - Parseo de CV a formato JSON estructurado para Listo
 * Utiliza Gemini API para convertir textos crudos o PDFs en un JSON estándar.
 */

import { llamarGemini } from '../../../api/gemini.js';

export const estructurarCvConIA = async (textoCv, puestoDeseado = '', idiomaDestino = 'es', inputType = 'text', empresa = '') => {
  let idiomaPrompt = '';
  if (idiomaDestino === 'en') {
    idiomaPrompt = `IMPORTANTE: Traduce y redacta TODO el contenido del curriculum al ingles (English). El JSON resultante debe tener todos los textos en ingles. En el JSON final, establece el campo "idioma" como "en".`;
  } else if (idiomaDestino === 'es') {
    idiomaPrompt = `IMPORTANTE: Redacta todo el contenido del curriculum en espanol latinoamericano. En el JSON final, establece el campo "idioma" como "es".`;
  } else {
    idiomaPrompt = `IMPORTANTE: Analiza y detecta el idioma del curriculum.
1. Si esta en espanol, mantén todo en espanol, y establece el campo "idioma" como "es" en el JSON final.
2. Si esta en ingles o cualquier otro, tradúcelo/redáctalo completamente en ingles, y establece el campo "idioma" como "en".`;
  }

  const systemInstruction = `Eres un extractor inteligente de informacion de curriculums.
Tu tarea es tomar el texto bruto o el archivo PDF de un curriculum provisto por el usuario, extraer toda su informacion relevante y estructurarla exactamente en el formato JSON especificado.

IMPORTANTE (REGLAS DE EXTRACCION SIN OPTIMIZAR - FIDELIDAD ABSOLUTA):
1. DEBES realizar una transcripcion literal y exacta del contenido. NO optimices, no reescribas, no corrijas gramatica ni mejores la redaccion.
2. Manten el resumen profesional y los logros/funciones de cada experiencia laboral EXACTAMENTE como los redacto el usuario.
3. Conserva las funciones y logros originales de cada experiencia laboral dentro del campo "logros" en forma de lista de guiones (- ).
4. Habilidades (Skills): Extrae las habilidades tecnicas y blandas que el candidato menciona de forma explicita, como un string separado por comas (ej: "React, Node.js, Git"). Maximo 20 habilidades.
5. Idiomas: Identifica los idiomas y niveles mencionados.
6. Proyectos: Extrae los proyectos destacados en un array "proyectos".
7. Certificaciones: Extrae las certificaciones en un array "certificaciones".

${idiomaPrompt}

Devuelve UNICAMENTE el reporte JSON que cumpla EXACTAMENTE con esta estructura (no incluyas texto markdown ni explicaciones adicionales fuera del JSON):
{
  "nombre": "Nombre Completo del candidato",
  "titulo": "Titulo profesional o cargo actual",
  "email": "correo@ejemplo.com",
  "telefono": "+51 999 999 999",
  "ubicacion": "Ciudad, Pais",
  "linkedin": "https://linkedin.com/in/usuario",
  "web": "https://web.com",
  "resumen": "Resumen original...",
  "experiencias": [
    {
      "puesto": "Cargo ocupado",
      "empresa": "Nombre de la empresa",
      "ubicacion": "Ubicacion",
      "inicio": "Fecha inicio",
      "fin": "Fecha fin o 'Presente'",
      "logros": "- Logro original 1\\n- Logro original 2"
    }
  ],
  "educacion": [
    {
      "institucion": "Nombre de universidad",
      "grado": "Titulo obtenido",
      "ubicacion": "Ciudad, Pais",
      "inicio": "Fecha inicio",
      "fin": "Fecha fin"
    }
  ],
  "proyectos": [
    {
      "nombre": "Nombre del proyecto",
      "enlace": "https://proyecto.com",
      "descripcion": "Descripcion...",
      "tecnologias": "Astro, Firebase"
    }
  ],
  "certificaciones": [
    {
      "nombre": "Nombre de la certificacion",
      "emisor": "Emisor",
      "fecha": "Fecha"
    }
  ],
  "skills": "Habilidad1, Habilidad2...",
  "idiomas": ["Idioma 1 (Nivel)", "Idioma 2 (Nivel)"],
  "idioma": "es o en"
}`;

  let contents = [];
  if (inputType === 'pdf') {
    contents = [
      {
        parts: [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: textoCv
            }
          },
          {
            text: `Lee el PDF adjunto (curriculum del candidato), extrae y transcribe fielmente su informacion sin optimizar, tradúcelo (si el idioma de destino es ingles) y estructúralo en el formato JSON solicitado.\n\n${empresa ? `EMPRESA DESTINO: "${empresa}"\n` : ''}${puestoDeseado ? `PUESTO DESEADO: "${puestoDeseado}"` : ''}`
          }
        ]
      }
    ];
  } else {
    const userText = `CURRICULUM BRUTO DEL CANDIDATO:
"""
${textoCv}
"""
${empresa      ? `EMPRESA DESTINO: "${empresa}"`      : ''}
${puestoDeseado ? `PUESTO DESEADO: "${puestoDeseado}"` : ''}
Por favor, extrae, traduce si es necesario y estructura en el formato JSON requerido.`;
    contents = [{ parts: [{ text: userText }] }];
  }

  const rawResponse = await llamarGemini({
    contents,
    systemInstruction,
    responseMimeType: 'application/json',
    temperature: 0.0
  });

  const parsedJson = JSON.parse(rawResponse);
  
  const generarId = (prefijo) => `${prefijo}_${Math.random().toString(36).substring(2, 9)}`;

  if (Array.isArray(parsedJson.experiencias)) {
    parsedJson.experiencias = parsedJson.experiencias.map(exp => ({ id: generarId('exp'), ...exp }));
  } else {
    parsedJson.experiencias = [];
  }

  if (Array.isArray(parsedJson.educacion)) {
    parsedJson.educacion = parsedJson.educacion.map(edu => ({ id: generarId('edu'), ...edu }));
  } else {
    parsedJson.educacion = [];
  }

  if (Array.isArray(parsedJson.proyectos)) {
    parsedJson.proyectos = parsedJson.proyectos.map(proj => ({ id: generarId('proj'), ...proj }));
  } else {
    parsedJson.proyectos = [];
  }

  if (Array.isArray(parsedJson.certificaciones)) {
    parsedJson.certificaciones = parsedJson.certificaciones.map(cert => ({ id: generarId('cert'), ...cert }));
  } else {
    parsedJson.certificaciones = [];
  }

  if (!Array.isArray(parsedJson.idiomas)) {
    parsedJson.idiomas = [];
  }

  return parsedJson;
};
