'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const HOST = process.env.HOST || '0.0.0.0';
const PORT = Number.parseInt(process.env.PORT || '3000', 10);
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const SHARED_STATE_FILE = path.join(DATA_DIR, 'shared-state.json');
const MAX_BODY_BYTES = 250 * 1024;

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.pdf': 'application/pdf',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8'
};

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(body)
  });
  res.end(body);
}

function readSharedState() {
  try {
    return JSON.parse(fs.readFileSync(SHARED_STATE_FILE, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
    return {};
  }
}

function writeSharedState(state) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const temporaryFile = `${SHARED_STATE_FILE}.tmp`;
  fs.writeFileSync(temporaryFile, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
  fs.renameSync(temporaryFile, SHARED_STATE_FILE);
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    let bodyBytes = 0;

    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      bodyBytes += Buffer.byteLength(chunk);
      if (bodyBytes > MAX_BODY_BYTES) {
        reject(Object.assign(new Error('Request body is too large'), { statusCode: 413 }));
        req.destroy();
        return;
      }
      body += chunk;
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function serveStaticFile(res, pathname) {
  const requestedPath = pathname === '/' ? '/index.html' : decodeURIComponent(pathname);
  const absolutePath = path.resolve(ROOT, `.${requestedPath}`);
  if (absolutePath !== ROOT && !absolutePath.startsWith(`${ROOT}${path.sep}`)) {
    sendJson(res, 403, { error: 'Forbidden path' });
    return;
  }

  fs.stat(absolutePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      sendJson(res, 404, { error: 'Not found' });
      return;
    }

    const extension = path.extname(absolutePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[extension] || 'application/octet-stream',
      'Cache-Control': (extension === '.html' || extension === '.js') ? 'no-cache' : 'public, max-age=3600'
    });
    fs.createReadStream(absolutePath).pipe(res);
  });
}

async function handleRequest(req, res) {
  const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const { pathname } = requestUrl;

  if (req.method === 'GET' && pathname === '/api/health') {
    sendJson(res, 200, {
      status: 'ok',
      service: 'n3-study-hub-pwa',
      timestamp: new Date().toISOString()
    });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/study') {
    sendJson(res, 200, {
      app: 'JLPT N3 Mobile Study App (PDF Edition)',
      version: '2.0.0',
      authentication: 'none',
      books: [
        { id: 'goi', title: 'Mimi kara Oboeru N3 Goi', unit: 'Unit 01 (1-120)', dataScript: '/data_goi_u1.js' },
        { id: 'bunpou', title: 'Mimi kara Oboeru N3 Bunpou', unit: 'Unit 01 (1-8)', dataScript: '/data_bunpou_u1.js' },
        { id: 'kanji', title: 'Nihongo Soumatome N3 Kanji', unit: 'Week 1 (Days 1-7)', dataScript: '/data_kanji_w1.js' }
      ],
      sharedStateEndpoint: '/api/shared-state'
    });
    return;
  }

  if (pathname === '/api/shared-state') {
    if (req.method === 'GET') {
      sendJson(res, 200, readSharedState());
      return;
    }
    if (req.method === 'PUT' || req.method === 'POST') {
      const body = await readRequestBody(req);
      let nextState;
      try {
        nextState = JSON.parse(body || '{}');
      } catch {
        sendJson(res, 400, { error: 'Request body must be valid JSON' });
        return;
      }
      if (!nextState || Array.isArray(nextState) || typeof nextState !== 'object') {
        sendJson(res, 400, { error: 'Shared state must be a JSON object' });
        return;
      }
      writeSharedState(nextState);
      sendJson(res, 200, nextState);
      return;
    }
    res.setHeader('Allow', 'GET, PUT, POST');
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  if (req.method === 'HEAD') {
    res.writeHead(200);
    res.end('');
    return;
  }
  serveStaticFile(res, pathname);
}

const server = http.createServer((req, res) => {
  handleRequest(req, res).catch((error) => {
    if (error.statusCode) {
      sendJson(res, error.statusCode, { error: error.message });
      return;
    }
    console.error(error);
    if (!res.headersSent) {
      sendJson(res, 500, { error: 'Internal server error' });
    } else {
      res.destroy();
    }
  });
});

server.listen(PORT, HOST, () => {
  console.log(`N3 Study Hub running at http://localhost:${PORT}`);
  console.log(`Network access: http://<your-local-ip>:${PORT}`);
});
