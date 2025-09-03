/**
 * SCRIPT DE NAVEGADOR PARA INFORME INTELIGENTE
 * FASE 2-3: Cálculo avanzado y optimización
 * Este código se ejecuta EN EL NAVEGADOR (Chrome PDF)
 */

// Variables globales para JSReport
window.jsreportReady = false;

/**
 * FASE 2: Inicialización del motor de cálculo avanzado
 */
function initializePhase2() {
  // Solo logging si está habilitado
  if (typeof window !== 'undefined' && window.DEBUG === true) {
    console.log('🚀 [FASE 2] Iniciando motor de cálculo en navegador');
  }
  
  try {
    // Verificar que tengamos los datos necesarios
    if (!window.reportData || !window.reportData.__layout) {
      if (window.DEBUG) console.warn('⚠️ [FASE 2] Datos de layout no disponibles');
      return false;
    }

    const layout = window.reportData.__layout;
    
    // Solo continuar si FASE 2 está habilitada
    if (!layout.fase2 || !layout.fase2.enabled) {
      if (window.DEBUG) console.log('ℹ️ [FASE 2] Motor avanzado deshabilitado');
      return false;
    }

    // Inicializar componentes de medición si están disponibles
    if (typeof MeasurementService !== 'undefined') {
      const measurementService = new MeasurementService();
      measurementService.initialize('phase2');
      if (window.DEBUG) console.log('✅ [FASE 2] MeasurementService inicializado');
    }

    if (typeof CalculationEngine !== 'undefined') {
      window.calculationEngine = new CalculationEngine();
      if (window.DEBUG) console.log('✅ [FASE 2] CalculationEngine inicializado');
    }

    return true;
  } catch (error) {
    if (window.DEBUG) console.error('❌ [FASE 2] Error en inicialización:', error);
    return false;
  }
}

/**
 * FASE 3: Optimización de distribución
 */
function optimizeLayout() {
  if (!window.calculationEngine) {
    return false;
  }

  try {
    // Aplicar optimizaciones de layout
    const modules = document.querySelectorAll('.module');
    modules.forEach((module, index) => {
      const moduleData = window.reportData.modulos[index];
      if (moduleData && moduleData.allowSplit) {
        // Permitir flujo natural para módulos que pueden dividirse
        module.style.breakInside = 'auto';
        module.style.pageBreakInside = 'auto';
      }
    });

    if (window.DEBUG) console.log('✅ [FASE 3] Optimización de layout aplicada');
    return true;
  } catch (error) {
    if (window.DEBUG) console.error('❌ [FASE 3] Error en optimización:', error);
    return false;
  }
}

/**
 * Función principal que se ejecuta cuando el DOM está listo
 */
function initializeReport() {
  // Esperar a que el DOM esté completamente cargado
  if (document.readyState !== 'complete') {
    setTimeout(initializeReport, 100);
    return;
  }

  try {
    // Inicializar FASE 2
    const phase2Success = initializePhase2();
    
    // Inicializar FASE 3 si FASE 2 fue exitosa
    if (phase2Success) {
      setTimeout(() => {
        optimizeLayout();
        
        // Marcar como listo para JSReport
        window.jsreportReady = true;
        
        // Enviar señal a JSReport si waitForJS está habilitado
        if (window.jsreportRender && typeof window.jsreportRender === 'function') {
          window.jsreportRender();
        }
        
        if (window.DEBUG) console.log('🏁 [SCRIPT] Informe listo para renderizado');
      }, 100);
    } else {
      // Si FASE 2 falla, continuar con renderizado básico
      window.jsreportReady = true;
      if (window.jsreportRender) {
        window.jsreportRender();
      }
    }
    
  } catch (error) {
    // En caso de error, no bloquear el renderizado
    console.error('❌ [SCRIPT] Error crítico:', error);
    window.jsreportReady = true;
    if (window.jsreportRender) {
      window.jsreportRender();
    }
  }
}

/**
 * Función para debugging - disponible en consola
 */
window.debugReport = function() {
  console.log('📊 Report Data:', window.reportData);
  console.log('🎛️ Layout Info:', window.reportData?.__layout);
  console.log('📄 Modules:', document.querySelectorAll('.module').length);
  console.log('⚡ JSReport Ready:', window.jsreportReady);
};

// Inicializar cuando el script se carga
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeReport);
} else {
  initializeReport();
}