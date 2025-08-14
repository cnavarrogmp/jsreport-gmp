/**
 * MEASUREMENT SERVICE - SERVICIO DE MEDICIÓN DINÁMICA
 * FASE 1 - Implementación básica
 * 
 * Este servicio se ejecuta en el navegador durante la generación del PDF
 * para realizar mediciones dinámicas del contenido y optimizar el layout.
 */

(function() {
  'use strict';
  
  /**
   * Servicio de medición para informes inteligentes
   */
  class MeasurementService {
    constructor() {
      this.cache = new Map();
      this.measurements = {
        elements: [],
        totalHeight: 0,
        pageBreaks: [],
        density: 0
      };
      this.config = {
        // Configuración de medición (FASE 1 - básica)
        pageHeight: 297 * 3.78, // A4 en píxeles (aprox)
        pageWidth: 210 * 3.78,
        marginTop: 68,  // 18mm
        marginBottom: 76, // 20mm
        marginLeft: 60,  // 16mm
        marginRight: 60, // 16mm
        
        // Umbrales para decisiones
        landscapeThreshold: 8000, // caracteres para landscape
        itemThreshold: 120,       // items para layout denso
        minContentAfterHeader: 100 // píxeles mínimos tras header
      };
      
      this.isInitialized = false;
    }
    
    /**
     * Inicializa el servicio de medición
     */
    initialize() {
      if (this.isInitialized) return;
      
      console.log('🔧 Inicializando MeasurementService - FASE 1');
      
      // Establecer variables CSS dinámicas
      this.setDynamicCSS();
      
      // Realizar mediciones iniciales
      this.performInitialMeasurements();
      
      // Optimizar orientación de página
      this.optimizePageOrientation();
      
      // Marcar como inicializado
      this.isInitialized = true;
      
      // Señalar que está listo para JSReport
      this.signalReady();
      
      console.log('✅ MeasurementService inicializado', this.measurements);
    }
    
    /**
     * Establece variables CSS dinámicas basadas en mediciones
     */
    setDynamicCSS() {
      const root = document.documentElement;
      
      // Calcular densidad de contenido
      const textElements = document.querySelectorAll('p, li, td');
      let totalText = 0;
      
      textElements.forEach(el => {
        totalText += (el.textContent || '').length;
      });
      
      this.measurements.density = totalText / textElements.length || 0;
      
      // Establecer variables CSS dinámicas
      root.style.setProperty('--content-density', this.measurements.density);
      root.style.setProperty('--total-elements', textElements.length);
      
      // Ajustar espaciado basado en densidad
      if (this.measurements.density > 100) {
        root.style.setProperty('--grid-scale', '0.8');
      } else if (this.measurements.density < 50) {
        root.style.setProperty('--grid-scale', '1.2');
      } else {
        root.style.setProperty('--grid-scale', '1.0');
      }
    }
    
    /**
     * Realiza mediciones iniciales de elementos clave
     */
    performInitialMeasurements() {
      // Medir módulos
      const modules = document.querySelectorAll('.module');
      
      modules.forEach((module, index) => {
        const measurement = this.measureElement(module, `module-${index}`);
        this.measurements.elements.push(measurement);
        this.measurements.totalHeight += measurement.height;
      });
      
      // Medir elementos que no deben romperse
      const noBreakElements = document.querySelectorAll('.no-break');
      
      noBreakElements.forEach((element, index) => {
        const measurement = this.measureElement(element, `no-break-${index}`);
        
        // Marcar como no divisible
        measurement.breakable = false;
        this.measurements.elements.push(measurement);
      });
      
      // Calcular puntos de ruptura naturales
      this.calculateBreakPoints();
    }
    
    /**
     * Mide un elemento DOM específico
     * @param {Element} element - Elemento a medir
     * @param {string} id - Identificador único
     * @returns {Object} Medición del elemento
     */
    measureElement(element, id) {
      // Usar cache si existe
      const cacheKey = `${id}-${element.outerHTML.length}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }
      
      const rect = element.getBoundingClientRect();
      const styles = window.getComputedStyle(element);
      
      const measurement = {
        id,
        element,
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
        marginTop: parseFloat(styles.marginTop) || 0,
        marginBottom: parseFloat(styles.marginBottom) || 0,
        paddingTop: parseFloat(styles.paddingTop) || 0,
        paddingBottom: parseFloat(styles.paddingBottom) || 0,
        breakable: !element.classList.contains('no-break'),
        breadcrumb: element.getAttribute('data-breadcrumb'),
        contentLength: (element.textContent || '').length,
        timestamp: Date.now()
      };
      
      // Calcular altura efectiva incluyendo márgenes
      measurement.effectiveHeight = measurement.height + 
                                   measurement.marginTop + 
                                   measurement.marginBottom;
      
      // Estimar complejidad del contenido
      measurement.complexity = this.calculateComplexity(element);
      
      // Guardar en cache
      this.cache.set(cacheKey, measurement);
      
      return measurement;
    }
    
    /**
     * Calcula la complejidad de un elemento
     * @param {Element} element - Elemento a analizar
     * @returns {number} Puntuación de complejidad (0-10)
     */
    calculateComplexity(element) {
      let complexity = 0;
      
      // Factores de complejidad
      const childElements = element.querySelectorAll('*').length;
      const textLength = (element.textContent || '').length;
      const hasImages = element.querySelectorAll('img').length > 0;
      const hasTables = element.querySelectorAll('table').length > 0;
      const hasLists = element.querySelectorAll('ul, ol').length > 0;
      
      // Cálculo de complejidad
      complexity += Math.min(childElements * 0.1, 3);
      complexity += Math.min(textLength / 1000, 3);
      complexity += hasImages ? 2 : 0;
      complexity += hasTables ? 2 : 0;
      complexity += hasLists ? 1 : 0;
      
      return Math.min(complexity, 10);
    }
    
    /**
     * Calcula puntos de ruptura naturales para paginación
     */
    calculateBreakPoints() {
      let currentPageHeight = 0;
      const availableHeight = this.config.pageHeight - 
                             this.config.marginTop - 
                             this.config.marginBottom;
      
      this.measurements.elements.forEach((element, index) => {
        currentPageHeight += element.effectiveHeight;
        
        // Si excede el espacio disponible, marcar punto de ruptura
        if (currentPageHeight > availableHeight) {
          this.measurements.pageBreaks.push({
            afterElement: index - 1,
            beforeElement: index,
            reason: 'height-exceeded',
            suggestedBreak: true
          });
          
          // Reiniciar contador para nueva página
          currentPageHeight = element.effectiveHeight;
        }
        
        // Si el elemento es muy complejo, sugerir no romper
        if (element.complexity > 7) {
          this.measurements.pageBreaks.push({
            element: index,
            reason: 'high-complexity',
            suggestedBreak: false,
            keepTogether: true
          });
        }
      });
    }
    
    /**
     * Optimiza la orientación de página basada en mediciones
     */
    optimizePageOrientation() {
      const body = document.body;
      let shouldUseLandscape = false;
      
      // Criterios para landscape (FASE 1 - básicos)
      const totalContent = this.measurements.elements.reduce(
        (sum, el) => sum + el.contentLength, 0
      );
      
      const wideElements = this.measurements.elements.filter(
        el => el.width > this.config.pageWidth * 0.8
      ).length;
      
      const tablesCount = document.querySelectorAll('table').length;
      
      // Decisión basada en múltiples factores
      shouldUseLandscape = (
        totalContent > this.config.landscapeThreshold ||
        wideElements > 5 ||
        tablesCount > 2 ||
        this.measurements.density > 150
      );
      
      // Aplicar orientación
      if (shouldUseLandscape) {
        body.classList.add('landscape');
        console.log('📄 Aplicando orientación landscape');
        
        // Recalcular con nuevas dimensiones
        setTimeout(() => {
          this.recalculateWithLandscape();
        }, 100);
      }
    }
    
    /**
     * Recalcula mediciones tras cambio a landscape
     */
    recalculateWithLandscape() {
      // Actualizar configuración para landscape
      const temp = this.config.pageHeight;
      this.config.pageHeight = this.config.pageWidth;
      this.config.pageWidth = temp;
      
      // Limpiar cache para recalcular
      this.cache.clear();
      
      // Recalcular puntos de ruptura
      this.calculateBreakPoints();
      
      console.log('🔄 Recalculado para landscape', this.measurements);
    }
    
    /**
     * Señala a JSReport que está listo para generar PDF
     */
    signalReady() {
      // Timeout de seguridad
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.JSREPORT_READY_TO_START = true;
          console.log('🚀 JSReport ready signal enviado');
        }
      }, 500);
    }
  }
  
  // Exponer MeasurementService globalmente
  if (typeof window !== 'undefined') {
    window.MeasurementService = MeasurementService;
    
    // Auto-inicializar si el DOM está listo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        const service = new MeasurementService();
        service.initialize();
      });
    } else {
      // DOM ya está listo
      setTimeout(() => {
        const service = new MeasurementService();
        service.initialize();
      }, 100);
    }
  }
  
  // Para Node.js / JSReport
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = MeasurementService;
  }
  
})();