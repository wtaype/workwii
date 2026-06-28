// src/lib/wiauth/login.js
// Formulario de inicio de sesión, plantillas HTML localizadas y llamadas de autenticación

import { supabase } from '../supabase.js';
import { langwii, wiSpin, Mensaje, wiTip, abrirModal, cerrarTodos } from '../widev/widev.js';
import { app } from '../../wii.js';
import { entrar, ROL_PATH } from './sesion.js';
import { idiomaLogin, mapearErrorAuth } from './idioma.js';

const t = (key, params = {}) => langwii.nw(idiomaLogin[key], params);

// Helper para dibujar campos
export const campo = (ico, tipo, id, place, ojo = false) =>
  `<div class="wilg_grupo"><i class="fas fa-${ico}"></i><input type="${tipo}" id="${id}" placeholder="${place}" autocomplete="off">${ojo ? '<i class="fas fa-eye wilg_ojo"></i>' : ''}</div>`;

// Template HTML del formulario de ingreso
export const tplLogin = () => `
  <div class="wilg_head">
    <div class="wilg_logo"><img src="/smile.avif" alt="${app}"></div>
    <h2>${t('welcome')}</h2><p>${t('loginSub')}</p>
  </div>
  <button type="button" class="wilg_btn_google" id="btnGoogle"><img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google"> ${t('btnGoogle')}</button>
  <div class="wilg_or"><span>${t('orEmail')}</span></div>
  ${campo('envelope', 'text', 'email', t('inputEmail'))}
  ${campo('lock', 'password', 'password', t('inputPassword'), true)}
  <button type="button" id="Login" class="wilg_btn inactivo" disabled><i class="fas fa-sign-in-alt"></i> ${t('btnLogin')}</button>
  <div class="wilg_links">
    <span class="wilg_rec"><i class="fas fa-key"></i> ${t('linkForgot')}</span>
    <span class="wilg_reg">${t('linkRegister')} <i class="fas fa-arrow-right"></i></span>
  </div>`;

// Template HTML para completar registro de Google SSO
export const tplUsername = () => `
  <div class="wilg_head">
    <div class="wilg_logo"><img src="/smile.avif" alt="${app}"></div>
    <h2>${t('almostReady')}</h2><p>${t('completeSub')}</p>
  </div>
  ${campo('user', 'text', 'regUsuario', t('inputCompleteUser'))}
  <div class="wilg_check" style="margin-top: 1.5vh;">
    <label><input type="checkbox" id="regTerminos">
    <span>${t('checkTerminos')}</span></label>
  </div>
  <button type="button" id="CompletarGoogle" class="wilg_btn inactivo" disabled style="margin-top: 1.5vh;"><i class="fas fa-rocket"></i> ${t('btnComplete')}</button>`;

// Activar o desactivar botón de login según inputs
export const checkLoginBtn = () => {
  const loginBtn = document.getElementById('Login');
  if (loginBtn) {
    const emailInput = document.getElementById('email');
    const passInput = document.getElementById('password');
    const ok = (emailInput?.value.trim().length || 0) > 0 && (passInput?.value.length || 0) >= 6;
    loginBtn.classList.toggle('inactivo', !ok);
    loginBtn.disabled = !ok;
  }
};

// Iniciar sesión ordinaria (Soporta Email y Usuario por RPC)
export const iniciarSesionOrdinaria = async (btn) => {
  const emailInput = document.getElementById('email');
  const passInput = document.getElementById('password');
  const input = emailInput ? emailInput.value.trim() : '';
  const pass = passInput ? passInput.value : '';

  if (!input || pass.length < 6) return;

  wiSpin(btn, true, t('btnLogin'));
  try {
    let email = input;
    
    // Si no contiene un símbolo '@', resolvemos el email a partir de su nombre de usuario
    if (!input.includes('@')) {
      const { data: resolvedEmail, error: rpcErr } = await supabase.rpc('obtener_email_por_usuario', { username_buscado: input });
      if (rpcErr || !resolvedEmail) throw new Error(t('errUserNotFound'));
      email = resolvedEmail;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;

    // Obtener perfil detallado
    const { data: profile, error: profError } = await supabase
      .from('smiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profError || !profile) throw new Error(t('errProfileNotFound'));

    if (profile.estado === 'pendiente') {
      await supabase.auth.signOut();
      if (document.querySelector('#wilg_modal.active') !== null) cerrarTodos();
      return window.location.href = '/registrado';
    }

    entrar(profile);
  } catch (e) {
    const keyError = mapearErrorAuth(e);
    Mensaje(t(keyError), 'error');
  } finally {
    wiSpin(btn, false);
  }
};

// SSO con Google
export const iniciarGoogleSSO = async (btnGoogle) => {
  if (btnGoogle.dataset.busy === 'true') return;
  btnGoogle.dataset.busy = 'true';
  const prevHtml = btnGoogle.innerHTML;
  btnGoogle.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Conectando...';
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/login'
      }
    });
    if (error) throw error;
  } catch (errCode) {
    const keyError = mapearErrorAuth(errCode);
    Mensaje(t(keyError), 'error');
    btnGoogle.innerHTML = prevHtml;
    btnGoogle.dataset.busy = 'false';
  }
};
export { t };
