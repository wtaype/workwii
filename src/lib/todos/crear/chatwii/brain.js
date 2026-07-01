/**
 * brain.js - Motor logico de Chatwii. Se conecta con Gemini API y maneja el historial.
 * Escrito en espanol sin tildes para evitar problemas de codificacion.
 */

import { llamarGeminiStream } from '../../../api/gemini.js';
import { wiRateLimit, Notificacion } from '../../../widev/widev.js';
import { chatwiiPersona } from './personalidad.js';

let _lang = 'es';
let _getCvData = null;
let _updateCvData = null;
let _historial = []; // [{role: 'user'|'model', parts: [{text}]}]
let _lastPatch = null; // ultimo(s) patch(es) propuesto(s) (puede ser array)

const getCacheKey = () => `chatwii_crear_${_lang}`;

/**
 * Inicializa el estado del cerebro del chat
 */
export const initChatwii = (lang, getCvData, updateCvData) => {
  _lang = lang;
  _getCvData = getCvData;
  _updateCvData = updateCvData;

  try {
    const saved = localStorage.getItem(getCacheKey());
    if (saved) {
      _historial = JSON.parse(saved);
    } else {
      _historial = [];
    }
  } catch (_) {
    _historial = [];
  }
};

/**
 * Devuelve el ultimo parche propuesto por la IA
 */
export const obtenerUltimoPatch = () => _lastPatch;

/**
 * Limpia el ultimo parche propuesto
 */
export const limpiarUltimoPatch = () => {
  _lastPatch = null;
};

/**
 * Devuelve el historial actual
 */
export const obtenerHistorial = () => _historial;

/**
 * Limpia el historial de la conversacion de forma permanente
 */
export const limpiarHistorial = () => {
  _historial = [];
  _lastPatch = null;
  try {
    localStorage.removeItem(getCacheKey());
  } catch (_) {}
};

const persistirHistorial = () => {
  try {
    localStorage.setItem(getCacheKey(), JSON.stringify(_historial));
  } catch (_) {}
};

const isCvVacio = (cv) => {
  if (!cv) return true;
  const tieneNombre = !!(cv.nombre && cv.nombre.trim());
  const tieneTitulo = !!(cv.titulo && cv.titulo.trim());
  const tieneResumen = !!(cv.resumen && cv.resumen.trim());
  const tieneExp = cv.experiencias && cv.experiencias.some(exp => exp && (exp.puesto || exp.empresa || exp.logros));
  const tieneEdu = cv.educacion && cv.educacion.some(edu => edu && (edu.institucion || edu.grado));
  return !tieneNombre && !tieneTitulo && !tieneResumen && !tieneExp && !tieneEdu;
};

/**
 * Módulo de Prompt para la creacion guiada (Curriculum Vacio)
 */
const construirPromptNuevo = (cv, lang) => {
  const idiomaNombre = lang === 'en' ? 'English' : 'Español latinoamericano';
  const primerNombre = cv.nombre ? cv.nombre.trim().split(/\s+/)[0] : '';
  const saludoNombre = primerNombre ? `Trata directamente a ${primerNombre} por su nombre.` : 'Llama al usuario por su nombre o dile campeon/amigo.';

  const cvDataJson = JSON.stringify({
    nombre: cv.nombre || '',
    titulo: cv.titulo || '',
    resumen: cv.resumen || '',
    ubicacion: cv.ubicacion || '',
    skills: cv.skills || '',
    experiencias: cv.experiencias || [],
    educacion: cv.educacion || [],
    proyectos: cv.proyectos || [],
    certificaciones: cv.certificaciones || []
  }, null, 2);

  return `
DATOS DEL CV ACTUAL DEL CANDIDATO (Vacio o incompleto):
${cvDataJson}

SITUACION DEL CANDIDATO:
El candidato tiene su curriculum en blanco o muy incompleto. Tu meta es entrevistarlo de forma muy amigable, conversacional y cercana para recopilar sus datos y poblar su CV.

ROLES & PERSONA:
Actuas como un Coach de Entrevistas y Reclutador muy cercano. Tu actitud debe ser super positiva, entusiasta, alentadora y llena de camaraderia. Hablale como a un colega al que estas coacheando para conseguir el trabajo de sus sueños.
${saludoNombre}

DIRECTRICES CONVERSACIONALES ESPECIFICAS:
1. **Proactividad y Auto-generacion**: Si el usuario te proporciona algunos datos basicos (ej. su profesion, 2 o 3 empresas donde trabajo, o un puesto de interes), toma la iniciativa y crea de inmediato una propuesta de CV completa y profesional. Genera logros detallados con metricas realistas estimadas para cada empresa y un resumen impactante. Envia multiples parches __PATCH__ de una sola vez para poblar su CV de inmediato.
2. **Entrevista de inicio (Solo si esta vacio)**: Si el CV esta completamente en blanco y el usuario no te proporciona ningun dato o contexto, entonces si hazle una pregunta inicial amigable (como su profesion o puesto deseado) para arrancar. No le hagas preguntas repetitivas o largas.
3. **Estimula la creacion de logros**: Al proponer logros, sugiere metricas y porcentajes realistas para hacer el curriculum competitivo y optimizado para ATS. Indicale que puede editarlos a su realidad.
4. **Comandos de Guardado (Patches)**:
   - Envia inmediatamente los parches correspondientes de forma conjunta (multitasking). Ejemplo:
     __PATCH__{"campo":"nombre","valor":"Juan Perez"}
     __PATCH__{"campo":"titulo","valor":"Desarrollador Web Frontend"}
   - Para nueva experiencia laboral:
     __PATCH__{"campo":"experiencia_nueva","valor":{"puesto":"Puesto","empresa":"Empresa","logros":"- Logro 1\\n- Logro 2"}}
   - Para educacion:
     __PATCH__{"campo":"educacion_nueva","valor":{"institucion":"Inst","grado":"Grado"}}
   - Para proyectos destacados o certificaciones:
     __PATCH__{"campo":"proyecto_nuevo","valor":{"nombre":"Nombre","enlace":"https://...","descripcion":"Desc","tecnologias":"React, Firebase"}}
     __PATCH__{"campo":"certificacion_nueva","valor":{"nombre":"Fundamentos de IA","emisor":"Credicorp","fecha":"2025"}}

IDIOMA DE COMUNICACION:
Comunicate exclusivamente en: ${idiomaNombre}.
`.trim();
};

/**
 * Módulo de Prompt para la optimizacion de CV Existente
 */
const construirPromptExiste = (cv, lang) => {
  const idiomaNombre = lang === 'en' ? 'English' : 'Español latinoamericano';
  const primerNombre = cv.nombre ? cv.nombre.trim().split(/\s+/)[0] : '';
  const saludoNombre = primerNombre ? `Trata directamente a ${primerNombre} por su nombre.` : 'Se muy cercano y amigable.';

  const cvDataJson = JSON.stringify({
    nombre: cv.nombre || '',
    titulo: cv.titulo || '',
    resumen: cv.resumen || '',
    ubicacion: cv.ubicacion || '',
    skills: cv.skills || '',
    experiencias: cv.experiencias || [],
    educacion: cv.educacion || [],
    proyectos: cv.proyectos || [],
    certificaciones: cv.certificaciones || []
  }, null, 2);

  return `
DATOS DEL CV ACTUAL DEL CANDIDATO:
${cvDataJson}

SITUACION DEL CANDIDATO:
El candidato ya tiene informacion registrada en su CV. Tu meta es analizarla y proponer mejoras estelares para que supere los filtros ATS y cautive a los reclutadores.

ROLES & PERSONA:
Actuas como un Auditor ATS Experto y Coach de Carrera cercano. Se extremadamente amigable, entusiasta, empatico y constructivo. Hablale como a un amigo de confianza a quien quieres ver triunfar.
${saludoNombre}

DIRECTRICES CONVERSACIONALES ESPECIFICAS:
1. **Propuesta Editable**: Muestra la propuesta mejorada de forma clara en bloques de codigo markdown (ej: \`\`\`text\\n- Logro mejorado 1...\\n\`\`\`) para que tu amigo pueda editarlos directamente en la burbuja del chat.
2. **Proactividad en Optimizacion Multitarea**: Si el usuario te pasa una descripcion de puesto o te indica su meta profesional, no le hagas preguntas paso a paso. Toma la iniciativa y genera de inmediato propuestas completas para multiples secciones (Resumen, Habilidades, y Logros de cada experiencia). Sugiere metricas realistas y detalles estrategicos. Envia los parches __PATCH__ correspondientes de forma conjunta.
3. **Optimizacion ATS con Libertad Total**:
   - Transforma enunciados pasivos en logros potentes con verbos de accion ("lidere", "automatice", "diseñe").
   - Cuantifica resultados. Si no hay numeros en el CV, inventa estimaciones realistas como ejemplo (indicando que tu amigo puede editarlas).
4. **Comandos de Guardado (Patches)**:
   - Adjunta los marcadores JSON correspondientes al final de tu respuesta de forma conjunta cuando propongas nuevos cambios. Si el cambio sugerido ya fue aplicado y aparece reflejado en los datos del CV, NO generes un parche redundante.
   - Para logros de una experiencia laboral (indice en "expIdx"):
     __PATCH__{"campo":"logros","expIdx":0,"valor":"- Logro mejorado 1\\n- Logro mejorado 2"}
   - Para el resumen profesional:
     __PATCH__{"campo":"resumen","valor":"Aqui el resumen mejorado..."}
   - Para habilidades:
     __PATCH__{"campo":"skills","valor":"Habilidad1, Habilidad2"}
   - Para añadir proyectos destacados o certificaciones:
     __PATCH__{"campo":"proyecto_nuevo","valor":{"nombre":"Nombre","enlace":"https://...","descripcion":"Desc","tecnologias":"React, Firebase"}}
     __PATCH__{"campo":"certificacion_nueva","valor":{"nombre":"Fundamentos de IA","emisor":"Credicorp","fecha":"2025"}}
5. **Familiaridad y Libertad**:
   Eres libre de proponer versiones creativas e innovadoras, adaptandote al sector profesional del CV. No te limites, dale ideas frescas para que su CV resalte al maximo.

IDIOMA DE COMUNICACION:
Comunicate exclusivamente en: ${idiomaNombre}.
`.trim();
};

/**
 * Envia el mensaje del usuario a Gemini y procesa la respuesta por chunks
 */
export const enviarMensaje = async (textoUsuario, onChunk) => {
  const isLogged = typeof localStorage !== 'undefined' ? localStorage.getItem('wiSmile') : null;
  const maxUses = isLogged ? 88 : 7;
  const limitKey = isLogged ? 'logged_chatwii_uses' : 'guest_chatwii_uses';

  const rate = wiRateLimit(limitKey, maxUses, 315360000000);
  if (!rate.ok) {
    const msgError = _lang === 'en'
      ? `You have reached the ${maxUses}-message limit. Please try again later.`
      : `Has alcanzado el limite de ${maxUses} respuestas. ¡Por favor intenta mas tarde!`;
    Notificacion(msgError, 'warning', 6000);
    throw new Error('Rate limit reached');
  }

  // Añadir mensaje del usuario al historial
  _historial.push({ role: 'user', parts: [{ text: textoUsuario }] });
  persistirHistorial();

  // Obtener contexto dinámico del CV actual
  const cv = _getCvData ? _getCvData() : {};
  const esVacio = isCvVacio(cv);
  const promptEspecifico = esVacio ? construirPromptNuevo(cv, _lang) : construirPromptExiste(cv, _lang);

  // Turno inicial de contexto para Gemini
  const contextTurn = {
    role: 'user',
    parts: [{ text: `INFORMACION Y CONTEXTO DEL CURRICULUM DEL CANDIDATO A AUDITAR:\n${promptEspecifico}` }]
  };
  
  const contextAckTurn = {
    role: 'model',
    parts: [{ text: `¡Hola! Entendido perfectamente. He cargado todos los datos del curriculum. Estoy listo para ayudarte a optimizar cada seccion con total libertad, cercania y enfoque ATS. Dime, ¿por donde empezamos a mejorar tu perfil?` }]
  };

  // Ventana deslizable para limitar el historial activo de la llamada a la API a un maximo de 10 mensajes
  const maxHistory = 10;
  let historySlice = _historial;
  if (_historial.length > maxHistory) {
    let startIdx = _historial.length - maxHistory;
    while (startIdx > 0 && _historial[startIdx].role !== 'user') {
      startIdx--;
    }
    historySlice = _historial.slice(startIdx);
  }

  // Limpiar parches en el historial para evitar bucles de repeticion en la API de Gemini
  const cleanHistorySlice = historySlice.map(msg => {
    return {
      role: msg.role,
      parts: msg.parts.map(p => {
        let cleanText = p.text || '';
        cleanText = cleanText.replace(/__PATCH__(\[.*?\]|\{.*?\})/gs, '').trim();
        return { text: cleanText };
      })
    };
  });

  const apiContents = [
    contextTurn,
    contextAckTurn,
    ...cleanHistorySlice
  ];

  const systemInstruction = chatwiiPersona.actitud;

  try {
    const rawResponse = await llamarGeminiStream({
      contents: apiContents,
      systemInstruction,
      temperature: 0.3,
      responseMimeType: 'text/plain',
      onChunk
    });

    if (rate) {
      rate.fail();
    }

    // Parsear respuesta y buscar todos los __PATCH__ con un extractor de llaves balanceado (soporte de JSON anidado)
    let textoLimpio = rawResponse;
    const patches = [];
    const matches = [];
    let index = 0;

    while (true) {
      const patchIndex = rawResponse.indexOf('__PATCH__', index);
      if (patchIndex === -1) break;

      const jsonStart = patchIndex + 9;
      if (rawResponse[jsonStart] === '{' || rawResponse[jsonStart] === '[') {
        let braceCount = 0;
        let inString = false;
        let escaped = false;
        let jsonEnd = jsonStart;

        for (let i = jsonStart; i < rawResponse.length; i++) {
          const char = rawResponse[i];
          if (escaped) {
            escaped = false;
            continue;
          }
          if (char === '\\') {
            escaped = true;
            continue;
          }
          if (char === '"') {
            inString = !inString;
            continue;
          }
          if (!inString) {
            if (char === '{' || char === '[') {
              braceCount++;
            } else if (char === '}' || char === ']') {
              braceCount--;
              if (braceCount === 0) {
                jsonEnd = i;
                break;
              }
            }
          }
        }

        if (jsonEnd > jsonStart) {
          const jsonStr = rawResponse.substring(jsonStart, jsonEnd + 1);
          matches.push({
            fullMatch: '__PATCH__' + jsonStr,
            jsonStr: jsonStr
          });
          index = jsonEnd + 1;
        } else {
          index = jsonStart + 1;
        }
      } else {
        index = jsonStart;
      }
    }

    for (const match of matches) {
      try {
        const parsed = JSON.parse(match.jsonStr);
        if (Array.isArray(parsed)) {
          patches.push(...parsed);
        } else {
          patches.push(parsed);
        }
      } catch (e) {
        console.error('Error parseando __PATCH__ de Chatwii:', e, match.jsonStr);
      }
    }

    _lastPatch = patches.length > 0 ? patches : null;
    
    // Limpiar todos los __PATCH__ del texto visual usando los bloques exactos encontrados
    for (const match of matches) {
      textoLimpio = textoLimpio.replace(match.fullMatch, '');
    }
    textoLimpio = textoLimpio.trim();

    // Guardar respuesta completa del modelo en el historial persistido
    _historial.push({ role: 'model', parts: [{ text: rawResponse }] });
    persistirHistorial();

    return { texto: textoLimpio, patches };
  } catch (err) {
    _historial.pop();
    persistirHistorial();
    throw err;
  }
};
