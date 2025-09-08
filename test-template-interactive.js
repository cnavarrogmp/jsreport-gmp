const readline = require('readline');
const fs = require('fs');
const path = require('path');
const http = require('http');

// =============== CONFIGURACIÓN ===============
const CONFIG = {
  jsreportUrl: 'http://localhost:5488',
  jsreportUser: 'admin',
  jsreportPassword: 'admin',
  outputDir: 'D:\\Carmen\\Escritorio\\PRUEBAS DOCUMENTOS API',
  dockerDir: 'D:\\Docker\\Jsreport',
  templatesPath: 'data/informes/informesSeleccion'
};

// =============== UTILIDADES ===============
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

function timestamp() {
  return new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
}

// =============== FUNCIONES PRINCIPALES ===============

/**
 * Busca templates disponibles
 */
function findTemplates() {
  const templatesDir = path.join(CONFIG.dockerDir, CONFIG.templatesPath);
  const templates = [];
  
  try {
    const folders = fs.readdirSync(templatesDir, { withFileTypes: true });
    
    for (const folder of folders) {
      if (folder.isDirectory()) {
        const templatePath = path.join(templatesDir, folder.name);
        
        // Buscar subcarpetas que parecen ser templates (tienen content.handlebars)
        const subfolders = fs.readdirSync(templatePath, { withFileTypes: true });
        
        for (const subfolder of subfolders) {
          if (subfolder.isDirectory()) {
            const handlebarsPath = path.join(templatePath, subfolder.name, 'content.handlebars');
            if (fs.existsSync(handlebarsPath)) {
              templates.push({
                name: `${folder.name}/${subfolder.name}`,
                shortName: subfolder.name,
                fullPath: `/informes/informesSeleccion/${folder.name}/${subfolder.name}`,
                folder: folder.name
              });
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error buscando templates:', error);
  }
  
  return templates;
}

/**
 * Busca datos de prueba disponibles
 */
function findTestData() {
  const dataFiles = [];
  
  // Buscar en raíz
  const rootFiles = fs.readdirSync(CONFIG.dockerDir);
  for (const file of rootFiles) {
    if (file.endsWith('.json') && (file.includes('datos') || file.includes('test'))) {
      dataFiles.push({
        name: file,
        path: path.join(CONFIG.dockerDir, file)
      });
    }
  }
  
  // Agregar opción de datos personalizados
  dataFiles.push({
    name: 'Datos mínimos de prueba (generados)',
    path: 'GENERATED',
    isGenerated: true
  });
  
  return dataFiles;
}

/**
 * Genera datos mínimos de prueba
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
      {
        empresa: "Empresa Prueba 1",
        puesto: "Puesto Prueba",
        fechaInicio: "2020-01-01",
        fechaFin: "2023-12-31",
        descripcion: "Descripción de prueba"
      }
    ],
    formaciones: [
      {
        titulo: "Formación de Prueba",
        centro: "Centro de Prueba",
        fechaInicio: "2015-09-01",
        fechaFin: "2019-06-30"
      }
    ],
    competencias: [
      {
        nombre: "Competencia 1",
        nivel: "Alto",
        valorObtenido: 8,
        valorEsperado: 7
      }
    ],
    idiomas: [
      {
        idioma: "Inglés",
        nivel: "B2"
      }
    ],
    referencias: [
      {
        nombre: "Referencia Prueba",
        cargo: "Director",
        empresa: "Empresa Ref",
        telefono: "600111222"
      }
    ]
  };
}

/**
 * Genera PDF via API
 */
async function generatePDF(template, testData) {
  return new Promise((resolve, reject) => {
    const requestPayload = JSON.stringify({
      template: {
        name: template.fullPath
      },
      data: testData,
      options: {
        debug: {
          logsToResponseHeader: true
        }
      }
    });
    
    const auth = Buffer.from(`${CONFIG.jsreportUser}:${CONFIG.jsreportPassword}`).toString('base64');
    
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
    console.log(`   Template: ${template.name}`);
    
    const req = http.request(options, (res) => {
      let data = [];
      
      res.on('data', (chunk) => {
        data.push(chunk);
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          const pdfBuffer = Buffer.concat(data);
          const outputFile = path.join(CONFIG.outputDir, `test_${template.folder}_${timestamp()}.pdf`);
          
          // Crear directorio si no existe
          if (!fs.existsSync(CONFIG.outputDir)) {
            fs.mkdirSync(CONFIG.outputDir, { recursive: true });
          }
          
          fs.writeFileSync(outputFile, pdfBuffer);
          console.log(`\n✅ PDF generado exitosamente:`);
          console.log(`   📄 ${outputFile}`);
          console.log(`   📊 Tamaño: ${(pdfBuffer.length / 1024 / 1024).toFixed(2)} MB`);
          
          resolve(outputFile);
        } else {
          console.error(`\n❌ Error HTTP ${res.statusCode}`);
          const errorMsg = Buffer.concat(data).toString();
          console.error(errorMsg.substring(0, 500));
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });
    
    req.setTimeout(60000, () => {
      req.destroy();
      reject(new Error('Timeout: La generación tardó más de 60 segundos'));
    });
    
    req.on('error', (err) => {
      console.error('\n❌ Error de conexión:', err.message);
      reject(err);
    });
    
    req.write(requestPayload);
    req.end();
  });
}

/**
 * Menú principal interactivo
 */
async function main() {
  console.log('\n');
  console.log('================================================================================');
  console.log('                     PROBADOR INTERACTIVO DE TEMPLATES                         ');
  console.log('================================================================================');
  console.log('\n');
  
  try {
    // Paso 1: Buscar templates
    console.log('🔍 Buscando templates disponibles...\n');
    const templates = findTemplates();
    
    if (templates.length === 0) {
      console.log('❌ No se encontraron templates');
      process.exit(1);
    }
    
    // Mostrar templates
    console.log('📋 TEMPLATES DISPONIBLES:\n');
    templates.forEach((t, i) => {
      console.log(`   ${i + 1}. ${t.name}`);
    });
    
    // Seleccionar template
    console.log('\n');
    const templateChoice = await question('Selecciona un template (número): ');
    const selectedTemplate = templates[parseInt(templateChoice) - 1];
    
    if (!selectedTemplate) {
      console.log('❌ Selección inválida');
      process.exit(1);
    }
    
    console.log(`\n✅ Template seleccionado: ${selectedTemplate.name}`);
    
    // Paso 2: Seleccionar datos
    console.log('\n🔍 Buscando archivos de datos...\n');
    const dataFiles = findTestData();
    
    console.log('📋 DATOS DISPONIBLES:\n');
    dataFiles.forEach((d, i) => {
      console.log(`   ${i + 1}. ${d.name}`);
    });
    
    console.log('\n');
    const dataChoice = await question('Selecciona datos de prueba (número): ');
    const selectedData = dataFiles[parseInt(dataChoice) - 1];
    
    if (!selectedData) {
      console.log('❌ Selección inválida');
      process.exit(1);
    }
    
    // Cargar o generar datos
    let testData;
    if (selectedData.isGenerated) {
      testData = generateMinimalTestData();
      console.log('\n✅ Datos de prueba generados');
    } else {
      testData = JSON.parse(fs.readFileSync(selectedData.path, 'utf-8'));
      console.log(`\n✅ Datos cargados desde: ${selectedData.name}`);
    }
    
    // Paso 3: Confirmar y generar
    console.log('\n================================================================================');
    console.log('RESUMEN:');
    console.log(`   Template: ${selectedTemplate.name}`);
    console.log(`   Datos: ${selectedData.name}`);
    console.log('================================================================================\n');
    
    const confirm = await question('¿Generar PDF? (s/n): ');
    
    if (confirm.toLowerCase() === 's') {
      await generatePDF(selectedTemplate, testData);
    } else {
      console.log('\n❌ Generación cancelada');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    rl.close();
  }
}

// =============== EJECUTAR ===============
if (require.main === module) {
  main();
}