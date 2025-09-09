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

async function getCurrentBranch(cwd) {
    const { stdout } = await execP('git rev-parse --abbrev-ref HEAD', cwd);
    return stdout;
}

async function gitPull(cwd, branch) {
    const { stdout, stderr } = await execP(`git pull --rebase origin ${branch}`, cwd).catch(e => e);
    const out = (stdout || '') + '\n' + (stderr || '');
    const { stdout: unmerged } = await execP('git diff --name-only --diff-filter=U', cwd);
    if (out.includes('CONFLICT') || (unmerged && unmerged.trim().length > 0)) {
        throw new Error('Conflictos tras git pull. Resuélvelos y vuelve a ejecutar.');
    }
}

async function gitStatusPorcelain(cwd) {
    const { stdout } = await execP('git status --porcelain', cwd);
    return stdout.split('\n').filter(Boolean);
}

function buildCommitMessage(lines) {
    if (!lines.length) return `Actualización de plantillas · ${new Date().toLocaleString()}`;
    return `Update (${lines.length} cambios) · ${new Date().toLocaleString()}`;
}

async function gitAddCommitPush(cwd) {
    const branch = await getCurrentBranch(cwd);
    console.log(`📌 Rama actual: ${branch}`);
    await gitPull(cwd, branch);
    console.log('✅ Pull sin conflictos');

    await execP('git add -A', cwd);
    const status = await gitStatusPorcelain(cwd);
    if (!status.length) {
        console.log('ℹ️ No hay cambios para commit');
        return;
    }
    const msg = buildCommitMessage(status);
    await execP(`git commit -m "${msg.replace(/"/g, '\\"')}"`, cwd);
    await execP(`git push origin ${branch}`, cwd);
    console.log('✅ Commit & push OK');
}

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

async function main() {
    console.log('🚀 Git + Docker');
    await gitAddCommitPush(CONFIG.dockerDir);
    await restartDocker(CONFIG.dockerDir);
}

if (require.main === module) {
    main().catch((e) => { console.error('❌ ERROR:', e.message); process.exit(1); });
}
