const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

// =============== CONFIGURACIÓN ===============
const CONFIG = {
  // Rutas
  dockerDir: 'D:\\Docker\\Jsreport',
  outputDir: 'D:\\Carmen\\Escritorio\\PRUEBAS DOCUMENTOS API',
  
  // Git
  branch: 'SPRINTS/SPRINT10/622CarmenJsReport',
  
  // JSReport
  jsreportUrl: 'http://localhost:5488',
  jsreportUser: 'admin',
  jsreportPassword: 'admin',
  
  // Opciones
  autoCommit: true,
  commitMessage: 'Auto-commit: Testing pipeline execution',
  waitForDocker: 30000, // 30 segundos para que Docker inicie
};

// =============== UTILIDADES ===============
function execPromise(command, cwd = null) {
  return new Promise((resolve, reject) => {
    console.log(`📌 Ejecutando: ${command}`);
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error: ${error.message}`);
        reject(error);
      } else {
        if (stdout) console.log(stdout);
        if (stderr) console.warn(`⚠️ Stderr: ${stderr}`);
        resolve(stdout);
      }
    });
  });
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function timestamp() {
  return new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
}

// =============== PASO 1: COMMIT Y PUSH ===============
async function step1_CommitAndPush() {
  console.log('\n🔹 PASO 1: COMMIT Y PUSH EN CARPETA DOCKER');
  console.log('=' .repeat(50));
  
  try {
    // Verificar estado
    await execPromise('git status --short', CONFIG.dockerDir);
    
    if (CONFIG.autoCommit) {
      // Add todos los cambios
      await execPromise('git add -A', CONFIG.dockerDir);
      
      // Commit con timestamp
      const message = `${CONFIG.commitMessage} [${timestamp()}]`;
      await execPromise(`git commit -m "${message}"`, CONFIG.dockerDir);
      
      // Push
      await execPromise(`git push origin ${CONFIG.branch}`, CONFIG.dockerDir);
      console.log('✅ Cambios enviados al repositorio');
    } else {
      console.log('⚠️ Auto-commit desactivado. Asegúrate de hacer commit manual');
    }
    
    return true;
  } catch (error) {
    if (error.message.includes('nothing to commit')) {
      console.log('ℹ️ No hay cambios para commit');
      return true;
    }
    throw error;
  }
}

// =============== PASO 2: REINICIAR DOCKER ===============
async function step2_RestartDocker() {
  console.log('\n🔹 PASO 2: REINICIAR DOCKER');
  console.log('=' .repeat(50));
  
  try {
    // Detener contenedor
    console.log('🛑 Deteniendo contenedor...');
    await execPromise('docker-compose down', CONFIG.dockerDir);
    
    // Esperar un momento
    await wait(2000);
    
    // Iniciar contenedor
    console.log('🚀 Iniciando contenedor...');
    await execPromise('docker-compose up -d', CONFIG.dockerDir);
    
    // Esperar a que JSReport esté listo
    console.log(`⏳ Esperando ${CONFIG.waitForDocker/1000}s para que JSReport inicie...`);
    await wait(CONFIG.waitForDocker);
    
    console.log('✅ Docker reiniciado');
    return true;
  } catch (error) {
    console.error('❌ Error reiniciando Docker:', error);
    throw error;
  }
}

// =============== PASO 3: GENERAR PDF VIA API ===============
async function step3_GeneratePDF() {
  console.log('\n🔹 PASO 3: GENERAR PDF VIA API');
  console.log('=' .repeat(50));
  
  // Cargar datos ESTRUCTURA REAL desde archivo
  let testData;
  try {
    testData = JSON.parse(fs.readFileSync(path.join(__dirname, 'datos-estructura-real.json'), 'utf-8'));
    console.log('📄 Datos cargados desde datos-estructura-real.json');
    console.log(`   - ${testData.experienciasLaborales.length} experiencias laborales`);
    console.log(`   - ${testData.formaciones.length} formaciones`);
    console.log(`   - ${testData.competencias.length} competencias`);
    console.log(`   - ${testData.idiomas.length} idiomas`);
    console.log(`   - ${testData.referencias.length} referencias`);
    console.log(`   - Estructura REAL del sistema`);
    console.log(`   - Candidato: ${testData.datosPersonales.nombreCompleto}`);
  } catch (error) {
    console.log('⚠️ No se pudo cargar datos-estructura-real.json, usando datos básicos');
    testData = {
      datosGenerales: {
        nombreCandidato: "CANDIDATO DE PRUEBA",
        puestoAspira: "Puesto de Prueba",
        fechaEvaluacion: new Date().toISOString().split('T')[0]
      },
      datosDestacados: [
        {
          nombreCompetencia: "Competencia 1",
          valorObtenido: 8.5,
          valorEsperado: 7.0,
          descripcion: "Descripción de competencia 1"
        }
      ]
    };
  }
  
  return new Promise((resolve, reject) => {
    const requestPayload = JSON.stringify({
      template: {
        name: 'informeInteligente'
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
    
    const req = http.request(options, (res) => {
      let data = [];
      
      res.on('data', (chunk) => {
        data.push(chunk);
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          // Guardar PDF
          const pdfBuffer = Buffer.concat(data);
          const outputFile = path.join(CONFIG.outputDir, `informe_${timestamp()}.pdf`);
          
          // Crear directorio si no existe
          if (!fs.existsSync(CONFIG.outputDir)) {
            fs.mkdirSync(CONFIG.outputDir, { recursive: true });
          }
          
          fs.writeFileSync(outputFile, pdfBuffer);
          console.log(`✅ PDF generado: ${outputFile}`);
          console.log(`📊 Tamaño: ${(pdfBuffer.length / 1024 / 1024).toFixed(2)} MB`);
          
          // Guardar logs si existen
          if (res.headers['debug-logs']) {
            const logs = Buffer.from(res.headers['debug-logs'], 'base64').toString('utf-8');
            const logFile = path.join(CONFIG.outputDir, `logs_${timestamp()}.txt`);
            fs.writeFileSync(logFile, logs);
            console.log(`📋 Logs guardados: ${logFile}`);
          }
          
          resolve(outputFile);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data.toString()}`));
        }
      });
    });
    
    // Configurar timeout de 60 segundos
    req.setTimeout(60000, () => {
      req.destroy();
      reject(new Error('Timeout: La generación del PDF tardó más de 60 segundos'));
    });
    
    req.on('error', (err) => {
      if (err.code === 'ECONNRESET') {
        reject(new Error('Conexión perdida con JSReport. Posible timeout o PDF muy pesado. Intenta con menos datos.'));
      } else {
        reject(err);
      }
    });
    
    req.write(requestPayload);
    req.end();
  });
}


// =============== PIPELINE PRINCIPAL ===============
async function runPipeline() {
  console.log('🚀 INICIANDO PIPELINE DE DEPLOY Y TEST');
  console.log('=' .repeat(60));
  console.log(`⏰ Hora: ${new Date().toLocaleString()}`);
  console.log(`📁 Docker: ${CONFIG.dockerDir}`);
  console.log(`📁 Output: ${CONFIG.outputDir}`);
  console.log('=' .repeat(60));
  
  const results = {
    step1: false,
    step2: false,
    step3: false,
    pdfPath: null,
    errors: []
  };
  
  try {
    // Paso 1: Commit y Push
    try {
      results.step1 = await step1_CommitAndPush();
    } catch (error) {
      results.errors.push(`Paso 1: ${error.message}`);
      console.log('⚠️ Continuando sin commit...');
    }
    
    // Paso 2: Reiniciar Docker
    results.step2 = await step2_RestartDocker();
    
    // Paso 3: Generar PDF
    results.pdfPath = await step3_GeneratePDF();
    results.step3 = true;
    
    // Resumen final
    console.log('\n' + '=' .repeat(60));
    console.log('📊 RESUMEN DE EJECUCIÓN:');
    console.log(`  ✅ Paso 1 (Commit/Push): ${results.step1 ? 'OK' : 'FALLÓ'}`);
    console.log(`  ✅ Paso 2 (Docker): ${results.step2 ? 'OK' : 'FALLÓ'}`);
    console.log(`  ✅ Paso 3 (PDF): ${results.step3 ? 'OK' : 'FALLÓ'}`);
    
    if (results.pdfPath) {
      console.log(`\n🎉 PDF GENERADO EXITOSAMENTE:`);
      console.log(`   📄 ${results.pdfPath}`);
    }
    
    if (results.errors.length > 0) {
      console.log('\n⚠️ ADVERTENCIAS:');
      results.errors.forEach(err => console.log(`   - ${err}`));
    }
    
    console.log('\n✨ PIPELINE COMPLETADO');
    
  } catch (error) {
    console.error('\n❌ ERROR CRÍTICO:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// =============== EJECUCIÓN ===============
if (require.main === module) {
  runPipeline();
}

module.exports = { runPipeline, CONFIG };
