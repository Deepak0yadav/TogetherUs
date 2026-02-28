import { Router } from 'express';
import { query } from '../../db/client.js';
import * as roomService from './service.js';

import pkg from 'jsonwebtoken';
const { verify } = pkg;

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'togetheros-secret';

function requireAuth(req, res, next) {
  if (req.user) return next();
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer '))
    return res.status(401).json({ error: 'Not authenticated' });
  try {
    const decoded = verify(authHeader.split(' ')[1], JWT_SECRET);
    req.user = { id: decoded.userId };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

const router = Router({ mergeParams: true });
router.use(requireAuth);

router.post('/:roomId/sessions', async (req, res) => {
  try {
    const { roomId } = req.params;
    const myRoomId = await roomService.getRoomIdForUser(req.user.id);
    if (myRoomId !== roomId) return res.status(403).json({ error: 'Not your room' });

    const { type, duration, metadata } = req.body;
    if (!type) return res.status(400).json({ error: 'type is required' });

    const result = await query(
      'INSERT INTO sessions (room_id, type, duration, metadata) VALUES ($1, $2, $3, $4) RETURNING *',
      [roomId, type, duration || null, metadata ? JSON.stringify(metadata) : null]
    );
    res.status(201).json(result.rows[0]);
  } catch (e) {
    console.error('[sessions] create error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

router.get('/:roomId/sessions', async (req, res) => {
  try {
    const { roomId } = req.params;
    const myRoomId = await roomService.getRoomIdForUser(req.user.id);
    if (myRoomId !== roomId) return res.status(403).json({ error: 'Not your room' });

    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = parseInt(req.query.offset) || 0;

    const result = await query(
      'SELECT * FROM sessions WHERE room_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [roomId, limit, offset]
    );
    res.json({ sessions: result.rows });
  } catch (e) {
    console.error('[sessions] list error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

export default router;
