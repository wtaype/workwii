/**
 * procesarJson.js - Utilidades de manipulación de JSON y almacenamiento
 * Escrito en espanol sin tildes para evitar problemas de codificacion.
 */

/**
 * Realiza una clonacion profunda de un objeto para evitar referencias mutables
 */
export const clonar = (obj) => {
  if (obj === null || obj === undefined) return obj;
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (err) {
    console.error('Error al clonar objeto:', err);
    return obj;
  }
};

/**
 * Guarda datos de forma segura en el sessionStorage del navegador
 */
export const guardarSesion = (clave, valor) => {
  try {
    sessionStorage.setItem(clave, JSON.stringify(valor));
  } catch (err) {
    console.error('Error al guardar en sessionStorage:', err);
  }
};

/**
 * Obtiene y parsea datos guardados en el sessionStorage
 */
export const obtenerSesion = (clave) => {
  try {
    const item = sessionStorage.getItem(clave);
    return item ? JSON.parse(item) : null;
  } catch (err) {
    console.error('Error al leer de sessionStorage:', err);
    return null;
  }
};

/**
 * Elimina un registro de sessionStorage
 */
export const eliminarSesion = (clave) => {
  try {
    sessionStorage.removeItem(clave);
  } catch (err) {
    console.error('Error al remover de sessionStorage:', err);
  }
};

/**
 * Combina datos nuevos en el objeto de datos original limpiando los arrays
 * para evitar que elementos eliminados se queden pegados (ej: experiencias)
 */
export const combinarDatos = (actual, nuevo) => {
  if (!actual || !nuevo || typeof nuevo !== 'object') return actual;

  for (const llave in nuevo) {
    if (Object.prototype.hasOwnProperty.call(nuevo, llave)) {
      if (Array.isArray(nuevo[llave])) {
        // Reemplazar arrays completos para evitar duplicidades
        actual[llave] = clonar(nuevo[llave]);
      } else if (nuevo[llave] && typeof nuevo[llave] === 'object') {
        // Reemplazar objetos anidados para limpieza total
        actual[llave] = clonar(nuevo[llave]);
      } else {
        // Valor primitivo
        actual[llave] = nuevo[llave];
      }
    }
  }
  return actual;
};
