#!/usr/bin/env node
/* eslint-env node */
'use strict';

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');
const readline = require('readline');

// =============== CONFIG ===============
const CONFIG = {
    dockerDir: 'D:\\Docker\\Jsreport',
    outputDir: 'D:\\Carmen\\Escritorio\\pruebasDocumentosAPI',
    jsreportUrl: 'http://localhost:5488',
    jsreportUser: 'admin',
    jsreportPassword: 'admin',
    templatesPath: 'data/informes/informesSeleccion',
    testDataPath: 'test-data',
    waitForDocker: 30000 // ms
};

// =============== UTIL ===============
function execP(cmd, cwd = null) {
    return new Promise((resolve, reject) => {
        exec(cmd, { cwd, windowsHide: true }, (error, stdout, stderr) => {
            if (error) return reject(Object.assign(error, { stdout, stderr }));
            resolve({ stdout: stdout?.trim() ?? '', stderr: stderr?.trim() ?? '' });
        });
    });
}

function wait(ms) {
    return new Promise((r) => setTimeout(r, ms));
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

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

// =============== GIT ===============
async function getCurrentBranch(cwd) {
    const { stdout } = await execP('git rev-parse --abbrev-ref HEAD', cwd);
    return stdout;
}

async function gitPull(cwd, branch) {
    const { stdout, stderr } = await execP(`git pull --rebase origin ${branch}`, cwd).catch(e => e);
    const out = (stdout || '') + '\n' + (stderr || '');
    // detectar conflictos (archivos en estado "U" o texto CONFLICT)
    const { stdout: unmerged } = await execP('git diff --name-only --diff-filter=U', cwd);
    if (out.includes('CONFLICT') || (unmerged && unmerged.trim().length > 0)) {
        throw new Error('Conflictos tras git pull. Resuélvelos y vuelve a ejecutar.');
    }
    return out;
}

async function gitStatusPorcelain(cwd) {
    const { stdout } = await execP('git status --porcelain', cwd);
    return stdout.split('\n').filter(Boolean);
}

function buildCommitMessageFromStatus(lines) {
    if (!lines.length) return `Actualización de plantillas · ${new Date().toLocaleString()}`;
    // contar por tipo
    const counts = { A: 0, M: 0, D: 0, R: 0, C: 0, U: 0, '?': 0 };
    const files = [];
    for (const l of lines) {
        const type = l.slice(0, 2).trim() || l[0];
        const code = type[0]; // primer char suele bastar
        counts[code] = (counts[code] || 0) + 1;
        files.push(l.replace(/^\s*[A-Z\?\! ]+\s+/, ''));
    }
    const parts = [];
    if (counts.A) parts.push(`+${counts.A} añadidos`);
    if (counts.M) parts.push(`~${counts.M} modificados`);
    if (counts.D) parts.push(`-${counts.D} eliminados`);
    if (counts.R) parts.push(`↔${counts.R} renombrados`);
    if (counts.C) parts.push(`≈${counts.C} copiados`);
    if (counts['?']) parts.push(`?${counts['?']} no seguidos`);

    const summary = parts.join(', ');
    const sample = files.slice(0, 5).join(', ');
    return `Update plantillas (${summary}) · ${new Date().toLocaleString()} · Ej: ${sample}`;
}

async function gitAddCommitPush(cwd) {
    const branch = await getCurrentBranch(cwd);
    console.log(`📌 Rama actual: ${branch}`);

    console.log('⬇️  git pull...');
    await gitPull(cwd, branch);
    console.log('✅ Pull sin conflictos');

    console.log('➕ git add -A');
    await execP('git add -A', cwd);

    const status = await gitStatusPorcelain(cwd);
    if (!status.length) {
        console.log('ℹ️ No hay cambios para commit');
        return { branch, committed: false };
    }

    const message = buildCommitMessageFromStatus(status);
    console.log('📝 Mensaje de commit:', message);
    await execP(`git commit -m "${message.replace(/"/g, '\\"')}"`, cwd);

    console.log(`📤 git push origin ${branch}`);
    await execP(`git push origin ${branch}`, cwd);

    return { branch, committed: true };
}

// =============== DOCKER ===============
async function restartDocker(cwd) {
    console.log('🛑 docker-compose down');
    await execP('docker-compose down', cwd);

    await wait(1500);

    console.log('🚀 docker-compose up -d');
    await execP('docker-compose up -d', cwd);

    console.log(`⏳ Esperando ${CONFIG.waitForDocker / 1000}s a que jsreport arranque...`);
    await wait(CONFIG.waitForDocker);
    console.log('✅ Docker listo');
}

// =============== TEMPLATES & DATA ===============
function findTemplates() {
    const base = path.join(CONFIG.dockerDir, CONFIG.templatesPath);
    const templates = [];
    if (!fs.existsSync(base)) return templates;

    const folders = fs.readdirSync(base, { withFileTypes: true }).filter(d => d.isDirectory());
    for (const folder of folders) {
        const folderPath = path.join(base, folder.name);
        const subs = fs.readdirSync(folderPath, { withFileTypes: true }).filter(d => d.isDirectory());
        for (const sub of subs) {
            const hbs = path.join(folderPath, sub.name, 'content.handlebars');
            if (fs.existsSync(hbs)) {
                templates.push({
                    group: folder.name,
                    shortName: sub.name,
                    name: `${folder.name}/${sub.name}`,
                    dir: path.join(folderPath, sub.name)
                });
            }
        }
    }
    return templates.sort((a, b) => a.name.localeCompare(b.name));
}

function findTestData() {
    const dataFiles = [];
    const testDataDir = path.join(CONFIG.dockerDir, CONFIG.testDataPath);
    
    // Buscar en carpeta test-data
    if (fs.existsSync(testDataDir)) {
        const testFiles = fs.readdirSync(testDataDir);
        for (const file of testFiles) {
            if (file.endsWith('.json')) {
                dataFiles.push({ 
                    name: file, 
                    path: path.join(testDataDir, file) 
                });
            }
        }
    }
    
    // Buscar en raíz (deprecated pero por compatibilidad)
    const rootFiles = fs.readdirSync(CONFIG.dockerDir);
    for (const file of rootFiles) {
        if (file.endsWith('.json') && (file.includes('datos') || file.includes('test'))) {
            dataFiles.push({ 
                name: `${file} (raíz - deprecated)`, 
                path: path.join(CONFIG.dockerDir, file) 
            });
        }
    }
    
    // Opción de generar datos mínimos
    dataFiles.push({ 
        name: 'Datos mínimos de prueba (generados)', 
        path: 'GENERATED', 
        isGenerated: true 
    });
    
    return dataFiles;
}

function loadTemplateDataIfAny(templateDir) {
    const candidates = ['data.json', 'test-data.json', 'datos.json'];
    for (const f of candidates) {
        const p = path.join(templateDir, f);
        if (fs.existsSync(p)) {
            const raw = fs.readFileSync(p, 'utf-8');
            try { return JSON.parse(raw); } catch { /* ignore */ }
        }
    }
    return null;
}

function minimalData() {
    return {
        datosPersonales: {
            nombreCompleto: 'CANDIDATO DE PRUEBA',
            email: 'prueba@test.com',
            telefono: '600000000',
            codigoPostal: '28001',
            municipio: 'Madrid'
        },
        experienciasLaborales: [
            { empresa: 'Empresa Prueba', puesto: 'Puesto', fechaInicio: '2020-01-01', fechaFin: '2023-12-31', descripcion: 'Descripción' }
        ],
        formaciones: [
            { titulo: 'Grado X', centro: 'Centro Y', fechaInicio: '2015-09-01', fechaFin: '2019-06-30' }
        ],
        competencias: [{ nombre: 'Competencia', nivel: 'Alto', valorObtenido: 8, valorEsperado: 7 }]
    };
}

// =============== JSREPORT API ===============
async function renderReportByName(shortName, data) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify({
            template: { name: shortName },
            data,
            options: { debug: { logsToResponseHeader: true } }
        });

        const auth = Buffer.from(`${CONFIG.jsreportUser}:${CONFIG.jsreportPassword}`).toString('base64');
        const req = http.request({
            hostname: new URL(CONFIG.jsreportUrl).hostname,
            port: Number(new URL(CONFIG.jsreportUrl).port) || 80,
            path: '/api/report',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
                'Authorization': `Basic ${auth}`
            }
        }, (res) => {
            const chunks = [];
            res.on('data', c => chunks.push(c));
            res.on('end', () => {
                if (res.statusCode === 200) {
                    const pdf = Buffer.concat(chunks);
                    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
                    const out = path.join(CONFIG.outputDir, `test_${shortName}_${timestamp()}.pdf`);
                    fs.writeFileSync(out, pdf);
                    console.log(`✅ PDF generado: ${out}`);
                    console.log(`📊 Tamaño: ${(pdf.length / 1024 / 1024).toFixed(2)} MB`);
                    resolve(out);
                } else {
                    const body = Buffer.concat(chunks).toString();
                    reject(new Error(`HTTP ${res.statusCode}: ${body.slice(0, 800)}`));
                }
            });
        });

        req.setTimeout(120000, () => { req.destroy(); reject(new Error('Timeout (120s)')); });
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

// =============== MAIN ===============
async function main() {
    console.log('🚀 Pipeline completo: git + docker + render');
    
    // Asegurar carpeta de salida
    ensureOutputDir();

    // GIT
    console.log('\n🔹 PASO 1: Git (pull / add / commit / push) en la rama actual');
    const { branch } = await gitAddCommitPush(CONFIG.dockerDir);
    console.log(`✅ Git OK en rama ${branch}`);

    // DOCKER
    console.log('\n🔹 PASO 2: Reiniciar Docker');
    await restartDocker(CONFIG.dockerDir);

    // TEMPLATE
    console.log('\n🔹 PASO 3: Selección de template y render');
    const templates = findTemplates();
    if (!templates.length) {
        console.log('❌ No se han encontrado templates.');
        process.exit(1);
    }

    templates.forEach((t, i) => console.log(`${String(i + 1).padStart(2, '0')}. ${t.name}`));
    const idx = parseInt(await ask('Selecciona un template (número): '), 10) - 1;
    const selected = templates[idx];
    if (!selected) {
        console.log('❌ Selección inválida');
        process.exit(1);
    }
    console.log(`✅ Seleccionado: ${selected.name}`);

    // DATA: buscar archivos de prueba disponibles
    let data;
    const dataFiles = findTestData();
    if (dataFiles.length > 0) {
        console.log('\n📋 DATOS DISPONIBLES:');
        dataFiles.forEach((d, i) => console.log(`   ${i + 1}. ${d.name}`));
        
        const dataChoice = await ask('\nSelecciona datos de prueba (número): ');
        const selectedData = dataFiles[parseInt(dataChoice, 10) - 1];
        
        if (!selectedData) {
            console.log('❌ Selección inválida');
            process.exit(1);
        }
        
        if (selectedData.isGenerated) {
            data = minimalData();
            console.log('✅ Datos de prueba generados');
        } else {
            data = JSON.parse(fs.readFileSync(selectedData.path, 'utf-8'));
            console.log(`✅ Datos cargados desde: ${selectedData.name}`);
        }
    } else {
        console.log('ℹ️ No hay archivos de datos disponibles. Usando datos mínimos.');
        data = minimalData();
    }

    // RENDER
    await renderReportByName(selected.shortName, data);

    rl.close();
}

if (require.main === module) {
    main().catch((e) => {
        console.error('\n❌ ERROR:', e.message);
        process.exit(1);
    });
}

module.exports = { main, CONFIG };
