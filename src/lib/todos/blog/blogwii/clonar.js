// src/lib/blog/blogwii/clonar.js
// Controlador de clonación y transformación de editor para traducciones en caliente

/**
 * Convierte un título traducido en un slug de URL limpio y seguro para SEO.
 * @param {string} title Título a convertir
 * @returns {string} Slug resultante
 */
export function generarSlugDeTraduccion(title) {
  if (!title) return '';
  return title
    .toLowerCase()
    .normalize('NFD') // Descompone caracteres con acentos
    .replace(/[\u0300-\u036f]/g, '') // Remueve los acentos
    .replace(/[^a-z0-9\s-_]/g, '') // Remueve caracteres especiales
    .trim()
    .replace(/\s+/g, '-') // Cambia espacios por guiones
    .replace(/[-_]{2,}/g, '-') // Elimina guiones repetidos
    .substring(0, 32); // Limita a 32 caracteres (máximo de base de datos)
}

/**
 * Transforma la interfaz del editor de "Modo Edición" a "Modo Creación de Traducción" en caliente.
 * 
 * @param {object} params
 * @param {string} params.originalId ID del post original (Español o Inglés)
 * @param {string} params.newSlug Slug auto-generado para el idioma destino
 * @param {string} params.targetLang Idioma destino ('es' o 'en')
 */
export function transformarFormularioAClon(originalId, newSlug, targetLang) {
  if (typeof window === 'undefined') return;

  // 1. Limpiar el query param "?edit=" de la URL del navegador sin recargar la página
  window.history.replaceState({}, '', window.location.pathname);

  // 2. Cambiar la cabecera principal del editor
  const mainTitle = document.getElementById('nu_main_title');
  if (mainTitle) {
    mainTitle.innerHTML = `<i class="fas fa-file-signature"></i> Nueva traducción`;
  }

  // 3. Mostrar banner informativo sobre la vinculación
  const editInfo = document.getElementById('nu_edit_info');
  if (editInfo) {
    editInfo.innerHTML = `<i class="fas fa-circle-info"></i> Traduciendo post original a <strong>${targetLang.toUpperCase()}</strong>`;
    editInfo.className = 'nu_edit_info'; // Muestra removiendo dpn
  }

  // 4. Cambiar etiquetas de los botones de acción a "Publicar"
  const btnLbl = document.getElementById('nu_btn_lbl');
  if (btnLbl) btnLbl.textContent = 'Publicar';

  const btnLblAside = document.getElementById('nu_btn_lbl_aside');
  if (btnLblAside) btnLblAside.textContent = 'Publicar';

  // 5. Ocultar el botón de "Ver post" (puesto que aún no existe en Supabase)
  const viewPostBtn = document.getElementById('nu_view_post_btn');
  if (viewPostBtn) viewPostBtn.classList.add('dpn');

  // 6. Habilitar nuevamente el slug para su edición e inyectar el nuevo slug en inglés/español
  const slugInp = document.getElementById('nu_slug_inp');
  if (slugInp) {
    slugInp.removeAttribute('readonly');
    slugInp.value = newSlug;
  }

  // 7. Actualizar el estado de validación del slug
  const slugStatus = document.getElementById('nu_slug_status');
  if (slugStatus) {
    slugStatus.innerHTML = `<span class="ok"><i class="fas fa-circle-check"></i> Slug disponible</span>`;
    slugStatus.className = 'nu_slug_status ok';
  }
}
