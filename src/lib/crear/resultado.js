import { wiRateLimit, Notificacion } from '../widev.js';

let currentStep = 1;
const TOTAL_STEPS = 5;

/**
 * Cambia de paso en el formulario y actualiza la UI.
 */
export const updateSteps = (step) => {
  currentStep = step;

  // 1. Mostrar/Ocultar paneles correspondientes
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    const panel = document.getElementById(`cr_step_panel_${i}`);
    if (panel) {
      if (i === currentStep) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    }
  }

  // 2. Actualizar nodos del Wizard Progress Bar
  document.querySelectorAll('.cr_step_node').forEach(node => {
    const stepNum = parseInt(node.getAttribute('data-step') || '1');
    node.classList.remove('active', 'completed');
    if (stepNum === currentStep) {
      node.classList.add('active');
    } else if (stepNum < currentStep) {
      node.classList.add('completed');
    }
  });

  // 3. Rellenar barra de progreso
  const fill = document.getElementById('cr_progress_fill');
  if (fill) {
    const pct = ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100;
    fill.style.width = `${pct}%`;
  }

  // 4. Habilitar/Deshabilitar botones de navegación
  const btnNext = document.getElementById('cr_btn_next');
  const btnBack = document.getElementById('cr_btn_back');

  if (btnBack) {
    if (currentStep === 1) {
      btnBack.classList.add('disabled');
      btnBack.setAttribute('disabled', 'true');
    } else {
      btnBack.classList.remove('disabled');
      btnBack.removeAttribute('disabled');
    }
  }

  if (btnNext) {
    if (currentStep === TOTAL_STEPS) {
      btnNext.classList.add('dpn');
    } else {
      btnNext.classList.remove('dpn');
    }
  }
};

/**
 * Renderiza los datos del CV en tiempo real en la hoja A4 de vista previa.
 */
export const updatePreview = (cvData) => {
  const previewName = document.getElementById('cr_preview_name');
  const previewTitle = document.getElementById('cr_preview_title');
  const contactContainer = document.getElementById('cr_preview_contact_info');

  if (previewName) previewName.textContent = cvData.nombre || 'Tu Nombre Completo';
  if (previewTitle) previewTitle.textContent = cvData.titulo || 'Tu Título Profesional';

  // Render Contact block info
  const contacts = [];
  if (cvData.email) contacts.push(`<span><i class="fas fa-envelope"></i> ${cvData.email}</span>`);
  if (cvData.telefono) contacts.push(`<span><i class="fas fa-phone"></i> ${cvData.telefono}</span>`);
  if (cvData.ubicacion) contacts.push(`<span><i class="fas fa-location-dot"></i> ${cvData.ubicacion}</span>`);
  if (cvData.linkedin) contacts.push(`<span><i class="fab fa-linkedin"></i> ${cvData.linkedin}</span>`);
  if (cvData.web) contacts.push(`<span><i class="fas fa-globe"></i> ${cvData.web}</span>`);

  if (contactContainer) {
    contactContainer.innerHTML = contacts.join(' &bull; ');
  }

  // Render Resumen/Perfil
  const resumenSec = document.getElementById('cr_preview_section_resumen');
  const previewSummary = document.getElementById('cr_preview_summary');
  if (cvData.resumen) {
    resumenSec?.classList.remove('dpn');
    if (previewSummary) previewSummary.textContent = cvData.resumen;
  } else {
    resumenSec?.classList.add('dpn');
  }

  // Render Experiencias
  const expList = document.getElementById('cr_preview_exp_list');
  if (expList) {
    expList.innerHTML = '';
    cvData.experiencias.forEach(exp => {
      if (!exp.puesto && !exp.empresa) return;

      const item = document.createElement('div');
      item.className = 'cr_cv_item';

      // Parse logos achievements into bullet lists
      const bulletsHtml = exp.logros
        ? exp.logros
            .split('\n')
            .filter(line => line.trim().length > 0)
            .map(line => {
              let cleanLine = line.trim();
              if (cleanLine.startsWith('-') || cleanLine.startsWith('*')) {
                cleanLine = cleanLine.substring(1).trim();
              }
              return `<li>${cleanLine}</li>`;
            })
            .join('')
        : '';

      item.innerHTML = `
        <div class="cr_cv_item_row">
          <span>${exp.puesto || ''}</span>
          <span>${exp.inicio || ''} — ${exp.fin || ''}</span>
        </div>
        <div class="cr_cv_item_subrow">
          <span>${exp.empresa || ''}</span>
          <span>${exp.ubicacion || ''}</span>
        </div>
        ${bulletsHtml ? `<div class="cr_cv_item_desc"><ul>${bulletsHtml}</ul></div>` : ''}
      `;
      expList.appendChild(item);
    });

    const expSec = document.getElementById('cr_preview_section_exp');
    const activeExps = cvData.experiencias.filter(e => e.puesto || e.empresa);
    if (activeExps.length > 0) {
      expSec?.classList.remove('dpn');
    } else {
      expSec?.classList.add('dpn');
    }
  }

  // Render Educación
  const eduList = document.getElementById('cr_preview_edu_list');
  if (eduList) {
    eduList.innerHTML = '';
    cvData.educacion.forEach(edu => {
      if (!edu.grado && !edu.institucion) return;

      const item = document.createElement('div');
      item.className = 'cr_cv_item';
      item.innerHTML = `
        <div class="cr_cv_item_row">
          <span>${edu.grado || ''}</span>
          <span>${edu.inicio || ''} — ${edu.fin || ''}</span>
        </div>
        <div class="cr_cv_item_subrow">
          <span>${edu.institucion || ''}</span>
          <span>${edu.ubicacion || ''}</span>
        </div>
      `;
      eduList.appendChild(item);
    });

    const eduSec = document.getElementById('cr_preview_section_edu');
    const activeEdus = cvData.educacion.filter(e => e.grado || e.institucion);
    if (activeEdus.length > 0) {
      eduSec?.classList.remove('dpn');
    } else {
      eduSec?.classList.add('dpn');
    }
  }

  // Render Habilidades
  const previewSkills = document.getElementById('cr_preview_skills');
  const skillsRow = document.getElementById('cr_preview_skills_row');
  if (cvData.skills) {
    skillsRow?.classList.remove('dpn');
    if (previewSkills) previewSkills.textContent = cvData.skills;
  } else {
    skillsRow?.classList.add('dpn');
  }

  // Render Idiomas
  const langRow = document.getElementById('cr_preview_lang_row');
  const previewLangs = document.getElementById('cr_preview_languages');
  const activeLangs = cvData.idiomas || [];
  if (activeLangs.length > 0) {
    langRow?.classList.remove('dpn');
    if (previewLangs) {
      previewLangs.textContent = activeLangs
        .map(lang => `${lang.nombre || ''} (${lang.nivel || ''})`)
        .join(', ');
    }
  } else {
    langRow?.classList.add('dpn');
  }

  // Render Habilidades e Idiomas Section Header
  const skillsSec = document.getElementById('cr_preview_section_skills');
  if (cvData.skills || activeLangs.length > 0) {
    skillsSec?.classList.remove('dpn');
  } else {
    skillsSec?.classList.add('dpn');
  }
};

/**
 * Inicializa eventos del paso de visualización y exportación.
 */
export const initResultado = (onNavChangeCallback) => {
  const triggerPrint = async () => {
    const isLogged = localStorage.getItem('wiSmile');
    if (!isLogged) {
      const rate = wiRateLimit('guest_cv_creator_uses', 5, 315360000000);
      if (!rate.ok) {
        Notificacion('Has alcanzado el límite de 5 usos de prueba. Regístrate gratis para continuar sin límites.', 'warning', 6000);
        const { abrirLogin } = await import('../login.js');
        abrirLogin('registrar');
        return;
      }
      rate.fail();
    }
    window.print();
  };

  document.getElementById('cr_btn_print')?.addEventListener('click', triggerPrint);
  document.getElementById('cr_btn_download_final')?.addEventListener('click', triggerPrint);

  // Botón siguiente / atrás
  const btnNext = document.getElementById('cr_btn_next');
  const btnBack = document.getElementById('cr_btn_back');

  btnNext?.addEventListener('click', () => {
    if (currentStep < TOTAL_STEPS) {
      currentStep++;
      updateSteps(currentStep);
      onNavChangeCallback?.(currentStep);
    }
  });

  btnBack?.addEventListener('click', () => {
    if (currentStep > 1) {
      currentStep--;
      updateSteps(currentStep);
      onNavChangeCallback?.(currentStep);
    }
  });

  // Habilitar clics en los indicadores de paso
  document.querySelectorAll('.cr_step_node').forEach(node => {
    node.addEventListener('click', () => {
      const step = parseInt(node.getAttribute('data-step') || '1');
      updateSteps(step);
      onNavChangeCallback?.(step);
    });
  });

  // Toggle de visualización en Mobile
  const toggleMobileBtn = document.getElementById('cr_btn_toggle_mobile');
  const previewPanel = document.getElementById('cr_preview_panel');
  const editorPanel = document.getElementById('cr_editor_panel');

  toggleMobileBtn?.addEventListener('click', () => {
    if (previewPanel?.classList.contains('active_mobile')) {
      previewPanel.classList.remove('active_mobile');
      editorPanel?.classList.remove('hide_mobile');
      toggleMobileBtn.innerHTML = '<i class="fas fa-eye"></i> Ver Vista Previa';
    } else {
      previewPanel?.classList.add('active_mobile');
      editorPanel?.classList.add('hide_mobile');
      toggleMobileBtn.innerHTML = '<i class="fas fa-edit"></i> Editar Datos';
    }
  });
};
