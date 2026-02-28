import { getRedis, roomPositionsKey } from '../../db/redis.js';

const POSITION_TTL = 60;

export function registerMovementHandlers(io, socket) {
  socket.on('move', async (payload) => {
    if (!socket.roomId) return;
    const { x, y, direction } = payload;
    if (typeof x !== 'number' || typeof y !== 'number') return;
    const data = JSON.stringify({
      userId: socket.user.id,
      name: socket.user.name,
      x,
      y,
      direction: direction ?? 'down',
      updatedAt: Date.now(),
    });
    const redis = getRedis();
    const key = roomPositionsKey(socket.roomId);
    await redis.hset(key, socket.user.id, data);
    await redis.expire(key, POSITION_TTL);
    socket.to(socket.roomId).emit('avatar:move', {
      userId: socket.user.id,
      name: socket.user.name,
      x,
      y,
      direction: direction ?? 'down',
    });
  });
}
