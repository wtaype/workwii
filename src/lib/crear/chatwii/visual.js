import { initChatwii, enviarMensaje, aplicarPatch, limpiarChat, getHistorial } from './brain.js';
import { mdToHtml } from './procesarmd.js';
import { langChatwii } from './lang.js';
import { abrirModal, cerrarModal, getls } from '../../widev.js';

let _lang = 'es';
let _getCvData = null;
let _updateCvData = null;

// ── Montar el Widget Flotante y el Launcher en el DOM ──
export const mountWidget = () => {
  // Evitar duplicaciones
  if (document.getElementById('cr_chat_widget_wrapper')) return;

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

  // 4. Inyectar todos los elementos directamente al final de body
  document.body.appendChild(wrapper);
  document.body.appendChild(launcher);
  document.body.appendChild(clearModal);
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
    const acciones = document.createElement('div');
    acciones.className = 'cr_chat_acciones';
    burbuja.querySelector('.cr_chat_texto').appendChild(acciones);
    
    const t = langChatwii[_lang] || langChatwii['es'];

    const renderAcciones = (mostrarDeshacer = false, cvBackup = null) => {
      if (mostrarDeshacer) {
        acciones.innerHTML = `
          <button class="cr_chat_btn_accion deshacer" style="background:var(--error); border-color:var(--error); color:#fff;"><i class="fas fa-rotate-left"></i> ${_lang === 'en' ? 'Undo' : 'Deshacer'}</button>
          <button class="cr_chat_btn_accion descartar" data-witip="${_lang === 'en' ? 'Discard' : 'Descartar'}"><i class="fas fa-times-circle"></i></button>
        `;
        const btnDeshacer = acciones.querySelector('.deshacer');
        const btnDescartar = acciones.querySelector('.descartar');

        btnDeshacer.addEventListener('click', () => {
          if (cvBackup) _updateCvData(cvBackup);
          const deshacerMsg = _lang === 'en' ? 'Changes reverted!' : '¡Cambios revertidos!';
          if (window.Mensaje) window.Mensaje(deshacerMsg, 'success');
          renderAcciones(false);
        });

        btnDescartar.addEventListener('click', () => {
          deshabilitarAcciones(acciones);
        });
      } else {
        acciones.innerHTML = `
          <button class="cr_chat_btn_accion aplicar" data-witip="${_lang === 'en' ? 'Continue' : 'Continuar'}"><i class="fas fa-check"></i> ${t.aplicar}</button>
          <button class="cr_chat_btn_accion ajustar" data-witip="${_lang === 'en' ? 'Adjust' : 'Ajustar'}"><i class="fas fa-pen"></i> ${t.ajustar}</button>
          <button class="cr_chat_btn_accion descartar" data-witip="${_lang === 'en' ? 'Discard' : 'Descartar'}"><i class="fas fa-times-circle"></i></button>
        `;

        const btnAplicar = acciones.querySelector('.aplicar');
        const btnAjustar = acciones.querySelector('.ajustar');
        const btnDescartar = acciones.querySelector('.descartar');

        btnAplicar.addEventListener('click', () => {
          const editables = Array.from(burbuja.querySelectorAll('code[contenteditable="true"]'));

          // Mapear los parches aplicando los textos editables en caliente
          const patchesToApply = activePatches.map((p) => {
            let val = p.valor;
            if (editables.length > 0) {
              // Emparejar parches de texto (resumen, logros) con editables
              const textPatches = activePatches.filter(x => x.campo === 'resumen' || x.campo === 'logros');
              const textIdx = textPatches.indexOf(p);

              if (textIdx !== -1 && editables[textIdx]) {
                val = editables[textIdx].innerText || editables[textIdx].textContent || p.valor;
              } else if (editables.length === 1 && (p.campo === 'resumen' || p.campo === 'logros')) {
                val = editables[0].innerText || editables[0].textContent || p.valor;
              }
            }
            return { ...p, valor: typeof val === 'string' ? val.trim() : val };
          });

          const backup = _getCvData();

          // Aplicar cada uno de los parches
          patchesToApply.forEach(p => aplicarPatch(p));

          const exitoMsg = _lang === 'en' ? 'Changes applied to CV!' : '¡Cambios aplicados al CV!';
          if (window.Mensaje) window.Mensaje(exitoMsg, 'success');

          renderAcciones(true, backup);
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
          deshabilitarAcciones(acciones);
        });
      }
    };

    if (esRestaurado) {
      acciones.innerHTML = `
        <button class="cr_chat_btn_accion aplicar" data-witip="${_lang === 'en' ? 'Continue' : 'Continuar'}"><i class="fas fa-check"></i> ${t.aplicar}</button>
        <button class="cr_chat_btn_accion ajustar" data-witip="${_lang === 'en' ? 'Adjust' : 'Ajustar'}"><i class="fas fa-pen"></i> ${t.ajustar}</button>
        <button class="cr_chat_btn_accion descartar" data-witip="${_lang === 'en' ? 'Discard' : 'Descartar'}"><i class="fas fa-times-circle"></i></button>
      `;
      deshabilitarAcciones(acciones);
    } else {
      renderAcciones(false);
    }
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
    const msg = textarea.value.trim();
    if (!msg) return;

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
