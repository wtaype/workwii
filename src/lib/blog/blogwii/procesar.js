// src/lib/blog/blogwii/procesar.js
// Segmentador inteligente de Markdown para traducciones sin límites

/**
 * Divide un documento Markdown en segmentos lógicos más pequeños para traducir de forma segura.
 * Garantiza que no se corten bloques de código ni tablas.
 * 
 * @param {string} md Contenido Markdown completo
 * @param {number} maxChar Tamaño máximo sugerido en caracteres por segmento
 * @returns {string[]} Array de fragmentos Markdown listos para traducir
 */
export function segmentarMarkdown(md, maxChar = 1800) {
  if (!md) return [];

  const lines = md.split('\n');
  const segments = [];
  let buffer = [];
  let bufferLength = 0;
  
  let inCodeBlock = false;
  let inTable = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Detectar inicio/fin de bloques de código
    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
    }

    // Detectar tablas Markdown (líneas que empiezan con pipe '|')
    if (trimmed.startsWith('|')) {
      inTable = true;
    } else if (inTable && trimmed === '') {
      // Fin de la tabla por línea vacía
      inTable = false;
    }

    buffer.push(line);
    bufferLength += line.length + 1; // +1 por el salto de línea

    // Intentar cortar el segmento si superamos el tamaño máximo y no estamos en un bloque protegido
    if (!inCodeBlock && !inTable && bufferLength >= maxChar) {
      // Cortar preferiblemente en líneas vacías (párrafos) para mantener coherencia
      if (trimmed === '') {
        segments.push(buffer.join('\n'));
        buffer = [];
        bufferLength = 0;
      }
    }
  }

  // Insertar el residuo restante si existe
  if (buffer.length > 0) {
    segments.push(buffer.join('\n'));
  }

  // Filtrar segmentos vacíos
  return segments.map(s => s.trim()).filter(Boolean);
}
