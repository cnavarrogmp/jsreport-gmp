// Helpers para el template - JSReport los carga automáticamente
// NO usar module.exports, solo funciones globales

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