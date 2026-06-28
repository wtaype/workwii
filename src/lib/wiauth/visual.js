// src/lib/wiauth/visual.js
// Controlador de eventos del DOM y orquestador visual del flujo de autenticación

import estilosLogin from './login.css?inline';
import { supabase } from '../supabase.js';
import { getls } from '../widev/storage.js';
import { abrirModal, cerrarTodos, wiTip, Mensaje } from '../widev/widev.js';
import { wiAuth, entrar, ROL_PATH, salir } from './sesion.js';
import { tplLogin, tplUsername, checkLoginBtn, iniciarGoogleSSO, iniciarSesionOrdinaria, t } from './login.js';
import { tplRegistrar, checkRegisterBtn, checkCompleteBtn, checkField, completarGoogleSSO, reglas } from './registro.js';
import { tplRestablecer, enviarEnlaceRecuperacion } from './recuperar.js';
import { tplTwoFA, verificar2FA } from './twofa.js';

let _googleUser = null;
let vTimeout = null;

const tpls = {
  login: tplLogin,
  registrar: tplRegistrar,
  restablecer: tplRestablecer,
  username: tplUsername,
  twofa: tplTwoFA
};

// Generar HTML del modal
const modalHTML = (vista, cls = '') =>
  `<div id="wilg_modal" class="wiModal wilg_mod ${cls}"><style>${estilosLogin}</style><div class="modalBody"><button class="modalX">&times;</button><form id="liForm">${tpls[vista]()}</form></div></div>`;

// Cambiar de vista en el formulario (login/registro/etc)
const setupFormState = (v) => {
  const firstInput = document.querySelector('#liForm input');
  if (firstInput) firstInput.focus();

  // Resetear estados
  ['regEmail', 'regUsuario', 'regNombre', 'regApellidos', 'regPassword', 'regPassword1'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.value = ''; el.dataset.ok = 'false'; }
  });

  if (v === 'login') {
    const loginBtn = document.getElementById('Login');
    if (loginBtn) { loginBtn.classList.add('inactivo'); loginBtn.disabled = true; }
    requestAnimationFrame(checkLoginBtn);
  }
  if (v === 'registrar') {
    const regBtn = document.getElementById('Registrar');
    if (regBtn) { regBtn.classList.add('inactivo'); regBtn.disabled = true; }
  }
  if (v === 'username') {
    const compBtn = document.getElementById('CompletarGoogle');
    if (compBtn) { compBtn.classList.add('inactivo'); compBtn.disabled = true; }
  }
};

const mostrar = v => {
  const form = document.getElementById('liForm');
  if (form) { form.innerHTML = tpls[v](); form.setAttribute('data-vista', v); }
  setTimeout(() => setupFormState(v), 30);
};

const esModal = () => document.querySelector('#wilg_modal.active') !== null;

const swap = v => {
  if (esModal()) {
    const modalEl = document.getElementById('wilg_modal');
    if (modalEl) modalEl.classList.toggle('wilg_mod_reg', v === 'registrar');
    const form = document.getElementById('liForm');
    if (form) { form.innerHTML = tpls[v](); form.setAttribute('data-vista', v); }
    setTimeout(() => setupFormState(v), 50);
  } else {
    mostrar(v);
  }
};

const toggleModal = (vista, isNew = false) => {
  if (isNew) {
    const old = document.getElementById('wilg_modal');
    if (old) old.remove();
    const cls = vista === 'registrar' ? 'wilg_mod_reg' : '';
    const wrapper = document.createElement('div');
    wrapper.innerHTML = modalHTML(vista, cls);
    const modalEl = wrapper.firstElementChild;
    if (modalEl) { document.body.appendChild(modalEl); abrirModal('wilg_modal'); }
  } else {
    swap(vista);
  }
  setTimeout(() => setupFormState(vista), 50);
};

// --- CLIENT-SIDE LISTENERS ---
if (typeof window !== 'undefined') {
  document.addEventListener('submit', e => {
    if (e.target.closest('#liForm')) e.preventDefault();
  });

  document.addEventListener('click', async e => {
    const target = e.target;

    // 1. Mostrar/ocultar contraseña (ojo)
    const ojo = target.closest('.wilg_ojo');
    if (ojo) {
      const input = ojo.previousElementSibling;
      if (input) {
        input.setAttribute('type', input.getAttribute('type') === 'password' ? 'text' : 'password');
        ojo.classList.toggle('fa-eye');
        ojo.classList.toggle('fa-eye-slash');
      }
      return;
    }

    // 2. Intercambio de vistas
    if (target.closest('.wilg_reg')) return swap('registrar');
    if (target.closest('.wilg_rec')) return swap('restablecer');
    if (target.closest('.wilg_log')) return swap('login');

    // 3. Google SSO
    const btnGoogle = target.closest('#btnGoogle');
    if (btnGoogle) {
      e.preventDefault();
      await iniciarGoogleSSO(btnGoogle);
      return;
    }

    // 4. Completar Google SSO
    const btnCG = target.closest('#CompletarGoogle');
    if (btnCG) {
      e.preventDefault();
      await completarGoogleSSO(btnCG, _googleUser);
      return;
    }

    // 5. Iniciar sesión ordinaria
    const btnLogin = target.closest('#Login');
    if (btnLogin) {
      e.preventDefault();
      await iniciarSesionOrdinaria(btnLogin);
      return;
    }

    // 6. Registrar
    const btnReg = target.closest('#Registrar');
    if (btnReg) {
      e.preventDefault();
      await registrarUsuario(btnReg);
      return;
    }

    // 7. Recuperar
    const btnRec = target.closest('#Recuperar');
    if (btnRec) {
      e.preventDefault();
      await enviarEnlaceRecuperacion(btnRec);
      return;
    }

    // 8. OTP 2FA
    const btn2FA = target.closest('#Verificar2FA');
    if (btn2FA) {
      e.preventDefault();
      await verificar2FA(btn2FA);
      return;
    }
  });

  // Manejo de focos secuenciales
  document.addEventListener('focus', e => {
    const target = e.target;
    if (target.closest('#liForm input')) {
      const list = ['regEmail', 'regUsuario', 'regNombre', 'regApellidos', 'regPassword', 'regPassword1'];
      const idx = list.indexOf(target.id);
      if (idx <= 0) return;
      for (let i = 0; i < idx; i++) {
        const prev = document.getElementById(list[i]);
        if (prev && prev.getAttribute('data-ok') !== 'true') { prev.focus(); break; }
      }
    }
  }, true);

  document.addEventListener('change', e => {
    const target = e.target;
    if (target.id === 'regTerminos') {
      const ok = target.checked;
      ['Registrar', 'CompletarGoogle'].forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) { btn.classList.toggle('inactivo', !ok); btn.disabled = !ok; }
      });
    }
    if (target.closest('#liForm input')) {
      checkField(target, true);
      if (target.id === 'email' || target.id === 'password') checkLoginBtn();
    }
  });

  document.addEventListener('keyup', e => {
    const target = e.target;
    if (e.key === 'Enter' && target.closest('#liForm input')) {
      checkField(target, true);
      if (target.id === 'password') document.getElementById('Login')?.click();
      if (target.id === 'regPassword1') {
        const regBtn = document.getElementById('Registrar');
        if (regBtn && !regBtn.disabled) regBtn.click();
      }
      if (target.id === 'recEmail') document.getElementById('Recuperar')?.click();
    }
  });

  document.addEventListener('input', e => {
    const target = e.target;
    if (target.closest('#liForm input')) {
      const id = target.id, raw = target.value;
      const clean = id.includes('Email') || id === 'email' ? raw.replace(/[<>="'`;/\\$}{ ]/g, '').toLowerCase()
                  : id.includes('Usuario') ? raw.toLowerCase().replace(/[^a-z0-9_-]/g, '')
                  : id.includes('Nombre') || id.includes('Apellidos') ? raw.replace(/[<>="'`;/\\$}{]/g, '') : raw;
      target.value = clean;

      if (id === 'email' || id === 'password') checkLoginBtn();

      if (!target.value.trim()) {
        target.dataset.ok = 'false';
        const list = ['regEmail', 'regUsuario', 'regNombre', 'regApellidos', 'regPassword', 'regPassword1'];
        const idx = list.indexOf(id);
        if (idx !== -1) {
          for (let i = idx + 1; i < list.length; i++) {
            const next = document.getElementById(list[i]);
            if (next) { next.value = ''; next.dataset.ok = 'false'; }
          }
          const term = document.getElementById('regTerminos');
          if (term) term.checked = false;
          ['Registrar', 'CompletarGoogle'].forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) { btn.classList.add('inactivo'); btn.disabled = true; }
          });
        }
        return;
      }

      // Validar con debounce corto
      const rule = reglas[id];
      const ok = !rule || rule[1](rule[0](target.value.trim())) === true;
      if (ok) {
        if (vTimeout) clearTimeout(vTimeout);
        vTimeout = setTimeout(() => checkField(target), 400);
      }
    }
  });

  window.addEventListener('storage', (e) => {
    if (e.key === 'wiSmile') {
      window.location.reload();
    }
  });
}

// --- EXPORTS DE CONTROLADOR VISUAL ---

export const render = () => `<div class="wilg_wrap"><div class="wilg_card"><form id="liForm"></form></div></div>`;

export const abrirLogin = (tipo = 'login') => {
  toggleModal(tipo === 'registrar' ? 'registrar' : 'login', true);
};

export const init = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    const localUser = getls('wiSmile');
    if (!localUser) {
      // Intentar recuperar el perfil
      const { data: profile } = await supabase
        .from('smiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        entrar(profile);
      } else {
        // Es un registro nuevo por Google SSO, pedir usuario
        _googleUser = session.user;
        swap('username');
      }
    } else {
      window.location.href = ROL_PATH[localUser.rol] || '/';
    }
    return;
  }

  const wi = wiAuth.user;
  if (wi) return setTimeout(() => window.location.href = ROL_PATH[wi.rol] || '/', 0);
  mostrar('login');
};

export { salir };
