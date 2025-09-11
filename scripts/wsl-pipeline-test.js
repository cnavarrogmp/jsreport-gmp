#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const http = require('http');

// =============== CONFIGURACIÓN WSL ===============
const CONFIG = {
    jsreportUrl: 'http://localhost:5488',
    jsreportUser: 'admin',
    jsreportPassword: 'admin',
    outputDir: '/mnt/d/Carmen/Escritorio/pruebasDocumentosAPI',
    dockerDir: '/mnt/d/Docker/Jsreport',
    templatesPath: 'data/informes/informesSeleccion',
    testDataPath: 'test-data'
};

// =============== UTILIDADES ===============
function log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const icons = { info: '🔹', success: '✅', error: '❌', warning: '⚠️' };
    console.log(`${icons[level]} ${message}`);
}

function createOutputDir() {
    if (!fs.existsSync(CONFIG.outputDir)) {
        fs.mkdirSync(CONFIG.outputDir, { recursive: true });
        log(`Directorio creado: ${CONFIG.outputDir}`, 'success');
    }
}

// =============== FUNCIÓN DE RENDER ===============
function renderTemplate(templateName, dataFile) {
    return new Promise((resolve, reject) => {
        // Leer datos de prueba
        const dataPath = path.join(CONFIG.dockerDir, CONFIG.testDataPath, dataFile);
        let testData;
        
        try {
            testData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
            log(`Datos cargados desde: ${dataFile}`, 'success');
        } catch (error) {
            reject(`Error leyendo datos: ${error.message}`);
            return;
        }

        // Preparar payload para JSReport
        const payload = JSON.stringify({
            template: { name: templateName },
            data: testData
        });

        // Configurar request
        const options = {
            hostname: 'localhost',
            port: 5488,
            path: '/api/report',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
                'Authorization': 'Basic ' + Buffer.from(`${CONFIG.jsreportUser}:${CONFIG.jsreportPassword}`).toString('base64')
            }
        };

        log(`Renderizando template: ${templateName}`, 'info');

        const req = http.request(options, (res) => {
            if (res.statusCode !== 200) {
                reject(`Error HTTP: ${res.statusCode} - ${res.statusMessage}`);
                return;
            }

            const chunks = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => {
                try {
                    // Generar nombre de archivo único
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    const fileName = `test_${templateName}_${timestamp}.pdf`;
                    const outputPath = path.join(CONFIG.outputDir, fileName);

                    // Escribir PDF
                    const pdfBuffer = Buffer.concat(chunks);
                    fs.writeFileSync(outputPath, pdfBuffer);
                    
                    log(`✅ PDF generado: ${outputPath}`, 'success');
                    resolve(outputPath);
                } catch (error) {
                    reject(`Error escribiendo PDF: ${error.message}`);
                }
            });
        });

        req.on('error', (error) => {
            reject(`Error de conexión: ${error.message}`);
        });

        req.write(payload);
        req.end();
    });
}

// =============== FUNCIÓN PRINCIPAL ===============
async function main() {
    console.log('================================================================================');
    console.log('                     🚀 WSL PIPELINE TEST - JSReport                           ');
    console.log('================================================================================\n');

    try {
        // 1. Crear directorio de salida
        createOutputDir();

        // 2. Renderizar template informeCandidatoTemplate
        const templateName = 'informeCandidatoTemplate';
        const dataFile = 'datos-estructura-real.json';

        log(`Iniciando render de ${templateName}...`, 'info');
        const outputPath = await renderTemplate(templateName, dataFile);
        
        log(`\n🎉 COMPLETADO EXITOSAMENTE`, 'success');
        log(`📄 PDF disponible en: ${outputPath}`, 'info');
        log(`\n💡 Para leer el PDF usa: Read tool con la ruta generada`, 'info');

        return outputPath;

    } catch (error) {
        log(`Error en pipeline: ${error}`, 'error');
        process.exit(1);
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main();
}

module.exports = { renderTemplate, CONFIG };