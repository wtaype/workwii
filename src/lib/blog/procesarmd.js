export const CUSTOM_ICONS = {
  'corazon': '<i class="fas fa-heart po_ico_red"></i>',
  'heart': '<i class="fas fa-heart po_ico_red"></i>',
  'estrella': '<i class="fas fa-star po_ico_yellow"></i>',
  'star': '<i class="fas fa-star po_ico_yellow"></i>',
  'si': '<i class="fas fa-circle-check po_ico_green"></i>',
  'check': '<i class="fas fa-circle-check po_ico_green"></i>',
  'no': '<i class="fas fa-circle-xmark po_ico_red"></i>',
  'times': '<i class="fas fa-circle-xmark po_ico_red"></i>',
  'maletin': '<i class="fas fa-briefcase po_ico_mco"></i>',
  'briefcase': '<i class="fas fa-briefcase po_ico_mco"></i>',
  'foco': '<i class="fas fa-lightbulb po_ico_yellow"></i>',
  'idea': '<i class="fas fa-lightbulb po_ico_yellow"></i>',
  'lightbulb': '<i class="fas fa-lightbulb po_ico_yellow"></i>',
  'grafico': '<i class="fas fa-chart-line po_ico_cyan"></i>',
  'chart': '<i class="fas fa-chart-line po_ico_cyan"></i>',
  'usuario': '<i class="fas fa-user-tie po_ico_gold"></i>',
  'user': '<i class="fas fa-user-tie po_ico_gold"></i>',
  'cruz': '<i class="fas fa-cross po_ico_mco"></i>',
  'cross': '<i class="fas fa-cross po_ico_mco"></i>',
  'biblia': '<i class="fas fa-book-bible po_ico_mco"></i>',
  'bible': '<i class="fas fa-book-bible po_ico_mco"></i>',
  'oracion': '<i class="fas fa-hands-praying po_ico_gold"></i>',
  'pray': '<i class="fas fa-hands-praying po_ico_gold"></i>',
  'paloma': '<i class="fas fa-dove po_ico_cyan"></i>',
  'dove': '<i class="fas fa-dove po_ico_cyan"></i>',
  'alerta': '<i class="fas fa-triangle-exclamation po_ico_warning"></i>',
  'warning': '<i class="fas fa-triangle-exclamation po_ico_warning"></i>',
  'info': '<i class="fas fa-circle-info po_ico_cyan"></i>',
  'herramienta': '<i class="fas fa-screwdriver-wrench po_ico_mco"></i>',
  'tool': '<i class="fas fa-screwdriver-wrench po_ico_mco"></i>',
  'enlace': '<i class="fas fa-link po_ico_cyan"></i>',
  'link': '<i class="fas fa-link po_ico_cyan"></i>'
};

export const wiSanihtml = (html) => {
  if (!html) return '';
  let str = html.toString();
  str = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  str = str.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  str = str.replace(/(\bon[a-z]+\s*=\s*"[^"]*")/gi, '');
  str = str.replace(/(\bon[a-z]+\s*=\s*'[^']*')/gi, '');
  str = str.replace(/(\bon[a-z]+\s*=\s*[^\s>]+)/gi, '');
  str = str.replace(/<\/?(iframe|embed|object|applet)\b[^>]*>/gi, '');
  str = str.replace(/href\s*=\s*(['"]?)\s*javascript:[^>]*\1/gi, 'href="#"');
  return str;
};

export const countWords = (html) => {
  if (!html) return { words: 0, min: 1 };
  const t = html.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean);
  return { words: t.length, min: Math.max(1, Math.ceil(t.length / 200)) };
};

// Memoizador para mdToHtml
const mdCache = new Map();

export const mdToHtml = (md) => {
  if (!md) return '';
  if (mdCache.has(md)) {
    return mdCache.get(md);
  }

  let html = md
    .replace(/^## (.*?)(?:\s*\{\#([a-zA-Z0-9_-]+)\})?\s*$/gim, (match, title, id) => {
      return id ? `<h2 id="${id}">${title.trim()}</h2>` : `<h2>${title.trim()}</h2>`;
    })
    .replace(/^### (.*?)(?:\s*\{\#([a-zA-Z0-9_-]+)\})?\s*$/gim, (match, title, id) => {
      return id ? `<h3 id="${id}">${title.trim()}</h3>` : `<h3>${title.trim()}</h3>`;
    })
    .replace(/^#### (.*?)(?:\s*\{\#([a-zA-Z0-9_-]+)\})?\s*$/gim, (match, title, id) => {
      return id ? `<h4 id="${id}">${title.trim()}</h4>` : `<h4>${title.trim()}</h4>`;
    })
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/~~(.*?)~~/gim, '<del>$1</del>')
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    .replace(/!\[(.*?)\]\((.*?)\)/gim, '<figure class="po_figure"><img alt="$1" src="$2" /><figcaption class="po_figcaption">$1</figcaption></figure>')
    .replace(/\[(.*?)\]\((.*?)\)/gim, (match, text, url) => {
      if ((url.includes('youtube.com') || url.includes('youtu.be')) && (url.includes('#normal') || url.includes('?normal=1'))) {
        const cleanUrl = url.replace(/(?:#|\?)normal$/, '');
        return `<a href="${cleanUrl}" class="yt_link_normal" target="_blank" rel="noopener noreferrer">${text}</a>`;
      }
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    })
    .replace(/^---/gim, '<hr class="po_hr"/>');

  // Reemplazar iconos personalizados con estilos
  Object.keys(CUSTOM_ICONS).forEach(key => {
    const regex = new RegExp(`:${key}:`, 'gim');
    html = html.replace(regex, CUSTOM_ICONS[key]);
  });

  // Soporte para iconos Font Awesome genéricos
  html = html
    .replace(/:fa-([a-z0-9-]+):/gim, '<i class="fas fa-$1"></i>')
    .replace(/:far-([a-z0-9-]+):/gim, '<i class="far fa-$1"></i>')
    .replace(/:fab-([a-z0-9-]+):/gim, '<i class="fab fa-$1"></i>');

  const lines = html.split('\n');
  const result = [];
  let inList = false;
  let inTable = false;
  let inQuote = false;
  let quoteLines = [];

  const flushQuote = () => {
    if (quoteLines.length === 0) return;
    const firstLine = quoteLines[0].trim();
    const alertMatch = firstLine.match(/^\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]$/i);
    
    if (alertMatch) {
      const type = alertMatch[1].toUpperCase();
      let icon = 'fas fa-info-circle';
      let title = 'Nota';
      if (type === 'TIP') { icon = 'fas fa-lightbulb'; title = 'Consejo'; }
      else if (type === 'WARNING') { icon = 'fas fa-triangle-exclamation'; title = 'Advertencia'; }
      else if (type === 'IMPORTANT') { icon = 'fas fa-circle-exclamation'; title = 'Importante'; }
      else if (type === 'CAUTION') { icon = 'fas fa-ban'; title = 'Precaución'; }
      
      const content = quoteLines.slice(1).join('<br/>');
      result.push(`<div class="po_alert po_alert_${type.toLowerCase()}"><div class="po_alert_title"><i class="${icon}"></i> ${title}</div><p>${content}</p></div>`);
    } else {
      result.push(`<blockquote>${quoteLines.join('<br/>')}</blockquote>`);
    }
    quoteLines = [];
  };

  lines.forEach(line => {
    const trimLine = line.trim();

    // Blockquote parsing
    const quoteMatch = line.match(/^>\s*(.*)$/);
    if (quoteMatch) {
      if (inList) { result.push('</ul>'); inList = false; }
      if (inTable) { result.push('</table></div>'); inTable = false; }
      inQuote = true;
      quoteLines.push(quoteMatch[1]);
      return;
    } else if (inQuote) {
      flushQuote();
      inQuote = false;
    }

    // Table parsing logic
    if (trimLine.startsWith('|') && trimLine.endsWith('|')) {
      if (!inTable) {
        result.push('<div class="po_table_wrap"><table>');
        inTable = true;
      }
      if (trimLine.match(/^\|?[\s\-\|:]+\|?$/)) return;
      
      const cells = trimLine.split('|').filter((c, i, a) => (i > 0 && i < a.length - 1));
      const isHeader = inTable && result[result.length - 1].includes('<table>');
      const tag = isHeader ? 'th' : 'td';
      result.push('<tr>' + cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('') + '</tr>');
      return;
    } else if (inTable) {
      result.push('</table></div>');
      inTable = false;
    }

    // List parsing logic
    const listMatch = line.match(/^[\-\*]\s+(.*)$/);
    if (listMatch) {
      if (!inList) { result.push('<ul>'); inList = true; }
      let text = listMatch[1];
      if (text.startsWith('[ ] ')) text = '<input type="checkbox" class="po_todo_check" disabled> ' + text.slice(4);
      else if (text.startsWith('[x] ')) text = '<input type="checkbox" class="po_todo_check" checked disabled> ' + text.slice(4);
      result.push(`<li>${text}</li>`);
    } else {
      if (inList) { result.push('</ul>'); inList = false; }
      if (trimLine === '') return;
      if (!line.match(/^<(h[1-6]|ul|ol|li|blockquote|img|hr|div|table|tr|th|td|figure|figcaption)/)) {
        result.push(`<p>${line}</p>`);
      } else {
        result.push(line);
      }
    }
  });

  if (inTable) result.push('</table></div>');
  if (inList) result.push('</ul>');
  if (inQuote) flushQuote();
  
  const finalHtml = result.join('\n');

  // Limitar caché a 5 entradas
  if (mdCache.size >= 5) {
    const firstKey = mdCache.keys().next().value;
    mdCache.delete(firstKey);
  }
  mdCache.set(md, finalHtml);

  return finalHtml;
};

// Función para procesar y optimizar el HTML en servidor y cliente
export const procesarHtml = (html) => {
  if (!html) return '';

  let mod = html;

  // 1. Convertir botones antiguos de YouTube en enlaces limpios
  mod = mod.replace(/<button[^>]*?class="po_yt_btn"[^>]*?data-yt="([a-zA-Z0-9_-]+)"[^>]*>([\s\S]*?)<\/button>/gi, (match, ytId, innerHtml) => {
    const cleanInner = innerHtml.replace(/<i\s+class=(['"])(.*?)\1\s+style=(['"])[^>]*?\3/gi, '<i class="$2 po_ico_youtube"');
    return `<a href="https://www.youtube.com/watch?v=${ytId}" target="_blank" rel="noopener noreferrer" class="po_yt_link">${cleanInner}</a>`;
  });

  // 1b. Normalizar enlaces de YouTube que tengan la marca #normal o ?normal=1
  mod = mod.replace(/<a\s+([^>]*?)href=(['"])(https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\/[^'"]*?)(?:#|\?)normal\2([^>]*?)>/gi, (match, before, quote, cleanUrl, after) => {
    const rest = (before + ' ' + after).trim();
    if (rest.includes('class=')) {
      return `<a href="${cleanUrl}" ${rest.replace(/class=(['"])(.*?)\1/gi, 'class=$1$2 yt_link_normal$1')}>`;
    } else {
      return `<a href="${cleanUrl}" class="yt_link_normal" ${rest}>`;
    }
  });

  // 2. Limpiar estilos inline de hr y checklists
  mod = mod
    .replace(/<hr style="border:none;border-top:1px solid var\(--brd\);margin:2vh 0"\/?>/gi, '<hr class="po_hr" />')
    .replace(/(<input[^>]*?type="checkbox"[^>]*?)style="margin-right:\s*0\.5vh;?"/gi, '$1class="po_todo_check"');

  // 3. Limpiar estilos inline de iconos personalizados combinando clases
  mod = mod.replace(/<i\s+class=(['"])(.*?)\1\s+style=(['"])color:\s*(.*?);?\3><\/i>/gi, (match, q1, classes, q2, color) => {
    let colorClass = '';
    const c = color.trim().toLowerCase();
    if (c === '#fe0149' || c === '#ff3849') colorClass = 'po_ico_red';
    else if (c === '#ffb636' || c === '#ffc107') colorClass = 'po_ico_yellow';
    else if (c === '#3cd741') colorClass = 'po_ico_green';
    else if (c === '#0edeff') colorClass = 'po_ico_cyan';
    else if (c === '#e0a910') colorClass = 'po_ico_gold';
    else if (c === 'var(--warning)') colorClass = 'po_ico_warning';
    else if (c === 'var(--mco)') colorClass = 'po_ico_mco';
    return `<i class="${classes} ${colorClass}"></i>`;
  });

  // 4. Inyección automática de skeletons y lazy loading en imágenes de contenido
  mod = mod.replace(/<img\s+([^>]*?)src=(['"])(.*?)\2([^>]*?)>/gi, (match, before, quote, src, after) => {
    const rest = (before + ' ' + after).trim();
    if (rest.includes('data-src=')) return match;
    if (rest.includes('class=')) {
      return `<img data-src="${src}" ${rest.replace(/class=(['"])(.*?)\1/gi, 'class=$1$2 wi_skeleton img_fade$1')}>`;
    } else {
      return `<img data-src="${src}" class="wi_skeleton img_fade" ${rest}>`;
    }
  });

  // 5. Figcaption pro — convertir <img alt="texto"> en <figure><figcaption>
  mod = mod.replace(
    /(<figure[\s\S]*?<\/figure>)|<img([^>]*?)alt="([^"]+)"([^>]*?)>/gi,
    (match, figureBlock, before, alt, after) => {
      if (figureBlock) return figureBlock; // ya es <figure>
      if (!alt?.trim()) return match;      // sin alt, sin caption
      return `<figure class="po_figure">${match}<figcaption class="po_figcaption">${alt.trim()}</figcaption></figure>`;
    }
  );

  return mod;
};
