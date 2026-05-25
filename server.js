import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { extname, join } from 'path';
import server from './dist/server/server.js';

const PORT = parseInt(process.env.PORT || '3000', 10);
const CLIENT_DIR = join(process.cwd(), 'dist', 'client');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const httpServer = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let pathname = url.pathname;

    // Serve static files
    if (pathname === '/') pathname = '/index.html';
    const filePath = join(CLIENT_DIR, pathname);

    if (existsSync(filePath) && !filePath.endsWith('.html')) {
      const ext = extname(filePath);
      const content = readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      res.end(content);
      return;
    }

    // SSR for everything else
    const body = ['GET', 'HEAD'].includes(req.method) ? undefined :
      await new Promise((resolve) => {
        const chunks = [];
        req.on('data', (chunk) => chunks.push(chunk));
        req.on('end', () => resolve(Buffer.concat(chunks)));
      });

    const webReq = new Request(`http://${req.headers.host || 'localhost'}${req.url}`, {
      method: req.method,
      headers: Object.entries(req.headers).reduce((acc, [k, v]) => {
        if (v) acc[k] = Array.isArray(v) ? v.join(', ') : v;
        return acc;
      }, {}),
      body,
    });

    const webRes = await server.fetch(webReq);
    res.statusCode = webRes.status;
    webRes.headers.forEach((value, key) => res.setHeader(key, value));

    if (webRes.body) {
      const reader = webRes.body.getReader();
      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
        res.end();
      };
      pump().catch(() => res.end());
    } else {
      const text = await webRes.text();
      res.end(text);
    }
  } catch (err) {
    console.error('Error:', err);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
    }
    res.end('Internal Server Error');
  }
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});