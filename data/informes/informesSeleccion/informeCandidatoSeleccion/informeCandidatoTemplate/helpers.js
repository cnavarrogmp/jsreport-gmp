// Helpers para el template - JSReport los carga automáticamente

function formatDate(date, format) {
    if (!date) return '';
    
    var dateObj;
    if (date === 'now') {
        dateObj = new Date();
    } else {
        dateObj = new Date(date);
    }
    
    if (isNaN(dateObj.getTime())) return '';
    
    var day = String(dateObj.getDate()).padStart(2, '0');
    var month = String(dateObj.getMonth() + 1).padStart(2, '0');
    var year = dateObj.getFullYear();
    var hours = String(dateObj.getHours()).padStart(2, '0');
    var minutes = String(dateObj.getMinutes()).padStart(2, '0');
    
    switch (format) {
        case 'DD/MM/YYYY':
            return day + '/' + month + '/' + year;
        case 'MM/YYYY':
            return month + '/' + year;
        case 'YYYY':
            return String(year);
        case 'HH:mm':
            return hours + ':' + minutes;
        case 'DD/MM/YYYY HH:mm':
            return day + '/' + month + '/' + year + ' ' + hours + ':' + minutes;
        default:
            return day + '/' + month + '/' + year;
    }
}

function hasContent(array) {
    return Array.isArray(array) && array.length > 0;
}

function hasText(text) {
    return text && typeof text === 'string' && text.trim().length > 0;
}

// Helper para verificar arrays con contenido
function hasArrayContent(array) {
    return Array.isArray(array) && array.length > 0;
}

// Helper para verificar si al menos un elemento cumple condición
function hasSomeWhere(arr, predicateFn) {
    if (!Array.isArray(arr)) return false;
    for (var i = 0; i < arr.length; i++) {
        if (predicateFn(arr[i])) return true;
    }
    return false;
}

// Helpers para obtener primer válido y resto
function firstWhereProp(arr, prop) {
    if (!Array.isArray(arr)) return null;
    for (var i = 0; i < arr.length; i++) {
        var x = arr[i];
        if (x && hasText(x[prop])) return x;
    }
    return null;
}

function restWhereProp(arr, prop) {
    var out = [];
    if (!Array.isArray(arr)) return out;
    var used = false;
    for (var i = 0; i < arr.length; i++) {
        var x = arr[i];
        if (x && hasText(x[prop])) {
            if (!used) { 
                used = true; 
                continue; // Saltar el primero
            }
            out.push(x);
        }
    }
    return out;
}

// Helper global para determinar si un módulo tiene contenido mínimo
function hasMinimumContent(module, data) {
    var informe = data.informe || {};
    
    switch(module) {
        case 'presentation':
            return hasText(informe.motivoPresentacion) || 
                   hasText(informe.aspectosPersonales) ||
                   hasText(informe.trayectoriaFormativa) || 
                   hasText(informe.trayectoriaProfesional) ||
                   hasText(informe.datosInteres);
        
        case 'experience':
            // Alineado con plantilla: Experiencia válida = tiene empresa; Formación válida = tiene centro
            return hasSomeWhere(data.experienciasLaborales || [], function(x) { 
                return x && hasText(x.empresa); 
            }) ||
            hasSomeWhere(data.formaciones || [], function(x) { 
                return x && hasText(x.centro); 
            });
        
        case 'competencies':
            return hasArrayContent(data.competencias) || 
                   hasArrayContent(data.referencias) ||
                   hasArrayContent(data.aplicacionesInformaticas) || 
                   hasArrayContent(data.idiomas) ||
                   hasArrayContent(data.acreditaciones) || 
                   hasArrayContent(data.adjuntos);
        
        case 'conclusions':
            return hasText(informe.entrevistaPersonal) || 
                   hasText(informe.valoracion) ||
                   (informe.puntuacion != null);
        
        default:
            return true;
    }
}

// ================================
// SISTEMA DE BREADCRUMBS - FASE 2  
// ================================

/**
 * Helper para breadcrumb - por ahora estático
 * Reservado para futura implementación de contexto dinámico
 */
function getCurrentBreadcrumb() {
    return "Informe de Candidato";
}
