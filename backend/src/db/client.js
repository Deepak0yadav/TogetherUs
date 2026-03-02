import pg from 'pg';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

function getDbHostForLog() {
  try {
    const u = new URL(connectionString || '');
    return `${u.hostname}:${u.port || '5432'}`;
  } catch {
    return '(check DATABASE_URL)';
  }
}

export async function initDb() {
  const hostForLog = getDbHostForLog();
  console.log(`[backend] Connecting to Postgres at ${hostForLog}...`);
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
  } finally {
    client.release();
  }
}

export { pool };
export const query = (text, params) => pool.query(text, params);
