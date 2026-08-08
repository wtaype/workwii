// src/lib/usuarios/listo/preview/renderPreview.js
// Renderizado de la hoja A4 y paginado dinámico del CV ATS para Listo
// Incorpora los atributos data-edit-field para WYSIWYG.

import { initEditablePreview } from './editarPreview.js';

export const updateA4Preview = (cv, getCvData, updateCvData, onSync) => {
  const printableArea = document.getElementById('list_cv_printable_area');
  if (!printableArea) return;

  const isEn = cv.idioma === 'en';

  const textPerfil      = isEn ? 'Professional Summary' : 'Perfil Profesional';
  const textExperiencia = isEn ? 'Work Experience'      : 'Experiencia Laboral';
  const textEducacion   = isEn ? 'Education'            : 'Educación';
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

  // Cabecera principal
  const headerHTML = `
    <div class="cr_cv_header">
      <div class="cr_cv_header_text">
        <h1 class="cr_cv_name cr_prev_editable" data-edit-field="nombre" spellcheck="true" lang="${cv.idioma}">${cv.nombre || 'Nombre Completo'}</h1>
        <div class="cr_cv_title cr_prev_editable" data-edit-field="titulo" spellcheck="true" lang="${cv.idioma}">${cv.titulo || 'Título o Profesión'}</div>
        <div class="cr_cv_contact">${contactsHTML}</div>
      </div>
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
          <p class="cr_cv_text cr_prev_editable" data-edit-field="resumen" spellcheck="true" lang="${cv.idioma}">${cv.resumen}</p>
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
        .map((line, liIdx) => {
          const clean = line.replace(/^[-\*\•\s]+/, '').trim();
          return `<li class="cr_prev_editable" data-edit-field="exp_logro" data-exp-id="${exp.id}" data-logro-idx="${liIdx}" spellcheck="true" lang="${cv.idioma}">${clean}</li>`;
        })
        .join('');

      blocks.push({
        type: 'item',
        html: `
          <div class="cr_cv_item">
            <div class="cr_cv_item_row">
              <strong class="cr_prev_editable" data-edit-field="exp_puesto" data-exp-id="${exp.id}" spellcheck="true" lang="${cv.idioma}">${exp.puesto || 'Puesto / Cargo'}</strong>
              <span>${exp.inicio || ''} – ${exp.fin === 'Presente' || !exp.fin ? textPresente : exp.fin}</span>
            </div>
            <div class="cr_cv_item_subrow">
              <span class="cr_prev_editable" data-edit-field="exp_empresa" data-exp-id="${exp.id}" spellcheck="true" lang="${cv.idioma}">${exp.empresa || 'Empresa'}</span>
              <span class="cr_prev_editable" data-edit-field="exp_ubicacion" data-exp-id="${exp.id}" spellcheck="true" lang="${cv.idioma}">${exp.ubicacion || ''}</span>
            </div>
            ${achievements ? `<div class="cr_cv_item_desc"><ul>${achievements}</ul></div>` : ''}
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
              <strong class="cr_prev_editable" data-edit-field="proj_nombre" data-proj-id="${proj.id}" spellcheck="true" lang="${cv.idioma}">${proj.nombre || 'Nombre del Proyecto'}</strong>
              ${proj.enlace ? `<span class="cr_prev_editable" data-edit-field="proj_enlace" data-proj-id="${proj.id}">${proj.enlace}</span>` : ''}
            </div>
            <div class="cr_cv_item_desc">
              <p class="cr_prev_editable" data-edit-field="proj_descripcion" data-proj-id="${proj.id}" spellcheck="true" lang="${cv.idioma}">${proj.descripcion || ''}</p>
              ${proj.tecnologias ? `<p class="cr_cv_proj_tech"><strong>${isEn ? 'Technologies' : 'Tecnologías'}:</strong> <span class="cr_prev_editable" data-edit-field="proj_tecnologias" data-proj-id="${proj.id}" spellcheck="true" lang="${cv.idioma}">${proj.tecnologias}</span></p>` : ''}
            </div>
          </div>
        `
      });
    });
  }

  // Reconocimientos
  const validRecs = cv.reconocimientos?.filter(r => r.titulo?.trim() || r.emisor?.trim()) || [];
  if (validRecs.length > 0) {
    const textReconocimientos = isEn ? 'Honors & Awards' : 'Reconocimientos';
    blocks.push({
      type: 'section_title',
      html: `<h2 class="cr_cv_section_title cr_cv_section_title--spaced">${textReconocimientos}</h2>`
    });

    validRecs.forEach(rec => {
      blocks.push({
        type: 'item',
        html: `
          <div class="cr_cv_item">
            <div class="cr_cv_item_row">
              <strong class="cr_prev_editable" data-edit-field="rec_titulo" data-rec-id="${rec.id}" spellcheck="true" lang="${cv.idioma}">${rec.titulo || 'Reconocimiento'}</strong>
              <span>${rec.fecha || ''}</span>
            </div>
            <div class="cr_cv_item_subrow">
              <span class="cr_prev_editable" data-edit-field="rec_emisor" data-rec-id="${rec.id}" spellcheck="true" lang="${cv.idioma}">${rec.emisor || ''}</span>
              <span class="cr_prev_editable" data-edit-field="rec_ubicacion" data-rec-id="${rec.id}" spellcheck="true" lang="${cv.idioma}">${rec.ubicacion || ''}</span>
            </div>
            ${rec.descripcion ? `<div class="cr_cv_item_desc"><p class="cr_prev_editable" data-edit-field="rec_descripcion" data-rec-id="${rec.id}" spellcheck="true" lang="${cv.idioma}">${rec.descripcion}</p></div>` : ''}
            ${rec.enlace ? `<div class="cr_cv_item_desc"><p><strong>${isEn ? 'Reference' : 'Referencia'}:</strong> <a href="${rec.enlace}" target="_blank" rel="noopener noreferrer" class="cr_cv_link">${rec.enlace}</a></p></div>` : ''}
          </div>
        `
      });
    });
  }

  // Educación
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
              <strong class="cr_prev_editable" data-edit-field="edu_grado" data-edu-id="${edu.id}" spellcheck="true" lang="${cv.idioma}">${edu.grado || 'Grado / Certificación'}</strong>
              <span>${edu.inicio || ''} – ${edu.fin || ''}</span>
            </div>
            <div class="cr_cv_item_subrow">
              <span class="cr_prev_editable" data-edit-field="edu_institucion" data-edu-id="${edu.id}" spellcheck="true" lang="${cv.idioma}">${edu.institucion || 'Institución'}</span>
              <span class="cr_prev_editable" data-edit-field="edu_ubicacion" data-edu-id="${edu.id}" spellcheck="true" lang="${cv.idioma}">${edu.ubicacion || ''}</span>
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
              <strong class="cr_prev_editable" data-edit-field="cert_nombre" data-cert-id="${cert.id}" spellcheck="true" lang="${cv.idioma}">${cert.nombre || 'Certificación'}</strong>
              <span>${cert.fecha || ''}</span>
            </div>
            <div class="cr_cv_item_subrow">
              <span class="cr_prev_editable" data-edit-field="cert_emisor" data-cert-id="${cert.id}" spellcheck="true" lang="${cv.idioma}">${cert.emisor || 'Emisor / Organización'}</span>
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
        skillsHTML = `<p class="cr_cv_text"><span class="cr_prev_editable" data-edit-field="skills" spellcheck="true" lang="${cv.idioma}">${parsedCategories.join(' &bull; ')}</span></p>`;
      } else {
        skillsHTML = `<p class="cr_cv_text"><strong>${textSkillsLabel}:</strong> <span class="cr_prev_editable" data-edit-field="skills" spellcheck="true" lang="${cv.idioma}">${cv.skills}</span></p>`;
      }
    }

    let idiomasHTML = '';
    if (cv.idiomas && cv.idiomas.length > 0) {
      const spans = cv.idiomas
        .map((idioma, idx) => {
          if (!idioma) return '';
          return `<span class="cr_prev_editable" data-edit-field="idioma_item" data-idioma-idx="${idx}" spellcheck="true" lang="${cv.idioma}">${idioma}</span>`;
        })
        .filter(Boolean);

      if (spans.length > 0) {
        idiomasHTML = `<p class="cr_cv_text"><strong>${textIdiomasLabel}:</strong> ${spans.join(', ')}</p>`;
      }
    }

    blocks.push({
      type: 'skills',
      html: `
        <div class="cr_cv_section">
          <h2 class="cr_cv_section_title">${textSkills}</h2>
          <div class="cr_cv_skills_list">
            ${skillsHTML}
            ${idiomasHTML}
          </div>
        </div>
      `
    });
  }

  // Referencias
  const validRefs = cv.referencias?.filter(r => r.nombre?.trim()) || [];
  if (validRefs.length > 0) {
    const textReferencias = isEn ? 'References' : 'Referencias Laborales';
    blocks.push({
      type: 'section_title',
      html: `<h2 class="cr_cv_section_title cr_cv_section_title--spaced">${textReferencias}</h2>`
    });

    validRefs.forEach(ref => {
      const infoContacto = [ref.telefono, ref.email].filter(Boolean).join(' | ');
      blocks.push({
        type: 'item',
        html: `
          <div class="cr_cv_item">
            <div class="cr_cv_item_row">
              <strong class="cr_prev_editable" data-edit-field="ref_nombre" data-ref-id="${ref.id}" spellcheck="true" lang="${cv.idioma}">${ref.nombre || 'Nombre'}</strong>
              <span>${ref.cargo ? `${ref.cargo}${ref.empresa ? ` – ${ref.empresa}` : ''}` : (ref.empresa || '')}</span>
            </div>
            ${(infoContacto || ref.relacion) ? `
              <div class="cr_cv_item_subrow">
                <span>${infoContacto}</span>
                <span>${ref.relacion || ''}</span>
              </div>
            ` : ''}
          </div>
        `
      });
    });
  }

  // Secciones Personalizadas
  const validSecs = cv.seccionesExtra?.filter(s => s.titulo?.trim() || s.contenido?.trim()) || [];
  if (validSecs.length > 0) {
    validSecs.forEach(sec => {
      blocks.push({
        type: 'section_title',
        html: `<h2 class="cr_cv_section_title cr_cv_section_title--spaced">${sec.titulo || (isEn ? 'Additional Information' : 'Información Adicional')}</h2>`
      });

      blocks.push({
        type: 'item',
        html: `
          <div class="cr_cv_item">
            <p class="cr_cv_text cr_prev_editable" data-edit-field="sec_contenido" data-sec-id="${sec.id}" spellcheck="true" lang="${cv.idioma}">${sec.contenido || ''}</p>
          </div>
        `
      });
    });
  }

  // ── Medidor invisible para calcular alturas reales ──
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

  // ── Paginado dinámico ──
  const pages = [[]];
  let currentPageHeight = 0;
  const MAX_CONTENT_HEIGHT = 1040; // A4 (1122.5px) - padding 38px*2

  blocks.forEach((block) => {
    const blockHeight = measureBlock(block.html);
    const newHeight = currentPageHeight > 0 ? currentPageHeight + 15 + blockHeight : blockHeight;

    if (newHeight <= MAX_CONTENT_HEIGHT || currentPageHeight === 0) {
      pages[pages.length - 1].push(block);
      currentPageHeight = newHeight;
    } else {
      // Evitar títulos huérfanos al final de página
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

  // ── Render de páginas ──
  let pagesHTML = '';
  pages.forEach((pageBlocks, index) => {
    const isFirst = index === 0;
    const pageClass = isFirst ? 'cr_cv_document cr_cv_page' : 'cr_cv_document cr_cv_page cr_cv_page_next';
    pagesHTML += `
      <div class="${pageClass}">
        ${pageBlocks.map(b => b.html).join('\n')}
        <div class="cr_page_number">
          ${isEn ? 'Page' : 'Página'} ${index + 1} / ${pages.length}
        </div>
      </div>
    `;
  });

  printableArea.innerHTML = pagesHTML;

  // ── WYSIWYG: edición directa en el A4 ──
  initEditablePreview(
    printableArea,
    getCvData,
    updateCvData,
    onSync
  );
};
