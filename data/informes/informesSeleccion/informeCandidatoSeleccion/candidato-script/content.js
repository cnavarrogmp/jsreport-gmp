// Script controlador - Solo prepara datos
// Los helpers se cargan automáticamente desde informeCandidatoTemplate/helpers.js

function beforeRender(req, res, done) {
    // NO necesitamos registrar helpers aquí
    // JSReport carga automáticamente helpers.js desde la carpeta del template
    
    // Lógica de preparación de datos (controlador)
    if (req.data) {
        // Asegurar que los arrays existen para evitar errores en el template
        var arrays = ['experienciasLaborales', 'formaciones', 'competencias', 'referencias'];
        arrays.forEach(function(key) {
            if (!req.data[key]) {
                req.data[key] = [];
            }
        });

        // Añadir metadatos del informe
        req.data.fechaGeneracion = new Date().toISOString();
        
        // Aquí podrías añadir más lógica de negocio cuando crezca:
        // - Validación de datos
        // - Cálculos agregados  
        // - Enriquecimiento de datos
        // - Logging para debugging: console.log('Data:', req.data);
    }

    // Continuar con el renderizado
    done();
}