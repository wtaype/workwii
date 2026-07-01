/**
 * centralcv.js - Fuente de verdad unica y configuracion centralizada para el Creador de CV.
 * Define la estructura de datos, secciones, etiquetas traducidas, generadores y metodos de validacion.
 * Escrito en espanol sin tildes para evitar problemas de codificacion.
 */

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

export const CLAVES_VALIDAS_CV = [
  ...CAMPOS_DIRECTOS,
  ...CAMPOS_LISTAS,
  'campo',
  'valor'
];

/**
 * Determina si el CV actual esta vacio o carece de contenido representativo
 */
export const isCvVacio = (cv) => {
  if (!cv) return true;
  const tieneNombre = !!cv.nombre?.trim();
  const tieneTitulo = !!cv.titulo?.trim();
  const tieneResumen = !!cv.resumen?.trim();
  
  const tieneExp = cv.experiencias?.some(exp => exp && (exp.puesto || exp.empresa || exp.logros));
  const tieneEdu = cv.educacion?.some(edu => edu && (edu.institucion || edu.grado));
  const tieneProj = cv.proyectos?.some(proj => proj && (proj.nombre || proj.descripcion));
  const tieneCert = cv.certificaciones?.some(cert => cert && cert.nombre);
  
  return !tieneNombre && !tieneTitulo && !tieneResumen && !tieneExp && !tieneEdu && !tieneProj && !tieneCert;
};

/**
 * Generador de items vacios con estructura y IDs unicos para las distintas secciones
 */
export const crearNuevoItem = (seccion) => {
  const rand = Math.random().toString(36).substring(2, 9);
  
  // Normalizar el nombre de la seccion por si viene con variaciones (ej. certificados / certificaciones)
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

/**
 * Diccionario de etiquetas amigables localizadas para las propiedades del CV
 */
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
