import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// lab: stock publish step (mirrors NpmCommand.publish shape: npm publish <tgz> + token env).
const root = process.cwd();
const outDir = path.join(root, 'release-out');
const tgz = fs.readdirSync(outDir).find((f) => f.endsWith('.tgz'));
if (!tgz) {
  console.error('no tgz found');
  process.exit(1);
}

const npmrc = path.join(root, '.npmrc-lab');
fs.writeFileSync(npmrc, 'registry=https://127.0.0.1:8901/\n//127.0.0.1:8901/:_authToken=${WST_TOKEN}\n');
console.log('NPMRC_CONTENT=' + JSON.stringify(fs.readFileSync(npmrc, 'utf8')));

const r = spawnSync('npm', ['publish', path.join(outDir, tgz), '--userconfig', npmrc, '--access', 'public', '--tag', 'lab'], {
  encoding: 'utf8',
  env: {...process.env, NO_PROXY: '', no_proxy: ''},
});
console.log('NPM_EXIT=' + r.status);
console.log('NPM_STDOUT=' + (r.stdout || '').trim());
console.log('NPM_STDERR=' + (r.stderr || '').trim());
process.exit(r.status ?? 1);