// src/lib/widev/wimd.js
// wiMd v1.0: Procesador superligero de Markdown a HTML con sanitización básica (negritas, cursivas, enlaces y fragmentos de código)

export const wiMd = (txt = '') => {
  if (typeof txt !== 'string') return '';

  // Escapar HTML básico para prevenir inyección XSS
  let html = txt
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Reemplazar sintaxis Markdown a HTML
  html = html
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Negrita **texto**
    .replace(/\*(.*?)\*/g, '<em>$1</em>')             // Cursiva *texto*
    .replace(/`(.*?)`/g, '<code>$1</code>')           // Código `texto`
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>') // Enlace [texto](url)
    .replace(/\n/g, '<br />');                        // Saltos de línea

  return html;
};