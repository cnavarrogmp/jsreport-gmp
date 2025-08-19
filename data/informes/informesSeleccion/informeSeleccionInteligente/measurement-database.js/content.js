/**
 * MEASUREMENT DATABASE - BASE DE DATOS DE MEDIDAS ESTÁNDAR
 * FASE 2 - Catálogo de medidas típicas por tipo de elemento
 * 
 * Esta base de datos contiene medidas estándar pre-calculadas
 * para optimizar el cálculo de layouts sin necesidad de renderizado completo.
 */

(function() {
  'use strict';
  
  /**
   * Base de datos de medidas estándar para elementos típicos
   * Todas las medidas están en píxeles
   */
  const MEASUREMENT_DATABASE = {
    // Módulos principales
    'module': {
      'cover-page': {
        min: 800,
        avg: 1000,
        max: 1122,  // Altura completa A4
        description: 'Portada completa del informe'
      },
      'presentacion': {
        min: 200,
        avg: 350,
        max: 500,
        description: 'Módulo de presentación del candidato'
      },
      'experiencia': {
        min: 300,
        avg: 600,
        max: 1200,
        description: 'Módulo de experiencia laboral'
      },
      'formacion': {
        min: 150,
        avg: 300,
        max: 500,
        description: 'Módulo de formación académica'
      },
      'competencias': {
        min: 200,
        avg: 400,
        max: 600,
        description: 'Módulo de competencias y habilidades'
      },
      'conclusiones': {
        min: 250,
        avg: 450,
        max: 700,
        description: 'Módulo de conclusiones y valoración'
      }
    },
    
    // Cabeceras
    'headers': {
      'module-title': {
        min: 40,
        avg: 48,
        max: 56,
        marginBottom: 16,
        description: 'Título de módulo (h2)'
      },
      'section-title': {
        min: 28,
        avg: 32,
        max: 40,
        marginBottom: 12,
        description: 'Título de sección (h3)'
      },
      'subsection-title': {
        min: 20,
        avg: 24,
        max: 28,
        marginBottom: 8,
        description: 'Título de subsección (h4)'
      }
    },
    
    // Elementos de contenido
    'content': {
      'experience-item': {
        min: 80,
        avg: 120,
        max: 200,
        marginBottom: 16,
        description: 'Ítem de experiencia laboral'
      },
      'education-item': {
        min: 60,
        avg: 90,
        max: 120,
        marginBottom: 12,
        description: 'Ítem de formación académica'
      },
      'competency-card': {
        min: 50,
        avg: 70,
        max: 90,
        marginBottom: 8,
        description: 'Tarjeta de competencia'
      },
      'reference-item': {
        min: 40,
        avg: 60,
        max: 80,
        marginBottom: 8,
        description: 'Ítem de referencia'
      },
      'paragraph': {
        min: 40,
        avg: 60,
        max: 100,
        marginBottom: 12,
        description: 'Párrafo de texto estándar'
      },
      'bullet-point': {
        min: 20,
        avg: 30,
        max: 50,
        marginBottom: 4,
        description: 'Punto de lista'
      }
    },
    
    // Elementos especiales
    'special': {
      'candidate-header': {
        min: 100,
        avg: 120,
        max: 150,
        marginBottom: 20,
        description: 'Cabecera con foto y datos del candidato'
      },
      'evaluation-box': {
        min: 150,
        avg: 200,
        max: 300,
        marginBottom: 16,
        description: 'Caja de evaluación con puntuación'
      },
      'chart': {
        min: 200,
        avg: 250,
        max: 350,
        marginBottom: 16,
        description: 'Gráfico o visualización'
      },
      'table-row': {
        min: 24,
        avg: 32,
        max: 48,
        marginBottom: 0,
        description: 'Fila de tabla'
      }
    },
    
    // Espaciados y márgenes típicos
    'spacing': {
      'module-gap': 32,
      'section-gap': 24,
      'item-gap': 16,
      'paragraph-gap': 12,
      'line-gap': 8
    },
    
    // Configuración de página A4
    'page': {
      'A4': {
        width: 794,  // 210mm en 96dpi
        height: 1122, // 297mm en 96dpi
        marginTop: 68,
        marginBottom: 76,
        marginLeft: 60,
        marginRight: 60,
        usableWidth: 674,
        usableHeight: 978
      },
      'A4-landscape': {
        width: 1122,
        height: 794,
        marginTop: 60,
        marginBottom: 60,
        marginLeft: 76,
        marginRight: 76,
        usableWidth: 970,
        usableHeight: 674
      }
    }
  };
  
  /**
   * Clase para gestionar y consultar la base de datos de medidas
   */
  class MeasurementDatabase {
    constructor() {
      this.db = MEASUREMENT_DATABASE;
      this.customMeasurements = new Map();
    }
    
    /**
     * Obtiene la medida estimada para un tipo de elemento
     * @param {string} category - Categoría del elemento
     * @param {string} type - Tipo específico
     * @param {string} metric - Métrica a obtener (min, avg, max)
     * @returns {number|null} Medida en píxeles o null si no existe
     */
    getMeasurement(category, type, metric = 'avg') {
      if (!this.db[category] || !this.db[category][type]) {
        return this.getCustomMeasurement(category, type, metric);
      }
      
      return this.db[category][type][metric] || null;
    }
    
    /**
     * Estima la altura total de un conjunto de elementos
     * @param {Array} elements - Array de elementos con tipo y cantidad
     * @returns {number} Altura total estimada en píxeles
     */
    estimateTotalHeight(elements) {
      let totalHeight = 0;
      
      elements.forEach(element => {
        const { category, type, count = 1, metric = 'avg' } = element;
        const measurement = this.getMeasurement(category, type, metric);
        
        if (measurement) {
          const marginBottom = this.db[category]?.[type]?.marginBottom || 0;
          totalHeight += (measurement + marginBottom) * count;
        }
      });
      
      return totalHeight;
    }
    
    /**
     * Calcula si un contenido cabe en el espacio disponible
     * @param {Array} elements - Elementos a medir
     * @param {number} availableSpace - Espacio disponible en píxeles
     * @returns {boolean} True si cabe, false si no
     */
    fitsInSpace(elements, availableSpace) {
      const estimatedHeight = this.estimateTotalHeight(elements);
      return estimatedHeight <= availableSpace;
    }
    
    /**
     * Obtiene las dimensiones de página según orientación
     * @param {boolean} isLandscape - Si es orientación horizontal
     * @returns {Object} Métricas de página
     */
    getPageMetrics(isLandscape = false) {
      return isLandscape ? this.db.page['A4-landscape'] : this.db.page['A4'];
    }
    
    /**
     * Registra una medida personalizada
     * @param {string} key - Clave única para la medida
     * @param {Object} measurement - Objeto con medidas
     */
    registerCustomMeasurement(key, measurement) {
      this.customMeasurements.set(key, measurement);
      console.log(`📐 [FASE 2] Medida personalizada registrada: ${key}`);
    }
    
    /**
     * Obtiene una medida personalizada
     * @param {string} category - Categoría
     * @param {string} type - Tipo
     * @param {string} metric - Métrica
     * @returns {number|null} Medida o null
     */
    getCustomMeasurement(category, type, metric = 'avg') {
      const key = `${category}.${type}`;
      const custom = this.customMeasurements.get(key);
      return custom?.[metric] || null;
    }
    
    /**
     * Aprende de mediciones reales para mejorar estimaciones
     * @param {string} category - Categoría del elemento
     * @param {string} type - Tipo específico
     * @param {number} realMeasurement - Medida real observada
     */
    learnFromMeasurement(category, type, realMeasurement) {
      const key = `${category}.${type}`;
      let custom = this.customMeasurements.get(key) || { 
        min: realMeasurement, 
        max: realMeasurement, 
        avg: realMeasurement,
        samples: []
      };
      
      // Actualizar estadísticas
      custom.samples.push(realMeasurement);
      custom.min = Math.min(custom.min, realMeasurement);
      custom.max = Math.max(custom.max, realMeasurement);
      custom.avg = custom.samples.reduce((a, b) => a + b, 0) / custom.samples.length;
      
      // Limitar samples a últimos 100 para no consumir memoria
      if (custom.samples.length > 100) {
        custom.samples = custom.samples.slice(-100);
      }
      
      this.customMeasurements.set(key, custom);
      
      console.log(`📊 [FASE 2] Aprendizaje: ${key} actualizado con medida real ${realMeasurement}px`);
    }
    
    /**
     * Exporta las medidas aprendidas para persistencia
     * @returns {Object} Medidas personalizadas aprendidas
     */
    exportLearnedMeasurements() {
      const learned = {};
      this.customMeasurements.forEach((value, key) => {
        learned[key] = {
          min: value.min,
          avg: Math.round(value.avg),
          max: value.max,
          samples: value.samples.length
        };
      });
      return learned;
    }
    
    /**
     * Importa medidas aprendidas previamente
     * @param {Object} learned - Medidas a importar
     */
    importLearnedMeasurements(learned) {
      Object.keys(learned).forEach(key => {
        this.customMeasurements.set(key, learned[key]);
      });
      console.log(`📥 [FASE 2] Importadas ${Object.keys(learned).length} medidas aprendidas`);
    }
  }
  
  // Exponer globalmente
  if (typeof window !== 'undefined') {
    window.MeasurementDatabase = MeasurementDatabase;
    window.MEASUREMENT_DATABASE = MEASUREMENT_DATABASE;
  }
  
  // Para Node.js / JSReport
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MeasurementDatabase, MEASUREMENT_DATABASE };
  }
  
})();