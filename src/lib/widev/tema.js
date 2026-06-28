// src/lib/widev/tema.js
// tema v10.8: Gestor centralizado y unificado de temas visuales de la aplicación (witema)

import { getls, savels } from './storage.js';
import { Mensaje } from './mensajes.js';
import { langwii } from './langwii.js';
import { Capi } from './texto.js';

// Mapa de colores oficiales para meta theme-color
export const witemas = {
  cielo: '#0EBEFF',
  dulce: '#FF5C69',
  paz: '#29C72E',
  oro: '#FFC107',
  mora: '#7000FF',
  futuro: '#21273B'
};

// Inicializador de interactividad de temas
export function witema(dtema) {
  if (typeof document === 'undefined') return;

  const getTheme = () => {
    try {
      return localStorage.wiTema || dtema;
    } catch {
      return dtema;
    }
  };

  const applyTheme = (name) => {
    if (!name) return;
    const color = witemas[name] || '#FFC107';
    document.documentElement.dataset.theme = name;
    
    // Actualizar meta theme-color
    const meta = document.querySelector('meta[name="theme-color"]') ||
      document.head.appendChild(Object.assign(document.createElement('meta'), { name: 'theme-color' }));
    meta.content = color;

    // Resguardar en localStorage local
    try {
      localStorage.wiTema = name;
    } catch (e) {}

    // Resaltar visualmente el tema activo (.tema con clase .mtha)
    document.querySelectorAll('.tema').forEach(x => {
      x.classList.toggle('mtha', x.dataset.ths === name);
    });
  };

  // Escuchar clic en los botones de selección de temas
  document.addEventListener('click', e => {
    const el = e.target.closest('.tema');
    if (!el) return;
    const name = el.dataset.ths;
    applyTheme(name);

    // Sincronizar datos de sesión del usuario logueado
    try {
      const u = getls('wiSmile');
      if (u && u.id) {
        // 1. Actualizar la sesión localmente
        savels('wiSmile', { ...u, tema: name }, 168); // 168 horas = 7 días
        
        // 2. Sincronizar en segundo plano con la base de datos Supabase
        import('../supabase.js').then(({ supabase }) => {
          supabase.from('smiles')
            .update({ tema: name, actualizado: new Date().toISOString() })
            .eq('id', u.id)
            .then(({ error }) => {
              if (error) {
                console.error('Error al sincronizar tema en DB:', error);
              } else {
                Mensaje(
                  langwii.n(
                    `Tema ${Capi(name)} guardado!`,
                    `Theme ${Capi(name)} saved!`
                  ),
                  'success'
                );
              }
            });
        });
      }
    } catch (err) {}
  });

  // Ejecución inicial del tema
  const initTheme = () => {
    applyTheme(getTheme());
  };

  initTheme();
  document.addEventListener('astro:page-load', initTheme);
}
