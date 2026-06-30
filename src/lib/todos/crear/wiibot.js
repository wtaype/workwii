// src/lib/crear/wiibot.js
// Asistente Inteligente Wiibot (IA con Gemini) para Optimización de CV ATS

import { llamarGemini } from '../../api/gemini.js';
import { wiRateLimit, Notificacion } from '../../widev/widev.js';

/**
 * Llama a la API de Gemini para estructurar un currículum bruto o PDF extraído
 * en el formato JSON estándar de Workwii.
 */
export const estructurarCvConIA = async (textoCv, puestoDeseado = '', idiomaDestino = 'es', inputType = 'text') => {
  let idiomaPrompt = '';
  if (idiomaDestino === 'en') {
    idiomaPrompt = `IMPORTANTE: Traduce y redacta TODO el contenido del currículum al inglés (English). El JSON resultante debe tener todos los textos (incluyendo títulos de puestos, nombres de empresas si aplica traducirlas, resúmenes, descripciones de logros, nombres de habilidades e idiomas) redactados profesionalmente en inglés. En el JSON final, establece el campo "idioma" como "en".`;
  } else if (idiomaDestino === 'es') {
    idiomaPrompt = `IMPORTANTE: Redacta todo el contenido del currículum en español latinoamericano. En el JSON final, establece el campo "idioma" como "es".`;
  } else {
    idiomaPrompt = `IMPORTANTE: Analiza y detecta el idioma del currículum provisto.
1. Si el currículum está redactado principalmente en español, mantén e interactúa todo en español latinoamericano, y establece el campo obligatorio "idioma" como "es" en el JSON final.
2. Si el currículum está redactado en inglés o en cualquier otro idioma, tradúcelo, redáctalo e interactúalo completamente en inglés (English) profesional, y establece el campo obligatorio "idioma" como "en" en el JSON final.`;
  }

  const systemInstruction = `Eres un extractor inteligente de información de currículums.
Tu tarea es tomar el texto bruto o el archivo PDF de un currículum provisto por el usuario, extraer toda su información relevante y estructurarla exactamente en el formato JSON especificado.

IMPORTANTE (REGLAS DE EXTRACCIÓN SIN OPTIMIZAR - FIDELIDAD ABSOLUTA):
1. DEBES realizar una transcripción literal y exacta del contenido. NO optimices, no reescribas, no corrijas gramática, no embellezcas ni mejores la redacción en absoluto.
2. Mantén el resumen profesional y los logros/funciones de cada experiencia laboral EXACTAMENTE como los redactó el usuario en su documento original. No agregues verbos de acción fuertes, no agregues métricas o cifras que no existan, ni cambies palabras. Tu objetivo es la fidelidad absoluta.
3. Estructura el resumen profesional original en el campo "resumen".
4. Conserva las funciones y logros originales de cada experiencia laboral dentro del campo "logros" en forma de lista de guiones (- ).
5. Habilidades (Skills): Extrae únicamente las habilidades técnicas y blandas que el candidato menciona de forma explícita en su currículum, y devuélvelas como un string separado por comas (ej: "React, Node.js, Git"). Máximo 20 habilidades.
6. Idiomas: Identifica únicamente los idiomas y niveles mencionados explícitamente en el currículum.
7. Proyectos: Extrae los proyectos destacados que mencione el candidato en un array "proyectos". Cada proyecto debe contener: "nombre" (nombre del proyecto), "enlace" (link del proyecto, si existe), "descripcion" (descripción de lo que hace o logró) y "tecnologias" (tecnologías separadas por comas, ej: "React, Node.js").
8. Certificaciones: Extrae las certificaciones que posea el candidato en un array "certificaciones". Cada certificación debe tener: "nombre" (título obtenido), "emisor" (entidad que certifica) y "fecha" (fecha de expedición, año o mes/año).

${idiomaPrompt}

Devuelve ÚNICAMENTE el reporte JSON que cumpla EXACTAMENTE con esta estructura (no incluyas texto markdown \`\`\` ni explicaciones adicionales fuera del JSON):
{
  "nombre": "Nombre Completo del candidato",
  "titulo": "Título profesional o cargo actual (ej: Ingeniero de Software)",
  "email": "correo@ejemplo.com",
  "telefono": "+51 999 999 999",
  "ubicacion": "Ciudad, País",
  "linkedin": "https://linkedin.com/in/usuario (dejar vacío si no hay)",
  "web": "https://web.com (dejar vacío si no hay)",
  "resumen": "Resumen original de tu CV...",
  "experiencias": [
    {
      "puesto": "Cargo ocupado",
      "empresa": "Nombre de la empresa",
      "ubicacion": "Ubicación del trabajo (ej: Remoto o Lima, Perú)",
      "inicio": "Fecha de inicio (ej: Ene 2022)",
      "fin": "Fecha de fin o 'Presente'",
      "logros": "- Logro original extraído 1\\n- Logro original extraído 2..."
    }
  ],
  "educacion": [
    {
      "institucion": "Nombre de universidad o instituto",
      "grado": "Título o certificación obtenida",
      "ubicacion": "Ciudad, País",
      "inicio": "Fecha de inicio (ej: Mar 2017)",
      "fin": "Fecha de fin (ej: Dic 2021)"
    }
  ],
  "proyectos": [
    {
      "nombre": "Nombre del proyecto",
      "enlace": "https://proyecto.com (opcional)",
      "descripcion": "Descripción del proyecto...",
      "tecnologias": "Astro, Firebase"
    }
  ],
  "certificaciones": [
    {
      "nombre": "Nombre de la certificación",
      "emisor": "Emisor u Organización",
      "fecha": "Fecha"
    }
  ],
  "skills": "Habilidad1, Habilidad2, Habilidad3...",
  "idiomas": ["Idioma 1 (Nivel)", "Idioma 2 (Nivel)"],
  "idioma": "es o en (según el idioma detectado o solicitado)"
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
            text: `Lee el PDF adjunto (currículum del candidato), extrae y transcribe fielmente su información (manteniendo la redacción original de logros y resumen, sin optimizar), tradúcelo (si el idioma de destino es inglés) y estructúralo en el formato JSON solicitado.\n\n${puestoDeseado ? `PUESTO O ÁREA DESEADA AL QUE POSTULA:\n"${puestoDeseado}"` : ''}\n${idiomaDestino === 'en' ? 'IDIOMA DE DESTINO: Inglés (English)' : 'IDIOMA DE DESTINO: Español'}`
          }
        ]
      }
    ];
  } else {
    const userText = `CURRÍCULUM BRUTO DEL CANDIDATO:
"""
${textoCv}
"""

${puestoDeseado ? `PUESTO O ÁREA DESEADA AL QUE POSTULA:\n"${puestoDeseado}"` : ''}
${idiomaDestino === 'en' ? 'IDIOMA DE DESTINO: Inglés (English)\n' : 'IDIOMA DE DESTINO: Español\n'}
Por favor, extrae y transcribe fielmente su información (manteniendo la redacción original de logros y resumen, sin optimizar), traduce (si el idioma de destino es inglés) y estructura este currículum en el formato JSON requerido.`;

    contents = [{ parts: [{ text: userText }] }];
  }

  const rawResponse = await llamarGemini({
    contents,
    systemInstruction,
    responseMimeType: 'application/json',
    temperature: 0.0
  });

  const parsedJson = JSON.parse(rawResponse);
  if (idiomaDestino === 'auto') {
    parsedJson.idioma = parsedJson.idioma === 'en' ? 'en' : 'es';
  } else {
    parsedJson.idioma = idiomaDestino;
  }
  
  // Agregar IDs únicos a experiencias y educación para render
  if (parsedJson.experiencias && Array.isArray(parsedJson.experiencias)) {
    parsedJson.experiencias = parsedJson.experiencias.map(exp => ({
      id: 'exp_' + Math.random().toString(36).substring(2, 9),
      ...exp
    }));
  } else {
    parsedJson.experiencias = [];
  }

  if (parsedJson.educacion && Array.isArray(parsedJson.educacion)) {
    parsedJson.educacion = parsedJson.educacion.map(edu => ({
      id: 'edu_' + Math.random().toString(36).substring(2, 9),
      ...edu
    }));
  } else {
    parsedJson.educacion = [];
  }

  if (parsedJson.proyectos && Array.isArray(parsedJson.proyectos)) {
    parsedJson.proyectos = parsedJson.proyectos.map(proj => ({
      id: 'proj_' + Math.random().toString(36).substring(2, 9),
      ...proj
    }));
  } else {
    parsedJson.proyectos = [];
  }

  if (parsedJson.certificaciones && Array.isArray(parsedJson.certificaciones)) {
    parsedJson.certificaciones = parsedJson.certificaciones.map(cert => ({
      id: 'cert_' + Math.random().toString(36).substring(2, 9),
      ...cert
    }));
  } else {
    parsedJson.certificaciones = [];
  }

  if (!parsedJson.idiomas || !Array.isArray(parsedJson.idiomas)) {
    parsedJson.idiomas = [];
  }

  return parsedJson;
};

/**
 * Toma el currículum estructurado actual y lo optimiza usando la IA de Gemini.
 */
export const optimizarCvCompletoConIA = async (cvObj, puestoDeseado = '', idiomaDestino = 'es') => {
  let idiomaPrompt = '';
  if (idiomaDestino === 'en') {
    idiomaPrompt = `IMPORTANTE: Traduce y redacta TODO el contenido del currículum al inglés (English). El JSON resultante debe estar redactado en inglés.`;
  } else {
    idiomaPrompt = `IMPORTANTE: Redacta todo el contenido del currículum en español latinoamericano.`;
  }

  const systemInstruction = `Eres un experto redactor de currículums y optimización de perfiles para superar filtros ATS (Applicant Tracking Systems) internacionales.
Tu tarea es tomar un objeto JSON que representa un currículum, optimizar cada una de sus secciones aplicando mejores prácticas globales y devolver el JSON actualizado.

Reglas de optimización:
1. Resumen Profesional ("resumen"): Reescríbelo para que sea un párrafo de alto impacto de máximo 90 palabras enfocado en la propuesta de valor del candidato. Si se especifica un 'Puesto Deseado', orienta el resumen a esta área.
2. Experiencias Laborales ("experiencias"):
   - Para cada experiencia, reescribe el campo 'logros' para que sea una lista con viñetas claras (usando guiones '- ').
   - Comienza cada viñeta con un verbo de acción fuerte en primera persona o pasado (ej: Lideré, Diseñé, Implementé, Reduje, Desarrollé, Coordiné).
   - Enfócate en resultados cuantificables. Si el original no tiene métricas, estima cifras lógicas de ejemplo o redacta de forma muy orientada a logros para darle mayor impacto visual.
3. Habilidades ("skills"): Asegura que estén estructuradas como una lista separada por comas, agregando habilidades clave que falten para el puesto actual o deseado (hasta un máximo de 20 habilidades).
4. Idiomas ("idiomas"): Mantén los idiomas del candidato y sus niveles en un array.
5. Proyectos ("proyectos"): Conserva y optimiza las descripciones de los proyectos destacados. Asegúrate de incluir el campo "tecnologias" como una cadena de texto separada por comas.
6. Certificaciones ("certificaciones"): Conserva y mantén las certificaciones del candidato.
7. Mantén intactos los IDs de las experiencias, educación, proyectos y certificaciones (los campos "id"). Esto es CRÍTICO.

${idiomaPrompt}

Devuelve ÚNICAMENTE el JSON optimizado que cumpla exactamente con la estructura de entrada (no incluyas markdown \`\`\` ni explicaciones adicionales fuera del JSON).`;

  const userText = `CURRÍCULUM ACTUAL (EN JSON):
${JSON.stringify(cvObj, null, 2)}

${puestoDeseado ? `PUESTO O ÁREA DESEADA AL QUE POSTULA:\n"${puestoDeseado}"` : ''}
Por favor, optimiza todo este currículum en base a las reglas de sistema y devuelve el JSON estructurado resultante.`;

  const contents = [{ parts: [{ text: userText }] }];

  const rawResponse = await llamarGemini({
    contents,
    systemInstruction,
    responseMimeType: 'application/json',
    temperature: 0.2
  });

  const parsedJson = JSON.parse(rawResponse);
  parsedJson.idioma = idiomaDestino;
  
  // Asegurar compatibilidad de IDs
  if (parsedJson.experiencias && Array.isArray(parsedJson.experiencias)) {
    parsedJson.experiencias = parsedJson.experiencias.map((exp, index) => ({
      id: cvObj.experiencias[index]?.id || 'exp_' + Math.random().toString(36).substring(2, 9),
      ...exp
    }));
  }
  if (parsedJson.educacion && Array.isArray(parsedJson.educacion)) {
    parsedJson.educacion = parsedJson.educacion.map((edu, index) => ({
      id: cvObj.educacion[index]?.id || 'edu_' + Math.random().toString(36).substring(2, 9),
      ...edu
    }));
  }
  if (parsedJson.proyectos && Array.isArray(parsedJson.proyectos)) {
    parsedJson.proyectos = parsedJson.proyectos.map((proj, index) => ({
      id: cvObj.proyectos?.[index]?.id || 'proj_' + Math.random().toString(36).substring(2, 9),
      ...proj
    }));
  }
  if (parsedJson.certificaciones && Array.isArray(parsedJson.certificaciones)) {
    parsedJson.certificaciones = parsedJson.certificaciones.map((cert, index) => ({
      id: cvObj.certificaciones?.[index]?.id || 'cert_' + Math.random().toString(36).substring(2, 9),
      ...cert
    }));
  }

  return parsedJson;
};

/**
 * Optimiza un logro de experiencia, incentivando cifras/números si el original no los tiene,
 * y estructurándolos profesionalmente.
 */
export const optimizarLogroConIA = async (textoOriginal, puesto, empresa) => {
  const prompt = `Eres un experto redactor de currículums y optimización de perfiles para superar filtros ATS internacionales. 
Toma la siguiente descripción de logros o funciones del puesto de "${puesto || 'Profesional'}" en la empresa "${empresa || 'Empresa'}", y reescríbela de forma impecable y profesional en español.

Sigue estrictamente estas reglas:
1. Redáctalo en forma de lista de 2 a 4 viñetas (bullets) claras e impactantes.
2. Comienza cada viñeta con un verbo de acción fuerte (ej: Lideré, Implementé, Automaticé, Reduje, Incrementé).
3. Enfócate en el resultado o impacto de la acción (si es posible y coherente, añade porcentajes o cifras de ejemplo lógicas para dar impacto cuantitativo y ayudar al desempleado a verse más profesional).
4. Devuelve ÚNICAMENTE el texto optimizado con guiones (-) o viñetas. No incluyas explicaciones previas, saludos, comentarios ni bloques markdown de código de ningún tipo (como \`\`\` o similares).

Texto original del candidato:
"""
${textoOriginal}
"""`;

  const contents = [{ parts: [{ text: prompt }] }];

  return await llamarGemini({
    contents,
    temperature: 0.25
  });
};

/**
 * Sugiere habilidades técnicas y blandas relevantes basadas en un cargo.
 */
export const sugerirHabilidadesConIA = async (cargo) => {
  const prompt = `Eres un selector de personal experto. Dado el cargo o profesión de: "${cargo}", genera una lista de exactamente 15 habilidades técnicas y blandas clave que las empresas buscan en este perfil y que son indispensables para pasar los filtros ATS.
  
Devuelve una lista separada por comas. No agregues numeraciones, viñetas, comentarios ni explicaciones adicionales.

Ejemplo de salida para "Desarrollador React":
React, TypeScript, Next.js, Redux, JavaScript, CSS, HTML5, Jest, Git, REST APIs, GraphQL, Trabajo en equipo, Agile, Scrum, Resolución de problemas`;

  const contents = [{ parts: [{ text: prompt }] }];

  return await llamarGemini({
    contents,
    temperature: 0.2
  });
};

/**
 * Compara el currículum actual contra la descripción del empleo deseado,
 * extrayendo palabras clave coincidentes y faltantes.
 */
export const analizarKeywordsVacanteConIA = async (textoCv, vacanteDesc) => {
  const systemInstruction = `Eres un validador ATS experto. Tu trabajo es analizar la coincidencia del currículum frente a una descripción de empleo.
Extrae una lista de palabras clave relevantes (tecnologías, certificaciones, metodologías, herramientas) que la oferta de empleo solicita.
Determina cuáles de esas palabras clave están PRESENTES en el currículum del candidato y cuáles están FALTANTES.

Devuelve estrictamente un objeto JSON puro (sin markdown):
{
  "score": 65,
  "matched": ["React", "Git"],
  "missing": ["Node.js", "Jest", "Agile"],
  "summary": "Breve recomendación amigable de máximo 50 palabras sobre cómo mejorar la coincidencia."
}`;

  const userText = `CURRÍCULUM DEL CANDIDATO:
"""
${textoCv}
"""

DESCRIPCIÓN DE LA OFERTA DE EMPLEO:
"""
${vacanteDesc}
"""`;

  const contents = [{ parts: [{ text: userText }] }];

  const response = await llamarGemini({
    contents,
    systemInstruction,
    responseMimeType: 'application/json',
    temperature: 0.15
  });

  return JSON.parse(response);
};
