// src/lib/rutas.js
// Configuración centralizada de rutas, roles y traducción del menú de navegación

// 1. Diccionario unificado y compacto para traducción de navegación
export const idiomaRutas = {
  es: {
    '/': 'Inicio',
    '/crear': 'Crear CV',
    '/analisar': 'Analizar CV',
    '/traducir': 'Traducir CV',
    '/convertir-ats': 'Convertir a ATS',
    '/remotos': 'Trabajo Remoto',
    '/blog': 'Blog Apoyo',
    '/comparar': 'Comparar',
    '/acerca': 'Acerca',
    '/ser-editor': 'Ser Editor',
    '/notas': 'Notas',
    '/word': 'Planificar',
    '/nuevo': 'Nuevo Post',
    '/mensajes': 'Mensajes',
    '/smile': 'Dashboard',
    '/editor': 'Dashboard',
    '/gestor': 'Dashboard',
    '/admin': 'Plataforma',
    '/usuarios': 'Usuarios',
    '/more': 'Más',
    'registrar': 'Registrar',
    'ingresar': 'Ingresar',
    'salir': 'Salir',
    'perfil': 'Mi Perfil',
    '/mi-cvs': 'Mis CVs',
    '/postulaciones': 'Postulaciones',
    '/ccat-test': 'Test CCAT',
},
  en: {
    '/': 'Home',
    '/crear': 'Create CV',
    '/analisar': 'Analyze CV',
    '/traducir': 'Translate CV',
    '/convertir-ats': 'Convert to ATS',
    '/remotos': 'Remote Work',
    '/blog': 'Blog Support',
    '/comparar': 'Compare',
    '/acerca': 'About',
    '/ser-editor': 'Become Editor',
    '/notas': 'Notes',
    '/word': 'Plan',
    '/nuevo': 'New Post',
    '/mensajes': 'Messages',
    '/smile': 'Dashboard',
    '/editor': 'Dashboard',
    '/gestor': 'Dashboard',
    '/admin': 'Platform',
    '/usuarios': 'Users',
    '/more': 'More',
    'registrar': 'Register',
    'ingresar': 'Login',
    'salir': 'Logout',
    'perfil': 'My Profile',
    '/mi-cvs': 'My Resumes',
    '/postulaciones': 'Applications',
    '/ccat-test': 'CCAT Test',
  }
};

const COMUN = [
  { href: '/crear', ico: 'fa-file-signature' },
  { href: '/analisar', ico: 'fa-expand' },
  { href: '/traducir', ico: 'fa-language' },
  { href: '/convertir-ats', ico: 'fa-wand-magic-sparkles' },
  { href: '/remotos', ico: 'fa-briefcase' },
  { href: '/blog',   ico: 'fa-blog' },
  { href: '/ccat-test', ico: 'fa-brain' },
];

// 2. NAV_CONFIG limpio, compacto y sin un solo texto
export const NAV_CONFIG = {
  todos: {
    left: [
      { href: '/', ico: 'fa-house' },
      ...COMUN,
      { href: '/comparar',   ico: 'fa-trophy' },
      { href: '/acerca', ico: 'fa-circle-info' },
    ],
    right: [
      { isBtn: true, cls: 'bt_auth registrar', ico: 'fa-user-plus' },
      { isBtn: true, cls: 'bt_auth login', ico: 'fa-sign-in-alt' },
    ]
  },
  usuario: {
    left: [
      { href: '/smile', ico: 'fa-house' }, 
      { href: '/crear', ico: 'fa-file-signature' },
      { href: '/analisar', ico: 'fa-expand' },
      { href: '/blog', ico: 'fa-blog' },
      { href: '/remotos', ico: 'fa-briefcase' },
      { href: '/traducir', ico: 'fa-language' },
      { href: '/more', ico: 'fa-ellipsis' },
    ],
    right: [
      { href: '/mi-cvs', ico: 'fa-folder-open' }, 
      { href: '/postulaciones', ico: 'fa-list-check' },
      { href: '/ser-editor', ico: 'fa-user-pen' },
      { isPerfil: true }, { isSalir: true },
    ],
    more: [
      { href: '/convertir-ats', ico: 'fa-wand-magic-sparkles' },
      { href: '/postulaciones', ico: 'fa-list-check' },
      { href: '/notas', ico: 'fa-note-sticky' },
    ]
  },
  editor: {
    left: [
      { href: '/crear', ico: 'fa-file-signature' },
      { href: '/analisar', ico: 'fa-expand' },
      { href: '/traducir', ico: 'fa-language' },
      { href: '/convertir-ats', ico: 'fa-wand-magic-sparkles' },
      { href: '/remotos', ico: 'fa-briefcase' },
      { href: '/more', ico: 'fa-ellipsis' },
    ],
    right: [
      { href: '/postulaciones', ico: 'fa-list-check' },
      { href: '/mi-cvs', ico: 'fa-folder-open' }, 
      // { href: '/nuevo', ico: 'fa-plus' },
      { href: '/editor', ico: 'fa-gauge' },
      { isPerfil: true }, { isSalir: true },
    ],
    more: [
      { href: '/smile', ico: 'fa-house' }, 
      { href: '/word', ico: 'fa-file-word' },
      { href: '/notas', ico: 'fa-note-sticky' },
      { href: '/blog', ico: 'fa-blog' },
      { href: '/comparar',   ico: 'fa-trophy' },
      { href: '/acerca', ico: 'fa-circle-info' },
    ]
  },
  gestor: {
    left: [
      { href: '/gestor', ico: 'fa-house' },
      { href: '/crear', ico: 'fa-file-signature' },
      { href: '/analisar', ico: 'fa-expand' },
      { href: '/more', ico: 'fa-ellipsis' }
    ],
    right: [
      { href: '/nuevo', ico: 'fa-plus' },
      { href: '/mensajes', ico: 'fa-comments' },
      { isPerfil: true }, { isSalir: true }
    ],
    more: [
      { href: '/notas', ico: 'fa-note-sticky' },
      { href: '/traducir', ico: 'fa-language' },
      { href: '/convertir-ats', ico: 'fa-wand-magic-sparkles' },
      { href: '/remotos', ico: 'fa-briefcase' },
      { href: '/blog', ico: 'fa-blog' }
    ]
  },
  admin: {
    left: [
      { href: '/admin', ico: 'fa-globe' },
      { href: '/usuarios', ico: 'fa-users' },
      { href: '/crear', ico: 'fa-file-signature' },
      { href: '/analisar', ico: 'fa-expand' },
      { href: '/more', ico: 'fa-ellipsis' }
    ],
    right: [
      { href: '/mensajes', ico: 'fa-comments' },
      { isPerfil: true }, { isSalir: true }
    ],
    more: [
      { href: '/traducir', ico: 'fa-language' },
      { href: '/convertir-ats', ico: 'fa-wand-magic-sparkles' },
      { href: '/remotos', ico: 'fa-briefcase' },
      { href: '/blog', ico: 'fa-blog' }
    ]
  }
};

export const ROL_PATH = { usuario: '/smile', editor: '/editor', gestor: '/gestor', admin: '/admin' };

// 3. Helper inteligente que inyecta el "txt" traducido y adapta URLs
export function translateNav(config, lang) {
  const activeLang = lang === 'en' ? 'en' : 'es';
  const dict = idiomaRutas[activeLang];

  const translateItem = (item) => {
    if (!item) return item;
    const newItem = { ...item };
    
    // Determinar la clave de traducción
    let key = '';
    if (newItem.href) {
      key = newItem.href;
    } else if (newItem.isSalir) {
      key = 'salir';
    } else if (newItem.isPerfil) {
      key = 'perfil';
    } else if (newItem.cls) {
      if (newItem.cls.includes('registrar')) key = 'registrar';
      else if (newItem.cls.includes('login')) key = 'ingresar';
    }

    // Asignar el texto traducido al vuelo
    newItem.txt = dict[key] || '';

    // Si es inglés, prefijamos la ruta
    if (newItem.href && activeLang === 'en') {
      const path = newItem.href;
      if (path === '/') {
        newItem.href = '/en';
      } else if (!path.startsWith('/en/') && path !== '/en') {
        newItem.href = `/en${path}`;
      }
    }

    return newItem;
  };

  return {
    left: config.left ? config.left.map(translateItem) : [],
    right: config.right ? config.right.map(translateItem) : [],
    more: config.more ? config.more.map(translateItem) : []
  };
}

// 4. Lógica de Seguridad (rutaRoles)
export function rutaRoles() {
  const roles = {};
  const require2FA = ['/admin', '/usuarios'];

  // Obtener lista de rutas públicas del menú 'todos'
  const publicPaths = [];
  const todosItems = [...(NAV_CONFIG.todos.left || []), ...(NAV_CONFIG.todos.right || [])];
  todosItems.forEach(item => {
    if (item.href) publicPaths.push(item.href);
  });

  // Construir dinámicamente el mapeo de roles inspeccionando NAV_CONFIG (left, right y more)
  Object.entries(NAV_CONFIG).forEach(([rol, cfg]) => {
    if (rol === 'todos') return;
    const items = [...(cfg.left || []), ...(cfg.right || []), ...(cfg.more || [])];
    items.forEach(item => {
      if (item.href) {
        if (publicPaths.includes(item.href)) return; // Omitir rutas públicas
        if (!roles[item.href]) roles[item.href] = [];
        if (!roles[item.href].includes(rol)) roles[item.href].push(rol);
      }
    });
  });

  // Agregar rutas especiales fuera del menú de navegación
  roles['/verificar'] = ['admin'];

  // Asegurar que las herramientas comunes estén accesibles para todos los roles logueados
  const allRoles = ['usuario', 'editor', 'gestor', 'admin'];
  roles['/smile'] = allRoles;
  roles['/perfil'] = allRoles;
  roles['/word'] = allRoles;
  roles['/notas'] = allRoles;
  roles['/mensajes'] = allRoles;
  roles['/ser-editor'] = allRoles;
  roles['/mi-cvs'] = allRoles;
  roles['/postulaciones'] = allRoles;
  roles['/more'] = allRoles;

  return { roles, require2FA };
}
