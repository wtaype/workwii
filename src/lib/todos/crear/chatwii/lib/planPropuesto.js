/**
 * planPropuesto.js - Manejo interno de propuestas de cambios en el CV
 * Convierte JSON de cambios a campos editables e inyecta las actualizaciones de forma automatica.
 * Escrito en espanol sin tildes para evitar problemas de codificacion.
 */

import { escaparHtml } from '../features/seguridad.js';
import { CAMPOS_DIRECTOS, CAMPOS_LISTAS, ETIQUETAS_PROPIEDADES, crearNuevoItem } from '../../centralcv.js';

/**
 * Normaliza cualquier estructura de cambios de Gemini (plana, con clave patch, etc.)
 * Mapea de forma automatica cualquier campo o coleccion usando las reglas de centralcv.js.
 */
export const normalizarCambios = (patches, cv) => {
  const lista = [];
  if (!patches || !Array.isArray(patches)) return lista;

  patches.forEach(p => {
    if (!p) return;
    const target = p.patch || p; // Desenvolver si viene envuelto en { patch: ... }

    if ('campo' in target && 'valor' in target) {
      lista.push(target);
    } else {
      Object.keys(target).forEach(campo => {
        const valor = target[campo];
        
        // Si el valor es una lista configurable (experiencias, educacion, proyectos, certificaciones, etc.)
        if (CAMPOS_LISTAS.includes(campo) && Array.isArray(valor)) {
          const cvArr = cv?.[campo] || [];
          
          valor.forEach((item, index) => {
            if (typeof item !== 'object' || item === null) return;
            
            // Intentar resolver ID (1: del patch, 2: del CV por posicion, 3: creacion de plantilla)
            let itemId = item.id;
            if (!itemId) {
              if (cvArr[index] && cvArr[index].id) {
                itemId = cvArr[index].id;
              } else {
                const tempItem = crearNuevoItem(campo);
                itemId = tempItem.id || `item_${Math.random().toString(36).substring(2, 9)}`;
              }
            }

            Object.keys(item).forEach(prop => {
              if (prop === 'id') return;
              lista.push({
                campo: `${campo}_item`,
                seccion: campo,
                itemId,
                propiedad: prop,
                valor: item[prop],
                esNuevo: !cvArr[index]
              });
            });
          });
        } else if (campo === 'idiomas') {
          let valText = '';
          if (Array.isArray(valor)) {
            valText = valor.map(item => {
              if (typeof item === 'object' && item !== null) {
                const idi = item.idioma || item.nombre || '';
                const niv = item.nivel || '';
                return niv ? `${idi} - ${niv}` : idi;
              }
              return String(item);
            }).join('\n');
          } else {
            valText = String(valor);
          }
          lista.push({ campo: 'idiomas', valor: valText });
        } else {
          // Campo plano directo
          lista.push({ campo, valor });
        }
      });
    }
  });
  return lista;
};

/**
 * Guarda los cambios de forma dinamica y automatica en el objeto CV
 */
export const actualizarCvDatos = (cv, cambios) => {
  if (!cv || !cambios) return;

  cambios.forEach(p => {
    if (!p) return;
    const { campo, valor } = p;

    // Actualizacion automatica de items de listas mediante su ID
    if (campo.endsWith('_item') && p.seccion && p.itemId && p.propiedad) {
      if (!cv[p.seccion]) {
        cv[p.seccion] = [];
      }
      const listaCv = cv[p.seccion];
      let item = listaCv.find(i => i.id === p.itemId);
      
      if (!item) {
        // Inicializar usando el generador del esquema centralcv
        item = { id: p.itemId, ...crearNuevoItem(p.seccion) };
        item.id = p.itemId; // Asegurar el ID original
        listaCv.push(item);
      }

      if (p.propiedad === 'logros') {
        item.logros = Array.isArray(valor) ? valor.join('\n') : valor;
      } else {
        item[p.propiedad] = valor;
      }
    } else if (campo === 'idiomas') {
      cv.idiomas = Array.isArray(valor) ? valor : String(valor).split('\n').map(l => l.trim()).filter(Boolean);
    } else if (CAMPOS_DIRECTOS.includes(campo)) {
      cv[campo] = valor;
    }
  });
};

/**
 * Genera el marcado HTML de las textareas editables con etiquetas descriptivas automaticas
 */
export const crearHtmlFormulario = (patches, cv, lang) => {
  const normalized = normalizarCambios(patches, cv);
  if (normalized.length === 0) return '';

  let formHtml = `
    <div class="cr_patch_form">
      <div class="cr_patch_form_header">
        <i class="fas fa-magic"></i> ${lang === 'en' ? 'Suggested Updates (Editable)' : 'Propuestas de Cambios (Editable)'}
      </div>
  `;

  normalized.forEach(p => {
    const campo = p.campo;
    const valor = p.valor;
    let label = campo;
    let inputHtml = '';
    let attr = `data-campo="${campo}"`;

    const getEtiqueta = (key) => {
      const et = ETIQUETAS_PROPIEDADES[key];
      return et ? (lang === 'en' ? et.en : et.es) : key.charAt(0).toUpperCase() + key.slice(1);
    };

    if (CAMPOS_DIRECTOS.includes(campo) || campo === 'idiomas') {
      label = getEtiqueta(campo);
      const rows = campo === 'resumen' ? '4' : (campo === 'skills' || campo === 'idiomas' ? '2' : '1');
      inputHtml = `<textarea class="cr_patch_input" ${attr} rows="${rows}">${escaparHtml(valor)}</textarea>`;
    } else if (campo.endsWith('_item') && p.seccion && p.itemId && p.propiedad) {
      attr += ` data-seccion="${p.seccion}" data-item-id="${p.itemId}" data-propiedad="${p.propiedad}"`;
      if (p.esNuevo) {
        attr += ` data-es-nuevo="true"`;
      }

      // Obtener el nombre del elemento para crear una etiqueta intuitiva
      let nombreContexto = '';
      const listaCv = cv?.[p.seccion];
      if (Array.isArray(listaCv)) {
        const itemCv = listaCv.find(i => i.id === p.itemId);
        if (itemCv) {
          nombreContexto = itemCv.empresa || itemCv.institucion || itemCv.nombre || itemCv.emisor || '';
        }
      }

      // Traducir nombres de propiedades a etiquetas visuales amigables
      const propEtiqueta = getEtiqueta(p.propiedad);

      if (p.esNuevo) {
        const txtNuevo = lang === 'en' ? 'New Item' : 'Ítem Nuevo';
        label = `${propEtiqueta} (${txtNuevo})`;
      } else {
        label = nombreContexto ? `${propEtiqueta} en ${nombreContexto}` : `${propEtiqueta} (${p.seccion})`;
      }
      
      const valText = Array.isArray(valor) ? valor.join('\n') : valor;
      const rows = p.propiedad === 'logros' || p.propiedad === 'descripcion' ? '4' : '1';
      inputHtml = `<textarea class="cr_patch_input" ${attr} rows="${rows}">${escaparHtml(valText)}</textarea>`;
    } else {
      label = campo.charAt(0).toUpperCase() + campo.slice(1);
      const valText = typeof valor === 'object' ? JSON.stringify(valor, null, 2) : valor;
      inputHtml = `<textarea class="cr_patch_input" ${attr} rows="3">${escaparHtml(valText)}</textarea>`;
    }

    formHtml += `
      <div class="cr_patch_field">
        <label class="cr_patch_label">${label}</label>
        ${inputHtml}
      </div>
    `;
  });

  formHtml += `</div>`;
  return formHtml;
};

/**
 * Lee las cajitas de texto modificadas por el usuario en la burbuja de chat
 */
export const extraerValoresFormulario = (textoDiv) => {
  const inputs = Array.from(textoDiv.querySelectorAll('.cr_patch_input'));
  const parchesModificados = [];

  inputs.forEach(input => {
    const campo = input.dataset.campo;
    const valorText = input.value;

    if (campo.endsWith('_item')) {
      const seccion = input.dataset.seccion;
      const itemId = input.dataset.itemId;
      const propiedad = input.dataset.propiedad;
      const esNuevo = input.dataset.esNuevo === 'true';

      let valorFinal = valorText;
      if (propiedad === 'logros') {
        valorFinal = valorText.split('\n').map(l => l.trim()).filter(Boolean);
      }
      
      parchesModificados.push({
        campo,
        seccion,
        itemId,
        propiedad,
        valor: valorFinal,
        esNuevo
      });
    } else if (campo === 'idiomas') {
      const arrayLangs = valorText.split('\n').map(l => l.trim()).filter(Boolean);
      parchesModificados.push({ campo: 'idiomas', valor: arrayLangs });
    } else {
      parchesModificados.push({ campo, valor: valorText });
    }
  });

  return parchesModificados;
};
