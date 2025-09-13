#!/usr/bin/env node
/* eslint-env node */
'use strict';

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

// =============== CONFIG ===============
const CONFIG = {
    dockerDir: 'D:\\Docker\\Jsreport',          // carpeta donde está tu docker-compose.yml
    composeFile: 'docker-compose.yml',          // nombre del archivo
    jsreportUrl: 'http://localhost:5488',       // URL de jsreport
    waitForDocker: 30000                        // tiempo máximo de espera (ms)
};

// =============== UTIL ===============
function execP(cmd, cwd = null) {
    return new Promise((resolve, reject) => {
        exec(cmd, { cwd, windowsHide: true }, (error, stdout, stderr) => {
            if (error) {
                const msg = [
                    `❌ Error ejecutando: ${cmd}`,
                    stdout ? `\n[stdout]\n${stdout}` : '',
                    stderr ? `\n[stderr]\n${stderr}` : ''
                ].join('\n');
                return reject(new Error(msg));
            }
            resolve({ stdout: stdout?.trim() ?? '', stderr: stderr?.trim() ?? '' });
        });
    });
}

function wait(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

async function hasDocker() {
    try {
        await execP('docker version');
        return true;
    } catch {
        return false;
    }
}

async function getComposeCmd() {
    try {
        const { stdout } = await execP('docker compose version');
        if (stdout) return 'docker compose';
    } catch { /* ignore */ }

    try {
        const { stdout } = await execP('docker-compose version');
        if (stdout) return 'docker-compose';
    } catch { /* ignore */ }

    throw new Error('No se encontró Docker Compose. Asegúrate de que Docker Desktop está abierto.');
}

async function waitForJsreportReady(baseUrl, timeoutMs = 30000) {
    const started = Date.now();
    const url = new URL(baseUrl);
    const opts = {
        hostname: url.hostname,
        port: Number(url.port) || 80,
        path: '/api/version',
        method: 'GET',
        timeout: 2000
    };

    while (Date.now() - started < timeoutMs) {
        try {
            await new Promise((resolve, reject) => {
                const req = http.request(opts, res => {
                    const ok = res.statusCode && res.statusCode >= 200 && res.statusCode < 500;
                    res.resume(); // descartar body
                    ok ? resolve() : reject(new Error(`status ${res.statusCode}`));
                });
                req.on('error', reject);
                req.on('timeout', () => { req.destroy(new Error('timeout')); });
                req.end();
            });
            return; // ✅ listo
        } catch {
            await wait(1500);
        }
    }
    throw new Error(`jsreport no respondió en ${Math.round(timeoutMs/1000)}s`);
}

// =============== MAIN ===============
async function main() {
    console.log('🔄 Reiniciando jsreport con Docker Compose...');

    if (!(await hasDocker())) {
        throw new Error('Docker no está disponible. Abre Docker Desktop.');
    }

    const compose = await getComposeCmd();
    const composeFilePath = path.join(CONFIG.dockerDir, CONFIG.composeFile);
    if (!fs.existsSync(composeFilePath)) {
        throw new Error(`No se encontró ${CONFIG.composeFile} en ${CONFIG.dockerDir}`);
    }

    const baseCmd = `${compose} -f "${composeFilePath}"`;

    console.log('🛑 down (con --remove-orphans)');
    await execP(`${baseCmd} down --remove-orphans`, CONFIG.dockerDir);

    console.log('🚀 up -d');
    await execP(`${baseCmd} up -d`, CONFIG.dockerDir);

    console.log('⏳ Esperando a que jsreport responda...');
    await waitForJsreportReady(CONFIG.jsreportUrl, CONFIG.waitForDocker);

    console.log('✅ jsreport está en marcha en', CONFIG.jsreportUrl);
}

if (require.main === module) {
    main().catch(err => {
        console.error(err.message);
        process.exit(1);
    });
}

module.exports = { main, CONFIG };
