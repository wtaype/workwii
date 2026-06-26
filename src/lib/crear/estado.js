// src/lib/crear/estado.js
// Gestor de Estado Central (Single Source of Truth) para el Creador de CV ATS

const DEFAULT_STATE = {
  nombre: '',
  titulo: '',
  email: '',
  telefono: '',
  ubicacion: '',
  linkedin: '',
  web: '',
  resumen: '',
  experiencias: [],
  educacion: [],
  skills: '',
  idiomas: [],
  incluirFoto: false,
  fotoBase64: '',
  idioma: 'es',
  _pdfWarnings: [] // Alertas internas sobre el archivo subido (tablas, escaneo, etc.)
};

let cvState = { ...DEFAULT_STATE };
const subscribers = [];
let debounceTimer = null;

export const crearEstructuraExp = () => ({
  id: 'exp_' + Math.random().toString(36).substring(2, 9),
  puesto: '',
  empresa: '',
  ubicacion: '',
  inicio: '',
  fin: '',
  logros: ''
});

export const crearEstructuraEdu = () => ({
  id: 'edu_' + Math.random().toString(36).substring(2, 9),
  institucion: '',
  grado: '',
  ubicacion: '',
  inicio: '',
  fin: ''
});

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
      localStorage.setItem('workwii_active_cv', JSON.stringify(cvState));
    } catch (e) {
      console.error('Error al guardar caché de CV:', e);
    }
  }, 500);
};

// Actualizar campos individuales o la estructura completa del CV
export const updateCvData = (newData) => {
  cvState = { ...cvState, ...newData };
  
  // Guardado automático persistente
  saveToLocalStorage();
  
  // Notificar a todos los suscriptores sobre el cambio de estado
  notifySubscribers();
};

// Cargar estado inicial desde LocalStorage o inicializar con estructura mínima
export const loadFromLocalStorage = () => {
  if (typeof localStorage === 'undefined') return { ...DEFAULT_STATE };

  try {
    const cached = localStorage.getItem('workwii_active_cv');
    if (cached) {
      const parsed = JSON.parse(cached);
      cvState = { ...DEFAULT_STATE, ...parsed };
    } else {
      cvState = {
        ...DEFAULT_STATE,
        experiencias: [crearEstructuraExp()],
        educacion: [crearEstructuraEdu()]
      };
    }
  } catch (e) {
    console.error('Error al cargar caché inicial:', e);
    cvState = {
      ...DEFAULT_STATE,
      experiencias: [crearEstructuraExp()],
      educacion: [crearEstructuraEdu()]
    };
  }
  
  notifySubscribers();
  return getCvData();
};

// Reiniciar datos del CV al estado base
export const resetCvData = () => {
  cvState = {
    ...DEFAULT_STATE,
    experiencias: [crearEstructuraExp()],
    educacion: [crearEstructuraEdu()]
  };
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('workwii_active_cv');
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
