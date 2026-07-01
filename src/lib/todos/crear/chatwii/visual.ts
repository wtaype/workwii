/**
 * visual.ts - Coordinador de UI y eventos DOM para Chatwii
 * Escrito en espanol sin tildes para evitar problemas de codificacion.
 */

import { chatwiiPersona } from './personalidad.js';
import { langChatwii } from './lib/idiomaChat.js';
import { mdToHtml } from './lib/escribirMd.js';
import {
  contieneCodigoProhibido,
  estaBloqueadoTemporalmente,
  registrarIntentoBloqueo,
  obtenerIntentosRestantes,
  obtenerTiempoRestanteBloqueo
} from './features/seguridad.js';
import { clonar, guardarSesion, obtenerSesion } from './lib/procesarJson.js';
import { 
  initChatwii, 
  enviarMensaje, 
  limpiarHistorial, 
  obtenerHistorial,
  CHATWII_MAX_USES,
  CHATWII_LIMIT_KEY
} from './brain.js';
import { crearBotonFlotante } from './components/flotante.js';
import { 
  crearVentanaChat, 
  crearModalConfirmacion, 
  crearModalSeguridad, 
  crearModalBloqueo 
} from './components/chat.js';
import { abrirModal, cerrarModal } from '../../../widev/widev.js';
import { actualizarCvDatos, crearHtmlFormulario, extraerValoresFormulario } from './lib/planPropuesto.js';

let _lang = 'es';
let _getCvData: () => any = () => ({});
let _updateCvData: (data: any) => void = () => {};

/**
 * Actualiza el contador visual de mensajes restantes en la cabecera del chat
 */
export const actualizarContadorMensajes = () => {
  if (typeof window === 'undefined') return;
  const counterEl = document.querySelector('.cr_chat_counter');
  if (!counterEl) return;
  
  try {
    const raw = localStorage.getItem(`limiteHoy_${CHATWII_LIMIT_KEY}`);
    const currentUses = raw ? JSON.parse(raw).n ?? 0 : 0;
    const remaining = Math.max(0, CHATWII_MAX_USES - currentUses);
    counterEl.textContent = `(${remaining}/${CHATWII_MAX_USES})`;
  } catch (_) {
    counterEl.textContent = `(${CHATWII_MAX_USES}/${CHATWII_MAX_USES})`;
  }
};

/**
 * Renderiza una burbuja de mensaje en el area de chat
 */
export const renderBurbuja = (tipo: string, texto: string, patches: any[] | null = null) => {
  const area = document.getElementById('cr_chat_mensajes_area');
  if (!area) return null;

  const isUser = tipo === 'user';
  const isLoader = tipo === 'loader';

  const burbuja = document.createElement('div');
  burbuja.className = `cr_chat_burbuja ${isUser ? 'user' : 'chatwii'}`;

  let avatarHtml = '';
  if (!isUser) {
    avatarHtml = `<img src="${chatwiiPersona.avatar}" class="cr_cwii_avatar_img" alt="${chatwiiPersona.nombre}" />`;
  }
  burbuja.innerHTML = avatarHtml;

  const textoDiv = document.createElement('div');
  textoDiv.className = 'cr_chat_texto chatwii-texto-msg';

  if (isLoader) {
    textoDiv.innerHTML = `
      <div class="cr_chat_loader">
        <span></span><span></span><span></span>
      </div>`;
  } else {
    textoDiv.innerHTML = mdToHtml(texto);
  }

  burbuja.appendChild(textoDiv);

  // Agregar acciones de parche si existen
  if (patches && patches.length > 0) {
    const t = langChatwii[_lang] || langChatwii['es'];
    
    // 1. Crear el formulario visual con los campos editables
    const cvActualContext = _getCvData();
    const formHtml = crearHtmlFormulario(patches, cvActualContext, _lang);
    if (formHtml) {
      const formWrapper = document.createElement('div');
      formWrapper.innerHTML = formHtml;
      textoDiv.appendChild(formWrapper.firstElementChild as HTMLElement);
    }
    
    // 2. Crear las acciones del parche
    const accionesDiv = document.createElement('div');
    accionesDiv.className = 'cr_chat_acciones';
    const backupId = 'bk_' + Math.random().toString(36).substring(2, 9);
    
    accionesDiv.innerHTML = `
      <button class="cr_chat_btn_accion aplicar" data-backup="${backupId}">
        <i class="fas fa-check-circle"></i> <span class="chatwii-btn-text">${t.btnAplicar}</span>
      </button>
      <button class="cr_chat_btn_accion descartar">
        <i class="fas fa-times-circle"></i> <span class="chatwii-btn-text">${t.btnNo}</span>
      </button>
    `;

    const btnAplicar = accionesDiv.querySelector('.aplicar');
    btnAplicar?.addEventListener('click', () => {
      const backupCv = clonar(_getCvData());
      guardarSesion(backupId, backupCv);

      // Reconstruir la lista de cambios modificados en base a las cajitas de texto
      const parchesModificados = extraerValoresFormulario(textoDiv);

      const cvActual = clonar(_getCvData());
      actualizarCvDatos(cvActual, parchesModificados);
      _updateCvData(cvActual);

      if (btnAplicar) {
        btnAplicar.innerHTML = `<i class="fas fa-undo"></i> <span class="chatwii-btn-text">${t.btnDeshacer}</span>`;
        btnAplicar.className = 'cr_chat_btn_accion aplicar undo';
        
        (btnAplicar as any).onclick = () => {
          const recuperado = obtenerSesion(backupId);
          if (recuperado) {
            _updateCvData(recuperado);
            btnAplicar.innerHTML = `<i class="fas fa-check-circle"></i> <span class="chatwii-btn-text">${t.btnAplicar}</span>`;
            btnAplicar.className = 'cr_chat_btn_accion aplicar';
            if (window.Mensaje) {
              window.Mensaje(t.mensajeDeshecho, 'success');
            }
            const msgRevertido = _lang === 'en'
              ? "Understood. I have reverted those changes for you. Tell me, what should we try instead?"
              : "¡Entendido! He revertido esos cambios para ti. Dime, ¿que otra opcion te gustaria probar?";
            renderBurbuja('chatwii', msgRevertido);
          }
        };
      }

      if (window.Mensaje) {
        window.Mensaje(t.mensajeAplicado, 'success');
      }

      const msgAplicado = _lang === 'en'
        ? "Awesome! The changes have been successfully applied to your CV. What would you like to improve next?"
        : "¡Excelente! Los cambios se han aplicado correctamente a tu CV. ¿Que te gustaria mejorar ahora?";
      renderBurbuja('chatwii', msgAplicado);
    });

    accionesDiv.querySelector('.descartar')?.addEventListener('click', () => {
      accionesDiv.remove();
      const msgDescartado = _lang === 'en'
        ? "No problem, discarded! Let's think of another option. What would you like to adjust?"
        : "¡De acuerdo, descartado! Busquemos otra alternativa. Cuentame, ¿que te gustaria ajustar?";
      renderBurbuja('chatwii', msgDescartado);
    });

    textoDiv.appendChild(accionesDiv);
  }

  area.appendChild(burbuja);
  area.scrollTop = area.scrollHeight;

  return burbuja;
};

/**
 * Monta el contenedor unico #chatwii_crear en el DOM
 */
export const mountWidget = () => {
  const mountTarget = document.querySelector('.conv_wrap');
  if (!mountTarget) return; // Si no estamos en la pagina de creacion, abortamos

  let container = document.getElementById('chatwii_crear');
  if (container) {
    if (container.parentNode !== mountTarget) {
      mountTarget.appendChild(container);
    }
    actualizarContadorMensajes();
    return;
  }

  // Crear el contenedor maestro
  container = document.createElement('div');
  container.id = 'chatwii_crear';
  container.className = 'cr_chat_widget_wrapper';

  const launcher = crearBotonFlotante(_lang, chatwiiPersona);
  const widget = crearVentanaChat(_lang, chatwiiPersona);
  const modalConfirm = crearModalConfirmacion(_lang);
  const modalSeguridad = crearModalSeguridad(_lang);
  const modalBloqueo = crearModalBloqueo(_lang);

  container.appendChild(launcher);
  container.appendChild(widget);
  container.appendChild(modalConfirm);
  container.appendChild(modalSeguridad);
  container.appendChild(modalBloqueo);

  mountTarget.appendChild(container);
  actualizarContadorMensajes();

  // --- REGISTRAR LISTENERS INTERACTIVOS ---
  const box = widget;
  const areaMensajes = widget.querySelector('#cr_chat_mensajes_area');
  const textarea = widget.querySelector('.cr_chat_textarea') as HTMLTextAreaElement;
  const btnSend = widget.querySelector('.cr_chat_btn_send') as HTMLButtonElement;

  const t = langChatwii[_lang] || langChatwii['es'];

  // Función para deshabilitar el input por bloqueo
  const bloquearChatUI = (tiempoRestante: string) => {
    if (textarea) {
      textarea.disabled = true;
      textarea.value = '';
      textarea.placeholder = _lang === 'en' 
        ? 'Restricted access due to security policies.' 
        : 'Acceso restringido por politicas de seguridad.';
    }
    if (btnSend) {
      btnSend.disabled = true;
      btnSend.classList.remove('active');
    }
    
    // Inyectar textos en el modal lockout independiente
    const modalLockout = document.getElementById('cr_chat_lockout_modal');
    if (modalLockout) {
      const titleEl = modalLockout.querySelector('.lockout-title');
      const descEl = modalLockout.querySelector('.lockout-desc');
      if (titleEl) {
        titleEl.textContent = _lang === 'en' ? 'Access Restricted' : 'Acceso Restringido';
      }
      if (descEl) {
        descEl.innerHTML = _lang === 'en'
          ? `Workwii is 100% educational and professional. Your access has been locked for 24 hours.<br/><br/><strong>Remaining time:</strong> ${tiempoRestante}`
          : `Workwii es 100% educativo y profesional. Tu acceso ha sido bloqueado por 24 horas.<br/><br/><strong>Tiempo restante:</strong> ${tiempoRestante}`;
      }
    }
    
    abrirModal('cr_chat_lockout_modal');
  };

  // Verificar si ya está bloqueado al cargar
  if (estaBloqueadoTemporalmente()) {
    bloquearChatUI(obtenerTiempoRestanteBloqueo());
  }

  // Toggle abrir / cerrar chat
  launcher.addEventListener('click', () => {
    box.classList.add('active');
    launcher.classList.remove('show');
    
    if (estaBloqueadoTemporalmente()) {
      bloquearChatUI(obtenerTiempoRestanteBloqueo());
    } else {
      setTimeout(() => textarea?.focus(), 150);
    }

    if (areaMensajes && areaMensajes.children.length === 0) {
      const saludos = chatwiiPersona.saludos[_lang === 'en' ? 'en' : 'es'];
      const saludoRandom = saludos[Math.floor(Math.random() * saludos.length)];
      renderBurbuja('chatwii', saludoRandom);
    }
  });

  // Accion cerrar cabecera
  box.querySelector('.cr_chat_btn_header.close')?.addEventListener('click', () => {
    box.classList.remove('active');
    launcher.classList.add('show');
  });

  // Accion expandir/agrandar cabecera
  box.querySelector('.cr_chat_btn_header.expand')?.addEventListener('click', (e) => {
    const btn = e.currentTarget as HTMLElement;
    box.classList.toggle('maximized');
    const isMax = box.classList.contains('maximized');
    btn.innerHTML = isMax ? '<i class="fas fa-compress"></i>' : '<i class="fas fa-expand"></i>';
  });

  // Modal limpiar conversacion
  const btnClear = box.querySelector('.cr_chat_btn_header.clear');
  btnClear?.addEventListener('click', () => {
    if (!estaBloqueadoTemporalmente()) {
      abrirModal('chat_confirm');
    }
  });

  modalConfirm.querySelector('.modalX')?.addEventListener('click', () => {
    cerrarModal('chat_confirm');
  });

  modalConfirm.querySelector('#cr_chat_btn_cancel_clear')?.addEventListener('click', () => {
    cerrarModal('chat_confirm');
  });

  modalConfirm.querySelector('#cr_chat_btn_confirm_clear')?.addEventListener('click', () => {
    limpiarHistorial();
    if (areaMensajes) areaMensajes.innerHTML = '';
    cerrarModal('chat_confirm');
    
    const saludos = chatwiiPersona.saludos[_lang === 'en' ? 'en' : 'es'];
    const saludoRandom = saludos[Math.floor(Math.random() * saludos.length)];
    renderBurbuja('chatwii', saludoRandom);
  });

  // Adaptar tamaño del textarea
  textarea?.addEventListener('input', () => {
    if (estaBloqueadoTemporalmente()) return;
    textarea.style.height = 'auto';
    textarea.style.height = (textarea.scrollHeight - 6) + 'px';
    const textVal = textarea.value.trim();
    if (textVal.length > 0) {
      btnSend.removeAttribute('disabled');
      btnSend.classList.add('active');
    } else {
      btnSend.setAttribute('disabled', 'true');
      btnSend.classList.remove('active');
    }
  });

  // Enviar mensaje
  const enviarMensajeUsuario = async () => {
    if (estaBloqueadoTemporalmente()) {
      bloquearChatUI(obtenerTiempoRestanteBloqueo());
      return;
    }

    const texto = textarea.value.trim();
    if (!texto) return;

    // Escudo de seguridad (XSS y palabras prohibidas)
    if (contieneCodigoProhibido(texto)) {
      registrarIntentoBloqueo();
      
      if (estaBloqueadoTemporalmente()) {
        bloquearChatUI(obtenerTiempoRestanteBloqueo());
      } else {
        const restantes = obtenerIntentosRestantes();
        const modalWarning = document.getElementById('cr_chat_warning_modal');
        if (modalWarning) {
          const titleEl = modalWarning.querySelector('.warning-title');
          const descEl = modalWarning.querySelector('.warning-desc');
          if (titleEl) {
            titleEl.textContent = _lang === 'en' ? 'Content Blocked' : 'Contenido Bloqueado';
          }
          if (descEl) {
            descEl.innerHTML = _lang === 'en'
              ? `Workwii is 100% educational and professional. Code elements or forbidden words are not allowed.<br/><br/>You have <strong>${restantes} attempts</strong> left before being locked out for 24 hours.`
              : `Workwii es 100% educativo y profesional. No se permiten elementos de codigo ni palabras prohibidas.<br/><br/>Te quedan <strong>${restantes} intentos</strong> antes de restringir tu acceso por 24 horas.`;
          }
        }
        abrirModal('cr_chat_warning_modal');
      }
      return; // Detiene el envio y mantiene el texto intacto
    }

    textarea.value = '';
    textarea.style.height = 'auto';
    btnSend.setAttribute('disabled', 'true');
    btnSend.classList.remove('active');

    renderBurbuja('user', texto);
    const loaderBurbuja = renderBurbuja('loader', '');

    try {
      let bufferText = '';
      const response = await enviarMensaje(texto, (chunk: string) => {
        bufferText += chunk;
        const loaderTextDiv = loaderBurbuja?.querySelector('.cr_chat_texto');
        if (loaderTextDiv) {
          loaderTextDiv.innerHTML = mdToHtml(bufferText);
        }
        if (areaMensajes) areaMensajes.scrollTop = areaMensajes.scrollHeight;
      });

      loaderBurbuja?.remove();
      renderBurbuja('chatwii', response.texto, response.patches);
    } catch (err) {
      loaderBurbuja?.remove();
      renderBurbuja('chatwii', _lang === 'en' ? 'Sorry, an error occurred.' : 'Lo siento, ocurrio un error al procesar la solicitud.');
    } finally {
      actualizarContadorMensajes();
    }
  };

  btnSend?.addEventListener('click', enviarMensajeUsuario);
  
  textarea?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensajeUsuario();
    }
  });
};

/**
 * Inicializa el modulo visual y carga el historial previo si existe
 */
export const initChat = (
  lang: string,
  getCvData: () => any,
  updateCvData: (data: any) => void
) => {
  _lang = lang;
  _getCvData = getCvData;
  _updateCvData = updateCvData;

  initChatwii(lang, getCvData, updateCvData);
  mountWidget();

  // Restaurar burbujas anteriores del historial
  const areaMensajes = document.getElementById('cr_chat_mensajes_area');
  const historial = obtenerHistorial();
  if (areaMensajes && historial.length > 0) {
    historial.forEach((msg: any) => {
      let text = msg.parts[0].text;
      text = text.replace(/__PATCH__(\[.*?\]|\{.*?\})/gs, '').trim();
      renderBurbuja(msg.role === 'user' ? 'user' : 'chatwii', text);
    });
  }
};
