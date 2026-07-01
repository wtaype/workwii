/**
 * flotante.js - Renderiza el boton disparador flotante de Chatwii
 */

export const crearBotonFlotante = (idioma, persona) => {
  const launcher = document.createElement('button');
  launcher.id = 'chat_flotante';
  launcher.className = 'cr_chat_launcher show';
  
  const tooltipText = idioma === 'en' 
    ? 'Chat with ' + persona.nombre 
    : 'Chatear con ' + persona.nombre;
    
  launcher.setAttribute('data-witip', tooltipText);
  launcher.innerHTML = `<img src="${persona.avatar}" class="cr_chat_launcher_avatar" alt="${persona.nombre}" />`;
  
  return launcher;
};
