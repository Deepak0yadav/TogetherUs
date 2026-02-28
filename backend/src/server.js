import 'dotenv/config';
import http from 'http';
import { app } from './app.js';
import { initSocket } from './socket.js';
import { initDb } from './db/client.js';

const PORT = process.env.PORT || 4000;

async function start() {
  await initDb();
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
