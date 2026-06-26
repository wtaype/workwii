import { wiTip, Notificacion } from '../widev.js';
import { descargarPdfDirecto, imprimirPdf, descargarDocx, descargarTxt, descargarMd, descargarJson } from './descarga/descargas.js';
import { initEditablePreview, isEditingPreview } from '../crear/preview/editarPreview.js';

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
  fotoBase64: '',
  idioma: 'es' // Idioma por defecto
};

let activeTab = 'contacto';

// Diccionario de traducción dinámico para el panel de control del currículum
const locales = {
  es: {
    tabs: {
      contacto: 'Contacto',
      perfil: 'Perfil',
      experiencia: 'Experiencia',
      educacion: 'Educación',
      skills: 'Habilidades'
    },
    contacto: {
      nombre: 'Nombre Completo *',
      titulo: 'Título Profesional *',
      email: 'Correo Electrónico *',
      telefono: 'Teléfono *',
      ubicacion: 'Ubicación (Ciudad, País) *',
      linkedin: 'Enlace LinkedIn',
      web: 'Sitio Web o Portafolio',
      idioma: 'Idioma del CV *',
      incluirFoto: '¿Incluir foto en el CV?',
      subirFoto: 'Subir Foto',
      fotoHelp: 'Formatos: PNG/JPG. Máx: 2MB.',
      fotoWarning: 'La foto puede reducir la compatibilidad ATS. Pasa el cursor para saber por qué.',
      placeholderNombre: 'Ej: Wilder Taype',
      placeholderTitulo: 'Ej: Desarrollador Backend',
      placeholderEmail: 'Ej: wilder@example.com',
      placeholderTelefono: 'Ej: +51 999 888 777',
      placeholderUbicacion: 'Ej: Lima, Perú',
      placeholderLinkedin: 'Ej: https://linkedin.com/in/usuario',
      placeholderWeb: 'Ej: https://miportafolio.com'
    },
    perfil: {
      titulo: 'Resumen / Perfil Profesional *',
      placeholder: 'Redacta tu propuesta de valor, principales logros e industrias en las que te especializas...',
      caracteres: 'caracteres'
    },
    experiencia: {
      titulo: 'Historial Profesional',
      agregar: 'Añadir Trabajo',
      puestoNum: 'Puesto',
      eliminar: 'Eliminar',
      cargo: 'Cargo / Puesto *',
      empresa: 'Empresa *',
      ubicacion: 'Ubicación',
      inicio: 'Fecha de Inicio *',
      fin: 'Fecha de Fin *',
      logros: 'Logros y Funciones (Una viñeta por línea) *',
      placeholderCargo: 'Ej: Desarrollador Backend',
      placeholderEmpresa: 'Ej: Tech Solutions',
      placeholderUbicacion: 'Ej: Remoto / Madrid, España',
      placeholderInicio: 'Ej: Ene 2023',
      placeholderFin: 'Ej: Presente o Dic 2024',
      placeholderLogros: '- Lideré el desarrollo de la API rest...'
    },
    educacion: {
      titulo: 'Historial Educativo',
      agregar: 'Añadir Estudio',
      estudioNum: 'Estudio',
      eliminar: 'Eliminar',
      institucion: 'Institución Educativa *',
      grado: 'Grado / Carrera / Certificación *',
      ubicacion: 'Ubicación',
      inicio: 'Fecha de Inicio *',
      fin: 'Fecha de Fin *',
      placeholderInstitucion: 'Ej: Universidad Nacional',
      placeholderGrado: 'Ej: Lic. en Administración',
      placeholderUbicacion: 'Ej: Lima, Perú',
      placeholderInicio: 'Ej: Mar 2018',
      placeholderFin: 'Ej: Dic 2022 o En Curso'
    },
    skills: {
      titulo: 'Habilidades (Separadas por comas) *',
      placeholder: 'Ej: React, Node.js, SQL, Trabajo en equipo, Liderazgo',
      idiomas: 'Idiomas',
      agregarIdioma: 'Agregar Idioma',
      placeholderIdioma: 'Ej: Inglés - Avanzado (C1)',
      noIdiomas: 'No has añadido ningún idioma aún.'
    }
  },
  en: {
    tabs: {
      contacto: 'Contact Info',
      perfil: 'Summary',
      experiencia: 'Experience',
      educacion: 'Education',
      skills: 'Skills'
    },
    contacto: {
      nombre: 'Full Name *',
      titulo: 'Professional Title *',
      email: 'Email Address *',
      telefono: 'Phone Number *',
      ubicacion: 'Location (City, Country) *',
      linkedin: 'LinkedIn Link',
      web: 'Website or Portfolio',
      idioma: 'CV Language *',
      incluirFoto: 'Include photo in CV?',
      subirFoto: 'Upload Photo',
      fotoHelp: 'Formats: PNG/JPG. Max: 2MB.',
      fotoWarning: 'A photo may reduce ATS compatibility. Hover to learn why.',
      placeholderNombre: 'e.g., Wilder Taype',
      placeholderTitulo: 'e.g., Backend Developer',
      placeholderEmail: 'e.g., wilder@example.com',
      placeholderTelefono: 'e.g., +51 999 888 777',
      placeholderUbicacion: 'e.g., Lima, Peru',
      placeholderLinkedin: 'e.g., https://linkedin.com/in/username',
      placeholderWeb: 'e.g., https://myportfolio.com'
    },
    perfil: {
      titulo: 'Professional Summary *',
      placeholder: 'Write your value proposition, core achievements, and industries you specialize in...',
      caracteres: 'characters'
    },
    experiencia: {
      titulo: 'Work History',
      agregar: 'Add Work Experience',
      puestoNum: 'Job',
      eliminar: 'Delete',
      cargo: 'Job Title / Position *',
      empresa: 'Company *',
      ubicacion: 'Location',
      inicio: 'Start Date *',
      fin: 'End Date *',
      logros: 'Key Achievements & Responsibilities (One bullet per line) *',
      placeholderCargo: 'e.g., Backend Developer',
      placeholderEmpresa: 'e.g., Tech Solutions',
      placeholderUbicacion: 'e.g., Remote / Madrid, Spain',
      placeholderInicio: 'e.g., Jan 2023',
      placeholderFin: 'e.g., Present or Dec 2024',
      placeholderLogros: '- Led the development of the REST API...'
    },
    educacion: {
      titulo: 'Education History',
      agregar: 'Add Education',
      estudioNum: 'Education',
      eliminar: 'Delete',
      institucion: 'School / University *',
      grado: 'Degree / Major / Certification *',
      ubicacion: 'Location',
      inicio: 'Start Date *',
      fin: 'End Date *',
      placeholderInstitucion: 'e.g., State University',
      placeholderGrado: 'e.g., B.S. in Business Administration',
      placeholderUbicacion: 'e.g., Lima, Peru',
      placeholderInicio: 'e.g., Mar 2018',
      placeholderFin: 'e.g., Dec 2022 or Ongoing'
    },
    skills: {
      titulo: 'Skills (Separated by commas) *',
      placeholder: 'e.g., React, Node.js, SQL, Teamwork, Leadership',
      idiomas: 'Languages',
      agregarIdioma: 'Add Language',
      placeholderIdioma: 'e.g., English - Fluent (C1)',
      noIdiomas: 'You haven\'t added any languages yet.'
    }
  }
};

export const initVisual = (initialData) => {
  convertedCvData = { ...convertedCvData, ...initialData };
  
  if (!convertedCvData.idioma) {
    convertedCvData.idioma = 'es';
  }

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

  const isEn = convertedCvData.idioma === 'en';
  const tabLang = isEn ? locales.en.tabs : locales.es.tabs;

  const tabs = [
    { id: 'contacto', label: tabLang.contacto, icon: 'fa-address-card' },
    { id: 'perfil', label: tabLang.perfil, icon: 'fa-user' },
    { id: 'experiencia', label: tabLang.experiencia, icon: 'fa-briefcase' },
    { id: 'educacion', label: tabLang.educacion, icon: 'fa-graduation-cap' },
    { id: 'skills', label: tabLang.skills, icon: 'fa-sliders-h' }
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

  const isEn = convertedCvData.idioma === 'en';
  const lang = isEn ? locales.en : locales.es;

  container.innerHTML = '';

  if (activeTab === 'contacto') {
    container.innerHTML = `
      <div class="conv_form_grid">
        <div class="conv_field">
          <label>${lang.contacto.nombre}</label>
          <input type="text" id="in_nombre" value="${convertedCvData.nombre || ''}" placeholder="${lang.contacto.placeholderNombre}" required />
        </div>
        <div class="conv_field">
          <label>${lang.contacto.titulo}</label>
          <input type="text" id="in_titulo" value="${convertedCvData.titulo || ''}" placeholder="${lang.contacto.placeholderTitulo}" required />
        </div>
        <div class="conv_field">
          <label>${lang.contacto.email}</label>
          <input type="email" id="in_email" value="${convertedCvData.email || ''}" placeholder="${lang.contacto.placeholderEmail}" required />
        </div>
        <div class="conv_field">
          <label>${lang.contacto.telefono}</label>
          <input type="tel" id="in_telefono" value="${convertedCvData.telefono || ''}" placeholder="${lang.contacto.placeholderTelefono}" required />
        </div>
        <div class="conv_field">
          <label>${lang.contacto.ubicacion}</label>
          <input type="text" id="in_ubicacion" value="${convertedCvData.ubicacion || ''}" placeholder="${lang.contacto.placeholderUbicacion}" required />
        </div>
        <div class="conv_field">
          <label>${lang.contacto.linkedin}</label>
          <input type="url" id="in_linkedin" value="${convertedCvData.linkedin || ''}" placeholder="${lang.contacto.placeholderLinkedin}" />
        </div>
        <div class="conv_field">
          <label>${lang.contacto.web}</label>
          <input type="url" id="in_web" value="${convertedCvData.web || ''}" placeholder="${lang.contacto.placeholderWeb}" />
        </div>
        <div class="conv_field">
          <label>${lang.contacto.idioma}</label>
          <select id="in_idioma" class="conv_select">
            <option value="es" ${convertedCvData.idioma === 'es' ? 'selected' : ''}>Español</option>
            <option value="en" ${convertedCvData.idioma === 'en' ? 'selected' : ''}>English</option>
          </select>
        </div>
        
        <!-- Sección de Foto -->
        <div class="conv_field full_width conv_photo_section">
          <div class="conv_toggle_row">
            <span class="conv_toggle_label">
              <i class="fas fa-camera"></i> ${lang.contacto.incluirFoto}
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
                <button type="button" class="conv_btn_small" id="btnSelectFoto"><i class="fas fa-upload"></i> ${lang.contacto.subirFoto}</button>
                <span class="conv_small_help">${lang.contacto.fotoHelp}</span>
              </div>
            </div>
            <div class="conv_warning_badge" id="photoWarningBtn" data-witip="Muchos filtros ATS automáticos de reclutamiento no procesan imágenes y pueden descartar o corromper tu CV al intentar leerlo. Se recomienda no usar foto para vacantes internacionales o tecnológicas." data-wtipo="warning" data-wtiempo="6000">
              <i class="fas fa-exclamation-triangle"></i> ${lang.contacto.fotoWarning}
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

    // Bind text fields
    ['nombre', 'titulo', 'email', 'telefono', 'ubicacion', 'linkedin', 'web'].forEach(field => {
      const input = document.getElementById(`in_${field}`);
      input?.addEventListener('input', () => {
        convertedCvData[field] = input.value;
        updateA4Preview();
      });
    });

    // Bind idioma select
    const idiomaSelect = document.getElementById('in_idioma');
    idiomaSelect?.addEventListener('change', () => {
      convertedCvData.idioma = idiomaSelect.value;
      renderTabs();
      renderFormContent();
      updateA4Preview();
    });

  } else if (activeTab === 'perfil') {
    container.innerHTML = `
      <div class="conv_field full_width">
        <label>${lang.perfil.titulo}</label>
        <textarea id="in_resumen" rows="8" placeholder="${lang.perfil.placeholder}" required>${convertedCvData.resumen || ''}</textarea>
        <span class="conv_char_counter" id="lbl_resumen_counter">${(convertedCvData.resumen || '').length} ${lang.perfil.caracteres}</span>
      </div>
    `;

    const txt = document.getElementById('in_resumen');
    txt?.addEventListener('input', () => {
      convertedCvData.resumen = txt.value;
      const counter = document.getElementById('lbl_resumen_counter');
      if (counter) counter.textContent = `${txt.value.length} ${lang.perfil.caracteres}`;
      updateA4Preview();
    });

  } else if (activeTab === 'experiencia') {
    renderExperienciasForm(container);

  } else if (activeTab === 'educacion') {
    renderEducacionForm(container);

  } else if (activeTab === 'skills') {
    container.innerHTML = `
      <div class="conv_field full_width">
        <label>${lang.skills.titulo}</label>
        <input type="text" id="in_skills" value="${convertedCvData.skills || ''}" placeholder="${lang.skills.placeholder}" required />
      </div>
      <div class="conv_field full_width conv_section_spacer">
        <div class="conv_header_row">
          <label>${lang.skills.idiomas}</label>
          <button type="button" class="conv_btn_small" id="btnAddLanguage"><i class="fas fa-plus"></i> ${lang.skills.agregarIdioma}</button>
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
      convertedCvData.idiomas.push(isEn ? 'Language - Level' : 'Idioma - Nivel');
      renderLanguages();
      updateA4Preview();
    });
  }

  // Ejecutar validación visual al cargar cada pestaña
  validarFormularios();
};

const renderAchievementsInputs = (container, exp, expIdx, renderList) => {
  let achievements = (exp.logros || '')
    .split('\n')
    .map(line => line.replace(/^[-\*\•\s]+/, '').trim());

  while (achievements.length < 3) {
    achievements.push('');
  }

  container.innerHTML = `
    <div class="cr_achievements_list" style="display:flex; flex-direction:column; gap:1vh; width:100%;">
      ${achievements.map((ach, idx) => `
        <div class="cr_achievement_item" style="display:flex; gap:1vh; align-items:center; width:100%;">
          <span style="font-size:1.2rem; color:var(--tx2);">&bull;</span>
          <input type="text" class="cr_achievement_input" value="${ach.replace(/"/g, '&quot;')}" placeholder="Logro o función #${idx + 1}" style="flex:1;" />
          <button type="button" class="conv_btn_danger_small btn_del_achievement" data-idx="${idx}" style="padding:0.8vh 1vh;" title="Eliminar viñeta">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `).join('')}
      <button type="button" class="conv_btn_small btn_add_achievement" style="align-self:flex-start; margin-top:0.5vh;">
        <i class="fas fa-plus"></i> Agregar logro
      </button>
    </div>
  `;

  const inputs = container.querySelectorAll('.cr_achievement_input');
  const updateState = () => {
    const newAchievements = [];
    container.querySelectorAll('.cr_achievement_input').forEach(inp => {
      newAchievements.push(inp.value.trim());
    });
    let cleanList = [...newAchievements];
    while (cleanList.length > 0 && !cleanList[cleanList.length - 1]) {
      cleanList.pop();
    }
    convertedCvData.experiencias[expIdx].logros = cleanList.join('\n');
    updateA4Preview();
  };

  inputs.forEach(input => {
    input.addEventListener('input', () => {
      updateState();
    });
  });

  container.querySelectorAll('.btn_del_achievement').forEach(btn => {
    btn.addEventListener('click', () => {
      const deleteIdx = parseInt(btn.getAttribute('data-idx'));
      achievements.splice(deleteIdx, 1);
      while (achievements.length < 3) {
        achievements.push('');
      }
      convertedCvData.experiencias[expIdx].logros = achievements.join('\n');
      renderList();
      updateA4Preview();
    });
  });

  container.querySelector('.btn_add_achievement').addEventListener('click', () => {
    achievements.push('');
    convertedCvData.experiencias[expIdx].logros = achievements.join('\n');
    renderList();
    updateA4Preview();
  });
};

const renderExperienciasForm = (container) => {
  const isEn = convertedCvData.idioma === 'en';
  const lang = isEn ? locales.en.experiencia : locales.es.experiencia;

  container.innerHTML = `
    <div class="conv_header_row conv_form_header_row">
      <h3>${lang.titulo}</h3>
      <button type="button" class="conv_btn_small" id="btnAddExp"><i class="fas fa-plus"></i> ${lang.agregar}</button>
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
          <h4>${lang.puestoNum} #${idx + 1}</h4>
          ${convertedCvData.experiencias.length > 1 ? `<button class="conv_btn_danger_small btn_del_exp" data-id="${exp.id}"><i class="fas fa-trash"></i> ${lang.eliminar}</button>` : ''}
        </div>
        <div class="conv_form_grid">
          <div class="conv_field">
            <label>${lang.cargo}</label>
            <input type="text" class="exp_puesto" value="${exp.puesto || ''}" placeholder="${lang.placeholderCargo}" required />
          </div>
          <div class="conv_field">
            <label>${lang.empresa}</label>
            <input type="text" class="exp_empresa" value="${exp.empresa || ''}" placeholder="${lang.placeholderEmpresa}" required />
          </div>
          <div class="conv_field">
            <label>${lang.ubicacion}</label>
            <input type="text" class="exp_ubicacion" value="${exp.ubicacion || ''}" placeholder="${lang.placeholderUbicacion}" />
          </div>
          <div class="conv_field">
            <label>${lang.inicio}</label>
            <input type="text" class="exp_inicio" value="${exp.inicio || ''}" placeholder="${lang.placeholderInicio}" required />
          </div>
          <div class="conv_field">
            <label>${lang.fin}</label>
            <input type="text" class="exp_fin" value="${exp.fin || ''}" placeholder="${lang.placeholderFin}" required />
          </div>
          <div class="conv_field full_width">
            <label style="margin-bottom: 1vh; display: block;">${lang.logros}</label>
            <div class="cr_logros_inputs_container" style="width: 100%;"></div>
          </div>
        </div>
      `;
      expListContainer.appendChild(card);

      const logrosContainer = card.querySelector('.cr_logros_inputs_container');
      if (logrosContainer) {
        renderAchievementsInputs(logrosContainer, exp, idx, renderList);
      }
    });

    // Bind fields dynamically
    expListContainer.querySelectorAll('.conv_item_card').forEach(card => {
      const id = card.dataset.id;
      const index = convertedCvData.experiencias.findIndex(e => e.id === id);
      if (index === -1) return;

      const fields = ['puesto', 'empresa', 'ubicacion', 'inicio', 'fin'];
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
  const isEn = convertedCvData.idioma === 'en';
  const lang = isEn ? locales.en.educacion : locales.es.educacion;

  container.innerHTML = `
    <div class="conv_header_row conv_form_header_row">
      <h3>${lang.titulo}</h3>
      <button type="button" class="conv_btn_small" id="btnAddEdu"><i class="fas fa-plus"></i> ${lang.agregar}</button>
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
          <h4>${lang.estudioNum} #${idx + 1}</h4>
          ${convertedCvData.educacion.length > 1 ? `<button class="conv_btn_danger_small btn_del_edu" data-id="${edu.id}"><i class="fas fa-trash"></i> ${lang.eliminar}</button>` : ''}
        </div>
        <div class="conv_form_grid">
          <div class="conv_field">
            <label>${lang.institucion}</label>
            <input type="text" class="edu_institucion" value="${edu.institucion || ''}" placeholder="${lang.placeholderInstitucion}" required />
          </div>
          <div class="conv_field">
            <label>${lang.grado}</label>
            <input type="text" class="edu_grado" value="${edu.grado || ''}" placeholder="${lang.placeholderGrado}" required />
          </div>
          <div class="conv_field">
            <label>${lang.ubicacion}</label>
            <input type="text" class="edu_ubicacion" value="${edu.ubicacion || ''}" placeholder="${lang.placeholderUbicacion}" />
          </div>
          <div class="conv_field">
            <label>${lang.inicio}</label>
            <input type="text" class="edu_inicio" value="${edu.inicio || ''}" placeholder="${lang.placeholderInicio}" required />
          </div>
          <div class="conv_field">
            <label>${lang.fin}</label>
            <input type="text" class="edu_fin" value="${edu.fin || ''}" placeholder="${lang.placeholderFin}" required />
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

  const isEn = convertedCvData.idioma === 'en';
  const lang = isEn ? locales.en.skills : locales.es.skills;

  container.innerHTML = '';
  if (convertedCvData.idiomas.length === 0) {
    container.innerHTML = `<span class="conv_small_help">${lang.noIdiomas}</span>`;
    return;
  }

  convertedCvData.idiomas.forEach((langVal, idx) => {
    const row = document.createElement('div');
    row.className = 'conv_lang_row';
    row.innerHTML = `
      <input type="text" class="in_lang_value" value="${langVal || ''}" placeholder="${lang.placeholderIdioma}" />
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

const guardarEnCache = () => {
  try {
    const activeKey = localStorage.getItem('convertir_ats_active_key');
    if (activeKey) {
      localStorage.setItem(activeKey, JSON.stringify(convertedCvData));
    }
  } catch (e) {
    console.error('Error al guardar en caché local:', e);
  }
};

const validarFormularios = () => {
  // Validar Nombre
  const inNombre = document.getElementById('in_nombre');
  if (inNombre) {
    const val = inNombre.value.trim();
    inNombre.className = '';
    if (!val) {
      inNombre.classList.add('val_error');
    } else {
      inNombre.classList.add('val_success');
    }
  }

  // Validar Cargo/Título
  const inTitulo = document.getElementById('in_titulo');
  if (inTitulo) {
    const val = inTitulo.value.trim();
    inTitulo.className = '';
    if (!val) {
      inTitulo.classList.add('val_warning');
    } else {
      inTitulo.classList.add('val_success');
    }
  }

  // Validar Correo
  const inEmail = document.getElementById('in_email');
  if (inEmail) {
    const val = inEmail.value.trim();
    inEmail.className = '';
    if (!val) {
      inEmail.classList.add('val_error');
    } else {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (re.test(val)) {
        inEmail.classList.add('val_success');
      } else {
        inEmail.classList.add('val_error');
      }
    }
  }

  // Validar Teléfono
  const inTelefono = document.getElementById('in_telefono');
  if (inTelefono) {
    const val = inTelefono.value.trim();
    inTelefono.className = '';
    if (!val) {
      inTelefono.classList.add('val_warning');
    } else {
      inTelefono.classList.add('val_success');
    }
  }

  // Validar Ubicación
  const inUbicacion = document.getElementById('in_ubicacion');
  if (inUbicacion) {
    const val = inUbicacion.value.trim();
    inUbicacion.className = '';
    if (!val) {
      inUbicacion.classList.add('val_warning');
    } else {
      inUbicacion.classList.add('val_success');
    }
  }

  // Validar LinkedIn
  const inLinkedin = document.getElementById('in_linkedin');
  if (inLinkedin) {
    const val = inLinkedin.value.trim();
    inLinkedin.className = '';
    if (val) {
      if (val.startsWith('https://linkedin.com/') || val.startsWith('https://www.linkedin.com/')) {
        inLinkedin.classList.add('val_success');
      } else {
        inLinkedin.classList.add('val_warning');
      }
    }
  }

  // Validar Sitio Web
  const inWeb = document.getElementById('in_web');
  if (inWeb) {
    const val = inWeb.value.trim();
    inWeb.className = '';
    if (val) {
      if (val.startsWith('http://') || val.startsWith('https://')) {
        inWeb.classList.add('val_success');
      } else {
        inWeb.classList.add('val_warning');
      }
    }
  }

  // Validar Resumen / Perfil
  const inResumen = document.getElementById('in_resumen');
  if (inResumen) {
    const val = inResumen.value.trim();
    inResumen.className = 'conv_field conv_raw_textarea';
    if (!val) {
      inResumen.classList.add('val_error');
    } else if (val.length < 50) {
      inResumen.classList.add('val_warning');
    } else {
      inResumen.classList.add('val_success');
    }
  }

  // Validar Habilidades
  const inSkills = document.getElementById('in_skills');
  if (inSkills) {
    const val = inSkills.value.trim();
    inSkills.className = '';
    if (!val) {
      inSkills.classList.add('val_error');
    } else {
      inSkills.classList.add('val_success');
    }
  }
};

export const updateA4Preview = () => {
  const printableArea = document.getElementById('convPreviewA4');
  if (!printableArea) return;

  const isEn = convertedCvData.idioma === 'en';

  const textPerfil = isEn ? 'Professional Summary' : 'Perfil Profesional';
  const textExperiencia = isEn ? 'Work Experience' : 'Experiencia Laboral';
  const textEducacion = isEn ? 'Education' : 'Educación';
  const textSkills = isEn ? 'Skills & Languages' : 'Habilidades e Idiomas';
  const textSkillsLabel = isEn ? 'Skills' : 'Habilidades';
  const textIdiomasLabel = isEn ? 'Languages' : 'Idiomas';
  const textPresente = isEn ? 'Present' : 'Presente';

  // Header Contact Section
  const contacts = [];
  if (convertedCvData.email) contacts.push(`<span><i class="fas fa-envelope"></i> ${convertedCvData.email}</span>`);
  if (convertedCvData.telefono) contacts.push(`<span><i class="fas fa-phone"></i> ${convertedCvData.telefono}</span>`);
  if (convertedCvData.ubicacion) contacts.push(`<span><i class="fas fa-location-dot"></i> ${convertedCvData.ubicacion}</span>`);
  if (convertedCvData.linkedin) contacts.push(`<span><i class="fab fa-linkedin"></i> ${convertedCvData.linkedin}</span>`);
  if (convertedCvData.web) contacts.push(`<span><i class="fas fa-globe"></i> ${convertedCvData.web}</span>`);

  const contactsHTML = contacts.join(' &bull; ');

  // 1. Header Block
  const headerHTML = `
    <div class="cr_cv_header ${convertedCvData.incluirFoto && convertedCvData.fotoBase64 ? 'has_avatar' : ''}" data-click-tab="contacto">
      <div class="cr_cv_header_text">
        <h1 class="cr_cv_name cr_prev_editable" data-edit-field="nombre">${convertedCvData.nombre || 'Nombre Completo'}</h1>
        <div class="cr_cv_title cr_prev_editable" data-edit-field="titulo">${convertedCvData.titulo || 'Título o Profesión'}</div>
        <div class="cr_cv_contact">${contactsHTML || 'Email &bull; Teléfono &bull; Ubicación'}</div>
      </div>
      ${convertedCvData.incluirFoto && convertedCvData.fotoBase64 ? `
        <div class="ats_a4_avatar">
          <img src="${convertedCvData.fotoBase64}" />
        </div>
      ` : ''}
    </div>
  `;

  const blocks = [{ html: headerHTML, type: 'header' }];

  // 2. Summary Block
  if (convertedCvData.resumen) {
    const summaryHTML = `
      <div class="cr_cv_section" data-click-tab="perfil">
        <h2 class="cr_cv_section_title">${textPerfil}</h2>
        <p class="cr_cv_text cr_prev_editable" data-edit-field="resumen">${convertedCvData.resumen}</p>
      </div>
    `;
    blocks.push({ html: summaryHTML, type: 'summary' });
  }

  // 3. Experience Blocks
  const hasExp = convertedCvData.experiencias && convertedCvData.experiencias.some(exp => exp.puesto || exp.empresa);
  if (hasExp) {
    const expTitleHTML = `
      <h2 class="cr_cv_section_title" data-click-tab="experiencia" style="margin-bottom: 8px !important;">${textExperiencia}</h2>
    `;
    blocks.push({ html: expTitleHTML, type: 'section_title' });

    convertedCvData.experiencias.forEach(exp => {
      if (!exp.puesto && !exp.empresa) return;

      const achievements = (exp.logros || '')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map((line, liIdx) => {
          const cleanLine = line.replace(/^[-\*\•\s]+/, '').trim();
          return `<li class="cr_prev_editable" data-edit-field="exp_logro" data-exp-id="${exp.id}" data-logro-idx="${liIdx}">${cleanLine}</li>`;
        })
        .join('');

      const itemHTML = `
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
      `;
      blocks.push({ html: itemHTML, type: 'item' });
    });
  }

  // 4. Education Blocks
  const hasEdu = convertedCvData.educacion && convertedCvData.educacion.some(edu => edu.grado || edu.institucion);
  if (hasEdu) {
    const eduTitleHTML = `
      <h2 class="cr_cv_section_title" data-click-tab="educacion" style="margin-bottom: 8px !important;">${textEducacion}</h2>
    `;
    blocks.push({ html: eduTitleHTML, type: 'section_title' });

    convertedCvData.educacion.forEach(edu => {
      if (!edu.grado && !edu.institucion) return;

      const itemHTML = `
        <div class="cr_cv_item" data-click-tab="educacion">
          <div class="cr_cv_item_row">
            <strong class="cr_prev_editable" data-edit-field="edu_grado" data-edu-id="${edu.id}">${edu.grado || 'Grado obtenido / Estudio'}</strong>
            <span>${edu.inicio || ''} – ${edu.fin || ''}</span>
          </div>
          <div class="cr_cv_item_subrow">
            <span class="cr_prev_editable" data-edit-field="edu_institucion" data-edu-id="${edu.id}">${edu.institucion || 'Institución'}</span>
            <span class="cr_prev_editable" data-edit-field="edu_ubicacion" data-edu-id="${edu.id}">${edu.ubicacion || ''}</span>
          </div>
        </div>
      `;
      blocks.push({ html: itemHTML, type: 'item' });
    });
  }

  // 5. Skills Block
  if (convertedCvData.skills) {
    const skillsHTML = `
      <div class="cr_cv_section" data-click-tab="skills">
        <h2 class="cr_cv_section_title">${textSkills}</h2>
        <div class="cr_cv_skills_grid">
          <div>
            <strong>${textSkillsLabel}:</strong>
            <span class="cr_prev_editable" data-edit-field="skills">${convertedCvData.skills}</span>
          </div>
          ${convertedCvData.idiomas.length > 0 ? `
            <div class="cr_cv_skills_subrow">
              <strong>${textIdiomasLabel}:</strong>
              <span>${convertedCvData.idiomas.filter(Boolean).join(', ')}</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
    blocks.push({ html: skillsHTML, type: 'skills' });
  }

  // Setup/get temporary measurer to compute exact block heights
  let tempDiv = document.getElementById('convTempMeasurer');
  if (!tempDiv) {
    tempDiv = document.createElement('div');
    tempDiv.id = 'convTempMeasurer';
    tempDiv.style.position = 'absolute';
    tempDiv.style.visibility = 'hidden';
    tempDiv.style.top = '-9999px';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = '794px'; // Matches page pixel width
    document.body.appendChild(tempDiv);
  }
  tempDiv.innerHTML = `<div class="cr_cv_document" style="width: 794px !important; padding: 38px 45px !important; box-sizing: border-box; height: auto !important; box-shadow: none; border: none; display: flex; flex-direction: column; gap: 15px;"></div>`;
  const tempDoc = tempDiv.firstChild;

  const measureBlock = (html) => {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.gap = '15px';
    wrapper.innerHTML = html;
    tempDoc.appendChild(wrapper);
    const h = wrapper.offsetHeight;
    tempDoc.removeChild(wrapper);
    return h;
  };

  // Paginate blocks dynamically
  const pages = [[]];
  let currentPageHeight = 0;
  const MAX_CONTENT_HEIGHT = 1040; // 1122.5px - 76px padding (38px * 2)

  blocks.forEach((block) => {
    const blockHeight = measureBlock(block.html);
    let newHeight = currentPageHeight;
    if (currentPageHeight > 0) {
      newHeight += 15 + blockHeight; // Add flex gap of 15px
    } else {
      newHeight = blockHeight;
    }

    if (newHeight <= MAX_CONTENT_HEIGHT || currentPageHeight === 0) {
      pages[pages.length - 1].push(block);
      currentPageHeight = newHeight;
    } else {
      // Prevent orphaned section titles
      const currentPageBlocks = pages[pages.length - 1];
      if (currentPageBlocks.length > 0 && currentPageBlocks[currentPageBlocks.length - 1].type === 'section_title') {
        const orphanedTitle = currentPageBlocks.pop();
        // Recalculate remaining page height
        currentPageHeight = 0;
        currentPageBlocks.forEach((b, idx) => {
          const h = measureBlock(b.html);
          if (idx > 0) currentPageHeight += 15 + h;
          else currentPageHeight = h;
        });

        // Start new page with orphaned title + current block
        pages.push([orphanedTitle, block]);
        const titleHeight = measureBlock(orphanedTitle.html);
        currentPageHeight = titleHeight + 15 + blockHeight;
      } else {
        // Normal split, start new page
        pages.push([block]);
        currentPageHeight = blockHeight;
      }
    }
  });

  // Render pages physically into preview pane
  let pagesHTML = '';
  pages.forEach((pageBlocks, index) => {
    const isFirst = index === 0;
    const pageClass = isFirst ? 'cr_cv_document cr_cv_page' : 'cr_cv_document cr_cv_page cr_cv_page_next';
    const pageContentHTML = pageBlocks.map(b => b.html).join('\n');

    pagesHTML += `
      <div class="${pageClass}">
        ${pageContentHTML}
      </div>
    `;
  });

  printableArea.innerHTML = pagesHTML;

  // Inicializar edición directa en el preview (WYSIWYG)
  // Para convertir, getCvData y updateCvData trabajan sobre convertedCvData
  initEditablePreview(
    printableArea,
    () => JSON.parse(JSON.stringify(convertedCvData)),
    (data) => { Object.assign(convertedCvData, data); guardarEnCache(); },
    () => validarFormularios()
  );

  // Guardar en la caché local persistente única del CV activo
  guardarEnCache();

  // Validar visualmente los campos del formulario en tiempo real
  validarFormularios();
};

const closeDropdown = () => {
  const downloadMenu = document.getElementById('convDownloadMenu');
  const dropdownToggle = document.getElementById('convBtnDownloadToggle');
  if (downloadMenu) downloadMenu.classList.remove('show');
  if (dropdownToggle) dropdownToggle.setAttribute('aria-expanded', 'false');
};

const addSafeListener = (id, event, callback) => {
  const el = document.getElementById(id);
  if (el) {
    if (el.dataset.listenerAttached === 'true') {
      return;
    }
    el.dataset.listenerAttached = 'true';
    el.addEventListener(event, callback);
  }
};

const setupGlobalListeners = () => {
  // Configurar botón principal de PDF (Descargar directamente)
  addSafeListener('convBtnPrint', 'click', () => {
    descargarPdfDirecto(convertedCvData);
  });

  // Botón de descarga directa en el dropdown
  addSafeListener('convBtnDownloadPdfDirect', 'click', () => {
    descargarPdfDirecto(convertedCvData);
    closeDropdown();
  });

  // Botón de impresión nativa en el dropdown (Recomendado ATS)
  addSafeListener('convBtnPrintNative', 'click', () => {
    imprimirPdf();
    closeDropdown();
  });

  // Alternar el menú desplegable de descargas
  addSafeListener('convBtnDownloadToggle', 'click', (e) => {
    e.stopPropagation();
    const downloadMenu = document.getElementById('convDownloadMenu');
    const dropdownToggle = document.getElementById('convBtnDownloadToggle');
    if (downloadMenu && dropdownToggle) {
      const isShown = downloadMenu.classList.contains('show');
      if (!isShown) {
        downloadMenu.classList.add('show');
        dropdownToggle.setAttribute('aria-expanded', 'true');
      } else {
        closeDropdown();
      }
    }
  });

  // Conectar acciones de descarga
  addSafeListener('convBtnDownloadDocx', 'click', () => {
    descargarDocx(convertedCvData);
    closeDropdown();
  });

  addSafeListener('convBtnDownloadTxt', 'click', () => {
    descargarTxt(convertedCvData);
    closeDropdown();
  });

  addSafeListener('convBtnDownloadMd', 'click', () => {
    descargarMd(convertedCvData);
    closeDropdown();
  });

  addSafeListener('convBtnDownloadJson', 'click', () => {
    descargarJson(convertedCvData);
    closeDropdown();
  });

  // Cerrar menú al hacer clic fuera del dropdown
  if (!document._hasDropdownCloseListener) {
    document._hasDropdownCloseListener = true;
    document.addEventListener('click', (e) => {
      const target = e.target;
      if (target instanceof Element) {
        const isInsideDropdown = target.closest('.conv_download_dropdown');
        if (!isInsideDropdown) {
          closeDropdown();
        }
      }
    });
  }

  // Sincronizar clics en la vista previa del CV con las pestañas del formulario
  const printableArea = document.getElementById('convPreviewA4');
  if (printableArea) {
    printableArea.addEventListener('click', (event) => {
      const target = event.target.closest('[data-click-tab]');
      if (target) {
        const tabId = target.getAttribute('data-click-tab');
        if (tabId && tabId !== activeTab) {
          activeTab = tabId;
          renderTabs();
          renderFormContent();
        }
      }
    });
  }
};
