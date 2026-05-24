import { createServer } from 'http';
import server from './dist/server/server.js';

const PORT = parseInt(process.env.PORT || '3000', 10);

const httpServer = createServer((req, res) => {
  server.fetch(req, res).catch((err) => {
    console.error(err);
    res.statusCode = 500;
    res.end('Internal Server Error');
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});