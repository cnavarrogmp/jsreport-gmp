/**
 * ========================================================================
 * SISTEMA DE CONTROL DE RENDERIZADO - INFORME INTELIGENTE
 * ========================================================================
 * Versión: 4.0
 * Fecha: 2025-01-09
 * Autor: Sistema de Control Arquitectónico
 * 
 * PROPÓSITO:
 * Este módulo es el CEREBRO del sistema de renderizado. Controla qué módulos
 * se renderizan, cuándo y cómo. Implementa validación de contenido, detección
 * de continuaciones y generación de headers contextuales.
 * 
 * CARACTERÍSTICAS:
 * - Control determinístico de módulos
 * - Validación de contenido antes de renderizar
 * - Sistema de headers contextuales (FASE 4)
 * - Módulo de debug/prueba controlado
 * - Logging detallado para debugging
 * ========================================================================
 */

const RenderController = {
  /**
   * ====================================================================
   * CONFIGURACIÓN DE MÓDULOS
   * ====================================================================
   * Define todos los módulos del informe con sus reglas de validación
   * y renderizado. Cada módulo tiene:
   * - id: Identificador único
   * - enabled: Si está activo o no
   * - required: Si es obligatorio (aparece aunque esté vacío)
   * - minContent: Mínimo de caracteres para considerarlo válido
   * - sections: Secciones de datos que componen el módulo
   * - validation: Reglas de validación específicas
   * ====================================================================
   */
  modules: {
    // MÓDULO 0: PORTADA
    portada: {
      id: 0,
      enabled: true,
      required: true,
      minContent: 0,
      sections: [],
      validation: {
        checkFields: [],
        checkMinItems: 0
      },
      title: 'PORTADA',
      description: 'Portada introductoria del informe'
    },

    // MÓDULO 1: PRESENTACIÓN
    presentacion: {
      id: 1,
      enabled: true,
      required: true,
      minContent: 100,
      sections: ['datosPersonales', 'datosDestacados'],
      validation: {
        checkFields: ['nombreCompleto', 'email'],
        checkMinItems: 0
      },
      title: 'PRESENTACIÓN DEL CANDIDATO',
      description: 'Datos personales y aspectos destacados'
    },

    // MÓDULO 2: EXPERIENCIA
    experiencia: {
      id: 2,
      enabled: true,
      required: false,
      minContent: 200,
      sections: ['experienciasLaborales', 'formaciones'],
      validation: {
        checkFields: ['empresa', 'puesto'],
        checkMinItems: 1
      },
      title: 'EXPERIENCIA Y FORMACIÓN',
      description: 'Historial laboral y educativo'
    },

    // MÓDULO 3: COMPETENCIAS
    competencias: {
      id: 3,
      enabled: true,
      required: false,
      minContent: 150,
      sections: ['competencias', 'idiomas', 'habilidades'],
      validation: {
        checkFields: ['nombre', 'nivel'],
        checkMinItems: 1
      },
      title: 'COMPETENCIAS Y HABILIDADES',
      description: 'Evaluación de competencias, idiomas y habilidades'
    },

    // MÓDULO 4: CONCLUSIONES
    conclusiones: {
      id: 4,
      enabled: true,
      required: true,
      minContent: 100,
      sections: ['referencias', 'observaciones', 'recomendaciones'],
      validation: {
        checkFields: [],
        checkMinItems: 0
      },
      title: 'CONCLUSIONES Y REFERENCIAS',
      description: 'Referencias profesionales y observaciones finales'
    },

    // MÓDULO 99: PRUEBA/DEBUG
    prueba: {
      id: 99,
      enabled: false, // CAMBIAR A true PARA ACTIVAR
      required: false,
      minContent: 0,
      sections: [],
      validation: {
        checkFields: [],
        checkMinItems: 0
      },
      title: '🧪 MÓDULO DE PRUEBA Y DEBUG',
      description: 'Panel de control y verificación del sistema',
      // Configuración especial para debug
      debug: true,
      showInProduction: false,
      showCondition: 'development' // 'always', 'development', 'never'
    }
  },

  /**
   * ====================================================================
   * TRACKING DE PÁGINAS (FASE 4)
   * ====================================================================
   * Sistema para rastrear qué módulos aparecen en cada página
   * y detectar continuaciones
   * ====================================================================
   */
  pageTracking: {},
  currentPage: 1,

  /**
   * ====================================================================
   * FUNCIÓN: validateModule
   * ====================================================================
   * Valida si un módulo debe renderizarse basándose en:
   * 1. Si está habilitado
   * 2. Si tiene contenido suficiente
   * 3. Si cumple las reglas de validación
   * 
   * @param {string} moduleName - Nombre del módulo a validar
   * @param {object} data - Datos del candidato
   * @param {string} environment - Ambiente (production/development)
   * @returns {boolean} - true si el módulo debe renderizarse
   * ====================================================================
   */
  validateModule(moduleName, data, environment = 'production') {
    const module = this.modules[moduleName];
    
    if (!module) {
      console.log(`❌ Módulo ${moduleName} no existe en la configuración`);
      return false;
    }

    // LOG: Inicio de validación
    console.log(`\n📋 Validando módulo: ${moduleName}`);
    console.log(`   Ambiente: ${environment}`);
    console.log(`   Habilitado: ${module.enabled}`);
    console.log(`   Requerido: ${module.required}`);

    // PASO 1: Verificar si está habilitado
    if (!module.enabled) {
      console.log(`   ❌ Módulo deshabilitado`);
      return false;
    }

    // PASO 2: Lógica especial para módulos de debug
    if (module.debug) {
      if (environment === 'production' && !module.showInProduction) {
        console.log(`   🧪 Módulo debug oculto en producción`);
        return false;
      }

      switch (module.showCondition) {
        case 'always':
          console.log(`   🧪 Módulo debug SIEMPRE visible`);
          return true;
        case 'development':
          const showInDev = environment === 'development';
          console.log(`   🧪 Módulo debug ${showInDev ? 'visible' : 'oculto'} (solo development)`);
          return showInDev;
        case 'never':
          console.log(`   🧪 Módulo debug NUNCA visible`);
          return false;
        default:
          return module.enabled;
      }
    }

    // PASO 3: Validar contenido para módulos normales
    let totalContent = 0;
    let hasValidItems = false;
    let sectionDetails = [];

    for (const sectionName of module.sections) {
      const sectionData = data[sectionName];
      let sectionInfo = { name: sectionName, valid: false, reason: '' };

      if (!sectionData) {
        sectionInfo.reason = 'No existe';
        sectionDetails.push(sectionInfo);
        continue;
      }

      // Validar arrays
      if (Array.isArray(sectionData)) {
        const itemCount = sectionData.length;
        
        if (itemCount < module.validation.checkMinItems) {
          sectionInfo.reason = `Solo ${itemCount} items (min: ${module.validation.checkMinItems})`;
        } else if (itemCount === 0) {
          sectionInfo.reason = 'Array vacío';
        } else {
          // Verificar que los items tengan contenido real
          const validItems = sectionData.filter(item => {
            if (!item) return false;
            const content = JSON.stringify(item);
            return content.length > 20 && content !== '{}';
          });

          if (validItems.length > 0) {
            sectionInfo.valid = true;
            sectionInfo.reason = `${validItems.length} items válidos`;
            hasValidItems = true;
            totalContent += JSON.stringify(validItems).length;
          } else {
            sectionInfo.reason = 'Items sin contenido válido';
          }
        }
      }
      // Validar objetos
      else if (typeof sectionData === 'object') {
        const hasContent = Object.values(sectionData).some(val => 
          val && val.toString().trim().length > 0
        );

        if (hasContent) {
          // Verificar campos requeridos si existen
          if (module.validation.checkFields.length > 0) {
            const missingFields = module.validation.checkFields.filter(field => 
              !sectionData[field] || sectionData[field].toString().trim().length === 0
            );

            if (missingFields.length > 0) {
              sectionInfo.reason = `Faltan campos: ${missingFields.join(', ')}`;
            } else {
              sectionInfo.valid = true;
              sectionInfo.reason = 'Objeto válido';
              hasValidItems = true;
              totalContent += JSON.stringify(sectionData).length;
            }
          } else {
            sectionInfo.valid = true;
            sectionInfo.reason = 'Objeto con contenido';
            hasValidItems = true;
            totalContent += JSON.stringify(sectionData).length;
          }
        } else {
          sectionInfo.reason = 'Objeto vacío';
        }
      }
      // Validar strings
      else if (typeof sectionData === 'string') {
        if (sectionData.trim().length > 0) {
          sectionInfo.valid = true;
          sectionInfo.reason = `String (${sectionData.length} chars)`;
          hasValidItems = true;
          totalContent += sectionData.length;
        } else {
          sectionInfo.reason = 'String vacío';
        }
      }

      sectionDetails.push(sectionInfo);
    }

    // LOG: Detalles de secciones
    console.log(`   Secciones analizadas:`);
    sectionDetails.forEach(section => {
      console.log(`     - ${section.name}: ${section.valid ? '✅' : '❌'} ${section.reason}`);
    });
    console.log(`   Contenido total: ${totalContent} caracteres (min: ${module.minContent})`);

    // PASO 4: Decisión final
    let shouldRender = false;

    if (module.required) {
      // Módulos requeridos siempre se renderizan
      shouldRender = true;
      console.log(`   ✅ Módulo REQUERIDO - se renderizará`);
    } else if (totalContent >= module.minContent && hasValidItems) {
      // Módulos opcionales solo si tienen contenido suficiente
      shouldRender = true;
      console.log(`   ✅ Módulo con contenido suficiente - se renderizará`);
    } else {
      console.log(`   ❌ Módulo sin contenido suficiente - NO se renderizará`);
    }

    return shouldRender;
  },

  /**
   * ====================================================================
   * FUNCIÓN: prepareModuleData
   * ====================================================================
   * Prepara los datos de un módulo antes de renderizar
   * Organiza la información y calcula métricas
   * 
   * @param {string} moduleName - Nombre del módulo
   * @param {object} data - Datos del candidato
   * @returns {object} - Datos preparados del módulo
   * ====================================================================
   */
  prepareModuleData(moduleName, data) {
    const module = this.modules[moduleName];
    
    if (!module) {
      console.log(`❌ Error: Módulo ${moduleName} no encontrado`);
      return null;
    }

    const moduleData = {
      id: module.id,
      name: moduleName,
      title: module.title,
      description: module.description,
      sections: [],
      isEmpty: true,
      contentLength: 0,
      isDebug: module.debug || false
    };

    // Recopilar datos de cada sección
    for (const sectionName of module.sections) {
      const sectionData = data[sectionName];
      
      if (sectionData && this.hasValidContent(sectionData)) {
        moduleData.sections.push({
          name: sectionName,
          data: sectionData,
          itemCount: Array.isArray(sectionData) ? sectionData.length : 1,
          contentLength: JSON.stringify(sectionData).length
        });
        moduleData.isEmpty = false;
        moduleData.contentLength += JSON.stringify(sectionData).length;
      }
    }

    console.log(`📦 Módulo ${moduleName} preparado:`, {
      isEmpty: moduleData.isEmpty,
      sections: moduleData.sections.length,
      contentLength: moduleData.contentLength
    });

    return moduleData;
  },

  /**
   * ====================================================================
   * FUNCIÓN: detectContinuation
   * ====================================================================
   * Detecta si un módulo es continuación del anterior (FASE 4)
   * 
   * @param {number} pageNumber - Número de página actual
   * @param {string} moduleName - Nombre del módulo
   * @returns {object} - Información de continuación
   * ====================================================================
   */
  detectContinuation(pageNumber, moduleName) {
    const previousPage = this.pageTracking[pageNumber - 1];
    
    if (previousPage && previousPage.lastModule === moduleName) {
      return {
        isContinuation: true,
        startedOnPage: previousPage.moduleStartPage || pageNumber - 1,
        continuationNumber: (previousPage.continuationCount || 0) + 1
      };
    }

    // Registrar nuevo módulo en la página
    if (!this.pageTracking[pageNumber]) {
      this.pageTracking[pageNumber] = {};
    }
    this.pageTracking[pageNumber].lastModule = moduleName;
    this.pageTracking[pageNumber].moduleStartPage = pageNumber;

    return {
      isContinuation: false,
      startedOnPage: pageNumber,
      continuationNumber: 0
    };
  },

  /**
   * ====================================================================
   * FUNCIÓN: generateContextualHeader
   * ====================================================================
   * Genera headers contextuales con información de continuación
   * 
   * @param {object} context - Contexto del header
   * @returns {object} - Header generado
   * ====================================================================
   */
  generateContextualHeader(context) {
    const { moduleName, sectionName, pageNumber } = context;
    const module = this.modules[moduleName];
    
    if (!module) {
      return {
        main: moduleName.toUpperCase(),
        subtitle: '',
        breadcrumb: moduleName
      };
    }

    const continuationInfo = this.detectContinuation(pageNumber || 1, moduleName);
    
    if (continuationInfo.isContinuation) {
      return {
        main: module.title,
        subtitle: `(continuación de página ${continuationInfo.startedOnPage})`,
        breadcrumb: `${module.title} › Parte ${continuationInfo.continuationNumber + 1}`,
        isContinuation: true
      };
    }

    return {
      main: module.title,
      subtitle: sectionName || module.description,
      breadcrumb: module.title,
      isContinuation: false
    };
  },

  /**
   * ====================================================================
   * FUNCIÓN: hasValidContent
   * ====================================================================
   * Verifica si un dato tiene contenido válido
   * 
   * @param {any} data - Dato a verificar
   * @returns {boolean} - true si tiene contenido válido
   * ====================================================================
   */
  hasValidContent(data) {
    if (!data) return false;
    
    // Arrays
    if (Array.isArray(data)) {
      return data.length > 0 && data.some(item => {
        if (!item) return false;
        if (typeof item === 'object') {
          return Object.values(item).some(val => 
            val && val.toString().trim().length > 0
          );
        }
        return item.toString().trim().length > 0;
      });
    }
    
    // Objetos
    if (typeof data === 'object') {
      return Object.values(data).some(val => 
        val && val.toString().trim().length > 0
      );
    }
    
    // Strings y otros
    return data.toString().trim().length > 0;
  },

  /**
   * ====================================================================
   * FUNCIÓN: getModuleStats
   * ====================================================================
   * Obtiene estadísticas del sistema de módulos
   * Para debugging y monitoreo
   * 
   * @param {object} data - Datos del candidato
   * @returns {object} - Estadísticas del sistema
   * ====================================================================
   */
  getModuleStats(data) {
    const stats = {
      totalModules: Object.keys(this.modules).length,
      enabledModules: 0,
      requiredModules: 0,
      modulesWithContent: 0,
      modulesToRender: 0,
      details: []
    };

    Object.entries(this.modules).forEach(([name, module]) => {
      if (module.enabled) stats.enabledModules++;
      if (module.required) stats.requiredModules++;
      
      const hasContent = this.validateModule(name, data, 'development');
      if (hasContent) {
        stats.modulesWithContent++;
        if (module.enabled) stats.modulesToRender++;
      }

      stats.details.push({
        name: name,
        enabled: module.enabled,
        required: module.required,
        hasContent: hasContent,
        willRender: module.enabled && hasContent
      });
    });

    return stats;
  },

  /**
   * ====================================================================
   * FUNCIÓN: setDebugMode
   * ====================================================================
   * Activa/desactiva el modo debug
   * 
   * @param {boolean} enabled - true para activar debug
   * ====================================================================
   */
  setDebugMode(enabled) {
    this.modules.prueba.enabled = enabled;
    console.log(`🧪 Modo debug ${enabled ? 'ACTIVADO' : 'DESACTIVADO'}`);
  },

  /**
   * ====================================================================
   * FUNCIÓN: resetPageTracking
   * ====================================================================
   * Reinicia el tracking de páginas
   * Llamar al inicio de cada generación de PDF
   * ====================================================================
   */
  resetPageTracking() {
    this.pageTracking = {};
    this.currentPage = 1;
    console.log('📄 Tracking de páginas reiniciado');
  }
};

/**
 * ====================================================================
 * EXPORTACIÓN DEL MÓDULO
 * ====================================================================
 */
module.exports = RenderController;