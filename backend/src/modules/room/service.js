import { query } from '../../db/client.js';

export async function getRoomByCoupleId(coupleId) {
  const { rows } = await query(
    'SELECT id, couple_id, layout_json, created_at FROM rooms WHERE couple_id = $1',
    [coupleId]
  );
  return rows[0];
}

export async function getRoomById(roomId) {
  const { rows } = await query(
    'SELECT id, couple_id, layout_json, created_at FROM rooms WHERE id = $1',
    [roomId]
  );
  return rows[0];
}

export async function updateRoomLayout(roomId, layoutJson) {
  await query(
    'UPDATE rooms SET layout_json = $1, updated_at = NOW() WHERE id = $2',
    [JSON.stringify(layoutJson), roomId]
  );
  return getRoomById(roomId);
}

export async function getRoomIdForUser(userId) {
  const { rows } = await query(
    `SELECT r.id FROM rooms r
     JOIN couples c ON c.id = r.couple_id
     JOIN couple_members cm ON cm.couple_id = c.id
     WHERE cm.user_id = $1`,
    [userId]
  );
  return rows[0]?.id;
}

export async function getCoupleMembers(coupleId) {
  const { rows } = await query(
    'SELECT user_id FROM couple_members WHERE couple_id = $1',
    [coupleId]
  );
  return rows.map((r) => r.user_id);
}
