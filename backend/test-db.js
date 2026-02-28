import 'dotenv/config';
import pg from 'pg';

const { Client } = pg;

async function test() {
      const client = new Client({
            connectionString: process.env.DATABASE_URL,
            connectionTimeoutMillis: 3000,
      });

      try {
            console.log('Connecting to', process.env.DATABASE_URL);
            await client.connect();
            const res = await client.query('SELECT NOW()');
            console.log('DB Connection OK:', res.rows[0]);
      } catch (err) {
            console.error('DB Error:', err.message);
      } finally {
            await client.end().catch(() => { });
            process.exit(0);
      }
}

test();
