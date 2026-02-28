import pkg from 'jsonwebtoken';
const { verify } = pkg;
import { findUserById } from './service.js';

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'togetheros-secret';

export async function socketAuth(socket, next) {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (!token) return next(new Error('Authentication required'));
  try {
    const decoded = verify(token, JWT_SECRET);
    const user = await findUserById(decoded.userId);
    if (!user) return next(new Error('User not found'));
    socket.user = user;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
}
