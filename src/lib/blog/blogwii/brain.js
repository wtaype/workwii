import { llamarGemini, llamarGeminiStream } from '../../api/gemini.js';
import { segmentarMarkdown } from './procesar.js';
import { asegurarCalidadMarkdown } from './calidad.js';
import glosario from './glosario.json';
import skill from './skill.json';

const untranslatableStr = glosario.untranslatable.map(w => `"${w}"`).join(', ');
const techTransStr = Object.entries(glosario.technical_translations)
  .map(([k, v]) => `"${k}" -> "${v}"`)
  .join(', ');

const systemInstruction = `Eres un ${skill.role}.
Tu objetivo es traducir el contenido de forma precisa manteniendo el mismo estilo: ${skill.tone}.

Sigue estrictamente estas reglas técnicas durante la traducción:
1. NUNCA traduzcas ni alteres la sintaxis de las alertas de Markdown: mantén siempre intactos los marcadores como "[!NOTE]", "[!TIP]", "[!WARNING]" o "[!CAUTION]" (sintaxis de alerta preservada: ${skill.markdown_rules.preserve_alert_syntax}).
2. Deja intactos los bloques de código (dentro de \`\`\` ) y las etiquetas HTML.
3. NUNCA traduzcas ni modifiques estos nombres propios o marcas de la empresa: ${untranslatableStr}.
4. Respeta las siguientes traducciones técnicas preferenciales: ${techTransStr}.
5. Mantén la misma jerarquía de encabezados (##, ###) (preservar encabezados: ${skill.markdown_rules.preserve_headers}) y formato de negritas/cursivas.
6. Traduce los enlaces conservando sus URLs de destino exactamente iguales.
7. Devuelve únicamente la traducción limpia del texto provisto sin saludos, introducciones ni explicaciones adicionales.`;

function getMetadataPrompt(titulo, resumen, categoria, keywords, tags, deLang, aLang) {
  const deLabel = deLang === 'es' ? 'Español' : 'Inglés';
  const aLabel = aLang === 'es' ? 'Español' : 'Inglés';
  
  return `Traduce la siguiente metadata de un post de blog del ${deLabel} al ${aLabel}.
Devuelve EXCLUSIVAMENTE un objeto JSON válido con las llaves "titulo", "descripcion", "categoria", "keywords" y "tags".

Título original: "${titulo}"
Resumen original: "${resumen}"
Categoría original: "${categoria}"
Keywords originales: "${keywords}"
Tags originales (array): ${JSON.stringify(tags)}

Formato del output JSON esperado y limitaciones:
{
  "titulo": "Título traducido y atractivo para SEO, de ${skill.metadata_rules.title_length}",
  "descripcion": "Resumen traducido de ${skill.metadata_rules.description_length}",
  "categoria": "Categoría traducida (1 o 2 palabras, ej: 'Careers')",
  "keywords": "Keywords traducidas separadas por comas",
  "tags": ["array", "de", "tags", "traducidos", "en", "minusculas", "y", "conectados_con_guion_bajo"]
}`;
}

function getContentPrompt(segmento, deLang, aLang) {
  const deLabel = deLang === 'es' ? 'Español' : 'Inglés';
  const aLabel = aLang === 'es' ? 'Español' : 'Inglés';
  
  return `Traduce el siguiente fragmento de contenido Markdown de blog del ${deLabel} al ${aLabel}.
Conserva perfectamente la estructura de Markdown, enlaces, pipes de tablas (traducir encabezados de tablas: ${skill.markdown_rules.translate_table_headers}), listas y las alertas.
No agregues comentarios del traductor ni envoltorios de ningún tipo, solo devuelve la traducción del texto.

Contenido original a traducir:
${segmento}`;
}

/**
 * Traduce un artículo de blog completo (Título, Resumen y Contenido Markdown) de forma segmentada.
 * Evita el truncamiento de tokens y garantiza la estabilidad del formato Markdown.
 * 
 * @param {object} params
 * @param {string} params.titulo Título del post
 * @param {string} params.resumen Resumen/Descripción corta del post
 * @param {string} params.contenido Contenido Markdown del post
 * @param {string} params.categoria Categoría del post
 * @param {string} params.keywords Keywords separadas por comas del post
 * @param {string[]} params.tags Array de tags del post
 * @param {string} params.lang Idioma actual del artículo ('es' o 'en')
 * @param {function} [params.onProgress] Callback ejecutado progresivamente con el contenido Markdown actualizado.
 * @returns {Promise<{titulo: string, descripcion: string, categoria: string, keywords: string, tags: string[], contenido: string}>} Artículo traducido
 */
export async function traducirArticuloCompleto({ titulo, resumen, contenido, categoria, keywords, tags, lang, onProgress }) {
  const deLang = lang || 'es';
  const aLang = deLang === 'es' ? 'en' : 'es';

  // 1. Traducir metadata (Título, Resumen, Categoría, Keywords y Tags) en segundo plano (paralelo)
  const metadataPrompt = getMetadataPrompt(titulo, resumen, categoria, keywords, tags, deLang, aLang);
  const metadataPromise = llamarGemini({
    contents: [{ role: 'user', parts: [{ text: metadataPrompt }] }],
    systemInstruction: systemInstruction,
    responseMimeType: 'application/json'
  }).then(rawJson => {
    try {
      return JSON.parse(rawJson);
    } catch (e) {
      console.warn('[blogwii metadata parse error]', e, rawJson);
      // Fallback básico si falla el parseo
      return { titulo, descripcion: resumen, categoria, keywords, tags };
    }
  });

  // 2. Segmentar el Markdown del contenido largo
  const segmentos = segmentarMarkdown(contenido, 2500);
  const translatedSegments = [];
  
  // 3. Traducir segmentos en secuencia con streaming ordenado
  for (let i = 0; i < segmentos.length; i++) {
    const seg = segmentos[i];
    const segmentPrompt = getContentPrompt(seg, deLang, aLang);
    let currentSegText = '';

    const segmentResult = await llamarGeminiStream({
      contents: [{ role: 'user', parts: [{ text: segmentPrompt }] }],
      systemInstruction: systemInstruction,
      responseMimeType: 'text/plain',
      onChunk: (chunk) => {
        currentSegText += chunk;
        const progressiveSegments = [
          ...translatedSegments,
          currentSegText
        ];
        if (onProgress) {
          onProgress(asegurarCalidadMarkdown(progressiveSegments.join('\n\n')));
        }
      }
    }).catch(err => {
      console.error(`[blogwii segment ${i} streaming error]`, err);
      // Fallback al segmento original en caso de error crítico
      return seg;
    });

    translatedSegments.push(segmentResult);
  }

  // 4. Esperar que se complete la metadata (ya iniciada en paralelo en el paso 1)
  const metadataResult = await metadataPromise;

  // 5. Unificar el cuerpo Markdown traducido y asegurar su calidad
  const unifiedMarkdown = translatedSegments.join('\n\n');
  const cleanedMarkdown = asegurarCalidadMarkdown(unifiedMarkdown);

  return {
    titulo: metadataResult.titulo || titulo,
    descripcion: metadataResult.descripcion || resumen,
    categoria: metadataResult.categoria || categoria,
    keywords: metadataResult.keywords || keywords,
    tags: Array.isArray(metadataResult.tags) ? metadataResult.tags : tags,
    contenido: cleanedMarkdown
  };
}
