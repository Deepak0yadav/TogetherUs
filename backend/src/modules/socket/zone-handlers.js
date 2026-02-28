import { getRedis, activeZoneKey } from '../../db/redis.js';

const ZONES = ['kitchen', 'lounge', 'garden', 'bedroom', 'office'];

export function registerZoneHandlers(io, socket) {
  socket.on('zone:enter', async (payload, cb) => {
    if (!socket.roomId) return cb?.({ error: 'Not in a room' });
    const { zone } = payload;
    if (!ZONES.includes(zone)) return cb?.({ error: 'Invalid zone' });
    const redis = getRedis();
    const key = activeZoneKey(socket.roomId);
    await redis.hset(key, socket.user.id, zone);
    await redis.expire(key, 300);
    const membersInZone = await redis.hgetall(key);
    const inSameZone = Object.values(membersInZone).filter((z) => z === zone).length >= 2;
    io.to(socket.roomId).emit('zone:state', {
      zone,
      userId: socket.user.id,
      active: inSameZone,
      membersInZone: membersInZone,
    });
    cb?.({ ok: true, active: inSameZone });
  });

  socket.on('zone:leave', async (payload) => {
    if (!socket.roomId) return;
    const redis = getRedis();
    const key = activeZoneKey(socket.roomId);
    await redis.hdel(key, socket.user.id);
    socket.to(socket.roomId).emit('zone:left', { userId: socket.user.id });
  });
}
