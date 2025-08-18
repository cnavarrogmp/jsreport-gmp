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
 * Este se ejecuta ANTES del renderizado del template
 * @param {Object} req - Request de JSReport
 * @param {Object} res - Response de JSReport
 */
function beforeRender(req, res) {
  const data = req.data || {};
  
  // NUEVA ESTRUCTURA MODULAR - 4 MÓDULOS LÓGICOS
  // Compatible con FASES 2-7: Cada módulo tendrá metadata para medición y distribución
  data.modulos = [];
  
  // ================================================================================
  // MÓDULO 1 · PRESENTACIÓN (Datos Básicos + Datos Destacados)
  // ================================================================================
  const seccionesPresentacion = [];
  
  // Los datos básicos ya se muestran en el header del candidato, no duplicamos
  
  // SECCIÓN: Datos Destacados (párrafos editoriales)
  const datosDestacados = [];
  if (data.informe) {
    if (data.informe.motivoPresentacion) {
      datosDestacados.push({
        subtitulo: 'Motivo de Presentación',
        contenido: data.informe.motivoPresentacion
      });
    }
    if (data.informe.aspectosPersonales) {
      datosDestacados.push({
        subtitulo: 'Aspectos Personales',
        contenido: data.informe.aspectosPersonales
      });
    }
    if (data.informe.trayectoriaFormativa) {
      datosDestacados.push({
        subtitulo: 'Trayectoria Formativa',
        contenido: data.informe.trayectoriaFormativa
      });
    }
    if (data.informe.trayectoriaProfesional) {
      datosDestacados.push({
        subtitulo: 'Trayectoria Profesional',
        contenido: data.informe.trayectoriaProfesional
      });
    }
    if (data.informe.datosInteres) {
      datosDestacados.push({
        subtitulo: 'Datos de Interés',
        contenido: data.informe.datosInteres
      });
    }
  }
  
  if (datosDestacados.length > 0) {
    seccionesPresentacion.push({
      nombre: 'Datos Destacados',
      tipo: 'texto-editorial', // Tipo especial para bloques editoriales
      items: datosDestacados,
      priority: 2,
      breakable: true,
      minHeight: 120,
      blockType: 'editorial-paragraphs'
    });
  }
  
  if (seccionesPresentacion.length > 0) {
    data.modulos.push({
      titulo: 'Presentación',
      subtitulo: 'Información general y aspectos destacados',
      secciones: seccionesPresentacion,
      moduleType: 'presentacion',
      priority: 1,
      allowSplit: false, // La presentación debe ir completa
      pageType: 'opening' // Equivale a "Página 1"
    });
  }
  
  // ================================================================================
  // MÓDULO 2 · EXPERIENCIA & FORMACIÓN
  // ================================================================================
  const seccionesExperienciaFormacion = [];
  
  // SECCIÓN: Experiencia Laboral
  if (data.experienciasLaborales && data.experienciasLaborales.length > 0) {
    const itemsExperiencia = data.experienciasLaborales
      .filter(exp => exp.empresa) // Solo experiencias con empresa
      .map(exp => ({
        puesto: exp.puesto || 'Sin especificar',
        empresa: exp.empresa,
        rangoAnos: exp.fechaInicio ? 
          `${new Date(exp.fechaInicio).getFullYear()}${exp.fechaFin ? ' - ' + new Date(exp.fechaFin).getFullYear() : ' - Actualidad'}` : 
          'Fechas no especificadas',
        funcion: exp.funcionRealizada || '',
        // Metadata para distribución
        fechaOrden: exp.fechaInicio || '1900-01-01',
        weight: 1,
        keepWithNext: false
      }))
      .sort((a, b) => new Date(b.fechaOrden) - new Date(a.fechaOrden)); // Más reciente primero
    
    seccionesExperienciaFormacion.push({
      nombre: 'Experiencia Laboral',
      tipo: 'lista',
      items: itemsExperiencia,
      // Metadata para FASE 3
      maxItemsPerPage: 8,
      orphanThreshold: 2,
      blockType: 'experience-items'
    });
  }
  
  // SECCIÓN: Formación
  if (data.formaciones && data.formaciones.length > 0) {
    const itemsFormacion = data.formaciones
      .filter(form => form.nombre || form.titulacionAcademica)
      .map(form => ({
        nombreTitulacion: form.nombre || form.titulacionAcademica,
        centro: form.centro || 'No especificado',
        ano: form.fechaFin ? new Date(form.fechaFin).getFullYear() : 'No especificado',
        titulado: form.titulo ? 'Sí' : 'En curso',
        // Metadata para orden
        fechaOrden: form.fechaFin || '1900-01-01',
        weight: 1
      }))
      .sort((a, b) => new Date(b.fechaOrden) - new Date(a.fechaOrden)); // Más reciente primero
    
    seccionesExperienciaFormacion.push({
      nombre: 'Formación',
      tipo: 'lista',
      items: itemsFormacion,
      maxItemsPerPage: 10,
      orphanThreshold: 3,
      blockType: 'education-items'
    });
  }
  
  if (seccionesExperienciaFormacion.length > 0) {
    data.modulos.push({
      titulo: 'Experiencia & Formación',
      subtitulo: 'Trayectoria profesional y académica',
      secciones: seccionesExperienciaFormacion,
      moduleType: 'experiencia-formacion',
      priority: 2,
      allowSplit: true,
      pageType: 'content' // Equivale a "Página 2"
    });
  }
  
  // ================================================================================
  // MÓDULO 3 · COMPETENCIAS & REFERENCIAS + COMPLEMENTARIA
  // ================================================================================
  const seccionesCompetenciasComplementaria = [];
  
  // SECCIÓN: Competencias
  if (data.competencias && data.competencias.length > 0) {
    const itemsCompetencias = data.competencias
      .sort((a, b) => (b.puntuacion || 0) - (a.puntuacion || 0)) // Mejor puntuación primero
      .map(comp => ({
        competencia: comp.competencia,
        observaciones: comp.observaciones,
        puntuacion: comp.puntuacion,
        // Metadata para cards
        cardType: 'competencia',
        breakable: false
      }));
    
    seccionesCompetenciasComplementaria.push({
      nombre: 'Competencias',
      tipo: 'cards',
      items: itemsCompetencias,
      // Metadata para FASE 4
      gridColumns: 2,
      minCardsPerPage: 2,
      blockType: 'competency-cards'
    });
  }
  
  // SECCIÓN: Referencias
  if (data.referencias && data.referencias.length > 0) {
    const itemsReferencias = data.referencias.map(ref => ({
      empresa: ref.empresa,
      funcion: ref.funcionRealizada || 'No especificada',
      contacto: ref.referencia || 'Sin contacto',
      weight: 1
    }));
    
    seccionesCompetenciasComplementaria.push({
      nombre: 'Referencias',
      tipo: 'lista',
      items: itemsReferencias,
      maxItemsPerPage: 6,
      blockType: 'reference-items'
    });
  }
  
  // SUBSECCIONES COMPLEMENTARIAS
  
  // Idiomas
  if (data.idiomas && data.idiomas.length > 0) {
    const itemsIdiomas = data.idiomas.map(idioma => ({
      idioma: idioma.idioma,
      nivel: idioma.nivel || 'No especificado'
    }));
    
    seccionesCompetenciasComplementaria.push({
      nombre: 'Idiomas',
      tipo: 'lista',
      items: itemsIdiomas,
      blockType: 'language-items',
      isSubsection: true
    });
  }
  
  // Informática
  if (data.aplicacionesInformaticas && data.aplicacionesInformaticas.length > 0) {
    const itemsInformatica = data.aplicacionesInformaticas.map(app => ({
      aplicacion: app.aplicacion,
      nivel: app.nivel || 'No especificado'
    }));
    
    seccionesCompetenciasComplementaria.push({
      nombre: 'Informática',
      tipo: 'lista',
      items: itemsInformatica,
      blockType: 'software-items',
      isSubsection: true
    });
  }
  
  // Acreditaciones
  if (data.acreditaciones && data.acreditaciones.length > 0) {
    const itemsAcreditaciones = data.acreditaciones.map(acred => ({
      tipo: acred.descripcion || 'Acreditación',
      ano: acred.fecha ? new Date(acred.fecha).getFullYear() : 'No especificado',
      descripcion: acred.tipoAcreditacion || ''
    }));
    
    seccionesCompetenciasComplementaria.push({
      nombre: 'Acreditaciones',
      tipo: 'lista',
      items: itemsAcreditaciones,
      blockType: 'certification-items',
      isSubsection: true
    });
  }
  
  // Adjuntos
  if (data.adjuntos && data.adjuntos.length > 0) {
    const itemsAdjuntos = data.adjuntos.map(adj => ({
      ruta: adj.ruta,
      horas: adj.duracionHoras ? `${adj.duracionHoras}h` : 'No especificado',
      tipo: adj.tipoAdjunto ? adj.tipoAdjunto.value : 'Documento'
    }));
    
    seccionesCompetenciasComplementaria.push({
      nombre: 'Adjuntos',
      tipo: 'lista',
      items: itemsAdjuntos,
      blockType: 'attachment-items',
      isSubsection: true
    });
  }
  
  if (seccionesCompetenciasComplementaria.length > 0) {
    data.modulos.push({
      titulo: 'Competencias & Referencias + Complementaria',
      subtitulo: 'Evaluación integral y datos adicionales',
      secciones: seccionesCompetenciasComplementaria,
      moduleType: 'competencias-complementaria',
      priority: 3,
      allowSplit: true,
      pageType: 'sidebar' // Equivale a "Panel derecho Página 3"
    });
  }
  
  // ================================================================================
  // MÓDULO 4 · CONCLUSIONES
  // ================================================================================
  const seccionesConclusiones = [];
  
  if (data.informe) {
    // Informe de entrevista
    if (data.informe.entrevistaPersonal) {
      seccionesConclusiones.push({
        nombre: 'Informe de Entrevista',
        tipo: 'texto',
        contenido: data.informe.entrevistaPersonal,
        priority: 1,
        breakable: true,
        minHeight: 100,
        blockType: 'interview-paragraphs'
      });
    }
    
    // Valoración final
    if (data.informe.valoracion) {
      seccionesConclusiones.push({
        nombre: 'Valoración Final',
        tipo: 'texto',
        contenido: data.informe.valoracion,
        priority: 2,
        breakable: true,
        minHeight: 100,
        blockType: 'evaluation-paragraphs'
      });
    }
    
    // Potencial (si existe)
    if (data.informe.potencial) {
      seccionesConclusiones.push({
        nombre: 'Potencial',
        tipo: 'texto',
        contenido: data.informe.potencial,
        priority: 3,
        breakable: true,
        blockType: 'potential-paragraphs'
      });
    }
    
    // Puntuación global
    if (data.informe.puntuacion) {
      seccionesConclusiones.push({
        nombre: 'Puntuación Global',
        tipo: 'puntuacion-final', // Tipo especial para bloque numérico
        puntuacion: data.informe.puntuacion,
        maxPuntuacion: 10,
        priority: 4,
        breakable: false,
        minHeight: 60,
        blockType: 'numeric-score'
      });
    }
  }
  
  if (seccionesConclusiones.length > 0) {
    data.modulos.push({
      titulo: 'Conclusiones',
      subtitulo: 'Evaluación final y recomendaciones',
      secciones: seccionesConclusiones,
      moduleType: 'conclusiones',
      priority: 4,
      allowSplit: false, // Las conclusiones deben ir completas
      pageType: 'closing' // Cierre del informe
    });
  }
  
  // Asegurar que los arrays existen (para compatibilidad)
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
  
  // Inyectar información de layout con metadata para FASES 2-7
  data.__layout = {
    isLandscape,
    totalChars,
    totalItems,
    estimatedPages: Math.ceil((totalChars + totalItems * 100) / 3000),
    // Metadata para FASE 2 - Motor de Cálculo
    moduleCount: data.modulos.length,
    requiresMeasurement: true,
    // Metadata para FASE 3 - Distribución Inteligente
    distributionStrategy: 'adaptive',
    // Metadata para FASE 4 - Continuidad Contextual
    enableContinuationHeaders: true
  };
  
  // Inyectar el CSS como string
  data.styles = req.template.styles || '';
  
  req.data = data;
}

// REGISTRAR TODOS LOS HELPERS PARA HANDLEBARS EN JSREPORT
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
    debug
  };
}

