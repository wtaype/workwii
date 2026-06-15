// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const firebaseMock = path.resolve(__dirname, './src/lib/firebase.js');
const BASE = process.env.PUBLIC_BASE || '/';

export default defineConfig({
  site: 'https://wiihope.com',
  base: BASE,
  build: { inlineStylesheets: 'always' },
  vite: {
    resolve: {
      alias: {
        'firebase/app': firebaseMock,
        'firebase/auth': firebaseMock,
        'firebase/firestore': firebaseMock,
        'firebase/app-check': firebaseMock
      }
    }
  },
  integrations: [
    sitemap({
      // 1. Omitir páginas de administración/dashboard del sitemap (Mejora SEO)
      filter: (page) => !['/admin', '/gestor', '/editor', '/usuarios', '/sistema', '/verificar', '/perfil', '/mensajes', '/notas', '/plan', '/nuevo', '/ser-editor'].some(x => page.includes(x)),
      serialize(item) {
        // 2. Formato YYYY-MM-DD estándar para lastmod
        item.lastmod = new Date().toISOString().split('T')[0];
        
        const p = new URL(item.url).pathname.replace(/\/$/, '') || '/';
        const check = (arr) => arr.some(x => p.includes(x));
        
        // 3. Selección ternaria ultracorta para prioridades y frecuencias
        const [pri, freq] = (p === '/' || p === '/wiihope') ? [1.0, 'daily']
          : check(['/blog', '/citas', '/musica', '/orar']) ? [0.9, 'daily']
          : [0.8, 'weekly'];
          
          return Object.assign(item, { priority: pri, changefreq: freq });
      }
    }),
    {
      name: 'copy-sitemap',
      hooks: {
        'astro:build:done': async ({ dir }) => {
          const f = new URL('sitemap-0.xml', dir), t = new URL('sitemap.xml', dir);
          if (fs.existsSync(f)) fs.copyFileSync(f, t);
        }
      }
    }
  ]
});
