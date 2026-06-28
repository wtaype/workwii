// src/lib/wiauth/twofa.js
// Vistas y validación para el segundo factor de autenticación (2FA)

import { supabase } from '../supabase.js';
import { wiSpin, Mensaje } from '../widev/widev.js';
import { app } from '../../wii.js';
import { entrar } from './sesion.js';
import { campo, t } from './login.js';
import { mapearErrorAuth } from './idioma.js';

// Template HTML de verificación 2FA
export const tplTwoFA = () => `
  <div class="wilg_head">
    <div class="wilg_logo wilg_logo_sm"><img src="/smile.avif" alt="${app}"></div>
    <h2>Autenticación 2FA</h2><p>Ingresa el código OTP enviado a tu dispositivo</p>
  </div>
  ${campo('shield-halved', 'text', 'otpCode', 'Código OTP de 6 dígitos')}
  <button type="button" id="Verificar2FA" class="wilg_btn"><i class="fas fa-lock-open"></i> Verificar</button>
  <div class="wilg_links"><span class="wilg_log"><i class="fas fa-arrow-left"></i> Volver</span></div>`;

// Lógica de verificación 2FA
export const verificar2FA = async (btn) => {
  const otpEl = document.getElementById('otpCode');
  const code = otpEl ? otpEl.value.trim() : '';
  if (code.length < 6) return;

  wiSpin(btn, true, 'Verificando...');
  try {
    // Si usas Supabase MFA, puedes llamar a:
    // const { data, error } = await supabase.auth.mfa.verify({ factorId: '...', code });
    
    // Por ahora, dejamos el flujo simulado/listo para su integración real
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error(t('errCredentials'));

    const { data: profile, error: profError } = await supabase
      .from('smiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profError || !profile) throw new Error(t('errProfileNotFound'));

    entrar(profile);
  } catch (e) {
    const keyError = mapearErrorAuth(e);
    Mensaje(t(keyError), 'error');
  } finally {
    wiSpin(btn, false);
  }
};
