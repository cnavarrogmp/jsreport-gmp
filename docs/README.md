# JSReport Testing Framework

## Estructura del Proyecto

```
D:\Docker\Jsreport\
├── data/                           # Datos JSReport (templates, assets, configs)
├── scripts/                        # Scripts de testing y desarrollo
│   ├── test-template-interactive.js # Script interactivo para probar templates
│   └── deploy-test-pipeline.js     # Pipeline de testing automatizado
├── test-data/                      # Datos de prueba en formato JSON
│   └── datos-estructura-real.json  # Datos reales de Alberto Delgado Ortiz
├── docs/                           # Documentación del proyecto
│   └── README.md                   # Este archivo
├── docker-compose.yml              # Configuración Docker
└── jsreport.config.json           # Configuración JSReport
```

## Scripts Disponibles

### 1. Test Template Interactive (`scripts/test-template-interactive.js`)

Script interactivo para probar templates individualmente.

**Uso desde el directorio raíz:**
```bash
node scripts/test-template-interactive.js
```

**Características:**
- ✅ Detecta automáticamente templates disponibles
- ✅ Carga datos de prueba desde `test-data/`
- ✅ Genera PDFs en el directorio configurado
- ✅ Manejo de errores completo
- ✅ Interfaz interactiva por consola

### 2. Deploy Test Pipeline (`scripts/deploy-test-pipeline.js`)

Pipeline automatizado para testing masivo.

**Uso desde el directorio raíz:**
```bash  
node scripts/deploy-test-pipeline.js
```

## Datos de Prueba

### Estructura de `test-data/`

- `datos-estructura-real.json`: Datos completos de candidato real
  - Incluye: datos personales, experiencias, formaciones, competencias, referencias
  - Formato: JSON estructurado según API JSReport
  - Usado para: Testing completo de templates

## Configuración

### Archivo `jsreport.config.json`
Configuración principal de JSReport con extensiones y configuraciones de seguridad.

### Variables de Entorno
Los scripts usan estas configuraciones por defecto:
- JSReport URL: `http://localhost:5488`
- Usuario: `admin`  
- Password: `admin`
- Directorio salida: `D:\Carmen\Escritorio\PRUEBAS DOCUMENTOS API`

## Flujo de Trabajo Recomendado

1. **Desarrollo de Template:**
   ```bash
   # Reiniciar JSReport si hay cambios
   docker-compose restart
   
   # Probar template específico
   node scripts/test-template-interactive.js
   ```

2. **Testing Completo:**
   ```bash
   # Ejecutar pipeline completo
   node scripts/deploy-test-pipeline.js
   ```

3. **Debug de Datos:**
   - Modificar `test-data/datos-estructura-real.json`
   - Añadir más archivos JSON en `test-data/`
   - Los scripts detectarán automáticamente nuevos archivos

## Notas Importantes

- ⚠️ **Siempre ejecutar desde el directorio raíz** (`D:\Docker\Jsreport\`)
- ⚠️ **Reiniciar Docker después de cambios en templates**
- ⚠️ **Los archivos JSON en raíz están deprecated**, usar `test-data/`