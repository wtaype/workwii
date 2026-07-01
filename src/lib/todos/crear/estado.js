// src/lib/crear/estado.js
// Gestor de Estado Central (Single Source of Truth) para el Creador de CV ATS

import { DEFAULT_STATE, crearNuevoItem } from './centralcv.js';

let cvState = { ...DEFAULT_STATE };
const subscribers = [];
let debounceTimer = null;

const getCacheKey = () => {
  if (typeof window === 'undefined') return 'crear_cv_es';
  const isEn = window.location.pathname.includes('/en/crear');
  return isEn ? 'crear_cv_en' : 'crear_cv_es';
};

export const crearEstructuraExp = () => crearNuevoItem('experiencias');
export const crearEstructuraEdu = () => crearNuevoItem('educacion');
export const crearEstructuraProj = () => crearNuevoItem('proyectos');
export const crearEstructuraCert = () => crearNuevoItem('certificaciones');

// Obtener una copia profunda del estado actual
export const getCvData = () => {
  return JSON.parse(JSON.stringify(cvState));
};

// Guardar los datos del CV de forma persistente en LocalStorage con Debounce para rendimiento
export const saveToLocalStorage = () => {
  if (typeof localStorage === 'undefined') return;
  
  if (debounceTimer) clearTimeout(debounceTimer);
  
  debounceTimer = setTimeout(() => {
    try {
      const key = getCacheKey();
      localStorage.setItem(key, JSON.stringify(cvState));
    } catch (e) {
      console.error('Error al guardar caché de CV:', e);
    }
  }, 500);
};

// Actualizar campos individuales o la estructura completa del CV
export const updateCvData = (newData) => {
  if (newData && newData.experiencias) {
    newData.experiencias = newData.experiencias.map(exp => {
      if (exp) {
        if (Array.isArray(exp.logros)) {
          exp.logros = exp.logros.join('\n');
        } else if (typeof exp.logros !== 'string') {
          exp.logros = '';
        }
      }
      return exp;
    });
  }
  cvState = { ...cvState, ...newData };
  if (cvState.experiencias) {
    cvState.experiencias = cvState.experiencias.map(exp => {
      if (exp) {
        if (Array.isArray(exp.logros)) {
          exp.logros = exp.logros.join('\n');
        } else if (typeof exp.logros !== 'string') {
          exp.logros = '';
        }
      }
      return exp;
    });
  }
  
  // Guardado automático persistente
  saveToLocalStorage();
  
  // Notificar a todos los suscriptores sobre el cambio de estado
  notifySubscribers();
};

// Cargar estado inicial desde LocalStorage o inicializar con estructura mínima
export const loadFromLocalStorage = () => {
  if (typeof localStorage === 'undefined') return { ...DEFAULT_STATE };

  try {
    const key = getCacheKey();
    const cached = localStorage.getItem(key);
    if (cached) {
      const parsed = JSON.parse(cached);
      cvState = { ...DEFAULT_STATE, ...parsed };
    } else {
      cvState = {
        ...DEFAULT_STATE,
        experiencias: [crearEstructuraExp()],
        educacion: [crearEstructuraEdu()],
        proyectos: [],
        certificaciones: []
      };
    }
  } catch (e) {
    console.error('Error al cargar caché inicial:', e);
    cvState = {
      ...DEFAULT_STATE,
      experiencias: [crearEstructuraExp()],
      educacion: [crearEstructuraEdu()],
      proyectos: [],
      certificaciones: []
    };
  }
  
  if (cvState.experiencias) {
    cvState.experiencias = cvState.experiencias.map(exp => {
      if (exp) {
        if (Array.isArray(exp.logros)) {
          exp.logros = exp.logros.join('\n');
        } else if (typeof exp.logros !== 'string') {
          exp.logros = '';
        }
      }
      return exp;
    });
  }
  
  notifySubscribers();
  return getCvData();
};

// Reiniciar datos del CV al estado base
export const resetCvData = () => {
  cvState = {
    ...DEFAULT_STATE,
    experiencias: [crearEstructuraExp()],
    educacion: [crearEstructuraEdu()],
    proyectos: [],
    certificaciones: []
  };
  if (typeof localStorage !== 'undefined') {
    const key = getCacheKey();
    localStorage.removeItem(key);
  }
  notifySubscribers();
};

// Sistema de suscripción reactivo (Observer Pattern)
export const subscribe = (callback) => {
  subscribers.push(callback);
  // Llamar inmediatamente con el estado actual
  callback(getCvData());
  
  // Retornar función para desuscribirse
  return () => {
    const index = subscribers.indexOf(callback);
    if (index > -1) {
      subscribers.splice(index, 1);
    }
  };
};

const notifySubscribers = () => {
  const data = getCvData();
  subscribers.forEach(cb => {
    try {
      cb(data);
    } catch (e) {
      console.error('Error en suscriptor de estado:', e);
    }
  });
};
