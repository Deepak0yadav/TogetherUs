import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

const SOCKET_URL = import.meta.env.VITE_API_URL || '';

export function useSocket(roomId) {
  const token = useAuthStore((s) => s.token);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!roomId || !token) return;
    const socket = io(SOCKET_URL, {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;
    socket.on('connect', () => {
      setConnected(true);
      socket.emit('room:join', roomId, (res) => {
        if (res?.error) console.error('room:join', res.error);
      });
    });
    socket.on('disconnect', () => setConnected(false));
    return () => {
      socket.emit('room:leave');
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [roomId, token]);

  return { socket: socketRef.current, connected };
}
