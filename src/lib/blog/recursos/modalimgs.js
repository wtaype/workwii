// modalimgs.js — Galería de Imágenes estilo Picasa v2.1
// CSS autocontenido inyectado desde JS — no depende de estilos externos.

let _imgClickRef = null;
let _keyRef = null;
let _wheelRef = null;
let _galeria = [];
let _idx = 0;
let _modal = null;
let _imgEl = null;
let _captionEl = null;
let _counterEl = null;
let _stripEl = null;
let _built = false;
let _touchStartX = 0;
let _zoomLevel = 1;
const ZOOM_MIN = 0.4;
const ZOOM_MAX = 3.5;
const ZOOM_STEP = 0.25;

// Variables para arrastre de imagen con zoom (Pan)
let _isDragging = false;
let _dragStartX = 0;
let _dragStartY = 0;
let _panX = 0;
let _panY = 0;

// ── CSS autocontenido ────────────────────────────────────────────────
const WIM_CSS_ID = 'wim-styles';
function injectStyles() {
  if (document.getElementById(WIM_CSS_ID)) return;
  const s = document.createElement('style');
  s.id = WIM_CSS_ID;
  s.textContent = `
/* ── GALERÍA PICASA — estilos autocontenidos ── */
@keyframes wim_fade_in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes wim_cute_pop {
  from {
    transform: scale(0.92) translateY(-2.5vh);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}
#wi_img_modal.active {
  animation: wim_fade_in 0.35s cubic-bezier(0.4, 0, 0.2, 1) !important;
}
#wi_img_modal.active .modalBody.wim_body {
  animation: wim_cute_pop 0.42s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
}
.modalBody.wim_body{
  max-width: 100vw;
  width: 93%;
  height: 100vh;
}
#wi_img_modal .modalBody.wim_body {
  position: relative !important;
  display: block !important; /* Desactiva la columna flex */
  background: rgba(0, 0, 0, 0.05) !important; /* Fondo ultra sutil transparente */
  backdrop-filter: blur(28px) !important;
  -webkit-backdrop-filter: blur(28px) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  padding: 0 !important;
  border-radius: 2vh !important;
  overflow: hidden !important;
  width: 92% !important;
  height: 94vh !important;
  max-height: 94vh !important;
  box-sizing: border-box !important;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.65) !important;
}

/* Override .modalX que tiene position:absolute y color:var(--mco) */
#wi_img_modal .wim_close {
  position: absolute !important;
  top: 2.2vh !important;
  right: 2.2vh !important;
  z-index: 12 !important;
  background: rgba(255,255,255,0.08) !important;
  border: 1px solid rgba(255,255,255,0.15) !important;
  color: rgba(255,255,255,0.85) !important;
  font-size: 0.95rem !important;
  cursor: pointer !important;
  line-height: 1 !important;
  border-radius: 50% !important;
  width: 3.5vh !important; height: 3.5vh !important;
  min-width: 28px; min-height: 28px;
  display: flex !important; align-items: center !important; justify-content: center !important;
  backdrop-filter: blur(8px) !important;
  -webkit-backdrop-filter: blur(8px) !important;
  transition: all 0.2s ease !important;
  text-shadow: none !important;
}
#wi_img_modal .wim_close:hover {
  background: rgba(220,50,50,0.25) !important;
  border-color: rgba(220,50,50,0.45) !important;
  color: #fff !important;
  transform: scale(1.08) !important;
}

/* Stage - Ocupa 100% de la altura y anchura del cuerpo del modal */
.wim_stage {
  position: absolute !important;
  top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important;
  width: 100% !important; height: 100% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  background: transparent !important;
  z-index: 1 !important;
  overflow: hidden !important;
}
.wim_img_wrap {
  width: 100% !important;
  height: 100% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 2vh 8vh 13vh 8vh !important; /* Más padding abajo para subir la imagen del alt/thumbnails */
  box-sizing: border-box !important;
  overflow: hidden !important;
}
.wim_img {
  max-width: 100% !important;
  max-height: 100% !important; /* Aprovecha el espacio vertical absoluto */
  object-fit: contain !important;
  display: block !important;
  transition: opacity 0.22s ease, transform 0.1s linear !important;
  border-radius: 1vh !important;
  box-shadow: 0 12px 48px rgba(0,0,0,0.5) !important;
  transform-origin: center center !important;
  cursor: zoom-in !important;
  will-change: transform, opacity !important;
  user-select: none !important;
}
.wim_img.wim_zoomed { cursor: grab !important; }
.wim_img.wim_dragging { cursor: grabbing !important; transition: opacity 0.22s ease, transform 0s !important; }

/* Caption row: alt + contador en píldora flotante */
.wim_caption_row {
  position: absolute !important;
  bottom: 7.2vh !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  z-index: 8 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 1.2vh !important;
  padding: 0.6vh 1.6vh !important;
  background: rgba(0, 0, 0, 0.35) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  border-radius: 20px !important;
  max-width: 75% !important;
  white-space: nowrap !important;
  pointer-events: none !important; /* Evita bloquear interacción */
}
.wim_caption {
  color: rgba(255,255,255,0.85) !important;
  font-size: 0.8rem !important;
  font-style: italic !important;
  font-family: inherit !important;
  margin: 0 !important;
  text-align: center !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}
.wim_counter {
  color: rgba(255,255,255,0.45) !important;
  font-size: 0.72rem !important;
  font-weight: 700 !important;
  white-space: nowrap !important;
  background: rgba(255,255,255,0.08) !important;
  padding: 0.1vh 0.6vh !important;
  border-radius: 10px !important;
  border: 1px solid rgba(255,255,255,0.06) !important;
  line-height: 1.4 !important;
}

/* Flechas flotantes a los lados */
.wim_prev, .wim_next {
  position: absolute !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  background: rgba(255,255,255,0.06) !important;
  color: rgba(255,255,255,0.8) !important;
  border: 1px solid rgba(255,255,255,0.12) !important;
  border-radius: 50% !important;
  width: 4.5vh !important; height: 4.5vh !important;
  min-width: 36px !important; min-height: 36px !important;
  cursor: pointer !important;
  display: flex !important; align-items: center !important; justify-content: center !important;
  font-size: 0.9rem !important;
  transition: all 0.22s cubic-bezier(.25,.46,.45,.94) !important;
  z-index: 10 !important;
  backdrop-filter: blur(10px) !important;
  -webkit-backdrop-filter: blur(10px) !important;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1) !important;
}
.wim_prev { left: 2.2vh !important; }
.wim_next { right: 2.2vh !important; }
.wim_prev:hover, .wim_next:hover {
  background: rgba(255,255,255,0.15) !important;
  border-color: rgba(255,255,255,0.3) !important;
  color: #fff !important;
  transform: translateY(-50%) scale(1.08) !important;
  box-shadow: 0 6px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.15) !important;
}
.wim_prev:active, .wim_next:active {
  transform: translateY(-50%) scale(0.93) !important;
}

/* Strip de thumbnails en dock flotante compacto */
.wim_strip {
  position: absolute !important;
  bottom: 1.8vh !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  z-index: 8 !important;
  display: flex !important;
  gap: 0.6vh !important;
  padding: 0.5vh 0.8vh !important;
  background: rgba(0, 0, 0, 0.22) !important;
  border: 1px solid rgba(255, 255, 255, 0.06) !important;
  backdrop-filter: blur(16px) !important;
  -webkit-backdrop-filter: blur(16px) !important;
  border-radius: 1.2vh !important;
  max-width: 85% !important;
  overflow-x: auto !important;
  justify-content: center !important;
  flex-wrap: nowrap !important;
  scrollbar-width: none !important;
}
.wim_strip::-webkit-scrollbar { display: none !important; }
.wim_thumb {
  width: 32px !important; height: 32px !important; /* Compactos y pro */
  object-fit: cover !important;
  border-radius: 0.4vh !important;
  cursor: pointer !important;
  flex-shrink: 0 !important;
  opacity: 0.45 !important;
  border: 1.5px solid transparent !important;
  transition: all 0.2s ease !important;
}
.wim_thumb:hover {
  opacity: 0.8 !important;
  transform: scale(1.08) !important;
}
.wim_thumb.active {
  opacity: 1 !important;
  border-color: rgba(255,255,255,0.95) !important;
  transform: scale(1.12) !important;
  box-shadow: 0 4px 14px rgba(0,0,0,0.35) !important;
}

/* Solo 1 imagen */
.wim_solo .wim_prev,
.wim_solo .wim_next,
.wim_solo .wim_counter,
.wim_solo .wim_strip { display: none !important; }

/* Cursor en artículo */
.wi_img_clickable { cursor: zoom-in !important; }
.wi_img_clickable:hover {
  transform: scale(1.012) !important;
  box-shadow: 0 8px 24px rgba(0,0,0,0.14) !important;
}

/* Responsive */
@media (max-width: 768px) {
  #wi_img_modal .modalBody.wim_body { max-width: 98vw !important; border-radius: 1.5vh !important; }
  .wim_img_wrap { padding: 1.5vh 5vh !important; }
  .wim_caption_row { bottom: 6.5vh !important; max-width: 90% !important; }
  .wim_strip { bottom: 1.5vh !important; max-width: 95% !important; }
  .wim_thumb { width: 28px !important; height: 28px !important; }
  .wim_prev, .wim_next { width: 3.8vh !important; height: 3.8vh !important; min-width: 32px !important; min-height: 32px !important; }
  .wim_prev { left: 1.2vh !important; }
  .wim_next { right: 1.2vh !important; }
}
  `;
  document.head.appendChild(s);
}

// ── DOM del modal ────────────────────────────────────────────────────
function buildModal() {
  if (_built) return;
  _built = true;

  injectStyles();

  _modal = document.createElement('div');
  _modal.id = 'wi_img_modal';
  _modal.className = 'wiModal';
  _modal.innerHTML = `
    <div class="modalBody wim_body">
      <button class="wim_close modalX" aria-label="Cerrar galería"><i class="fas fa-xmark"></i></button>
      <div class="wim_stage">
        <button class="wim_prev" aria-label="Imagen anterior"><i class="fas fa-chevron-left"></i></button>
        <div class="wim_img_wrap">
          <img class="wim_img" src="" alt="" draggable="false" />
        </div>
        <button class="wim_next" aria-label="Imagen siguiente"><i class="fas fa-chevron-right"></i></button>
      </div>
      <div class="wim_caption_row">
        <p class="wim_caption"></p>
        <span class="wim_counter"></span>
      </div>
      <div class="wim_strip"></div>
    </div>
  `;
  document.body.appendChild(_modal);

  _imgEl     = _modal.querySelector('.wim_img');
  _captionEl = _modal.querySelector('.wim_caption');
  _counterEl = _modal.querySelector('.wim_counter');
  _stripEl   = _modal.querySelector('.wim_strip');

  _modal.querySelector('.wim_prev').addEventListener('click', (e) => { e.stopPropagation(); goto(_idx - 1); });
  _modal.querySelector('.wim_next').addEventListener('click', (e) => { e.stopPropagation(); goto(_idx + 1); });

  // Click en imagen: toggle zoom (solo si no se arrastró)
  let clickTimeout = null;
  let dragThresholdPassed = false;

  _imgEl.addEventListener('mousedown', (e) => {
    if (Math.abs(_zoomLevel - 1) <= 0.02) return;
    e.preventDefault();
    _isDragging = true;
    dragThresholdPassed = false;
    _dragStartX = e.clientX - _panX;
    _dragStartY = e.clientY - _panY;
    _imgEl.classList.add('wim_dragging');
  });

  _modal.addEventListener('mousemove', (e) => {
    if (!_isDragging) return;
    e.preventDefault();
    const nx = e.clientX - _dragStartX;
    const ny = e.clientY - _dragStartY;
    if (Math.abs(nx - _panX) > 4 || Math.abs(ny - _panY) > 4) {
      dragThresholdPassed = true;
    }
    _panX = nx;
    _panY = ny;
    updateTransform();
  });

  const stopDrag = () => {
    if (!_isDragging) return;
    _isDragging = false;
    _imgEl.classList.remove('wim_dragging');
  };
  _modal.addEventListener('mouseup', stopDrag);
  _modal.addEventListener('mouseleave', stopDrag);

  // Soporte móvil táctil para arrastre
  _imgEl.addEventListener('touchstart', (e) => {
    if (Math.abs(_zoomLevel - 1) <= 0.02) return;
    _isDragging = true;
    dragThresholdPassed = false;
    _dragStartX = e.touches[0].clientX - _panX;
    _dragStartY = e.touches[0].clientY - _panY;
    _imgEl.classList.add('wim_dragging');
  }, { passive: true });

  _imgEl.addEventListener('touchmove', (e) => {
    if (!_isDragging) return;
    const nx = e.touches[0].clientX - _dragStartX;
    const ny = e.touches[0].clientY - _dragStartY;
    if (Math.abs(nx - _panX) > 4 || Math.abs(ny - _panY) > 4) {
      dragThresholdPassed = true;
    }
    _panX = nx;
    _panY = ny;
    updateTransform();
  }, { passive: true });

  _imgEl.addEventListener('touchend', stopDrag, { passive: true });

  _imgEl.addEventListener('click', (e) => {
    e.stopPropagation();
    if (dragThresholdPassed) return; // Si arrastró, no hace toggle zoom
    if (Math.abs(_zoomLevel - 1) > 0.02) resetZoom();
    else applyZoom(1.8);
  });

  // Scroll = zoom
  _wheelRef = (e) => {
    if (!_modal || !_modal.classList.contains('active')) return;
    const stage = _modal.querySelector('.wim_stage');
    if (!stage || !stage.contains(e.target)) return;
    e.preventDefault();
    applyZoom(_zoomLevel + (e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP));
  };
  window.addEventListener('wheel', _wheelRef, { passive: false });

  // Swipe
  const stage = _modal.querySelector('.wim_stage');
  stage.addEventListener('touchstart', (e) => {
    if (Math.abs(_zoomLevel - 1) > 0.02) return;
    _touchStartX = e.touches[0].clientX;
  }, { passive: true });
  stage.addEventListener('touchend', (e) => {
    if (Math.abs(_zoomLevel - 1) > 0.02) return;
    const dx = e.changedTouches[0].clientX - _touchStartX;
    if (Math.abs(dx) > 55) goto(dx < 0 ? _idx + 1 : _idx - 1);
  });
}

function updateTransform() {
  if (Math.abs(_zoomLevel - 1) > 0.02) {
    _imgEl.style.transform = `scale(${_zoomLevel.toFixed(2)}) translate(${(_panX / _zoomLevel).toFixed(1)}px, ${(_panY / _zoomLevel).toFixed(1)}px)`;
  } else {
    _imgEl.style.transform = '';
  }
}

function applyZoom(level) {
  _zoomLevel = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, level));
  _imgEl.classList.toggle('wim_zoomed', Math.abs(_zoomLevel - 1) > 0.02);
  if (Math.abs(_zoomLevel - 1) <= 0.02) {
    _panX = 0;
    _panY = 0;
  }
  updateTransform();
}

function resetZoom() {
  _zoomLevel = 1;
  _panX = 0;
  _panY = 0;
  _imgEl.classList.remove('wim_zoomed');
  updateTransform();
}

function buildStrip() {
  if (!_stripEl) return;
  _stripEl.innerHTML = '';
  _galeria.forEach((item, i) => {
    const thumb = document.createElement('img');
    thumb.className = 'wim_thumb';
    thumb.src = item.src;
    thumb.alt = item.alt;
    thumb.dataset.idx = String(i);
    thumb.addEventListener('click', (e) => { e.stopPropagation(); goto(i); });
    _stripEl.appendChild(thumb);
  });
}

function goto(idx) {
  const total = _galeria.length;
  if (total === 0) return;
  _idx = ((idx % total) + total) % total;
  resetZoom();

  _imgEl.style.opacity = '0';
  setTimeout(() => {
    const item = _galeria[_idx];
    _imgEl.src = item.src;
    _imgEl.alt = item.alt;
    // Alt + contador juntos
    _captionEl.textContent = item.alt || '';
    _counterEl.textContent = total > 1 ? `${_idx + 1} / ${total}` : '';
    _imgEl.style.opacity = '1';
  }, 110);

  if (_stripEl) {
    _stripEl.querySelectorAll('.wim_thumb').forEach((t, i) => t.classList.toggle('active', i === _idx));
    const active = _stripEl.querySelector('.wim_thumb.active');
    if (active) active.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
  }
}

function openModal(clickedSrc) {
  if (_galeria.length === 0) {
    document.querySelectorAll('.po_contenido .wi_img_clickable').forEach((img) => {
      const src = img.src || img.dataset.src || '';
      if (src) _galeria.push({ src, alt: img.alt || '' });
    });
  }
  const startIdx = _galeria.findIndex((item) => item.src === clickedSrc || item.src.endsWith(clickedSrc));
  _idx = startIdx >= 0 ? startIdx : 0;
  _modal.querySelector('.wim_body').classList.toggle('wim_solo', _galeria.length <= 1);
  buildStrip();
  goto(_idx);
  import('../../widev/widev.js').then((m) => m.abrirModal('wi_img_modal'));
}

export function initModalImgs(selector) {
  if (_imgClickRef) return;

  const contenedor = document.querySelector(selector);
  if (contenedor) contenedor.querySelectorAll('img').forEach((img) => img.classList.add('wi_img_clickable'));

  buildModal();

  _imgClickRef = (e) => {
    const img = e.target?.closest?.('.wi_img_clickable');
    if (!img) return;
    e.preventDefault();
    _galeria = [];
    openModal(img.src || img.dataset.src || '');
  };
  document.addEventListener('click', _imgClickRef);

  _keyRef = (e) => {
    if (!_modal || !_modal.classList.contains('active')) return;
    if (e.key === 'ArrowLeft')          { goto(_idx - 1); return; }
    if (e.key === 'ArrowRight')         { goto(_idx + 1); return; }
    if (e.key === '+' || e.key === '=') { e.preventDefault(); applyZoom(_zoomLevel + ZOOM_STEP); return; }
    if (e.key === '-')                  { e.preventDefault(); applyZoom(_zoomLevel - ZOOM_STEP); return; }
    if (e.key === '0')                  { e.preventDefault(); resetZoom(); return; }
  };
  document.addEventListener('keydown', _keyRef);
}

export function cleanupModalImgs() {
  if (_imgClickRef) { document.removeEventListener('click', _imgClickRef); _imgClickRef = null; }
  if (_keyRef)      { document.removeEventListener('keydown', _keyRef); _keyRef = null; }
  if (_wheelRef)    { window.removeEventListener('wheel', _wheelRef); _wheelRef = null; }
  _galeria = [];
  _built = false;
  if (_modal) { _modal.remove(); _modal = null; }
  const styleEl = document.getElementById(WIM_CSS_ID);
  if (styleEl) styleEl.remove();
  _imgEl = _captionEl = _counterEl = _stripEl = null;
  _zoomLevel = ZOOM_MIN;
}
