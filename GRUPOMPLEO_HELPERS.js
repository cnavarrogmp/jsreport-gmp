// GRUPOMPLEO - Helpers para JSReport Studio
// Copia y pega este código en el campo "Helpers" de JSReport Studio

// Helper OR - Evalúa múltiples condiciones con operador OR
function or() {
    const args = Array.prototype.slice.call(arguments, 0, -1);
    return args.some(arg => !!arg);
}

// Helper AND - Evalúa múltiples condiciones con operador AND  
function and() {
    const args = Array.prototype.slice.call(arguments, 0, -1);
    return args.every(arg => !!arg);
}

// Helper hasContent - Verifica si un elemento tiene contenido
function hasContent(item) {
    if (!item) return false;
    if (Array.isArray(item)) return item.length > 0;
    if (typeof item === 'string') return item.trim().length > 0;
    if (typeof item === 'object') return Object.keys(item).length > 0;
    return !!item;
}

// Helper isEmpty - Verifica si un elemento está vacío
function isEmpty(item) {
    return !hasContent(item);
}

// Helper formatDate - Formatea fechas según diferentes patrones
function formatDate(dateString, format) {
    if (!dateString) return 'N/D';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/D';
    
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    
    switch (format) {
        case 'year':
            return date.getFullYear().toString();
        case 'month-year':
            return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });
        case 'date':
            return date.toLocaleDateString('es-ES', options);
        case 'short':
            return date.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
        default:
            return date.toLocaleDateString('es-ES', options);
    }
}

// Helper splitParagraphs - Divide texto en párrafos inteligentemente
function splitParagraphs(text) {
    if (!text || typeof text !== 'string') return [];
    
    return text
        .split(/\r?\n\r?\n|\.\s+(?=[A-ZÁÉÍÓÚÑ])/)
        .map(paragraph => paragraph.trim())
        .filter(paragraph => paragraph.length > 0)
        .map(paragraph => {
            if (!/[.!?]$/.test(paragraph)) {
                paragraph += '.';
            }
            return paragraph;
        });
}

// Helper truncate - Trunca texto a una longitud específica
function truncate(text, length) {
    if (!text || typeof text !== 'string') return '';
    
    length = length || 150;
    
    if (text.length <= length) return text;
    
    return text.substring(0, length).trim() + '...';
}

// Helper formatScore - Formatea puntuaciones con decimales
function formatScore(score) {
    if (score === null || score === undefined) return 'N/A';
    
    const num = parseFloat(score);
    if (isNaN(num)) return 'N/A';
    
    return num % 1 === 0 ? num.toString() : num.toFixed(1);
}

// Helper capitalize - Capitaliza la primera letra de cada palabra
function capitalize(text) {
    if (!text || typeof text !== 'string') return '';
    
    return text.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

// Helper count - Cuenta elementos en un array
function count(array) {
    if (!Array.isArray(array)) return 0;
    return array.length;
}

// Helper first - Obtiene el primer elemento de un array
function first(array) {
    if (!Array.isArray(array) || array.length === 0) return null;
    return array[0];
}

// Helper last - Obtiene el último elemento de un array
function last(array) {
    if (!Array.isArray(array) || array.length === 0) return null;
    return array[array.length - 1];
}