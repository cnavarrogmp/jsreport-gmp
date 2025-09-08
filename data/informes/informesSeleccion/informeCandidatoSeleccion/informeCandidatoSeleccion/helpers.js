// Helpers simplificados para informeCandidatoSeleccion
const helpers = {
  // Helper para formatear fechas ISO y normales  
  formatDate: function(date, format) {
    if (!date) return '';
    
    let dateObj;
    if (date === 'now') {
      dateObj = new Date();
    } else {
      // Manejar fechas ISO con zona horaria
      if (typeof date === 'string' && date.includes('T')) {
        dateObj = new Date(date);
      } else {
        dateObj = new Date(date);
      }
    }
    
    if (isNaN(dateObj.getTime())) return '';
    
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');
    
    switch (format) {
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'HH:mm:ss':
        return `${hours}:${minutes}:${seconds}`;
      case 'DD/MM/YYYY HH:mm:ss':
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
      case 'MM/YYYY':
        return `${month}/${year}`;
      case 'YYYY':
        return `${year}`;
      default:
        return `${day}/${month}/${year}`;
    }
  },

  // Helper para verificar si hay contenido en un array
  hasContent: function(array) {
    return Array.isArray(array) && array.length > 0;
  },

  // Helper para verificar si hay texto
  hasText: function(text) {
    return text && typeof text === 'string' && text.trim().length > 0;
  }
};

module.exports = helpers;