// Script controlador - Actúa como intermediario entre JSReport y los helpers
const helpers = require('../informeCandidatoTemplate/helpers.js');

function beforeRender(req, res, done) {
    // Registrar los helpers importados para que Handlebars los use
    req.template.helpers = helpers;

    // Lógica de preparación de datos (controlador)
    if (req.data) {
        // Asegurar que los arrays existen para evitar errores en el template
        const arrays = ['experienciasLaborales', 'formaciones', 'competencias', 'referencias'];
        arrays.forEach(function(key) {
            if (!req.data[key]) {
                req.data[key] = [];
            }
        });

        // Añadir metadatos del informe
        req.data.fechaGeneracion = new Date().toISOString();
        
        // Aquí podrías añadir más lógica de negocio:
        // - Validación de datos
        // - Cálculos agregados
        // - Enriquecimiento de datos
        // - Logging para debugging
    }

    // Continuar con el renderizado
    done();
}