/**
 * PROBADOR INTERACTIVO DE TEMPLATES (JSREPORT)
 * --------------------------------------------
 * Este script permite:
 *  1) Listar las plantillas disponibles (buscando en tu estructura local del repo)
 *  2) Elegir una plantilla
 *  3) Elegir datos de prueba (archivo JSON o datos mínimos generados)
 *  4) Renderizar el PDF contra la API de jsreport
 *  5) Guardar el PDF en una carpeta local
 *
 * Notas importantes:
 *  - Para que jsreport encuentre la plantilla, enviamos la RUTA LÓGICA completa
 *    del store (lo que ves en Studio), no el nombre de carpeta del disco.
 *  - Este script cierra el proceso automáticamente al terminar.
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const http = require('http');

// ========================= CONFIGURACIÓN =========================
// Ajusta estas rutas y credenciales a tu entorno
const CONFIG = {
    jsreportUrl: 'http://localhost:5488',                // URL de tu jsreport
    jsreportUser: 'admin',                               // Usuario jsreport (si hay auth)
    jsreportPassword: 'admin',                           // Password jsreport (si hay auth)

    outputDir: 'D:\\Carmen\\Escritorio\\pruebasDocumentosAPI', // Carpeta donde guardar PDFs
    dockerDir: 'D:\\Docker\\Jsreport',                   // Raíz del repo/proyecto con datos/templates
    templatesPath: 'data/informes/informesSeleccion',    // Ruta local (disco) donde están las plantillas
    testDataPath: 'test-data'                            // Carpeta local con JSONs de prueba
    // IMPORTANTE: El "prefijo lógico" del store se asume abajo como
    // "/informes/informesSeleccion". Si tu árbol en Studio cambia,
    // ajusta la constante STORE_PREFIX más abajo.
};

// Prefijo lógico del STORE tal y como aparece en Studio (árbol izquierdo).
// Si en Studio ves: informes > informesSeleccion > <grupo> > <plantilla>
// el path lógico será: /informes/informesSeleccion/<grupo>/<plantilla>
const STORE_PREFIX = '/informes/informesSeleccion';

// ========================= UTILIDADES =========================
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function question(prompt) {
    return new Promise(resolve => rl.question(prompt, resolve));
}

function timestamp() {
    return new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
}

function ensureOutputDir() {
    if (!fs.existsSync(CONFIG.outputDir)) {
        fs.mkdirSync(CONFIG.outputDir, { recursive: true });
        console.log(`📁 Carpeta creada: ${CONFIG.outputDir}`);
    }
}

// ========================= BUSCADORES =========================

/**
 * Busca plantillas disponibles en la estructura local del repo.
 * Convención asumida:
 *   <dockerDir>/<templatesPath>/<grupo>/<plantilla>/content.handlebars
 * Donde:
 *   - <grupo> es una subcarpeta (ej. "informesSeleccionInteligente")
 *   - <plantilla> es otra subcarpeta que contiene content.handlebars
 *
 * Devuelve un array de objetos con:
 *   - name:    "<grupo>/<plantilla>"  (para mostrar)
 *   - shortName: "<plantilla>"        (nombre corto)
 *   - fullPath: "/informes/informesSeleccion/<grupo>/<plantilla>"  (RUTA LÓGICA para Studio/jsreport)
 *   - folder:   "<grupo>"
 */
function findTemplates() {
    const templatesDir = path.join(CONFIG.dockerDir, CONFIG.templatesPath);
    const templates = [];

    try {
        const groups = fs.readdirSync(templatesDir, { withFileTypes: true });
        for (const group of groups) {
            if (!group.isDirectory()) continue;

            const groupPath = path.join(templatesDir, group.name);
            const candidates = fs.readdirSync(groupPath, { withFileTypes: true });

            for (const cand of candidates) {
                if (!cand.isDirectory()) continue;

                // Convención: una plantilla válida tiene "content.handlebars" dentro
                const handlebarsPath = path.join(groupPath, cand.name, 'content.handlebars');
                if (!fs.existsSync(handlebarsPath)) continue;

                templates.push({
                    name: `${group.name}/${cand.name}`,
                    shortName: cand.name,
                    fullPath: `${STORE_PREFIX}/${group.name}/${cand.name}`, // ← ruta lógica para jsreport
                    folder: group.name
                });
            }
        }
    } catch (error) {
        console.error('❌ Error buscando templates:', error.message);
    }

    // Orden alfabético por nombre para que el menú sea estable
    return templates.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Busca archivos de datos de prueba (.json) en:
 *   - <dockerDir>/<testDataPath>
 *   - <dockerDir> (compatibilidad: archivos sueltos con "datos" o "test" en el nombre)
 * Y añade una opción al final para "Datos mínimos generados".
 */
function findTestData() {
    const dataFiles = [];

    const testDataDir = path.join(CONFIG.dockerDir, CONFIG.testDataPath);
    if (fs.existsSync(testDataDir)) {
        const testFiles = fs.readdirSync(testDataDir);
        for (const file of testFiles) {
            if (file.endsWith('.json')) {
                dataFiles.push({ name: file, path: path.join(testDataDir, file) });
            }
        }
    }

    // Compat: permitir JSONs sueltos en la raíz que contengan "datos" o "test"
    const rootFiles = fs.readdirSync(CONFIG.dockerDir);
    for (const file of rootFiles) {
        if (file.endsWith('.json') && (file.toLowerCase().includes('datos') || file.toLowerCase().includes('test'))) {
            dataFiles.push({ name: `${file} (raíz - deprecated)`, path: path.join(CONFIG.dockerDir, file) });
        }
    }

    // Opción final: generar datos mínimos
    dataFiles.push({ name: 'Datos mínimos de prueba (generados)', path: 'GENERATED', isGenerated: true });

    return dataFiles;
}

/**
 * Devuelve un JSON mínimo de datos, útil para pruebas rápidas.
 */
function generateMinimalTestData() {
    return {
        datosPersonales: {
            nombreCompleto: "CANDIDATO DE PRUEBA",
            email: "prueba@test.com",
            telefono: "600000000",
            codigoPostal: "28001",
            municipio: "Madrid"
        },
        experienciasLaborales: [
            { empresa: "Empresa Prueba 1", puesto: "Puesto Prueba", fechaInicio: "2020-01-01", fechaFin: "2023-12-31", descripcion: "Descripción de prueba" }
        ],
        formaciones: [
            { titulo: "Formación de Prueba", centro: "Centro de Prueba", fechaInicio: "2015-09-01", fechaFin: "2019-06-30" }
        ],
        competencias: [
            { nombre: "Competencia 1", nivel: "Alto", valorObtenido: 8, valorEsperado: 7 }
        ],
        idiomas: [
            { idioma: "Inglés", nivel: "B2" }
        ],
        referencias: [
            { nombre: "Referencia Prueba", cargo: "Director", empresa: "Empresa Ref", telefono: "600111222" }
        ]
    };
}

// ========================= RENDER PDF =========================

/**
 * Llama a la API de jsreport para renderizar el PDF y lo guarda en disco.
 * IMPORTANTE: usamos template.fullPath (ruta lógica de Studio).
 */
async function generatePDF(template, testData) {
    return new Promise((resolve, reject) => {
        // Construimos el cuerpo de la petición (payload) para POST /api/report
        const requestPayload = JSON.stringify({
            template: { name: template.fullPath }, // ← RUTA LÓGICA COMPLETA
            data: testData,
            options: {
                // Le damos un nombre claro al archivo del reporte (jsreport añadirá .pdf)
                reportName: `test_${template.folder}_${template.shortName}_${timestamp()}`,
                // Logs de debug en cabecera (útil para inspección de problemas)
                debug: { logsToResponseHeader: true }
            }
        });

        // Autenticación Basic (si está habilitada en jsreport)
        const auth = Buffer.from(`${CONFIG.jsreportUser}:${CONFIG.jsreportPassword}`).toString('base64');

        // Opciones HTTP de la request
        const options = {
            hostname: 'localhost',
            port: 5488,
            path: '/api/report',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(requestPayload),
                'Authorization': `Basic ${auth}`
            }
        };

        console.log(`\n📤 Enviando solicitud a JSReport...`);
        console.log(`   Template (store): ${template.fullPath}`);

        // Petición HTTP cruda (sin dependencias externas)
        const req = http.request(options, (res) => {
            const chunks = [];

            res.on('data', (chunk) => chunks.push(chunk));

            res.on('end', () => {
                if (res.statusCode === 200) {
                    // Respuesta OK → es el binario del PDF
                    const pdfBuffer = Buffer.concat(chunks);

                    // Aseguramos carpeta y componemos nombre del archivo
                    ensureOutputDir();
                    const outputFile = path.join(
                        CONFIG.outputDir,
                        `test_${template.folder}_${template.shortName}_${timestamp()}.pdf`
                    );

                    // Guardamos el PDF en disco
                    fs.writeFileSync(outputFile, pdfBuffer);

                    console.log(`\n✅ PDF generado exitosamente:`);
                    console.log(`   📄 ${outputFile}`);
                    console.log(`   📊 Tamaño: ${(pdfBuffer.length / 1024 / 1024).toFixed(2)} MB`);

                    // Si activaste debug.logsToResponseHeader, algunos entornos devuelven logs
                    // en cabecera "debug-logs" (base64). Si los hay, puedes guardarlos:
                    if (res.headers['debug-logs']) {
                        try {
                            const logs = Buffer.from(res.headers['debug-logs'], 'base64').toString('utf-8');
                            const logFile = path.join(CONFIG.outputDir, `logs_${timestamp()}.txt`);
                            fs.writeFileSync(logFile, logs);
                            console.log(`📋 Logs de render guardados: ${logFile}`);
                        } catch {
                            // si falla la decodificación, lo ignoramos sin romper
                        }
                    }

                    resolve(outputFile);
                } else {
                    // Errores HTTP de jsreport: muestra el primer trozo para pistas
                    console.error(`\n❌ Error HTTP ${res.statusCode}`);
                    const errorMsg = Buffer.concat(chunks).toString();
                    console.error(errorMsg.substring(0, 800));
                    reject(new Error(`HTTP ${res.statusCode}`));
                }
            });
        });

        // Timeout de seguridad (por si algo se atasca)
        req.setTimeout(60000, () => {
            req.destroy();
            reject(new Error('Timeout: la generación tardó más de 60 segundos'));
        });

        req.on('error', (err) => {
            console.error('\n❌ Error de conexión:', err.message);
            reject(err);
        });

        // Enviamos el payload y cerramos la request
        req.write(requestPayload);
        req.end();
    });
}

// ========================= APLICACIÓN (MENÚ) =========================

/**
 * Menú interactivo:
 *  1) Lista plantillas detectadas
 *  2) Elige plantilla
 *  3) Lista datos de prueba
 *  4) Elige datos
 *  5) Renderiza (sin confirmación final) y termina
 */
async function main() {
    console.log('\n');
    console.log('================================================================================');
    console.log('                     PROBADOR INTERACTIVO DE TEMPLATES                          ');
    console.log('================================================================================');
    console.log('\n');

    // Asegura la carpeta de salida desde el principio
    ensureOutputDir();

    try {
        // ---- 1) Buscar plantillas
        console.log('🔍 Buscando templates disponibles...\n');
        const templates = findTemplates();
        if (templates.length === 0) {
            console.log('❌ No se encontraron templates. Revisa CONFIG.templatesPath y tu estructura.');
            process.exit(1);
        }

        console.log('📋 TEMPLATES DISPONIBLES:\n');
        templates.forEach((t, i) => console.log(`   ${String(i + 1).padStart(2, '0')}. ${t.name}`));

        // ---- 2) Elegir plantilla
        console.log('\n');
        const templateChoice = await question('Selecciona un template (número): ');
        const selectedTemplate = templates[parseInt(templateChoice, 10) - 1];
        if (!selectedTemplate) {
            console.log('❌ Selección inválida');
            process.exit(1);
        }
        console.log(`\n✅ Template seleccionado: ${selectedTemplate.name}`);
        console.log(`   Ruta lógica (store): ${selectedTemplate.fullPath}`);

        // ---- 3) Buscar datos
        console.log('\n🔍 Buscando archivos de datos...\n');
        const dataFiles = findTestData();
        if (dataFiles.length === 0) {
            console.log('❌ No se encontraron archivos de datos');
            process.exit(1);
        }

        console.log('📋 DATOS DISPONIBLES:\n');
        dataFiles.forEach((d, i) => console.log(`   ${String(i + 1).padStart(2, '0')}. ${d.name}`));

        // ---- 4) Elegir datos
        console.log('\n');
        const dataChoice = await question('Selecciona datos de prueba (número): ');
        const selectedData = dataFiles[parseInt(dataChoice, 10) - 1];
        if (!selectedData) {
            console.log('❌ Selección inválida');
            process.exit(1);
        }

        let testData;
        if (selectedData.isGenerated) {
            testData = generateMinimalTestData();
            console.log('\n✅ Datos de prueba generados');
        } else {
            testData = JSON.parse(fs.readFileSync(selectedData.path, 'utf-8'));
            console.log(`\n✅ Datos cargados desde: ${selectedData.name}`);
        }

        // ---- Resumen previo
        console.log('\n================================================================================');
        console.log('RESUMEN DE RENDER:');
        console.log(`   Template: ${selectedTemplate.name}`);
        console.log(`   Store   : ${selectedTemplate.fullPath}`);
        console.log(`   Datos   : ${selectedData.name}`);
        console.log('================================================================================\n');

        // ---- 5) Render (sin confirmación final)
        await generatePDF(selectedTemplate, testData);

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error.stack);
    } finally {
        // Cierre limpio del readline y del proceso
        rl.close();
        // setImmediate evita cortar logs que queden en la cola del event loop
        setImmediate(() => process.exit(0));
    }
}

// ========================= EJECUCIÓN =========================
if (require.main === module) {
    main();
}

module.exports = { main, CONFIG };
