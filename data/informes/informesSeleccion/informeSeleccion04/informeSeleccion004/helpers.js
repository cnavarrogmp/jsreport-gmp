/**
 * GRUPOMPLEO - Helpers de Handlebars
 * Funciones para renderizado condicional y formateo de datos
 * Sistema optimizado para informes de candidatos industriales
 */

// ====================
// HELPERS DE RENDERIZADO CONDICIONAL
// ====================

/**
 * Helper OR - Evalúa múltiples condiciones con operador OR
 * Uso: {{#if (or condition1 condition2 condition3)}}
 */
function or() {
    const args = Array.prototype.slice.call(arguments, 0, -1);
    return args.some(arg => !!arg);
}

/**
 * Helper AND - Evalúa múltiples condiciones con operador AND
 * Uso: {{#if (and condition1 condition2)}}
 */
function and() {
    const args = Array.prototype.slice.call(arguments, 0, -1);
    return args.every(arg => !!arg);
}

/**
 * Helper NOT - Niega una condición
 * Uso: {{#if (not condition)}}
 */
function not(condition) {
    return !condition;
}

/**
 * Helper hasContent - Verifica si un array/string tiene contenido
 * Uso: {{#if (hasContent array)}}
 */
function hasContent(item) {
    if (!item) return false;
    if (Array.isArray(item)) return item.length > 0;
    if (typeof item === 'string') return item.trim().length > 0;
    if (typeof item === 'object') return Object.keys(item).length > 0;
    return !!item;
}

/**
 * Helper isEmpty - Verifica si un elemento está vacío
 * Uso: {{#if (isEmpty array)}}
 */
function isEmpty(item) {
    return !hasContent(item);
}

/**
 * Helper count - Cuenta elementos en un array
 * Uso: {{count array}}
 */
function count(array) {
    if (!Array.isArray(array)) return 0;
    return array.length;
}

// ====================
// HELPERS DE FORMATEO DE FECHAS
// ====================

/**
 * Helper formatDate - Formatea fechas según diferentes patrones
 * Uso: {{formatDate fecha 'format'}}
 * Formatos: 'full', 'date', 'year', 'month-year'
 */
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

/**
 * Helper dateRange - Calcula rango entre dos fechas
 * Uso: {{dateRange fechaInicio fechaFin}}
 */
function dateRange(startDate, endDate) {
    if (!startDate) return 'N/D';
    
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    
    if (isNaN(start.getTime())) return 'N/D';
    
    const startYear = start.getFullYear();
    const endYear = end.getFullYear();
    
    if (startYear === endYear) {
        return endDate ? startYear.toString() : startYear + ' - Actualidad';
    } else {
        return startYear + ' - ' + (endDate ? endYear : 'Actualidad');
    }
}

/**
 * Helper calculateYears - Calcula años de experiencia
 * Uso: {{calculateYears fechaInicio fechaFin}}
 */
function calculateYears(startDate, endDate) {
    if (!startDate) return 0;
    
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    
    if (isNaN(start.getTime())) return 0;
    
    const years = end.getFullYear() - start.getFullYear();
    const monthDiff = end.getMonth() - start.getMonth();
    
    return monthDiff < 0 || (monthDiff === 0 && end.getDate() < start.getDate()) ? years - 1 : years;
}

// ====================
// HELPERS DE FORMATEO DE TEXTO
// ====================

/**
 * Helper splitParagraphs - Divide texto en párrafos
 * Uso: {{#each (splitParagraphs texto)}}
 */
function splitParagraphs(text) {
    if (!text || typeof text !== 'string') return [];
    
    return text
        .split(/\r?\n\r?\n|\.\s+(?=[A-ZÁÉÍÓÚÑ])/) // División por dobles saltos o puntos seguidos de mayúscula
        .map(paragraph => paragraph.trim())
        .filter(paragraph => paragraph.length > 0)
        .map(paragraph => {
            // Asegurar que termine en punto si no tiene puntuación final
            if (!/[.!?]$/.test(paragraph)) {
                paragraph += '.';
            }
            return paragraph;
        });
}

/**
 * Helper truncate - Trunca texto a una longitud específica
 * Uso: {{truncate texto 100}}
 */
function truncate(text, length) {
    if (!text || typeof text !== 'string') return '';
    
    length = length || 150;
    
    if (text.length <= length) return text;
    
    return text.substring(0, length).trim() + '...';
}

/**
 * Helper capitalize - Capitaliza la primera letra de cada palabra
 * Uso: {{capitalize texto}}
 */
function capitalize(text) {
    if (!text || typeof text !== 'string') return '';
    
    return text.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Helper upperCase - Convierte a mayúsculas
 * Uso: {{upperCase texto}}
 */
function upperCase(text) {
    if (!text || typeof text !== 'string') return '';
    return text.toUpperCase();
}

/**
 * Helper lowerCase - Convierte a minúsculas
 * Uso: {{lowerCase texto}}
 */
function lowerCase(text) {
    if (!text || typeof text !== 'string') return '';
    return text.toLowerCase();
}

// ====================
// HELPERS DE FORMATEO NUMÉRICO
// ====================

/**
 * Helper formatScore - Formatea puntuaciones con decimales
 * Uso: {{formatScore puntuacion}}
 */
function formatScore(score) {
    if (score === null || score === undefined) return 'N/A';
    
    const num = parseFloat(score);
    if (isNaN(num)) return 'N/A';
    
    return num % 1 === 0 ? num.toString() : num.toFixed(1);
}

/**
 * Helper percentage - Convierte un número a porcentaje
 * Uso: {{percentage numero}}
 */
function percentage(value, total) {
    if (!value || !total) return '0%';
    
    const percent = (value / total) * 100;
    return Math.round(percent) + '%';
}

// ====================
// HELPERS DE ARRAYS Y OBJETOS
// ====================

/**
 * Helper first - Obtiene el primer elemento de un array
 * Uso: {{first array}}
 */
function first(array) {
    if (!Array.isArray(array) || array.length === 0) return null;
    return array[0];
}

/**
 * Helper last - Obtiene el último elemento de un array
 * Uso: {{last array}}
 */
function last(array) {
    if (!Array.isArray(array) || array.length === 0) return null;
    return array[array.length - 1];
}

/**
 * Helper sortBy - Ordena un array por una propiedad
 * Uso: {{#each (sortBy array 'propiedad')}}
 */
function sortBy(array, property) {
    if (!Array.isArray(array)) return [];
    
    return array.slice().sort((a, b) => {
        const aVal = a[property];
        const bVal = b[property];
        
        if (aVal < bVal) return -1;
        if (aVal > bVal) return 1;
        return 0;
    });
}

/**
 * Helper filterBy - Filtra un array por una condición
 * Uso: {{#each (filterBy array 'propiedad' 'valor')}}
 */
function filterBy(array, property, value) {
    if (!Array.isArray(array)) return [];
    
    return array.filter(item => item[property] === value);
}

// ====================
// HELPERS DE CONTEXTO Y NAVEGACIÓN
// ====================

/**
 * Helper getCurrentContext - Obtiene el contexto actual para headers
 * Se utiliza con JavaScript en el cliente
 */
function getCurrentContext(moduleId, sectionId, apartadoId) {
    const contexts = [];
    
    if (moduleId) contexts.push(getModuleName(moduleId));
    if (sectionId) contexts.push(getSectionName(sectionId));
    if (apartadoId) contexts.push(getApartadoName(apartadoId));
    
    return contexts.join(' > ');
}

function getModuleName(id) {
    const modules = {
        'informacion-personal': 'Info. Personal',
        'evaluacion-profesional': 'Evaluación',
        'competencias': 'Competencias',
        'habilidades-tecnicas': 'Habilidades',
        'experiencia-laboral': 'Experiencia',
        'formacion-academica': 'Formación',
        'referencias': 'Referencias'
    };
    return modules[id] || id;
}

function getSectionName(id) {
    const sections = {
        'valoracion-general': 'Valoración',
        'idiomas': 'Idiomas',
        'informatica': 'Informática',
        'acreditaciones': 'Acreditaciones'
    };
    return sections[id] || id;
}

function getApartadoName(id) {
    // Manejo dinámico de apartados numerados
    if (id.includes('experiencia-')) return 'Exp. ' + (parseInt(id.split('-')[1]) + 1);
    if (id.includes('formacion-')) return 'Form. ' + (parseInt(id.split('-')[1]) + 1);
    if (id.includes('competencia-')) return 'Comp. ' + (parseInt(id.split('-')[1]) + 1);
    if (id.includes('referencia-')) return 'Ref. ' + (parseInt(id.split('-')[1]) + 1);
    
    return id.replace(/-/g, ' ');
}

// ====================
// REGISTRO DE HELPERS EN HANDLEBARS
// ====================

// Esta función se ejecuta cuando se incluye el script
(function registerHelpers() {
    if (typeof Handlebars !== 'undefined') {
        // Helpers condicionales
        Handlebars.registerHelper('or', or);
        Handlebars.registerHelper('and', and);
        Handlebars.registerHelper('not', not);
        Handlebars.registerHelper('hasContent', hasContent);
        Handlebars.registerHelper('isEmpty', isEmpty);
        Handlebars.registerHelper('count', count);
        
        // Helpers de fechas
        Handlebars.registerHelper('formatDate', formatDate);
        Handlebars.registerHelper('dateRange', dateRange);
        Handlebars.registerHelper('calculateYears', calculateYears);
        
        // Helpers de texto
        Handlebars.registerHelper('splitParagraphs', splitParagraphs);
        Handlebars.registerHelper('truncate', truncate);
        Handlebars.registerHelper('capitalize', capitalize);
        Handlebars.registerHelper('upperCase', upperCase);
        Handlebars.registerHelper('lowerCase', lowerCase);
        
        // Helpers numéricos
        Handlebars.registerHelper('formatScore', formatScore);
        Handlebars.registerHelper('percentage', percentage);
        
        // Helpers de arrays
        Handlebars.registerHelper('first', first);
        Handlebars.registerHelper('last', last);
        Handlebars.registerHelper('sortBy', sortBy);
        Handlebars.registerHelper('filterBy', filterBy);
        
        console.log('GRUPOMPLEO Handlebars helpers registered successfully');
    }
})();

// ====================
// FUNCIONES DE CONTEXTO PARA HEADERS (JavaScript del navegador)
// ====================

// Script que se ejecuta solo en el navegador, no en JSReport server
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    // Script para manejo de headers contextuales dinámicos
    document.addEventListener('DOMContentLoaded', function() {
        let currentContext = '';
        let isFragmented = false;
        
        // Detección de fragmentación de contenido
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const module = element.getAttribute('data-module');
                    const section = element.getAttribute('data-section');
                    const apartado = element.getAttribute('data-apartado');
                    
                    currentContext = getCurrentContext(module, section, apartado);
                    updateContextHeaders();
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '-10px'
        });
        
        // Observar todos los elementos con contexto
        document.querySelectorAll('[data-module], [data-section], [data-apartado]').forEach(el => {
            observer.observe(el);
        });
        
        function updateContextHeaders() {
            // Actualizar Sticky Header (Opción A)
            const stickyHeader = document.getElementById('sticky-header');
            const currentContextSpan = document.getElementById('current-context');
            
            if (stickyHeader && currentContextSpan && currentContext) {
                currentContextSpan.textContent = currentContext;
                stickyHeader.classList.remove('hidden');
            }
            
            // Actualizar Context Badge (Opción C)
            const contextBadge = document.getElementById('context-badge');
            const badgeText = document.getElementById('badge-text');
            
            if (contextBadge && badgeText && currentContext && isFragmented) {
                badgeText.textContent = currentContext;
                contextBadge.classList.remove('hidden');
            }
            
            // Actualizar Breadcrumb (Opción B)
            const breadcrumbContext = document.getElementById('breadcrumb-context');
            const breadcrumbText = document.getElementById('breadcrumb-text');
            
            if (breadcrumbContext && breadcrumbText && currentContext && isFragmented) {
                breadcrumbText.textContent = currentContext;
                breadcrumbContext.classList.remove('hidden');
            }
        }
        
        // Detectar cuando el contenido se fragmenta (salto de página)
        if (typeof window.addEventListener === 'function') {
            window.addEventListener('beforeprint', () => {
                isFragmented = true;
                updateContextHeaders();
                
                // Mostrar elementos de contexto en impresión
                document.querySelectorAll('.context-badge, .breadcrumb-context-overlay').forEach(el => {
                    el.classList.add('print-show');
                });
            });
            
            window.addEventListener('afterprint', () => {
                isFragmented = false;
                document.querySelectorAll('.print-show').forEach(el => {
                    el.classList.remove('print-show');
                });
            });
        }
    });
}

// Exportar funciones para uso en Node.js/JSReport si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        or, and, not, hasContent, isEmpty, count,
        formatDate, dateRange, calculateYears,
        splitParagraphs, truncate, capitalize, upperCase, lowerCase,
        formatScore, percentage,
        first, last, sortBy, filterBy,
        getCurrentContext, getModuleName, getSectionName, getApartadoName
    };
}