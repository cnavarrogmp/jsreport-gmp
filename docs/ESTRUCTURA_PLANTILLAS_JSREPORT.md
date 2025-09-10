# Guía de Estructura y Convenciones para Plantillas JSReport

## 📋 Introducción
Este documento establece las convenciones y estructura estándar que deben seguir todas las plantillas creadas para JSReport en este proyecto. Es fundamental seguir estas directrices para asegurar el correcto funcionamiento de las plantillas.

## 📁 Estructura de Directorios

Todas las plantillas deben ubicarse en: `data/informes/informesSeleccion/`

```
data/informes/informesSeleccion/
└── [NombrePlantilla]/
    ├── [NombrePlantilla]Template/        # Carpeta del template principal
    │   ├── content.handlebars            # Template HTML con sintaxis Handlebars
    │   ├── helpers.js                     # Funciones helper de Handlebars
    │   └── config.json                    # Configuración del template
    │
    ├── [NombrePlantilla]Data/             # Carpeta de datos de ejemplo
    │   ├── dataJson.json                  # ⚠️ CRÍTICO: Debe llamarse exactamente "dataJson.json"
    │   └── config.json                    # Configuración del data source
    │
    ├── [NombrePlantilla]-script/          # Carpeta de scripts (opcional)
    │   ├── content.js                     # Script beforeRender para procesamiento
    │   └── config.json                    # Configuración del script
    │
    └── [NombrePlantilla]-styles.css/      # Carpeta de estilos CSS
        ├── content.css                    # Archivo de estilos CSS
        └── config.json                    # Configuración del asset CSS
```

## ⚠️ Puntos Críticos y Errores Comunes

### 1. Nomenclatura del Archivo de Datos
- ✅ **CORRECTO**: `dataJson.json`
- ❌ **INCORRECTO**: `content.json`, `data.json`, o cualquier otro nombre
- **Razón**: JSReport busca específicamente el archivo `dataJson.json` en la carpeta del data source

### 2. Configuración del Data Source
El archivo `[NombrePlantilla]Data/config.json` debe tener exactamente esta estructura:

```json
{
    "name": "[NombrePlantilla]Data",
    "shortid": "[UniqueShortId]",
    "creationDate": {
        "$$date": 1725819600000
    },
    "modificationDate": {
        "$$date": 1725819600000
    },
    "inheritedReadPermissions": [],
    "inheritedEditPermissions": [],
    "_id": "[unique_id]",
    "$entitySet": "data"
}
```

### 3. Configuración del Template
El archivo `[NombrePlantilla]Template/config.json` debe incluir:

```json
{
    "name": "[NombrePlantilla]Template",
    "engine": "handlebars",
    "recipe": "chrome-pdf",
    "data": {
        "shortid": "[ShortIdDelDataSource]"  // Debe coincidir con el shortid del data source
    },
    "shortid": "[UniqueTemplateShortId]",
    "chrome": {
        "printBackground": true,
        "waitForJS": false,
        "waitForNetworkIdle": false,
        "format": "A4",
        "marginTop": "16mm",
        "marginBottom": "16mm",
        "marginLeft": "16mm",
        "marginRight": "16mm",
        "displayHeaderFooter": false
    },
    "scripts": [
        {
            "shortid": "[ScriptShortId]"  // Si se usa script beforeRender
        }
    ],
    "$entitySet": "templates"
}
```

## 📝 Convenciones de Nomenclatura

| Componente | Convención | Ejemplo |
|------------|------------|---------|
| Carpeta principal | `[NombrePlantilla]` | `informeCandidatoSeleccion` |
| Template | `[NombrePlantilla]Template` | `informeCandidatoTemplate` |
| Data source | `[NombrePlantilla]Data` | `informeCandidatoSeleccionData` |
| Script | `[NombrePlantilla]-script` | `candidato-script` |
| Estilos | `[NombrePlantilla]-styles.css` | `candidato-styles.css` |

## 🔧 Estructura del Script beforeRender

Si se requiere procesamiento previo al renderizado:

```javascript
// Script controlador - Solo prepara datos
// Los helpers se cargan automáticamente desde [NombrePlantilla]Template/helpers.js

function beforeRender(req, res, done) {
    // NO registrar helpers aquí - JSReport los carga automáticamente
    
    // Lógica de preparación de datos
    if (req.data) {
        // Asegurar que los arrays existen
        var arrays = ['array1', 'array2', 'array3'];
        arrays.forEach(function(key) {
            if (!req.data[key]) {
                req.data[key] = [];
            }
        });

        // Añadir metadatos o transformaciones
        req.data.fechaGeneracion = new Date().toISOString();
        
        // Aquí se puede añadir:
        // - Validación de datos
        // - Cálculos agregados  
        // - Enriquecimiento de datos
        // - Logging: console.log('Data:', req.data);
    }

    // Continuar con el renderizado
    done();
}
```

## 📦 Estructura del Archivo de Datos (dataJson.json)

El archivo debe contener un JSON válido con la estructura de datos que espera el template:

```json
{
    "campo1": "valor",
    "campo2": 123,
    "arrayDatos": [
        {
            "item": "valor1"
        },
        {
            "item": "valor2"
        }
    ],
    "objetoAnidado": {
        "propiedad1": "valor",
        "propiedad2": true
    }
}
```

## 🚀 Pasos para Crear una Nueva Plantilla

1. **Crear estructura de carpetas** siguiendo la nomenclatura establecida
2. **Crear archivo `dataJson.json`** con datos de ejemplo (NO `content.json`)
3. **Configurar los archivos `config.json`** de cada componente
4. **Desarrollar el template** en `content.handlebars`
5. **Añadir helpers** si son necesarios en `helpers.js`
6. **Crear estilos CSS** en la carpeta correspondiente
7. **Implementar script beforeRender** si se requiere procesamiento previo
8. **Probar en JSReport Studio** antes de desplegar

## 🔍 Verificación y Debugging

### Errores Comunes y Soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| `"[object Object]" is not valid JSON` | Archivo de datos mal nombrado | Renombrar a `dataJson.json` |
| `Failed to parse data json` | JSON malformado | Validar JSON con herramientas online |
| Template no encuentra datos | shortid incorrecto | Verificar que coincida el shortid en config.json |
| Helpers no funcionan | Ubicación incorrecta | Colocar en `[Template]/helpers.js` |

### Comandos Útiles para Validación

```bash
# Validar JSON
node -e "JSON.parse(require('fs').readFileSync('path/to/dataJson.json', 'utf8'))"

# Listar estructura
ls -la data/informes/informesSeleccion/[NombrePlantilla]/

# Sincronizar y reiniciar JSReport
node scripts/jsreport-sync-and-restart.js
```

## 📌 Notas Importantes

1. **Siempre** usar `dataJson.json` como nombre del archivo de datos
2. **Nunca** usar `content.json` para los datos
3. Los helpers se cargan automáticamente desde la carpeta del template
4. El script beforeRender es opcional, solo si se necesita procesamiento
5. Mantener consistencia en la nomenclatura para facilitar el mantenimiento

## 🔄 Actualización del Documento

- **Última actualización**: 10/09/2025
- **Versión**: 1.0
- **Autor**: Equipo de Desarrollo JSReport

---

*Este documento debe ser consultado y seguido por todo el equipo al crear nuevas plantillas para JSReport.*