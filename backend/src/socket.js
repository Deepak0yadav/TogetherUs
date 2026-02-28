import { Server } from 'socket.io';
import { initRedis } from './db/redis.js';
import { socketAuth } from './modules/auth/socket-auth.js';
import { registerRoomHandlers } from './modules/socket/room-handlers.js';
import { registerMovementHandlers } from './modules/socket/movement-handlers.js';
import { registerZoneHandlers } from './modules/socket/zone-handlers.js';
import { registerWatchHandlers } from './modules/socket/watch-handlers.js';
import { registerFocusHandlers } from './modules/socket/focus-handlers.js';
import { registerWebRTCHandlers } from './modules/socket/webrtc-handlers.js';

let io;

export function initSocket(server) {
  io = new Server(server, {
    cors: { origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true },
    path: '/socket.io',
  });

  io.use(socketAuth);

  io.on('connection', (socket) => {
    registerRoomHandlers(io, socket);
    registerMovementHandlers(io, socket);
    registerZoneHandlers(io, socket);
    registerWatchHandlers(io, socket);
    registerFocusHandlers(io, socket);
    registerWebRTCHandlers(io, socket);
  });

  return io;
}

export function getIO() {
  return io;
}
