import 'dotenv/config';
import http from 'http';
import { app } from './app.js';
import { initSocket } from './socket.js';
import { initDb } from './db/client.js';

const PORT = process.env.PORT || 4000;

async function start() {
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      if (attempt > 1) {
        console.log(`[backend] Retry ${attempt}/${maxAttempts} in 2s...`);
        await new Promise((r) => setTimeout(r, 2000));
      }
      await initDb();
      console.log('[backend] Database OK');
      break;
    } catch (err) {
      console.error(`[backend] DB connection failed (attempt ${attempt}/${maxAttempts}):`, err.message);
      if (attempt === maxAttempts) {
        console.error('[backend] Make sure Docker is running and Postgres is up: docker ps');
        console.error('[backend] Then: npm run docker:up  (or  docker-compose up -d )');
        throw err;
      }
    }
  }
  const server = http.createServer(app);
  initSocket(server);
  server.listen(PORT, () => {
    console.log(`TogetherOS backend listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
