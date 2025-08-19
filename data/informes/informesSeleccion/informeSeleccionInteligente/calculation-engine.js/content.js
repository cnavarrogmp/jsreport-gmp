/**
 * CALCULATION ENGINE - MOTOR DE CÁLCULO AVANZADO
 * FASE 2 - Motor de Cálculo con Phantom Render
 * 
 * Este motor realiza pre-cálculos de layout mediante renderizado invisible
 * para determinar medidas exactas antes del render final del PDF.
 */

(function() {
  'use strict';
  
  /**
   * Motor de renderizado fantasma para pre-cálculo de medidas
   */
  class PhantomRenderer {
    constructor() {
      this.phantomContainer = null;
      this.measurements = new Map();
      this.pageMetrics = {
        pageHeight: 297 * 3.78, // A4 en píxeles
        pageWidth: 210 * 3.78,
        marginTop: 68,
        marginBottom: 76,
        marginLeft: 60,
        marginRight: 60,
        usableHeight: 0,
        usableWidth: 0
      };
      
      // Calcular área útil
      this.pageMetrics.usableHeight = this.pageMetrics.pageHeight - 
        this.pageMetrics.marginTop - this.pageMetrics.marginBottom;
      this.pageMetrics.usableWidth = this.pageMetrics.pageWidth - 
        this.pageMetrics.marginLeft - this.pageMetrics.marginRight;
    }
    
    /**
     * Pre-calcula el layout completo antes del render real
     * @param {Object} data - Datos del informe
     * @returns {Promise<Object>} Mediciones calculadas
     */
    async preCalculate(data) {
      console.log('👻 [FASE 2] Iniciando PhantomRenderer pre-cálculo');
      
      try {
        // Crear contenedor invisible
        this.createPhantomContainer();
        
        // Renderizar contenido invisible
        await this.renderPhantomContent(data);
        
        // Medir todos los elementos
        const measurements = this.measureAllElements();
        
        // Calcular distribución óptima
        const distribution = this.calculateOptimalDistribution(measurements);
        
        // Limpiar
        this.destroyPhantomContainer();
        
        console.log('✅ [FASE 2] PhantomRenderer completado', {
          totalElements: measurements.length,
          estimatedPages: distribution.pageCount
        });
        
        return {
          measurements,
          distribution,
          pageMetrics: this.pageMetrics
        };
        
      } catch (error) {
        console.error('❌ [FASE 2] Error en PhantomRenderer:', error);
        this.destroyPhantomContainer();
        throw error;
      }
    }
    
    /**
     * Crea el contenedor invisible para renderizado fantasma
     */
    createPhantomContainer() {
      if (this.phantomContainer) return;
      
      this.phantomContainer = document.createElement('div');
      this.phantomContainer.id = 'phantom-renderer';
      this.phantomContainer.style.cssText = `
        position: absolute;
        left: -9999px;
        top: -9999px;
        width: ${this.pageMetrics.pageWidth}px;
        visibility: hidden;
        overflow: hidden;
      `;
      
      // Clonar estilos del documento
      this.cloneStyles();
      
      document.body.appendChild(this.phantomContainer);
    }
    
    /**
     * Clona los estilos del documento al contenedor fantasma
     */
    cloneStyles() {
      const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
      styles.forEach(style => {
        this.phantomContainer.appendChild(style.cloneNode(true));
      });
    }
    
    /**
     * Renderiza el contenido en el contenedor fantasma
     * @param {Object} data - Datos a renderizar
     */
    async renderPhantomContent(data) {
      if (!data.modulos) {
        console.warn('⚠️ [FASE 2] No hay módulos para pre-calcular');
        return;
      }
      
      // Crear estructura HTML simplificada
      const html = this.buildPhantomHTML(data);
      this.phantomContainer.innerHTML += html;
      
      // Esperar a que el contenido se renderice
      await this.waitForRender();
    }
    
    /**
     * Construye HTML simplificado para medición
     * @param {Object} data - Datos del informe
     * @returns {string} HTML para phantom render
     */
    buildPhantomHTML(data) {
      let html = '<div class="phantom-content">';
      
      // Portada
      html += '<div class="module cover-page" data-module="cover">Portada</div>';
      
      // Módulos
      data.modulos.forEach((modulo, index) => {
        html += `<div class="module" data-module="${index}" data-type="${modulo.moduleType}">`;
        html += `<h2 class="module-title">${modulo.titulo || 'Módulo ' + (index + 1)}</h2>`;
        
        // Secciones del módulo
        if (modulo.secciones) {
          modulo.secciones.forEach((seccion, secIndex) => {
            html += `<div class="section" data-section="${secIndex}">`;
            html += `<h3 class="section-title">${seccion.titulo || ''}</h3>`;
            
            // Contenido de la sección (simplificado)
            if (seccion.items && seccion.items.length > 0) {
              seccion.items.forEach((item, itemIndex) => {
                html += `<div class="section-item" data-item="${itemIndex}">`;
                html += this.generateItemContent(item, seccion.tipo);
                html += '</div>';
              });
            }
            
            html += '</div>';
          });
        }
        
        html += '</div>';
      });
      
      html += '</div>';
      return html;
    }
    
    /**
     * Genera contenido para un ítem según su tipo
     * @param {Object} item - Ítem a generar
     * @param {string} tipo - Tipo de sección
     * @returns {string} HTML del ítem
     */
    generateItemContent(item, tipo) {
      // Simular contenido según tipo para medición precisa
      switch(tipo) {
        case 'experiencia':
          return `
            <div class="experience-item">
              <h4>${item.empresa || 'Empresa'}</h4>
              <p>${item.puesto || 'Puesto'}</p>
              <p>${item.funciones || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'}</p>
            </div>
          `;
        
        case 'formacion':
          return `
            <div class="education-item">
              <h4>${item.titulo || 'Título'}</h4>
              <p>${item.centro || 'Centro'}</p>
            </div>
          `;
        
        case 'competencias':
          return `
            <div class="competency-card">
              <span>${item.nombre || 'Competencia'}</span>
              <span>${item.nivel || '8'}/10</span>
            </div>
          `;
        
        default:
          return `<p>${item.descripcion || item.texto || 'Contenido'}</p>`;
      }
    }
    
    /**
     * Espera a que el contenido se renderice
     */
    async waitForRender() {
      return new Promise(resolve => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve);
        });
      });
    }
    
    /**
     * Mide todos los elementos del phantom render
     * @returns {Array} Array de mediciones
     */
    measureAllElements() {
      const measurements = [];
      const elements = this.phantomContainer.querySelectorAll('.module, .section, .section-item');
      
      elements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const styles = window.getComputedStyle(element);
        
        const measurement = {
          type: element.className,
          moduleIndex: element.dataset.module,
          sectionIndex: element.dataset.section,
          itemIndex: element.dataset.item,
          height: rect.height,
          width: rect.width,
          marginTop: parseFloat(styles.marginTop),
          marginBottom: parseFloat(styles.marginBottom),
          paddingTop: parseFloat(styles.paddingTop),
          paddingBottom: parseFloat(styles.paddingBottom),
          totalHeight: rect.height + parseFloat(styles.marginTop) + parseFloat(styles.marginBottom),
          breakInside: styles.breakInside || styles.pageBreakInside,
          content: element.textContent.substring(0, 100) // Primeros 100 chars para debug
        };
        
        measurements.push(measurement);
      });
      
      console.log(`📏 [FASE 2] Medidas capturadas: ${measurements.length} elementos`);
      return measurements;
    }
    
    /**
     * Calcula la distribución óptima de contenido en páginas
     * @param {Array} measurements - Mediciones de elementos
     * @returns {Object} Distribución calculada
     */
    calculateOptimalDistribution(measurements) {
      const distribution = {
        pages: [],
        pageCount: 0,
        breakPoints: [],
        orphanedHeaders: []
      };
      
      let currentPage = {
        elements: [],
        usedHeight: 0,
        remainingHeight: this.pageMetrics.usableHeight
      };
      
      measurements.forEach((element, index) => {
        const elementHeight = element.totalHeight;
        
        // Verificar si el elemento cabe en la página actual
        if (elementHeight <= currentPage.remainingHeight) {
          // Verificar regla de cabecera + contenido mínimo
          if (this.isHeader(element)) {
            // Buscar siguiente elemento de contenido
            const nextContent = measurements[index + 1];
            const minRequiredSpace = elementHeight + (nextContent ? nextContent.totalHeight * 0.3 : 50);
            
            if (minRequiredSpace > currentPage.remainingHeight) {
              // No hay espacio suficiente para cabecera + contenido mínimo
              console.log(`📄 [FASE 2] Forzando salto: cabecera huérfana detectada`);
              distribution.orphanedHeaders.push(index);
              
              // Finalizar página actual
              distribution.pages.push(currentPage);
              distribution.breakPoints.push(index);
              
              // Iniciar nueva página
              currentPage = {
                elements: [],
                usedHeight: 0,
                remainingHeight: this.pageMetrics.usableHeight
              };
            }
          }
          
          // Añadir elemento a la página actual
          currentPage.elements.push(element);
          currentPage.usedHeight += elementHeight;
          currentPage.remainingHeight -= elementHeight;
          
        } else {
          // El elemento no cabe, crear nueva página
          distribution.pages.push(currentPage);
          distribution.breakPoints.push(index);
          
          currentPage = {
            elements: [element],
            usedHeight: elementHeight,
            remainingHeight: this.pageMetrics.usableHeight - elementHeight
          };
        }
      });
      
      // Añadir última página
      if (currentPage.elements.length > 0) {
        distribution.pages.push(currentPage);
      }
      
      distribution.pageCount = distribution.pages.length;
      
      console.log(`📊 [FASE 2] Distribución calculada: ${distribution.pageCount} páginas`);
      return distribution;
    }
    
    /**
     * Verifica si un elemento es una cabecera
     * @param {Object} element - Elemento a verificar
     * @returns {boolean} True si es cabecera
     */
    isHeader(element) {
      return element.type.includes('title') || 
             element.type.includes('header') ||
             (element.type.includes('module') && !element.itemIndex);
    }
    
    /**
     * Destruye el contenedor fantasma
     */
    destroyPhantomContainer() {
      if (this.phantomContainer && this.phantomContainer.parentNode) {
        this.phantomContainer.parentNode.removeChild(this.phantomContainer);
        this.phantomContainer = null;
      }
    }
  }
  
  /**
   * Motor de cálculo principal que coordina el pre-renderizado
   */
  class CalculationEngine {
    constructor() {
      this.phantomRenderer = new PhantomRenderer();
      this.results = null;
    }
    
    /**
     * Ejecuta el motor de cálculo completo
     * @param {Object} data - Datos del informe
     * @returns {Promise<Object>} Resultados del cálculo
     */
    async execute(data) {
      console.log('🚀 [FASE 2] Iniciando CalculationEngine');
      
      try {
        // Ejecutar phantom render
        this.results = await this.phantomRenderer.preCalculate(data);
        
        // Inyectar resultados en los datos
        this.injectCalculations(data);
        
        console.log('✅ [FASE 2] CalculationEngine completado exitosamente');
        return this.results;
        
      } catch (error) {
        console.error('❌ [FASE 2] Error en CalculationEngine:', error);
        throw error;
      }
    }
    
    /**
     * Inyecta los cálculos en los datos originales
     * @param {Object} data - Datos del informe
     */
    injectCalculations(data) {
      if (!this.results || !data.__layout) return;
      
      // Añadir información de cálculo a __layout
      data.__layout.calculations = {
        performed: true,
        timestamp: new Date().toISOString(),
        pageCount: this.results.distribution.pageCount,
        breakPoints: this.results.distribution.breakPoints,
        orphanedHeaders: this.results.distribution.orphanedHeaders,
        measurements: this.results.measurements.length
      };
      
      console.log('💉 [FASE 2] Cálculos inyectados en __layout');
    }
  }
  
  // Exponer globalmente
  if (typeof window !== 'undefined') {
    window.PhantomRenderer = PhantomRenderer;
    window.CalculationEngine = CalculationEngine;
  }
  
  // Para Node.js / JSReport
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PhantomRenderer, CalculationEngine };
  }
  
})();