// src/lib/usuarios/listo/listoVisual.js
// Controlador de persistencia, sincronización bidireccional y lógica del módulo Listo.

import { Mensaje, wiTip, abrirModal, cerrarModal } from '../../widev/widev.js';
import { estructurarCvConIA } from './preview/procesarJson.js';
import { updateA4Preview } from './preview/renderPreview.js';
import { mountChatWii, renderHistorialChat } from './chatwii/visual.js';
import { coachPersona } from './chatwii/personalidad.js';
import { descargarPdfDirecto } from './descargar/dwpdf.js';

const LS_LISTA  = 'listo_lista';
const LS_ACTIVA = 'listo_activa';

let _lang = 'es';
let _lg = {};
let _lista = [];
let _activa = null;
let _cvData = null;
let _undoStack = [];

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

// ── Historial Undo/Redo ──────────────────────────────────────────────────────

const pushToUndoStack = () => {
  if (_cvData) {
    _undoStack.push(JSON.parse(JSON.stringify(_cvData)));
    if (_undoStack.length > 10) _undoStack.shift();
  }
};

const deshacerCambio = () => {
  if (_undoStack.length === 0) return;
  const prevState = _undoStack.pop();
  _cvData = prevState;

  const keyNombre = formatKeyName(_activa.nombre);
  localStorage.setItem(`preview_listo_${keyNombre}`, JSON.stringify(_cvData));

  actualizarPreview();
  populateForm();

  Mensaje(_lg['list.deshacer'] || 'Cambio revertido', 'success');
};

const mostrarToastUndo = () => {
  const existing = document.getElementById('list_toast_undo');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'list_toast_undo';
  toast.className = 'listo_toast_undo';
  toast.innerHTML = `
    <span>${_lg['list.aplicado'] || 'CV actualizado con sugerencia.'}</span>
    <button class="listo_btn_undo_action" id="list_btn_undo_trigger">${_lg['list.deshacer'] || 'Deshacer'}</button>
  `;

  document.body.appendChild(toast);

  const btnTrigger = toast.querySelector('#list_btn_undo_trigger');
  btnTrigger?.addEventListener('click', () => {
    deshacerCambio();
    toast.remove();
  });

  setTimeout(() => {
    toast.remove();
  }, 10000);
};

// ── CRUD de Candidaturas ────────────────────────────────────────────────────

export const crearCandidatura = (empresa, cargo, idioma, notas) => {
  const nombre = `${empresa || 'Empresa'} - ${cargo || 'Cargo'}`;
  const nueva = {
    id: uid(),
    nombre,
    empresa: empresa || '',
    cargo: cargo || '',
    idioma: idioma || _lang,
    fecha: new Date().toISOString().slice(0, 10),
    notas: notas || ''
  };

  _lista.unshift(nueva);
  guardarLista();

  const keyNombre = formatKeyName(nombre);
  localStorage.setItem(`preview_listo_${keyNombre}`, '{}');
  localStorage.setItem(`chatwii_listo_${keyNombre}`, '[]');

  return nueva;
};

export const eliminarCandidatura = (id) => {
  const post = _lista.find(p => p.id === id);
  if (post) {
    const keyNombre = formatKeyName(post.nombre);
    localStorage.removeItem(`preview_listo_${keyNombre}`);
    localStorage.removeItem(`chatwii_listo_${keyNombre}`);
  }
  _lista = _lista.filter(p => p.id !== id);
  guardarLista();
};

// ── UI Sincronización y Renderizado ──────────────────────────────────────────

const renderSelector = () => {
  const sel = document.getElementById('list_selector');
  if (!sel) return;

  sel.innerHTML = _lista.length === 0
    ? `<option value="">${_lg['list.sinCandidaturas'] || 'Sin candidaturas'}</option>`
    : _lista.map(p => `<option value="${p.id}" ${_activa?.id === p.id ? 'selected' : ''}>${p.nombre}</option>`).join('');
};

const alternarControlesHeader = (mostrar) => {
  const div1 = document.querySelector('.list_desc_divider');
  const div2 = document.getElementById('list_nombre_edit_container');
  const div3 = document.getElementById('list_upload_container');
  const div4 = document.getElementById('list_btn_eliminar');
  const div5 = document.getElementById('list_btn_descargar');

  const els = [div1, div2, div3, div4, div5];
  els.forEach(el => {
    if (!el) return;
    if (mostrar) {
      el.classList.remove('dpn');
    } else {
      el.classList.add('dpn');
    }
  });
};

const cargarActiva = (id) => {
  _activa = _lista.find(p => p.id === id) || _lista[0] || null;
  _undoStack = [];

  if (_activa) {
    localStorage.setItem(LS_ACTIVA, _activa.id);
  } else {
    localStorage.removeItem(LS_ACTIVA);
  }

  const emptyEl = document.getElementById('list_empty');
  const workspaceEl = document.getElementById('list_workspace');

  if (!_activa) {
    emptyEl?.classList.remove('dpn');
    workspaceEl?.classList.add('dpn');
    alternarControlesHeader(false);
    return;
  }

  emptyEl?.classList.add('dpn');
  workspaceEl?.classList.remove('dpn');
  alternarControlesHeader(true);

  renderSelector();

  const inputNombre = document.getElementById('list_nombre_input');
  if (inputNombre) inputNombre.value = _activa.nombre;

  // Cargar CV JSON
  const keyNombre = formatKeyName(_activa.nombre);
  try {
    const rawCv = localStorage.getItem(`preview_listo_${keyNombre}`);
    _cvData = rawCv ? JSON.parse(rawCv) : {};
  } catch (_) {
    _cvData = {};
  }

  actualizarPreview();
  populateForm();

  // Montar ChatWii
  const chatContainer = document.getElementById('list_chat_container');
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
};

const renombrarCandidatura = (nuevoNombre) => {
  if (!_activa || !nuevoNombre || !nuevoNombre.trim()) return;

  const nombreLimpio = nuevoNombre.trim();
  if (nombreLimpio === _activa.nombre) return;

  const keyVieja = formatKeyName(_activa.nombre);
  const keyNueva = formatKeyName(nombreLimpio);

  const previewData = localStorage.getItem(`preview_listo_${keyVieja}`);
  if (previewData) {
    localStorage.setItem(`preview_listo_${keyNueva}`, previewData);
    localStorage.removeItem(`preview_listo_${keyVieja}`);
  }

  const chatData = localStorage.getItem(`chatwii_listo_${keyVieja}`);
  if (chatData) {
    localStorage.setItem(`chatwii_listo_${keyNueva}`, chatData);
    localStorage.removeItem(`chatwii_listo_${keyVieja}`);
  }

  _activa.nombre = nombreLimpio;
  guardarLista();
  renderSelector();

  cargarActiva(_activa.id);
  Mensaje(_lg['list.cvCargado'] || 'Nombre actualizado', 'success');
};

const actualizarPreview = () => {
  const area = document.getElementById('list_cv_printable_area');
  const vacio = document.getElementById('list_preview_vacio');

  if (_cvData && _cvData.nombre) {
    if (vacio) vacio.style.display = 'none';
    if (area) {
      area.style.display = 'block';
      updateA4Preview(_cvData, () => _cvData, updateCvDataDirecto, syncWysiwygToForm);
    }
  } else {
    if (vacio) vacio.style.display = 'flex';
    if (area) {
      area.style.display = 'none';
      area.innerHTML = '';
    }
  }
};

// Sincronizar estado directo (usado por WYSIWYG)
const updateCvDataDirecto = (fields) => {
  pushToUndoStack();
  _cvData = { ..._cvData, ...fields };
  const keyNombre = formatKeyName(_activa.nombre);
  localStorage.setItem(`preview_listo_${keyNombre}`, JSON.stringify(_cvData));
};

// Callback al finalizar la edición WYSIWYG
const syncWysiwygToForm = () => {
  populateForm();
};

// ── Rellenado y actualización del Formulario Manual ──

const populateForm = () => {
  if (!_cvData) return;

  const fields = ['nombre', 'titulo', 'email', 'telefono', 'ubicacion', 'linkedin', 'web', 'resumen', 'skills'];
  fields.forEach(field => {
    const el = document.getElementById(`list_edit_${field}`);
    if (el) el.value = _cvData[field] || '';
  });

  renderExperienciaCards();
};

const renderExperienciaCards = () => {
  const container = document.getElementById('list_editor_experiencias_container');
  if (!container) return;

  container.innerHTML = (_cvData.experiencias || []).map(exp => {
    const logrosStr = Array.isArray(exp.logros)
      ? exp.logros.join('\n')
      : (typeof exp.logros === 'string' ? exp.logros : '');

    return `
      <div class="listo_item_card" data-exp-id="${exp.id}">
        <button type="button" class="listo_btn_remove_item" data-exp-id="${exp.id}">
          <i class="fas fa-trash-alt"></i> ${_lg['list.editor.eliminar']}
        </button>
        <div class="listo_form_grid">
          <div class="listo_field">
            <label>${_lg['list.editor.puesto']}</label>
            <input type="text" class="listo_input list_exp_puesto" value="${exp.puesto || ''}" data-exp-id="${exp.id}" />
          </div>
          <div class="listo_field">
            <label>${_lg['list.editor.empresa']}</label>
            <input type="text" class="listo_input list_exp_empresa" value="${exp.empresa || ''}" data-exp-id="${exp.id}" />
          </div>
          <div class="listo_field">
            <label>${_lg['list.editor.fechas']}</label>
            <div style="display:flex; gap:8px;">
              <input type="text" class="listo_input list_exp_inicio" placeholder="Inicio" value="${exp.inicio || ''}" data-exp-id="${exp.id}" />
              <input type="text" class="listo_input list_exp_fin" placeholder="Fin" value="${exp.fin || ''}" data-exp-id="${exp.id}" />
            </div>
          </div>
          <div class="listo_field">
            <label>${_lg['list.editor.ubicacion']}</label>
            <input type="text" class="listo_input list_exp_ubicacion" value="${exp.ubicacion || ''}" data-exp-id="${exp.id}" />
          </div>
          <div class="listo_field listo_form_grid_full">
            <label>${_lg['list.editor.logros']}</label>
            <textarea class="listo_textarea list_exp_logros" rows="3" data-exp-id="${exp.id}">${logrosStr}</textarea>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Cablear botones eliminar de las tarjetas
  container.querySelectorAll('.listo_btn_remove_item').forEach(btn => {
    btn.addEventListener('click', () => {
      const expId = btn.getAttribute('data-exp-id');
      eliminarExperiencia(expId);
    });
  });

  // Cablear cambios de inputs en tarjetas de experiencia
  container.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', () => {
      const expId = el.getAttribute('data-exp-id');
      sincronizarExperienciaTarjeta(expId);
    });
  });
};

const sincronizarExperienciaTarjeta = (expId) => {
  const container = document.querySelector(`.listo_item_card[data-exp-id="${expId}"]`);
  if (!container) return;

  const puesto = (container.querySelector('.list_exp_puesto')?.value || '').trim();
  const empresa = (container.querySelector('.list_exp_empresa')?.value || '').trim();
  const inicio = (container.querySelector('.list_exp_inicio')?.value || '').trim();
  const fin = (container.querySelector('.list_exp_fin')?.value || '').trim();
  const ubicacion = (container.querySelector('.list_exp_ubicacion')?.value || '').trim();
  const logros = (container.querySelector('.list_exp_logros')?.value || '').trim();

  const idx = _cvData.experiencias.findIndex(e => e.id === expId);
  if (idx > -1) {
    pushToUndoStack();
    _cvData.experiencias[idx] = { id: expId, puesto, empresa, inicio, fin, ubicacion, logros };
    
    const keyNombre = formatKeyName(_activa.nombre);
    localStorage.setItem(`preview_listo_${keyNombre}`, JSON.stringify(_cvData));
    
    actualizarPreview();
  }
};

const eliminarExperiencia = (expId) => {
  if (!_cvData || !_cvData.experiencias) return;
  pushToUndoStack();
  _cvData.experiencias = _cvData.experiencias.filter(e => e.id !== expId);

  const keyNombre = formatKeyName(_activa.nombre);
  localStorage.setItem(`preview_listo_${keyNombre}`, JSON.stringify(_cvData));

  actualizarPreview();
  populateForm();
};

const agregarExperienciaNueva = () => {
  if (!_cvData) return;
  pushToUndoStack();

  if (!Array.isArray(_cvData.experiencias)) {
    _cvData.experiencias = [];
  }

  const rand = Math.random().toString(36).substring(2, 9);
  const nuevaExp = {
    id: `exp_${rand}`,
    puesto: '',
    empresa: '',
    ubicacion: '',
    inicio: '',
    fin: '',
    logros: ''
  };

  _cvData.experiencias.push(nuevaExp);

  const keyNombre = formatKeyName(_activa.nombre);
  localStorage.setItem(`preview_listo_${keyNombre}`, JSON.stringify(_cvData));

  actualizarPreview();
  populateForm();
};

// Sincronizar campos globales del formulario al escribir
const sincronizarFormularioGlobal = (field, val) => {
  if (!_cvData) return;
  pushToUndoStack();
  _cvData[field] = val;

  const keyNombre = formatKeyName(_activa.nombre);
  localStorage.setItem(`preview_listo_${keyNombre}`, JSON.stringify(_cvData));

  actualizarPreview();
};

// ── Procesar y Cargar Archivo CV ──

const mostrarSkeletonA4 = () => {
  const area  = document.getElementById('list_cv_printable_area');
  const vacio = document.getElementById('list_preview_vacio');
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
      <div class="post_sk_badge" style="background: var(--success); color: white">
        <i class="fas fa-brain"></i>
        <span>${_lg['list.procesando']}</span>
      </div>
    </div>
  `;
};

const procesarArchivoCv = async (file) => {
  if (!file || !_activa) return;

  const btnHeader = document.getElementById('list_btn_subir_cv');
  const btnModal  = document.getElementById('list_modal_cv_btn');
  const cvNombre  = document.getElementById('list_modal_cv_nombre');
  const ext = file.name.split('.').pop().toLowerCase();

  if (!['pdf', 'docx', 'doc'].includes(ext)) {
    Mensaje(_lg['list.cvError'], 'error');
    return;
  }

  mostrarSkeletonA4();

  const procesandoTxt = _lg['list.procesando'];
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
      const mammoth = await import('https://cdn.jsdelivr.net/npm/mammoth@1.6.0/mammoth.browser.min.js');
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      texto = result.value;
      tipo = 'text';
    }

    const cvJson = await estructurarCvConIA(texto, _activa.cargo || '', _activa.idioma || 'es', tipo, _activa.empresa || '');

    _cvData = cvJson;

    const keyNombre = formatKeyName(_activa.nombre);
    localStorage.setItem(`preview_listo_${keyNombre}`, JSON.stringify(cvJson));

    actualizarPreview();
    populateForm();

    renderHistorialChat();

    Mensaje(_lg['list.cvCargado'], 'success');

    if (cvNombre) {
      cvNombre.textContent = file.name;
      cvNombre.classList.add('listo_cv_filename--selected');
    }
  } catch (e) {
    console.error(e);
    actualizarPreview();
    Mensaje(_lg['list.cvError'], 'error');
  } finally {
    if (btnHeader) {
      btnHeader.disabled = false;
      btnHeader.innerHTML = `<i class="fas fa-cloud-upload-alt"></i> ${_lg['list.subirCV']}`;
    }
    if (btnModal) {
      btnModal.disabled = false;
      btnModal.innerHTML = `<i class="fas fa-cloud-upload-alt"></i> <span>${_lg['list.modalCvBtn']}</span>`;
    }
  }
};

// ── Bindings y Eventos del Ciclo de Vida ──

export const initListo = (lang, lg) => {
  _lang = lang;
  _lg = lg;
  window.listo_lg = lg; // Exponer traducciones globalmente para las tarjetas

  cargarLista();

  const savedId = localStorage.getItem(LS_ACTIVA);
  if (_lista.length > 0) {
    cargarActiva(savedId || _lista[0].id);
  } else {
    cargarActiva(null);
  }

  // Evento del selector de candidatura
  document.getElementById('list_selector')?.addEventListener('change', (e) => {
    cargarActiva(e.target.value);
  });

  // Rename de candidatura
  document.getElementById('list_btn_guardar_nombre')?.addEventListener('click', () => {
    const input = document.getElementById('list_nombre_input');
    if (input) renombrarCandidatura(input.value);
  });

  // Modal nueva candidatura
  document.getElementById('list_btn_nueva')?.addEventListener('click', () => {
    abrirModal('list_modal_nueva');
  });

  document.getElementById('list_modal_guardar')?.addEventListener('click', () => {
    const empresa = document.getElementById('list_modal_empresa')?.value.trim();
    const cargo   = document.getElementById('list_modal_cargo')?.value.trim();
    const idioma  = document.getElementById('list_modal_idioma')?.value || _lang;
    const notas   = document.getElementById('list_modal_vacante')?.value.trim() || '';
    const cvFile  = document.getElementById('list_modal_cv_file')?.files?.[0] || null;

    if (!empresa || !cargo) {
      wiTip(document.getElementById('list_modal_empresa'), _lang === 'en' ? 'Complete both fields' : 'Completa ambos campos', 'error');
      return;
    }

    const nueva = crearCandidatura(empresa, cargo, idioma, notas);
    cerrarModal('list_modal_nueva');

    // Resetear modal
    document.getElementById('list_modal_empresa').value = '';
    document.getElementById('list_modal_cargo').value   = '';
    document.getElementById('list_modal_vacante').value = '';
    document.getElementById('list_modal_cv_file').value = '';
    const cvNombreEl = document.getElementById('list_modal_cv_nombre');
    if (cvNombreEl) cvNombreEl.textContent = _lg['list.modalCvNinguno'];

    cargarActiva(nueva.id);

    if (cvFile) {
      procesarArchivoCv(cvFile);
    }
  });

  // Eliminar candidatura
  document.getElementById('list_btn_eliminar')?.addEventListener('click', () => {
    if (!_activa) return;
    if (confirm(_lg['list.confirmarEliminar'])) {
      eliminarCandidatura(_activa.id);
      cargarActiva(null);
      Mensaje(_lg['list.eliminado'], 'success');
    }
  });

  // Descargar PDF
  document.getElementById('list_btn_descargar')?.addEventListener('click', () => {
    if (_cvData && _cvData.nombre) {
      descargarPdfDirecto(_cvData);
    }
  });

  // Subida de archivos (Header)
  const fileInput = document.getElementById('list_cv_file');
  fileInput?.addEventListener('change', (e) => {
    if (e.target.files?.[0]) {
      procesarArchivoCv(e.target.files[0]);
    }
  });

  document.getElementById('list_btn_subir_cv')?.addEventListener('click', () => {
    fileInput?.click();
  });

  // Subida de archivos (Modal)
  const modalCvInput = document.getElementById('list_modal_cv_file');
  const modalCvBtn   = document.getElementById('list_modal_cv_btn');
  const modalCvNombre = document.getElementById('list_modal_cv_nombre');

  modalCvBtn?.addEventListener('click', () => {
    modalCvInput?.click();
  });

  modalCvInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (modalCvNombre) {
      modalCvNombre.textContent = file ? file.name : _lg['list.modalCvNinguno'];
      modalCvNombre.classList.toggle('listo_cv_filename--selected', !!file);
    }
  });

  // ── Gestión de pestañas (Tabs logic) ──
  const tabPreviewBtn = document.getElementById('list_tab_preview_btn');
  const tabEditBtn    = document.getElementById('list_tab_edit_btn');
  const tabPreviewContent = document.getElementById('list_tab_preview_content');
  const tabEditContent    = document.getElementById('list_tab_edit_content');

  const activarTab = (tab) => {
    if (tab === 'preview') {
      tabPreviewBtn?.classList.add('active');
      tabEditBtn?.classList.remove('active');
      tabPreviewContent?.classList.add('active');
      tabEditContent?.classList.remove('active');
      actualizarPreview();
    } else {
      tabPreviewBtn?.classList.remove('active');
      tabEditBtn?.classList.add('active');
      tabPreviewContent?.classList.remove('active');
      tabEditContent?.classList.add('active');
      populateForm();
    }
  };

  tabPreviewBtn?.addEventListener('click', () => activarTab('preview'));
  tabEditBtn?.addEventListener('click', () => activarTab('edit'));

  // Sincronizar inputs manuales del formulario global
  const globalInputs = ['nombre', 'titulo', 'email', 'telefono', 'ubicacion', 'linkedin', 'web', 'resumen', 'skills'];
  globalInputs.forEach(field => {
    const el = document.getElementById(`list_edit_${field}`);
    el?.addEventListener('input', () => {
      sincronizarFormularioGlobal(field, el.value);
    });
  });

  // Botón agregar experiencia
  document.getElementById('list_btn_agregar_experiencia')?.addEventListener('click', agregarExperienciaNueva);

  // ── Registrar API global para ChatWii ──
  window.listo_aplicarCambiosIA = (patches) => {
    pushToUndoStack();

    if (!_cvData) _cvData = {};
    if (patches.nombre) _cvData.nombre = patches.nombre;
    if (patches.titulo) _cvData.titulo = patches.titulo;
    if (patches.resumen) _cvData.resumen = patches.resumen;
    if (patches.skills) _cvData.skills = patches.skills;

    if (Array.isArray(patches.experiencias)) {
      if (!Array.isArray(_cvData.experiencias)) {
        _cvData.experiencias = [];
      }
      patches.experiencias.forEach(patchExp => {
        const idx = _cvData.experiencias.findIndex(e => e.id === patchExp.id);
        if (idx > -1) {
          _cvData.experiencias[idx] = { ..._cvData.experiencias[idx], ...patchExp };
        } else {
          _cvData.experiencias.push(patchExp);
        }
      });
    }

    const keyNombre = formatKeyName(_activa.nombre);
    localStorage.setItem(`preview_listo_${keyNombre}`, JSON.stringify(_cvData));

    actualizarPreview();
    populateForm();

    mostrarToastUndo();
    Mensaje(_lg['list.aplicado'], 'success');
  };
};
