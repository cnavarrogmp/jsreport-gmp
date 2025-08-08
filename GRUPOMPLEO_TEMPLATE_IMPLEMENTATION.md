# GRUPOMPLEO - Template de Informe de Candidatos JSReport

## 📋 RESUMEN DEL PROYECTO

**Template JSReport profesional para informes de evaluación de candidatos en el sector industrial, diseñado específicamente para GRUPOMPLEO con layout horizontal optimizado y sistema de grilla base 8px.**

### ✨ Características Principales
- **Layout Horizontal (Landscape)**: Maximiza información en formato A4 apaisado
- **Sistema de Grilla 8px**: Espaciado consistente y profesional
- **Renderizado Condicional**: Módulos aparecen solo si tienen contenido
- **3 Opciones de Headers Contextuales**: Para continuidad entre páginas
- **Diseño Industrial Moderno**: Paleta de colores profesional
- **Portada Independiente**: Con elementos gráficos industriales

---

## 🎨 PROPUESTAS DE HEADERS CONTEXTUALES

### **OPCIÓN A: Sticky Header Superior** ⭐ RECOMENDADA
```css
.sticky-header {
    position: fixed;
    top: 0;
    background: rgba(30, 41, 59, 0.95);
    backdrop-filter: blur(10px);
}
```
**Ventajas:** Referencia constante, profesional, no interfiere con contenido
**Implementación:** Activar/desactivar en CSS línea 285

### **OPCIÓN B: Breadcrumb Contextual**
```css
.breadcrumb-context-overlay {
    position: absolute;
    top: var(--space-2);
    background: var(--color-gray-100);
}
```
**Ventajas:** Discreto, aparece solo cuando es necesario
**Implementación:** Activar/desactivar en CSS línea 305

### **OPCIÓN C: Badge Flotante Inteligente** 💡 INNOVADORA
```css
.context-badge {
    position: fixed;
    top: var(--space-2);
    right: var(--space-2);
    background: var(--color-accent);
    border-radius: 50px;
}
```
**Ventajas:** Mínimo impacto visual, aparece automáticamente
**Implementación:** Activar/desactivar en CSS línea 320

---

## 📂 ESTRUCTURA DE ARCHIVOS GENERADA

```
data/informes/informesSeleccion/informeSeleccionGRUPOMPLEO/
├── 📄 config.json                    # Configuración de carpeta
├── 📁 template/
│   ├── 📄 config.json               # Configuración template principal
│   ├── 📄 content.handlebars        # HTML principal (MAIN)
│   ├── 📄 style.css                 # Estilos con grilla 8px
│   └── 📄 helpers.js                # Helpers Handlebars
├── 📁 portada/
│   ├── 📄 config.json               # Configuración portada
│   └── 📄 content.handlebars        # HTML portada industrial
└── 📁 data/
    ├── 📄 config.json               # Configuración datos
    └── 📄 dataJson.json             # JSON de ejemplo
```

---

## ⚙️ INSTRUCCIONES DE IMPLEMENTACIÓN

### **PASO 1: Configuración JSReport**
1. **Copiar archivos** a la carpeta JSReport Studio
2. **Configurar template principal**:
   - Engine: `handlebars`
   - Recipe: `chrome-pdf`
   - Format: `A4 landscape`
   - printBackground: `true`

### **PASO 2: Configuración de Headers Contextuales**
Elegir UNA de las 3 opciones editando el archivo `style.css`:

#### ✅ Para activar OPCIÓN A (Sticky Header):
```css
.sticky-header {
    display: block; /* Cambiar de 'display: none' */
}
```

#### ✅ Para activar OPCIÓN B (Breadcrumb):
```css
.breadcrumb-context-overlay {
    display: block; /* Cambiar de 'display: none' */
}
```

#### ✅ Para activar OPCIÓN C (Badge):
```css
.context-badge {
    display: flex; /* Cambiar de 'display: none' */
}
```

### **PASO 3: Personalización de Colores**
Editar variables CSS en `style.css` líneas 13-40:
```css
:root {
    --color-primary: #1e293b;      /* Azul corporativo */
    --color-accent: #f59e0b;       /* Amber GRUPOMPLEO */
    --color-success: #059669;      /* Verde industrial */
}
```

### **PASO 4: Configuración de Datos**
1. **Usar el JSON de ejemplo** en `dataJson.json`
2. **Adaptar estructura** según tus datos reales
3. **Verificar campos obligatorios**:
   - `datosPersonales.nombreCompleto`
   - `fechaPublicacion`
   - `informe.puntuacion`

### **PASO 5: Testing y Ajustes**
1. **Generar PDF de prueba** con datos de ejemplo
2. **Verificar renderizado condicional** eliminando secciones del JSON
3. **Ajustar márgenes** si es necesario en config.json:
```json
"margin": {
    "top": "0.5in",
    "right": "0.5in", 
    "bottom": "0.5in",
    "left": "0.5in"
}
```

---

## 🎯 SISTEMA DE GRILLA 8PX

### **Espaciados Disponibles:**
```css
--space-1: 8px;    /* Espaciado mínimo */
--space-2: 16px;   /* Espaciado base */
--space-3: 24px;   /* Espaciado medio */
--space-4: 32px;   /* Espaciado grande */
--space-6: 48px;   /* Espaciado extra */
--space-8: 64px;   /* Espaciado máximo */
```

### **Grilla Responsiva:**
```css
.main-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);  /* 4 columnas base */
    gap: var(--space-2);
}

.module.span-2 { grid-column: span 2; }    /* 2 columnas */
.module.span-full { grid-column: 1 / -1; }  /* Ancho completo */
```

---

## 🔧 HELPERS DE HANDLEBARS INCLUIDOS

### **Renderizado Condicional:**
- `{{#if (or condicion1 condicion2)}}` - OR lógico
- `{{#if (and condicion1 condicion2)}}` - AND lógico
- `{{#if (hasContent array)}}` - Verificar contenido
- `{{#if (isEmpty variable)}}` - Verificar vacío

### **Formateo de Fechas:**
- `{{formatDate fecha 'year'}}` - Solo año
- `{{formatDate fecha 'date'}}` - Fecha completa
- `{{dateRange fechaInicio fechaFin}}` - Rango de fechas

### **Formateo de Texto:**
- `{{#each (splitParagraphs texto)}}` - Dividir en párrafos
- `{{truncate texto 100}}` - Truncar texto
- `{{capitalize texto}}` - Primera letra mayúscula

### **Arrays y Números:**
- `{{count array}}` - Contar elementos
- `{{formatScore puntuacion}}` - Formatear puntuación
- `{{#each (sortBy array 'campo')}}` - Ordenar array

---

## 🎨 PALETA DE COLORES INDUSTRIAL

```css
/* Colores Principales */
--color-primary: #1e293b;     /* Azul oscuro industrial */
--color-secondary: #475569;   /* Gris medio profesional */
--color-accent: #f59e0b;      /* Amber GRUPOMPLEO */

/* Colores de Estado */
--color-success: #059669;     /* Verde industrial */
--color-warning: #d97706;     /* Naranja precaución */
--color-error: #dc2626;       /* Rojo alerta */

/* Escala de Grises */
--color-gray-50: #f8fafc;     /* Fondo claro */
--color-gray-100: #f1f5f9;    /* Fondo secciones */
--color-gray-200: #e2e8f0;    /* Bordes */
--color-gray-400: #a0aec0;    /* Texto secundario */
--color-gray-800: #1a202c;    /* Texto principal */
```

---

## 📋 MÓDULOS DEL INFORME

### **1. Información Personal** 
- ✅ Datos de contacto
- ✅ Información demográfica  
- ✅ Renderizado condicional completo

### **2. Evaluación Profesional**
- ✅ Valoración general con párrafos
- ✅ Aspectos personales en cards
- ✅ Layout en grilla 2 columnas

### **3. Competencias**
- ✅ Puntuación visual con badges
- ✅ Observaciones en párrafos
- ✅ Control de saltos de página

### **4. Habilidades Técnicas**
- ✅ Idiomas en grid 3 columnas
- ✅ Aplicaciones informáticas
- ✅ Acreditaciones con horas

### **5. Experiencia Laboral**
- ✅ Tabla optimizada landscape
- ✅ Rangos de fechas automáticos
- ✅ Ancho completo (span-full)

### **6. Formación Académica**
- ✅ Tabla con niveles académicos
- ✅ Ordenación cronológica
- ✅ Tipografía diferenciada

### **7. Referencias Profesionales**
- ✅ Cards en grid 2 columnas
- ✅ Información de contacto
- ✅ Funciones realizadas

---

## 🚀 OPTIMIZACIONES IMPLEMENTADAS

### **Performance:**
- ✅ CSS minimalista optimizado para Chrome PDF
- ✅ Fonts Google optimizadas con preload
- ✅ Selectores CSS eficientes

### **Print-Friendly:**
- ✅ `page-break-inside: avoid` en elementos críticos
- ✅ Headers contextuales automáticos en impresión
- ✅ Colores y backgrounds preservados

### **Responsive:**
- ✅ Degradación graceful a 3, 2 y 1 columna
- ✅ Grids adaptables según viewport
- ✅ Tipografía escalable

---

## 🐛 TROUBLESHOOTING

### **Problema: Headers contextuales no aparecen**
**Solución:** Verificar que solo una opción esté activada en CSS

### **Problema: Elementos se cortan entre páginas**
**Solución:** Añadir `page-break-inside: avoid` al elemento

### **Problema: Fonts no cargan**
**Solución:** Verificar conexión a Google Fonts o usar fonts locales

### **Problema: Renderizado condicional no funciona**
**Solución:** Verificar helpers registrados en JSReport

### **Problema: Layout se rompe en algunos navegadores**
**Solución:** Usar Chrome para PDFs, verificar prefijos CSS

---

## 📞 SOPORTE TÉCNICO

Para modificaciones adicionales:
1. **CSS**: Editar `style.css` líneas específicas
2. **HTML**: Modificar `content.handlebars` 
3. **Helpers**: Extender `helpers.js`
4. **Datos**: Actualizar `dataJson.json`

**Estructura modular permite personalización sin afectar funcionalidad core.**

---

**© 2025 GRUPOMPLEO - Template Profesional JSReport v1.0**
**Optimizado para sector industrial | Layout horizontal | Sistema grilla 8px**