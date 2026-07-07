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
let _quotedMessage: { role: string; text: string } | null = null;

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

  if (role === 'model') {
    textoDiv.innerHTML = mdToHtml(explicacion);

    // Verificar si hay JSON sugerido para aplicar cambios
    if (cambioCv && (cambioCv.endsWith('}') || cambioCv.includes('}'))) {
      try {
        const cleanJsonStr = cambioCv.replace('</cambio_cv>', '').trim();
        const parsed = JSON.parse(cleanJsonStr);

        const card = document.createElement('div');
        card.className = 'listo_suggestion_card';
        
        const tit = _lang === 'en' ? 'Optimizations Suggested' : 'Optimizaciones sugeridas';
        const desc = _lang === 'en' 
          ? 'ChatWii has written improvements for your resume. Apply them?'
          : 'ChatWii redactó mejoras para tu CV. ¿Deseas aplicarlas?';
        const applyText = _lang === 'en' ? 'Apply' : 'Aplicar';
        const cancelText = _lang === 'en' ? 'Discard' : 'Descartar';

        card.innerHTML = `
          <div class="listo_suggestion_title">
            <i class="fas fa-wand-magic-sparkles"></i> ${tit}
          </div>
          <div class="listo_suggestion_text">${desc}</div>
          <div class="listo_suggestion_actions">
            <button class="listo_suggest_btn_apply"><i class="fas fa-check"></i> ${applyText}</button>
            <button class="listo_suggest_btn_cancel"><i class="fas fa-times"></i> ${cancelText}</button>
          </div>
        `;

        const btnApply = card.querySelector('.listo_suggest_btn_apply') as HTMLButtonElement;
        const btnCancel = card.querySelector('.listo_suggest_btn_cancel') as HTMLButtonElement;

        btnApply.addEventListener('click', () => {
          if (typeof (window as any).listo_aplicarCambiosIA === 'function') {
            (window as any).listo_aplicarCambiosIA(parsed);
            card.remove();
          }
        });

        btnCancel.addEventListener('click', () => {
          card.remove();
        });

        textoDiv.appendChild(card);
      } catch (_) {
        // En streaming, ignore hasta que se complete el JSON
      }
    }
  } else {
    // Si contiene cita visual, limpiar para mostrar texto bonito
    const cleanUserText = texto.replace(/^\[Citado: ".*"\]\n\n/, '');
    textoDiv.textContent = cleanUserText;
  }

  burbuja.appendChild(textoDiv);

  // Acciones al Hover (WhatsApp Reply)
  const hoverActions = document.createElement('div');
  hoverActions.className = 'listo_hover_actions';
  hoverActions.innerHTML = `
    <button class="listo_hover_btn listo_btn_citar" title="${_lang === 'en' ? 'Quote' : 'Citar'}">
      <i class="fas fa-reply"></i>
    </button>
  `;

  const btnCitar = hoverActions.querySelector('.listo_btn_citar') as HTMLButtonElement;
  btnCitar.addEventListener('click', () => {
    citarMensaje(role, role === 'model' ? explicacion : texto.replace(/^\[Citado: ".*"\]\n\n/, ''));
  });

  burbuja.appendChild(hoverActions);
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
