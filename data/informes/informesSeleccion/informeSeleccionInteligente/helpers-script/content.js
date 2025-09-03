/**
 * HELPERS PARA JSReport (Contexto servidor)
 * Solo funciones que se ejecutan en Node.js durante la compilación
 */

// Este script se ejecuta en el contexto del servidor (Node.js)
// No tiene acceso a window, document, etc.

function serverSideHelper() {
  return "Script ejecutado en servidor";
}