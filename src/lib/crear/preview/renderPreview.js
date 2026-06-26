// src/lib/crear/preview/renderPreview.js
// Renderizado de la hoja A4 y paginado dinámico del CV ATS

import { getCvData, updateCvData } from '../estado.js';
import { auditarCvAts } from '../auditor.js';
import { initEditablePreview } from './editarPreview.js';

// ─── A4 Preview ──────────────────────────────────────────────────────────────

export const updateA4Preview = (cv) => {
  const printableArea = document.getElementById('cr_cv_printable_area');
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
  const contacts = [];
  if (cv.email)    contacts.push(`<span><i class="fas fa-envelope"></i> ${cv.email}</span>`);
  if (cv.telefono) contacts.push(`<span><i class="fas fa-phone"></i> ${cv.telefono}</span>`);
  if (cv.ubicacion)contacts.push(`<span><i class="fas fa-location-dot"></i> ${cv.ubicacion}</span>`);
  if (cv.linkedin) contacts.push(`<span><i class="fab fa-linkedin"></i> ${cv.linkedin}</span>`);
  if (cv.web)      contacts.push(`<span><i class="fas fa-globe"></i> ${cv.web}</span>`);
  const contactsHTML = contacts.join(' &bull; ');

  // ── Bloques para paginado dinámico ──
  const headerHTML = `
    <div class="cr_cv_header ${cv.incluirFoto && cv.fotoBase64 ? 'has_avatar' : ''}" data-click-tab="contacto">
      <div class="cr_cv_header_text">
        <h1 class="cr_cv_name cr_prev_editable" data-edit-field="nombre">${cv.nombre || 'Nombre Completo'}</h1>
        <div class="cr_cv_title cr_prev_editable" data-edit-field="titulo">${cv.titulo || 'Título o Profesión'}</div>
        <div class="cr_cv_contact">${contactsHTML || 'Email &bull; Teléfono &bull; Ubicación'}</div>
      </div>
      ${cv.incluirFoto && cv.fotoBase64 ? `
        <div class="ats_a4_avatar">
          <img src="${cv.fotoBase64}" />
        </div>
      ` : ''}
    </div>
  `;

  const blocks = [{ html: headerHTML, type: 'header' }];

  // Perfil / Resumen
  if (cv.resumen) {
    blocks.push({
      type: 'summary',
      html: `
        <div class="cr_cv_section" data-click-tab="perfil">
          <h2 class="cr_cv_section_title">${textPerfil}</h2>
          <p class="cr_cv_text cr_prev_editable" data-edit-field="resumen">${cv.resumen}</p>
        </div>
      `
    });
  }

  // Experiencia
  const validExps = cv.experiencias?.filter(e => e.puesto?.trim() || e.empresa?.trim()) || [];
  if (validExps.length > 0) {
    blocks.push({
      type: 'section_title',
      html: `<h2 class="cr_cv_section_title cr_cv_section_title--spaced" data-click-tab="experiencia">${textExperiencia}</h2>`
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
          return `<li class="cr_prev_editable" data-edit-field="exp_logro" data-exp-id="${exp.id}" data-logro-idx="${liIdx}">${clean}</li>`;
        })
        .join('');

      blocks.push({
        type: 'item',
        html: `
          <div class="cr_cv_item" data-click-tab="experiencia">
            <div class="cr_cv_item_row">
              <strong class="cr_prev_editable" data-edit-field="exp_puesto" data-exp-id="${exp.id}">${exp.puesto || 'Puesto / Cargo'}</strong>
              <span>${exp.inicio || ''} – ${exp.fin === 'Presente' || !exp.fin ? textPresente : exp.fin}</span>
            </div>
            <div class="cr_cv_item_subrow">
              <span class="cr_prev_editable" data-edit-field="exp_empresa" data-exp-id="${exp.id}">${exp.empresa || 'Empresa'}</span>
              <span class="cr_prev_editable" data-edit-field="exp_ubicacion" data-exp-id="${exp.id}">${exp.ubicacion || ''}</span>
            </div>
            ${achievements ? `<div class="cr_cv_item_desc"><ul>${achievements}</ul></div>` : ''}
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
      html: `<h2 class="cr_cv_section_title cr_cv_section_title--spaced" data-click-tab="educacion">${textEducacion}</h2>`
    });

    validEdus.forEach(edu => {
      blocks.push({
        type: 'item',
        html: `
          <div class="cr_cv_item" data-click-tab="educacion">
            <div class="cr_cv_item_row">
              <strong class="cr_prev_editable" data-edit-field="edu_grado" data-edu-id="${edu.id}">${edu.grado || 'Grado / Certificación'}</strong>
              <span>${edu.inicio || ''} – ${edu.fin || ''}</span>
            </div>
            <div class="cr_cv_item_subrow">
              <span class="cr_prev_editable" data-edit-field="edu_institucion" data-edu-id="${edu.id}">${edu.institucion || 'Institución'}</span>
              <span class="cr_prev_editable" data-edit-field="edu_ubicacion" data-edu-id="${edu.id}">${edu.ubicacion || ''}</span>
            </div>
          </div>
        `
      });
    });
  }

  // Habilidades
  if (cv.skills || (cv.idiomas && cv.idiomas.length > 0)) {
    blocks.push({
      type: 'skills',
      html: `
        <div class="cr_cv_section" data-click-tab="skills">
          <h2 class="cr_cv_section_title">${textSkills}</h2>
          <div class="cr_cv_skills_list">
            ${cv.skills ? `<p class="cr_cv_text"><strong>${textSkillsLabel}:</strong> <span class="cr_prev_editable" data-edit-field="skills">${cv.skills}</span></p>` : ''}
            ${cv.idiomas && cv.idiomas.length > 0 ? `<p class="cr_cv_text"><strong>${textIdiomasLabel}:</strong> ${cv.idiomas.filter(Boolean).join(', ')}</p>` : ''}
          </div>
        </div>
      `
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

  // ── WYSIWYG: edición directa en el preview ──
  initEditablePreview(
    printableArea,
    getCvData,
    updateCvData,
    () => updateScorecard(getCvData())
  );
};

// ─── Scorecard ATS ───────────────────────────────────────────────────────────

export const updateScorecard = (cv) => {
  const { score, checklist } = auditarCvAts(cv);

  const scoreVal  = document.getElementById('cr_score_val');
  const scoreFill = document.getElementById('cr_score_fill');
  const checkListContainer = document.getElementById('cr_checklist');

  if (scoreVal) scoreVal.textContent = score.toString();
  if (scoreFill) {
    scoreFill.style.width = `${score}%`;
    scoreFill.className = 'cr_progress_fill';
    if (score <= 60)     scoreFill.style.background = 'var(--error)';
    else if (score <= 91)scoreFill.style.background = 'var(--warning)';
    else                 scoreFill.style.background = 'var(--success)';
  }

  if (!checkListContainer) return;

  let html = '';

  // Alertas del PDF subido (tablas, escaneo, etc.)
  const pdfWarnings = cv._pdfWarnings || [];
  if (pdfWarnings.length > 0) {
    html += pdfWarnings.map(w => `
      <div class="cr_pdf_warning_block">
        <div class="cr_pdf_warning_header">
          <i class="fas fa-table-cells"></i>
          <strong>Alerta de Formato PDF</strong>
        </div>
        <p>${w.text}</p>
      </div>
    `).join('');
  }

  if (checklist.length === 0) {
    html += `
      <div class="cr_check_success_box">
        <i class="fas fa-check-circle"></i>
        <span class="resultado_crear">¡Currículum impecable y optimizado para ATS en un 100%!</span>
      </div>
    `;
  } else {
    html += checklist.map(item => {
      let icon = 'fa-info-circle';
      if (item.type === 'danger')  icon = 'fa-circle-xmark';
      if (item.type === 'warning') icon = 'fa-exclamation-triangle';
      return `
        <div class="cr_checklist_item ${item.type}">
          <i class="fas ${icon}"></i>
          <span>${item.text}</span>
        </div>
      `;
    }).join('');
  }

  checkListContainer.innerHTML = html;
};
