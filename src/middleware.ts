// src/middleware.ts
// Propagación de idioma activo a Astro.locals para todos los componentes del árbol
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware((ctx, next) => {
  ctx.locals.lang = (ctx.currentLocale ?? 'es') as 'es' | 'en';
  return next();
});
