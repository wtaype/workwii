// src/lib/usuarios/listo/listoVisual.js
// Controlador de persistencia, sincronización bidireccional y lógica del módulo Listo.

import { Mensaje, wiTip, abrirModal, cerrarModal } from '../../widev/widev.js';
import { estructurarCvConIA } from './preview/procesarJson.js';
import { updateA4Preview } from './preview/renderPreview.js';
import { mountChatWii, renderHistorialChat } from './chatwii/visual.js';
import { coachPersona } from './chatwii/personalidad.js';
import { descargarPdfDirecto } from './descargar/dwpdf.js';
import {
  renderExperienciaCards,
  renderEducacionCards,
  renderProyectoCards,
  renderCertificacionCards,
  renderIdiomaCards,
  renderReconocimientoCards,
  renderReferenciaCards,
  renderSeccionExtraCards
} from './editor/renderForm.js';

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

  renderExperienciaCards(_cvData, _lg, sincronizarExperienciaTarjeta, eliminarExperiencia);
  renderEducacionCards(_cvData, _lg, sincronizarEducacionTarjeta, eliminarEducacion);
  renderProyectoCards(_cvData, _lg, sincronizarProyectoTarjeta, eliminarProyecto);
  renderCertificacionCards(_cvData, _lg, sincronizarCertificacionTarjeta, eliminarCertificacion);
  renderIdiomaCards(_cvData, _lg, sincronizarIdiomaTarjeta, eliminarIdioma);
  renderReconocimientoCards(_cvData, _lg, sincronizarReconocimientoTarjeta, eliminarReconocimiento);
  renderReferenciaCards(_cvData, _lg, sincronizarReferenciaTarjeta, eliminarReferencia);
  renderSeccionExtraCards(_cvData, _lg, sincronizarSeccionExtraTarjeta, eliminarSeccionExtra);
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

const sincronizarEducacionTarjeta = (eduId) => {
  const container = document.querySelector(`.listo_item_card[data-edu-id="${eduId}"]`);
  if (!container) return;

  const grado = (container.querySelector('.list_edu_grado')?.value || '').trim();
  const institucion = (container.querySelector('.list_edu_institucion')?.value || '').trim();
  const inicio = (container.querySelector('.list_edu_inicio')?.value || '').trim();
  const fin = (container.querySelector('.list_edu_fin')?.value || '').trim();
  const ubicacion = (container.querySelector('.list_edu_ubicacion')?.value || '').trim();

  const idx = _cvData.educacion.findIndex(e => e.id === eduId);
  if (idx > -1) {
    pushToUndoStack();
    _cvData.educacion[idx] = { id: eduId, grado, institucion, inicio, fin, ubicacion };
    
    const keyNombre = formatKeyName(_activa.nombre);
    localStorage.setItem(`preview_listo_${keyNombre}`, JSON.stringify(_cvData));
    
    actualizarPreview();
  }
};

const eliminarEducacion = (eduId) => {
  if (!_cvData || !_cvData.educacion) return;
  pushToUndoStack();
  _cvData.educacion = _cvData.educacion.filter(e => e.id !== eduId);

  const keyNombre = formatKeyName(_activa.nombre);
  localStorage.setItem(`preview_listo_${keyNombre}`, JSON.stringify(_cvData));

  actualizarPreview();
  populateForm();
};

const agregarEducacionNueva = () => {
  if (!_cvData) return;
  pushToUndoStack();

  if (!Array.isArray(_cvData.educacion)) {
    _cvData.educacion = [];
  }

  const rand = Math.random().toString(36).substring(2, 9);
  _cvData.educacion.push({
    id: `edu_${rand}`,
    grado: '',
    institucion: '',
    inicio: '',
    fin: '',
    ubicacion: ''
  });

  const keyNombre = formatKeyName(_activa.nombre);
  localStorage.setItem(`preview_listo_${keyNombre}`, JSON.stringify(_cvData));

  actualizarPreview();
  populateForm();
};

const sincronizarProyectoTarjeta = (projId) => {
  const container = document.querySelector(`.listo_item_card[data-proj-id="${projId}"]`);
  if (!container) return;

  const nombre = (container.querySelector('.list_proj_nombre')?.value || '').trim();
  const enlace = (container.querySelector('.list_proj_enlace')?.value || '').trim();
  const tecnologias = (container.querySelector('.list_proj_tecnologias')?.value || '').trim();
  const descripcion = (container.querySelector('.list_proj_descripcion')?.value || '').trim();

  const idx = _cvData.proyectos.findIndex(p => p.id === projId);
  if (idx > -1) {
    pushToUndoStack();
    _cvData.proyectos[idx] = { id: projId, nombre, enlace, tecnologias, descripcion };
    
    const keyNombre = formatKeyName(_activa.nombre);
    localStorage.setItem(`preview_listo_${keyNombre}`, JSON.stringify(_cvData));
    
    actualizarPreview();
  }
};

const eliminarProyecto = (projId) => {
  if (!_cvData || !_cvData.proyectos) return;
  pushToUndoStack();
  _cvData.proyectos = _cvData.proyectos.filter(p => p.id !== projId);

  const keyNombre = formatKeyName(_activa.nombre);
  localStorage.setItem(`preview_listo_${keyNombre}`, JSON.stringify(_cvData));

  actualizarPreview();
  populateForm();
};

const agregarProyectoNuevo = () => {
  if (!_cvData) return;
  pushToUndoStack();

  if (!Array.isArray(_cvData.proyectos)) {
    _cvData.proyectos = [];
  }

  const rand = Math.random().toString(36).substring(2, 9);
  _cvData.proyectos.push({
    id: `proj_${rand}`,
    nombre: '',
    enlace: '',
    tecnologias: '',
    descripcion: ''
  });

  const keyNombre = formatKeyName(_activa.nombre);
  localStorage.setItem(`preview_listo_${keyNombre}`, JSON.stringify(_cvData));

  actualizarPreview();
  populateForm();
};

const sincronizarCertificacionTarjeta = (certId) => {
  const container = document.querySelector(`.listo_item_card[data-cert-id="${certId}"]`);
  if (!container) return;

  const nombre = (container.querySelector('.list_cert_nombre')?.value || '').trim();
  const emisor = (container.querySelector('.list_cert_emisor')?.value || '').trim();
  const fecha = (container.querySelector('.list_cert_fecha')?.value || '').trim();

  const idx = _cvData.certificaciones.findIndex(c => c.id === certId);
  if (idx > -1) {
    pushToUndoStack();
    _cvData.certificaciones[idx] = { id: certId, nombre, emisor, fecha };
    
    const keyNombre = formatKeyName(_activa.nombre);
    localStorage.setItem(`preview_listo_${keyNombre}`, JSON.stringify(_cvData));
    
    actualizarPreview();
  }
};

const eliminarCertificacion = (certId) => {
  if (!_cvData || !_cvData.certificaciones) return;
  pushToUndoStack();
  _cvData.certificaciones = _cvData.certificaciones.filter(c => c.id !== certId);

  const keyNombre = formatKeyName(_activa.nombre);
  localStorage.setItem(`preview_listo_${keyNombre}`, JSON.stringify(_cvData));

  actualizarPreview();
  populateForm();
};

const agregarCertificacionNueva = () => {
  if (!_cvData) return;
  pushToUndoStack();

  if (!Array.isArray(_cvData.certificaciones)) {
    _cvData.certificaciones = [];
  }

  const rand = Math.random().toString(36).substring(2, 9);
  _cvData.certificaciones.push({
    id: `cert_${rand}`,
    nombre: '',
    emisor: '',
    fecha: ''
  });

  const keyNombre = formatKeyName(_activa.nombre);
  localStorage.setItem(`preview_listo_${keyNombre}`, JSON.stringify(_cvData));

  actualizarPreview();
  populateForm();
};

const sincronizarIdiomaTarjeta = (idx, value) => {
  if (!_cvData || !Array.isArray(_cvData.idiomas)) return;
  pushToUndoStack();
  _cvData.idiomas[idx] = (value || '').trim();

  const keyNombre = formatKeyName(_activa.nombre);
  localStorage.setItem(`preview_listo_${keyNombre}`, JSON.stringify(_cvData));

  actualizarPreview();
};

const eliminarIdioma = (idx) => {
  if (!_cvData || !Array.isArray(_cvData.idiomas)) return;
  pushToUndoStack();
  _cvData.idiomas = _cvData.idiomas.filter((_, i) => i !== idx);

  const keyNombre = formatKeyName(_activa.nombre);
  localStorage.setItem(`preview_listo_${keyNombre}`, JSON.stringify(_cvData));

  actualizarPreview();
  populateForm();
};

const agregarIdiomaNuevo = () => {
  if (!_cvData) return;
  pushToUndoStack();

  if (!Array.isArray(_cvData.idiomas)) {
    _cvData.idiomas = [];
  }

  _cvData.idiomas.push('');

  const keyNombre = formatKeyName(_activa.nombre);
  localStorage.setItem(`preview_listo_${keyNombre}`, JSON.stringify(_cvData));

  actualizarPreview();
  populateForm();
};

// ── Reconocimientos ──
const sincronizarReconocimientoTarjeta = (recId) => {
  const container = document.querySelector(`.listo_item_card[data-rec-id="${recId}"]`);
  if (!container) return;

  const titulo = (container.querySelector('.list_rec_titulo')?.value || '').trim();
  const fecha = (container.querySelector('.list_rec_fecha')?.value || '').trim();
  const emisor = (container.querySelector('.list_rec_emisor')?.value || '').trim();
  const ubicacion = (container.querySelector('.list_rec_ubicacion')?.value || '').trim();
  const enlace = (container.querySelector('.list_rec_enlace')?.value || '').trim();
  const descripcion = (container.querySelector('.list_rec_descripcion')?.value || '').trim();

  const idx = (_cvData.reconocimientos || []).findIndex(r => r.id === recId);
  if (idx > -1) {
    pushToUndoStack();
    _cvData.reconocimientos[idx] = { id: recId, titulo, fecha, emisor, ubicacion, enlace, descripcion };
    
    const keyNombre = formatKeyName(_activa.nombre);
    localStorage.setItem(`preview_listo_${keyNombre}`, JSON.stringify(_cvData));
    
    actualizarPreview();
  }
};

const eliminarReconocimiento = (recId) => {
  if (!_cvData || !_cvData.reconocimientos) return;
  pushToUndoStack();
  _cvData.reconocimientos = _cvData.reconocimientos.filter(r => r.id !== recId);

  const keyNombre = formatKeyName(_activa.nombre);
  localStorage.setItem(`preview_listo_${keyNombre}`, JSON.stringify(_cvData));

  actualizarPreview();
  populateForm();
};

const agregarReconocimientoNuevo = () => {
  if (!_cvData) return;
  pushToUndoStack();

  if (!Array.isArray(_cvData.reconocimientos)) {
    _cvData.reconocimientos = [];
  }

  const rand = Math.random().toString(36).substring(2, 9);
  _cvData.reconocimientos.push({
    id: `rec_${rand}`,
    titulo: '',
    fecha: '',
    emisor: '',
    ubicacion: '',
    enlace: '',
    descripcion: ''
  });

  const keyNombre = formatKeyName(_activa.nombre);
  localStorage.setItem(`preview_listo_${keyNombre}`, JSON.stringify(_cvData));

  actualizarPreview();
  populateForm();
};

// ── Referencias ──
const sincronizarReferenciaTarjeta = (refId) => {
  const container = document.querySelector(`.listo_item_card[data-ref-id="${refId}"]`);
  if (!container) return;

  const nombre = (container.querySelector('.list_ref_nombre')?.value || '').trim();
  const cargo = (container.querySelector('.list_ref_cargo')?.value || '').trim();
  const empresa = (container.querySelector('.list_ref_empresa')?.value || '').trim();
  const telefono = (container.querySelector('.list_ref_telefono')?.value || '').trim();
  const email = (container.querySelector('.list_ref_email')?.value || '').trim();
  const relacion = (container.querySelector('.list_ref_relacion')?.value || '').trim();

  const idx = (_cvData.referencias || []).findIndex(r => r.id === refId);
  if (idx > -1) {
    pushToUndoStack();
    _cvData.referencias[idx] = { id: refId, nombre, cargo, empresa, telefono, email, relacion };
    
    const keyNombre = formatKeyName(_activa.nombre);
    localStorage.setItem(`preview_listo_${keyNombre}`, JSON.stringify(_cvData));
    
    actualizarPreview();
  }
};

const eliminarReferencia = (refId) => {
  if (!_cvData || !_cvData.referencias) return;
  pushToUndoStack();
  _cvData.referencias = _cvData.referencias.filter(r => r.id !== refId);

  const keyNombre = formatKeyName(_activa.nombre);
  localStorage.setItem(`preview_listo_${keyNombre}`, JSON.stringify(_cvData));

  actualizarPreview();
  populateForm();
};

const agregarReferenciaNueva = () => {
  if (!_cvData) return;
  pushToUndoStack();

  if (!Array.isArray(_cvData.referencias)) {
    _cvData.referencias = [];
  }

  const rand = Math.random().toString(36).substring(2, 9);
  _cvData.referencias.push({
    id: `ref_${rand}`,
    nombre: '',
    cargo: '',
    empresa: '',
    telefono: '',
    email: '',
    relacion: ''
  });

  const keyNombre = formatKeyName(_activa.nombre);
  localStorage.setItem(`preview_listo_${keyNombre}`, JSON.stringify(_cvData));

  actualizarPreview();
  populateForm();
};

// ── Secciones Personalizadas ──
const sincronizarSeccionExtraTarjeta = (secId) => {
  const container = document.querySelector(`.listo_item_card[data-sec-id="${secId}"]`);
  if (!container) return;

  const titulo = (container.querySelector('.list_sec_titulo')?.value || '').trim();
  const contenido = (container.querySelector('.list_sec_contenido')?.value || '').trim();

  const idx = (_cvData.seccionesExtra || []).findIndex(s => s.id === secId);
  if (idx > -1) {
    pushToUndoStack();
    _cvData.seccionesExtra[idx] = { id: secId, titulo, contenido };
    
    const keyNombre = formatKeyName(_activa.nombre);
    localStorage.setItem(`preview_listo_${keyNombre}`, JSON.stringify(_cvData));
    
    actualizarPreview();
  }
};

const eliminarSeccionExtra = (secId) => {
  if (!_cvData || !_cvData.seccionesExtra) return;
  pushToUndoStack();
  _cvData.seccionesExtra = _cvData.seccionesExtra.filter(s => s.id !== secId);

  const keyNombre = formatKeyName(_activa.nombre);
  localStorage.setItem(`preview_listo_${keyNombre}`, JSON.stringify(_cvData));

  actualizarPreview();
  populateForm();
};

const agregarSeccionExtraNueva = () => {
  if (!_cvData) return;
  pushToUndoStack();

  if (!Array.isArray(_cvData.seccionesExtra)) {
    _cvData.seccionesExtra = [];
  }

  const rand = Math.random().toString(36).substring(2, 9);
  _cvData.seccionesExtra.push({
    id: `sec_${rand}`,
    titulo: '',
    contenido: ''
  });

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
      const mammothMod = await import('mammoth');
      const mammoth = mammothMod.default || mammothMod;
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
  const tabJobBtn     = document.getElementById('list_tab_job_btn');
  const tabPreviewContent = document.getElementById('list_tab_preview_content');
  const tabEditContent    = document.getElementById('list_tab_edit_content');
  const tabJobContent     = document.getElementById('list_tab_job_content');

  const activarTab = (tab) => {
    [tabPreviewBtn, tabEditBtn, tabJobBtn].forEach(btn => btn?.classList.remove('active'));
    [tabPreviewContent, tabEditContent, tabJobContent].forEach(c => c?.classList.remove('active'));

    if (tab === 'preview') {
      tabPreviewBtn?.classList.add('active');
      tabPreviewContent?.classList.add('active');
      actualizarPreview();
    } else if (tab === 'edit') {
      tabEditBtn?.classList.add('active');
      tabEditContent?.classList.add('active');
      populateForm();
    } else if (tab === 'job') {
      tabJobBtn?.classList.add('active');
      tabJobContent?.classList.add('active');
      if (_activa) {
        const inputEmpresa = document.getElementById('list_job_empresa');
        const inputCargo = document.getElementById('list_job_cargo');
        const inputIdioma = document.getElementById('list_job_idioma');
        const inputVacante = document.getElementById('list_job_vacante');

        if (inputEmpresa) inputEmpresa.value = _activa.empresa || '';
        if (inputCargo) inputCargo.value = _activa.cargo || '';
        if (inputIdioma) inputIdioma.value = _activa.idioma || 'es';
        if (inputVacante) inputVacante.value = _activa.notas || '';
      }
    }
  };

  tabPreviewBtn?.addEventListener('click', () => activarTab('preview'));
  tabEditBtn?.addEventListener('click', () => activarTab('edit'));
  tabJobBtn?.addEventListener('click', () => activarTab('job'));

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

  // Botones agregar Educación, Proyectos, Certificaciones e Idiomas
  document.getElementById('list_btn_agregar_educacion')?.addEventListener('click', agregarEducacionNueva);
  document.getElementById('list_btn_agregar_proyecto')?.addEventListener('click', agregarProyectoNuevo);
  document.getElementById('list_btn_agregar_certificacion')?.addEventListener('click', agregarCertificacionNueva);
  document.getElementById('list_btn_agregar_idioma')?.addEventListener('click', agregarIdiomaNuevo);
  document.getElementById('list_btn_agregar_reconocimiento')?.addEventListener('click', agregarReconocimientoNuevo);
  document.getElementById('list_btn_agregar_referencia')?.addEventListener('click', agregarReferenciaNueva);
  document.getElementById('list_btn_agregar_seccion_extra')?.addEventListener('click', agregarSeccionExtraNueva);

  // Botón guardar puesto/vacante
  document.getElementById('list_btn_guardar_job')?.addEventListener('click', () => {
    if (_activa) {
      const inputEmpresa = document.getElementById('list_job_empresa');
      const inputCargo = document.getElementById('list_job_cargo');
      const inputIdioma = document.getElementById('list_job_idioma');
      const inputVacante = document.getElementById('list_job_vacante');

      const empresa = inputEmpresa ? inputEmpresa.value.trim() : '';
      const cargo = inputCargo ? inputCargo.value.trim() : '';
      const idioma = inputIdioma ? inputIdioma.value : 'es';
      const notas = inputVacante ? inputVacante.value.trim() : '';

      _activa.empresa = empresa;
      _activa.cargo = cargo;
      _activa.idioma = idioma;
      _activa.notas = notas;

      const nuevoNombre = `${empresa || 'Empresa'} - ${cargo || 'Cargo'}`;
      if (nuevoNombre !== _activa.nombre) {
        renombrarCandidatura(nuevoNombre);
      } else {
        guardarLista();
        Mensaje(_lg['list.notasGuardadas'] || 'Datos guardados', 'success');
      }

      cargarActiva(_activa.id);
    }
  });

  // ── Registrar API global para ChatWii ──
  window.listo_aplicarCambiosIA = (patches) => {
    pushToUndoStack();

    if (!_cvData) _cvData = {};
    if (patches.nombre) _cvData.nombre = patches.nombre;
    if (patches.titulo) _cvData.titulo = patches.titulo;
    if (patches.resumen) _cvData.resumen = patches.resumen;
    if (patches.skills) _cvData.skills = patches.skills;

    // Utilidad interna para corregir/normalizar IDs temporales o vacíos sugeridos por ChatWii
    const normalizarId = (item, prefijo) => {
      const placeholder = `${prefijo}_id_original`;
      const esPlaceholder = !item.id || 
                            item.id === 'undefined' || 
                            item.id === placeholder ||
                            (typeof item.id === 'string' && item.id.includes('original')) || 
                            (typeof item.id === 'string' && item.id.includes('placeholder'));
      if (esPlaceholder) {
        const rand = Math.random().toString(36).substring(2, 9);
        item.id = `${prefijo}_${rand}`;
      }
    };

    if (Array.isArray(patches.experiencias)) {
      if (!Array.isArray(_cvData.experiencias)) {
        _cvData.experiencias = [];
      }
      patches.experiencias.forEach(patchExp => {
        normalizarId(patchExp, 'exp');
        const idx = _cvData.experiencias.findIndex(e => e.id === patchExp.id);
        if (idx > -1) {
          _cvData.experiencias[idx] = { ..._cvData.experiencias[idx], ...patchExp };
        } else {
          _cvData.experiencias.push(patchExp);
        }
      });
    }

    if (Array.isArray(patches.educacion)) {
      if (!Array.isArray(_cvData.educacion)) {
        _cvData.educacion = [];
      }
      patches.educacion.forEach(patchEdu => {
        normalizarId(patchEdu, 'edu');
        const idx = _cvData.educacion.findIndex(e => e.id === patchEdu.id);
        if (idx > -1) {
          _cvData.educacion[idx] = { ..._cvData.educacion[idx], ...patchEdu };
        } else {
          _cvData.educacion.push(patchEdu);
        }
      });
    }

    if (Array.isArray(patches.proyectos)) {
      if (!Array.isArray(_cvData.proyectos)) {
        _cvData.proyectos = [];
      }
      patches.proyectos.forEach(patchProj => {
        normalizarId(patchProj, 'proj');
        const idx = _cvData.proyectos.findIndex(p => p.id === patchProj.id);
        if (idx > -1) {
          _cvData.proyectos[idx] = { ..._cvData.proyectos[idx], ...patchProj };
        } else {
          _cvData.proyectos.push(patchProj);
        }
      });
    }

    if (Array.isArray(patches.certificaciones)) {
      if (!Array.isArray(_cvData.certificaciones)) {
        _cvData.certificaciones = [];
      }
      patches.certificaciones.forEach(patchCert => {
        normalizarId(patchCert, 'cert');
        const idx = _cvData.certificaciones.findIndex(c => c.id === patchCert.id);
        if (idx > -1) {
          _cvData.certificaciones[idx] = { ..._cvData.certificaciones[idx], ...patchCert };
        } else {
          _cvData.certificaciones.push(patchCert);
        }
      });
    }

    if (Array.isArray(patches.idiomas)) {
      _cvData.idiomas = patches.idiomas;
    }

    const keyNombre = formatKeyName(_activa.nombre);
    localStorage.setItem(`preview_listo_${keyNombre}`, JSON.stringify(_cvData));

    actualizarPreview();
    populateForm();

    mostrarToastUndo();
    Mensaje(_lg['list.aplicado'], 'success');
  };
};
