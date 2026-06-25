import { wiTip, Notificacion } from '../widev.js';

export let convertedCvData = {
  nombre: '',
  titulo: '',
  email: '',
  telefono: '',
  ubicacion: '',
  linkedin: '',
  web: '',
  resumen: '',
  experiencias: [],
  educacion: [],
  skills: '',
  idiomas: [],
  incluirFoto: false,
  fotoBase64: ''
};

let activeTab = 'contacto';

export const initVisual = (initialData) => {
  convertedCvData = { ...convertedCvData, ...initialData };
  
  // Set default empty lists if none exist
  if (!convertedCvData.experiencias || convertedCvData.experiencias.length === 0) {
    convertedCvData.experiencias = [crearEstructuraExp()];
  }
  if (!convertedCvData.educacion || convertedCvData.educacion.length === 0) {
    convertedCvData.educacion = [crearEstructuraEdu()];
  }
  if (!convertedCvData.idiomas) {
    convertedCvData.idiomas = [];
  }

  // Renders iniciales
  renderTabs();
  renderFormContent();
  updateA4Preview();
  setupGlobalListeners();
};

const crearEstructuraExp = () => ({
  id: 'exp_' + Math.random().toString(36).substr(2, 9),
  puesto: '',
  empresa: '',
  ubicacion: '',
  inicio: '',
  fin: '',
  logros: ''
});

const crearEstructuraEdu = () => ({
  id: 'edu_' + Math.random().toString(36).substr(2, 9),
  institucion: '',
  grado: '',
  ubicacion: '',
  inicio: '',
  fin: ''
});

const renderTabs = () => {
  const container = document.getElementById('convTabsHeader');
  if (!container) return;

  const tabs = [
    { id: 'contacto', label: 'Contacto', icon: 'fa-address-card' },
    { id: 'perfil', label: 'Perfil', icon: 'fa-user' },
    { id: 'experiencia', label: 'Experiencia', icon: 'fa-briefcase' },
    { id: 'educacion', label: 'Educación', icon: 'fa-graduation-cap' },
    { id: 'skills', label: 'Habilidades', icon: 'fa-sliders-h' }
  ];

  container.innerHTML = tabs.map(tab => `
    <button class="conv_tab_btn ${tab.id === activeTab ? 'active' : ''}" data-tab="${tab.id}">
      <i class="fas ${tab.icon}"></i>
      <span>${tab.label}</span>
    </button>
  `).join('');

  // Bind tab click events
  container.querySelectorAll('.conv_tab_btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      if (tabId) {
        activeTab = tabId;
        renderTabs();
        renderFormContent();
      }
    });
  });
};

const renderFormContent = () => {
  const container = document.getElementById('convFormContent');
  if (!container) return;

  container.innerHTML = '';

  if (activeTab === 'contacto') {
    container.innerHTML = `
      <div class="conv_form_grid">
        <div class="conv_field">
          <label>Nombre Completo *</label>
          <input type="text" id="in_nombre" value="${convertedCvData.nombre || ''}" placeholder="Ej: Wilder Taype" required />
        </div>
        <div class="conv_field">
          <label>Título Profesional *</label>
          <input type="text" id="in_titulo" value="${convertedCvData.titulo || ''}" placeholder="Ej: Desarrollador Backend" required />
        </div>
        <div class="conv_field">
          <label>Correo Electrónico *</label>
          <input type="email" id="in_email" value="${convertedCvData.email || ''}" placeholder="Ej: wilder@example.com" required />
        </div>
        <div class="conv_field">
          <label>Teléfono *</label>
          <input type="tel" id="in_telefono" value="${convertedCvData.telefono || ''}" placeholder="Ej: +51 999 888 777" required />
        </div>
        <div class="conv_field">
          <label>Ubicación (Ciudad, País) *</label>
          <input type="text" id="in_ubicacion" value="${convertedCvData.ubicacion || ''}" placeholder="Ej: Lima, Perú" required />
        </div>
        <div class="conv_field">
          <label>Enlace LinkedIn</label>
          <input type="url" id="in_linkedin" value="${convertedCvData.linkedin || ''}" placeholder="Ej: https://linkedin.com/in/usuario" />
        </div>
        <div class="conv_field full_width">
          <label>Sitio Web o Portafolio</label>
          <input type="url" id="in_web" value="${convertedCvData.web || ''}" placeholder="Ej: https://miportafolio.com" />
        </div>
        
        <!-- Sección de Foto -->
        <div class="conv_field full_width conv_photo_section">
          <div class="conv_toggle_row">
            <span class="conv_toggle_label">
              <i class="fas fa-camera"></i> ¿Incluir foto en el CV?
            </span>
            <label class="conv_switch">
              <input type="checkbox" id="in_incluirFoto" ${convertedCvData.incluirFoto ? 'checked' : ''} />
              <span class="conv_slider"></span>
            </label>
          </div>
          
          <div id="convPhotoUploadArea" class="conv_photo_upload_area ${convertedCvData.incluirFoto ? 'active' : ''}">
            <div class="conv_photo_flex">
              <div class="conv_photo_preview_box" id="convPhotoPreviewBox">
                ${convertedCvData.fotoBase64 ? `<img src="${convertedCvData.fotoBase64}" class="conv_avatar_img" />` : '<i class="fas fa-user-circle"></i>'}
              </div>
              <div class="conv_photo_actions">
                <input type="file" id="in_fotoFile" accept="image/png, image/jpeg" class="dpn" />
                <button type="button" class="conv_btn_small" id="btnSelectFoto"><i class="fas fa-upload"></i> Subir Foto</button>
                <span class="conv_small_help">Formatos: PNG/JPG. Máx: 2MB.</span>
              </div>
            </div>
            <div class="conv_warning_badge" id="photoWarningBtn" data-witip="Muchos filtros ATS automáticos de reclutamiento no procesan imágenes y pueden descartar o corromper tu CV al intentar leerlo. Se recomienda no usar foto para vacantes internacionales o tecnológicas." data-wtipo="warning" data-wtiempo="6000">
              <i class="fas fa-exclamation-triangle"></i> La foto puede reducir la compatibilidad ATS. Pasa el cursor para saber por qué.
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind Photo events
    const toggle = document.getElementById('in_incluirFoto');
    const uploadArea = document.getElementById('convPhotoUploadArea');
    const fotoFileInput = document.getElementById('in_fotoFile');
    const selectFotoBtn = document.getElementById('btnSelectFoto');
    const warningBtn = document.getElementById('photoWarningBtn');

    toggle?.addEventListener('change', (e) => {
      convertedCvData.incluirFoto = e.target.checked;
      if (convertedCvData.incluirFoto) {
        uploadArea?.classList.add('active');
      } else {
        uploadArea?.classList.remove('active');
      }
      updateA4Preview();
    });

    selectFotoBtn?.addEventListener('click', () => fotoFileInput?.click());

    fotoFileInput?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          Notificacion('La foto excede el límite de 2MB.', 'error');
          return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
          convertedCvData.fotoBase64 = ev.target.result;
          const previewBox = document.getElementById('convPhotoPreviewBox');
          if (previewBox) {
            previewBox.innerHTML = `<img src="${convertedCvData.fotoBase64}" class="conv_avatar_img" />`;
          }
          updateA4Preview();
        };
        reader.readAsDataURL(file);
      }
    });

    // Tooltip autogestionado por data-witip en el HTML

    // Bind text fields
    ['nombre', 'titulo', 'email', 'telefono', 'ubicacion', 'linkedin', 'web'].forEach(field => {
      const input = document.getElementById(`in_${field}`);
      input?.addEventListener('input', () => {
        convertedCvData[field] = input.value;
        updateA4Preview();
      });
    });

  } else if (activeTab === 'perfil') {
    container.innerHTML = `
      <div class="conv_field full_width">
        <label>Resumen / Perfil Profesional *</label>
        <textarea id="in_resumen" rows="8" placeholder="Redacta tu propuesta de valor, principales logros e industrias en las que te especializas..." required>${convertedCvData.resumen || ''}</textarea>
        <span class="conv_char_counter" id="lbl_resumen_counter">${(convertedCvData.resumen || '').length} caracteres</span>
      </div>
    `;

    const txt = document.getElementById('in_resumen');
    txt?.addEventListener('input', () => {
      convertedCvData.resumen = txt.value;
      const counter = document.getElementById('lbl_resumen_counter');
      if (counter) counter.textContent = `${txt.value.length} caracteres`;
      updateA4Preview();
    });

  } else if (activeTab === 'experiencia') {
    renderExperienciasForm(container);

  } else if (activeTab === 'educacion') {
    renderEducacionForm(container);

  } else if (activeTab === 'skills') {
    container.innerHTML = `
      <div class="conv_field full_width">
        <label>Habilidades (Separadas por comas) *</label>
        <input type="text" id="in_skills" value="${convertedCvData.skills || ''}" placeholder="Ej: React, Node.js, SQL, Trabajo en equipo, Liderazgo" required />
      </div>
      <div class="conv_field full_width conv_section_spacer">
        <div class="conv_header_row">
          <label>Idiomas</label>
          <button type="button" class="conv_btn_small" id="btnAddLanguage"><i class="fas fa-plus"></i> Agregar Idioma</button>
        </div>
        <div class="conv_languages_list" id="convLanguagesList">
          <!-- Render dynamic languages -->
        </div>
      </div>
    `;

    const skillsInp = document.getElementById('in_skills');
    skillsInp?.addEventListener('input', () => {
      convertedCvData.skills = skillsInp.value;
      updateA4Preview();
    });

    renderLanguages();

    document.getElementById('btnAddLanguage')?.addEventListener('click', () => {
      convertedCvData.idiomas.push('Idioma - Nivel');
      renderLanguages();
      updateA4Preview();
    });
  }
};

const renderExperienciasForm = (container) => {
  container.innerHTML = `
    <div class="conv_header_row conv_form_header_row">
      <h3>Historial Profesional</h3>
      <button type="button" class="conv_btn_small" id="btnAddExp"><i class="fas fa-plus"></i> Añadir Trabajo</button>
    </div>
    <div class="conv_list_items" id="convExpList">
      <!-- render experiences here -->
    </div>
  `;

  const expListContainer = document.getElementById('convExpList');
  if (!expListContainer) return;

  const renderList = () => {
    expListContainer.innerHTML = '';
    convertedCvData.experiencias.forEach((exp, idx) => {
      const card = document.createElement('div');
      card.className = 'conv_item_card';
      card.dataset.id = exp.id;
      card.innerHTML = `
        <div class="conv_item_card_header">
          <h4>Puesto #${idx + 1}</h4>
          ${convertedCvData.experiencias.length > 1 ? `<button class="conv_btn_danger_small btn_del_exp" data-id="${exp.id}"><i class="fas fa-trash"></i> Eliminar</button>` : ''}
        </div>
        <div class="conv_form_grid">
          <div class="conv_field">
            <label>Cargo / Puesto *</label>
            <input type="text" class="exp_puesto" value="${exp.puesto || ''}" placeholder="Ej: Desarrollador Backend" required />
          </div>
          <div class="conv_field">
            <label>Empresa *</label>
            <input type="text" class="exp_empresa" value="${exp.empresa || ''}" placeholder="Ej: Tech Solutions" required />
          </div>
          <div class="conv_field">
            <label>Ubicación</label>
            <input type="text" class="exp_ubicacion" value="${exp.ubicacion || ''}" placeholder="Ej: Remoto / Madrid, España" />
          </div>
          <div class="conv_field">
            <label>Fecha de Inicio *</label>
            <input type="text" class="exp_inicio" value="${exp.inicio || ''}" placeholder="Ej: Ene 2023" required />
          </div>
          <div class="conv_field">
            <label>Fecha de Fin *</label>
            <input type="text" class="exp_fin" value="${exp.fin || ''}" placeholder="Ej: Presente o Dic 2024" required />
          </div>
          <div class="conv_field full_width">
            <label>Logros y Funciones (Una viñeta por línea) *</label>
            <textarea class="exp_logros" rows="4" placeholder="- Lideré el desarrollo de la API rest..." required>${exp.logros || ''}</textarea>
          </div>
        </div>
      `;
      expListContainer.appendChild(card);
    });

    // Bind fields dynamically
    expListContainer.querySelectorAll('.conv_item_card').forEach(card => {
      const id = card.dataset.id;
      const index = convertedCvData.experiencias.findIndex(e => e.id === id);
      if (index === -1) return;

      const fields = ['puesto', 'empresa', 'ubicacion', 'inicio', 'fin', 'logros'];
      fields.forEach(field => {
        const element = card.querySelector(`.exp_${field}`);
        element?.addEventListener('input', () => {
          convertedCvData.experiencias[index][field] = element.value;
          updateA4Preview();
        });
      });
    });

    // Bind deletes
    expListContainer.querySelectorAll('.btn_del_exp').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        convertedCvData.experiencias = convertedCvData.experiencias.filter(e => e.id !== id);
        renderList();
        updateA4Preview();
      });
    });
  };

  renderList();

  document.getElementById('btnAddExp')?.addEventListener('click', () => {
    convertedCvData.experiencias.push(crearEstructuraExp());
    renderList();
    updateA4Preview();
  });
};

const renderEducacionForm = (container) => {
  container.innerHTML = `
    <div class="conv_header_row conv_form_header_row">
      <h3>Historial Educativo</h3>
      <button type="button" class="conv_btn_small" id="btnAddEdu"><i class="fas fa-plus"></i> Añadir Estudio</button>
    </div>
    <div class="conv_list_items" id="convEduList">
      <!-- render education here -->
    </div>
  `;

  const eduListContainer = document.getElementById('convEduList');
  if (!eduListContainer) return;

  const renderList = () => {
    eduListContainer.innerHTML = '';
    convertedCvData.educacion.forEach((edu, idx) => {
      const card = document.createElement('div');
      card.className = 'conv_item_card';
      card.dataset.id = edu.id;
      card.innerHTML = `
        <div class="conv_item_card_header">
          <h4>Estudio #${idx + 1}</h4>
          ${convertedCvData.educacion.length > 1 ? `<button class="conv_btn_danger_small btn_del_edu" data-id="${edu.id}"><i class="fas fa-trash"></i> Eliminar</button>` : ''}
        </div>
        <div class="conv_form_grid">
          <div class="conv_field">
            <label>Institución Educativa *</label>
            <input type="text" class="edu_institucion" value="${edu.institucion || ''}" placeholder="Ej: Universidad Nacional" required />
          </div>
          <div class="conv_field">
            <label>Grado / Carrera / Certificación *</label>
            <input type="text" class="edu_grado" value="${edu.grado || ''}" placeholder="Ej: Lic. en Administración" required />
          </div>
          <div class="conv_field">
            <label>Ubicación</label>
            <input type="text" class="edu_ubicacion" value="${edu.ubicacion || ''}" placeholder="Ej: Lima, Perú" />
          </div>
          <div class="conv_field">
            <label>Fecha de Inicio *</label>
            <input type="text" class="edu_inicio" value="${edu.inicio || ''}" placeholder="Ej: Mar 2018" required />
          </div>
          <div class="conv_field">
            <label>Fecha de Fin *</label>
            <input type="text" class="edu_fin" value="${edu.fin || ''}" placeholder="Ej: Dic 2022 o En Curso" required />
          </div>
        </div>
      `;
      eduListContainer.appendChild(card);
    });

    // Bind fields dynamically
    eduListContainer.querySelectorAll('.conv_item_card').forEach(card => {
      const id = card.dataset.id;
      const index = convertedCvData.educacion.findIndex(e => e.id === id);
      if (index === -1) return;

      const fields = ['institucion', 'grado', 'ubicacion', 'inicio', 'fin'];
      fields.forEach(field => {
        const element = card.querySelector(`.edu_${field}`);
        element?.addEventListener('input', () => {
          convertedCvData.educacion[index][field] = element.value;
          updateA4Preview();
        });
      });
    });

    // Bind deletes
    eduListContainer.querySelectorAll('.btn_del_edu').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        convertedCvData.educacion = convertedCvData.educacion.filter(e => e.id !== id);
        renderList();
        updateA4Preview();
      });
    });
  };

  renderList();

  document.getElementById('btnAddEdu')?.addEventListener('click', () => {
    convertedCvData.educacion.push(crearEstructuraEdu());
    renderList();
    updateA4Preview();
  });
};

const renderLanguages = () => {
  const container = document.getElementById('convLanguagesList');
  if (!container) return;

  container.innerHTML = '';
  if (convertedCvData.idiomas.length === 0) {
    container.innerHTML = '<span class="conv_small_help">No has añadido ningún idioma aún.</span>';
    return;
  }

  convertedCvData.idiomas.forEach((lang, idx) => {
    const row = document.createElement('div');
    row.className = 'conv_lang_row';
    row.innerHTML = `
      <input type="text" class="in_lang_value" value="${lang || ''}" placeholder="Ej: Inglés - Avanzado (C1)" />
      <button type="button" class="conv_btn_icon_danger btn_del_lang" data-idx="${idx}"><i class="fas fa-trash-can"></i></button>
    `;
    container.appendChild(row);

    const input = row.querySelector('.in_lang_value');
    input?.addEventListener('input', () => {
      convertedCvData.idiomas[idx] = input.value;
      updateA4Preview();
    });
  });

  container.querySelectorAll('.btn_del_lang').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx') || '0');
      convertedCvData.idiomas.splice(idx, 1);
      renderLanguages();
      updateA4Preview();
    });
  });
};

export const updateA4Preview = () => {
  const printableArea = document.getElementById('convPreviewA4');
  if (!printableArea) return;

  // Header Contact Section
  const contacts = [];
  if (convertedCvData.email) contacts.push(`<span><i class="fas fa-envelope"></i> ${convertedCvData.email}</span>`);
  if (convertedCvData.telefono) contacts.push(`<span><i class="fas fa-phone"></i> ${convertedCvData.telefono}</span>`);
  if (convertedCvData.ubicacion) contacts.push(`<span><i class="fas fa-location-dot"></i> ${convertedCvData.ubicacion}</span>`);
  if (convertedCvData.linkedin) contacts.push(`<span><i class="fab fa-linkedin"></i> ${convertedCvData.linkedin}</span>`);
  if (convertedCvData.web) contacts.push(`<span><i class="fas fa-globe"></i> ${convertedCvData.web}</span>`);

  const contactsHTML = contacts.join(' &bull; ');

  // Render Experiences
  const experiencesHTML = convertedCvData.experiencias.map(exp => {
    if (!exp.puesto && !exp.empresa) return '';
    
    // Parse achievements bullet list
    const achievements = (exp.logros || '')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        const cleanLine = line.replace(/^[-\*\•\s]+/, '').trim();
        return `<li>${cleanLine}</li>`;
      })
      .join('');

    return `
      <div class="cr_cv_item">
        <div class="cr_cv_item_row">
          <strong>${exp.puesto || 'Puesto / Cargo'}</strong>
          <span>${exp.inicio || ''} – ${exp.fin || ''}</span>
        </div>
        <div class="cr_cv_item_subrow">
          <span>${exp.empresa || 'Empresa'}</span>
          <span>${exp.ubicacion || ''}</span>
        </div>
        ${achievements ? `<div class="cr_cv_item_desc"><ul>${achievements}</ul></div>` : ''}
      </div>
    `;
  }).join('');

  // Render Education
  const educationHTML = convertedCvData.educacion.map(edu => {
    if (!edu.grado && !edu.institucion) return '';
    return `
      <div class="cr_cv_item">
        <div class="cr_cv_item_row">
          <strong>${edu.grado || 'Grado obtenido / Estudio'}</strong>
          <span>${edu.inicio || ''} – ${edu.fin || ''}</span>
        </div>
        <div class="cr_cv_item_subrow">
          <span>${edu.institucion || 'Institución'}</span>
          <span>${edu.ubicacion || ''}</span>
        </div>
      </div>
    `;
  }).join('');

  // Render Skills e Idiomas
  const skillsSectionHTML = convertedCvData.skills ? `
    <div class="cr_cv_section">
      <h2 class="cr_cv_section_title">Habilidades e Idiomas</h2>
      <div class="cr_cv_skills_grid">
        <div>
          <strong>Habilidades:</strong>
          <span>${convertedCvData.skills}</span>
        </div>
        ${convertedCvData.idiomas.length > 0 ? `
          <div class="cr_cv_skills_subrow">
            <strong>Idiomas:</strong>
            <span>${convertedCvData.idiomas.filter(Boolean).join(', ')}</span>
          </div>
        ` : ''}
      </div>
    </div>
  ` : '';

  // Render HTML Completo del Documento A4 ATS (Clases idénticas a crear.astro)
  printableArea.innerHTML = `
    <div class="cr_cv_document">
      
      <!-- Contenedor del Encabezado (Foto opcional + Info de Contacto) -->
      <div class="cr_cv_header ${convertedCvData.incluirFoto && convertedCvData.fotoBase64 ? 'has_avatar' : ''}">
        <div class="cr_cv_header_text">
          <h1 class="cr_cv_name">${convertedCvData.nombre || 'Nombre Completo'}</h1>
          <div class="cr_cv_title">${convertedCvData.titulo || 'Título o Profesión'}</div>
          <div class="cr_cv_contact">${contactsHTML || 'Email &bull; Teléfono &bull; Ubicación'}</div>
        </div>
        ${convertedCvData.incluirFoto && convertedCvData.fotoBase64 ? `
          <div class="ats_a4_avatar">
            <img src="${convertedCvData.fotoBase64}" />
          </div>
        ` : ''}
      </div>

      <div class="cr_cv_body">
        <!-- Resumen Profesional -->
        ${convertedCvData.resumen ? `
          <div class="cr_cv_section">
            <h2 class="cr_cv_section_title">Perfil Profesional</h2>
            <p class="cr_cv_text">${convertedCvData.resumen}</p>
          </div>
        ` : ''}

        <!-- Experiencia Laboral -->
        ${experiencesHTML ? `
          <div class="cr_cv_section">
            <h2 class="cr_cv_section_title">Experiencia Laboral</h2>
            <div class="cr_cv_list_items">${experiencesHTML}</div>
          </div>
        ` : ''}

        <!-- Educación -->
        ${educationHTML ? `
          <div class="cr_cv_section">
            <h2 class="cr_cv_section_title">Educación</h2>
            <div class="cr_cv_list_items">${educationHTML}</div>
          </div>
        ` : ''}

        <!-- Habilidades -->
        ${skillsSectionHTML}
      </div>
      
    </div>
  `;
};

const setupGlobalListeners = () => {
  // Tooltip autogestionado por data-witip en el HTML en convertir-ats.astro

  // Configurar wiTip en el botón de Guardar PDF
  const printBtn = document.getElementById('convBtnPrint');
  printBtn?.addEventListener('click', () => {
    window.print();
  });
};
