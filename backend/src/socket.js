import { Server } from 'socket.io';
import { initRedis } from './db/redis.js';
import { socketAuth } from './modules/auth/socket-auth.js';
import { registerRoomHandlers } from './modules/socket/room-handlers.js';
import { registerMovementHandlers } from './modules/socket/movement-handlers.js';
import { registerZoneHandlers } from './modules/socket/zone-handlers.js';
import { registerWatchHandlers } from './modules/socket/watch-handlers.js';
import { registerFocusHandlers } from './modules/socket/focus-handlers.js';
import { registerWebRTCHandlers } from './modules/socket/webrtc-handlers.js';
import { registerChatHandlers } from './modules/socket/chat-handlers.js';

let io;

export function initSocket(server) {
  const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
  io = new Server(server, {
    cors: {
      origin: (origin, cb) => {
        if (!origin || origin === allowedOrigin || /^http:\/\/localhost:51\d{2}$/.test(origin)) {
          cb(null, true);
        } else {
          cb(null, false);
        }
      },
      credentials: true,
    },
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
    registerChatHandlers(io, socket);
  });

  return io;
}

export function getIO() {
  return io;
}
