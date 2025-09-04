const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuración JSReport
const JSREPORT_URL = 'http://localhost:5488';
const JSREPORT_USERNAME = 'admin';
const JSREPORT_PASSWORD = 'admin';

// Datos de prueba (mismo JSON que usa JSReport Studio)
const testData = {
  datosGenerales: {
    nombreCandidato: "CANDIDATO DE PRUEBA",
    puestoAspira: "Puesto de Prueba",
    fechaEvaluacion: "2025-09-04"
  },
  datosDestacados: [
    {
      nombreCompetencia: "Competencia 1",
      valorObtenido: 8.5,
      valorEsperado: 7.0,
      descripcion: "Descripción de competencia 1"
    },
    {
      nombreCompetencia: "Competencia 2", 
      valorObtenido: 7.2,
      valorEsperado: 8.0,
      descripcion: "Descripción de competencia 2"
    },
    {
      nombreCompetencia: "Competencia 3",
      valorObtenido: 9.1,
      valorEsperado: 8.5,
      descripcion: "Descripción de competencia 3"
    }
  ]
};

// Función helper para hacer requests HTTP
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = [];
      
      res.on('data', (chunk) => {
        data.push(chunk);
      });
      
      res.on('end', () => {
        const response = {
          status: res.statusCode,
          headers: res.headers,
          data: Buffer.concat(data)
        };
        resolve(response);
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function testJSReportAPI() {
  console.log('🚀 INICIANDO PRUEBA API JSREPORT');
  console.log('=' .repeat(50));
  
  try {
    // Paso 1: Saltar verificación y ir directo al renderizado
    console.log('📡 PASO 1: JSReport requiere auth, pasando directo al renderizado...');
    
    // Paso 3: Renderizar PDF directamente (saltamos paso 2 para simplificar)
    console.log('\n🎨 PASO 3: Renderizando PDF con datos de prueba...');
    console.log('Datos enviados:');
    console.log(JSON.stringify(testData, null, 2));
    
    const requestPayload = JSON.stringify({
      template: {
        name: 'informeInteligente'  // Usamos nombre en lugar de shortid
      },
      data: testData,
      options: {
        debug: {
          logsToResponseHeader: true
        },
        reports: {
          save: true
        }
      }
    });
    
    const auth = Buffer.from(`${JSREPORT_USERNAME}:${JSREPORT_PASSWORD}`).toString('base64');
    
    const renderOptions = {
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
    
    const renderResponse = await makeRequest(renderOptions, requestPayload);
    
    // Paso 4: Analizar logs de renderizado
    console.log('\n📋 PASO 4: Analizando logs y headers de renderizado...');
    
    // Mostrar todos los headers para debugging
    console.log('🔍 TODOS LOS HEADERS:');
    Object.keys(renderResponse.headers).forEach(key => {
      console.log(`  ${key}: ${renderResponse.headers[key]}`);
    });
    
    const logs = renderResponse.headers['debug-logs'] || renderResponse.headers['x-jsreport-logs'];
    if (logs) {
      console.log('\n🔍 LOGS DE JSREPORT:');
      console.log('=' .repeat(40));
      const decodedLogs = Buffer.from(logs, 'base64').toString('utf-8');
      console.log(decodedLogs);
      console.log('=' .repeat(40));
      
      // Buscar específicamente los console.log de helpers.js
      if (decodedLogs.includes('DEBUG') || decodedLogs.includes('datosDestacados')) {
        console.log('✅ ¡ENCONTRADOS LOGS DE HELPERS.JS!');
      } else {
        console.log('⚠️ No se encontraron logs específicos de helpers.js');
      }
    } else {
      console.log('⚠️ No se encontraron logs en la respuesta');
    }
    
    // Paso 5: Guardar PDF generado
    console.log('\n💾 PASO 5: Guardando PDF generado...');
    const outputPath = path.join(__dirname, 'test-output-api.pdf');
    fs.writeFileSync(outputPath, renderResponse.data);
    console.log(`✅ PDF guardado en: ${outputPath}`);
    
    // Paso 6: Estadísticas de la respuesta
    console.log('\n📊 PASO 6: Estadísticas de la respuesta...');
    console.log(`📏 Tamaño del PDF: ${renderResponse.data.length} bytes`);
    console.log(`⏱️ Tiempo de respuesta: ${renderResponse.headers['x-response-time'] || 'N/A'}`);
    console.log(`🎯 Status: ${renderResponse.status}`);
    
    if (renderResponse.status === 200) {
      console.log('\n🎉 PRUEBA API COMPLETADA EXITOSAMENTE');
    } else {
      console.log('\n⚠️ RESPUESTA NO EXITOSA');
      console.log('Response body:', renderResponse.data.toString());
    }
    
  } catch (error) {
    console.error('❌ ERROR EN PRUEBA API:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Función auxiliar para cargar datos desde JSReport Studio
async function loadDataFromStudio() {
  console.log('📥 Cargando datos desde JSReport Studio...');
  // Aquí podríamos hacer una llamada para obtener los datos exactos
  // que está usando JSReport Studio en el preview
  return testData;
}

// Ejecutar prueba
if (require.main === module) {
  testJSReportAPI();
}

module.exports = { testJSReportAPI, loadDataFromStudio };