#!/usr/bin/env node
/* Auto-deploy on save: pantau folder repo, setiap perubahan di-commit & di-push
   ke main sehingga deploy ke VPS berjalan otomatis. */
const chokidar = require('chokidar');
const { execSync } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');
const log = (...a) => console.log(new Date().toLocaleTimeString('id-ID'), ...a);

const watcher = chokidar.watch('.', {
  cwd: root,
  ignored: [
    /(^|[\/\\])\../,     // file/folder tersembunyi (.git, .next, dll)
    /node_modules/,
    /dist\//,
    /\.next\//,
    /\.log$/,
    /\.DS_Store/,
  ],
  ignoreInitial: true,
  awaitWriteFinish: { stabilityThreshold: 1200, pollInterval: 250 },
});

let timer = null;
const debounceMs = 5000;

function deploy() {
  try {
    const stamp = new Date().toLocaleTimeString('id-ID').replace(/[:\s]/g, '-');
    const cmd =
      'git add -A && ' +
      '(git diff --cached --quiet || git commit -m "autodeploy: save ' + stamp + '") && ' +
      'git push origin main 2>&1';
    const out = execSync(cmd, { cwd: root, stdio: 'pipe' });
    const lines = out.toString().trim().split('\n').filter(Boolean);
    log('deployed ->', lines[lines.length - 1] || 'ok');
  } catch (e) {
    log('ERROR:', (e.stderr || e.stdout || e.message).toString().trim().split('\n').pop());
  }
}

watcher
  .on('all', (event, file) => {
    log('perubahan:', event, file);
    clearTimeout(timer);
    timer = setTimeout(deploy, debounceMs);
  })
  .on('error', (e) => log('WATCHER ERROR:', e.message));

log('Watcher aktif. Simpan file apa pun di repo -> auto-commit & push (deploy).');
log('Akar pemantauan:', root);
