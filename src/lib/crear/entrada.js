import { getls, savels } from '../widev.js';
import { abrirModalIA } from './creando.js';

export let cvData = {
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
  idiomas: []
};

let onSave = null;

/**
 * Guarda los datos actuales en localStorage y notifica.
 */
export const persistData = () => {
  try {
    localStorage.setItem('wi_cv_data', JSON.stringify(cvData));
  } catch (e) {
    console.error('Error al guardar datos del CV en localStorage', e);
  }
  onSave?.(cvData);
};

/**
 * Carga datos iniciales desde caché o perfil.
 */
export const loadCachedData = () => {
  const cached = localStorage.getItem('wi_cv_data');
  if (cached) {
    try {
      cvData = JSON.parse(cached);
    } catch (e) {
      console.warn('Error al parsear CV guardado', e);
    }
  } else {
    // Si no hay caché, jalar datos del perfil logueado
    const profile = getls('wiSmile');
    if (profile) {
      cvData.nombre = `${profile.nombre || ''} ${profile.apellidos || ''}`.trim();
      cvData.email = profile.email || '';
      cvData.resumen = profile.bio || '';
    }
  }

  // Asegurar que al menos tengamos una experiencia y educación inicial
  if (!cvData.experiencias || cvData.experiencias.length === 0) {
    cvData.experiencias = [{
      id: 'exp_' + Date.now(),
      puesto: '',
      empresa: '',
      ubicacion: '',
      inicio: '',
      fin: '',
      logros: ''
    }];
  }
  if (!cvData.educacion || cvData.educacion.length === 0) {
    cvData.educacion = [{
      id: 'edu_' + Date.now(),
      institucion: '',
      grado: '',
      ubicacion: '',
      inicio: '',
      fin: ''
    }];
  }
  if (!cvData.idiomas) {
    cvData.idiomas = [];
  }
};

/**
 * Renderiza la lista de Experiencia Laboral en el DOM.
 */
export const renderExperiences = () => {
  const container = document.getElementById('cr_exp_list');
  if (!container) return;

  container.innerHTML = '';
  cvData.experiencias.forEach((exp, idx) => {
    const card = document.createElement('div');
    card.className = 'cr_list_item_card';
    card.dataset.id = exp.id;
    card.innerHTML = `
      <div class="cr_item_card_header">
        <h4>Puesto #${idx + 1}</h4>
        ${cvData.experiencias.length > 1 ? `<button class="cr_btn danger small cr_btn_remove_exp" data-id="${exp.id}"><i class="fas fa-trash"></i> Eliminar</button>` : ''}
      </div>
      <div class="cr_form_group_grid">
        <div class="cr_form_group">
          <label>Puesto / Cargo *</label>
          <input type="text" class="cr_exp_puesto_inp" value="${exp.puesto || ''}" placeholder="Ej: Desarrollador Backend" required />
        </div>
        <div class="cr_form_group">
          <label>Empresa *</label>
          <input type="text" class="cr_exp_empresa_inp" value="${exp.empresa || ''}" placeholder="Ej: Tech Solutions" required />
        </div>
        <div class="cr_form_group">
          <label>Ubicación</label>
          <input type="text" class="cr_exp_ubicacion_inp" value="${exp.ubicacion || ''}" placeholder="Ej: Remoto / Madrid, España" />
        </div>
        <div class="cr_form_group">
          <label>Fecha de Inicio *</label>
          <input type="text" class="cr_exp_inicio_inp" value="${exp.inicio || ''}" placeholder="Ej: Ene 2023" required />
        </div>
        <div class="cr_form_group">
          <label>Fecha de Fin *</label>
          <input type="text" class="cr_exp_fin_inp" value="${exp.fin || ''}" placeholder="Ej: Dic 2025 o Presente" required />
        </div>
        <div class="cr_form_group full_width">
          <label>Logros y Funciones (Una viñeta por línea recomendada) *</label>
          <textarea class="cr_exp_logros_inp" rows="4" placeholder="- Lideré el desarrollo de la API rest incrementando la velocidad de respuesta en un 30%\n- Diseñé el flujo de pagos usando Stripe..." required>${exp.logros || ''}</textarea>
          <div class="cr_ai_opt_trigger_bar">
            <button type="button" class="cr_btn_opt_ai" data-id="${exp.id}"><i class="fas fa-wand-magic-sparkles"></i> Optimizar con IA ✨</button>
          </div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
};

/**
 * Renderiza la lista de Educación en el DOM.
 */
export const renderEducations = () => {
  const container = document.getElementById('cr_edu_list');
  if (!container) return;

  container.innerHTML = '';
  cvData.educacion.forEach((edu, idx) => {
    const card = document.createElement('div');
    card.className = 'cr_list_item_card';
    card.dataset.id = edu.id;
    card.innerHTML = `
      <div class="cr_item_card_header">
        <h4>Estudio #${idx + 1}</h4>
        ${cvData.educacion.length > 1 ? `<button class="cr_btn danger small cr_btn_remove_edu" data-id="${edu.id}"><i class="fas fa-trash"></i> Eliminar</button>` : ''}
      </div>
      <div class="cr_form_group_grid">
        <div class="cr_form_group">
          <label>Grado / Título *</label>
          <input type="text" class="cr_edu_grado_inp" value="${edu.grado || ''}" placeholder="Ej: Grado en Ingeniería Informática" required />
        </div>
        <div class="cr_form_group">
          <label>Institución / Universidad *</label>
          <input type="text" class="cr_edu_inst_inp" value="${edu.institucion || ''}" placeholder="Ej: Universidad Complutense" required />
        </div>
        <div class="cr_form_group">
          <label>Ubicación</label>
          <input type="text" class="cr_edu_ubicacion_inp" value="${edu.ubicacion || ''}" placeholder="Ej: Madrid, España" />
        </div>
        <div class="cr_form_group">
          <label>Fecha de Inicio *</label>
          <input type="text" class="cr_edu_inicio_inp" value="${edu.inicio || ''}" placeholder="Ej: Sep 2018" required />
        </div>
        <div class="cr_form_group">
          <label>Fecha de Fin *</label>
          <input type="text" class="cr_edu_fin_inp" value="${edu.fin || ''}" placeholder="Ej: Jul 2022" required />
        </div>
      </div>
    `;
    container.appendChild(card);
  });
};

/**
 * Renderiza la lista de Idiomas en el DOM.
 */
export const renderLanguages = () => {
  const container = document.getElementById('cr_lang_list');
  if (!container) return;

  container.innerHTML = '';
  cvData.idiomas.forEach((lang, idx) => {
    const card = document.createElement('div');
    card.className = 'cr_list_item_card';
    card.dataset.id = lang.id;
    card.innerHTML = `
      <div class="cr_item_card_header">
        <h4>Idioma #${idx + 1}</h4>
        <button class="cr_btn danger small cr_btn_remove_lang" data-id="${lang.id}"><i class="fas fa-trash"></i> Eliminar</button>
      </div>
      <div class="cr_form_group_grid">
        <div class="cr_form_group">
          <label>Idioma *</label>
          <input type="text" class="cr_lang_nombre_inp" value="${lang.nombre || ''}" placeholder="Ej: Inglés" required />
        </div>
        <div class="cr_form_group">
          <label>Nivel *</label>
          <input type="text" class="cr_lang_nivel_inp" value="${lang.nivel || ''}" placeholder="Ej: C1 - Avanzado / Bilingüe" required />
        </div>
      </div>
    `;
    container.appendChild(card);
  });
};

/**
 * Inicializa los eventos de entrada de datos y sincronización.
 */
export const initEntrada = (onSaveCallback) => {
  onSave = onSaveCallback;

  // 1. Cargar los datos guardados en caché y poblar inputs estáticos
  loadCachedData();

  const setInputValue = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  };

  setInputValue('cr_inp_nombre', cvData.nombre);
  setInputValue('cr_inp_titulo', cvData.titulo);
  setInputValue('cr_inp_email', cvData.email);
  setInputValue('cr_inp_telefono', cvData.telefono);
  setInputValue('cr_inp_ubicacion', cvData.ubicacion);
  setInputValue('cr_inp_linkedin', cvData.linkedin);
  setInputValue('cr_inp_web', cvData.web);
  setInputValue('cr_inp_resumen', cvData.resumen);
  setInputValue('cr_inp_skills', cvData.skills);

  // 2. Renderizar listas dinámicas
  renderExperiences();
  renderEducations();
  renderLanguages();

  // 3. Notificar renderizado inicial
  persistData();

  // 4. Escuchar inputs estáticos del formulario principal
  const inputs = ['nombre', 'titulo', 'email', 'telefono', 'ubicacion', 'linkedin', 'web', 'resumen', 'skills'];
  inputs.forEach(key => {
    const el = document.getElementById(`cr_inp_${key}`);
    el?.addEventListener('input', (e) => {
      cvData[key] = e.target.value;
      persistData();
    });
  });

  // 5. Delegación de eventos para la lista de Experiencia Laboral
  const expList = document.getElementById('cr_exp_list');
  if (expList) {
    expList.addEventListener('input', (e) => {
      const target = e.target;
      const card = target.closest('.cr_list_item_card');
      if (!card) return;

      const id = card.dataset.id;
      const exp = cvData.experiencias.find(item => item.id === id);
      if (!exp) return;

      if (target.classList.contains('cr_exp_puesto_inp')) exp.puesto = target.value;
      else if (target.classList.contains('cr_exp_empresa_inp')) exp.empresa = target.value;
      else if (target.classList.contains('cr_exp_ubicacion_inp')) exp.ubicacion = target.value;
      else if (target.classList.contains('cr_exp_inicio_inp')) exp.inicio = target.value;
      else if (target.classList.contains('cr_exp_fin_inp')) exp.fin = target.value;
      else if (target.classList.contains('cr_exp_logros_inp')) exp.logros = target.value;

      persistData();
    });

    expList.addEventListener('click', (e) => {
      const target = e.target;

      // Evento Eliminar Experiencia
      const removeBtn = target.closest('.cr_btn_remove_exp');
      if (removeBtn) {
        const id = removeBtn.dataset.id;
        cvData.experiencias = cvData.experiencias.filter(item => item.id !== id);
        renderExperiences();
        persistData();
        return;
      }

      // Evento Optimizar por IA
      const aiBtn = target.closest('.cr_btn_opt_ai');
      if (aiBtn) {
        const id = aiBtn.dataset.id;
        const exp = cvData.experiencias.find(item => item.id === id);
        const textarea = aiBtn.closest('.cr_form_group')?.querySelector('.cr_exp_logros_inp');

        if (exp && textarea) {
          abrirModalIA(exp.puesto, exp.empresa, textarea, (result) => {
            exp.logros = result;
            persistData();
          });
        }
      }
    });
  }

  // 6. Delegación de eventos para la lista de Educación
  const eduList = document.getElementById('cr_edu_list');
  if (eduList) {
    eduList.addEventListener('input', (e) => {
      const target = e.target;
      const card = target.closest('.cr_list_item_card');
      if (!card) return;

      const id = card.dataset.id;
      const edu = cvData.educacion.find(item => item.id === id);
      if (!edu) return;

      if (target.classList.contains('cr_edu_grado_inp')) edu.grado = target.value;
      else if (target.classList.contains('cr_edu_inst_inp')) edu.institucion = target.value;
      else if (target.classList.contains('cr_edu_ubicacion_inp')) edu.ubicacion = target.value;
      else if (target.classList.contains('cr_edu_inicio_inp')) edu.inicio = target.value;
      else if (target.classList.contains('cr_edu_fin_inp')) edu.fin = target.value;

      persistData();
    });

    eduList.addEventListener('click', (e) => {
      const target = e.target;
      const removeBtn = target.closest('.cr_btn_remove_edu');
      if (removeBtn) {
        const id = removeBtn.dataset.id;
        cvData.educacion = cvData.educacion.filter(item => item.id !== id);
        renderEducations();
        persistData();
      }
    });
  }

  // 7. Delegación de eventos para la lista de Idiomas
  const langList = document.getElementById('cr_lang_list');
  if (langList) {
    langList.addEventListener('input', (e) => {
      const target = e.target;
      const card = target.closest('.cr_list_item_card');
      if (!card) return;

      const id = card.dataset.id;
      const lang = cvData.idiomas.find(item => item.id === id);
      if (!lang) return;

      if (target.classList.contains('cr_lang_nombre_inp')) lang.nombre = target.value;
      else if (target.classList.contains('cr_lang_nivel_inp')) lang.nivel = target.value;

      persistData();
    });

    langList.addEventListener('click', (e) => {
      const target = e.target;
      const removeBtn = target.closest('.cr_btn_remove_lang');
      if (removeBtn) {
        const id = removeBtn.dataset.id;
        cvData.idiomas = cvData.idiomas.filter(item => item.id !== id);
        renderLanguages();
        persistData();
      }
    });
  }

  // 8. Botón Añadir Experiencia
  document.getElementById('cr_btn_add_exp')?.addEventListener('click', () => {
    cvData.experiencias.push({
      id: 'exp_' + Date.now(),
      puesto: '',
      empresa: '',
      ubicacion: '',
      inicio: '',
      fin: '',
      logros: ''
    });
    renderExperiences();
    persistData();
  });

  // 9. Botón Añadir Educación
  document.getElementById('cr_btn_add_edu')?.addEventListener('click', () => {
    cvData.educacion.push({
      id: 'edu_' + Date.now(),
      institucion: '',
      grado: '',
      ubicacion: '',
      inicio: '',
      fin: ''
    });
    renderEducations();
    persistData();
  });

  // 10. Botón Añadir Idioma
  document.getElementById('cr_btn_add_lang')?.addEventListener('click', () => {
    cvData.idiomas.push({
      id: 'lang_' + Date.now(),
      nombre: '',
      nivel: ''
    });
    renderLanguages();
    persistData();
  });
};
