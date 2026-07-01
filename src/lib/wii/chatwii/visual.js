import { initChatwii, enviarMensaje, aplicarPatch, limpiarChat, getHistorial } from './brain.js';
import { mdToHtml } from './procesarmd.js';
import { langChatwii } from './lang.js';
import { abrirModal, cerrarModal, getls } from '../../widev/widev.js';

export const sanitizarMensaje = (texto) => {
  if (!texto) return '';
  // Eliminar etiquetas <script> y su contenido
  let limpio = texto.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, '');
  // Eliminar event handlers de inline HTML (ej: onload, onerror, onclick, etc)
  limpio = limpio.replace(/<[^>]+(on[a-z]+)\s*=\s*["'][^"']*["']/gi, (match, event) => {
    return match.replace(event, 'data-blocked-' + event);
  });
  return limpio.trim();
};

let _lang = 'es';
let _getCvData = null;
let _updateCvData = null;

// ── Montar el Widget Flotante y el Launcher en el DOM ──
export const mountWidget = () => {
  // Identificar el contenedor prioritario
  const mountTarget = document.querySelector('.conv_wrap') || 
                      document.getElementById('wimain') || 
                      document.querySelector('main') || 
                      document.body;

  // Si ya existen pero están en el contenedor incorrecto (ej: body), los movemos
  const existingWrapper = document.getElementById('cr_chat_widget_wrapper');
  const existingLauncher = document.getElementById('cr_chat_launcher');
  const existingClearModal = document.getElementById('cr_chat_clear_modal');

  if (existingWrapper) {
    if (existingWrapper.parentNode !== mountTarget) {
      mountTarget.appendChild(existingWrapper);
      if (existingLauncher) mountTarget.appendChild(existingLauncher);
      if (existingClearModal) mountTarget.appendChild(existingClearModal);
    }
    return;
  }

  const t = langChatwii[_lang] || langChatwii['es'];

  // 1. Crear el wrapper flotante de la ventana de chat
  const wrapper = document.createElement('div');
  wrapper.id = 'cr_chat_widget_wrapper';
  wrapper.className = 'cr_chat_widget_wrapper';
  
  wrapper.innerHTML = `
    <div class="cr_chat_widget" id="cr_chat_widget_box">
      <!-- Cabecera -->
      <div class="cr_chat_header">
        <img src="/smile.avif" alt="Chatwii" class="cr_chat_header_avatar" />
        <div class="cr_chat_header_info">
          <div class="cr_chat_header_name">${t.titulo}</div>
          <div class="cr_chat_header_status">
            <span class="cr_chat_online_dot"></span>
            <span>${t.estado}</span>
          </div>
        </div>
        <div class="cr_chat_header_actions">
          <button class="cr_chat_btn_header clear" data-witip="${t.limpiar}">
            <i class="fas fa-trash-alt"></i>
          </button>
          <button class="cr_chat_btn_header expand" data-witip="${_lang === 'en' ? 'Expand' : 'Agrandar'}">
            <i class="fas fa-expand"></i>
          </button>
          <button class="cr_chat_btn_header close" data-witip="${_lang === 'en' ? 'Close' : 'Cerrar'}">
            <i class="fas fa-times-circle"></i>
          </button>
        </div>
      </div>

      <!-- Área de mensajes -->
      <div class="cr_chat_mensajes" id="cr_chat_mensajes_area"></div>

      <!-- Área de Input -->
      <div class="cr_chat_input_area">
        <div class="cr_chat_input_wrapper">
          <textarea 
            class="cr_chat_textarea" 
            placeholder="${t.placeholder}" 
            rows="1"
            maxlength="1000"
          ></textarea>
          <button class="cr_chat_btn_send" disabled>
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
        <div class="cr_chat_disclaimer">
          ${t.disclaimer}
        </div>
      </div>
    </div>
  `;

  // 2. Crear el launcher circular flotante
  const launcher = document.createElement('div');
  launcher.id = 'cr_chat_launcher';
  launcher.className = 'cr_chat_launcher';
  launcher.setAttribute('data-witip', _lang === 'en' ? 'Chat with Chatwii' : 'Chatear con Chatwii');
  launcher.innerHTML = `<img src="/smile.avif" class="cr_chat_launcher_avatar" alt="Chatwii" />`;

  // 3. Crear el modal de confirmación de limpieza de conversación (widev.js)
  const clearModal = document.createElement('div');
  clearModal.id = 'cr_chat_clear_modal';
  clearModal.className = 'wiModal';

  const titConfirmar = _lang === 'en' ? 'Clear Conversation' : 'Limpiar conversación';
  const descConfirmar = _lang === 'en'
    ? 'Are you sure you want to clear all messages? This action cannot be undone.'
    : '¿Estás seguro de que deseas borrar todos los mensajes? Esta acción no se puede deshacer.';
  const btnSi = _lang === 'en' ? 'Yes, clear' : 'Sí, limpiar';
  const btnNo = _lang === 'en' ? 'Cancel' : 'Cancelar';

  clearModal.innerHTML = `
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

  // Inyectar los elementos en el contenedor activo
  mountTarget.appendChild(wrapper);
  mountTarget.appendChild(launcher);
  mountTarget.appendChild(clearModal);
};

// ── Renderizar una burbuja en el área de mensajes ──
export const renderBurbuja = (tipo, texto, patches = null, esRestaurado = false) => {
  const area = document.getElementById('cr_chat_mensajes_area');
  if (!area) return null;

  const isUser = tipo === 'user';
  const isLoader = tipo === 'loader';

  const burbuja = document.createElement('div');
  burbuja.className = `cr_chat_burbuja ${isUser ? 'user' : 'chatwii'}`;

  let avatarHtml = '';
  if (!isUser) {
    avatarHtml = `<img src="/smile.avif" class="cr_cwii_avatar_img" alt="Chatwii" />`;
  }

  let contenidoHtml = '';
  if (isLoader) {
    contenidoHtml = `
      <div class="cr_chat_texto">
        <div class="cr_chat_loader">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
  } else {
    const textoHtml = mdToHtml(texto);
    contenidoHtml = `<div class="cr_chat_texto chatwii-texto-msg">${textoHtml}</div>`;
  }

  burbuja.innerHTML = `
    ${avatarHtml}
    ${contenidoHtml}
  `;

  area.appendChild(burbuja);

  // Normalizar a array de parches
  const activePatches = Array.isArray(patches)
    ? patches
    : (patches ? [patches] : []);

  if (activePatches.length > 0 && !isUser && !isLoader) {
    const t = langChatwii[_lang] || langChatwii['es'];

    // Encontrar contenedores de bloques de código en la burbuja
    const codeBlocks = Array.from(burbuja.querySelectorAll('.chatwii-codeblock-container'));

    // Colección de backups de CV por parche para poder deshacer individualmente
    const backups = new Map();

    // Contenedor de acciones generales al final de la burbuja
    const accionesGenerales = document.createElement('div');
    accionesGenerales.className = 'cr_chat_acciones';
    burbuja.querySelector('.cr_chat_texto').appendChild(accionesGenerales);

    // Mapear los parches y crear sus controles individuales
    activePatches.forEach((p, idx) => {
      // Mapear parches secuencialmente a los bloques de código disponibles
      const codeBlock = codeBlocks.shift();

      if (codeBlock) {
        // Encontrado bloque de código asociado: Inyectamos los botones individuales en su cabecera
        const header = codeBlock.querySelector('.chatwii-codeblock-header');
        const codeEl = codeBlock.querySelector('code[contenteditable="true"]');
        if (header && codeEl) {
          const btnGroup = document.createElement('div');
          btnGroup.className = 'chatwii-inline-patch-actions';
          btnGroup.style.display = 'flex';
          btnGroup.style.gap = '1vh';
          btnGroup.style.marginLeft = '1.5vh';

          const btnApply = document.createElement('button');
          btnApply.className = 'chatwii-codeblock-action-btn apply';
          btnApply.innerHTML = `<i class="fas fa-check"></i> <span class="chatwii-btn-text">${esRestaurado ? t.aplicar : (_lang === 'en' ? 'Apply' : 'Aplicar')}</span>`;
          
          const btnUndo = document.createElement('button');
          btnUndo.className = 'chatwii-codeblock-action-btn undo';
          btnUndo.style.display = 'none';
          btnUndo.innerHTML = `<i class="fas fa-undo"></i> <span class="chatwii-btn-text">${_lang === 'en' ? 'Undo' : 'Deshacer'}</span>`;

          btnGroup.appendChild(btnApply);
          btnGroup.appendChild(btnUndo);
          header.appendChild(btnGroup);

          // Event Listener para Aplicar
          btnApply.addEventListener('click', () => {
            const currentCvBackup = _getCvData();
            backups.set(idx, currentCvBackup);

            // Leer contenido editado en caliente y sanitizar contra scripts maliciosos (XSS)
            const editedText = sanitizarMensaje(codeEl.innerText || codeEl.textContent || '');
            const pToApply = JSON.parse(JSON.stringify(p));
            
            if (['resumen', 'logros', 'skills', 'nombre', 'titulo', 'ubicacion'].includes(pToApply.campo)) {
              pToApply.valor = editedText.trim();
            } else if (pToApply.campo === 'experiencia_nueva' && pToApply.valor) {
              pToApply.valor.logros = editedText.trim();
            }

            aplicarPatch(pToApply);

            const exitoMsg = _lang === 'en' ? 'Section applied to CV!' : '¡Sección aplicada al CV!';
            if (window.Mensaje) window.Mensaje(exitoMsg, 'success');

            btnApply.style.display = 'none';
            btnUndo.style.display = 'inline-flex';
          });

          // Event Listener para Deshacer
          btnUndo.addEventListener('click', () => {
            const backup = backups.get(idx);
            if (backup) {
              _updateCvData(backup);
              const deshacerMsg = _lang === 'en' ? 'Changes reverted!' : '¡Cambios revertidos!';
              if (window.Mensaje) window.Mensaje(deshacerMsg, 'success');
            }
            btnApply.style.display = 'inline-flex';
            btnUndo.style.display = 'none';
          });

          if (esRestaurado) {
            btnApply.disabled = true;
            btnApply.style.opacity = '0.5';
            btnApply.style.pointerEvents = 'none';
          }
        }
      } else {
        // No hay bloque de código: Renderizar una Tarjeta de Propuesta independiente al final del texto
        const card = document.createElement('div');
        card.className = 'chatwii-proposal-card';
        
        let cardTitle = '';
        let cardContentHtml = '';

        if (p.campo === 'experiencia_nueva') {
          cardTitle = `${_lang === 'en' ? 'New Experience' : 'Nueva Experiencia'}`;
          cardContentHtml = `
            <div style="margin-bottom:0.8vh;"><strong>Empresa:</strong> <span class="chatwii-card-editable" contenteditable="true" data-field="empresa">${p.valor.empresa || ''}</span></div>
            <div style="margin-bottom:0.8vh;"><strong>Puesto:</strong> <span class="chatwii-card-editable" contenteditable="true" data-field="puesto">${p.valor.puesto || ''}</span></div>
            <div><strong>Logros:</strong> <pre class="chatwii-card-editable" contenteditable="true" data-field="logros" style="white-space:pre-wrap; margin:1vh 0; font-family:inherit;">${p.valor.logros || ''}</pre></div>
          `;
        } else if (p.campo === 'proyecto_nuevo') {
          cardTitle = `${_lang === 'en' ? 'New Project' : 'Nuevo Proyecto'}`;
          cardContentHtml = `
            <div style="margin-bottom:0.8vh;"><strong>Nombre:</strong> <span class="chatwii-card-editable" contenteditable="true" data-field="nombre">${p.valor.nombre || ''}</span></div>
            <div style="margin-bottom:0.8vh;"><strong>Enlace:</strong> <span class="chatwii-card-editable" contenteditable="true" data-field="enlace">${p.valor.enlace || ''}</span></div>
            <div style="margin-bottom:0.8vh;"><strong>Tecnologías:</strong> <span class="chatwii-card-editable" contenteditable="true" data-field="tecnologias">${p.valor.tecnologias || ''}</span></div>
            <div><strong>Descripción:</strong> <pre class="chatwii-card-editable" contenteditable="true" data-field="descripcion" style="white-space:pre-wrap; margin:1vh 0; font-family:inherit;">${p.valor.descripcion || ''}</pre></div>
          `;
        } else if (p.campo === 'certificacion_nueva') {
          cardTitle = `${_lang === 'en' ? 'New Certification' : 'Nueva Certificación'}`;
          cardContentHtml = `
            <div style="margin-bottom:0.8vh;"><strong>Nombre:</strong> <span class="chatwii-card-editable" contenteditable="true" data-field="nombre">${p.valor.nombre || ''}</span></div>
            <div style="margin-bottom:0.8vh;"><strong>Emisor:</strong> <span class="chatwii-card-editable" contenteditable="true" data-field="emisor">${p.valor.emisor || ''}</span></div>
            <div style="margin-bottom:0.8vh;"><strong>Fecha:</strong> <span class="chatwii-card-editable" contenteditable="true" data-field="fecha">${p.valor.fecha || ''}</span></div>
          `;
        } else if (p.campo === 'educacion_nueva') {
          cardTitle = `${_lang === 'en' ? 'New Education' : 'Nueva Educación'}`;
          cardContentHtml = `
            <div style="margin-bottom:0.8vh;"><strong>Institución:</strong> <span class="chatwii-card-editable" contenteditable="true" data-field="institucion">${p.valor.institucion || ''}</span></div>
            <div style="margin-bottom:0.8vh;"><strong>Grado:</strong> <span class="chatwii-card-editable" contenteditable="true" data-field="grado">${p.valor.grado || ''}</span></div>
          `;
        } else {
          cardTitle = `${_lang === 'en' ? 'Update' : 'Modificar'}: ${p.campo}`;
          cardContentHtml = `<div class="chatwii-card-editable" contenteditable="true" data-field="valor">${typeof p.valor === 'string' ? p.valor : JSON.stringify(p.valor)}</div>`;
        }

        card.innerHTML = `
          <div class="chatwii-proposal-card-header">
            <span><i class="fas fa-file-invoice"></i> ${cardTitle}</span>
            <div class="chatwii-proposal-card-actions">
              <button class="chatwii-codeblock-action-btn apply"><i class="fas fa-check"></i> ${_lang === 'en' ? 'Apply' : 'Aplicar'}</button>
              <button class="chatwii-codeblock-action-btn undo" style="display:none;"><i class="fas fa-undo"></i> ${_lang === 'en' ? 'Undo' : 'Deshacer'}</button>
            </div>
          </div>
          <div class="chatwii-proposal-card-body">
            ${cardContentHtml}
          </div>
        `;

        // Insertar la tarjeta antes de los botones de acciones generales
        burbuja.querySelector('.cr_chat_texto').insertBefore(card, accionesGenerales);

        const btnApply = card.querySelector('.chatwii-codeblock-action-btn.apply');
        const btnUndo = card.querySelector('.chatwii-codeblock-action-btn.undo');

        if (btnApply && btnUndo) {
          btnApply.addEventListener('click', () => {
            const currentCvBackup = _getCvData();
            backups.set(idx, currentCvBackup);

            // Clonar el parche original para no mutarlo
            const pToApply = JSON.parse(JSON.stringify(p));

            // Leer todos los campos editados del card y sanitizarlos
            card.querySelectorAll('.chatwii-card-editable').forEach((el) => {
              const field = el.getAttribute('data-field');
              const val = el.innerText || el.textContent || '';
              if (field) {
                if (pToApply.campo === 'valor' || pToApply.valor === undefined) {
                  pToApply.valor = sanitizarMensaje(val.trim());
                } else if (pToApply.valor && typeof pToApply.valor === 'object') {
                  pToApply.valor[field] = sanitizarMensaje(val.trim());
                }
              }
            });

            aplicarPatch(pToApply);

            const exitoMsg = _lang === 'en' ? 'Item added to CV!' : '¡Elemento agregado al CV!';
            if (window.Mensaje) window.Mensaje(exitoMsg, 'success');

            btnApply.style.display = 'none';
            btnUndo.style.display = 'inline-flex';
          });

          btnUndo.addEventListener('click', () => {
            const backup = backups.get(idx);
            if (backup) {
              _updateCvData(backup);
              const revertedMsg = _lang === 'en' ? 'Changes reverted!' : '¡Cambios revertidos!';
              if (window.Mensaje) window.Mensaje(revertedMsg, 'success');
            }
            btnApply.style.display = 'inline-flex';
            btnUndo.style.display = 'none';
          });

          if (esRestaurado) {
            btnApply.disabled = true;
            btnApply.style.opacity = '0.5';
            btnApply.style.pointerEvents = 'none';
          }
        }
      }
    });

    // Renderizar acciones generales (Aplicar Todo, Ajustar, Descartar) al final de la burbuja
    const renderAccionesGenerales = () => {
      accionesGenerales.innerHTML = `
        <button class="cr_chat_btn_accion aplicar-todo" data-witip="${_lang === 'en' ? 'Apply all changes' : 'Aplicar todos los cambios'}"><i class="fas fa-check-double"></i> ${_lang === 'en' ? 'Apply All' : 'Aplicar Todo'}</button>
        <button class="cr_chat_btn_accion ajustar" data-witip="${_lang === 'en' ? 'Adjust proposal' : 'Ajustar propuesta'}"><i class="fas fa-pen"></i> ${t.ajustar}</button>
        <button class="cr_chat_btn_accion descartar" data-witip="${_lang === 'en' ? 'Discard' : 'Descartar'}"><i class="fas fa-times-circle"></i></button>
      `;

      const btnAplicarTodo = accionesGenerales.querySelector('.aplicar-todo');
      const btnAjustar = accionesGenerales.querySelector('.ajustar');
      const btnDescartar = accionesGenerales.querySelector('.descartar');

      if (esRestaurado) {
        deshabilitarAcciones(accionesGenerales);
        return;
      }

      btnAplicarTodo.addEventListener('click', () => {
        // Ejecutar clic en todos los botones "Aplicar" individuales de las tarjetas y bloques de código de esta burbuja
        let appliedCount = 0;
        burbuja.querySelectorAll('.chatwii-codeblock-action-btn.apply').forEach((btn) => {
          if (btn.style.display !== 'none') {
            btn.click();
            appliedCount++;
          }
        });

        if (appliedCount > 0) {
          const allMsg = _lang === 'en' ? 'All changes applied!' : '¡Todos los cambios aplicados!';
          if (window.Mensaje) window.Mensaje(allMsg, 'success');
        }

        deshabilitarAcciones(accionesGenerales);
      });

      btnAjustar.addEventListener('click', () => {
        const txtArea = document.querySelector('.cr_chat_textarea');
        if (txtArea) {
          const prefill = _lang === 'en'
            ? `I like this version, but adjust it so that: `
            : `Me gusta esta versión, pero ajústala para que: `;
          txtArea.value = prefill;
          txtArea.focus();
          txtArea.dispatchEvent(new Event('input'));
        }
      });

      btnDescartar.addEventListener('click', () => {
        deshabilitarAcciones(accionesGenerales);
      });
    };

    renderAccionesGenerales();
  }

  scrollAlFinal();
  return burbuja;
};

const deshabilitarAcciones = (accionesEl) => {
  accionesEl.style.transition = 'opacity 0.2s';
  accionesEl.style.opacity = '0.4';
  accionesEl.style.pointerEvents = 'none';
};

export const scrollAlFinal = () => {
  const area = document.getElementById('cr_chat_mensajes_area');
  if (area) {
    area.scrollTop = area.scrollHeight;
  }
};

let loaderBurbuja = null;
export const setLoader = (visible) => {
  if (visible) {
    if (!loaderBurbuja) {
      loaderBurbuja = renderBurbuja('loader', '');
    }
  } else {
    if (loaderBurbuja) {
      loaderBurbuja.remove();
      loaderBurbuja = null;
    }
  }
};

export const restaurarHistorial = () => {
  const historial = getHistorial();
  historial.forEach((msg) => {
    const isUser = msg.role === 'user';
    const text = msg.parts?.[0]?.text || '';
    
    let cleanText = text;
    const patches = [];
    const matches = [...text.matchAll(/__PATCH__(\[.*?\]|\{.*?\})/gs)];
    for (const match of matches) {
      try {
        const parsed = JSON.parse(match[1]);
        if (Array.isArray(parsed)) {
          patches.push(...parsed);
        } else {
          patches.push(parsed);
        }
      } catch (_) {}
    }
    cleanText = text.replace(/__PATCH__(\[.*?\]|\{.*?\})/gs, '').trim();

    renderBurbuja(isUser ? 'user' : 'chatwii', cleanText, patches.length > 0 ? patches : null, true);
  });
};

// ── Saludo inicial inteligente ──
export const inicializarSaludo = (forzarCampeon = false) => {
  const area = document.getElementById('cr_chat_mensajes_area');
  if (area && area.children.length === 0) {
    const cv = _getCvData ? _getCvData() : {};
    const primerNombre = cv.nombre ? cv.nombre.trim().split(/\s+/)[0] : '';

    const t = langChatwii[_lang] || langChatwii['es'];
    const saludo = (primerNombre && !forzarCampeon) 
      ? t.saludoPersonalizado(primerNombre) 
      : t.saludoCampeon;

    renderBurbuja('chatwii', saludo);
  }
};

// ── Configurar manejadores de eventos y toggle ──
export const initInputListeners = () => {
  const widgetBox = document.getElementById('cr_chat_widget_box');
  const launcher = document.getElementById('cr_chat_launcher');
  const textarea = document.querySelector('.cr_chat_textarea');
  const btnSend = document.querySelector('.cr_chat_btn_send');
  const btnClear = document.querySelector('.cr_chat_btn_header.clear');
  const btnClose = document.querySelector('.cr_chat_btn_header.close');
  const btnExpand = document.querySelector('.cr_chat_btn_header.expand');

  if (!textarea || !btnSend || !launcher || !widgetBox) return;

  // Toggle abrir / cerrar chat
  const toggleChat = () => {
    // Escudo de cookies: Obligar a aceptar cookies para chatear con Chatwii
    if (!getls('cookiesPrivacidad')) {
      const msg = _lang === 'en'
        ? "To use Chatwii (AI Assistant), you must accept cookies and privacy policies."
        : "Para usar Chatwii (Asistente IA) debes aceptar las cookies y políticas de privacidad.";
      if (window.Mensaje) {
        window.Mensaje(msg, 'warning');
      } else {
        alert(msg);
      }
      return;
    }

    const isActive = widgetBox.classList.contains('active');
    if (isActive) {
      widgetBox.classList.remove('active');
    } else {
      widgetBox.classList.add('active');
      scrollAlFinal();
      setTimeout(() => textarea.focus(), 150);
    }
  };

  launcher.addEventListener('click', toggleChat);
  if (btnClose) {
    btnClose.addEventListener('click', (e) => {
      e.stopPropagation();
      widgetBox.classList.remove('active');
    });
  }

  if (btnExpand) {
    btnExpand.addEventListener('click', (e) => {
      e.stopPropagation();
      const isMax = widgetBox.classList.toggle('maximized');
      const icon = btnExpand.querySelector('i');
      if (icon) {
        if (isMax) {
          icon.className = 'fas fa-compress';
        } else {
          icon.className = 'fas fa-expand';
        }
      }
      scrollAlFinal();
    });
  }

  // Ajuste automático de altura del input
  const autoResize = () => {
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 90)}px`;
  };

  const handleInput = () => {
    const val = textarea.value.trim();
    if (val.length > 0) {
      btnSend.classList.add('active');
      btnSend.disabled = false;
    } else {
      btnSend.classList.remove('active');
      btnSend.disabled = true;
    }
    autoResize();
  };

  textarea.addEventListener('input', handleInput);

  const dispararEnvio = async () => {
    const rawMsg = textarea.value.trim();
    if (!rawMsg) return;

    // Sanitización por seguridad: Eliminar scripts y eventos inline
    const msg = sanitizarMensaje(rawMsg);
    if (!msg) {
      textarea.value = '';
      handleInput();
      const warningMsg = _lang === 'en' 
        ? 'Message blocked for containing unsafe scripts!' 
        : '¡Mensaje bloqueado por contener scripts inseguros!';
      if (window.Mensaje) {
        window.Mensaje(warningMsg, 'warning');
      } else {
        alert(warningMsg);
      }
      return;
    }

    textarea.value = '';
    handleInput();

    renderBurbuja('user', msg);
    setLoader(true);

    let aiBubble = null;
    let textEl = null;
    let textoAcumulado = '';

    const onChunk = (chunk) => {
      setLoader(false);
      if (!aiBubble) {
        aiBubble = renderBurbuja('chatwii', '');
        textEl = aiBubble?.querySelector('.chatwii-texto-msg');
      }
      textoAcumulado += chunk;
      if (textEl) {
        const textoVisible = textoAcumulado.replace(/__PATCH__(\[.*?\]|\{.*?\})/gs, '').trim();
        textEl.innerHTML = mdToHtml(textoVisible);
      }
      scrollAlFinal();
    };

    try {
      const response = await enviarMensaje(msg, onChunk);
      setLoader(false);

      if (aiBubble) {
        aiBubble.remove();
      }
      renderBurbuja('chatwii', response.texto, response.patches);
      actualizarRateLimitHeader();
    } catch (err) {
      setLoader(false);
      console.error('Error al obtener respuesta de Chatwii:', err);
      if (aiBubble) aiBubble.remove();
      
      const t = langChatwii[_lang] || langChatwii['es'];
      renderBurbuja('chatwii', t.error);
    }
  };

  btnSend.addEventListener('click', dispararEnvio);

  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      dispararEnvio();
    }
  });

  if (btnClear) {
    btnClear.addEventListener('click', (e) => {
      e.stopPropagation();
      abrirModal('cr_chat_clear_modal');
    });
  }

  // Escuchar botones del modal de confirmación (widev.js)
  const btnConfirmClear = document.getElementById('cr_chat_btn_confirm_clear');
  const btnCancelClear = document.getElementById('cr_chat_btn_cancel_clear');

  if (btnConfirmClear) {
    btnConfirmClear.addEventListener('click', () => {
      limpiarChat();
      actualizarRateLimitHeader();
      const area = document.getElementById('cr_chat_mensajes_area');
      if (area) area.innerHTML = '';
      
      // Restablecer el input a vacío y deshabilitar botón de enviar
      if (textarea) {
        textarea.value = '';
        textarea.style.height = 'auto';
        if (btnSend) {
          btnSend.classList.remove('active');
          btnSend.disabled = true;
        }
      }
      
      // Forzar saludo genérico de "Campeón" para no asustar al usuario
      inicializarSaludo(true);
      cerrarModal('cr_chat_clear_modal');
    });
  }

  if (btnCancelClear) {
    btnCancelClear.addEventListener('click', () => {
      cerrarModal('cr_chat_clear_modal');
    });
  }
};

/**
 * Actualiza el indicador visual del Rate Limit en la cabecera del chat
 */
export const actualizarRateLimitHeader = () => {
  const headerNameEl = document.querySelector('.cr_chat_header_name');
  if (!headerNameEl) return;

  const isLogged = typeof localStorage !== 'undefined' ? localStorage.getItem('wiSmile') : null;
  const t = langChatwii[_lang] || langChatwii['es'];

  if (isLogged) {
    try {
      const item = localStorage.getItem('limiteHoy_logged_chatwii_uses');
      const s = item ? JSON.parse(item) : { n: 0 };
      const restantes = Math.max(0, 88 - s.n);
      headerNameEl.textContent = `${t.titulo} (${restantes}/88)`;
    } catch (_) {
      headerNameEl.textContent = `${t.titulo} (88/88)`;
    }
  } else {
    try {
      const item = localStorage.getItem('limiteHoy_guest_chatwii_uses');
      const s = item ? JSON.parse(item) : { n: 0 };
      const restantes = Math.max(0, 7 - s.n);
      headerNameEl.textContent = `${t.titulo} (${restantes}/7)`;
    } catch (_) {
      headerNameEl.textContent = `${t.titulo} (7/7)`;
    }
  }
};

// ── Punto de entrada visual del chat flotante ──
export const initChat = (lang, getCvData, updateCvData) => {
  _lang = lang;
  _getCvData = getCvData;
  _updateCvData = updateCvData;

  // 1. Montar los elementos flotantes
  mountWidget();
  actualizarRateLimitHeader();

  // 2. Inicializar cerebro
  initChatwii(lang, getCvData, updateCvData);

  // 3. Dibujar historial visual guardado si existe
  restaurarHistorial();

  // 4. Configurar escuchadores
  initInputListeners();

  // 5. Saludo inicial
  inicializarSaludo();

  // 6. Animación diferida: el launcher aparece flotando tras 1.5s
  setTimeout(() => {
    const launcher = document.getElementById('cr_chat_launcher');
    if (launcher) {
      launcher.classList.add('show');
    }
  }, 1500);
};
