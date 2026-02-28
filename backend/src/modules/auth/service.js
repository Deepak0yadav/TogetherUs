import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../../db/client.js';

export async function createUser({ email, name, password_hash, google_id }) {
  const id = uuidv4();
  await query(
    `INSERT INTO users (id, email, name, password_hash, google_id)
     VALUES ($1, $2, $3, $4, $5)`,
    [id, email, name, password_hash || null, google_id || null]
  );
  return { id, email, name };
}

export async function findUserByEmail(email) {
  const { rows } = await query('SELECT id, email, name, password_hash FROM users WHERE email = $1', [email]);
  return rows[0];
}

export async function findUserByGoogleId(google_id) {
  const { rows } = await query('SELECT id, email, name FROM users WHERE google_id = $1', [google_id]);
  return rows[0];
}

export async function findUserById(id) {
  const { rows } = await query('SELECT id, email, name FROM users WHERE id = $1', [id]);
  return rows[0];
}

export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

export async function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}
