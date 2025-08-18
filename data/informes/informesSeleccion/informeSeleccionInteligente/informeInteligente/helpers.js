/**
 * HELPERS PARA INFORME INTELIGENTE
 * FASE 1 - Fundamentos
 * Funciones auxiliares para el template Handlebars
 */

/**
 * Formatea una fecha en formato DD/MM/YYYY
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} Fecha formateada
 */
function formatDate(date) {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Formatea un rango de fechas
 * @param {string|Date} start - Fecha de inicio
 * @param {string|Date} end - Fecha de fin (opcional)
 * @returns {string} Rango formateado
 */
function formatDateRange(start, end) {
  const startStr = formatDate(start);
  const endStr = end ? formatDate(end) : 'Actualidad';
  
  return `${startStr} - ${endStr}`;
}

/**
 * Extrae el año de una fecha
 * @param {string|Date} date - Fecha
 * @returns {number|string} Año o cadena vacía
 */
function getYear(date) {
  if (!date) return '';
  const d = new Date(date);
  return isNaN(d.getTime()) ? '' : d.getFullYear();
}

/**
 * Divide un texto en párrafos por líneas en blanco
 * @param {string} text - Texto a dividir
 * @returns {Array<string>} Array de párrafos
 */
function splitParagraphs(text) {
  if (!text) return [];
  
  return String(text)
    .trim()
    .split(/\r?\n\s*\r?\n/)
    .map(p => p.trim())
    .filter(Boolean);
}

/**
 * Convierte bullets/puntos en párrafos
 * @param {string} text - Texto con bullets
 * @returns {Array<Object>} Array de objetos con tipo y contenido
 */
function parseBullets(text) {
  if (!text) return [];
  
  const lines = String(text).trim().split(/\r?\n/);
  const result = [];
  
  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    
    // Detectar diferentes tipos de bullets
    const bulletMatch = trimmed.match(/^[\-\*\•\▸\►]\s*(.+)$/);
    const numberedMatch = trimmed.match(/^\d+[\.\)]\s*(.+)$/);
    const letterMatch = trimmed.match(/^[a-zA-Z][\.\)]\s*(.+)$/);
    
    if (bulletMatch) {
      result.push({
        type: 'bullet',
        content: bulletMatch[1].trim()
      });
    } else if (numberedMatch) {
      result.push({
        type: 'numbered',
        content: numberedMatch[1].trim()
      });
    } else if (letterMatch) {
      result.push({
        type: 'letter',
        content: letterMatch[1].trim()
      });
    } else {
      result.push({
        type: 'paragraph',
        content: trimmed
      });
    }
  });
  
  return result;
}

/**
 * Helper condicional para comparar valores
 * @param {any} a - Primer valor
 * @param {any} b - Segundo valor
 * @param {Object} options - Opciones de Handlebars
 * @returns {string} Contenido del bloque si coinciden
 */
function ifEquals(a, b, options) {
  if (a === b) {
    return options.fn(this);
  }
  return options.inverse(this);
}

/**
 * Helper para verificar si un valor está en un array
 * @param {any} value - Valor a buscar
 * @param {Array} array - Array donde buscar
 * @param {Object} options - Opciones de Handlebars
 * @returns {string} Contenido del bloque si está incluido
 */
function ifInArray(value, array, options) {
  if (Array.isArray(array) && array.includes(value)) {
    return options.fn(this);
  }
  return options.inverse(this);
}

/**
 * Helper OR lógico
 * @param {...any} args - Argumentos a evaluar
 * @returns {string} Contenido del bloque si alguno es verdadero
 */
function or() {
  const args = Array.prototype.slice.call(arguments, 0, -1);
  const options = arguments[arguments.length - 1];
  
  if (args.some(Boolean)) {
    return options.fn(this);
  }
  return options.inverse(this);
}

/**
 * Helper AND lógico
 * @param {...any} args - Argumentos a evaluar
 * @returns {string} Contenido del bloque si todos son verdaderos
 */
function and() {
  const args = Array.prototype.slice.call(arguments, 0, -1);
  const options = arguments[arguments.length - 1];

  if (args.every(Boolean)) {
    return options.fn(this);
  }
  return options.inverse(this);
}

/**
 * Concatena múltiples cadenas
 * @param {...string} args - Cadenas a unir
 * @returns {string} Resultado de la concatenación
 */
function concat() {
  return Array.prototype.slice.call(arguments, 0, -1).join('');
}

/**
 * Trunca un texto a un número máximo de caracteres
 * @param {string} text - Texto a truncar
 * @param {number} length - Longitud máxima
 * @param {string} suffix - Sufijo a añadir (por defecto "...")
 * @returns {string} Texto truncado
 */
function truncate(text, length, suffix = '...') {
  if (!text) return '';
  
  const str = String(text);
  if (str.length <= length) return str;
  
  return str.substring(0, length - suffix.length) + suffix;
}

/**
 * Calcula la edad a partir de una fecha de nacimiento
 * @param {string|Date} birthDate - Fecha de nacimiento
 * @returns {number} Edad en años
 */
function calculateAge(birthDate) {
  if (!birthDate) return 0;
  
  const birth = new Date(birthDate);
  if (isNaN(birth.getTime())) return 0;
  
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Genera la URL de un asset
 * @param {string} path - Ruta relativa del asset
 * @returns {string} URL completa del asset
 */
function assetUrl(path) {
  // En JSReport, los assets se referencian de forma especial
  // Esta función puede adaptarse según la configuración
  return `/assets/${path}`;
}

/**
 * Capitaliza la primera letra de un texto
 * @param {string} text - Texto a capitalizar
 * @returns {string} Texto capitalizado
 */
function capitalize(text) {
  if (!text) return '';
  const str = String(text);
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convierte un texto a mayúsculas
 * @param {string} text - Texto
 * @returns {string} Texto en mayúsculas
 */
function uppercase(text) {
  return text ? String(text).toUpperCase() : '';
}

/**
 * Convierte un texto a minúsculas
 * @param {string} text - Texto
 * @returns {string} Texto en minúsculas
 */
function lowercase(text) {
  return text ? String(text).toLowerCase() : '';
}

/**
 * Formatea un número con separadores de miles
 * @param {number} num - Número a formatear
 * @param {string} separator - Separador (por defecto ".")
 * @returns {string} Número formateado
 */
function formatNumber(num, separator = '.') {
  if (num === null || num === undefined) return '';
  
  return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

/**
 * Calcula un porcentaje
 * @param {number} value - Valor
 * @param {number} total - Total
 * @param {number} decimals - Decimales (por defecto 0)
 * @returns {string} Porcentaje formateado
 */
function percentage(value, total, decimals = 0) {
  if (!total || !value) return '0%';
  
  const percent = (value / total) * 100;
  return percent.toFixed(decimals) + '%';
}

/**
 * Helper para debugging - imprime el contexto actual
 * @param {any} context - Contexto a imprimir
 * @returns {string} JSON del contexto
 */
function debug(context) {
  console.log('DEBUG:', JSON.stringify(context, null, 2));
  return '';
}

/**
 * Hook beforeRender para procesar datos antes del renderizado
 * @param {Object} req - Request de JSReport
 * @param {Object} res - Response de JSReport
 * @param {Function} done - Callback
 */
function beforeRender(req, res, done) {
  const data = req.data || {};
  
  // Asegurar que los arrays existen
  const arrays = [
    'modulos',
    'experienciasLaborales',
    'formaciones',
    'competencias',
    'idiomas',
    'referencias'
  ];
  
  arrays.forEach(key => {
    if (!Array.isArray(data[key])) {
      data[key] = [];
    }
  });
  
  // Calcular métricas para decisión de layout
  let totalChars = 0;
  let totalItems = 0;
  
  // Contar caracteres en campos de texto largos
  const textFields = [
    'informe.motivoPresentacion',
    'informe.aspectosPersonales',
    'informe.trayectoriaFormativa',
    'informe.trayectoriaProfesional',
    'informe.entrevistaPersonal',
    'informe.valoracion'
  ];
  
  textFields.forEach(path => {
    const value = path.split('.').reduce((obj, key) => obj?.[key], data);
    if (value) {
      totalChars += String(value).length;
    }
  });
  
  // Contar elementos en arrays
  arrays.forEach(key => {
    if (data[key]) {
      totalItems += data[key].length;
    }
  });
  
  // Decisión de orientación basada en volumen de contenido
  // FASE 1: Lógica simple, se refinará en fases posteriores
  const isLandscape = totalChars > 5000 || totalItems > 50;
  
  // Inyectar información de layout
  data.__layout = {
    isLandscape,
    totalChars,
    totalItems,
    estimatedPages: Math.ceil((totalChars + totalItems * 100) / 3000)
  };
  
  // Inyectar el CSS como string
  data.styles = req.template.styles || '';
  
  req.data = data;
  done();
}