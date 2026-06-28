// src/lib/wiauth/registro.js
// Plantilla de registro, sanitización, validaciones y creación de cuenta

import { supabase } from '../supabase.js';
import { langwii, wiSpin, Mensaje, wiTip, cerrarTodos, wiRateLimit } from '../widev/widev.js';
import { app, dtema } from '../../wii.js';
import { entrar } from './sesion.js';
import { idiomaLogin, mapearErrorAuth } from './idioma.js';
import { campo, t } from './login.js';

let rolPublico = 'usuario';
let avatarMain = '/smile.avif';

// --- SANITIZACIÓN ESTRICTA ---
export const sanName  = v => v.replace(/[<>="'`;/\\$}{]/g, '').replace(/\s{2,}/g, ' ');
export const sanEmail = v => v.replace(/[<>="'`;/\\$}{ ]/g, '').toLowerCase().trim();
export const sanUser  = v => v.toLowerCase().replace(/[^a-z0-9_-]/g, '').trim();

export const reglas = {
  regEmail:     [sanEmail, v => /^[\w.-]+@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(v) || t('errInvalidEmail')],
  regUsuario:   [sanUser,  v => v.length >= 4 || t('valUserMin')],
  regNombre:    [sanName,  v => v.length > 0 || t('valNameReq')],
  regApellidos: [sanName,  v => v.length > 0 || t('valLastReq')],
  regPassword:  [v => v,   v => v.length >= 6 || t('valPassMin')],
  regPassword1: [v => v,   v => {
    const pwd = document.getElementById('regPassword');
    return v === (pwd ? pwd.value : '') || t('valNoMatch');
  }]
};

// Template HTML del formulario de registro
export const tplRegistrar = () => `
  <div class="wilg_head">
    <div class="wilg_logo"><img src="/smile.avif" alt="${app}"></div>
    <h2>${t('createAccount')}</h2><p>${t('registerSub')}</p>
  </div>
  <button type="button" class="wilg_btn_google" id="btnGoogle"><img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google"> ${t('btnGoogle')}</button>
  <div class="wilg_or"><span>${t('orEmail')}</span></div>
  <div class="wilg_grid">
    ${campo('envelope', 'email', 'regEmail', t('inputRegEmail'))}
    ${campo('user', 'text', 'regUsuario', t('inputRegUsuario'))}
    ${campo('user-tie', 'text', 'regNombre', t('inputRegNombre'))}
    ${campo('user-tie', 'text', 'regApellidos', t('inputRegApellidos'))}
    ${campo('lock', 'password', 'regPassword', t('inputRegPassword'), true)}
    ${campo('lock', 'password', 'regPassword1', t('inputRegPasswordConfirm'), true)}
  </div>
  <div class="wilg_check">
    <label><input type="checkbox" id="regTerminos">
    <span>${t('checkTerminos')}</span></label>
  </div>
  <button type="button" id="Registrar" class="wilg_btn inactivo" disabled><i class="fas fa-user-plus"></i> ${t('btnRegistrar')}</button>
  <div class="wilg_links"><span class="wilg_log"><i class="fas fa-arrow-left"></i> ${t('linkLogin')}</span></div>`;

// Comprobación y activación del botón de registro
export const checkRegisterBtn = () => {
  const regBtn = document.getElementById('Registrar');
  if (regBtn) {
    const reqFields = ['regEmail', 'regUsuario', 'regNombre', 'regApellidos', 'regPassword', 'regPassword1'];
    const ok = reqFields.every(id => {
      const el = document.getElementById(id);
      return el?.dataset.ok === 'true';
    });
    regBtn.classList.toggle('inactivo', !ok);
    regBtn.disabled = !ok;
  }
};

// Comprobación y activación de Completar Registro (Google)
export const checkCompleteBtn = () => {
  const compBtn = document.getElementById('CompletarGoogle');
  if (compBtn) {
    const uEl = document.getElementById('regUsuario');
    const ok = uEl?.dataset.ok === 'true';
    compBtn.classList.toggle('inactivo', !ok);
    compBtn.disabled = !ok;
  }
};

// Validación y chequeo de disponibilidad en el servidor en tiempo real
export const checkField = async (el, forzarTip = false) => {
  const id = el.id, value = el.value.trim();
  if (!value) return;

  const rule = reglas[id];
  if (rule) {
    const [trans, vld] = rule;
    const v = trans(value); el.value = v;
    const r = vld(v);
    if (r !== true) {
      if (forzarTip) { wiTip(el, r, 'error', 2500); el.dataset.ok = 'false'; }
      return;
    }
  }

  let ok = true;
  if (id === 'regEmail') {
    const rl = wiRateLimit('regValidacion', 5);
    if (!rl.ok) {
      el.dataset.ok = 'false';
      wiTip(el, t('waitAttempts', { min: rl.min }), 'error', 2500);
      return;
    }
    rl.fail();
    
    const { data: existe, error } = await supabase.rpc('existe_email', { email_buscado: value });
    if (error) { console.error(error); return; }
    ok = !existe;
    wiTip(el, ok ? t('emailOk') : t('emailNo'), ok ? 'success' : 'error', 2500);
  } else if (id === 'regUsuario') {
    if (value.includes('@')) {
      el.dataset.ok = 'false';
      if (forzarTip) wiTip(el, t('valUserNoAt'), 'error', 2500);
      return;
    }
    const rl = wiRateLimit('regValidacion', 5);
    if (!rl.ok) {
      el.dataset.ok = 'false';
      wiTip(el, t('waitAttempts', { min: rl.min }), 'error', 2500);
      return;
    }
    rl.fail();
    
    const { data: existe, error } = await supabase.rpc('existe_usuario', { username_buscado: value });
    if (error) { console.error(error); return; }
    ok = !existe;
    wiTip(el, ok ? t('userOk') : t('userNo'), ok ? 'success' : 'error', 2500);
  } else if (id === 'regNombre' || id === 'regApellidos') {
    ok = value.length > 0;
  } else if (id === 'regPassword') {
    ok = value.length >= 6;
  } else if (id === 'regPassword1') {
    const p1El = document.getElementById('regPassword');
    const p1 = p1El ? p1El.value : '';
    ok = value.length >= 6 && value === p1;
    if (ok) wiTip(el, t('valMatch'), 'success', 2500);
    else if (p1 && value !== p1 && forzarTip) wiTip(el, t('valNoMatch'), 'error', 2500);
  }

  el.dataset.ok = ok ? 'true' : 'false';
};

// Registrar nuevo usuario
export const registrarUsuario = async (btn) => {
  const termEl = document.getElementById('regTerminos');
  const userEl = document.getElementById('regUsuario');
  const emailEl = document.getElementById('regEmail');
  if (termEl && !termEl.checked) return wiTip(termEl, t('valTerminos'), 'error', 2500);
  if (userEl?.dataset.ok !== 'true') return wiTip(userEl, t('valUsuarioInput'), 'error', 2500);
  if (emailEl?.dataset.ok !== 'true') return wiTip(emailEl, t('valEmailInput'), 'error', 2500);

  const getVal = id => {
    const inputEl = document.getElementById(id);
    return inputEl ? inputEl.value.trim() : '';
  };

  const d = {
    email: getVal('regEmail'),
    usuario: getVal('regUsuario'),
    nombre: getVal('regNombre'),
    apellidos: getVal('regApellidos'),
    password: getVal('regPassword')
  };

  wiSpin(btn, true, t('btnRegistrar'));
  try {
    const { data, error } = await supabase.auth.signUp({ email: d.email, password: d.password });
    if (error) throw error;

    const userProfile = {
      id: data.user.id,
      usuario: d.usuario,
      email: d.email,
      nombre: d.nombre,
      apellidos: d.apellidos,
      rol: rolPublico,
      activo: true,
      estado: 'pendiente',
      terminos: true,
      terminosFecha: new Date().toISOString(),
      tema: localStorage.wiTema || dtema,
      avatar: avatarMain,
      plan: 'free',
      segmento: 'general',
      verificado: false,
      registradoPor: 'email',
      creado: new Date().toISOString(),
      actualizado: new Date().toISOString()
    };
    
    const { error: insertError } = await supabase
      .from('smiles')
      .insert(userProfile);
    if (insertError) throw insertError;

    if (document.querySelector('#wilg_modal.active') !== null) cerrarTodos();
    window.location.href = '/registrado';
  } catch (e) {
    const keyError = mapearErrorAuth(e);
    Mensaje(t(keyError), 'error');
  } finally {
    wiSpin(btn, false);
  }
};

// Completar registro SSO
export const completarGoogleSSO = async (btn, googleUser) => {
  const termEl = document.getElementById('regTerminos');
  const uEl = document.getElementById('regUsuario');
  const u = uEl ? uEl.value.trim() : '';

  if (termEl && !termEl.checked) return wiTip(termEl, t('valTerminos'), 'error', 2500);
  if (!u || uEl?.dataset.ok !== 'true') return wiTip(uEl, t('valUsuarioInput'), 'error', 2500);
  if (!googleUser) return Mensaje(t('errGoogleSSO'), 'error');

  wiSpin(btn, true, t('btnComplete'));
  try {
    const partes = googleUser.user_metadata?.full_name ? googleUser.user_metadata.full_name.split(' ') : ['Usuario', ''];
    const wi = {
      id: googleUser.id,
      usuario: u,
      email: googleUser.email,
      nombre: googleUser.user_metadata?.given_name || partes[0],
      apellidos: googleUser.user_metadata?.family_name || partes.slice(1).join(' ') || '',
      rol: rolPublico,
      activo: true,
      estado: 'activo',
      terminos: true,
      terminosFecha: new Date().toISOString(),
      tema: localStorage.wiTema || dtema,
      avatar: googleUser.user_metadata?.avatar_url || avatarMain,
      plan: 'free',
      segmento: 'general',
      verificado: false,
      registradoPor: 'google',
      creado: new Date().toISOString(),
      actualizado: new Date().toISOString()
    };
    
    const { error: insertError } = await supabase
      .from('smiles')
      .insert(wi);
    if (insertError) throw insertError;

    entrar(wi);
  } catch (e) {
    const keyError = mapearErrorAuth(e);
    Mensaje(t(keyError), 'error');
  } finally {
    wiSpin(btn, false);
  }
};
