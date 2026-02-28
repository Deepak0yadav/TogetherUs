import { getRoomById, getCoupleMembers } from '../room/service.js';
import { getRedis, roomPositionsKey } from '../../db/redis.js';

export function registerRoomHandlers(io, socket) {
  socket.on('room:join', async (roomId, cb) => {
    try {
      const room = await getRoomById(roomId);
      if (!room) return cb?.({ error: 'Room not found' });
      const members = await getCoupleMembers(room.couple_id);
      if (!members.includes(socket.user.id)) return cb?.({ error: 'Not a member of this couple' });
      await socket.join(roomId);
      socket.roomId = roomId;
      const redis = getRedis();
      const positions = await redis.hgetall(roomPositionsKey(roomId));
      cb?.({ ok: true, positions: positions || {} });
    } catch (e) {
      cb?.({ error: e.message });
    }
  });

  socket.on('disconnect', async () => {
    if (socket.roomId) {
      const redis = getRedis();
      await redis.hdel(roomPositionsKey(socket.roomId), socket.user.id);
      socket.to(socket.roomId).emit('avatar:left', { userId: socket.user.id });
    }
  });
}
