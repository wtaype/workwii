const COMUN = [
  { href: '/blog',   ico: 'fa-blog',  txt: 'Blog de Ayuda'},
  { href: '/acerca', ico: 'fa-circle-info', txt: 'Acerca' }
];

export const NAV_CONFIG = {
  todos: {
    left: [
      { href: '/', ico: 'fa-house', txt: 'Inicio' },
      { href: '/crear', ico: 'fa-file-signature', txt: 'Crear CV' },
      { href: '/analisar', ico: 'fa-robot', txt: 'Analizar CV' },
      ...COMUN
    ],
    right: [
      { isBtn: true, cls: 'bt_auth registrar', ico: 'fa-user-plus', txt: 'Registrar' },
      { isBtn: true, cls: 'bt_auth login', ico: 'fa-sign-in-alt', txt: 'Ingresar' }
    ]
  },
  usuario: {
    left: [
      { href: '/smile', ico: 'fa-house', txt: 'Dashboard' },
      { href: '/crear', ico: 'fa-file-signature', txt: 'Crear CV' },
      { href: '/analisar', ico: 'fa-robot', txt: 'Analizar CV' },
      ...COMUN
    ],
    right: [
      { href: '/plan', ico: 'fa-rocket', txt: 'Planificar' },
      { href: '/notas', ico: 'fa-note-sticky', txt: 'Notas' },
      { href: '/mensajes', ico: 'fa-comments', txt: 'Mensajes' },
      { isPerfil: true }, { isSalir: true }
    ]
  },
  editor: {
    left: [
      { href: '/editor', ico: 'fa-house', txt: 'Dashboard' },
      { href: '/crear', ico: 'fa-file-signature', txt: 'Crear CV' },
      { href: '/analisar', ico: 'fa-robot', txt: 'Analizar CV' },
      ...COMUN
    ],
    right: [
      { href: '/nuevo', ico: 'fa-plus', txt: 'Nuevo Post' },
      { href: '/notas', ico: 'fa-note-sticky', txt: 'Notas' },
      { href: '/mensajes', ico: 'fa-comments', txt: 'Mensajes' },
      { isPerfil: true }, { isSalir: true }
    ]
  },
  gestor: {
    left: [
      { href: '/gestor', ico: 'fa-house', txt: 'Dashboard' },
      { href: '/crear', ico: 'fa-file-signature', txt: 'Crear CV' },
      { href: '/analisar', ico: 'fa-robot', txt: 'Analizar CV' },
      ...COMUN
    ],
    right: [
      { href: '/nuevo', ico: 'fa-plus', txt: 'Nuevo Post' },
      { href: '/notas', ico: 'fa-note-sticky', txt: 'Notas' },
      { href: '/mensajes', ico: 'fa-comments', txt: 'Mensajes' },
      { isPerfil: true }, { isSalir: true }
    ]
  },
  admin: {
    left: [
      { href: '/admin', ico: 'fa-globe', txt: 'Plataforma' },
      { href: '/usuarios', ico: 'fa-users', txt: 'Usuarios' },
      { href: '/crear', ico: 'fa-file-signature', txt: 'Crear CV' },
      { href: '/analisar', ico: 'fa-robot', txt: 'Analizar CV' }
    ],
    right: [
      { href: '/mensajes', ico: 'fa-comments', txt: 'Mensajes' },
      { isPerfil: true }, { isSalir: true }
    ]
  }
};

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
  roles['/plan'] = allRoles;
  roles['/notas'] = allRoles;
  roles['/mensajes'] = allRoles;
  roles['/perfil'] = allRoles;
  roles['/ser-editor'] = allRoles;


  return { roles, require2FA };
}
