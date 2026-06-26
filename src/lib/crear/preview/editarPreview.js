// src/lib/crear/preview/editarPreview.js
// Módulo de Edición Directa en Vista Previa (WYSIWYG)
// Permite editar el CV haciendo clic directamente sobre la hoja A4
// Compatible con: /crear y /convertir-ats
// ─────────────────────────────────────────────────────────────────

const DEBOUNCE_MS = 350; // ms para sync en tiempo real mientras escribe

let _editingInPreview = false;

/** Retorna true si el usuario está editando actualmente dentro del preview */
export const isEditingPreview = () => _editingInPreview;

/**
 * Inicializa la edición WYSIWYG en el área imprimible A4.
 *
 * @param {HTMLElement} printableArea - El contenedor con el HTML del CV renderizado
 * @param {Function} getCvData        - Función que retorna el estado actual del CV
 * @param {Function} updateCvData     - Función que actualiza el estado del CV
 * @param {Function} [onSync]         - Callback opcional llamado tras sincronizar
 */
export const initEditablePreview = (printableArea, getCvData, updateCvData, onSync) => {
  if (!printableArea) return;

  const editables = printableArea.querySelectorAll('[data-edit-field]');

  editables.forEach(el => {
    // Solo activar si el elemento tiene contenido (no es un placeholder vacío)
    el.contentEditable = 'true';
    el.spellcheck = true;
    el.draggable = false;

    let debounceTimer = null;

    // ── Focus: bloquear re-render del preview ──
    el.addEventListener('focus', () => {
      _editingInPreview = true;
      el.classList.add('cr_prev_editable_active');
    });

    // ── Input: sync en tiempo real con debounce (como Word) ──
    el.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        _syncFieldToState(el, getCvData, updateCvData);
        if (onSync) onSync();
      }, DEBOUNCE_MS);
    });

    // ── Blur: sincronizar inmediatamente y desbloquear re-render ──
    el.addEventListener('blur', () => {
      clearTimeout(debounceTimer);
      _editingInPreview = false;
      el.classList.remove('cr_prev_editable_active');
      _syncFieldToState(el, getCvData, updateCvData);
      if (onSync) onSync();
    });

    // ── Enter: solo campos multilínea lo permiten ──
    el.addEventListener('keydown', (e) => {
      const field = el.getAttribute('data-edit-field');
      const multilineFields = ['resumen', 'exp_logro', 'skills'];
      if (e.key === 'Enter' && !multilineFields.includes(field)) {
        e.preventDefault();
      }
      // Esc: salir
      if (e.key === 'Escape') el.blur();
    });

    // ── Paste: solo texto plano (sin HTML) ──
    el.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = e.clipboardData?.getData('text/plain') || '';
      document.execCommand('insertText', false, text);
    });
  });
};

/**
 * Sincroniza el contenido de un elemento editable con el estado del CV.
 * @private
 */
const _syncFieldToState = (el, getCvData, updateCvData) => {
  const field = el.getAttribute('data-edit-field');
  const text  = (el.innerText || '').trim();
  const cv    = getCvData();

  switch (field) {

    // ── Campos globales ──
    case 'nombre':
      if (text !== cv.nombre) updateCvData({ nombre: text });
      break;

    case 'titulo':
      if (text !== cv.titulo) updateCvData({ titulo: text });
      break;

    case 'resumen':
      if (text !== cv.resumen) updateCvData({ resumen: text });
      break;

    case 'skills':
      if (text !== cv.skills) updateCvData({ skills: text });
      break;

    // ── Campos de Experiencia ──
    case 'exp_puesto':
    case 'exp_empresa':
    case 'exp_inicio_fin':
    case 'exp_ubicacion': {
      const expId  = el.getAttribute('data-exp-id');
      const subKey = field.replace('exp_', '');
      const list   = [...cv.experiencias];
      const idx    = list.findIndex(e => e.id === expId);
      if (idx > -1 && text !== list[idx][subKey]) {
        list[idx][subKey] = text;
        updateCvData({ experiencias: list });
      }
      break;
    }

    // ── Logro individual (cada <li>) ──
    case 'exp_logro': {
      const expId    = el.getAttribute('data-exp-id');
      const logroIdx = parseInt(el.getAttribute('data-logro-idx') || '0', 10);
      const list     = [...cv.experiencias];
      const idx      = list.findIndex(e => e.id === expId);
      if (idx > -1) {
        const logros = list[idx].logros
          .split('\n')
          .map(l => l.replace(/^[-\*\•\s]+/, '').trim());
        logros[logroIdx] = text;
        const newLogros = logros.filter((_, i) => i <= logroIdx || logros[i]).join('\n');
        if (newLogros !== list[idx].logros) {
          list[idx].logros = newLogros;
          updateCvData({ experiencias: list });
        }
      }
      break;
    }

    // ── Campos de Educación ──
    case 'edu_grado':
    case 'edu_institucion':
    case 'edu_inicio_fin':
    case 'edu_ubicacion': {
      const eduId  = el.getAttribute('data-edu-id');
      const subKey = field.replace('edu_', '');
      const list   = [...cv.educacion];
      const idx    = list.findIndex(e => e.id === eduId);
      if (idx > -1 && text !== list[idx][subKey]) {
        list[idx][subKey] = text;
        updateCvData({ educacion: list });
      }
      break;
    }
  }
};
