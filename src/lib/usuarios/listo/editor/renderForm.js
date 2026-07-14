// src/lib/usuarios/listo/editor/renderForm.js
// Lógica para pintar dinámicamente las tarjetas de experiencia, educación, proyectos, certificaciones e idiomas en el formulario.

export const renderExperienciaCards = (cvData, lg, onInput, onDelete) => {
  const container = document.getElementById('list_editor_experiencias_container');
  if (!container) return;

  const list = cvData.experiencias || [];
  container.innerHTML = list.map(exp => {
    const logrosStr = Array.isArray(exp.logros)
      ? exp.logros.join('\n')
      : (typeof exp.logros === 'string' ? exp.logros : '');

    return `
      <div class="listo_item_card" data-exp-id="${exp.id}">
        <button type="button" class="listo_btn_remove_item" data-exp-id="${exp.id}">
          <i class="fas fa-trash-alt"></i> ${lg['list.editor.eliminar'] || 'Eliminar'}
        </button>
        <div class="listo_form_grid">
          <div class="listo_field">
            <label>${lg['list.editor.puesto'] || 'Puesto / Cargo'}</label>
            <input type="text" class="listo_input list_exp_puesto" value="${exp.puesto || ''}" data-exp-id="${exp.id}" autocomplete="off" />
          </div>
          <div class="listo_field">
            <label>${lg['list.editor.empresa'] || 'Empresa'}</label>
            <input type="text" class="listo_input list_exp_empresa" value="${exp.empresa || ''}" data-exp-id="${exp.id}" autocomplete="off" />
          </div>
          <div class="listo_field">
            <label>${lg['list.editor.fechas'] || 'Fechas (Inicio - Fin)'}</label>
            <div class="listo_form_row_flex">
              <input type="text" class="listo_input list_exp_inicio" placeholder="Inicio" value="${exp.inicio || ''}" data-exp-id="${exp.id}" autocomplete="off" />
              <input type="text" class="listo_input list_exp_fin" placeholder="Fin" value="${exp.fin || ''}" data-exp-id="${exp.id}" autocomplete="off" />
            </div>
          </div>
          <div class="listo_field">
            <label>${lg['list.editor.ubicacion'] || 'Ubicación'}</label>
            <input type="text" class="listo_input list_exp_ubicacion" value="${exp.ubicacion || ''}" data-exp-id="${exp.id}" autocomplete="off" />
          </div>
          <div class="listo_field listo_form_grid_full">
            <label>${lg['list.editor.logros'] || 'Logros (uno por línea, empezando con guion)'}</label>
            <textarea class="listo_textarea list_exp_logros" rows="3" data-exp-id="${exp.id}">${logrosStr}</textarea>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Cablear eliminar
  container.querySelectorAll('.listo_btn_remove_item').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-exp-id');
      onDelete(id);
    });
  });

  // Cablear cambios
  container.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', () => {
      const id = el.getAttribute('data-exp-id');
      onInput(id);
    });
  });
};

export const renderEducacionCards = (cvData, lg, onInput, onDelete) => {
  const container = document.getElementById('list_editor_educacion_container');
  if (!container) return;

  const list = cvData.educacion || [];
  container.innerHTML = list.map(edu => {
    return `
      <div class="listo_item_card" data-edu-id="${edu.id}">
        <button type="button" class="listo_btn_remove_item" data-edu-id="${edu.id}">
          <i class="fas fa-trash-alt"></i> ${lg['list.editor.eliminar'] || 'Eliminar'}
        </button>
        <div class="listo_form_grid">
          <div class="listo_field">
            <label>${lg['list.editor.grado'] || 'Grado / Certificación'}</label>
            <input type="text" class="listo_input list_edu_grado" value="${edu.grado || ''}" data-edu-id="${edu.id}" autocomplete="off" />
          </div>
          <div class="listo_field">
            <label>${lg['list.editor.institucion'] || 'Institución'}</label>
            <input type="text" class="listo_input list_edu_institucion" value="${edu.institucion || ''}" data-edu-id="${edu.id}" autocomplete="off" />
          </div>
          <div class="listo_field">
            <label>${lg['list.editor.fechas'] || 'Fechas (Inicio - Fin)'}</label>
            <div class="listo_form_row_flex">
              <input type="text" class="listo_input list_edu_inicio" placeholder="Inicio" value="${edu.inicio || ''}" data-edu-id="${edu.id}" autocomplete="off" />
              <input type="text" class="listo_input list_edu_fin" placeholder="Fin" value="${edu.fin || ''}" data-edu-id="${edu.id}" autocomplete="off" />
            </div>
          </div>
          <div class="listo_field">
            <label>${lg['list.editor.ubicacion'] || 'Ubicación'}</label>
            <input type="text" class="listo_input list_edu_ubicacion" value="${edu.ubicacion || ''}" data-edu-id="${edu.id}" autocomplete="off" />
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Cablear eliminar
  container.querySelectorAll('.listo_btn_remove_item').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-edu-id');
      onDelete(id);
    });
  });

  // Cablear cambios
  container.querySelectorAll('input').forEach(el => {
    el.addEventListener('input', () => {
      const id = el.getAttribute('data-edu-id');
      onInput(id);
    });
  });
};

export const renderProyectoCards = (cvData, lg, onInput, onDelete) => {
  const container = document.getElementById('list_editor_proyectos_container');
  if (!container) return;

  const list = cvData.proyectos || [];
  container.innerHTML = list.map(proj => {
    return `
      <div class="listo_item_card" data-proj-id="${proj.id}">
        <button type="button" class="listo_btn_remove_item" data-proj-id="${proj.id}">
          <i class="fas fa-trash-alt"></i> ${lg['list.editor.eliminar'] || 'Eliminar'}
        </button>
        <div class="listo_form_grid">
          <div class="listo_field">
            <label>${lg['list.editor.projNombre'] || 'Nombre del Proyecto'}</label>
            <input type="text" class="listo_input list_proj_nombre" value="${proj.nombre || ''}" data-proj-id="${proj.id}" autocomplete="off" />
          </div>
          <div class="listo_field">
            <label>${lg['list.editor.projEnlace'] || 'Enlace / URL'}</label>
            <input type="url" class="listo_input list_proj_enlace" value="${proj.enlace || ''}" data-proj-id="${proj.id}" autocomplete="off" />
          </div>
          <div class="listo_field listo_form_grid_full">
            <label>${lg['list.editor.projTech'] || 'Tecnologías (Astro, React, etc.)'}</label>
            <input type="text" class="listo_input list_proj_tecnologias" value="${proj.tecnologias || ''}" data-proj-id="${proj.id}" autocomplete="off" />
          </div>
          <div class="listo_field listo_form_grid_full">
            <label>${lg['list.editor.projDesc'] || 'Descripción'}</label>
            <textarea class="listo_textarea list_proj_descripcion" rows="3" data-proj-id="${proj.id}">${proj.descripcion || ''}</textarea>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Cablear eliminar
  container.querySelectorAll('.listo_btn_remove_item').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-proj-id');
      onDelete(id);
    });
  });

  // Cablear cambios
  container.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', () => {
      const id = el.getAttribute('data-proj-id');
      onInput(id);
    });
  });
};

export const renderCertificacionCards = (cvData, lg, onInput, onDelete) => {
  const container = document.getElementById('list_editor_certificaciones_container');
  if (!container) return;

  const list = cvData.certificaciones || [];
  container.innerHTML = list.map(cert => {
    return `
      <div class="listo_item_card" data-cert-id="${cert.id}">
        <button type="button" class="listo_btn_remove_item" data-cert-id="${cert.id}">
          <i class="fas fa-trash-alt"></i> ${lg['list.editor.eliminar'] || 'Eliminar'}
        </button>
        <div class="listo_form_grid">
          <div class="listo_field">
            <label>${lg['list.editor.certNombre'] || 'Nombre de Certificación'}</label>
            <input type="text" class="listo_input list_cert_nombre" value="${cert.nombre || ''}" data-cert-id="${cert.id}" autocomplete="off" />
          </div>
          <div class="listo_field">
            <label>${lg['list.editor.certEmisor'] || 'Emisor / Organización'}</label>
            <input type="text" class="listo_input list_cert_emisor" value="${cert.emisor || ''}" data-cert-id="${cert.id}" autocomplete="off" />
          </div>
          <div class="listo_field listo_form_grid_full">
            <label>${lg['list.editor.certFecha'] || 'Fecha / Año'}</label>
            <input type="text" class="listo_input list_cert_fecha" value="${cert.fecha || ''}" data-cert-id="${cert.id}" autocomplete="off" />
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Cablear eliminar
  container.querySelectorAll('.listo_btn_remove_item').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-cert-id');
      onDelete(id);
    });
  });

  // Cablear cambios
  container.querySelectorAll('input').forEach(el => {
    el.addEventListener('input', () => {
      const id = el.getAttribute('data-cert-id');
      onInput(id);
    });
  });
};

export const renderIdiomaCards = (cvData, lg, onInput, onDelete) => {
  const container = document.getElementById('list_editor_idiomas_container');
  if (!container) return;

  const list = cvData.idiomas || [];
  container.innerHTML = list.map((idiomaStr, idx) => {
    return `
      <div class="listo_item_card listo_idioma_card" data-idioma-idx="${idx}">
        <div class="listo_idioma_row">
          <input type="text" class="listo_input list_idioma_val listo_idioma_input" value="${idiomaStr || ''}" data-idioma-idx="${idx}" placeholder="Ej: Inglés (C1 / Avanzado)" autocomplete="off" />
          <button type="button" class="listo_btn_remove_item listo_btn_remove_idioma" data-idioma-idx="${idx}">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Cablear eliminar
  container.querySelectorAll('.listo_btn_remove_item').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idioma-idx') || '0', 10);
      onDelete(idx);
    });
  });

  // Cablear cambios
  container.querySelectorAll('input').forEach(el => {
    el.addEventListener('input', () => {
      const idx = parseInt(el.getAttribute('data-idioma-idx') || '0', 10);
      onInput(idx, el.value);
    });
  });
};
