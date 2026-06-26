// src/lib/crear/visual.js
// Controlador Visual y de Eventos para el Creador de CV ATS

import { 
  getCvData, 
  updateCvData, 
  loadFromLocalStorage, 
  resetCvData, 
  subscribe, 
  crearEstructuraExp, 
  crearEstructuraEdu 
} from './estado.js';

import { 
  optimizarLogroConIA, 
  sugerirHabilidadesConIA, 
  estructurarCvConIA,
  optimizarCvCompletoConIA
} from './wiibot.js';

import { auditarCvAts } from './auditor.js';

import { 
  descargarPdfDirecto, 
  imprimirPdf, 
  descargarDocx, 
  descargarTxt, 
  descargarMd, 
  descargarJson 
} from './descarga/descargas.js';

import { Notificacion, wiSmart, abrirModal, cerrarModal } from '../widev.js';

let activeTab = 'contacto';

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
      fotoWarning: 'La foto reduce la compatibilidad ATS.',
      placeholderNombre: 'Ej: Juan Pérez Gómez',
      placeholderTitulo: 'Ej: Ingeniero de Software / Administrador',
      placeholderEmail: 'Ej: juan.perez@email.com',
      placeholderTelefono: 'Ej: +34 600 000 000',
      placeholderUbicacion: 'Ej: Madrid, España',
      placeholderLinkedin: 'Ej: linkedin.com/in/juanperez',
      placeholderWeb: 'Ej: github.com/juanperez'
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
      placeholderUbicacion: 'Ej: Madrid, España',
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
      fotoWarning: 'A photo may reduce ATS compatibility.',
      placeholderNombre: 'e.g., John Doe',
      placeholderTitulo: 'e.g., Software Engineer / Manager',
      placeholderEmail: 'e.g., john.doe@email.com',
      placeholderTelefono: 'e.g., +34 600 000 000',
      placeholderUbicacion: 'e.g., Madrid, Spain',
      placeholderLinkedin: 'e.g., linkedin.com/in/johndoe',
      placeholderWeb: 'e.g., github.com/johndoe'
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
      placeholderUbicacion: 'e.g., Madrid, Spain',
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

export const initVisual = () => {
  // 1. Cargar estado inicial
  loadFromLocalStorage();

  // 2. Suscribirse a cambios del estado central
  subscribe(onStateChange);

  // 3. Registrar eventos globales una sola vez
  setupGlobalListeners();

  // Pre-cargar librerías de extracción inmediatamente para evitar race conditions
  cargarLibreriasExtraccion();
};

const cargarLibreriasExtraccion = () => {
  wiSmart({
    js: 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.11.0/mammoth.browser.min.js'
  });
  wiSmart({
    js: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
  });
};

const onStateChange = (cv) => {
  const activeEl = document.activeElement;
  const isTyping = activeEl && (
    activeEl.tagName === 'TEXTAREA' || 
    (activeEl.tagName === 'INPUT' && ['text', 'email', 'tel', 'url'].includes(activeEl.type))
  );

  if (!isTyping) {
    renderTabs(cv);
    renderFormContent(cv);
  } else {
    validarFormularios();
  }
  
  updateA4Preview(cv);
  updateScorecard(cv);
};

const renderTabs = (cv) => {
  const container = document.getElementById('crTabsHeader');
  if (!container) return;

  const isEn = cv.idioma === 'en';
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

  container.querySelectorAll('.conv_tab_btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      if (tabId) {
        activeTab = tabId;
        renderTabs(getCvData());
        renderFormContent(getCvData());
      }
    });
  });
};

const renderFormContent = (cv) => {
  const container = document.getElementById('crFormContent');
  if (!container) return;

  const isEn = cv.idioma === 'en';
  const lang = isEn ? locales.en : locales.es;

  container.innerHTML = '';

  if (activeTab === 'contacto') {
    container.innerHTML = `
      <div class="conv_form_grid">
        <div class="conv_field">
          <label>
            ${lang.contacto.nombre}
            <span class="cr_help_tip" data-witip="Pon tu nombre de pila y apellidos principales. Evita apodos o nombres artísticos."><i class="fas fa-question-circle"></i></span>
          </label>
          <input type="text" id="cr_inp_nombre" value="${cv.nombre || ''}" placeholder="${lang.contacto.placeholderNombre}" required />
        </div>
        <div class="conv_field">
          <label>
            ${lang.contacto.titulo}
            <span class="cr_help_tip" data-witip="El cargo al que aspiras o tu especialidad. Ayuda a que el reclutador te ubique rápidamente."><i class="fas fa-question-circle"></i></span>
          </label>
          <input type="text" id="cr_inp_titulo" value="${cv.titulo || ''}" placeholder="${lang.contacto.placeholderTitulo}" required />
        </div>
        <div class="conv_field">
          <label>
            ${lang.contacto.email}
            <span class="cr_help_tip" data-witip="Usa una dirección profesional (nombre.apellido@correo.com). Evita correos informales."><i class="fas fa-question-circle"></i></span>
          </label>
          <input type="email" id="cr_inp_email" value="${cv.email || ''}" placeholder="${lang.contacto.placeholderEmail}" required />
        </div>
        <div class="conv_field">
          <label>
            ${lang.contacto.telefono}
            <span class="cr_help_tip" data-witip="Tu número activo con código del país (ej: +34). Los reclutadores suelen llamar directo."><i class="fas fa-question-circle"></i></span>
          </label>
          <input type="tel" id="cr_inp_telefono" value="${cv.telefono || ''}" placeholder="${lang.contacto.placeholderTelefono}" required />
        </div>
        <div class="conv_field">
          <label>
            ${lang.contacto.ubicacion}
            <span class="cr_help_tip" data-witip="Ciudad y País actuales. Importante para filtros geográficos y ofertas locales."><i class="fas fa-question-circle"></i></span>
          </label>
          <input type="text" id="cr_inp_ubicacion" value="${cv.ubicacion || ''}" placeholder="${lang.contacto.placeholderUbicacion}" required />
        </div>
        <div class="conv_field">
          <label>
            ${lang.contacto.linkedin}
            <span class="cr_help_tip" data-witip="Enlace a tu perfil profesional. El 90% de los reclutadores lo consulta antes de llamar."><i class="fas fa-question-circle"></i></span>
          </label>
          <input type="url" id="cr_inp_linkedin" value="${cv.linkedin || ''}" placeholder="${lang.contacto.placeholderLinkedin}" />
        </div>
        <div class="conv_field">
          <label>
            ${lang.contacto.web}
            <span class="cr_help_tip" data-witip="Tu portfolio personal, web de proyectos o enlace de GitHub si eres técnico."><i class="fas fa-question-circle"></i></span>
          </label>
          <input type="url" id="cr_inp_web" value="${cv.web || ''}" placeholder="${lang.contacto.placeholderWeb}" />
        </div>
        <div class="conv_field">
          <label>${lang.contacto.idioma}</label>
          <select id="cr_inp_idioma" class="conv_select">
            <option value="es" ${cv.idioma === 'es' ? 'selected' : ''}>Español</option>
            <option value="en" ${cv.idioma === 'en' ? 'selected' : ''}>English</option>
          </select>
        </div>
        
        <!-- Sección de Foto -->
        <div class="conv_field full_width conv_photo_section">
          <div class="conv_toggle_row">
            <span class="conv_toggle_label">
              <i class="fas fa-camera"></i> ${lang.contacto.incluirFoto}
              <span class="cr_help_tip" data-witip="ATS Warning: En muchos mercados internacionales (EEUU, UK) y áreas tecnológicas, las fotos son penalizadas para evitar sesgos."><i class="fas fa-question-circle"></i></span>
            </span>
            <label class="conv_switch">
              <input type="checkbox" id="cr_inp_incluirFoto" ${cv.incluirFoto ? 'checked' : ''} />
              <span class="conv_slider"></span>
            </label>
          </div>
          
          <div id="crPhotoUploadArea" class="conv_photo_upload_area ${cv.incluirFoto ? 'active' : ''}">
            <div class="conv_photo_flex">
              <div class="conv_photo_preview_box" id="crPhotoPreviewBox">
                ${cv.fotoBase64 ? `<img src="${cv.fotoBase64}" class="conv_avatar_img" />` : '<i class="fas fa-user-circle"></i>'}
              </div>
              <div class="conv_photo_actions">
                <input type="file" id="cr_inp_fotoFile" accept="image/png, image/jpeg" class="dpn" />
                <button type="button" class="conv_btn_small" id="crBtnSelectFoto"><i class="fas fa-upload"></i> ${lang.contacto.subirFoto}</button>
                <span class="conv_small_help">${lang.contacto.fotoHelp}</span>
              </div>
            </div>
            <div class="conv_warning_badge" id="photoWarningBtn" data-witip="Los sistemas automáticos (ATS) no procesan imágenes y la foto reduce la compatibilidad en procesos tecnológicos internacionales." data-wtipo="warning">
              <i class="fas fa-exclamation-triangle"></i> ${lang.contacto.fotoWarning}
            </div>
          </div>
        </div>
      </div>
    `;

    // Eventos de foto
    const toggle = document.getElementById('cr_inp_incluirFoto');
    const uploadArea = document.getElementById('crPhotoUploadArea');
    const fileInput = document.getElementById('cr_inp_fotoFile');
    const selectBtn = document.getElementById('crBtnSelectFoto');

    toggle?.addEventListener('change', (e) => {
      const active = e.target.checked;
      updateCvData({ incluirFoto: active });
      if (active) uploadArea?.classList.add('active');
      else uploadArea?.classList.remove('active');
    });

    selectBtn?.addEventListener('click', () => fileInput?.click());

    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          Notificacion('La foto excede el límite de 2MB.', 'error');
          return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
          updateCvData({ fotoBase64: ev.target.result });
          const previewBox = document.getElementById('crPhotoPreviewBox');
          if (previewBox) {
            previewBox.innerHTML = `<img src="${ev.target.result}" class="conv_avatar_img" />`;
          }
        };
        reader.readAsDataURL(file);
      }
    });

    // Eventos de campos
    ['nombre', 'titulo', 'email', 'telefono', 'ubicacion', 'linkedin', 'web'].forEach(field => {
      const el = document.getElementById(`cr_inp_${field}`);
      el?.addEventListener('input', () => {
        updateCvData({ [field]: el.value });
      });
    });

    const idiomaSelect = document.getElementById('cr_inp_idioma');
    idiomaSelect?.addEventListener('change', () => {
      updateCvData({ idioma: idiomaSelect.value });
    });

  } else if (activeTab === 'perfil') {
    container.innerHTML = `
      <div class="conv_field full_width">
        <label>
          ${lang.perfil.titulo}
          <span class="cr_help_tip" data-witip="Un resumen profesional de 50 a 100 palabras ayuda al reclutador a entender tu perfil rápidamente."><i class="fas fa-question-circle"></i></span>
        </label>
        <textarea id="cr_inp_resumen" rows="8" placeholder="${lang.perfil.placeholder}" required>${cv.resumen || ''}</textarea>
        <span class="conv_char_counter" id="lbl_resumen_counter">${(cv.resumen || '').length} ${lang.perfil.caracteres}</span>
      </div>
    `;

    const txt = document.getElementById('cr_inp_resumen');
    txt?.addEventListener('input', () => {
      updateCvData({ resumen: txt.value });
      const counter = document.getElementById('lbl_resumen_counter');
      if (counter) counter.textContent = `${txt.value.length} ${lang.perfil.caracteres}`;
    });

  } else if (activeTab === 'experiencia') {
    renderExperienciasForm(container, cv);

  } else if (activeTab === 'educacion') {
    renderEducacionForm(container, cv);

  } else if (activeTab === 'skills') {
    container.innerHTML = `
      <div class="conv_field full_width">
        <label>
          ${lang.skills.titulo}
          <span class="cr_help_tip" data-witip="Palabras clave de tus tecnologías o conocimientos. Los sistemas ATS las buscan exactamente para calificarte. Sepáralas por comas."><i class="fas fa-question-circle"></i></span>
        </label>
        <input type="text" id="cr_inp_skills" value="${cv.skills || ''}" placeholder="${lang.skills.placeholder}" required />
        <div class="cr_ai_opt_trigger_bar">
          <button type="button" class="cr_btn_opt_ai" id="crBtnSugerirHabilidades">
            <i class="fas fa-sparkles"></i> Sugerir Habilidades con IA
          </button>
        </div>
      </div>
      <div class="conv_field full_width conv_section_spacer">
        <div class="conv_header_row">
          <label>
            ${lang.skills.idiomas}
            <span class="cr_help_tip" data-witip="Los idiomas multiplican tus opciones de selección en empresas internacionales."><i class="fas fa-question-circle"></i></span>
          </label>
          <button type="button" class="conv_btn_small" id="crBtnAddLanguage"><i class="fas fa-plus"></i> ${lang.skills.agregarIdioma}</button>
        </div>
        <div class="conv_languages_list" id="crLanguagesList">
          <!-- Render dinámico de idiomas -->
        </div>
      </div>
    `;

    const skillsInp = document.getElementById('cr_inp_skills');
    skillsInp?.addEventListener('input', () => {
      updateCvData({ skills: skillsInp.value });
    });

    renderLanguages(cv);

    document.getElementById('crBtnAddLanguage')?.addEventListener('click', () => {
      const isEn = cv.idioma === 'en';
      const list = [...cv.idiomas, isEn ? 'Language - Level' : 'Idioma - Nivel'];
      updateCvData({ idiomas: list });
    });

    document.getElementById('crBtnSugerirHabilidades')?.addEventListener('click', async () => {
      if (!cv.titulo) {
        Notificacion('Escribe un Título Profesional en la pestaña Contacto para sugerir habilidades.', 'warning');
        return;
      }
      const btn = document.getElementById('crBtnSugerirHabilidades');
      if (btn) btn.disabled = true;
      try {
        const sugeridas = await sugerirHabilidadesConIA(cv.titulo);
        updateCvData({ skills: sugeridas });
        Notificacion('Habilidades sugeridas cargadas con éxito.', 'success');
      } catch (e) {
        Notificacion('Error al conectar con la IA.', 'error');
      } finally {
        if (btn) btn.disabled = false;
      }
    });
  }

  // Ejecutar validaciones en los inputs
  validarFormularios();
};

const renderExperienciasForm = (container, cv) => {
  const isEn = cv.idioma === 'en';
  const lang = isEn ? locales.en.experiencia : locales.es.experiencia;

  container.innerHTML = `
    <div class="conv_header_row conv_form_header_row">
      <h3>${lang.titulo}</h3>
      <button type="button" class="conv_btn_small" id="crBtnAddExp"><i class="fas fa-plus"></i> ${lang.agregar}</button>
    </div>
    <div class="conv_list_items" id="crExpList">
      <!-- render list -->
    </div>
  `;

  const expListContainer = document.getElementById('crExpList');
  if (!expListContainer) return;

  const renderList = () => {
    expListContainer.innerHTML = '';
    cv.experiencias.forEach((exp, idx) => {
      const card = document.createElement('div');
      card.className = 'conv_item_card';
      card.dataset.id = exp.id;
      card.innerHTML = `
        <div class="conv_item_card_header">
          <h4>${lang.puestoNum} #${idx + 1}</h4>
          <div style="display: flex; gap: 1vh;">
            <button class="cr_btn_opt_ai btn_opt_exp_ai" data-id="${exp.id}"><i class="fas fa-sparkles"></i> Optimizar Logros IA</button>
            ${cv.experiencias.length > 1 ? `<button class="conv_btn_danger_small btn_del_exp" data-id="${exp.id}"><i class="fas fa-trash"></i> ${lang.eliminar}</button>` : ''}
          </div>
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
            <label>
              ${lang.logros}
              <span class="cr_help_tip" data-witip="Usa verbos de acción fuertes en primera persona e incluye números (ej: Reduje gastos en un 15%). Evita descripciones pasivas."><i class="fas fa-question-circle"></i></span>
            </label>
            <textarea class="exp_logros" rows="4" placeholder="${lang.placeholderLogros}" required>${exp.logros || ''}</textarea>
          </div>
        </div>
      `;
      expListContainer.appendChild(card);
    });

    // Binds
    expListContainer.querySelectorAll('.conv_item_card').forEach(card => {
      const id = card.dataset.id;
      const idx = cv.experiencias.findIndex(e => e.id === id);
      if (idx === -1) return;

      ['puesto', 'empresa', 'ubicacion', 'inicio', 'fin', 'logros'].forEach(field => {
        const el = card.querySelector(`.exp_${field}`);
        el?.addEventListener('input', () => {
          const list = [...cv.experiencias];
          list[idx][field] = el.value;
          updateCvData({ experiencias: list });
        });
      });
    });

    // Delete
    expListContainer.querySelectorAll('.btn_del_exp').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const list = cv.experiencias.filter(e => e.id !== id);
        updateCvData({ experiencias: list });
      });
    });

    // IA Optimization Trigger
    expListContainer.querySelectorAll('.btn_opt_exp_ai').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const exp = cv.experiencias.find(e => e.id === id);
        if (!exp || !exp.logros?.trim()) {
          Notificacion('Escribe algún logro/función en el puesto primero.', 'warning');
          return;
        }
        
        // Abrir modal de IA
        abrirModalIA(exp);
      });
    });
  };

  renderList();

  document.getElementById('crBtnAddExp')?.addEventListener('click', () => {
    const list = [...cv.experiencias, crearEstructuraExp()];
    updateCvData({ experiencias: list });
  });
};

const renderEducacionForm = (container, cv) => {
  const isEn = cv.idioma === 'en';
  const lang = isEn ? locales.en.educacion : locales.es.educacion;

  container.innerHTML = `
    <div class="conv_header_row conv_form_header_row">
      <h3>${lang.titulo}</h3>
      <button type="button" class="conv_btn_small" id="crBtnAddEdu"><i class="fas fa-plus"></i> ${lang.agregar}</button>
    </div>
    <div class="conv_list_items" id="crEduList">
      <!-- render list -->
    </div>
  `;

  const eduListContainer = document.getElementById('crEduList');
  if (!eduListContainer) return;

  const renderList = () => {
    eduListContainer.innerHTML = '';
    cv.educacion.forEach((edu, idx) => {
      const card = document.createElement('div');
      card.className = 'conv_item_card';
      card.dataset.id = edu.id;
      card.innerHTML = `
        <div class="conv_item_card_header">
          <h4>${lang.estudioNum} #${idx + 1}</h4>
          ${cv.educacion.length > 1 ? `<button class="conv_btn_danger_small btn_del_edu" data-id="${edu.id}"><i class="fas fa-trash"></i> ${lang.eliminar}</button>` : ''}
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

    // Binds
    eduListContainer.querySelectorAll('.conv_item_card').forEach(card => {
      const id = card.dataset.id;
      const idx = cv.educacion.findIndex(e => e.id === id);
      if (idx === -1) return;

      ['institucion', 'grado', 'ubicacion', 'inicio', 'fin'].forEach(field => {
        const el = card.querySelector(`.edu_${field}`);
        el?.addEventListener('input', () => {
          const list = [...cv.educacion];
          list[idx][field] = el.value;
          updateCvData({ educacion: list });
        });
      });
    });

    // Delete
    eduListContainer.querySelectorAll('.btn_del_edu').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const list = cv.educacion.filter(e => e.id !== id);
        updateCvData({ educacion: list });
      });
    });
  };

  renderList();

  document.getElementById('crBtnAddEdu')?.addEventListener('click', () => {
    const list = [...cv.educacion, crearEstructuraEdu()];
    updateCvData({ educacion: list });
  });
};

const renderLanguages = (cv) => {
  const container = document.getElementById('crLanguagesList');
  if (!container) return;

  const isEn = cv.idioma === 'en';
  const lang = isEn ? locales.en.skills : locales.es.skills;

  container.innerHTML = '';
  if (!cv.idiomas || cv.idiomas.length === 0) {
    container.innerHTML = `<span class="conv_small_help">${lang.noIdiomas}</span>`;
    return;
  }

  cv.idiomas.forEach((langVal, idx) => {
    const row = document.createElement('div');
    row.className = 'conv_lang_row';
    row.innerHTML = `
      <input type="text" class="in_lang_value" value="${langVal || ''}" placeholder="${lang.placeholderIdioma}" />
      <button type="button" class="conv_btn_icon_danger btn_del_lang" data-idx="${idx}"><i class="fas fa-trash-can"></i></button>
    `;
    container.appendChild(row);

    const input = row.querySelector('.in_lang_value');
    input?.addEventListener('input', () => {
      const list = [...cv.idiomas];
      list[idx] = input.value;
      updateCvData({ idiomas: list });
    });
  });

  container.querySelectorAll('.btn_del_lang').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx') || '0');
      const list = cv.idiomas.filter((_, i) => i !== idx);
      updateCvData({ idiomas: list });
    });
  });
};

const updateA4Preview = (cv) => {
  const printableArea = document.getElementById('cr_cv_printable_area');
  if (!printableArea) return;

  const isEn = cv.idioma === 'en';

  const textPerfil = isEn ? 'Professional Summary' : 'Perfil Profesional';
  const textExperiencia = isEn ? 'Work Experience' : 'Experiencia Laboral';
  const textEducacion = isEn ? 'Education' : 'Educación';
  const textSkills = isEn ? 'Skills & Languages' : 'Habilidades e Idiomas';
  const textSkillsLabel = isEn ? 'Skills' : 'Habilidades';
  const textIdiomasLabel = isEn ? 'Languages' : 'Idiomas';
  const textPresente = isEn ? 'Present' : 'Presente';

  // Contact HTML
  const contacts = [];
  if (cv.email) contacts.push(`<span><i class="fas fa-envelope"></i> ${cv.email}</span>`);
  if (cv.telefono) contacts.push(`<span><i class="fas fa-phone"></i> ${cv.telefono}</span>`);
  if (cv.ubicacion) contacts.push(`<span><i class="fas fa-location-dot"></i> ${cv.ubicacion}</span>`);
  if (cv.linkedin) contacts.push(`<span><i class="fab fa-linkedin"></i> ${cv.linkedin}</span>`);
  if (cv.web) contacts.push(`<span><i class="fas fa-globe"></i> ${cv.web}</span>`);

  const contactsHTML = contacts.join(' &bull; ');

  // --- SISTEMA DE BLOQUES PARA PAGINADO DINÁMICO ---
  const headerHTML = `
    <div class="cr_cv_header ${cv.incluirFoto && cv.fotoBase64 ? 'has_avatar' : ''}">
      <div class="cr_cv_header_text">
        <h1 class="cr_cv_name">${cv.nombre || 'Nombre Completo'}</h1>
        <div class="cr_cv_title">${cv.titulo || 'Título o Profesión'}</div>
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
    const summaryHTML = `
      <div class="cr_cv_section">
        <h2 class="cr_cv_section_title">${textPerfil}</h2>
        <p class="cr_cv_text">${cv.resumen}</p>
      </div>
    `;
    blocks.push({ html: summaryHTML, type: 'summary' });
  }

  // Experiencia
  const validExps = cv.experiencias?.filter(e => e.puesto?.trim() || e.empresa?.trim()) || [];
  if (validExps.length > 0) {
    const expTitleHTML = `<h2 class="cr_cv_section_title" style="margin-bottom: 8px !important;">${textExperiencia}</h2>`;
    blocks.push({ html: expTitleHTML, type: 'section_title' });

    validExps.forEach(exp => {
      const achievements = (exp.logros || '')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
          const cleanLine = line.replace(/^[-\*\•\s]+/, '').trim();
          return `<li>${cleanLine}</li>`;
        })
        .join('');

      const itemHTML = `
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
      `;
      blocks.push({ html: itemHTML, type: 'item' });
    });
  }

  // Educación
  const validEdus = cv.educacion?.filter(e => e.grado?.trim() || e.institucion?.trim()) || [];
  if (validEdus.length > 0) {
    const eduTitleHTML = `<h2 class="cr_cv_section_title" style="margin-bottom: 8px !important;">${textEducacion}</h2>`;
    blocks.push({ html: eduTitleHTML, type: 'section_title' });

    validEdus.forEach(edu => {
      const itemHTML = `
        <div class="cr_cv_item">
          <div class="cr_cv_item_row">
            <strong>${edu.grado || 'Grado / Certificación'}</strong>
            <span>${edu.inicio || ''} – ${edu.fin || ''}</span>
          </div>
          <div class="cr_cv_item_subrow">
            <span>${edu.institucion || 'Institución'}</span>
            <span>${edu.ubicacion || ''}</span>
          </div>
        </div>
      `;
      blocks.push({ html: itemHTML, type: 'item' });
    });
  }

  // Habilidades
  if (cv.skills || (cv.idiomas && cv.idiomas.length > 0)) {
    const skillsHTML = `
      <div class="cr_cv_section">
        <h2 class="cr_cv_section_title">${textSkills}</h2>
        <div class="cr_cv_skills_list">
          ${cv.skills ? `<p class="cr_cv_text"><strong>${textSkillsLabel}:</strong> ${cv.skills}</p>` : ''}
          ${cv.idiomas && cv.idiomas.length > 0 ? `<p class="cr_cv_text"><strong>${textIdiomasLabel}:</strong> ${cv.idiomas.filter(Boolean).join(', ')}</p>` : ''}
        </div>
      </div>
    `;
    blocks.push({ html: skillsHTML, type: 'skills' });
  }

  // --- MEDIDOR TEMPORAL INVISIBLE PARA CALCULAR ALTURAS ---
  let tempDiv = document.getElementById('crTempMeasurer');
  if (!tempDiv) {
    tempDiv = document.createElement('div');
    tempDiv.id = 'crTempMeasurer';
    tempDiv.style.cssText = 'position:absolute;visibility:hidden;top:-9999px;left:-9999px;width:794px;';
    document.body.appendChild(tempDiv);
  }
  tempDiv.innerHTML = `<div class="cr_cv_document" style="width:794px !important;padding:38px 45px !important;box-sizing:border-box;height:auto !important;box-shadow:none;border:none;display:flex;flex-direction:column;gap:15px;"></div>`;
  const tempDoc = tempDiv.firstChild;

  const measureBlock = (html) => {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:flex;flex-direction:column;gap:15px;';
    wrapper.innerHTML = html;
    tempDoc.appendChild(wrapper);
    const h = wrapper.offsetHeight;
    tempDoc.removeChild(wrapper);
    return h;
  };

  // --- PAGINADO DINÁMICO ---
  const pages = [[]];
  let currentPageHeight = 0;
  const MAX_CONTENT_HEIGHT = 1040; // 1122.5px A4 - 38px*2 padding

  blocks.forEach((block) => {
    const blockHeight = measureBlock(block.html);
    let newHeight = currentPageHeight > 0 ? currentPageHeight + 15 + blockHeight : blockHeight;

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
        const titleHeight = measureBlock(orphanedTitle.html);
        currentPageHeight = titleHeight + 15 + blockHeight;
      } else {
        pages.push([block]);
        currentPageHeight = blockHeight;
      }
    }
  });

  // --- RENDER DE PÁGINAS ---
  let pagesHTML = '';
  pages.forEach((pageBlocks, index) => {
    const isFirst = index === 0;
    const pageClass = isFirst ? 'cr_cv_document cr_cv_page' : 'cr_cv_document cr_cv_page cr_cv_page_next';
    const pageContentHTML = pageBlocks.map(b => b.html).join('\n');
    pagesHTML += `
      <div class="${pageClass}">
        ${pageContentHTML}
        <div class="cr_page_number">
          ${isEn ? 'Page' : 'Página'} ${index + 1} / ${pages.length}
        </div>
      </div>
    `;
  });

  printableArea.innerHTML = pagesHTML;
};

const updateScorecard = (cv) => {
  const { score, checklist } = auditarCvAts(cv);
  
  const scoreVal = document.getElementById('cr_score_val');
  const scoreFill = document.getElementById('cr_score_fill');
  const checkListContainer = document.getElementById('cr_checklist');

  if (scoreVal) scoreVal.textContent = score.toString();
  if (scoreFill) {
    scoreFill.style.width = `${score}%`;
    scoreFill.className = 'cr_progress_fill';
    if (score <= 60) scoreFill.style.background = 'var(--error)';
    else if (score <= 91) scoreFill.style.background = 'var(--warning)';
    else scoreFill.style.background = 'var(--success)';
  }

  if (checkListContainer) {
    let html = '';

    // Mostrar alertas del PDF subido (tablas, escaneo, etc.)
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
          <span>¡Currículum impecable y optimizado para ATS en un 100%!</span>
        </div>
      `;
    } else {
      html += checklist.map(item => {
        let icon = 'fa-info-circle';
        if (item.type === 'danger') icon = 'fa-circle-xmark';
        else if (item.type === 'warning') icon = 'fa-exclamation-triangle';
        
        return `
          <div class="cr_checklist_item ${item.type}">
            <i class="fas ${icon}"></i>
            <span>${item.text}</span>
          </div>
        `;
      }).join('');
    }

    checkListContainer.innerHTML = html;
  }
};

const setupGlobalListeners = () => {
  // Eventos de descargas
  document.getElementById('cr_btn_download_final')?.addEventListener('click', () => {
    const cv = getCvData();
    descargarPdfDirecto(cv);
  });

  document.getElementById('cr_btn_print')?.addEventListener('click', () => {
    imprimirPdf();
  });

  document.getElementById('cr_btn_dw_pdf')?.addEventListener('click', () => descargarPdfDirecto(getCvData()));
  document.getElementById('cr_btn_dw_docx')?.addEventListener('click', () => descargarDocx(getCvData()));
  document.getElementById('cr_btn_dw_txt')?.addEventListener('click', () => descargarTxt(getCvData()));
  document.getElementById('cr_btn_dw_md')?.addEventListener('click', () => descargarMd(getCvData()));
  document.getElementById('cr_btn_dw_json')?.addEventListener('click', () => descargarJson(getCvData()));

  // Evento reset con Modal Premium
  document.getElementById('cr_btn_reset_all')?.addEventListener('click', () => {
    abrirModal('cr_reset_modal');
  });
  document.getElementById('cr_btn_confirm_reset')?.addEventListener('click', () => {
    resetCvData();
    cerrarModal('cr_reset_modal');
    Notificacion('Se ha creado un nuevo currículum desde cero.', 'success');
  });
  document.getElementById('cr_btn_cancel_reset')?.addEventListener('click', () => {
    cerrarModal('cr_reset_modal');
  });
  document.getElementById('cr_btn_close_reset_modal')?.addEventListener('click', () => {
    cerrarModal('cr_reset_modal');
  });

  // Evento Optimizar Todo con Botwii
  document.getElementById('cr_btn_optimize_all')?.addEventListener('click', async () => {
    const cv = getCvData();
    const puesto = cv.titulo || '';
    const idioma = cv.idioma || 'es';

    const btn = document.getElementById('cr_btn_optimize_all');
    if (!btn) return;
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Optimizando...';

    try {
      const optimized = await optimizarCvCompletoConIA(cv, puesto, idioma);
      updateCvData(optimized);
      Notificacion('¡Currículum optimizado con Botwii exitosamente!', 'success');
    } catch (err) {
      console.error(err);
      Notificacion('No se pudo optimizar el currículum. Verifica tu conexión e intenta de nuevo.', 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  });

  // Modal de IA (Wiibot - Optimizar Logro)
  document.getElementById('cr_btn_discard_ai')?.addEventListener('click', closeAIModal);
  document.getElementById('cr_btn_close_modal')?.addEventListener('click', closeAIModal);
  document.getElementById('cr_btn_apply_ai')?.addEventListener('click', applyAIOptimization);

  // --- SUBIDA Y AUTOCOMPLETADO DE CV (PARSER) ---
  const uploadCvBtn = document.getElementById('cr_btn_upload_cv');
  const uploadCvInput = document.getElementById('cr_header_cv_file');

  uploadCvBtn?.addEventListener('click', () => {
    cargarLibreriasExtraccion();
    uploadCvInput?.click();
  });

  uploadCvInput?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.toLowerCase().endsWith('.docx');

    if (!isPdf && !isDocx) {
      Notificacion('Formato no válido. Solo se admiten archivos PDF y Word (.docx)', 'error');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      Notificacion('El archivo no debe superar los 4MB.', 'error');
      return;
    }

    // Mostrar loader en pantalla
    const loaderOverlay = document.createElement('div');
    loaderOverlay.className = 'cr_loader_overlay';
    loaderOverlay.innerHTML = `
      <div class="conv_loader">
        <div class="cr_loader_header_zone">
          <h3>Analizando tu CV actual...</h3>
          <p>Wiibot está leyendo tu archivo y estructurando tus datos en el editor.</p>
        </div>
        
        <div class="cr_loader_progress_bar_bg">
          <div id="cr_loader_progress_fill" class="cr_loader_progress_fill"></div>
        </div>
        
        <div class="cr_loader_steps">
          <div class="cr_loader_step active" id="cr_step_1">
            <span class="cr_loader_step_icon"><i class="fas fa-file-pdf"></i></span>
            <span class="cr_loader_step_text">Leyendo y decodificando archivo...</span>
            <span class="cr_loader_step_check"><i class="fas fa-check"></i></span>
          </div>
          <div class="cr_loader_step" id="cr_step_2">
            <span class="cr_loader_step_icon"><i class="fas fa-brain"></i></span>
            <span class="cr_loader_step_text">Extrayendo textos y secciones...</span>
            <span class="cr_loader_step_check"><i class="fas fa-check"></i></span>
          </div>
          <div class="cr_loader_step" id="cr_step_3">
            <span class="cr_loader_step_icon"><i class="fas fa-keyboard"></i></span>
            <span class="cr_loader_step_text">Estructurando datos en el editor...</span>
            <span class="cr_loader_step_check"><i class="fas fa-check"></i></span>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(loaderOverlay);

    const progressFill = loaderOverlay.querySelector('#cr_loader_progress_fill');
    const step1 = loaderOverlay.querySelector('#cr_step_1');
    const step2 = loaderOverlay.querySelector('#cr_step_2');
    const step3 = loaderOverlay.querySelector('#cr_step_3');

    const updateLoader = (percent, activeStep, doneSteps = []) => {
      if (progressFill) progressFill.style.width = `${percent}%`;
      
      const steps = [step1, step2, step3];
      steps.forEach((step, idx) => {
        if (!step) return;
        step.className = 'cr_loader_step';
        if (doneSteps.includes(idx + 1)) {
          step.classList.add('done');
        } else if (activeStep === idx + 1) {
          step.classList.add('active');
        }
      });
    };

    let progressTimer = null;

    try {
      updateLoader(15, 1, []);
      let parsedData = null;
      let pdfWarnings = [];
      const uploadLangEl = document.getElementById('cr_upload_lang');
      const uploadLang = uploadLangEl ? uploadLangEl.value : 'es';

      if (isPdf) {
        let extractedText = '';
        let usedGeminiMultimodal = false;
        
        try {
          const parseResult = await parsePdf(file);
          extractedText = parseResult.text || '';
        } catch (pdfjsErr) {
          console.warn('PDF.js client extraction failed, will fallback to Gemini Multimodal:', pdfjsErr);
        }

        updateLoader(50, 2, [1]);
        
        // Simular progreso del Gemini API en segundo plano
        let currentPercent = 50;
        progressTimer = setInterval(() => {
          if (currentPercent < 90) {
            currentPercent += 2;
            if (progressFill) progressFill.style.width = `${currentPercent}%`;
          }
        }, 300);

        // Si la extracción local saca menos de 100 caracteres, usamos Gemini Multimodal directamente (Híbrido)
        if (extractedText.trim().length < 100) {
          console.log('Hybrid: local extraction returned too few characters. Upgrading to Gemini Multimodal.');
          usedGeminiMultimodal = true;
          const base64 = await convertFileToBase64(file);
          parsedData = await estructurarCvConIA(base64, '', uploadLang, 'pdf');
          
          // Advertencia: el PDF probablemente tenía tablas o era escaneado
          pdfWarnings = [
            {
              type: 'tabla',
              text: 'Tu PDF anterior usaba tablas o columnas. Los escáneres ATS no pueden leer tablas correctamente: esto puede hacer que tu CV sea rechazado automáticamente en muchos sistemas. Revisa que tus datos estén bien cargados y usa el botón "Optimizar con Botwii" para mejorar el texto.'
            }
          ];
        } else {
          console.log('Hybrid: local extraction succeeded. Parsing extracted text.');
          parsedData = await estructurarCvConIA(extractedText, '', uploadLang, 'text');
        }
      } else {
        // Es un documento DOCX, usar Mammoth
        const parseResult = await parseDocx(file);
        if (!parseResult.text.trim()) {
          throw new Error('El archivo de Word está vacío.');
        }

        updateLoader(50, 2, [1]);

        let currentPercent = 50;
        progressTimer = setInterval(() => {
          if (currentPercent < 90) {
            currentPercent += 2;
            if (progressFill) progressFill.style.width = `${currentPercent}%`;
          }
        }, 300);

        parsedData = await estructurarCvConIA(parseResult.text, '', uploadLang, 'text');
      }

      if (progressTimer) clearInterval(progressTimer);

      if (!parsedData) {
        throw new Error('No se pudieron procesar los datos del currículum.');
      }

      updateLoader(100, 3, [1, 2, 3]);
      await new Promise(resolve => setTimeout(resolve, 500)); // Pausa para feedback visual

      // Guardar advertencias del PDF junto con los datos del CV
      parsedData._pdfWarnings = pdfWarnings;

      // Actualizar estado reactivo (SIN optimización automática, solo estructurado)
      updateCvData(parsedData);
      
      const msgExtra = pdfWarnings.length > 0 ? ' ⚠️ Revisa las alertas en el panel de compatibilidad.' : '';
      Notificacion(`¡CV cargado exitosamente! Revisa los campos y usa Botwii si deseas optimizarlo.${msgExtra}`, 'success', 6000);
    } catch (err) {
      console.error(err);
      if (progressTimer) clearInterval(progressTimer);
      Notificacion(err.message || 'Error al analizar e importar el CV.', 'error');
    } finally {
      loaderOverlay.remove();
      uploadCvInput.value = ''; // Reset input file
    }
  });
};

// --- HELPERS PARA PARSEAR ARCHIVOS ---
const awaitLibrary = (globalName, maxWaitMs = 5000) => {
  return new Promise((resolve, reject) => {
    if (window[globalName] || (globalName === 'pdfjsLib' && window['pdfjs-dist/build/pdf'])) {
      resolve(window[globalName] || window['pdfjs-dist/build/pdf']);
      return;
    }
    const start = Date.now();
    const timer = setInterval(() => {
      const lib = window[globalName] || window['pdfjs-dist/build/pdf'];
      if (lib) {
        clearInterval(timer);
        resolve(lib);
      } else if (Date.now() - start > maxWaitMs) {
        clearInterval(timer);
        reject(new Error(`La librería ${globalName} tardó demasiado en cargarse. Reintenta en unos segundos.`));
      }
    }, 100);
  });
};

const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64Data = (reader.result).split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = (e) => reject(e);
  });
};

const parseDocx = (file) => {
  console.log('parseDocx: Iniciando lectura de archivo Word:', file.name, file.size, 'bytes');
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const arrayBuffer = e.target.result;
      console.log('parseDocx: FileReader completado, arrayBuffer bytes:', arrayBuffer.byteLength);
      const mammothLib = window.mammoth;
      if (!mammothLib) {
        console.error('parseDocx: window.mammoth no existe en el cliente.');
        reject(new Error('Librería de Word no está cargada en el cliente. Intenta de nuevo en unos segundos.'));
        return;
      }
      mammothLib.extractRawText({ arrayBuffer })
        .then((res) => {
          console.log('parseDocx: Texto extraído por Mammoth, caracteres:', res.value ? res.value.length : 0);
          resolve({
            text: res.value || '',
            chars: res.value ? res.value.length : 0,
            bytesRead: arrayBuffer.byteLength
          });
        })
        .catch((err) => {
          console.error('parseDocx: Error en extractRawText de Mammoth:', err);
          reject(new Error('Falló Mammoth al extraer Word.'));
        });
    };

    reader.onerror = (err) => {
      console.error('parseDocx: Error en FileReader:', err);
      reject(new Error('Error de lectura del archivo Word.'));
    };

    reader.readAsArrayBuffer(file);
  });
};

const parsePdf = (file) => {
  console.log('parsePdf: Iniciando lectura de archivo PDF:', file.name, file.size, 'bytes');
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      const arrayBuffer = e.target.result;
      console.log('parsePdf: FileReader completado, arrayBuffer bytes:', arrayBuffer.byteLength);
      const pdfjsLib = window['pdfjs-dist/build/pdf'] || window.pdfjsLib;
      if (!pdfjsLib) {
        console.error('parsePdf: window.pdfjsLib / window["pdfjs-dist/build/pdf"] no existe en el cliente.');
        reject(new Error('Librería PDF no lista en el cliente. Intenta de nuevo en unos segundos.'));
        return;
      }
      try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        console.log('parsePdf: Cargando documento PDF con pdfjsLib...');
        const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
        console.log('parsePdf: Documento cargado. Total páginas:', pdf.numPages);
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          console.log(`parsePdf: textContent de página ${i}:`, textContent);
          const pageText = textContent.items.map(item => item.str).join(' ');
          console.log(`parsePdf: Página ${i} procesada. Caracteres extraídos:`, pageText.length);
          fullText += pageText + '\n';
        }
        console.log('parsePdf: Extracción finalizada, total caracteres:', fullText.length);
        resolve({
          text: fullText,
          pages: pdf.numPages,
          chars: fullText.length,
          bytesRead: arrayBuffer.byteLength
        });
      } catch (err) {
        console.error('parsePdf: Error de parseo en pdfjsLib:', err);
        reject(new Error('Error al parsear el PDF. Asegúrate de que no esté protegido o escaneado sin texto.'));
      }
    };

    reader.onerror = (err) => {
      console.error('parsePdf: Error de FileReader:', err);
      reject(new Error('Error de lectura del archivo PDF.'));
    };

    reader.readAsArrayBuffer(file);
  });
};

// --- VALIDACIONES VISUALES ---
const validarFormularios = () => {
  const validInputs = [
    { id: 'cr_inp_nombre', type: 'error' },
    { id: 'cr_inp_titulo', type: 'warning' },
    { id: 'cr_inp_email', type: 'error', isEmail: true },
    { id: 'cr_inp_telefono', type: 'error' },
    { id: 'cr_inp_ubicacion', type: 'warning' }
  ];

  validInputs.forEach(({ id, type, isEmail }) => {
    const inp = document.getElementById(id);
    if (!inp) return;
    inp.className = '';
    const val = inp.value.trim();
    if (!val) {
      inp.classList.add(`val_${type}`);
    } else if (isEmail) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (re.test(val)) {
        inp.classList.add('val_success');
      } else {
        inp.classList.add('val_error');
      }
    } else {
      inp.classList.add('val_success');
    }
  });

  const resumen = document.getElementById('cr_inp_resumen');
  if (resumen) {
    const val = resumen.value.trim();
    resumen.className = '';
    if (!val) {
      resumen.classList.add('val_error');
    } else if (val.split(/\s+/).length < 40) {
      resumen.classList.add('val_warning');
    } else {
      resumen.classList.add('val_success');
    }
  }
};

// --- CONTROLES DE IA (WIIBOT MODAL) ---
let activeExpId = null;

const abrirModalIA = (exp) => {
  activeExpId = exp.id;
  
  const modal = document.getElementById('cr_ai_modal');
  const origText = document.getElementById('cr_ai_original_text');
  const optText = document.getElementById('cr_ai_optimized_text');
  const loader = document.getElementById('cr_ai_loading');
  const applyBtn = document.getElementById('cr_btn_apply_ai');

  if (!modal || !origText || !optText || !loader || !applyBtn) return;

  origText.textContent = exp.logros || '';
  optText.textContent = '';
  optText.classList.add('dpn');
  loader.classList.remove('dpn');
  applyBtn.disabled = true;
  modal.classList.add('active');

  // Ejecutar llamada asíncrona
  setTimeout(async () => {
    try {
      const result = await optimizarLogroConGemini(exp.logros, exp.puesto, exp.empresa);
      loader.classList.add('dpn');
      optText.textContent = result;
      optText.classList.remove('dpn');
      applyBtn.disabled = false;
    } catch (e) {
      loader.classList.add('dpn');
      optText.textContent = 'Hubo un error al optimizar con Gemini. Inténtalo de nuevo.';
      optText.classList.remove('dpn');
    }
  }, 0);
};

const optimizarLogroConGemini = async (textoOriginal, puesto, empresa) => {
  const isLogged = localStorage.getItem('wiSmile');
  let rate = null;

  if (!isLogged) {
    rate = wiRateLimit('guest_cv_creator_uses', 5, 315360000000);
    if (!rate.ok) {
      Notificacion('Has alcanzado el límite de 5 optimizaciones de prueba. Regístrate para continuar ilimitadamente.', 'warning', 6000);
      closeAIModal();
      const { abrirLogin } = await import('../login.js');
      abrirLogin('registrar');
      throw new Error('Limit reached');
    }
  }

  const result = await optimizarLogroConIA(textoOriginal, puesto, empresa);
  if (rate) rate.fail(); // Consumir uso
  return result;
};

const closeAIModal = () => {
  document.getElementById('cr_ai_modal')?.classList.remove('active');
  activeExpId = null;
};

const applyAIOptimization = () => {
  const optText = document.getElementById('cr_ai_optimized_text')?.textContent || '';
  if (activeExpId && optText) {
    const cv = getCvData();
    const idx = cv.experiencias.findIndex(e => e.id === activeExpId);
    if (idx > -1) {
      const list = [...cv.experiencias];
      list[idx].logros = optText;
      updateCvData({ experiencias: list });
      
      // Si estamos en la pestaña actual de experiencia, actualizar el valor del textarea en pantalla
      if (activeTab === 'experiencia') {
        renderFormContent(getCvData());
      }
    }
  }
  closeAIModal();
};
