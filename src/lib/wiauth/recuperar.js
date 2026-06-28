// src/lib/wiauth/recuperar.js
// Vistas y llamadas para recuperación de contraseñas olvidadas

import { supabase } from '../supabase.js';
import { wiSpin, Mensaje } from '../widev/widev.js';
import { app } from '../../wii.js';
import { campo, t } from './login.js';
import { mapearErrorAuth } from './idioma.js';

// Template HTML para formulario de recuperación
export const tplRestablecer = () => `
  <div class="wilg_head">
    <div class="wilg_logo wilg_logo_sm"><img src="/smile.avif" alt="${app}"></div>
    <h2>${t('recoverTitle')}</h2><p>${t('recoverSub')}</p>
  </div>
  ${campo('envelope', 'text', 'recEmail', t('inputEmail'))}
  <button type="button" id="Recuperar" class="wilg_btn"><i class="fas fa-paper-plane"></i> ${t('btnSendLink')}</button>
  <div class="wilg_links"><span class="wilg_log"><i class="fas fa-arrow-left"></i> ${t('linkBack')}</span></div>`;

// Enviar enlace de restablecimiento (Soporta resolver Username a Email por RPC)
export const enviarEnlaceRecuperacion = async (btn) => {
  const inputEl = document.getElementById('recEmail');
  const input = inputEl ? inputEl.value.trim() : '';
  if (!input) return;

  wiSpin(btn, true, t('btnSendLink'));
  try {
    let email = input;

    // Si es un nombre de usuario, resolvemos su email
    if (!input.includes('@')) {
      const { data: resolvedEmail, error: rpcErr } = await supabase.rpc('obtener_email_por_usuario', { username_buscado: input });
      if (rpcErr || !resolvedEmail) throw new Error(t('errUserNotFound'));
      email = resolvedEmail;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/login?recovery=true'
    });
    if (error) throw error;

    Mensaje(t('msgLinkEnviado'), 'success');
  } catch (e) {
    const keyError = mapearErrorAuth(e);
    Mensaje(t(keyError), 'error');
  } finally {
    wiSpin(btn, false);
  }
};
