/**
 * visual.ts - Orquestador visual autocontenido de ChatWii para Postulaciones
 * Maneja el renderizado de la ventana de chat plano, eventos de input y renderizado de burbujas.
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

/**
 * Agrega una burbuja de mensaje al area de chat
 */
const agregarBurbuja = (role: 'user' | 'model', texto: string, scroll = true) => {
  const area = document.getElementById('cr_chat_mensajes_area');
  if (!area) return null;

  const burbuja = document.createElement('div');
  const classRole = role === 'user' ? 'user' : 'chatwii';
  burbuja.className = `cr_chat_burbuja ${classRole}`;

  // Solo agregamos avatar si es respuesta del Coach (model)
  if (role === 'model') {
    const avatarImg = document.createElement('img');
    avatarImg.className = 'cr_cwii_avatar_img';
    avatarImg.src = _persona ? _persona.avatar : '/img/iconos/wii.webp';
    avatarImg.alt = _persona ? _persona.nombre : 'Coach';
    burbuja.appendChild(avatarImg);
  }

  // Contenedor del texto
  const textoDiv = document.createElement('div');
  textoDiv.className = 'cr_chat_texto';

  if (role === 'model') {
    textoDiv.innerHTML = mdToHtml(texto);
  } else {
    textoDiv.textContent = texto;
  }

  burbuja.appendChild(textoDiv);
  area.appendChild(burbuja);

  if (scroll) {
    area.scrollTop = area.scrollHeight;
  }
  return burbuja;
};

/**
 * Agrega el indicador de escritura ("Typing...")
 */
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

/**
 * Actualiza el contador de mensajes de usuario en la cabecera del chat
 */
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
    // Skeleton typing: mostrar los puntos pulsantes primero, luego el saludo real
    const skeletonBurbuja = agregarBurbujaStreaming();
    actualizarContadorHeader();

    setTimeout(() => {
      if (!skeletonBurbuja) {
        agregarBurbuja('model', obtenerSaludo(), true);
        return;
      }
      // Reemplazar el skeleton con el saludo real renderizado en markdown
      const txtDiv = skeletonBurbuja.querySelector('.cr_chat_texto');
      if (txtDiv) {
        txtDiv.innerHTML = mdToHtml(obtenerSaludo());
        // Quitar clase streaming para que quede como burbuja normal del coach
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

/**
 * Envia el mensaje escrito al Coach y gestiona el flujo de streaming
 */
const procesarEnvioMensaje = async () => {
  if (_enviando) return;

  // Control de seguridad por XSS / bloqueos
  if (estaBloqueadoTemporalmente()) {
    const errorMsg = _lang === 'en' 
      ? 'Access locked due to security policy.' 
      : 'Acceso bloqueado debido a politicas de seguridad.';
    agregarBurbuja('model', errorMsg);
    return;
  }

  const textarea = document.getElementById('cr_chat_textarea') as HTMLTextAreaElement;
  const btnSend = document.getElementById('cr_chat_btn_send') as HTMLButtonElement;
  if (!textarea) return;

  const texto = textarea.value.trim();
  if (!texto) return;

  // Validar inyecciones
  if (contieneCodigoProhibido(texto)) {
    registrarIntentoBloqueo();
    const warnMsg = _lang === 'en'
      ? 'Warning: Invalid characters or scripts detected in your message.'
      : 'Advertencia: Se detectaron caracteres o codigos no validos en tu mensaje.';
    agregarBurbuja('model', warnMsg);
    textarea.value = '';
    return;
  }

  textarea.value = '';
  textarea.style.height = 'auto';
  if (btnSend) btnSend.disabled = true;

  agregarBurbuja('user', texto);
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
          txtDiv.innerHTML = mdToHtml(accumulated);
        }
        const area = document.getElementById('cr_chat_mensajes_area');
        if (area) area.scrollTop = area.scrollHeight;
      }
    });
  } catch (err) {
    console.error('Error in Coach response:', err);
    if (streamBubble) {
      const txtDiv = streamBubble.querySelector('.cr_chat_texto');
      if (txtDiv) {
        txtDiv.className = 'cr_chat_texto error';
        txtDiv.textContent = _lang === 'en'
          ? 'Could not reach Coach Wii. Please try again.'
          : 'No se pudo conectar con Coach Wii. Intenta de nuevo.';
      }
    }
  } finally {
    _enviando = false;
    if (btnSend && textarea.value.trim().length > 0) {
      btnSend.disabled = false;
    }
  }
};

/**
 * Inicializa y monta el chat plano de Coach Wii
 */
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

  // Inicializar cerebro del chat
  initCoach(lang, getCvData, getOferta, getPostInfo);

  // Crear HTML del chat y montarlo
  const widget = crearVentanaChat(lang, persona);
  container.innerHTML = '';
  container.appendChild(widget);

  // Agregar el modal de confirmacion de limpieza al DOM si no existe
  let modal = document.getElementById('chat_confirm');
  if (!modal) {
    modal = crearModalConfirmacion(lang);
    document.body.appendChild(modal);
  }

  // ── Cablear eventos del input ──
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

  // Boton limpiar conversacion
  const btnLimpiar = document.getElementById('cr_chat_btn_limpiar');
  if (btnLimpiar && modal) {
    const modalEl = modal;
    btnLimpiar.addEventListener('click', () => {
      modalEl.classList.add('wiModal_open');
    });

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

  // Render inicial del historial
  renderHistorialChat();
};
