// src/lib/widev/modales.js
// modales v10.6: Controlador universal de ventanas modales con inyección de estilos premium (fade-in & slide-down)

export const abrirModal = (id) => {
  if (typeof document === 'undefined') return;
  const m = document.getElementById(id);
  if (!m) return console.warn(`Modal #${id} no existe`);

  subirModalCSS();
  m.classList.add('active');
  document.body.classList.add('modal-open');
  
  // Foco automático en el primer input/botón para mejorar accesibilidad
  setTimeout(() => {
    const focusable = m.querySelector('input,select,textarea,button');
    if (focusable) focusable.focus();
  }, 50);
};

export const cerrarModal = (id) => {
  if (typeof document === 'undefined') return;
  const m = document.getElementById(id);
  if (m) m.classList.remove('active');
  
  // Quitar bloqueo de scroll del body solo si no quedan modales activos
  if (!document.querySelector('.wiModal.active')) {
    document.body.classList.remove('modal-open');
  }
};

export const cerrarTodos = () => {
  if (typeof document === 'undefined') return;
  document.querySelectorAll('.wiModal').forEach(m => m.classList.remove('active'));
  document.body.classList.remove('modal-open');
};

// Inyectar hoja de estilos de modal si no existe
const subirModalCSS = (() => {
  let done = false;
  return () => {
    if (done || typeof document === 'undefined') return;
    done = true;
    const s = document.createElement('style');
    s.id = 'widev-modal-css';
    s.setAttribute('data-astro-transition-persist', 'widev-modal-css');
    s.textContent = `
      /* Estilos Premium para Modales (Fade-in + Smooth Slide Down) */
      .wiModal {
        display: flex;
        align-items: center;
        justify-content: center;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(8px);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        z-index: 99999;
      }
      .wiModal.active {
        opacity: 1;
        pointer-events: auto;
      }
      .wiModal-content {
        background: var(--bg3, #ffffff);
        color: var(--tx1, #212529);
        border: 1px solid var(--brd, rgba(255, 255, 255, 0.1));
        padding: 3.5vh;
        border-radius: 1.5vh;
        width: 90%;
        max-width: 500px;
        box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.3);
        opacity: 0;
        transform: translateY(-5vh) scale(0.96);
        transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .wiModal.active .wiModal-content {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      
      /* Bloqueo de Scroll */
      body.modal-open {
        overflow: hidden;
        padding-right: var(--scrollbar-width, 0px);
      }
    `;
    document.head.appendChild(s);
  };
})();

// Escuchas de eventos globales (Auto-inicialización agnóstica universal)
if (typeof window !== 'undefined') {
  const setupGlobalListeners = () => {
     // Cerrar al hacer clic en el fondo gris, clase .modalX o data-wimodal-close
    document.addEventListener('click', (e) => {
      const target = e.target;
      if (target.closest('.modalX') || target.closest('[data-wimodal-close]')) {
        cerrarTodos();
      } else if (target.classList.contains('wiModal') && target.classList.contains('active')) {
        cerrarTodos();
      }
    });

    // Cerrar al presionar Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.querySelector('.wiModal.active')) {
        cerrarTodos();
      }
    });
    
    // Calcular el scrollbar width para evitar saltos en body.modal-open
    try {
      const scrollDiv = document.createElement('div');
      scrollDiv.style.cssText = 'width:99px;height:99px;overflow:scroll;position:absolute;top:-9999px';
      document.body.appendChild(scrollDiv);
      const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
      document.body.removeChild(scrollDiv);
      document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
    } catch (e) {}
  };

  // Carga inicial del DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupGlobalListeners);
  } else {
    setupGlobalListeners();
  }

  // Soporte para transiciones SPA
  document.addEventListener('astro:page-load', setupGlobalListeners);
  document.addEventListener('turbo:load', setupGlobalListeners);
}