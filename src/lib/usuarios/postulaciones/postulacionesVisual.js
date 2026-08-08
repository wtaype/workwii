/**
 * postulacionesVisual.js - Orquestador visual y de persistencia del modulo de Postulaciones.
 * Escrito sin tildes para maxima compatibilidad.
 */

import { Mensaje, wiTip, abrirModal, cerrarModal } from '../../widev/widev.js';
import { estructurarCvConIA } from './preview/procesarJson.js';
import { updateA4Preview } from './preview/renderPreview.js';
import { mountChatWii, renderHistorialChat } from './chatwii/visual.js';
import { coachPersona } from './chatwii/personalidad.js';

const LS_LISTA  = 'post_lista';
const LS_ACTIVA = 'post_activa';

let _lang = 'es';
let _lg = {};
let _lista = [];
let _activa = null;
let _cvData = null;

// ── Helpers de LocalStorage ──────────────────────────────────────────────────

const cargarLista = () => {
  try {
    const raw = localStorage.getItem(LS_LISTA);
    _lista = raw ? JSON.parse(raw) : [];
  } catch (_) {
    _lista = [];
  }
};

const guardarLista = () => {
  try {
    localStorage.setItem(LS_LISTA, JSON.stringify(_lista));
  } catch (_) {}
};

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const formatKeyName = (nombre) => {
  return (nombre || 'default').trim().replace(/\s+/g, '_');
};

// ── CRUD de Postulaciones ────────────────────────────────────────────────────

export const crearPostulacion = (empresa, cargo, idioma, notas) => {
  const nombre = `${empresa || 'Empresa'} - ${cargo || 'Cargo'}`;
  const nueva = {
    id: uid(),
    nombre,
    empresa: empresa || '',
    cargo: cargo || '',
    estado: 'postulado',
    idioma: idioma || _lang,
    fecha: new Date().toISOString().slice(0, 10),
    notas: notas || ''
  };

  _lista.unshift(nueva);
  guardarLista();

  // Inicializar preview y chat vacios para la clave de esta postulacion
  const keyNombre = formatKeyName(nombre);
  localStorage.setItem(`preview_post_${keyNombre}`, '{}');
  localStorage.setItem(`chatwii_post_${keyNombre}`, '[]');

  return nueva;
};

export const eliminarPostulacion = (id) => {
  const post = _lista.find(p => p.id === id);
  if (post) {
    const keyNombre = formatKeyName(post.nombre);
    localStorage.removeItem(`preview_post_${keyNombre}`);
    localStorage.removeItem(`chatwii_post_${keyNombre}`);
  }
  _lista = _lista.filter(p => p.id !== id);
  guardarLista();
};

// ── UI Selectors y Estado ────────────────────────────────────────────────────

const renderSelector = () => {
  const sel = document.getElementById('post_selector');
  if (!sel) return;

  sel.innerHTML = _lista.length === 0
    ? `<option value="">${_lg['post.sinPostulaciones'] || 'Sin postulaciones'}</option>`
    : _lista.map(p => `<option value="${p.id}" ${_activa?.id === p.id ? 'selected' : ''}>${p.nombre}</option>`).join('');

  actualizarIndicadorEstado();
};

const actualizarIndicadorEstado = () => {
  if (!_activa) return;

  const badge = document.getElementById('post_badge_estado');
  if (badge) {
    // Limpiar clases anteriores del estado
    badge.className = 'post_badge_estado';
    badge.classList.add(`post_status_${_activa.estado}`);
  }

  const txt = document.getElementById('post_estado_txt');
  if (txt) txt.textContent = _lg[`post.estados.${_activa.estado}`] || _activa.estado;

  const selEstado = document.getElementById('post_estado_sel');
  if (selEstado) selEstado.value = _activa.estado;
};

const alternarControlesHeader = (mostrar) => {
  const div1 = document.querySelector('.post_desc_divider');
  const div2 = document.getElementById('post_nombre_edit_container');
  const div3 = document.getElementById('post_upload_container');
  const div4 = document.getElementById('post_estado_sel');
  const div5 = document.getElementById('post_btn_eliminar');

  const els = [div1, div2, div3, div4, div5];
  els.forEach(el => {
    if (!el) return;
    if (mostrar) {
      el.classList.remove('post_hidden');
    } else {
      el.classList.add('post_hidden');
    }
  });
};

// ── Cargar Postulacion Activa ────────────────────────────────────────────────

const cargarActiva = (id) => {
  _activa = _lista.find(p => p.id === id) || _lista[0] || null;
  
  if (_activa) {
    localStorage.setItem(LS_ACTIVA, _activa.id);
  } else {
    localStorage.removeItem(LS_ACTIVA);
  }

  const emptyEl = document.getElementById('post_empty');
  const workspaceEl = document.getElementById('post_workspace');

  if (!_activa) {
    emptyEl?.classList.remove('post_hidden');
    workspaceEl?.classList.add('post_hidden');
    alternarControlesHeader(false);
    return;
  }

  emptyEl?.classList.add('post_hidden');
  workspaceEl?.classList.remove('post_hidden');
  alternarControlesHeader(true);

  renderSelector();

  // Cargar nombre editable en el input
  const inputNombre = document.getElementById('post_nombre_input');
  if (inputNombre) inputNombre.value = _activa.nombre;

  // Cargar CV JSON desde su key especifica
  const keyNombre = formatKeyName(_activa.nombre);
  try {
    const rawCv = localStorage.getItem(`preview_post_${keyNombre}`);
    _cvData = rawCv ? JSON.parse(rawCv) : {};
  } catch (_) {
    _cvData = {};
  }

  actualizarPreview();

  // Montar ChatWii con la descripción de la vacante leída desde _activa.notas
  const chatContainer = document.getElementById('post_chat_container');
  if (chatContainer) {
    mountChatWii(
      chatContainer,
      _activa.idioma || _lang,
      coachPersona,
      () => _cvData,
      () => _activa?.notas || '',
      () => _activa
    );
  }

  actualizarIndicadorEstado();
};

const actualizarPreview = () => {
  const area = document.getElementById('post_cv_printable_area');
  const vacio = document.getElementById('post_preview_vacio');

  if (_cvData && _cvData.nombre) {
    if (vacio) vacio.style.display = 'none';
    if (area) {
      area.style.display = 'block';
      updateA4Preview(_cvData);
    }
  } else {
    if (vacio) vacio.style.display = 'flex';
    if (area) {
      area.style.display = 'none';
      area.innerHTML = '';
    }
  }
};

// ── Rename de Postulacion (LocalStorage Key management) ──────────────────────

const renombrarPostulacion = (nuevoNombre) => {
  if (!_activa || !nuevoNombre || !nuevoNombre.trim()) return;

  const nombreLimpio = nuevoNombre.trim();
  if (nombreLimpio === _activa.nombre) return;

  const keyVieja = formatKeyName(_activa.nombre);
  const keyNueva = formatKeyName(nombreLimpio);

  // Mover preview y chat a las nuevas claves
  const previewData = localStorage.getItem(`preview_post_${keyVieja}`);
  if (previewData) {
    localStorage.setItem(`preview_post_${keyNueva}`, previewData);
    localStorage.removeItem(`preview_post_${keyVieja}`);
  }

  const chatData = localStorage.getItem(`chatwii_post_${keyVieja}`);
  if (chatData) {
    localStorage.setItem(`chatwii_post_${keyNueva}`, chatData);
    localStorage.removeItem(`chatwii_post_${keyVieja}`);
  }

  // Actualizar en el listado
  _activa.nombre = nombreLimpio;
  guardarLista();
  renderSelector();

  // Recargar chat con el nuevo key
  cargarActiva(_activa.id);
  Mensaje(_lg['post.notasGuardadas'] || 'Nombre actualizado', 'success');
};

// ── Helpers de Skeleton A4 ───────────────────────────────────────────────────

const mostrarSkeletonA4 = () => {
  const area  = document.getElementById('post_cv_printable_area');
  const vacio = document.getElementById('post_preview_vacio');
  if (!area) return;
  if (vacio) vacio.style.display = 'none';
  area.style.display = 'block';
  area.innerHTML = `
    <div class="cr_cv_document cr_cv_page post_skeleton_page">
      <div class="post_sk_header">
        <div class="post_sk_line post_sk_name"></div>
        <div class="post_sk_line post_sk_title"></div>
        <div class="post_sk_line post_sk_contact"></div>
      </div>
      <div class="post_sk_section">
        <div class="post_sk_line post_sk_section_title"></div>
        <div class="post_sk_line post_sk_text"></div>
        <div class="post_sk_line post_sk_text post_sk_short"></div>
      </div>
      <div class="post_sk_section">
        <div class="post_sk_line post_sk_section_title"></div>
        <div class="post_sk_item">
          <div class="post_sk_line post_sk_item_title"></div>
          <div class="post_sk_line post_sk_text"></div>
          <div class="post_sk_line post_sk_text post_sk_short"></div>
        </div>
        <div class="post_sk_item">
          <div class="post_sk_line post_sk_item_title"></div>
          <div class="post_sk_line post_sk_text"></div>
        </div>
      </div>
      <div class="post_sk_section">
        <div class="post_sk_line post_sk_section_title"></div>
        <div class="post_sk_line post_sk_text"></div>
        <div class="post_sk_line post_sk_text post_sk_short"></div>
      </div>
      <div class="post_sk_badge">
        <i class="fas fa-brain"></i>
        <span>${_lg['post.procesando'] || 'Analizando CV con IA...'}</span>
      </div>
    </div>
  `;
};

// ── Procesar y Cargar CV ─────────────────────────────────────────────────────

const procesarArchivoCv = async (file) => {
  if (!file || !_activa) return;

  const btnHeader = document.getElementById('post_btn_subir_cv');
  const btnModal  = document.getElementById('postul_cv_btn');
  const cvNombre  = document.getElementById('postul_cv_nombre');
  const ext = file.name.split('.').pop().toLowerCase();

  if (!['pdf', 'docx', 'doc'].includes(ext)) {
    Mensaje(_lg['post.cvError'] || 'Formato no valido.', 'error');
    return;
  }

  // Mostrar skeleton A4 inmediatamente en el preview
  mostrarSkeletonA4();

  // Feedback visual en botones
  const procesandoTxt = _lg['post.procesando'] || 'Analizando...';
  if (btnHeader) {
    btnHeader.disabled = true;
    btnHeader.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${procesandoTxt}`;
  }
  if (btnModal) {
    btnModal.disabled = true;
    btnModal.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;
  }

  try {
    let texto = '';
    let tipo = 'text';

    if (ext === 'pdf') {
      const arrayBuffer = await file.arrayBuffer();
      texto = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      tipo = 'pdf';
    } else {
      const mammothMod = await import('mammoth');
      const mammoth = mammothMod.default || mammothMod;
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      texto = result.value;
      tipo = 'text';
    }

    const cvJson = await estructurarCvConIA(texto, _activa.cargo || '', _activa.idioma || 'es', tipo, _activa.empresa || '');

    _cvData = cvJson;

    // Guardar en la clave especifica
    const keyNombre = formatKeyName(_activa.nombre);
    localStorage.setItem(`preview_post_${keyNombre}`, JSON.stringify(cvJson));

    // Reemplazar skeleton con el CV real
    actualizarPreview();

    // Refrescar saludo del Coach con los datos del CV ya disponibles
    renderHistorialChat();

    Mensaje(_lg['post.cvCargado'] || 'CV cargado.', 'success');

    // Actualizar label del CV en el modal si sigue abierto
    if (cvNombre) {
      cvNombre.textContent = file.name;
      cvNombre.classList.add('post_cv_filename--selected');
    }
  } catch (e) {
    console.error(e);
    // Quitar skeleton en caso de error
    actualizarPreview();
    Mensaje(_lg['post.cvError'] || 'Error al procesar el CV.', 'error');
  } finally {
    if (btnHeader) {
      btnHeader.disabled = false;
      btnHeader.innerHTML = `<i class="fas fa-cloud-upload-alt"></i> ${_lg['post.subirCV'] || 'Subir CV'}`;
    }
    if (btnModal) {
      btnModal.disabled = false;
      btnModal.innerHTML = `<i class="fas fa-cloud-upload-alt"></i> <span>${_lg['post.modalCvBtn'] || 'Seleccionar archivo'}</span>`;
    }
  }
};

// ── Eventos ──────────────────────────────────────────────────────────────────

export const initPostulaciones = (lang, lg) => {
  _lang = lang;
  _lg = lg;

  cargarLista();

  const savedId = localStorage.getItem(LS_ACTIVA);
  if (_lista.length > 0) {
    cargarActiva(savedId || _lista[0].id);
  } else {
    cargarActiva(null);
  }

  // Selector de Candidatura
  document.getElementById('post_selector')?.addEventListener('change', (e) => {
    cargarActiva(e.target.value);
  });

  // Selector de Estado
  document.getElementById('post_estado_sel')?.addEventListener('change', (e) => {
    if (_activa) {
      _activa.estado = e.target.value;
      guardarLista();
      actualizarIndicadorEstado();
    }
  });

  // Guardar nombre al pulsar boton
  document.getElementById('post_btn_guardar_nombre')?.addEventListener('click', () => {
    const input = document.getElementById('post_nombre_input');
    if (input) renombrarPostulacion(input.value);
  });

  // Modal: Nueva Postulacion
  document.getElementById('post_btn_nueva')?.addEventListener('click', () => {
    abrirModal('post_modal_nueva');
  });

  document.getElementById('post_modal_cancelar')?.addEventListener('click', () => {
    cerrarModal('post_modal_nueva');
  });

  document.getElementById('post_modal_guardar')?.addEventListener('click', () => {
    const empresa = document.getElementById('postul_empresa')?.value.trim();
    const cargo   = document.getElementById('postul_cargo')?.value.trim();
    const idioma  = document.getElementById('postul_idioma')?.value || _lang;
    const notas   = document.getElementById('postul_vacante')?.value.trim() || '';
    const cvFile  = document.getElementById('postul_cv')?.files?.[0] || null;

    if (!empresa || !cargo) {
      wiTip(document.getElementById('postul_empresa'), _lang === 'en' ? 'Complete both fields' : 'Completa ambos campos', 'error');
      return;
    }

    const nueva = crearPostulacion(empresa, cargo, idioma, notas);
    cerrarModal('post_modal_nueva');

    // Limpiar campos del modal
    document.getElementById('postul_empresa').value = '';
    document.getElementById('postul_cargo').value   = '';
    document.getElementById('postul_vacante').value = '';
    document.getElementById('postul_cv').value      = '';
    const cvNombreEl = document.getElementById('postul_cv_nombre');
    if (cvNombreEl) cvNombreEl.textContent = _lg['post.modalCvNinguno'] || 'Ningún archivo';

    cargarActiva(nueva.id);

    // Si se seleccionó un CV en el modal, procesarlo automáticamente
    if (cvFile) {
      procesarArchivoCv(cvFile);
    }
  });

  // Eliminar candidatura
  document.getElementById('post_btn_eliminar')?.addEventListener('click', () => {
    if (!_activa) return;
    if (confirm(_lg['post.confirmarEliminar'])) {
      eliminarPostulacion(_activa.id);
      cargarActiva(null);
      Mensaje(_lg['post.eliminado'], 'success');
    }
  });

  // Subida de archivos — botón del header (topbar)
  const fileInput = document.getElementById('post_cv_file');
  fileInput?.addEventListener('change', (e) => {
    if (e.target.files?.[0]) {
      procesarArchivoCv(e.target.files[0]);
    }
  });

  document.getElementById('post_btn_subir_cv')?.addEventListener('click', () => {
    fileInput?.click();
  });

  // Subida de archivos — campo CV dentro del modal de nueva candidatura
  const postulCvInput = document.getElementById('postul_cv');
  const postulCvBtn   = document.getElementById('postul_cv_btn');
  const postulCvNombre = document.getElementById('postul_cv_nombre');

  postulCvBtn?.addEventListener('click', () => {
    postulCvInput?.click();
  });

  postulCvInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (postulCvNombre) {
      postulCvNombre.textContent = file
        ? file.name
        : (_lg['post.modalCvNinguno'] || 'Ningún archivo');
      postulCvNombre.classList.toggle('post_cv_filename--selected', !!file);
    }
  });
};
