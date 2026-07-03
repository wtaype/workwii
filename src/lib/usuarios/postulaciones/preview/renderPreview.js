/**
 * renderPreview.js - Renderizado de la hoja A4 y paginado dinamico del CV ATS.
 * Version de Solo Lectura optimizada para el modulo de Postulaciones (sin dependencias).
 * Escrito en espanol sin tildes para evitar problemas de codificacion.
 */

export const updateA4Preview = (cv) => {
  const printableArea = document.getElementById('post_cv_printable_area');
  if (!printableArea) return;

  const isEn = cv.idioma === 'en';

  const textPerfil      = isEn ? 'Professional Summary' : 'Perfil Profesional';
  const textExperiencia = isEn ? 'Work Experience'      : 'Experiencia Laboral';
  const textEducacion   = isEn ? 'Education'            : 'Educacion';
  const textSkills      = isEn ? 'Skills & Languages'   : 'Habilidades e Idiomas';
  const textSkillsLabel = isEn ? 'Skills'               : 'Habilidades';
  const textIdiomasLabel= isEn ? 'Languages'            : 'Idiomas';
  const textPresente    = isEn ? 'Present'              : 'Presente';

  // ── Contacto ──
  const personalInfo = [];
  if (cv.email)    personalInfo.push(`<span><i class="fas fa-envelope"></i> ${cv.email}</span>`);
  if (cv.telefono) personalInfo.push(`<span><i class="fas fa-phone"></i> ${cv.telefono}</span>`);
  if (cv.ubicacion)personalInfo.push(`<span><i class="fas fa-location-dot"></i> ${cv.ubicacion}</span>`);

  const linksInfo = [];
  if (cv.linkedin) linksInfo.push(`<span><i class="fab fa-linkedin"></i> ${cv.linkedin}</span>`);
  if (cv.web)      linksInfo.push(`<span><i class="fas fa-globe"></i> ${cv.web}</span>`);

  const personalHTML = personalInfo.join(' &bull; ');
  const linksHTML = linksInfo.join(' &bull; ');

  const contactsHTML = `
    <div>${personalHTML}</div>
    ${linksHTML ? `<div class="cr_cv_contact_links">${linksHTML}</div>` : ''}
  `;

  // Cabecera del CV
  const headerHTML = `
    <div class="cr_cv_header ${cv.incluirFoto && cv.fotoBase64 ? 'has_avatar' : ''}">
      <div class="cr_cv_header_text">
        <h1 class="cr_cv_name" lang="${cv.idioma}">${cv.nombre || 'Nombre Completo'}</h1>
        <div class="cr_cv_title" lang="${cv.idioma}">${cv.titulo || 'Titulo o Profesion'}</div>
        <div class="cr_cv_contact">${contactsHTML}</div>
      </div>
      ${cv.incluirFoto && cv.fotoBase64 ? `
        <div class="ats_a4_avatar">
          <img src="${cv.fotoBase64}" />
        </div>
      ` : ''}
    </div>
  `;

  const blocks = [{ html: headerHTML, type: 'header' }];

  // Perfil / Resumen profesional
  if (cv.resumen) {
    blocks.push({
      type: 'summary',
      html: `
        <div class="cr_cv_section">
          <h2 class="cr_cv_section_title">${textPerfil}</h2>
          <p class="cr_cv_text" lang="${cv.idioma}">${cv.resumen}</p>
        </div>
      `
    });
  }

  // Experiencia Laboral
  const validExps = cv.experiencias?.filter(e => e.puesto?.trim() || e.empresa?.trim()) || [];
  if (validExps.length > 0) {
    blocks.push({
      type: 'section_title',
      html: `<h2 class="cr_cv_section_title cr_cv_section_title--spaced">${textExperiencia}</h2>`
    });

    validExps.forEach(exp => {
      const logrosStr = Array.isArray(exp.logros)
        ? exp.logros.join('\n')
        : (typeof exp.logros === 'string' ? exp.logros : '');

      const achievements = logrosStr
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0)
        .map((line) => {
          const clean = line.replace(/^[-\*\•\s]+/, '').trim();
          return `<li>${clean}</li>`;
        })
        .join('');

      blocks.push({
        type: 'item',
        html: `
          <div class="cr_cv_item">
            <div class="cr_cv_item_row">
              <strong>${exp.puesto || 'Puesto / Cargo'}</strong>
              <span>${exp.inicio || ''} – ${exp.fin === 'Presente' || !exp.fin ? textPresente : exp.fin}</span>
            </div>
            <div class="cr_cv_item_subrow">
              <span>${exp.empresa || 'Empresa'}</span>
              <span>${exp.ubicacion || ''}</span>
            </div>
            ${achievements ? `<div class="cr_cv_item_desc"><ul>${achievements}</ul></div>` : ''}
          </div>
        `
      });
    });
  }

  // Educacion
  const validEdus = cv.educacion?.filter(e => e.grado?.trim() || e.institucion?.trim()) || [];
  if (validEdus.length > 0) {
    blocks.push({
      type: 'section_title',
      html: `<h2 class="cr_cv_section_title cr_cv_section_title--spaced">${textEducacion}</h2>`
    });

    validEdus.forEach(edu => {
      blocks.push({
        type: 'item',
        html: `
          <div class="cr_cv_item">
            <div class="cr_cv_item_row">
              <strong>${edu.grado || 'Grado / Certificacion'}</strong>
              <span>${edu.inicio || ''} – ${edu.fin || ''}</span>
            </div>
            <div class="cr_cv_item_subrow">
              <span>${edu.institucion || 'Institucion'}</span>
              <span>${edu.ubicacion || ''}</span>
            </div>
          </div>
        `
      });
    });
  }

  // Certificaciones
  const validCerts = cv.certificaciones?.filter(c => c.nombre?.trim() || c.emisor?.trim()) || [];
  if (validCerts.length > 0) {
    const textCertificados = isEn ? 'Certifications' : 'Certificaciones';
    blocks.push({
      type: 'section_title',
      html: `<h2 class="cr_cv_section_title cr_cv_section_title--spaced">${textCertificados}</h2>`
    });

    validCerts.forEach(cert => {
      blocks.push({
        type: 'item',
        html: `
          <div class="cr_cv_item">
            <div class="cr_cv_item_row">
              <strong>${cert.nombre || 'Certificacion'}</strong>
              <span>${cert.fecha || ''}</span>
            </div>
            <div class="cr_cv_item_subrow">
              <span>${cert.emisor || 'Emisor / Organizacion'}</span>
            </div>
          </div>
        `
      });
    });
  }

  // Proyectos Destacados
  const validProjs = cv.proyectos?.filter(p => p.nombre?.trim()) || [];
  if (validProjs.length > 0) {
    const textProyectos = isEn ? 'Featured Projects' : 'Proyectos Destacados';
    blocks.push({
      type: 'section_title',
      html: `<h2 class="cr_cv_section_title cr_cv_section_title--spaced">${textProyectos}</h2>`
    });

    validProjs.forEach(proj => {
      blocks.push({
        type: 'item',
        html: `
          <div class="cr_cv_item">
            <div class="cr_cv_item_row">
              <strong>${proj.nombre || 'Nombre del Proyecto'}</strong>
              ${proj.enlace ? `<span>${proj.enlace}</span>` : ''}
            </div>
            <div class="cr_cv_item_desc">
              <p>${proj.descripcion || ''}</p>
              ${proj.tecnologias ? `<p class="cr_cv_proj_tech"><strong>${isEn ? 'Technologies' : 'Tecnologias'}:</strong> <span>${proj.tecnologias}</span></p>` : ''}
            </div>
          </div>
        `
      });
    });
  }

  // Habilidades e Idiomas
  if (cv.skills || (cv.idiomas && cv.idiomas.length > 0)) {
    let skillsHTML = '';
    if (cv.skills) {
      const lines = cv.skills.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length > 1 && lines.some(l => l.startsWith('-') || l.startsWith('*') || l.includes(':'))) {
        const parsedCategories = lines.map(line => {
          const cleanLine = line.replace(/^[-\*\•\s]+/, '').trim();
          const colonIdx = cleanLine.indexOf(':');
          if (colonIdx !== -1) {
            const category = cleanLine.substring(0, colonIdx).trim();
            const skillsVal = cleanLine.substring(colonIdx + 1).trim();
            return `<strong>${category}</strong>: ${skillsVal}`;
          }
          return cleanLine;
        });
        skillsHTML = `<p class="cr_cv_text"><span>${parsedCategories.join(' &bull; ')}</span></p>`;
      } else {
        skillsHTML = `<p class="cr_cv_text"><strong>${textSkillsLabel}:</strong> <span>${cv.skills}</span></p>`;
      }
    }

    blocks.push({
      type: 'skills',
      html: `
        <div class="cr_cv_section">
          <h2 class="cr_cv_section_title">${textSkills}</h2>
          <div class="cr_cv_skills_list">
            ${skillsHTML}
            ${cv.idiomas && cv.idiomas.length > 0 ? `<p class="cr_cv_text"><strong>${textIdiomasLabel}:</strong> ${cv.idiomas.map(i => typeof i === 'string' ? i : `${i.idioma || ''} (${i.nivel || ''})`).join(', ')}</p>` : ''}
          </div>
        </div>
      `
    });
  }

  // ── Medidor temporal de alturas en pixeles ──
  let tempDiv = document.getElementById('crTempMeasurer');
  if (!tempDiv) {
    tempDiv = document.createElement('div');
    tempDiv.id = 'crTempMeasurer';
    tempDiv.className = 'cr_temp_measurer';
    document.body.appendChild(tempDiv);
  }
  tempDiv.innerHTML = `<div class="cr_cv_document cr_cv_document--measure"></div>`;
  const tempDoc = tempDiv.firstChild;

  const measureBlock = (html) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'cr_measure_wrapper';
    wrapper.innerHTML = html;
    tempDoc.appendChild(wrapper);
    const h = wrapper.offsetHeight;
    tempDoc.removeChild(wrapper);
    return h;
  };

  // ── Paginado dinamico A4 ──
  const pages = [[]];
  let currentPageHeight = 0;
  const MAX_CONTENT_HEIGHT = 1040; // Altura imprimible de una pagina A4 menos padding

  blocks.forEach((block) => {
    const blockHeight = measureBlock(block.html);
    const newHeight = currentPageHeight > 0 ? currentPageHeight + 15 + blockHeight : blockHeight;

    if (newHeight <= MAX_CONTENT_HEIGHT || currentPageHeight === 0) {
      pages[pages.length - 1].push(block);
      currentPageHeight = newHeight;
    } else {
      // Evitar titulos huerfanos al final de la pagina
      const currentPageBlocks = pages[pages.length - 1];
      if (currentPageBlocks.length > 0 && currentPageBlocks[currentPageBlocks.length - 1].type === 'section_title') {
        const orphanedTitle = currentPageBlocks.pop();
        currentPageHeight = 0;
        currentPageBlocks.forEach((b, idx) => {
          const h = measureBlock(b.html);
          currentPageHeight = idx > 0 ? currentPageHeight + 15 + h : h;
        });
        pages.push([orphanedTitle, block]);
        currentPageHeight = measureBlock(orphanedTitle.html) + 15 + blockHeight;
      } else {
        pages.push([block]);
        currentPageHeight = blockHeight;
      }
    }
  });

  // ── Renderizado final en paginas A4 ──
  let pagesHTML = '';
  pages.forEach((pageBlocks, index) => {
    const isFirst = index === 0;
    const pageClass = isFirst ? 'cr_cv_document cr_cv_page' : 'cr_cv_document cr_cv_page cr_cv_page_next';
    pagesHTML += `
      <div class="${pageClass}">
        ${pageBlocks.map(b => b.html).join('\n')}
        <div class="cr_page_number">
          ${isEn ? 'Page' : 'Pagina'} ${index + 1} / ${pages.length}
        </div>
      </div>
    `;
  });

  printableArea.innerHTML = pagesHTML;
};
