// src/idioma.d.ts
// Tipado global de Astro.locals para la detección automática de idioma
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    lang: 'es' | 'en';
  }
}
