import Redis from 'ioredis';

let redis;

export function getRedis() {
  if (!redis) {
    const url = process.env.REDIS_URL || 'redis://localhost:6379';
    redis = new Redis(url);
  }
  return redis;
}

export async function initRedis() {
  const r = getRedis();
  await r.ping();
  return r;
}

export const roomPositionsKey = (roomId) => `room:${roomId}:positions`;
export const activeZoneKey = (roomId) => `room:${roomId}:active_zone`;
export const watchStateKey = (roomId) => `room:${roomId}:watch`;
export const focusStateKey = (roomId) => `room:${roomId}:focus`;
