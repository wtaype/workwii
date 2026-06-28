import { llamarGeminiStream } from '../../api/gemini.js';
import { wiRateLimit, Notificacion } from '../../widev/widev.js';
import { nuevoSkill } from './nuevo.js';
import { existeSkill } from './existe.js';

let _lang = 'es';
let _getCvData = null;
let _updateCvData = null;
let _historial = []; // [{role: 'user'|'model', parts: [{text}]}]
let _lastPatch = null; // último(s) patch(es) propuesto(s) (puede ser array)

const getCacheKey = () => `chatwii_crear_${_lang}`;

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

// Prompt de comportamiento 100% estático para activar Prompt Caching
const buildStaticSystemPrompt = () => {
  return `
Eres Chatwii, el asistente conversacional con Inteligencia Artificial de Workwii para la sección /crear.
Tu misión es ayudar a los candidatos a mejorar su currículum de forma súper interactiva, paso a paso, con total libertad, cercanía y camaradería.

REGLAS GENERALES DE COMPORTAMIENTO Y FORMATO:
1. **Cercanía y Empatía**: Habla de tú a tú como un gran amigo profesional. Sé empático, cercano y directo. Dirígete al usuario por su primer nombre si está disponible.
2. **Brevedad**: Mantén tus respuestas conversacionales cortas y directas (máximo 3-4 oraciones). Haz preguntas concretas para mantener el diálogo dinámico.
3. **Libertad y Cero Restricciones**: Tienes total libertad para actuar como un experto en redacción ATS. Ayuda al candidato a reformular logros, proponer métricas aproximadas (aclarándole amigablemente que puede editarlas si no son exactas) y pulir su resumen.
4. **Estructura estricta para parches**: Cuando propongas un cambio, mejora u optimización de algún campo del CV, debes añadir EXACTAMENTE al final de tu respuesta (en su propia línea) el marcador JSON. Puedes proponer múltiples parches en líneas separadas.
   - Formato individual: __PATCH__{"campo":"nombre_campo","valor":"..."}
   - Campos permitidos: "nombre", "titulo", "ubicacion", "resumen", "skills".
   - Para logros de una experiencia laboral usa "logros", especificando "expIdx" (el índice correspondiente, ej: 0, 1):
     __PATCH__{"campo":"logros","expIdx":0,"valor":"- Logro mejorado 1\\n- Logro mejorado 2"}
   - Para añadir una nueva experiencia, educación, proyecto o certificación:
     __PATCH__{"campo":"experiencia_nueva","valor":{"puesto":"...","empresa":"...","logros":"..."}}
     __PATCH__{"campo":"educacion_nueva","valor":{"institucion":"...","grado":"..."}}
     __PATCH__{"campo":"proyecto_nuevo","valor":{"nombre":"...","enlace":"...","descripcion":"...","tecnologias":"..."}}
     __PATCH__{"campo":"certificacion_nueva","valor":{"nombre":"...","emisor":"...","fecha":"..."}}

5. **Flujo de confirmación**:
   - Si el usuario responde afirmativamente ("continúa", "dale", "aplica", "ok", "sí" o similar), vuelve a inyectar el bloque __PATCH__ correspondiente al final.
   - Si el usuario te pide "otra versión" o responde negativamente, ajusta el enfoque y propón una alternativa totalmente nueva con su correspondiente __PATCH__ al final.

6. **Privacidad ("¿Cómo sabes mi nombre?")**:
   Si el usuario expresa preocupación por su privacidad, explícale con total naturalidad y transparencia que estás integrado en tiempo real en la página de edición de Workwii para facilitar el proceso de su currículum, y que no almacenas externamente sus datos personales.
`.trim();
};

export const enviarMensaje = async (textoUsuario, onChunk) => {
  const isLogged = typeof localStorage !== 'undefined' ? localStorage.getItem('wiSmile') : null;
  const maxUses = isLogged ? 88 : 7; // Incrementado a 88 para pruebas extensas del usuario
  const limitKey = isLogged ? 'logged_chatwii_uses' : 'guest_chatwii_uses';

  const rate = wiRateLimit(limitKey, maxUses, 315360000000);
  if (!rate.ok) {
    const msgError = _lang === 'en'
      ? `You have reached the ${maxUses}-message limit. Please try again later.`
      : `Has alcanzado el límite de ${maxUses} respuestas. ¡Por favor intenta más tarde!`;
    Notificacion(msgError, 'warning', 6000);
    throw new Error('Rate limit reached');
  }

  // Añadir mensaje del usuario al historial
  _historial.push({ role: 'user', parts: [{ text: textoUsuario }] });
  persistirHistorial();

  // Obtener contexto dinámico del CV actual
  const cv = _getCvData ? _getCvData() : {};
  const esVacio = isCvVacio(cv);
  const promptEspecifico = esVacio ? nuevoSkill(cv, _lang) : existeSkill(cv, _lang);

  // Turno inicial de contexto (no estático) para Gemini
  const contextTurn = {
    role: 'user',
    parts: [{ text: `INFORMACIÓN Y CONTEXTO DEL CURRÍCULUM DEL CANDIDATO A AUDITAR:\n${promptEspecifico}` }]
  };
  
  const contextAckTurn = {
    role: 'model',
    parts: [{ text: `¡Hola! Entendido perfectamente. He cargado todos los datos del currículum. Estoy listo para ayudarte a optimizar cada sección con total libertad, cercanía y enfoque ATS. Dime, ¿por dónde empezamos a mejorar tu perfil?` }]
  };

  // Ventana deslizable para limitar el historial activo de la llamada a la API a un máximo de 10 mensajes
  const maxHistory = 10;
  let historySlice = _historial;
  if (_historial.length > maxHistory) {
    let startIdx = _historial.length - maxHistory;
    // Asegurar que comience con un mensaje del rol 'user'
    while (startIdx > 0 && _historial[startIdx].role !== 'user') {
      startIdx--;
    }
    historySlice = _historial.slice(startIdx);
  }

  // Combinar el turno de contexto inicial con la ventana deslizable de la conversación activa
  const apiContents = [
    contextTurn,
    contextAckTurn,
    ...historySlice
  ];

  const systemInstruction = buildStaticSystemPrompt();

  try {
    const rawResponse = await llamarGeminiStream({
      contents: apiContents,
      systemInstruction,
      temperature: 0.3,
      responseMimeType: 'text/plain',
      onChunk
    });

    // Consumir el rate limit si es guest y la llamada fue exitosa
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
    // Si falla la API, remover el último mensaje del usuario para no romper el flujo
    _historial.pop();
    persistirHistorial();
    throw err;
  }
};

export const aplicarPatch = (patch) => {
  if (!patch || !_updateCvData) return;
  const { campo, valor, expIdx } = patch;

  if (campo === 'logros' && typeof expIdx === 'number') {
    const cv = _getCvData();
    const list = cv.experiencias ? [...cv.experiencias] : [];
    if (list[expIdx]) {
      list[expIdx].logros = valor;
      _updateCvData({ experiencias: list });
    }
  } else if (campo === 'experiencia_nueva') {
    const cv = _getCvData();
    const list = cv.experiencias ? [...cv.experiencias] : [];
    
    const nuevaExp = {
      id: 'exp_' + Math.random().toString(36).substring(2, 9),
      puesto: valor.puesto || '',
      empresa: valor.empresa || '',
      ubicacion: valor.ubicacion || '',
      inicio: valor.inicio || '',
      fin: valor.fin || '',
      logros: Array.isArray(valor.logros) ? valor.logros.join('\n') : (valor.logros || '')
    };
    
    // Si la única experiencia que hay está completamente vacía (puesto, empresa, logros vacíos), la sobreescribimos
    if (list.length === 1 && !list[0].puesto && !list[0].empresa && !list[0].logros) {
      list[0] = { ...list[0], ...nuevaExp, id: list[0].id };
    } else {
      list.push(nuevaExp);
    }
    
    _updateCvData({ experiencias: list });
  } else if (campo === 'educacion_nueva') {
    const cv = _getCvData();
    const list = cv.educacion ? [...cv.educacion] : [];
    
    const nuevaEdu = {
      id: 'edu_' + Math.random().toString(36).substring(2, 9),
      institucion: valor.institucion || '',
      grado: valor.grado || '',
      ubicacion: valor.ubicacion || '',
      inicio: valor.inicio || '',
      fin: valor.fin || ''
    };
    
    // Si la única educación que hay está vacía, la sobreescribimos
    if (list.length === 1 && !list[0].institucion && !list[0].grado) {
      list[0] = { ...list[0], ...nuevaEdu, id: list[0].id };
    } else {
      list.push(nuevaEdu);
    }
    
    _updateCvData({ educacion: list });
  } else if (campo === 'proyecto_nuevo') {
    const cv = _getCvData();
    const list = cv.proyectos ? [...cv.proyectos] : [];
    const nuevoProj = {
      id: 'proj_' + Math.random().toString(36).substring(2, 9),
      nombre: valor.nombre || '',
      enlace: valor.enlace || '',
      descripcion: valor.descripcion || '',
      tecnologias: valor.tecnologias || ''
    };
    list.push(nuevoProj);
    _updateCvData({ proyectos: list });
  } else if (campo === 'certificacion_nueva') {
    const cv = _getCvData();
    const list = cv.certificaciones ? [...cv.certificaciones] : [];
    const nuevaCert = {
      id: 'cert_' + Math.random().toString(36).substring(2, 9),
      nombre: valor.nombre || '',
      emisor: valor.emisor || '',
      fecha: valor.fecha || ''
    };
    list.push(nuevaCert);
    _updateCvData({ certificaciones: list });
  } else {
    _updateCvData({ [campo]: valor });
  }
};

export const obtenerUltimoPatch = () => _lastPatch;

export const limpiarChat = () => {
  _historial = [];
  _lastPatch = null;
  try {
    localStorage.removeItem(getCacheKey());
  } catch (_) {}
};

export const getHistorial = () => _historial;
