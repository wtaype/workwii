// src/lib/crear/preview/renderForms.js
// Renderizado de todos los formularios del editor de CV ATS

import { updateCvData, getCvData, crearEstructuraExp, crearEstructuraEdu, crearEstructuraProj, crearEstructuraCert } from '../estado.js';
import { Notificacion, wicopy } from '../../../widev/widev.js';
import { sugerirHabilidadesConIA } from '../wiibot.js';

// ─── Locales ─────────────────────────────────────────────────────────────────

export const locales = {
  es: {
    tabs: {
      contacto: 'Contacto', perfil: 'Perfil',
      experiencia: 'Experiencia', educacion: 'Educación',
      proyectos: 'Proyectos', certificados: 'Certificados',
      skills: 'Habilidades'
    },
    contacto: {
      nombre: 'Nombre Completo *', titulo: 'Título Profesional *',
      email: 'Correo Electrónico *', telefono: 'Teléfono *',
      ubicacion: 'Ubicación (Ciudad, País) *', linkedin: 'Enlace LinkedIn',
      web: 'Sitio Web o Portafolio', idioma: 'Idioma del CV *',
      incluirFoto: '¿Incluir foto en el CV?', subirFoto: 'Subir Foto',
      fotoHelp: 'Formatos: PNG/JPG. Máx: 2MB.',
      fotoWarning: 'La foto reduce la compatibilidad ATS.',
      placeholderNombre: 'Ej: Juan Pérez Gómez',
      placeholderTitulo: 'Ej: Ingeniero de Software / Administrador',
      placeholderEmail: 'Ej: juan.perez@email.com',
      placeholderTelefono: 'Ej: +51 000 000 000',
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
      titulo: 'Historial Profesional', agregar: 'Añadir Trabajo', puestoNum: 'Puesto', eliminar: 'Eliminar',
      cargo: 'Cargo / Puesto *', empresa: 'Empresa *', ubicacion: 'Ubicación',
      inicio: 'Fecha de Inicio *', fin: 'Fecha de Fin *',
      logros: 'Logros y Funciones (Una viñeta por línea) *',
      placeholderCargo: 'Ej: Desarrollador Backend', placeholderEmpresa: 'Ej: Tech Solutions',
      placeholderUbicacion: 'Ej: Remoto / Madrid, España',
      placeholderInicio: 'Ej: Ene 2023', placeholderFin: 'Ej: Presente o Dic 2024',
      placeholderLogros: '- Lideré el desarrollo de la API rest...'
    },
    educacion: {
      titulo: 'Historial Educativo', agregar: 'Añadir Estudio', estudioNum: 'Estudio', eliminar: 'Eliminar',
      institucion: 'Institución Educativa *', grado: 'Grado / Carrera / Certificación *',
      ubicacion: 'Ubicación', inicio: 'Fecha de Inicio *', fin: 'Fecha de Fin *',
      placeholderInstitucion: 'Ej: Universidad Nacional',
      placeholderGrado: 'Ej: Lic. en Administración',
      placeholderUbicacion: 'Ej: Madrid, España',
      placeholderInicio: 'Ej: Mar 2018', placeholderFin: 'Ej: Dic 2022 o En Curso'
    },
    skills: {
      titulo: 'Habilidades (Separadas por comas) *',
      placeholder: 'Ej: React, Node.js, SQL, Trabajo en equipo, Liderazgo',
      idiomas: 'Idiomas', agregarIdioma: 'Agregar Idioma',
      placeholderIdioma: 'Ej: Inglés - Avanzado (C1)',
      noIdiomas: 'No has añadido ningún idioma aún.'
    },
    proyectos: {
      titulo: 'Proyectos Destacados', agregar: 'Añadir Proyecto', proyectoNum: 'Proyecto', eliminar: 'Eliminar',
      nombre: 'Nombre del Proyecto *', enlace: 'Enlace del Proyecto (URL)',
      descripcion: 'Descripción del Proyecto *', tecnologias: 'Tecnologías utilizadas (Ej: Astro, Firebase)',
      placeholderNombre: 'Ej: Portafolio Personal', placeholderEnlace: 'Ej: https://misitio.com',
      placeholderDescripcion: 'Ej: Aplicación web desarrollada para optimización de...',
      placeholderTecnologias: 'Ej: Astro, TailwindCSS, Firebase'
    },
    certificados: {
      titulo: 'Certificaciones', agregar: 'Añadir Certificación', certificadoNum: 'Certificación', eliminar: 'Eliminar',
      nombre: 'Nombre de la Certificación *', emisor: 'Emisor / Organización *', fecha: 'Fecha de Expedición',
      placeholderNombre: 'Ej: Fundamentos de Inteligencia Artificial', placeholderEmisor: 'Ej: Credicorp',
      placeholderFecha: 'Ej: Sep 2025'
    }
  },
  en: {
    tabs: {
      contacto: 'Contact Info', perfil: 'Summary',
      experiencia: 'Experience', educacion: 'Education',
      proyectos: 'Projects', certificados: 'Certifications',
      skills: 'Skills'
    },
    contacto: {
      nombre: 'Full Name *', titulo: 'Professional Title *',
      email: 'Email Address *', telefono: 'Phone Number *',
      ubicacion: 'Location (City, Country) *', linkedin: 'LinkedIn Link',
      web: 'Website or Portfolio', idioma: 'CV Language *',
      incluirFoto: 'Include photo in CV?', subirFoto: 'Upload Photo',
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
      titulo: 'Work History', agregar: 'Add Work Experience', puestoNum: 'Job', eliminar: 'Delete',
      cargo: 'Job Title / Position *', empresa: 'Company *', ubicacion: 'Location',
      inicio: 'Start Date *', fin: 'End Date *',
      logros: 'Key Achievements & Responsibilities (One bullet per line) *',
      placeholderCargo: 'e.g., Backend Developer', placeholderEmpresa: 'e.g., Tech Solutions',
      placeholderUbicacion: 'e.g., Remote / Madrid, Spain',
      placeholderInicio: 'e.g., Jan 2023', placeholderFin: 'e.g., Present or Dec 2024',
      placeholderLogros: '- Led the development of the REST API...'
    },
    educacion: {
      titulo: 'Education History', agregar: 'Add Education', estudioNum: 'Education', eliminar: 'Delete',
      institucion: 'School / University *', grado: 'Degree / Major / Certification *',
      ubicacion: 'Location', inicio: 'Start Date *', fin: 'End Date *',
      placeholderInstitucion: 'e.g., State University',
      placeholderGrado: 'e.g., B.S. in Business Administration',
      placeholderUbicacion: 'e.g., Madrid, Spain',
      placeholderInicio: 'e.g., Mar 2018', placeholderFin: 'e.g., Dec 2022 or Ongoing'
    },
    skills: {
      titulo: 'Skills (Separated by commas) *',
      placeholder: 'e.g., React, Node.js, SQL, Teamwork, Leadership',
      idiomas: 'Languages', agregarIdioma: 'Add Language',
      placeholderIdioma: 'e.g., English - Fluent (C1)',
      noIdiomas: "You haven't added any languages yet."
    },
    proyectos: {
      titulo: 'Featured Projects', agregar: 'Add Project', proyectoNum: 'Project', eliminar: 'Delete',
      nombre: 'Project Name *', enlace: 'Project Link (URL)',
      descripcion: 'Project Description *', tecnologias: 'Technologies used (e.g., React, Firebase)',
      placeholderNombre: 'e.g., Personal Portfolio', placeholderEnlace: 'e.g., https://myweb.com',
      placeholderDescripcion: 'e.g., Web application designed for optimizing...',
      placeholderTecnologias: 'e.g., Astro, TailwindCSS, Firebase'
    },
    certificados: {
      titulo: 'Certifications', agregar: 'Add Certification', certificadoNum: 'Certification', eliminar: 'Delete',
      nombre: 'Certification Name *', emisor: 'Issuer / Organization *', fecha: 'Issue Date',
      placeholderNombre: 'e.g., AI Fundamentals', placeholderEmisor: 'e.g., Credicorp',
      placeholderFecha: 'e.g., Sep 2025'
    }
  }
};

// Callback para abrir el modal de IA — inyectado desde visual.js
let _abrirModalIACallback = null;
export const setAbrirModalIA = (fn) => { _abrirModalIACallback = fn; };

// ─── Logros / Achievements ───────────────────────────────────────────────────

export const renderAchievementsInputs = (container, exp, cv, expIdx) => {
  const logrosStr = Array.isArray(exp.logros)
    ? exp.logros.join('\n')
    : (typeof exp.logros === 'string' ? exp.logros : '');

  let achievements = (logrosStr || '')
    .split('\n')
    .map(line => line.replace(/^[-\*\•\s]+/, '').trim());

  while (achievements.length < 3) achievements.push('');

  container.innerHTML = `
    <div class="cr_achievements_list">
      ${achievements.map((ach, idx) => `
        <div class="cr_achievement_item" draggable="false">
          <span class="cr_achievement_bullet"><i class="fas fa-circle" aria-hidden="true"></i></span>
          <input
            type="text"
            class="cr_achievement_input"
            value="${ach.replace(/"/g, '&quot;')}"
            placeholder="Logro o función #${idx + 1}"
            draggable="false"
            spellcheck="true"
            lang="${cv.idioma}"
          />
          <button type="button" class="conv_btn_danger_small btn_del_achievement" data-idx="${idx}" title="Eliminar viñeta">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `).join('')}
      <div class="cr_achievements_actions">
        <button type="button" class="conv_btn_small btn_add_achievement">
          <i class="fas fa-plus"></i> Agregar logro
        </button>
        <button type="button" class="cr_btn_copy_logros" title="Copiar todos los logros al portapapeles">
          <i class="fas fa-copy"></i> Copiar logros
        </button>
      </div>
    </div>
  `;

  const updateState = () => {
    const list = [...cv.experiencias];
    const newAchievements = [...container.querySelectorAll('.cr_achievement_input')]
      .map(inp => inp.value.trim());
    let clean = [...newAchievements];
    while (clean.length > 0 && !clean[clean.length - 1]) clean.pop();
    list[expIdx].logros = clean.join('\n');
    updateCvData({ experiencias: list });
  };

  container.querySelectorAll('.cr_achievement_input').forEach(input => {
    input.addEventListener('input', updateState);
  });

  container.querySelectorAll('.btn_del_achievement').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'));
      achievements.splice(idx, 1);
      while (achievements.length < 3) achievements.push('');
      const list = [...cv.experiencias];
      list[expIdx].logros = achievements.join('\n');
      updateCvData({ experiencias: list });
    });
  });

  container.querySelector('.btn_add_achievement').addEventListener('click', () => {
    achievements.push('');
    const list = [...cv.experiencias];
    list[expIdx].logros = achievements.join('\n');
    updateCvData({ experiencias: list });
  });

  container.querySelector('.cr_btn_copy_logros').addEventListener('click', (e) => {
    const allLogros = [...container.querySelectorAll('.cr_achievement_input')]
      .map(inp => inp.value.trim())
      .filter(Boolean)
      .map(line => `• ${line}`)
      .join('\n');
    if (!allLogros) { Notificacion('No hay logros para copiar.', 'warning'); return; }
    wicopy(allLogros, e.currentTarget, '¡Logros copiados!');
  });
};

// ─── Formulario Contacto ─────────────────────────────────────────────────────

export const renderContactoForm = (container, cv) => {
  const isEn = cv.idioma === 'en';
  const lang = isEn ? locales.en.contacto : locales.es.contacto;

  container.innerHTML = `
    <div class="conv_form_grid">
      <div class="conv_field">
        <label>${lang.nombre}</label>
        <input type="text" id="cr_inp_nombre" value="${cv.nombre || ''}" placeholder="${lang.placeholderNombre}" required spellcheck="true" lang="${cv.idioma}" />
      </div>
      <div class="conv_field">
        <label>${lang.titulo}<span class="cr_help_tip" data-witip="El cargo al que aspiras o tu especialidad. Ayuda a que el reclutador te ubique rápidamente."><i class="fas fa-question-circle"></i></span></label>
        <input type="text" id="cr_inp_titulo" value="${cv.titulo || ''}" placeholder="${lang.placeholderTitulo}" required spellcheck="true" lang="${cv.idioma}" />
      </div>
      <div class="conv_field">
        <label>${lang.email}<span class="cr_help_tip" data-witip="Usa una dirección profesional (nombre.apellido@correo.com). Evita correos informales."><i class="fas fa-question-circle"></i></span></label>
        <input type="email" id="cr_inp_email" value="${cv.email || ''}" placeholder="${lang.placeholderEmail}" required />
      </div>
      <div class="conv_field">
        <label>${lang.telefono}<span class="cr_help_tip" data-witip="Tu número activo con código del país (ej: +34). Los reclutadores suelen llamar directo."><i class="fas fa-question-circle"></i></span></label>
        <input type="tel" id="cr_inp_telefono" value="${cv.telefono || ''}" placeholder="${lang.placeholderTelefono}" required />
      </div>
      <div class="conv_field">
        <label>${lang.ubicacion}<span class="cr_help_tip" data-witip="Ciudad y País actuales. Importante para filtros geográficos y ofertas locales."><i class="fas fa-question-circle"></i></span></label>
        <input type="text" id="cr_inp_ubicacion" value="${cv.ubicacion || ''}" placeholder="${lang.placeholderUbicacion}" required spellcheck="true" lang="${cv.idioma}" />
      </div>
      <div class="conv_field">
        <label>${lang.linkedin}<span class="cr_help_tip" data-witip="Enlace a tu perfil profesional. El 90% de los reclutadores lo consulta antes de llamar."><i class="fas fa-question-circle"></i></span></label>
        <input type="url" id="cr_inp_linkedin" value="${cv.linkedin || ''}" placeholder="${lang.placeholderLinkedin}" />
      </div>
      <div class="conv_field">
        <label>${lang.web}<span class="cr_help_tip" data-witip="Tu portfolio personal, web de proyectos o enlace de GitHub si eres técnico."><i class="fas fa-question-circle"></i></span></label>
        <input type="url" id="cr_inp_web" value="${cv.web || ''}" placeholder="${lang.placeholderWeb}" />
      </div>
      <div class="conv_field">
        <label>${lang.idioma}</label>
        <select id="cr_inp_idioma" class="conv_select">
          <option value="es" ${cv.idioma === 'es' ? 'selected' : ''}>Español</option>
          <option value="en" ${cv.idioma === 'en' ? 'selected' : ''}>English</option>
        </select>
      </div>
      <!-- Sección Foto -->
      <div class="conv_field full_width conv_photo_section">
        <div class="conv_toggle_row">
          <span class="conv_toggle_label">
            <i class="fas fa-camera"></i> ${lang.incluirFoto}
            <span class="cr_help_tip" data-witip="ATS Warning: En muchos mercados internacionales (EEUU, UK) y áreas tecnológicas, las fotos son penalizadas para evitar sesgos." data-wtipo="warning"><i class="fas fa-question-circle"></i></span>
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
              <button type="button" class="conv_btn_small" id="crBtnSelectFoto"><i class="fas fa-upload"></i> ${lang.subirFoto}</button>
              <span class="conv_small_help">${lang.fotoHelp}</span>
            </div>
          </div>
          <div class="conv_warning_badge" id="photoWarningBtn" data-witip="Los sistemas automáticos (ATS) no procesan imágenes y la foto reduce la compatibilidad en procesos tecnológicos internacionales." data-wtipo="warning">
            <i class="fas fa-exclamation-triangle"></i> ${lang.fotoWarning}
          </div>
        </div>
      </div>
    </div>
  `;

  // Eventos foto
  const toggle    = document.getElementById('cr_inp_incluirFoto');
  const uploadArea= document.getElementById('crPhotoUploadArea');
  const fileInput = document.getElementById('cr_inp_fotoFile');
  const selectBtn = document.getElementById('crBtnSelectFoto');

  toggle?.addEventListener('change', (e) => {
    const active = e.target.checked;
    updateCvData({ incluirFoto: active });
    uploadArea?.classList.toggle('active', active);
  });
  selectBtn?.addEventListener('click', () => fileInput?.click());
  fileInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { Notificacion('La foto excede el límite de 2MB.', 'error'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      updateCvData({ fotoBase64: ev.target.result });
      const box = document.getElementById('crPhotoPreviewBox');
      if (box) box.innerHTML = `<img src="${ev.target.result}" class="conv_avatar_img" />`;
    };
    reader.readAsDataURL(file);
  });

  // Eventos campos
  ['nombre','titulo','email','telefono','ubicacion','linkedin','web'].forEach(field => {
    const el = document.getElementById(`cr_inp_${field}`);
    el?.addEventListener('input', () => updateCvData({ [field]: el.value }));
  });
  document.getElementById('cr_inp_idioma')?.addEventListener('change', (e) => {
    const nextLang = e.target.value;
    
    // Guardar el estado actual en la clave del idioma destino antes de redirigir
    const currentState = getCvData();
    currentState.idioma = nextLang;
    const targetKey = nextLang === 'en' ? 'crear_cv_en' : 'crear_cv_es';
    localStorage.setItem(targetKey, JSON.stringify(currentState));

    updateCvData({ idioma: nextLang });

    // Redirección para acoplar idioma del CV e idioma del editor (Astro-way)
    const currentPath = window.location.pathname;
    const isCurrentlyEn = currentPath.includes('/en/crear');
    if (nextLang === 'en' && !isCurrentlyEn) {
      window.location.href = '/en/crear';
    } else if (nextLang === 'es' && isCurrentlyEn) {
      window.location.href = '/crear';
    }
  });
};

// ─── Formulario Perfil ───────────────────────────────────────────────────────

export const renderPerfilForm = (container, cv) => {
  const isEn = cv.idioma === 'en';
  const lang = isEn ? locales.en.perfil : locales.es.perfil;

  container.innerHTML = `
    <div class="conv_field full_width">
      <label>
        ${lang.titulo}
        <span class="cr_help_tip" data-witip="Un resumen profesional de 50 a 100 palabras ayuda al reclutador a entender tu perfil rápidamente."><i class="fas fa-question-circle"></i></span>
      </label>
      <textarea id="cr_inp_resumen" rows="8" placeholder="${lang.placeholder}" required spellcheck="true" lang="${cv.idioma}">${cv.resumen || ''}</textarea>
      <span class="conv_char_counter" id="lbl_resumen_counter">${(cv.resumen || '').length} ${lang.caracteres}</span>
    </div>
  `;

  const txt = document.getElementById('cr_inp_resumen');
  txt?.addEventListener('input', () => {
    updateCvData({ resumen: txt.value });
    const counter = document.getElementById('lbl_resumen_counter');
    if (counter) counter.textContent = `${txt.value.length} ${lang.caracteres}`;
  });
};

// ─── Formulario Experiencia ──────────────────────────────────────────────────

export const renderExperienciasForm = (container, cv) => {
  const isEn = cv.idioma === 'en';
  const lang = isEn ? locales.en.experiencia : locales.es.experiencia;

  container.innerHTML = `
    <div class="conv_header_row conv_form_header_row">
      <h3>${lang.titulo}</h3>
      <button type="button" class="conv_btn_small" id="crBtnAddExp"><i class="fas fa-plus"></i> ${lang.agregar}</button>
    </div>
    <div class="conv_list_items" id="crExpList"></div>
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
          <div class="cr_exp_header_actions">
            <button class="cr_btn_opt_ai btn_opt_exp_ai" data-id="${exp.id}"><i class="fas fa-sparkles"></i> Optimizar Logros IA</button>
            ${cv.experiencias.length > 1 ? `<button class="conv_btn_danger_small btn_del_exp" data-id="${exp.id}"><i class="fas fa-trash"></i> ${lang.eliminar}</button>` : ''}
          </div>
        </div>
        <div class="conv_form_grid">
          <div class="conv_field"><label>${lang.cargo}</label><input type="text" class="exp_puesto" value="${exp.puesto || ''}" placeholder="${lang.placeholderCargo}" required spellcheck="true" lang="${cv.idioma}" /></div>
          <div class="conv_field"><label>${lang.empresa}</label><input type="text" class="exp_empresa" value="${exp.empresa || ''}" placeholder="${lang.placeholderEmpresa}" required spellcheck="true" lang="${cv.idioma}" /></div>
          <div class="conv_field"><label>${lang.ubicacion}</label><input type="text" class="exp_ubicacion" value="${exp.ubicacion || ''}" placeholder="${lang.placeholderUbicacion}" spellcheck="true" lang="${cv.idioma}" /></div>
          <div class="conv_field"><label>${lang.inicio}</label><input type="text" class="exp_inicio" value="${exp.inicio || ''}" placeholder="${lang.placeholderInicio}" required /></div>
          <div class="conv_field"><label>${lang.fin}</label><input type="text" class="exp_fin" value="${exp.fin || ''}" placeholder="${lang.placeholderFin}" required /></div>
          <div class="conv_field full_width">
            <label class="cr_logros_label">
              ${lang.logros}
              <span class="cr_help_tip" data-witip="Usa verbos de acción fuertes en primera persona e incluye números (ej: Reduje gastos en un 15%). Evita descripciones pasivas."><i class="fas fa-question-circle"></i></span>
            </label>
            <div class="cr_logros_inputs_container"></div>
          </div>
        </div>
      `;
      expListContainer.appendChild(card);

      const logrosContainer = card.querySelector('.cr_logros_inputs_container');
      if (logrosContainer) renderAchievementsInputs(logrosContainer, exp, cv, idx);
    });

    // Binds input
    expListContainer.querySelectorAll('.conv_item_card').forEach(card => {
      const id = card.dataset.id;
      const idx = cv.experiencias.findIndex(e => e.id === id);
      if (idx === -1) return;
      ['puesto','empresa','ubicacion','inicio','fin'].forEach(field => {
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
        updateCvData({ experiencias: cv.experiencias.filter(e => e.id !== id) });
      });
    });

    // IA trigger
    expListContainer.querySelectorAll('.btn_opt_exp_ai').forEach(btn => {
      btn.addEventListener('click', () => {
        const id  = btn.getAttribute('data-id');
        const exp = cv.experiencias.find(e => e.id === id);
        if (!exp || !exp.logros?.trim()) {
          Notificacion('Escribe algún logro/función en el puesto primero.', 'warning');
          return;
        }
        _abrirModalIACallback?.(exp);
      });
    });
  };

  renderList();
  document.getElementById('crBtnAddExp')?.addEventListener('click', () => {
    updateCvData({ experiencias: [...cv.experiencias, crearEstructuraExp()] });
  });
};

// ─── Formulario Educación ────────────────────────────────────────────────────

export const renderEducacionForm = (container, cv) => {
  const isEn = cv.idioma === 'en';
  const lang = isEn ? locales.en.educacion : locales.es.educacion;

  container.innerHTML = `
    <div class="conv_header_row conv_form_header_row">
      <h3>${lang.titulo}</h3>
      <button type="button" class="conv_btn_small" id="crBtnAddEdu"><i class="fas fa-plus"></i> ${lang.agregar}</button>
    </div>
    <div class="conv_list_items" id="crEduList"></div>
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
          <div class="conv_field"><label>${lang.institucion}</label><input type="text" class="edu_institucion" value="${edu.institucion || ''}" placeholder="${lang.placeholderInstitucion}" required spellcheck="true" lang="${cv.idioma}" /></div>
          <div class="conv_field"><label>${lang.grado}</label><input type="text" class="edu_grado" value="${edu.grado || ''}" placeholder="${lang.placeholderGrado}" required spellcheck="true" lang="${cv.idioma}" /></div>
          <div class="conv_field"><label>${lang.ubicacion}</label><input type="text" class="edu_ubicacion" value="${edu.ubicacion || ''}" placeholder="${lang.placeholderUbicacion}" spellcheck="true" lang="${cv.idioma}" /></div>
          <div class="conv_field"><label>${lang.inicio}</label><input type="text" class="edu_inicio" value="${edu.inicio || ''}" placeholder="${lang.placeholderInicio}" required /></div>
          <div class="conv_field"><label>${lang.fin}</label><input type="text" class="edu_fin" value="${edu.fin || ''}" placeholder="${lang.placeholderFin}" required /></div>
        </div>
      `;
      eduListContainer.appendChild(card);
    });

    eduListContainer.querySelectorAll('.conv_item_card').forEach(card => {
      const id  = card.dataset.id;
      const idx = cv.educacion.findIndex(e => e.id === id);
      if (idx === -1) return;
      ['institucion','grado','ubicacion','inicio','fin'].forEach(field => {
        const el = card.querySelector(`.edu_${field}`);
        el?.addEventListener('input', () => {
          const list = [...cv.educacion];
          list[idx][field] = el.value;
          updateCvData({ educacion: list });
        });
      });
    });

    eduListContainer.querySelectorAll('.btn_del_edu').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        updateCvData({ educacion: cv.educacion.filter(e => e.id !== id) });
      });
    });
  };

  renderList();
  document.getElementById('crBtnAddEdu')?.addEventListener('click', () => {
    updateCvData({ educacion: [...cv.educacion, crearEstructuraEdu()] });
  });
};

// ─── Formulario Skills & Idiomas ─────────────────────────────────────────────

export const renderSkillsForm = (container, cv) => {
  const isEn = cv.idioma === 'en';
  const lang = isEn ? locales.en.skills : locales.es.skills;

  container.innerHTML = `
    <div class="conv_field full_width">
      <label>
        ${lang.titulo}
        <span class="cr_help_tip" data-witip="Palabras clave de tus tecnologías o conocimientos. Los sistemas ATS las buscan exactamente para calificarte. Sepáralas por comas."><i class="fas fa-question-circle"></i></span>
      </label>
      <input type="text" id="cr_inp_skills" value="${cv.skills || ''}" placeholder="${lang.placeholder}" required spellcheck="true" lang="${cv.idioma}" />
      <div class="cr_ai_opt_trigger_bar">
        <button type="button" class="cr_btn_opt_ai" id="crBtnSugerirHabilidades">
          <i class="fas fa-sparkles"></i> Sugerir Habilidades con IA
        </button>
      </div>
    </div>
    <div class="conv_field full_width conv_section_spacer">
      <div class="conv_header_row">
        <label>
          ${lang.idiomas}
          <span class="cr_help_tip" data-witip="Los idiomas multiplican tus opciones de selección en empresas internacionales."><i class="fas fa-question-circle"></i></span>
        </label>
        <button type="button" class="conv_btn_small" id="crBtnAddLanguage"><i class="fas fa-plus"></i> ${lang.agregarIdioma}</button>
      </div>
      <div class="conv_languages_list" id="crLanguagesList"></div>
    </div>
  `;

  document.getElementById('cr_inp_skills')?.addEventListener('input', (e) => {
    updateCvData({ skills: e.target.value });
  });

  renderLanguages(cv);

  document.getElementById('crBtnAddLanguage')?.addEventListener('click', () => {
    const placeholder = cv.idioma === 'en' ? 'Language - Level' : 'Idioma - Nivel';
    updateCvData({ idiomas: [...cv.idiomas, placeholder] });
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
};

// ─── Idiomas ─────────────────────────────────────────────────────────────────

export const renderLanguages = (cv) => {
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
      <input type="text" class="in_lang_value" value="${langVal || ''}" placeholder="${lang.placeholderIdioma}" spellcheck="true" lang="${cv.idioma}" />
      <button type="button" class="conv_btn_icon_danger btn_del_lang" data-idx="${idx}"><i class="fas fa-trash-can"></i></button>
    `;
    container.appendChild(row);

    row.querySelector('.in_lang_value')?.addEventListener('input', (e) => {
      const list = [...cv.idiomas];
      list[idx] = e.target.value;
      updateCvData({ idiomas: list });
    });
  });

  container.querySelectorAll('.btn_del_lang').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx') || '0');
      updateCvData({ idiomas: cv.idiomas.filter((_, i) => i !== idx) });
    });
  });
};

// ─── Validaciones visuales ───────────────────────────────────────────────────

export const validarFormularios = () => {
  const validInputs = [
    { id: 'cr_inp_nombre',    type: 'error' },
    { id: 'cr_inp_titulo',    type: 'warning' },
    { id: 'cr_inp_email',     type: 'error', isEmail: true },
    { id: 'cr_inp_telefono',  type: 'error' },
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
      inp.classList.add(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ? 'val_success' : 'val_error');
    } else {
      inp.classList.add('val_success');
    }
  });

  const resumen = document.getElementById('cr_inp_resumen');
  if (resumen) {
    const val = resumen.value.trim();
    resumen.className = '';
    if (!val) resumen.classList.add('val_error');
    else if (val.split(/\s+/).length < 40) resumen.classList.add('val_warning');
    else resumen.classList.add('val_success');
  }
};

// ─── Formulario Proyectos Destacados ──────────────────────────────────────────
export const renderProyectosForm = (container, cv) => {
  const isEn = cv.idioma === 'en';
  const lang = isEn ? locales.en.proyectos : locales.es.proyectos;

  container.innerHTML = `
    <div class="conv_header_row conv_form_header_row">
      <h3>${lang.titulo}</h3>
      <button type="button" class="conv_btn_small" id="crBtnAddProj"><i class="fas fa-plus"></i> ${lang.agregar}</button>
    </div>
    <div class="conv_list_items" id="crProjList"></div>
  `;

  const projListContainer = document.getElementById('crProjList');
  if (!projListContainer) return;

  const renderList = () => {
    projListContainer.innerHTML = '';
    const listProjs = cv.proyectos || [];
    listProjs.forEach((proj, idx) => {
      const card = document.createElement('div');
      card.className = 'conv_item_card';
      card.dataset.id = proj.id;
      card.innerHTML = `
        <div class="conv_item_card_header">
          <h4>${lang.proyectoNum} #${idx + 1}</h4>
          ${listProjs.length > 0 ? `<button class="conv_btn_danger_small btn_del_proj" data-id="${proj.id}"><i class="fas fa-trash"></i> ${lang.eliminar}</button>` : ''}
        </div>
        <div class="conv_form_grid">
          <div class="conv_field"><label>${lang.nombre}</label><input type="text" class="proj_nombre" value="${proj.nombre || ''}" placeholder="${lang.placeholderNombre}" required spellcheck="true" lang="${cv.idioma}" /></div>
          <div class="conv_field"><label>${lang.enlace}</label><input type="text" class="proj_enlace" value="${proj.enlace || ''}" placeholder="${lang.placeholderEnlace}" /></div>
          <div class="conv_field full_width"><label>${lang.descripcion}</label><input type="text" class="proj_descripcion" value="${proj.descripcion || ''}" placeholder="${lang.placeholderDescripcion}" required spellcheck="true" lang="${cv.idioma}" /></div>
          <div class="conv_field full_width"><label>${lang.tecnologias}</label><input type="text" class="proj_tecnologias" value="${proj.tecnologias || ''}" placeholder="${lang.placeholderTecnologias}" spellcheck="true" lang="${cv.idioma}" /></div>
        </div>
      `;
      projListContainer.appendChild(card);
    });

    projListContainer.querySelectorAll('.conv_item_card').forEach(card => {
      const id  = card.dataset.id;
      const idx = cv.proyectos.findIndex(p => p.id === id);
      if (idx === -1) return;
      ['nombre','enlace','descripcion','tecnologias'].forEach(field => {
        const el = card.querySelector(`.proj_${field}`);
        el?.addEventListener('input', () => {
          const list = [...cv.proyectos];
          list[idx][field] = el.value;
          updateCvData({ proyectos: list });
        });
      });
    });

    projListContainer.querySelectorAll('.btn_del_proj').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        updateCvData({ proyectos: cv.proyectos.filter(p => p.id !== id) });
      });
    });
  };

  renderList();
  document.getElementById('crBtnAddProj')?.addEventListener('click', () => {
    updateCvData({ proyectos: [...(cv.proyectos || []), crearEstructuraProj()] });
  });
};

// ─── Formulario Certificaciones ──────────────────────────────────────────────
export const renderCertificadosForm = (container, cv) => {
  const isEn = cv.idioma === 'en';
  const lang = isEn ? locales.en.certificados : locales.es.certificados;

  container.innerHTML = `
    <div class="conv_header_row conv_form_header_row">
      <h3>${lang.titulo}</h3>
      <button type="button" class="conv_btn_small" id="crBtnAddCert"><i class="fas fa-plus"></i> ${lang.agregar}</button>
    </div>
    <div class="conv_list_items" id="crCertList"></div>
  `;

  const certListContainer = document.getElementById('crCertList');
  if (!certListContainer) return;

  const renderList = () => {
    certListContainer.innerHTML = '';
    const listCerts = cv.certificaciones || [];
    listCerts.forEach((cert, idx) => {
      const card = document.createElement('div');
      card.className = 'conv_item_card';
      card.dataset.id = cert.id;
      card.innerHTML = `
        <div class="conv_item_card_header">
          <h4>${lang.certificadoNum} #${idx + 1}</h4>
          ${listCerts.length > 0 ? `<button class="conv_btn_danger_small btn_del_cert" data-id="${cert.id}"><i class="fas fa-trash"></i> ${lang.eliminar}</button>` : ''}
        </div>
        <div class="conv_form_grid">
          <div class="conv_field"><label>${lang.nombre}</label><input type="text" class="cert_nombre" value="${cert.nombre || ''}" placeholder="${lang.placeholderNombre}" required spellcheck="true" lang="${cv.idioma}" /></div>
          <div class="conv_field"><label>${lang.emisor}</label><input type="text" class="cert_emisor" value="${cert.emisor || ''}" placeholder="${lang.placeholderEmisor}" required spellcheck="true" lang="${cv.idioma}" /></div>
          <div class="conv_field"><label>${lang.fecha}</label><input type="text" class="cert_fecha" value="${cert.fecha || ''}" placeholder="${lang.placeholderFecha}" /></div>
        </div>
      `;
      certListContainer.appendChild(card);
    });

    certListContainer.querySelectorAll('.conv_item_card').forEach(card => {
      const id  = card.dataset.id;
      const idx = cv.certificaciones.findIndex(c => c.id === id);
      if (idx === -1) return;
      ['nombre','emisor','fecha'].forEach(field => {
        const el = card.querySelector(`.cert_${field}`);
        el?.addEventListener('input', () => {
          const list = [...cv.certificaciones];
          list[idx][field] = el.value;
          updateCvData({ certificaciones: list });
        });
      });
    });

    certListContainer.querySelectorAll('.btn_del_cert').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        updateCvData({ certificaciones: cv.certificaciones.filter(c => c.id !== id) });
      });
    });
  };

  renderList();
  document.getElementById('crBtnAddCert')?.addEventListener('click', () => {
    updateCvData({ certificaciones: [...(cv.certificaciones || []), crearEstructuraCert()] });
  });
};
