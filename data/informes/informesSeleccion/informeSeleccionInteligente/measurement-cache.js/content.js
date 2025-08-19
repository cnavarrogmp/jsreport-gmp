/**
 * MEASUREMENT CACHE - SISTEMA DE CACHE INTELIGENTE CON TTL
 * FASE 2 - Cache optimizado para mediciones con tiempo de vida
 * 
 * Este sistema de cache evita recálculos innecesarios almacenando
 * mediciones previas con un tiempo de vida configurable (TTL).
 */

(function() {
  'use strict';
  
  /**
   * Sistema de cache con tiempo de vida para mediciones
   */
  class MeasurementCache {
    constructor(options = {}) {
      // Configuración predeterminada
      this.config = {
        ttl: options.ttl || 300000,           // 5 minutos por defecto
        maxSize: options.maxSize || 1000,     // Máximo 1000 entradas
        cleanupInterval: options.cleanupInterval || 60000, // Limpieza cada minuto
        enableStats: options.enableStats !== false // Estadísticas habilitadas
      };
      
      // Almacenes principales
      this.cache = new Map();
      this.timestamps = new Map();
      this.accessCount = new Map();
      
      // Estadísticas
      this.stats = {
        hits: 0,
        misses: 0,
        evictions: 0,
        expirations: 0,
        totalSaved: 0 // Tiempo total ahorrado en ms
      };
      
      // Iniciar limpieza automática
      this.startAutoCleanup();
      
      console.log('🗄️ [FASE 2] MeasurementCache inicializado', this.config);
    }
    
    /**
     * Genera una clave única para el cache
     * @param {string} type - Tipo de elemento
     * @param {Object} params - Parámetros adicionales
     * @returns {string} Clave única
     */
    generateKey(type, params = {}) {
      const sortedParams = Object.keys(params)
        .sort()
        .map(key => `${key}:${params[key]}`)
        .join('|');
      
      return `${type}#${sortedParams}`;
    }
    
    /**
     * Almacena un valor en cache
     * @param {string} key - Clave única
     * @param {*} value - Valor a almacenar
     * @param {number} customTTL - TTL personalizado (opcional)
     */
    set(key, value, customTTL = null) {
      // Verificar límite de tamaño
      if (this.cache.size >= this.config.maxSize) {
        this.evictOldest();
      }
      
      // Almacenar valor y timestamp
      this.cache.set(key, value);
      this.timestamps.set(key, Date.now());
      this.accessCount.set(key, 0);
      
      // Si hay TTL personalizado, almacenarlo
      if (customTTL !== null) {
        this.cache.set(`${key}_ttl`, customTTL);
      }
      
      console.log(`💾 [FASE 2] Cache SET: ${key}`);
    }
    
    /**
     * Obtiene un valor del cache
     * @param {string} key - Clave a buscar
     * @returns {*} Valor almacenado o null si no existe/expiró
     */
    get(key) {
      // Verificar si existe
      if (!this.cache.has(key)) {
        this.stats.misses++;
        return null;
      }
      
      // Verificar si expiró
      if (this.isExpired(key)) {
        this.stats.expirations++;
        this.delete(key);
        return null;
      }
      
      // Actualizar estadísticas
      this.stats.hits++;
      const accessCount = this.accessCount.get(key) || 0;
      this.accessCount.set(key, accessCount + 1);
      
      return this.cache.get(key);
    }
    
    /**
     * Obtiene o calcula un valor
     * @param {string} key - Clave a buscar
     * @param {Function} calculator - Función para calcular si no está en cache
     * @returns {Promise<*>} Valor desde cache o calculado
     */
    async getOrCalculate(key, calculator) {
      const startTime = performance.now();
      
      // Intentar obtener del cache
      const cached = this.get(key);
      if (cached !== null) {
        const savedTime = performance.now() - startTime;
        this.stats.totalSaved += savedTime;
        console.log(`⚡ [FASE 2] Cache HIT: ${key} (${savedTime.toFixed(2)}ms ahorrados)`);
        return cached;
      }
      
      // Calcular nuevo valor
      console.log(`🔄 [FASE 2] Cache MISS: ${key} - calculando...`);
      const value = await calculator();
      
      // Almacenar en cache
      this.set(key, value);
      
      const calcTime = performance.now() - startTime;
      console.log(`📊 [FASE 2] Calculado y cacheado: ${key} (${calcTime.toFixed(2)}ms)`);
      
      return value;
    }
    
    /**
     * Verifica si una entrada ha expirado
     * @param {string} key - Clave a verificar
     * @returns {boolean} True si expiró
     */
    isExpired(key) {
      const timestamp = this.timestamps.get(key);
      if (!timestamp) return true;
      
      const customTTL = this.cache.get(`${key}_ttl`);
      const ttl = customTTL !== null ? customTTL : this.config.ttl;
      
      return Date.now() - timestamp > ttl;
    }
    
    /**
     * Elimina una entrada del cache
     * @param {string} key - Clave a eliminar
     */
    delete(key) {
      this.cache.delete(key);
      this.cache.delete(`${key}_ttl`);
      this.timestamps.delete(key);
      this.accessCount.delete(key);
    }
    
    /**
     * Limpia todas las entradas expiradas
     * @returns {number} Número de entradas eliminadas
     */
    cleanup() {
      let cleaned = 0;
      
      for (const [key] of this.cache) {
        // Saltar claves de TTL
        if (key.endsWith('_ttl')) continue;
        
        if (this.isExpired(key)) {
          this.delete(key);
          cleaned++;
        }
      }
      
      if (cleaned > 0) {
        console.log(`🧹 [FASE 2] Cache cleanup: ${cleaned} entradas expiradas eliminadas`);
      }
      
      return cleaned;
    }
    
    /**
     * Desaloja la entrada más antigua
     */
    evictOldest() {
      let oldestKey = null;
      let oldestTime = Date.now();
      
      for (const [key, timestamp] of this.timestamps) {
        if (timestamp < oldestTime) {
          oldestTime = timestamp;
          oldestKey = key;
        }
      }
      
      if (oldestKey) {
        this.delete(oldestKey);
        this.stats.evictions++;
        console.log(`🗑️ [FASE 2] Cache eviction: ${oldestKey} (más antiguo)`);
      }
    }
    
    /**
     * Desaloja las entradas menos usadas (LRU)
     * @param {number} count - Número de entradas a desalojar
     */
    evictLRU(count = 1) {
      // Ordenar por frecuencia de acceso
      const sorted = Array.from(this.accessCount.entries())
        .sort((a, b) => a[1] - b[1]);
      
      for (let i = 0; i < Math.min(count, sorted.length); i++) {
        const [key] = sorted[i];
        this.delete(key);
        this.stats.evictions++;
        console.log(`🗑️ [FASE 2] Cache LRU eviction: ${key}`);
      }
    }
    
    /**
     * Inicia la limpieza automática
     */
    startAutoCleanup() {
      if (this.cleanupTimer) return;
      
      this.cleanupTimer = setInterval(() => {
        this.cleanup();
      }, this.config.cleanupInterval);
    }
    
    /**
     * Detiene la limpieza automática
     */
    stopAutoCleanup() {
      if (this.cleanupTimer) {
        clearInterval(this.cleanupTimer);
        this.cleanupTimer = null;
      }
    }
    
    /**
     * Limpia todo el cache
     */
    clear() {
      this.cache.clear();
      this.timestamps.clear();
      this.accessCount.clear();
      console.log('🧹 [FASE 2] Cache completamente limpiado');
    }
    
    /**
     * Obtiene estadísticas del cache
     * @returns {Object} Estadísticas actuales
     */
    getStats() {
      const hitRate = this.stats.hits / (this.stats.hits + this.stats.misses) || 0;
      
      return {
        ...this.stats,
        hitRate: (hitRate * 100).toFixed(2) + '%',
        size: this.cache.size,
        maxSize: this.config.maxSize,
        utilization: ((this.cache.size / this.config.maxSize) * 100).toFixed(2) + '%'
      };
    }
    
    /**
     * Exporta el contenido del cache para persistencia
     * @returns {Object} Contenido serializable del cache
     */
    export() {
      const data = {
        cache: {},
        timestamps: {},
        accessCount: {}
      };
      
      for (const [key, value] of this.cache) {
        // Solo exportar valores serializables
        if (typeof value !== 'function') {
          data.cache[key] = value;
        }
      }
      
      for (const [key, value] of this.timestamps) {
        data.timestamps[key] = value;
      }
      
      for (const [key, value] of this.accessCount) {
        data.accessCount[key] = value;
      }
      
      return data;
    }
    
    /**
     * Importa contenido previamente exportado
     * @param {Object} data - Datos a importar
     */
    import(data) {
      if (!data || typeof data !== 'object') return;
      
      // Limpiar cache actual
      this.clear();
      
      // Importar datos
      if (data.cache) {
        Object.entries(data.cache).forEach(([key, value]) => {
          this.cache.set(key, value);
        });
      }
      
      if (data.timestamps) {
        Object.entries(data.timestamps).forEach(([key, value]) => {
          this.timestamps.set(key, value);
        });
      }
      
      if (data.accessCount) {
        Object.entries(data.accessCount).forEach(([key, value]) => {
          this.accessCount.set(key, value);
        });
      }
      
      console.log(`📥 [FASE 2] Cache importado: ${this.cache.size} entradas`);
    }
    
    /**
     * Precalienta el cache con valores comunes
     * @param {Array} entries - Array de {key, value} para precalentar
     */
    warmup(entries) {
      let warmed = 0;
      
      entries.forEach(({ key, value, ttl }) => {
        if (!this.cache.has(key)) {
          this.set(key, value, ttl);
          warmed++;
        }
      });
      
      console.log(`🔥 [FASE 2] Cache warmed up: ${warmed} entradas añadidas`);
    }
  }
  
  // Instancia singleton global
  let globalCache = null;
  
  /**
   * Obtiene o crea la instancia global del cache
   * @param {Object} options - Opciones de configuración
   * @returns {MeasurementCache} Instancia del cache
   */
  function getGlobalCache(options = {}) {
    if (!globalCache) {
      globalCache = new MeasurementCache(options);
    }
    return globalCache;
  }
  
  // Exponer globalmente
  if (typeof window !== 'undefined') {
    window.MeasurementCache = MeasurementCache;
    window.getMeasurementCache = getGlobalCache;
  }
  
  // Para Node.js / JSReport
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MeasurementCache, getGlobalCache };
  }
  
})();