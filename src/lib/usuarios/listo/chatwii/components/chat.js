// src/lib/usuarios/listo/chatwii/components/chat.js
// Generador HTML del Widget de ChatWii para el módulo Listo (Versión Embebida Plana)

export const crearVentanaChat = (idioma, persona) => {
  const widget = document.createElement('div');
  widget.id = 'chat_nuevo';
  widget.className = 'cr_chat_widget cr_chat_widget_plano active';

  const estadoText = idioma === 'en' ? persona.estadoOnline.en : persona.estadoOnline.es;
  const titClear = idioma === 'en' ? 'Clear Chat' : 'Limpiar Chat';
  const placeholder = idioma === 'en' ? 'Ask ChatWii (Hover to Reply)...' : 'Pregúntale a ChatWii (Hover para Citar)...';
  const disclaimer = idioma === 'en'
    ? 'Workwii AI can make mistakes. Consider checking important information.'
    : 'La IA de Workwii puede cometer errores. Considera verificar la información importante.';

  widget.innerHTML = `
    <!-- Cabecera del Chat -->
    <div class="chatwii_header">
      <img src="${persona.avatar}" alt="${persona.nombre}" class="cr_chat_header_avatar" />
      <div class="cr_chat_header_info">
        <div class="cr_chat_header_name">ChatWii listo (<span class="cr_chat_msg_count">0</span>/80) <i class="fas fa-info-circle cr_chat_info_ico"></i></div>
        <div class="cr_chat_header_status">
          <span class="cr_chat_online_dot cr_chat_online_dot_success"></span>
          <span>${estadoText}</span>
        </div>
      </div>
      <div class="cr_chat_header_actions">
        <button class="cr_chat_btn_header" id="cr_chat_btn_nuevo" data-witip="${idioma === 'en' ? 'New conversation' : 'Nueva conversación'}">
          <i class="fas fa-plus"></i>
        </button>
        <button class="cr_chat_btn_header clear" id="cr_chat_btn_limpiar" data-witip="${titClear}">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    </div>

    <!-- Area de mensajes -->
    <div class="chatwii_body" id="cr_chat_mensajes_area"></div>

    <!-- Area de Input -->
    <div class="chatwii_footer">
      <!-- Contenedor para Cita de Mensaje Citado (WhatsApp-style) -->
      <div id="list_quote_preview_container"></div>

      <div class="cr_chat_input_wrapper">
        <textarea 
          class="cr_chat_textarea" 
          id="cr_chat_textarea"
          placeholder="${placeholder}" 
          rows="1"
          maxlength="50000"
          lang="${idioma === 'en' ? 'en-US' : 'es-419'}"
          spellcheck="true"
        ></textarea>
        <button class="cr_chat_btn_send" id="cr_chat_btn_send" disabled>
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

  const titConfirmar = idioma === 'en' ? 'Clear Conversation' : 'Limpiar conversación';
  const descConfirmar = idioma === 'en'
    ? 'Are you sure you want to clear all messages? This action cannot be undone.'
    : '¿Estás seguro de que deseas borrar todos los mensajes? Esta acción no se puede deshacer.';
  const btnSi = idioma === 'en' ? 'Yes, clear' : 'Sí, limpiar';
  const btnNo = idioma === 'en' ? 'Cancel' : 'Cancelar';

  modal.innerHTML = `
    <div class="modalBody cr_modal_body">
      <button class="modalX">&times;</button>
      <div class="cr_confirm_content">
        <div class="cr_modal_icon warning listo_modal_icon_danger">
          <i class="fas fa-trash-alt"></i>
        </div>
        <h3 class="cr_modal_title">${titConfirmar}</h3>
        <p class="cr_modal_desc">${descConfirmar}</p>
        <div class="cr_modal_actions">
          <button id="cr_chat_btn_confirm_clear" class="cr_modal_btn danger listo_modal_btn_danger">
            ${btnSi}
          </button>
          <button id="cr_chat_btn_cancel_clear" class="cr_modal_btn outline">
            ${btnNo}
          </button>
        </div>
      </div>
    </div>
  `;

  return modal;
};
