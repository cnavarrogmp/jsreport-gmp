/**
 * HELPERS PARA INFORME INTELIGENTE - VERSIÓN LIMPIA
 * Aplicando principios SOLID y mejores prácticas
 * Mantiene funcionalidad para FASES 1-7
 */

// ================================================================================
// PRINCIPIO DE RESPONSABILIDAD ÚNICA (SRP)
// Cada función tiene una única responsabilidad bien definida
// ================================================================================

/**
 * SERVICIO DE FORMATEO DE FECHAS
 */
class DateFormatter {
  /**
   * Formatea una fecha en formato DD/MM/YYYY
   * @param {string|Date} date - Fecha a formatear
   * @returns {string} Fecha formateada
   */
  static format(date) {
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
  static formatRange(start, end) {
    const startStr = this.format(start);
    const endStr = end ? this.format(end) : 'Actualidad';
    return `${startStr} - ${endStr}`;
  }

  /**
   * Extrae el año de una fecha
   * @param {string|Date} date - Fecha
   * @returns {number|string} Año o cadena vacía
   */
  static getYear(date) {
    if (!date) return '';
    const d = new Date(date);
    return isNaN(d.getTime()) ? '' : d.getFullYear();
  }

  /**
   * Calcula la edad a partir de fecha de nacimiento
   * @param {string|Date} birthDate - Fecha de nacimiento
   * @returns {number} Edad en años
   */
  static calculateAge(birthDate) {
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
}

/**
 * SERVICIO DE PROCESAMIENTO DE TEXTO
 */
class TextProcessor {
  /**
   * Divide un texto en párrafos por líneas en blanco
   * @param {string} text - Texto a dividir
   * @returns {Array<string>} Array de párrafos
   */
  static splitParagraphs(text) {
    if (!text) return [];
    
    return String(text)
      .trim()
      .split(/\r?\n\s*\r?\n/)
      .map(p => p.trim())
      .filter(Boolean);
  }

  /**
   * Convierte bullets/puntos en párrafos estructurados
   * @param {string} text - Texto con bullets
   * @returns {Array<Object>} Array de objetos con tipo y contenido
   */
  static parseBullets(text) {
    if (!text) return [];
    
    const lines = String(text).trim().split(/\r?\n/);
    const result = [];
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;
      
      const bulletMatch = trimmed.match(/^[\-\*\•\▸\►]\s*(.+)$/);
      const numberedMatch = trimmed.match(/^\d+[\.\)]\s*(.+)$/);
      const letterMatch = trimmed.match(/^[a-zA-Z][\.\)]\s*(.+)$/);
      
      if (bulletMatch) {
        result.push({ type: 'bullet', content: bulletMatch[1].trim() });
      } else if (numberedMatch) {
        result.push({ type: 'numbered', content: numberedMatch[1].trim() });
      } else if (letterMatch) {
        result.push({ type: 'letter', content: letterMatch[1].trim() });
      } else {
        result.push({ type: 'paragraph', content: trimmed });
      }
    });
    
    return result;
  }

  /**
   * Trunca un texto a un número máximo de caracteres
   * @param {string} text - Texto a truncar
   * @param {number} maxLength - Longitud máxima
   * @param {string} suffix - Sufijo a agregar
   * @returns {string} Texto truncado
   */
  static truncate(text, maxLength = 100, suffix = '...') {
    if (!text) return '';
    const str = String(text);
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - suffix.length).trim() + suffix;
  }

  /**
   * Capitaliza la primera letra
   * @param {string} text - Texto
   * @returns {string} Texto capitalizado
   */
  static capitalize(text) {
    if (!text) return '';
    const str = String(text);
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Convierte a mayúsculas
   * @param {string} text - Texto
   * @returns {string} Texto en mayúsculas
   */
  static uppercase(text) {
    return text ? String(text).toUpperCase() : '';
  }

  /**
   * Convierte a minúsculas
   * @param {string} text - Texto
   * @returns {string} Texto en minúsculas
   */
  static lowercase(text) {
    return text ? String(text).toLowerCase() : '';
  }
}

/**
 * SERVICIO DE FORMATEO DE NÚMEROS
 */
class NumberFormatter {
  /**
   * Formatea un número con separadores de miles
   * @param {number} num - Número a formatear
   * @param {string} separator - Separador
   * @returns {string} Número formateado
   */
  static format(num, separator = '.') {
    if (num === null || num === undefined) return '';
    return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  }

  /**
   * Calcula un porcentaje
   * @param {number} value - Valor
   * @param {number} total - Total
   * @param {number} decimals - Decimales
   * @returns {string} Porcentaje formateado
   */
  static percentage(value, total, decimals = 0) {
    if (!total || !value) return '0%';
    const percent = (value / total) * 100;
    return percent.toFixed(decimals) + '%';
  }
}

/**
 * SERVICIO DE CONSTRUCCIÓN DE MÓDULOS
 * Principio de Inversión de Dependencias (DIP)
 */
class ModuleBuilder {
  constructor() {
    this.modules = [];
  }

  /**
   * Construye módulo de presentación
   */
  buildPresentationModule(data) {
    const sections = [];
    const highlights = this._extractHighlights(data.informe);
    
    if (highlights.length > 0) {
      sections.push({
        nombre: 'Datos Destacados',
        tipo: 'texto-editorial',
        items: highlights,
        priority: 2,
        breakable: true,
        minHeight: 120,
        blockType: 'editorial-paragraphs'
      });
    }

    if (sections.length > 0) {
      this.modules.push({
        titulo: 'Presentación',
        subtitulo: 'Información general y aspectos destacados',
        secciones: sections,
        moduleType: 'presentacion',
        priority: 1,
        allowSplit: false,
        pageType: 'opening'
      });
    }

    return this;
  }

  /**
   * Construye módulo de experiencia y formación
   */
  buildExperienceModule(data) {
    const sections = [];
    
    if (data.experienciasLaborales?.length > 0) {
      sections.push({
        nombre: 'Experiencia Laboral',
        tipo: 'lista',
        items: this._formatExperienceItems(data.experienciasLaborales),
        priority: 1,
        breakable: false,
        minHeight: 150,
        blockType: 'experience-items'
      });
    }

    if (data.formaciones?.length > 0) {
      sections.push({
        nombre: 'Formación Académica',
        tipo: 'lista',
        items: this._formatEducationItems(data.formaciones),
        priority: 2,
        breakable: false,
        minHeight: 120,
        blockType: 'education-items'
      });
    }

    if (sections.length > 0) {
      this.modules.push({
        titulo: 'Experiencia & Formación',
        subtitulo: 'Trayectoria profesional y académica',
        secciones: sections,
        moduleType: 'experiencia-formacion',
        priority: 2,
        allowSplit: true,
        pageType: 'content'
      });
    }

    return this;
  }

  /**
   * Construye módulo de competencias
   */
  buildCompetenciesModule(data) {
    const sections = [];

    if (data.competencias?.length > 0) {
      sections.push({
        nombre: 'Competencias Evaluadas',
        tipo: 'cards',
        items: this._formatCompetencyCards(data.competencias),
        priority: 1,
        breakable: false,
        minHeight: 100,
        blockType: 'competency-cards',
        maxColumns: 2
      });
    }

    if (data.referencias?.length > 0) {
      sections.push({
        nombre: 'Referencias Profesionales',
        tipo: 'lista',
        items: this._formatReferenceItems(data.referencias),
        blockType: 'reference-items',
        isSubsection: true
      });
    }

    if (data.adjuntos?.length > 0) {
      sections.push({
        nombre: 'Adjuntos',
        tipo: 'lista',
        items: this._formatAttachmentItems(data.adjuntos),
        blockType: 'attachment-items',
        isSubsection: true
      });
    }

    if (sections.length > 0) {
      this.modules.push({
        titulo: 'Competencias & Referencias + Complementaria',
        subtitulo: 'Evaluación integral y datos adicionales',
        secciones: sections,
        moduleType: 'competencias-complementaria',
        priority: 3,
        allowSplit: true,
        pageType: 'sidebar'
      });
    }

    return this;
  }

  /**
   * Construye módulo de conclusiones
   */
  buildConclusionsModule(data) {
    const sections = [];

    if (data.informe) {
      if (data.informe.entrevistaPersonal) {
        sections.push({
          nombre: 'Informe de Entrevista',
          tipo: 'texto',
          contenido: data.informe.entrevistaPersonal,
          priority: 1,
          breakable: true,
          minHeight: 100,
          blockType: 'interview-paragraphs'
        });
      }

      if (data.informe.valoracion) {
        sections.push({
          nombre: 'Valoración Final',
          tipo: 'texto',
          contenido: data.informe.valoracion,
          priority: 2,
          breakable: true,
          minHeight: 100,
          blockType: 'evaluation-paragraphs'
        });
      }

      if (data.informe.potencial) {
        sections.push({
          nombre: 'Potencial',
          tipo: 'texto',
          contenido: data.informe.potencial,
          priority: 3,
          breakable: true,
          blockType: 'potential-paragraphs'
        });
      }

      if (data.informe.puntuacion) {
        sections.push({
          nombre: 'Puntuación Global',
          tipo: 'puntuacion-final',
          puntuacion: data.informe.puntuacion,
          maxPuntuacion: 10,
          priority: 4,
          breakable: false,
          minHeight: 60,
          blockType: 'numeric-score'
        });
      }
    }

    if (sections.length > 0) {
      this.modules.push({
        titulo: 'Conclusiones',
        subtitulo: 'Evaluación final y recomendaciones',
        secciones: sections,
        moduleType: 'conclusiones',
        priority: 4,
        allowSplit: true,
        pageType: 'closing'
      });
    }

    return this;
  }

  /**
   * Obtiene los módulos construidos
   */
  getModules() {
    return this.modules;
  }

  // Métodos privados de utilidad
  _extractHighlights(informe) {
    if (!informe) return [];
    
    const highlights = [];
    const fields = [
      { key: 'motivoPresentacion', subtitulo: 'Motivo de Presentación' },
      { key: 'aspectosPersonales', subtitulo: 'Aspectos Personales' },
      { key: 'trayectoriaFormativa', subtitulo: 'Trayectoria Formativa' },
      { key: 'trayectoriaProfesional', subtitulo: 'Trayectoria Profesional' },
      { key: 'datosInteres', subtitulo: 'Datos de Interés' }
    ];

    fields.forEach(field => {
      if (informe[field.key]) {
        highlights.push({
          subtitulo: field.subtitulo,
          contenido: informe[field.key]
        });
      }
    });

    return highlights;
  }

  _formatExperienceItems(experiencias) {
    return experiencias.map(exp => ({
      titulo: exp.puesto || 'Sin especificar',
      subtitulo: exp.empresa || 'Empresa no especificada',
      descripcion: exp.funcionRealizada || '',
      fechas: DateFormatter.formatRange(exp.fechaInicio, exp.fechaFin)
    }));
  }

  _formatEducationItems(formaciones) {
    return formaciones.map(form => ({
      titulo: form.titulo || 'Sin especificar',
      subtitulo: form.centro || 'Centro no especificado',
      descripcion: form.especialidad || '',
      fechas: form.fechaFin ? DateFormatter.format(form.fechaFin) : 'En curso'
    }));
  }

  _formatCompetencyCards(competencias) {
    return competencias.map(comp => ({
      titulo: comp.competencia,
      contenido: comp.observaciones,
      puntuacion: comp.puntuacion,
      cardType: 'competencia',
      breakable: false
    }));
  }

  _formatReferenceItems(referencias) {
    return referencias.map(ref => ({
      nombre: ref.nombre,
      cargo: ref.cargo,
      empresa: ref.empresa,
      contacto: ref.telefono || ref.email
    }));
  }

  _formatAttachmentItems(adjuntos) {
    return adjuntos.map(adj => ({
      ruta: adj.ruta,
      horas: adj.duracionHoras ? `${adj.duracionHoras}h` : 'No especificado',
      tipo: adj.tipoAdjunto?.value || 'Documento'
    }));
  }
}

/**
 * SERVICIO DE ANÁLISIS DE LAYOUT
 */
class LayoutAnalyzer {
  /**
   * Analiza y decide la orientación del documento
   */
  static analyze(data) {
    let totalChars = 0;
    let totalItems = 0;
    
    // Contar caracteres en campos de texto
    const textFields = [
      'informe.motivoPresentacion',
      'informe.aspectosPersonales',
      'informe.trayectoriaFormativa',
      'informe.trayectoriaProfesional',
      'informe.entrevistaPersonal',
      'informe.valoracion'
    ];
    
    textFields.forEach(path => {
      const value = this._getNestedValue(data, path);
      if (value) {
        totalChars += String(value).length;
      }
    });
    
    // Contar elementos en arrays
    const arrayFields = ['experienciasLaborales', 'formaciones', 'competencias', 'referencias'];
    arrayFields.forEach(key => {
      if (data[key] && Array.isArray(data[key])) {
        totalItems += data[key].length;
      }
    });
    
    const isLandscape = totalChars > 5000 || totalItems > 50;
    
    return {
      isLandscape,
      totalChars,
      totalItems,
      estimatedPages: Math.ceil((totalChars + totalItems * 100) / 3000),
      moduleCount: 0,
      requiresMeasurement: true,
      distributionStrategy: 'adaptive',
      enableContinuationHeaders: true,
      fase2: {
        enabled: true,
        timestamp: new Date().toISOString(),
        calculationRequested: true,
        phantomRenderEnabled: true,
        diagnosticsEnabled: false // Desactivado en producción
      }
    };
  }

  static _getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

/**
 * HELPERS COMPATIBLES CON HANDLEBARS
 * Funciones individuales para mantener compatibilidad
 */
const formatDate = (date) => DateFormatter.format(date);
const formatDateRange = (start, end) => DateFormatter.formatRange(start, end);
const getYear = (date) => DateFormatter.getYear(date);
const calculateAge = (birthDate) => DateFormatter.calculateAge(birthDate);
const splitParagraphs = (text) => TextProcessor.splitParagraphs(text);
const parseBullets = (text) => TextProcessor.parseBullets(text);
const truncate = (text, maxLength, suffix) => TextProcessor.truncate(text, maxLength, suffix);
const capitalize = (text) => TextProcessor.capitalize(text);
const uppercase = (text) => TextProcessor.uppercase(text);
const lowercase = (text) => TextProcessor.lowercase(text);
const formatNumber = (num, separator) => NumberFormatter.format(num, separator);
const percentage = (value, total, decimals) => NumberFormatter.percentage(value, total, decimals);

/**
 * Helpers condicionales para templates
 */
function ifEquals(arg1, arg2, options) {
  return arg1 === arg2 ? options.fn(this) : options.inverse(this);
}

function ifInArray(item, array, options) {
  if (!array || !Array.isArray(array)) {
    return options.inverse(this);
  }
  return array.includes(item) ? options.fn(this) : options.inverse(this);
}

function or(arg1, arg2) {
  return arg1 || arg2;
}

function and(arg1, arg2) {
  return arg1 && arg2;
}

/**
 * Helper para assets
 */
function assetUrl(path) {
  return `/assets/${path}`;
}

/**
 * Helper para debugging (solo en desarrollo)
 */
function debug(context) {
  if (typeof process !== 'undefined' && process.env.DEBUG === 'true') {
    console.log('DEBUG:', JSON.stringify(context, null, 2));
  }
  return '';
}

/**
 * Helper JSON
 */
function json(obj) {
  return JSON.stringify(obj);
}

/**
 * HOOK PRINCIPAL DE PROCESAMIENTO
 */
function beforeRender(req, res) {
  const data = req.data || {};
  
  // Crear builder de módulos
  const moduleBuilder = new ModuleBuilder();
  
  // Construir módulos en orden
  moduleBuilder
    .buildPresentationModule(data)
    .buildExperienceModule(data)
    .buildCompetenciesModule(data)
    .buildConclusionsModule(data);
  
  // Asignar módulos al data
  data.modulos = moduleBuilder.getModules();
  
  // Asegurar arrays
  const requiredArrays = [
    'modulos', 'experienciasLaborales', 'formaciones',
    'competencias', 'idiomas', 'referencias'
  ];
  
  requiredArrays.forEach(key => {
    if (!Array.isArray(data[key])) {
      data[key] = [];
    }
  });
  
  // Analizar layout
  data.__layout = LayoutAnalyzer.analyze(data);
  data.__layout.moduleCount = data.modulos.length;
  
  // Inyectar estilos si existen
  data.styles = req.template.styles || '';
  
  req.data = data;
}

/**
 * CONFIGURACIÓN DE HELPERS PARA JSREPORT
 */
function configureHelpers() {
  return {
    formatDate,
    formatDateRange,
    getYear,
    splitParagraphs,
    parseBullets,
    ifEquals,
    ifInArray,
    or,
    and,
    truncate,
    calculateAge,
    assetUrl,
    capitalize,
    uppercase,
    lowercase,
    formatNumber,
    percentage,
    debug,
    json
  };
}

// Exportar para JSReport
module.exports = {
  helpers: configureHelpers(),
  beforeRender: beforeRender
};