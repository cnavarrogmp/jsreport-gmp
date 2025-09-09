#!/usr/bin/env node
/* eslint-env node */
'use strict';

const { exec } = require('child_process');

const CONFIG = {
    dockerDir: 'D:\\Docker\\Jsreport',
    waitForDocker: 30000
};

function execP(cmd, cwd = null) {
    return new Promise((resolve, reject) => {
        exec(cmd, { cwd, windowsHide: true }, (error, stdout, stderr) => {
            if (error) return reject(Object.assign(error, { stdout, stderr }));
            resolve({ stdout: stdout?.trim() ?? '', stderr: stderr?.trim() ?? '' });
        });
    });
}

function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function restartDocker(cwd) {
    console.log('🛑 docker-compose down');
    await execP('docker-compose down', cwd);
    await wait(1500);
    console.log('🚀 docker-compose up -d');
    await execP('docker-compose up -d', cwd);
    console.log(`⏳ Esperando ${CONFIG.waitForDocker / 1000}s...`);
    await wait(CONFIG.waitForDocker);
    console.log('✅ Docker listo');
}

async function main() { await restartDocker(CONFIG.dockerDir); }

if (require.main === module) {
    main().catch((e) => { console.error('❌ ERROR:', e.message); process.exit(1); });
}
