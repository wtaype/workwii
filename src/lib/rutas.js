// src/lib/rutas.js
// Configuración centralizada de rutas, roles y traducción del menú de navegación

// 1. Diccionario unificado y compacto para traducción de navegación
export const idiomaRutas = {
  es: {
    '/': 'Inicio',
    '/crear': 'Crear CV',
    '/analisar': 'Analizar CV',
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
    'registrar': 'Registrar',
    'ingresar': 'Ingresar',
    'salir': 'Salir',
    'perfil': 'Mi Perfil'
  },
  en: {
    '/': 'Home',
    '/crear': 'Create CV',
    '/analisar': 'Analyze CV',
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
    'registrar': 'Register',
    'ingresar': 'Login',
    'salir': 'Logout',
    'perfil': 'My Profile'
  }
};

const COMUN = [
  { href: '/crear', ico: 'fa-file-signature' },
  { href: '/analisar', ico: 'fa-expand' },
  { href: '/convertir-ats', ico: 'fa-wand-magic-sparkles' },
  { href: '/remotos', ico: 'fa-briefcase' },
  { href: '/blog',   ico: 'fa-blog' },
];

// 2. NAV_CONFIG limpio, compacto y sin un solo texto
export const NAV_CONFIG = {
  todos: {
    left: [
      { href: '/', ico: 'fa-house' },
      ...COMUN,
      { href: '/comparar',   ico: 'fa-trophy' },
      { href: '/acerca', ico: 'fa-circle-info' }
    ],
    right: [
      { isBtn: true, cls: 'bt_auth registrar', ico: 'fa-user-plus' },
      { isBtn: true, cls: 'bt_auth login', ico: 'fa-sign-in-alt' }
    ]
  },
  usuario: {
    left: [
      { href: '/smile', ico: 'fa-house' }, 
      ...COMUN
    ],
    right: [
      { href: '/ser-editor', ico: 'fa-user-pen' },
      { href: '/notas', ico: 'fa-note-sticky' },
      { isPerfil: true }, { isSalir: true }
    ]
  },
  editor: {
    left: [
      { href: '/editor', ico: 'fa-house' },
      ...COMUN
    ],
    right: [
      { href: '/nuevo', ico: 'fa-plus' },
      { href: '/notas', ico: 'fa-note-sticky' },
      { href: '/word', ico: 'fa-file-word' },
      { isPerfil: true }, { isSalir: true }
    ]
  },
  gestor: {
    left: [
      { href: '/gestor', ico: 'fa-house' },
      { href: '/crear', ico: 'fa-file-signature' },
      ...COMUN
    ],
    right: [
      { href: '/nuevo', ico: 'fa-plus' },
      { href: '/notas', ico: 'fa-note-sticky' },
      { href: '/mensajes', ico: 'fa-comments' },
      { isPerfil: true }, { isSalir: true }
    ]
  },
  admin: {
    left: [
      { href: '/admin', ico: 'fa-globe' },
      { href: '/usuarios', ico: 'fa-users' },
      { href: '/crear', ico: 'fa-file-signature' },
      { href: '/analisar', ico: 'fa-expand' }
    ],
    right: [
      { href: '/mensajes', ico: 'fa-comments' },
      { isPerfil: true }, { isSalir: true }
    ]
  }
};

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
    right: config.right ? config.right.map(translateItem) : []
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

  // Construir dinámicamente el mapeo inspeccionando NAV_CONFIG
  Object.entries(NAV_CONFIG).forEach(([rol, cfg]) => {
    if (rol === 'todos') return;
    const items = [...(cfg.left || []), ...(cfg.right || [])];
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

  // Asegurar que las herramientas comunes de candidatos estén accesibles para todos los roles logueados
  const allRoles = ['usuario', 'editor', 'gestor', 'admin'];
  roles['/smile'] = allRoles;
  roles['/word'] = allRoles;
  roles['/notas'] = allRoles;
  roles['/mensajes'] = allRoles;
  roles['/perfil'] = allRoles;
  roles['/ser-editor'] = allRoles;

  return { roles, require2FA };
}
