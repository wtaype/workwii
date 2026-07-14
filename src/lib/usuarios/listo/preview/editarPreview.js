// src/lib/usuarios/listo/preview/editarPreview.js
// Módulo de Edición Directa en Vista Previa (WYSIWYG) para Listo
// Permite editar el CV haciendo clic directamente sobre la hoja A4

const DEBOUNCE_MS = 350;

let _editingInPreview = false;

export const isEditingPreview = () => _editingInPreview;

export const initEditablePreview = (printableArea, getCvData, updateCvData, onSync) => {
  if (!printableArea) return;

  const editables = printableArea.querySelectorAll('[data-edit-field]');

  const cv = getCvData();
  const cvLang = cv?.idioma || 'es';

  editables.forEach(el => {
    el.contentEditable = 'true';
    el.spellcheck = true;
    el.setAttribute('lang', cvLang);
    el.draggable = false;

    let debounceTimer = null;

    el.addEventListener('focus', () => {
      _editingInPreview = true;
      el.classList.add('cr_prev_editable_active');
    });

    el.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        _syncFieldToState(el, getCvData, updateCvData);
        if (onSync) onSync();
      }, DEBOUNCE_MS);
    });

    el.addEventListener('blur', () => {
      clearTimeout(debounceTimer);
      _editingInPreview = false;
      el.classList.remove('cr_prev_editable_active');
      _syncFieldToState(el, getCvData, updateCvData);
      if (onSync) onSync();
    });

    el.addEventListener('keydown', (e) => {
      const field = el.getAttribute('data-edit-field');
      const multilineFields = ['resumen', 'exp_logro', 'skills', 'proj_descripcion'];
      if (e.key === 'Enter' && !multilineFields.includes(field)) {
         e.preventDefault();
      }
      if (e.key === 'Escape') el.blur();
    });

    el.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = e.clipboardData?.getData('text/plain') || '';
      document.execCommand('insertText', false, text);
    });
  });
};

const _syncFieldToState = (el, getCvData, updateCvData) => {
  const field = el.getAttribute('data-edit-field');
  const text  = (el.innerText || '').trim();
  const cv    = getCvData();

  switch (field) {
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

    case 'exp_puesto':
    case 'exp_empresa':
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

    case 'edu_grado':
    case 'edu_institucion':
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

    case 'cert_nombre':
    case 'cert_emisor':
    case 'cert_fecha': {
      const certId = el.getAttribute('data-cert-id');
      const subKey = field.replace('cert_', '');
      const list   = [...(cv.certificaciones || [])];
      const idx    = list.findIndex(c => c.id === certId);
      if (idx > -1 && text !== list[idx][subKey]) {
        list[idx][subKey] = text;
        updateCvData({ certificaciones: list });
      }
      break;
    }

    case 'proj_nombre':
    case 'proj_enlace':
    case 'proj_descripcion':
    case 'proj_tecnologias': {
      const projId = el.getAttribute('data-proj-id');
      const subKey = field.replace('proj_', '');
      const list   = [...(cv.proyectos || [])];
      const idx    = list.findIndex(p => p.id === projId);
      if (idx > -1 && text !== list[idx][subKey]) {
        list[idx][subKey] = text;
        updateCvData({ proyectos: list });
      }
      break;
    }

    case 'idioma_item': {
      const idiIdx = parseInt(el.getAttribute('data-idioma-idx') || '0', 10);
      const list   = [...(cv.idiomas || [])];
      if (list[idiIdx] !== undefined && text !== list[idiIdx]) {
        list[idiIdx] = text;
        updateCvData({ idiomas: list });
      }
      break;
    }
  }
};
