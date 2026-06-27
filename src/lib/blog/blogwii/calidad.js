// src/lib/blog/blogwii/calidad.js
// Control de Calidad y Sanitización de Markdown Traducido

/**
 * Corrige alucinaciones o errores comunes del modelo en el Markdown traducido.
 * Restaura los marcadores de alertas de Astro a sus palabras clave originales en inglés.
 * 
 * @param {string} md Contenido Markdown traducido
 * @returns {string} Markdown sanitizado y de alta calidad
 */
export function asegurarCalidadMarkdown(md) {
  if (!md) return '';

  let cleanMd = md;

  // 1. Restaurar palabras clave de alertas traducidas (Astro exige mayúsculas en inglés)
  const alertReplacements = [
    { regex: /\[!NOTA\]/gi, replacement: '[!NOTE]' },
    { regex: /\[!CONSEJO\]/gi, replacement: '[!TIP]' },
    { regex: /\[!ADVERTENCIA\]/gi, replacement: '[!WARNING]' },
    { regex: /\[!PRECAUCION\]/gi, replacement: '[!CAUTION]' },
    { regex: /\[!CUIDADO\]/gi, replacement: '[!CAUTION]' },
    { regex: /\[!IMPORTANTE\]/gi, replacement: '[!IMPORTANT]' },
    // En caso de traducciones inversas (inglés a español, asegurar que se queden en inglés)
    { regex: /\[!INFO\]/gi, replacement: '[!NOTE]' }
  ];

  alertReplacements.forEach(({ regex, replacement }) => {
    cleanMd = cleanMd.replace(regex, replacement);
  });

  // 2. Garantizar que todos los bloques de código abiertos estén cerrados
  const codeBlockCount = (cleanMd.match(/```/g) || []).length;
  if (codeBlockCount % 2 !== 0) {
    // Si hay un número impar de bloques de código, añadir un cierre al final
    cleanMd += '\n```';
  }

  // 3. Limpiar envoltorios markdown residuales si Gemini los devolvió
  cleanMd = cleanMd.trim().replace(/^```markdown\s*/i, '').replace(/```$/, '').trim();

  return cleanMd;
}
