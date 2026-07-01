/**
 * chat.js - Componentes HTML de Chatwii (Ventana de chat y modales independientes)
 * Escrito en espanol sin tildes para evitar problemas de codificacion.
 */

export const crearVentanaChat = (idioma, persona) => {
  const widget = document.createElement('div');
  widget.id = 'chat_nuevo';
  widget.className = 'cr_chat_widget'; // Mantiene la clase CSS original para wii.css

  const estadoText = idioma === 'en' ? persona.estadoOnline.en : persona.estadoOnline.es;
  const titClear = idioma === 'en' ? 'Clear' : 'Limpiar';
  const titExpand = idioma === 'en' ? 'Expand' : 'Agrandar';
  const titClose = idioma === 'en' ? 'Close' : 'Cerrar';
  const placeholder = idioma === 'en' ? 'Type a message...' : 'Escribe un mensaje...';
  const disclaimer = idioma === 'en'
    ? 'Workwii AI can make mistakes. Consider checking important information.'
    : 'La IA de Workwii puede cometer errores. Considera verificar la informacion importante.';

  widget.innerHTML = `
    <!-- Cabecera -->
    <div class="cr_chat_header">
      <img src="${persona.avatar}" alt="${persona.nombre}" class="cr_chat_header_avatar" />
      <div class="cr_chat_header_info">
        <div class="cr_chat_header_name">${persona.nombre}</div>
        <div class="cr_chat_header_status">
          <span class="cr_chat_online_dot"></span>
          <span>${estadoText}</span>
        </div>
      </div>
      <div class="cr_chat_header_actions">
        <button class="cr_chat_btn_header clear" data-witip="${titClear}">
          <i class="fas fa-trash-alt"></i>
        </button>
        <button class="cr_chat_btn_header expand" data-witip="${titExpand}">
          <i class="fas fa-expand"></i>
        </button>
        <button class="cr_chat_btn_header close" data-witip="${titClose}">
          <i class="fas fa-times-circle"></i>
        </button>
      </div>
    </div>

    <!-- Area de mensajes -->
    <div class="cr_chat_mensajes" id="cr_chat_mensajes_area"></div>

    <!-- Area de Input -->
    <div class="cr_chat_input_area">
      <div class="cr_chat_input_wrapper">
        <textarea 
          class="cr_chat_textarea" 
          placeholder="${placeholder}" 
          rows="1"
          maxlength="1000"
        ></textarea>
        <button class="cr_chat_btn_send" disabled>
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
      <div class="cr_chat_disclaimer">
        ${disclaimer}
      </div>
    </div>
  `;

  return widget;
};

export const crearModalConfirmacion = (idioma) => {
  const modal = document.createElement('div');
  modal.id = 'chat_confirm';
  modal.className = 'wiModal';

  const titConfirmar = idioma === 'en' ? 'Clear Conversation' : 'Limpiar conversacion';
  const descConfirmar = idioma === 'en'
    ? 'Are you sure you want to clear all messages? This action cannot be undone.'
    : '¿Estas seguro de que deseas borrar todos los mensajes? Esta accion no se puede deshacer.';
  const btnSi = idioma === 'en' ? 'Yes, clear' : 'Si, limpiar';
  const btnNo = idioma === 'en' ? 'Cancel' : 'Cancelar';

  modal.innerHTML = `
    <div class="modalBody cr_confirm_modal_body" style="border-radius: 12px; padding: 25px; text-align: center; max-width: 400px; width: 90%; margin: auto;">
      <button class="modalX">&times;</button>
      <div class="cr_confirm_content">
        <div class="cr_confirm_icon_wrapper" style="font-size: 2.5rem; color: var(--warning, #f59e0b); margin-bottom: 15px;">
          <i class="fas fa-trash-alt"></i>
        </div>
        <h3 style="font-size: 1.3rem; margin-bottom: 10px; font-family: 'Poppins', sans-serif; font-weight: 600;">${titConfirmar}</h3>
        <p style="font-size: 0.95rem; margin-bottom: 20px; color: var(--tx3, #555); line-height: 1.4; font-family: 'Poppins', sans-serif;">${descConfirmar}</p>
        <div class="cr_confirm_actions" style="display: flex; gap: 10px; justify-content: center;">
          <button id="cr_chat_btn_confirm_clear" class="cr_btn primary small" style="background-color: var(--danger, #ef4444); border-color: var(--danger, #ef4444); color: white; padding: 8px 16px; border-radius: 6px; cursor: pointer; border: 1px solid transparent; font-weight: 500; font-family: 'Poppins', sans-serif;">
            ${btnSi}
          </button>
          <button id="cr_chat_btn_cancel_clear" class="cr_btn outline small" style="background: none; border: 1px solid var(--brd, #ccc); color: var(--tx, #555); padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 500; font-family: 'Poppins', sans-serif;">
            ${btnNo}
          </button>
        </div>
      </div>
    </div>
  `;

  return modal;
};

export const crearModalSeguridad = (idioma) => {
  const modal = document.createElement('div');
  modal.id = 'cr_chat_warning_modal';
  modal.className = 'wiModal';

  modal.innerHTML = `
    <div class="modalBody cr_confirm_modal_body" style="border-radius: 12px; padding: 25px; text-align: center; max-width: 400px; width: 90%; margin: auto;">
      <button class="modalX">&times;</button>
      <div class="cr_confirm_content">
        <div class="cr_confirm_icon_wrapper" style="font-size: 2.5rem; color: var(--warning, #f59e0b); margin-bottom: 15px;">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h3 style="font-size: 1.3rem; margin-bottom: 10px; font-family: 'Poppins', sans-serif; font-weight: 600;" class="warning-title"></h3>
        <p style="font-size: 0.95rem; margin-bottom: 5px; color: var(--tx3, #555); line-height: 1.4; font-family: 'Poppins', sans-serif;" class="warning-desc"></p>
      </div>
    </div>
  `;

  return modal;
};

export const crearModalBloqueo = (idioma) => {
  const modal = document.createElement('div');
  modal.id = 'cr_chat_lockout_modal';
  modal.className = 'wiModal';

  modal.innerHTML = `
    <div class="modalBody cr_confirm_modal_body" style="border-radius: 12px; padding: 25px; text-align: center; max-width: 400px; width: 90%; margin: auto;">
      <div class="cr_confirm_content">
        <div class="cr_confirm_icon_wrapper" style="font-size: 2.5rem; color: var(--danger, #ef4444); margin-bottom: 15px;">
          <i class="fas fa-ban"></i>
        </div>
        <h3 style="font-size: 1.3rem; margin-bottom: 10px; font-family: 'Poppins', sans-serif; font-weight: 600;" class="lockout-title"></h3>
        <p style="font-size: 0.95rem; margin-bottom: 10px; color: var(--tx3, #555); line-height: 1.4; font-family: 'Poppins', sans-serif;" class="lockout-desc"></p>
      </div>
    </div>
  `;

  return modal;
};
