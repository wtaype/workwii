import { supabase } from './supabase.js';
import { getls } from './widev/widev.js';

/**
 * Espera a obtener el usuario autenticado de Supabase.
 * @returns {Promise<any>} Usuario de Supabase o null.
 */
export async function waitAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  return session ? session.user : null;
}

/**
 * Valida la sesión del usuario en Supabase y localStorage.
 * Redirige a '/' si no hay sesión válida o si el rol no está permitido.
 * @param {string[]} rolesPermitidos - Roles autorizados (ej: ['smile', 'editor', 'admin'])
 * @returns {Promise<any>} Datos del usuario autenticado guardados en localStorage.
 */
export async function protegerRuta(rolesPermitidos = []) {
  const localUser = getls('wiSmile');
  if (!localUser) {
    window.location.replace('/');
    return null;
  }

  // Verificar si el rol de la sesión local está autorizado
  if (rolesPermitidos.length && !rolesPermitidos.includes(localUser.rol)) {
    window.location.replace('/');
    return null;
  }

  const sbUser = await waitAuth();
  if (!sbUser) {
    localStorage.removeItem('wiSmile');
    window.location.replace('/');
    return null;
  }

  return localUser;
}

