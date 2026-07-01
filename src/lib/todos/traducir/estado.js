// src/lib/todos/traducir/estado.js
// Gestor de Estado Central (Single Source of Truth) para el Creador de CV ATS
// Contiene la definicion de esquemas y constructores (antes en centralcv.js) integrados directamente.
// Escrito en espanol sin tildes para evitar problemas de codificacion.

import { savels, getls, removels } from '../../widev/storage.js';

export const SECCIONES = [
  { id: 'contacto', icon: 'fa-address-card', label: { es: 'Contacto', en: 'Contact' } },
  { id: 'perfil', icon: 'fa-user', label: { es: 'Perfil', en: 'Profile' } },
  { id: 'experiencia', icon: 'fa-briefcase', label: { es: 'Experiencia', en: 'Experience' } },
  { id: 'educacion', icon: 'fa-graduation-cap', label: { es: 'Educacion', en: 'Education' } },
  { id: 'proyectos', icon: 'fa-project-diagram', label: { es: 'Proyectos', en: 'Projects' } },
  { id: 'certificados', icon: 'fa-certificate', label: { es: 'Certificaciones', en: 'Certifications' } },
  { id: 'skills', icon: 'fa-sliders-h', label: { es: 'Habilidades', en: 'Skills' } }
];

export const DEFAULT_STATE = {
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
  proyectos: [],
  certificaciones: [],
  skills: '',
  idiomas: [],
  incluirFoto: false,
  fotoBase64: '',
  idioma: 'es',
  _pdfWarnings: []
};

export const CAMPOS_DIRECTOS = [
  'nombre',
  'titulo',
  'email',
  'telefono',
  'ubicacion',
  'linkedin',
  'web',
  'resumen',
  'skills',
  'idiomas'
];

export const CAMPOS_LISTAS = [
  'experiencias',
  'educacion',
  'proyectos',
  'certificaciones'
];

export const ETIQUETAS_PROPIEDADES = {
  logros: { es: 'Logros', en: 'Achievements' },
  puesto: { es: 'Puesto', en: 'Job Title' },
  grado: { es: 'Grado Academico', en: 'Degree' },
  nombre: { es: 'Nombre', en: 'Name' },
  descripcion: { es: 'Descripcion', en: 'Description' },
  institucion: { es: 'Institución', en: 'Institution' },
  emisor: { es: 'Emisor', en: 'Issuer' },
  fecha: { es: 'Fecha', en: 'Date' },
  tecnologias: { es: 'Tecnologías', en: 'Technologies' },
  enlace: { es: 'Enlace', en: 'Link' },
  empresa: { es: 'Empresa', en: 'Company' },
  resumen: { es: 'Resumen Profesional', en: 'Professional Summary' },
  skills: { es: 'Habilidades Clave (Skills)', en: 'Key Skills' },
  titulo: { es: 'Titulo Profesional', en: 'Professional Title' },
  ubicacion: { es: 'Ubicación', en: 'Location' },
  idiomas: { es: 'Idiomas', en: 'Languages' }
};

export const crearNuevoItem = (seccion) => {
  const rand = Math.random().toString(36).substring(2, 9);
  const secNorm = seccion.toLowerCase();
  
  if (secNorm === 'experiencias' || secNorm === 'experiencia') {
    return {
      id: `exp_${rand}`,
      puesto: '',
      empresa: '',
      ubicacion: '',
      inicio: '',
      fin: '',
      logros: ''
    };
  }
  
  if (secNorm === 'educacion') {
    return {
      id: `edu_${rand}`,
      institucion: '',
      grado: '',
      ubicacion: '',
      inicio: '',
      fin: ''
    };
  }
  
  if (secNorm === 'proyectos' || secNorm === 'proyecto') {
    return {
      id: `proj_${rand}`,
      nombre: '',
      enlace: '',
      descripcion: '',
      tecnologias: ''
    };
  }
  
  if (secNorm === 'certificaciones' || secNorm === 'certificados' || secNorm === 'certificado') {
    return {
      id: `cert_${rand}`,
      nombre: '',
      emisor: '',
      fecha: ''
    };
  }
  
  return {};
};

let cvState = { ...DEFAULT_STATE };
const subscribers = [];
let debounceTimer = null;

const getCacheKey = () => {
  if (typeof window === 'undefined') return 'traducir_es';
  const isEn = window.location.pathname.includes('/en/crear') || window.location.pathname.includes('/en/traducir');
  return isEn ? 'traducir_en' : 'traducir_es';
};

export const crearEstructuraExp = () => crearNuevoItem('experiencias');
export const crearEstructuraEdu = () => crearNuevoItem('educacion');
export const crearEstructuraProj = () => crearNuevoItem('proyectos');
export const crearEstructuraCert = () => crearNuevoItem('certificaciones');

export const getCvData = () => {
  return JSON.parse(JSON.stringify(cvState));
};

export const saveToLocalStorage = () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  
  debounceTimer = setTimeout(() => {
    const key = getCacheKey();
    savels(key, cvState, 168); // Guardar por 7 días
  }, 500);
};

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
  saveToLocalStorage();
  notifySubscribers();
};

export const updateCvField = (path, value) => {
  const parts = path.split('.');
  let current = cvState;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (part.includes('[')) {
      const arrayName = part.split('[')[0];
      const index = parseInt(part.split('[')[1].replace(']', ''), 10);
      current = current[arrayName][index];
    } else {
      current = current[part];
    }
  }

  const lastPart = parts[parts.length - 1];
  if (lastPart.includes('[')) {
    const arrayName = lastPart.split('[')[0];
    const index = parseInt(lastPart.split('[')[1].replace(']', ''), 10);
    current[arrayName][index] = value;
  } else {
    current[lastPart] = value;
  }

  saveToLocalStorage();
  notifySubscribers();
};

export const addCvListItem = (listName) => {
  if (!cvState[listName]) cvState[listName] = [];
  const newItem = crearNuevoItem(listName);
  cvState[listName].push(newItem);
  saveToLocalStorage();
  notifySubscribers();
};

export const removeCvListItem = (listName, itemId) => {
  if (!cvState[listName]) return;
  cvState[listName] = cvState[listName].filter(item => item && item.id !== itemId);
  saveToLocalStorage();
  notifySubscribers();
};

export const loadFromLocalStorage = () => {
  const key = getCacheKey();
  const data = getls(key);
  if (data) {
    cvState = data;
    notifySubscribers();
  }
};

export const resetCvData = () => {
  cvState = { ...DEFAULT_STATE };
  const key = getCacheKey();
  removels(key);
  notifySubscribers();
};

export const subscribe = (fn) => {
  subscribers.push(fn);
  fn(getCvData());
  return () => {
    const index = subscribers.indexOf(fn);
    if (index !== -1) subscribers.splice(index, 1);
  };
};

const notifySubscribers = () => {
  const data = getCvData();
  subscribers.forEach(fn => fn(data));
};
