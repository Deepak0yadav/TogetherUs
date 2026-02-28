import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../../db/client.js';

const router = Router();

import pkg from 'jsonwebtoken';
const { verify } = pkg;

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'togetheros-secret';

function requireAuth(req, res, next) {
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

router.post('/create', async (req, res) => {
  try {
    const userId = req.user.id;
    const { rows: existing } = await query(
      'SELECT c.id, c.invite_code, r.id as room_id FROM couple_members cm JOIN couples c ON c.id = cm.couple_id LEFT JOIN rooms r ON r.couple_id = c.id WHERE cm.user_id = $1',
      [userId]
    );
    if (existing.length > 0) {
      const { id, invite_code, room_id } = existing[0];
      return res.status(200).json({
        couple_id: id,
        invite_code: invite_code,
        invite_link: `${req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:5173'}/invite/${invite_code}`,
        room_id: room_id,
      });
    }
    const inviteCode = uuidv4().replace(/-/g, '').slice(0, 12);
    const coupleId = uuidv4();
    const roomId = uuidv4();
    await query('BEGIN');
    await query('INSERT INTO couples (id, invite_code) VALUES ($1, $2)', [coupleId, inviteCode]);
    await query('INSERT INTO couple_members (couple_id, user_id) VALUES ($1, $2)', [coupleId, userId]);
    await query(
      'INSERT INTO rooms (id, couple_id, layout_json) VALUES ($1, $2, $3)',
      [roomId, coupleId, JSON.stringify({ furniture: [], theme: 'night' })]
    );
    await query('COMMIT');
    res.status(201).json({
      couple_id: coupleId,
      invite_code: inviteCode,
      invite_link: `${req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:5173'}/invite/${inviteCode}`,
      room_id: roomId,
    });
  } catch (e) {
    await query('ROLLBACK').catch(() => { });
    res.status(500).json({ error: e.message });
  }
});

router.post('/join', async (req, res) => {
  try {
    const { invite_code } = req.body;
    const userId = req.user.id;
    if (!invite_code) return res.status(400).json({ error: 'invite_code required' });
    const { rows: couples } = await query('SELECT id FROM couples WHERE invite_code = $1', [invite_code]);
    if (!couples.length) return res.status(404).json({ error: 'Invalid invite code' });
    const coupleId = couples[0].id;
    const { rows: members } = await query('SELECT user_id FROM couple_members WHERE couple_id = $1', [coupleId]);
    if (members.some((m) => m.user_id === userId)) return res.json({ message: 'Already in couple', couple_id: coupleId });
    if (members.length >= 2) return res.status(400).json({ error: 'Couple is full' });
    // User can only be in one couple (UNIQUE user_id); leave current couple before joining the new one (switch space)
    await query('DELETE FROM couple_members WHERE user_id = $1', [userId]);
    await query('INSERT INTO couple_members (couple_id, user_id) VALUES ($1, $2)', [coupleId, userId]);
    const { rows: [room] } = await query('SELECT id FROM rooms WHERE couple_id = $1', [coupleId]);
    res.json({ couple_id: coupleId, room_id: room.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/my', async (req, res) => {
  try {
    const userId = req.user.id;
    const { rows } = await query(
      `SELECT c.id as couple_id, c.invite_code, r.id as room_id, r.layout_json
       FROM couple_members cm
       JOIN couples c ON c.id = cm.couple_id
       LEFT JOIN rooms r ON r.couple_id = c.id
       WHERE cm.user_id = $1`,
      [userId]
    );
    if (!rows.length) return res.json({ couple: null, room: null });
    const { couple_id, invite_code, room_id, layout_json } = rows[0];
    res.json({
      couple: { id: couple_id, invite_code },
      room: room_id ? { id: room_id, layout_json } : null,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
