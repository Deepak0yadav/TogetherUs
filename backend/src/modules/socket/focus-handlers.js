import { getRedis, focusStateKey } from '../../db/redis.js';
import { query } from '../../db/client.js';

const timers = new Map();

export function registerFocusHandlers(io, socket) {
  socket.on('focus:start', async ({ duration }) => {
    if (!socket.roomId) return;
    const roomId = socket.roomId;
    const dur = Math.min(Math.max(duration || 1500, 60), 7200);

    if (timers.has(roomId)) clearInterval(timers.get(roomId));

    const state = { remaining: dur, total: dur, running: true, startedAt: Date.now() };
    const redis = getRedis();
    await redis.set(focusStateKey(roomId), JSON.stringify(state), 'EX', dur + 60);

    io.to(roomId).emit('focus:start', { remaining: dur, total: dur });

    const interval = setInterval(async () => {
      const raw = await redis.get(focusStateKey(roomId));
      if (!raw) { clearInterval(interval); timers.delete(roomId); return; }
      const s = JSON.parse(raw);
      if (!s.running) return;
      s.remaining -= 1;
      if (s.remaining <= 0) {
        clearInterval(interval);
        timers.delete(roomId);
        await redis.del(focusStateKey(roomId));
        io.to(roomId).emit('focus:complete', { total: s.total });
        try {
          await query(
            'INSERT INTO sessions (room_id, type, duration, metadata) VALUES ($1, $2, $3, $4)',
            [roomId, 'focus', s.total, JSON.stringify({ completedAt: new Date().toISOString() })]
          );
        } catch (e) { console.error('[focus] session save error:', e.message); }
        return;
      }
      await redis.set(focusStateKey(roomId), JSON.stringify(s), 'EX', s.remaining + 60);
      io.to(roomId).emit('focus:tick', { remaining: s.remaining });
    }, 1000);

    timers.set(roomId, interval);
  });

  socket.on('focus:pause', async () => {
    if (!socket.roomId) return;
    const redis = getRedis();
    const raw = await redis.get(focusStateKey(socket.roomId));
    if (!raw) return;
    const s = JSON.parse(raw);
    s.running = false;
    await redis.set(focusStateKey(socket.roomId), JSON.stringify(s), 'EX', 3600);
    io.to(socket.roomId).emit('focus:pause', { remaining: s.remaining });
  });

  socket.on('focus:resume', async () => {
    if (!socket.roomId) return;
    const redis = getRedis();
    const raw = await redis.get(focusStateKey(socket.roomId));
    if (!raw) return;
    const s = JSON.parse(raw);
    s.running = true;
    await redis.set(focusStateKey(socket.roomId), JSON.stringify(s), 'EX', s.remaining + 60);
    io.to(socket.roomId).emit('focus:resume', { remaining: s.remaining });
  });

  socket.on('focus:cancel', async () => {
    if (!socket.roomId) return;
    const roomId = socket.roomId;
    if (timers.has(roomId)) { clearInterval(timers.get(roomId)); timers.delete(roomId); }
    await getRedis().del(focusStateKey(roomId));
    io.to(roomId).emit('focus:cancel');
  });

  socket.on('focus:sync', async (_, cb) => {
    if (!socket.roomId) return cb?.({ error: 'Not in a room' });
    const raw = await getRedis().get(focusStateKey(socket.roomId));
    cb?.(raw ? JSON.parse(raw) : null);
  });
}
