import { getRedis, watchStateKey } from '../../db/redis.js';

export function registerWatchHandlers(io, socket) {
  socket.on('watch:load', async ({ url }) => {
    if (!socket.roomId) return;
    const redis = getRedis();
    const key = watchStateKey(socket.roomId);
    const state = { url, playing: false, time: 0, updatedAt: Date.now() };
    await redis.set(key, JSON.stringify(state), 'EX', 3600);
    io.to(socket.roomId).emit('watch:load', { url, userId: socket.user.id });
  });

  socket.on('watch:play', async ({ time }) => {
    if (!socket.roomId) return;
    const redis = getRedis();
    const key = watchStateKey(socket.roomId);
    const raw = await redis.get(key);
    if (!raw) return;
    const state = JSON.parse(raw);
    Object.assign(state, { playing: true, time, updatedAt: Date.now() });
    await redis.set(key, JSON.stringify(state), 'EX', 3600);
    socket.to(socket.roomId).emit('watch:play', { time, userId: socket.user.id });
  });

  socket.on('watch:pause', async ({ time }) => {
    if (!socket.roomId) return;
    const redis = getRedis();
    const key = watchStateKey(socket.roomId);
    const raw = await redis.get(key);
    if (!raw) return;
    const state = JSON.parse(raw);
    Object.assign(state, { playing: false, time, updatedAt: Date.now() });
    await redis.set(key, JSON.stringify(state), 'EX', 3600);
    socket.to(socket.roomId).emit('watch:pause', { time, userId: socket.user.id });
  });

  socket.on('watch:seek', async ({ time }) => {
    if (!socket.roomId) return;
    const redis = getRedis();
    const key = watchStateKey(socket.roomId);
    const raw = await redis.get(key);
    if (!raw) return;
    const state = JSON.parse(raw);
    Object.assign(state, { time, updatedAt: Date.now() });
    await redis.set(key, JSON.stringify(state), 'EX', 3600);
    socket.to(socket.roomId).emit('watch:seek', { time, userId: socket.user.id });
  });

  socket.on('watch:sync', async (_, cb) => {
    if (!socket.roomId) return cb?.({ error: 'Not in a room' });
    const redis = getRedis();
    const raw = await redis.get(watchStateKey(socket.roomId));
    cb?.(raw ? JSON.parse(raw) : null);
  });

  socket.on('watch:end', async () => {
    if (!socket.roomId) return;
    const redis = getRedis();
    await redis.del(watchStateKey(socket.roomId));
    io.to(socket.roomId).emit('watch:end', { userId: socket.user.id });
  });
}
