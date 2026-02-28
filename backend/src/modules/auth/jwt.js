import pkg from 'jsonwebtoken';
const { sign } = pkg;

const SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'togetheros-secret';
const EXPIRY = '7d';

export function createToken(userId) {
  return sign({ userId }, SECRET, { expiresIn: EXPIRY });
}
