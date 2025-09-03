/**
 * CONFIGURACIÓN DE LOGGING
 * Sistema centralizado de logging para desarrollo/producción
 */

// Detectar entorno (puede configurarse vía variable de entorno en JSReport)
const IS_DEVELOPMENT = typeof process !== 'undefined' && 
  (process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true');

/**
 * Logger centralizado con niveles
 */
class Logger {
  constructor(enabled = IS_DEVELOPMENT) {
    this.enabled = enabled;
    this.levels = {
      ERROR: 'error',
      WARN: 'warn',
      INFO: 'info',
      DEBUG: 'debug'
    };
  }

  log(level, message, ...args) {
    if (!this.enabled && level !== this.levels.ERROR) {
      return;
    }

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    switch (level) {
      case this.levels.ERROR:
        console.error(prefix, message, ...args);
        break;
      case this.levels.WARN:
        if (this.enabled) console.warn(prefix, message, ...args);
        break;
      case this.levels.INFO:
        if (this.enabled) console.info(prefix, message, ...args);
        break;
      case this.levels.DEBUG:
        if (this.enabled) console.log(prefix, message, ...args);
        break;
    }
  }

  error(message, ...args) {
    this.log(this.levels.ERROR, message, ...args);
  }

  warn(message, ...args) {
    this.log(this.levels.WARN, message, ...args);
  }

  info(message, ...args) {
    this.log(this.levels.INFO, message, ...args);
  }

  debug(message, ...args) {
    this.log(this.levels.DEBUG, message, ...args);
  }
}

// Exportar instancia única (Singleton)
const logger = new Logger();

// Para compatibilidad con JSReport
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { logger, Logger };
}