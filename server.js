import { createServer } from 'http';
import { Readable } from 'stream';
import server from './dist/server/server.js';

const PORT = parseInt(process.env.PORT || '3000', 10);

const httpServer = createServer(async (req, res) => {
  try {
    const body = req.method === 'GET' || req.method === 'HEAD' ? undefined : await new Promise((resolve) => {
      const chunks = [];
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', () => resolve(Buffer.concat(chunks)));
    });

    const webReq = new Request(`http://${req.headers.host || 'localhost'}${req.url}`, {
      method: req.method,
      headers: req.headers,
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
    console.error('Request error:', err);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});