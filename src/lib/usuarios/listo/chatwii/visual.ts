/**
 * visual.ts - Orquestador visual autocontenido de ChatWii para Listo
 * Gestiona el renderizado de chat, streaming, etiquetas XML y citas estilo WhatsApp.
 */

import { crearVentanaChat, crearModalConfirmacion } from './components/chat.js';
import {
  initCoach,
  enviarMensaje,
  obtenerHistorial,
  limpiarHistorial,
  obtenerSaludo
} from './brain.js';
import { mdToHtml } from './lib/procesarmd.js';
import { contieneCodigoProhibido, registrarIntentoBloqueo, estaBloqueadoTemporalmente } from './features/seguridad.js';

let _container: HTMLElement | null = null;
let _lang = 'es';
let _enviando = false;
let _persona: any = null;
let _quotedMessage: { id: string; role: string; text: string } | null = null;
let _localGetCvData: (() => any) | null = null;

/**
 * Procesa el texto crudo para separar <explicacion> de <cambio_cv>
 */
const extraerBloques = (texto: string) => {
  let explicacion = '';
  let cambioCv = '';

  const expStart = texto.indexOf('<explicacion>');
  const expEnd = texto.indexOf('</explicacion>');
  if (expStart !== -1) {
    if (expEnd !== -1) {
      explicacion = texto.substring(expStart + 13, expEnd).trim();
    } else {
      explicacion = texto.substring(expStart + 13).trim();
    }
  }

  const cvStart = texto.indexOf('<cambio_cv>');
  const cvEnd = texto.indexOf('</cambio_cv>');
  if (cvStart !== -1) {
    if (cvEnd !== -1) {
      cambioCv = texto.substring(cvStart + 11, cvEnd).trim();
    } else {
      cambioCv = texto.substring(cvStart + 11).trim();
    }
  }

  // Si no hay etiquetas XML en lo absoluto, el texto es conversación pura
  if (expStart === -1 && cvStart === -1) {
    explicacion = texto;
  }

  return { explicacion, cambioCv };
};

/**
 * Muestra el bloque citado arriba del campo de texto
 */
const citarMensaje = (role: string, text: string) => {
  _quotedMessage = { role, text };
  renderQuotePreview();
};

const renderQuotePreview = () => {
  const container = document.getElementById('list_quote_preview_container');
  if (!container) return;

  if (!_quotedMessage) {
    container.innerHTML = '';
    return;
  }

  const title = _quotedMessage.role === 'user' ? (_lang === 'en' ? 'You' : 'Tú') : 'ChatWii';
  container.innerHTML = `
    <div class="listo_quoted_preview" id="list_quoted_preview">
      <div class="listo_quote_body">
        <div class="listo_quote_title">${title}</div>
        <div class="listo_quote_text">${_quotedMessage.text}</div>
      </div>
      <button class="listo_quote_close" id="list_quote_close">&times;</button>
    </div>
  `;

  const btnClose = container.querySelector('#list_quote_close');
  btnClose?.addEventListener('click', () => {
    _quotedMessage = null;
    renderQuotePreview();
  });
};

/**
 * Agrega una burbuja al área de chat
 */
const agregarBurbuja = (role: 'user' | 'model', texto: string, scroll = true) => {
  const area = document.getElementById('cr_chat_mensajes_area');
  if (!area) return null;

  const burbuja = document.createElement('div');
  const classRole = role === 'user' ? 'user' : 'chatwii';
  burbuja.className = `cr_chat_burbuja ${classRole}`;

  if (role === 'model') {
    const avatarImg = document.createElement('img');
    avatarImg.className = 'cr_cwii_avatar_img';
    avatarImg.src = _persona ? _persona.avatar : '/img/iconos/wii.webp';
    avatarImg.alt = _persona ? _persona.nombre : 'Coach';
    burbuja.appendChild(avatarImg);
  }

  const textoDiv = document.createElement('div');
  textoDiv.className = 'cr_chat_texto';

  const { explicacion, cambioCv } = extraerBloques(texto);
  let cleanTextForQuote = '';

  if (role === 'model') {
    textoDiv.innerHTML = mdToHtml(explicacion);
    cleanTextForQuote = explicacion;

    // Verificar si hay JSON sugerido para aplicar cambios
    if (cambioCv && (cambioCv.endsWith('}') || cambioCv.includes('}'))) {
      try {
        const cleanJsonStr = cambioCv.replace('</cambio_cv>', '').trim();
        const parsed = JSON.parse(cleanJsonStr);
        const currentCv = _localGetCvData ? _localGetCvData() : {};

        const diffs: Array<{
          id: string;
          field: string;
          label: string;
          oldVal: string;
          newVal: string;
          data: any;
        }> = [];

        if (parsed.titulo && parsed.titulo !== currentCv.titulo) {
          diffs.push({
            id: 'title',
            field: 'titulo',
            label: _lang === 'en' ? 'Profession Title' : 'Título o Profesión',
            oldVal: currentCv.titulo || '',
            newVal: parsed.titulo,
            data: { titulo: parsed.titulo }
          });
        }

        if (parsed.resumen && parsed.resumen !== currentCv.resumen) {
          diffs.push({
            id: 'resumen',
            field: 'resumen',
            label: _lang === 'en' ? 'Professional Summary' : 'Resumen Profesional',
            oldVal: currentCv.resumen || '',
            newVal: parsed.resumen,
            data: { resumen: parsed.resumen }
          });
        }

        if (parsed.skills && parsed.skills !== currentCv.skills) {
          diffs.push({
            id: 'skills',
            field: 'skills',
            label: _lang === 'en' ? 'Skills' : 'Habilidades',
            oldVal: currentCv.skills || '',
            newVal: parsed.skills,
            data: { skills: parsed.skills }
          });
        }

        if (Array.isArray(parsed.experiencias)) {
          parsed.experiencias.forEach((exp: any, idx: number) => {
            const currentExp = currentCv.experiencias?.find((e: any) => e.id === exp.id);
            const puestoText = exp.puesto || 'Puesto';
            const empresaText = exp.empresa || 'Empresa';

            const formatExpText = (e: any) => {
              if (!e) return '';
              const logros = Array.isArray(e.logros) ? e.logros.join('\n') : (e.logros || '');
              return `${e.puesto || ''} @ ${e.empresa || ''}\n${e.inicio || ''} - ${e.fin || ''}\n${e.ubicacion || ''}\nLogros:\n${logros}`;
            };

            diffs.push({
              id: `exp_${exp.id || idx}`,
              field: `exp_${exp.id || idx}`,
              label: `${_lang === 'en' ? 'Experience:' : 'Experiencia:'} ${puestoText} (${empresaText})`,
              oldVal: currentExp ? formatExpText(currentExp) : (_lang === 'en' ? '(New Experience Item)' : '(Nueva Experiencia)'),
              newVal: formatExpText(exp),
              data: { experiencias: [exp] }
            });
          });
        }

        if (Array.isArray(parsed.educacion)) {
          parsed.educacion.forEach((edu: any, idx: number) => {
            const currentEdu = currentCv.educacion?.find((e: any) => e.id === edu.id);
            const gradoText = edu.grado || 'Grado';
            const instText = edu.institucion || 'Institución';

            const formatEduText = (e: any) => {
              if (!e) return '';
              return `${e.grado || ''} @ ${e.institucion || ''}\n${e.inicio || ''} - ${e.fin || ''}\n${e.ubicacion || ''}`;
            };

            diffs.push({
              id: `edu_${edu.id || idx}`,
              field: `edu_${edu.id || idx}`,
              label: `${_lang === 'en' ? 'Education:' : 'Educación:'} ${gradoText} (${instText})`,
              oldVal: currentEdu ? formatEduText(currentEdu) : (_lang === 'en' ? '(New Education Item)' : '(Nueva Educación)'),
              newVal: formatEduText(edu),
              data: { educacion: [edu] }
            });
          });
        }

        if (Array.isArray(parsed.proyectos)) {
          parsed.proyectos.forEach((proj: any, idx: number) => {
            const currentProj = currentCv.proyectos?.find((p: any) => p.id === proj.id);
            const nombreText = proj.nombre || 'Proyecto';

            const formatProjText = (p: any) => {
              if (!p) return '';
              return `${p.nombre || ''}\nLink: ${p.enlace || ''}\nTech: ${p.tecnologias || ''}\nDesc: ${p.descripcion || ''}`;
            };

            diffs.push({
              id: `proj_${proj.id || idx}`,
              field: `proj_${proj.id || idx}`,
              label: `${_lang === 'en' ? 'Project:' : 'Proyecto:'} ${nombreText}`,
              oldVal: currentProj ? formatProjText(currentProj) : (_lang === 'en' ? '(New Project Item)' : '(Nuevo Proyecto)'),
              newVal: formatProjText(proj),
              data: { proyectos: [proj] }
            });
          });
        }

        if (Array.isArray(parsed.certificaciones)) {
          parsed.certificaciones.forEach((cert: any, idx: number) => {
            const currentCert = currentCv.certificaciones?.find((c: any) => c.id === cert.id);
            const nombreText = cert.nombre || 'Certificación';

            const formatCertText = (c: any) => {
              if (!c) return '';
              return `${c.nombre || ''}\nEmisor: ${c.emisor || ''}\nFecha: ${c.fecha || ''}`;
            };

            diffs.push({
              id: `cert_${cert.id || idx}`,
              field: `cert_${cert.id || idx}`,
              label: `${_lang === 'en' ? 'Certification:' : 'Certificación:'} ${nombreText}`,
              oldVal: currentCert ? formatCertText(currentCert) : (_lang === 'en' ? '(New Certification Item)' : '(Nueva Certificación)'),
              newVal: formatCertText(cert),
              data: { certificaciones: [cert] }
            });
          });
        }

        if (Array.isArray(parsed.idiomas)) {
          const currentIdiomas = currentCv.idiomas || [];
          const newIdiomas = parsed.idiomas;
          const oldVal = currentIdiomas.filter(Boolean).join(', ');
          const newVal = newIdiomas.filter(Boolean).join(', ');

          if (oldVal !== newVal) {
            diffs.push({
              id: 'idiomas',
              field: 'idiomas',
              label: _lang === 'en' ? 'Languages' : 'Idiomas',
              oldVal: oldVal || (_lang === 'en' ? '(Empty)' : '(Vacío)'),
              newVal: newVal,
              data: { idiomas: newIdiomas }
            });
          }
        }

        if (diffs.length > 0) {
          const card = document.createElement('div');
          card.className = 'listo_suggestion_card';

          const tit = _lang === 'en' ? 'Optimizations Suggested' : 'Optimizaciones sugeridas';
          const desc = _lang === 'en' 
            ? 'Review the proposed changes below:' 
            : 'Revisa los cambios propuestos abajo:';
          const applySelectedText = _lang === 'en' ? 'Apply Selected' : 'Aplicar Selección';
          const applyAllText = _lang === 'en' ? 'Apply All' : 'Aplicar Todo';
          const discardText = _lang === 'en' ? 'Discard' : 'Descartar';

          let itemsHTML = '';
          diffs.forEach(diff => {
            itemsHTML += `
              <div class="listo_suggest_item" data-diff-id="${diff.id}">
                <div class="listo_suggest_item_header">
                  <input type="checkbox" class="listo_suggest_item_check" checked data-diff-id="${diff.id}" />
                  <span class="listo_suggest_item_title">${diff.label}</span>
                  <i class="fas fa-chevron-down listo_suggest_item_toggle"></i>
                </div>
                <div class="listo_suggest_diff_box">
                  <div class="listo_suggest_diff_section">
                    <span class="listo_suggest_diff_label">${_lang === 'en' ? 'Current:' : 'Actual:'}</span>
                    <div class="listo_suggest_diff_val_old">${diff.oldVal || (_lang === 'en' ? '(Empty)' : '(Vacío)')}</div>
                  </div>
                  <div class="listo_suggest_diff_section">
                    <span class="listo_suggest_diff_label">${_lang === 'en' ? 'Proposed:' : 'Propuesto:'}</span>
                    <div class="listo_suggest_diff_val_new">${diff.newVal}</div>
                  </div>
                </div>
              </div>
            `;
          });

          card.innerHTML = `
            <div class="listo_suggestion_title">
              <i class="fas fa-wand-magic-sparkles"></i> ${tit}
            </div>
            <div class="listo_suggestion_text listo_suggestion_desc">${desc}</div>
            <div class="listo_suggest_items_container listo_suggest_items_list">
              ${itemsHTML}
            </div>
            <div class="listo_suggestion_actions listo_suggest_actions_row">
              <button class="listo_suggest_btn_apply_selected"><i class="fas fa-check-double"></i> ${applySelectedText}</button>
              <button class="listo_suggest_btn_apply listo_suggest_btn_apply_all"><i class="fas fa-check"></i> ${applyAllText}</button>
              <button class="listo_suggest_btn_cancel"><i class="fas fa-times"></i> ${discardText}</button>
            </div>
          `;

          // Event listeners for toggle collapse/expand diffs
          const itemHeaders = card.querySelectorAll('.listo_suggest_item_header');
          itemHeaders.forEach(header => {
            header.addEventListener('click', (e) => {
              if ((e.target as HTMLElement).tagName === 'INPUT') return;
              const parent = header.closest('.listo_suggest_item');
              const box = parent?.querySelector('.listo_suggest_diff_box');
              const icon = header.querySelector('.listo_suggest_item_toggle');
              if (box && icon) {
                box.classList.toggle('show');
                icon.classList.toggle('expanded');
              }
            });
          });

          const btnApplySelected = card.querySelector('.listo_suggest_btn_apply_selected') as HTMLButtonElement;
          const btnApplyAll = card.querySelector('.listo_suggest_btn_apply_all') as HTMLButtonElement;
          const btnCancel = card.querySelector('.listo_suggest_btn_cancel') as HTMLButtonElement;

          btnApplySelected.addEventListener('click', () => {
            const checkedChecks = card.querySelectorAll('.listo_suggest_item_check:checked');
            if (checkedChecks.length === 0) return;

            const merged: any = {};
            checkedChecks.forEach(ch => {
              const diffId = ch.getAttribute('data-diff-id');
              const diff = diffs.find(d => d.id === diffId);
              if (diff) {
                if (diff.field.startsWith('exp_')) {
                  if (!merged.experiencias) merged.experiencias = [];
                  merged.experiencias.push(...diff.data.experiencias);
                } else if (diff.field.startsWith('edu_')) {
                  if (!merged.educacion) merged.educacion = [];
                  merged.educacion.push(...diff.data.educacion);
                } else if (diff.field.startsWith('proj_')) {
                  if (!merged.proyectos) merged.proyectos = [];
                  merged.proyectos.push(...diff.data.proyectos);
                } else if (diff.field.startsWith('cert_')) {
                  if (!merged.certificaciones) merged.certificaciones = [];
                  merged.certificaciones.push(...diff.data.certificaciones);
                } else {
                  merged[diff.field] = diff.data[diff.field];
                }
              }
            });

            if (typeof (window as any).listo_aplicarCambiosIA === 'function') {
              (window as any).listo_aplicarCambiosIA(merged);
              card.remove();
            }
          });

          btnApplyAll.addEventListener('click', () => {
            if (typeof (window as any).listo_aplicarCambiosIA === 'function') {
              (window as any).listo_aplicarCambiosIA(parsed);
              card.remove();
            }
          });

          btnCancel.addEventListener('click', () => {
            card.remove();
          });

          textoDiv.appendChild(card);
        }
      } catch (_) {
        // Ignorar errores parciales de JSON durante streaming
      }
    }
  } else {
    // Si contiene cita visual, limpiar para mostrar texto bonito
    const cleanUserText = texto.replace(/^\[Citado: ".*"\]\n\n/, '');
    textoDiv.textContent = cleanUserText;
    cleanTextForQuote = cleanUserText;
  }

  burbuja.appendChild(textoDiv);

  // Acciones al Hover (WhatsApp Reply) - Asociada al textoDiv para posicionamiento relativo
  const hoverActions = document.createElement('div');
  hoverActions.className = 'listo_hover_actions';
  hoverActions.innerHTML = `
    <button class="listo_hover_btn listo_btn_citar" title="${_lang === 'en' ? 'Quote' : 'Citar'}">
      <i class="fas fa-reply"></i>
    </button>
  `;

  const btnCitar = hoverActions.querySelector('.listo_btn_citar') as HTMLButtonElement;
  btnCitar.addEventListener('click', () => {
    citarMensaje(role, cleanTextForQuote);
  });

  textoDiv.appendChild(hoverActions);
  area.appendChild(burbuja);

  if (scroll) {
    area.scrollTop = area.scrollHeight;
  }
  return burbuja;
};

const agregarBurbujaStreaming = () => {
  const area = document.getElementById('cr_chat_mensajes_area');
  if (!area) return null;

  const burbuja = document.createElement('div');
  burbuja.className = 'cr_chat_burbuja chatwii cr_chat_msg_streaming';
  
  const avatarImg = document.createElement('img');
  avatarImg.className = 'cr_cwii_avatar_img';
  avatarImg.src = _persona ? _persona.avatar : '/img/iconos/wii.webp';
  avatarImg.alt = _persona ? _persona.nombre : 'Coach';
  burbuja.appendChild(avatarImg);

  const textoDiv = document.createElement('div');
  textoDiv.className = 'cr_chat_texto';
  textoDiv.innerHTML = `
    <span class="cr_typing_dot"></span>
    <span class="cr_typing_dot"></span>
    <span class="cr_typing_dot"></span>
  `;
  
  burbuja.appendChild(textoDiv);
  area.appendChild(burbuja);
  area.scrollTop = area.scrollHeight;
  return burbuja;
};

const actualizarContadorHeader = () => {
  const countSpan = document.querySelector('.cr_chat_msg_count');
  if (countSpan) {
    const userMsgs = obtenerHistorial().filter(m => m.role === 'user').length;
    countSpan.textContent = userMsgs.toString();
  }
};

export const renderHistorialChat = () => {
  const area = document.getElementById('cr_chat_mensajes_area');
  if (!area) return;
  area.innerHTML = '';

  const hist = obtenerHistorial();
  if (hist.length === 0) {
    const skeletonBurbuja = agregarBurbujaStreaming();
    actualizarContadorHeader();

    setTimeout(() => {
      if (!skeletonBurbuja) {
        agregarBurbuja('model', obtenerSaludo(), true);
        return;
      }
      const txtDiv = skeletonBurbuja.querySelector('.cr_chat_texto');
      if (txtDiv) {
        txtDiv.innerHTML = mdToHtml(obtenerSaludo());
        skeletonBurbuja.classList.remove('cr_chat_msg_streaming');
      }
      area.scrollTop = area.scrollHeight;
    }, 750);

    return;
  }

  hist.forEach(msg => {
    const text = msg.parts?.[0]?.text || '';
    agregarBurbuja(msg.role as 'user' | 'model', text, false);
  });

  actualizarContadorHeader();
  area.scrollTop = area.scrollHeight;
};

const procesarEnvioMensaje = async () => {
  if (_enviando) return;

  if (estaBloqueadoTemporalmente()) {
    const errorMsg = _lang === 'en' 
      ? 'Access locked due to security policy.' 
      : 'Acceso bloqueado debido a políticas de seguridad.';
    agregarBurbuja('model', errorMsg);
    return;
  }

  const textarea = document.getElementById('cr_chat_textarea') as HTMLTextAreaElement;
  const btnSend = document.getElementById('cr_chat_btn_send') as HTMLButtonElement;
  if (!textarea) return;

  const texto = textarea.value.trim();
  if (!texto) return;

  if (contieneCodigoProhibido(texto)) {
    registrarIntentoBloqueo();
    const warnMsg = _lang === 'en'
      ? 'Warning: Invalid characters detected.'
      : 'Advertencia: Se detectaron caracteres no válidos.';
    agregarBurbuja('model', warnMsg);
    textarea.value = '';
    return;
  }

  textarea.value = '';
  textarea.style.height = 'auto';
  if (btnSend) btnSend.disabled = true;

  // Guardar cita contextual activa
  const quoteContext = _quotedMessage;
  _quotedMessage = null;
  renderQuotePreview();

  agregarBurbuja('user', quoteContext ? `[Citado: "${quoteContext.text}"]\n\n${texto}` : texto);
  actualizarContadorHeader();
  
  const streamBubble = agregarBurbujaStreaming();
  _enviando = true;
  let accumulated = '';

  try {
    await enviarMensaje(texto, (chunk) => {
      accumulated += chunk;
      if (streamBubble) {
        const txtDiv = streamBubble.querySelector('.cr_chat_texto');
        if (txtDiv) {
          const { explicacion } = extraerBloques(accumulated);
          txtDiv.innerHTML = mdToHtml(explicacion);
        }
        const area = document.getElementById('cr_chat_mensajes_area');
        if (area) area.scrollTop = area.scrollHeight;
      }
    }, quoteContext);

    // Re-render final del historial para inyectar tarjeta de sugerencias si aplica
    renderHistorialChat();
  } catch (err) {
    console.error('Error in ChatWii response:', err);
    if (streamBubble) {
      const txtDiv = streamBubble.querySelector('.cr_chat_texto');
      if (txtDiv) {
        txtDiv.className = 'cr_chat_texto error';
        txtDiv.textContent = _lang === 'en'
          ? 'Could not reach ChatWii. Please try again.'
          : 'No se pudo conectar con ChatWii. Intenta de nuevo.';
      }
    }
  } finally {
    _enviando = false;
    if (btnSend && textarea.value.trim().length > 0) {
      btnSend.disabled = false;
    }
  }
};

export const mountChatWii = (
  container: HTMLElement,
  lang: string,
  persona: any,
  getCvData: () => any,
  getOferta: () => string,
  getPostInfo: () => { nombre: string; empresa: string; cargo: string }
) => {
  _container = container;
  _lang = lang;
  _persona = persona;
  _quotedMessage = null;
  _localGetCvData = getCvData;

  initCoach(lang, getCvData, getOferta, getPostInfo);

  const widget = crearVentanaChat(lang, persona);
  container.innerHTML = '';
  container.appendChild(widget);

  let modal = document.getElementById('chat_confirm');
  if (!modal) {
    modal = crearModalConfirmacion(lang);
    document.body.appendChild(modal);
  }

  const textarea = document.getElementById('cr_chat_textarea') as HTMLTextAreaElement;
  const btnSend = document.getElementById('cr_chat_btn_send') as HTMLButtonElement;

  if (textarea) {
    textarea.addEventListener('input', () => {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 140)}px`;
      if (btnSend) btnSend.disabled = textarea.value.trim().length === 0;
    });

    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        procesarEnvioMensaje();
      }
    });
  }

  if (btnSend) {
    btnSend.addEventListener('click', procesarEnvioMensaje);
  }

  const btnLimpiar = document.getElementById('cr_chat_btn_limpiar');
  const btnNuevo = document.getElementById('cr_chat_btn_nuevo');
  if (modal) {
    const modalEl = modal;
    if (btnLimpiar) {
      btnLimpiar.addEventListener('click', () => {
        modalEl.classList.add('wiModal_open');
      });
    }
    if (btnNuevo) {
      btnNuevo.addEventListener('click', () => {
        modalEl.classList.add('wiModal_open');
      });
    }

    const btnConfirmar = document.getElementById('cr_chat_btn_confirm_clear');
    const btnCancelar = document.getElementById('cr_chat_btn_cancel_clear');
    const modalX = modalEl.querySelector('.modalX');

    if (btnConfirmar) {
      btnConfirmar.addEventListener('click', () => {
        limpiarHistorial();
        renderHistorialChat();
        modalEl.classList.remove('wiModal_open');
      });
    }

    const cerrarModalConfirm = () => {
      modalEl.classList.remove('wiModal_open');
    };

    btnCancelar?.addEventListener('click', cerrarModalConfirm);
    modalX?.addEventListener('click', cerrarModalConfirm);
  }

  renderHistorialChat();
  renderQuotePreview();
};
