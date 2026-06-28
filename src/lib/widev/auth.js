// src/lib/widev/auth.js
// wiAuth v3.1: Bus de eventos y control de estado reactivo para autenticación de usuario (login, logout, perfil)

import { getls, savels, removels } from './storage.js';

const bus = new Set();

export const wiAuth = {
  get user() {
    return getls('wiSmile');
  },

  on(fn) {
    if (typeof fn !== 'function') return () => {};
    bus.add(fn);
    const u = this.user;
    if (u) {
      try {
        fn(u);
      } catch (e) {
        console.error('wiAuth init callback error:', e);
      }
    }
    return () => bus.delete(fn);
  },

  emit(wi) {
    bus.forEach(fn => {
      try {
        fn(wi);
      } catch (e) {
        console.error('wiAuth emit error:', e);
      }
    });
  },

  login(wi, h = 144, keep = []) {
    // Limpia todo localStorage excepto temas, cookies y las especificadas en keep
    removels.except(['wiTema', 'cookiesPrivacidad', 'wiSmart', ...keep]);
    savels('wiSmile', wi, h);
    this.emit(wi);
  },

  logout(keep = []) {
    removels.except(['wiTema', 'cookiesPrivacidad', 'wiSmart', ...keep]);
    this.emit(null);
  }
};