// src/lib/todos/traducir/progreso/bootwii.js
// Asistente Inteligente Bootwii (IA con Gemini) para Traducción y Optimización de CV ATS
// Escrito en espanol sin tildes para evitar problemas de codificacion.

import { llamarGemini } from '../../../api/gemini.js';
import { wiRateLimit, Notificacion } from '../../../widev/widev.js';

export const GLOSARIO_PALABRAS = [
  { es: 'bachiller', en: 'Bachelor\'s Degree' },
  { es: 'workwii', en: 'Workwii' },
  { es: 'scrum', en: 'Scrum' },
  { es: 'aws', en: 'AWS' },
  { es: 'azure', en: 'Azure' },
  { es: 'docker', en: 'Docker' },
  { es: 'git', en: 'Git' },
  { es: 'github', en: 'GitHub' },
  { es: 'linkedin', en: 'LinkedIn' }
];

/**
 * Llama a la API de Gemini para estructurar un currículum bruto o PDF extraído
 * en el formato JSON estándar de Workwii, traduciéndolo y localizándolo.
 */
export const estructurarCvConIA = async (textoCv, puestoDeseado = '', idiomaDestino = 'es', inputType = 'text') => {
  let idiomaPrompt = '';
  if (idiomaDestino === 'en') {
    idiomaPrompt = `IMPORTANTE: Traduce y redacta TODO el contenido del currículum al inglés profesional (English). El JSON resultante debe tener todos los textos (incluyendo títulos de puestos, nombres de empresas si aplica traducirlas, resúmenes profesionales, descripciones de logros, nombres de habilidades, e idiomas) traducidos y localizados profesionalmente al inglés. En el JSON final, establece el campo "idioma" como "en".`;
  } else if (idiomaDestino === 'es') {
    idiomaPrompt = `IMPORTANTE: Traduce y redacta TODO el contenido del currículum al español latinoamericano profesional (Spanish). El JSON resultante debe tener todos los textos (incluyendo títulos de puestos, nombres de empresas si aplica traducirlas, resúmenes profesionales, descripciones de logros, nombres de habilidades, e idiomas) traducidos y localizados profesionalmente al español. En el JSON final, establece el campo "idioma" como "es".`;
  } else {
    idiomaPrompt = `IMPORTANTE: Analiza y detecta el idioma del currículum provisto.
1. Si el currículum está redactado principalmente en español, mantén e interactúa todo en español latinoamericano, y establece el campo obligatorio "idioma" como "es" en el JSON final.
2. Si el currículum está redactado en inglés o en cualquier otro idioma, tradúcelo, redáctalo e interactúalo completamente en inglés (English) profesional, y establece el campo obligatorio "idioma" como "en" en el JSON final.`;
  }

  const reglasGlosario = GLOSARIO_PALABRAS.map(
    item => `- "${item.es}" se debe mantener como "${item.es}" en español, y traducir/mantener como "${item.en}" en inglés.`
  ).join('\n');

  const systemInstruction = `Eres un extractor inteligente de información de currículums.
Tu tarea es tomar el texto bruto o el archivo PDF de un currículum provisto por el usuario, extraer toda su información relevante y estructurarla exactamente en el formato JSON especificado.

REGLAS DE TRADUCCIÓN (GLOSARIO DE TÉRMINOS):
Sigue estrictamente estas correspondencias al traducir o estructurar términos del currículum:
${reglasGlosario}

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
  return parsedJson;
};

export const sugerirHabilidadesConIA = async (cargo) => {
  const prompt = `Eres un selector de personal experto. Dado el cargo o profesion de: "${cargo}", genera una lista de exactamente 15 habilidades tecnicas y blandas clave que las empresas buscan en este perfil y que son indispensables para pasar los filtros ATS.
  
Devuelve una lista separada por comas. No agregues numeraciones, viñetas, comentarios ni explicaciones adicionales.

Ejemplo de salida para "Desarrollador React":
React, TypeScript, Next.js, Redux, JavaScript, CSS, HTML5, Jest, Git, REST APIs, GraphQL, Trabajo en equipo, Agile, Scrum, Resolucion de problemas`;

  const contents = [{ parts: [{ text: prompt }] }];

  return await llamarGemini({
    contents,
    temperature: 0.2
  });
};
