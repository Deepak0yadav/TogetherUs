import { Router } from 'express';
import * as roomService from './service.js';

const router = Router();

import pkg from 'jsonwebtoken';
const { verify } = pkg;

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'togetheros-secret';

function requireAuth(req, res, next) {
  // If session has it (e.g. from Google OAuth) it's valid too
  if (req.user) return next();

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verify(token, JWT_SECRET);
    req.user = { id: decoded.userId };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

router.use(requireAuth);

router.get('/my', async (req, res) => {
  try {
    const roomId = await roomService.getRoomIdForUser(req.user.id);
    if (!roomId) return res.json({ room: null });
    const room = await roomService.getRoomById(roomId);
    res.json({ room });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:roomId', async (req, res) => {
  try {
    const room = await roomService.getRoomById(req.params.roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    const myRoomId = await roomService.getRoomIdForUser(req.user.id);
    if (myRoomId !== room.id) return res.status(403).json({ error: 'Not your room' });
    res.json(room);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.patch('/:roomId/layout', async (req, res) => {
  try {
    const room = await roomService.getRoomById(req.params.roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    const myRoomId = await roomService.getRoomIdForUser(req.user.id);
    if (myRoomId !== room.id) return res.status(403).json({ error: 'Not your room' });
    const updated = await roomService.updateRoomLayout(room.id, req.body);
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
