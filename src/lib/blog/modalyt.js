// modalyt.js — YouTube Lightbox v1.0
// Extraído de [slug].astro para mantener el código modular y mantenible.

let _ytClickRef = null;

/**
 * Registra el listener de delegación para abrir videos de YouTube en un lightbox modal.
 * Crea el DOM del modal de forma lazy (solo en el primer click).
 */
export function initYtModal() {
  if (_ytClickRef) return;

  _ytClickRef = (e) => {
    const link = e.target?.closest?.('a');
    if (!link) return;
    const href = link.getAttribute('href') || '';
    const ytMatch = href.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/i);
    if (!ytMatch) return;
    e.preventDefault();

    const id = ytMatch[1];

    let modal = document.getElementById('wi_yt_modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'wi_yt_modal';
      modal.className = 'wiModal';
      modal.innerHTML = '<div class="modalBody"><div id="wi_yt_player"></div></div>';
      document.body.appendChild(modal);

      const obs = new MutationObserver(() => {
        if (!modal.classList.contains('active')) {
          const p = document.getElementById('wi_yt_player');
          if (p) p.innerHTML = '';
        }
      });
      obs.observe(modal, { attributes: true, attributeFilter: ['class'] });
    }

    const player = document.getElementById('wi_yt_player');
    if (player) {
      player.innerHTML = '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/' + id + '?autoplay=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
    }

    import('../widev.js').then((m) => m.abrirModal('wi_yt_modal'));
  };

  document.addEventListener('click', _ytClickRef);
}

/**
 * Elimina el listener del YouTube lightbox.
 * Llamar en astro:before-preparation para evitar listeners huérfanos.
 */
export function cleanupYtModal() {
  if (_ytClickRef) {
    document.removeEventListener('click', _ytClickRef);
    _ytClickRef = null;
  }
}
