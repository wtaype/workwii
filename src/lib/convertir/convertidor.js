import { llamarGemini } from '../api/gemini.js';

/**
 * Envía el texto bruto del CV a Gemini para estructurarlo y optimizarlo según el formato ATS de Workwii.
 * 
 * @param {string} textoCv - El contenido completo del CV en texto bruto.
 * @param {string} puestoDeseado - El puesto o área al que aspira el candidato (para orientar el CV).
 * @returns {Promise<object>} Objeto JSON estructurado listo para inyectarse en los formularios.
 */
export const estructurarCvConIA = async (textoCv, puestoDeseado = '', idiomaDestino = 'es') => {
  let idiomaPrompt = '';
  if (idiomaDestino === 'en') {
    idiomaPrompt = `IMPORTANTE: Traduce y redacta TODO el contenido del currículum al inglés (English). El JSON resultante debe tener todos los textos (incluyendo títulos de puestos, nombres de empresas si aplica traducirlas, resúmenes, descripciones de logros, nombres de habilidades e idiomas) redactados profesionalmente en inglés.`;
  } else {
    idiomaPrompt = `IMPORTANTE: Redacta todo el contenido del currículum en español latinoamericano.`;
  }

  const systemInstruction = `Eres un experto redactor de currículums y optimización de perfiles para superar filtros ATS (Applicant Tracking Systems) internacionales.
Tu tarea es tomar el texto bruto de un currículum provisto por el usuario, extraer toda su información relevante y estructurarla en el formato JSON especificado.

Debes aplicar estas reglas de optimización durante la conversión:
1. Resumen Profesional: Redacta un párrafo impactante de máximo 90 palabras enfocado en la propuesta de valor del candidato. Si se provee un 'Puesto Deseado', orienta el perfil hacia esa especialidad.
2. Experiencias Laborales:
   - Para cada experiencia, reescribe el campo 'logros' en forma de lista con viñetas (usando guiones '- ').
   - Comienza cada viñeta con un verbo de acción fuerte en primera persona o pasado (ej: Lideré, Implementé, Automaticé, Reduje, Desarrollé).
   - Enfócate en resultados cuantificables. Si el texto original no contiene métricas, estima cifras lógicas o mantén la redacción orientada a logros de impacto.
3. Habilidades (Skills): Extrae una lista de palabras clave técnicas y blandas relevantes, y devuélvelas como un string separado por comas (ej: "React, Node.js, Git, Liderazgo, Agile"). Máximo 20 habilidades.
4. Idiomas: Identifica idiomas y sus niveles. Devuélvelos como un array de strings (ej: ["Español (Nativo)", "Inglés (C1 - Avanzado)"]).

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
  "resumen": "Perfil profesional de impacto...",
  "experiencias": [
    {
      "puesto": "Cargo ocupado",
      "empresa": "Nombre de la empresa",
      "ubicacion": "Ubicación del trabajo (ej: Remoto o Lima, Perú)",
      "inicio": "Fecha de inicio (ej: Ene 2022)",
      "fin": "Fecha de fin o 'Presente'",
      "logros": "- Logro optimizado 1\\n- Logro optimizado 2..."
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
  "skills": "Habilidad1, Habilidad2, Habilidad3...",
  "idiomas": ["Idioma 1 (Nivel)", "Idioma 2 (Nivel)"]
}`;

  const userText = `CURRÍCULUM BRUTO DEL CANDIDATO:
"""
${textoCv}
"""

${puestoDeseado ? `PUESTO O ÁREA DESEADA AL QUE POSTULA:\n"${puestoDeseado}"` : ''}
${idiomaDestino === 'en' ? 'IDIOMA DE DESTINO: Inglés (English)\n' : 'IDIOMA DE DESTINO: Español\n'}
Por favor, estructura, traduce (si el idioma de destino es inglés) y optimiza este currículum en el formato JSON requerido.`;

  const contents = [
    {
      parts: [
        {
          text: userText
        }
      ]
    }
  ];

  try {
    const rawResponse = await llamarGemini({
      contents,
      systemInstruction,
      responseMimeType: 'application/json',
      temperature: 0.15
    });

    const parsedJson = JSON.parse(rawResponse);
    parsedJson.idioma = idiomaDestino;
    
    // Asegurar compatibilidad agregando IDs únicos a experiencias y educación para el renderizado del editor
    if (parsedJson.experiencias && Array.isArray(parsedJson.experiencias)) {
      parsedJson.experiencias = parsedJson.experiencias.map(exp => ({
        id: 'exp_' + Math.random().toString(36).substr(2, 9),
        ...exp
      }));
    } else {
      parsedJson.experiencias = [];
    }

    if (parsedJson.educacion && Array.isArray(parsedJson.educacion)) {
      parsedJson.educacion = parsedJson.educacion.map(edu => ({
        id: 'edu_' + Math.random().toString(36).substr(2, 9),
        ...edu
      }));
    } else {
      parsedJson.educacion = [];
    }

    if (!parsedJson.idiomas || !Array.isArray(parsedJson.idiomas)) {
      parsedJson.idiomas = [];
    }

    return parsedJson;
  } catch (error) {
    console.error('Error al parsear el JSON de Gemini:', error);
    throw new Error('La IA no pudo estructurar el currículum. Revisa que el texto del documento sea legible e inténtalo de nuevo.');
  }
};
