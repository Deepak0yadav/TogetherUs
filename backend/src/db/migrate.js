import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './client.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function migrate() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  // Remove the trigger that uses EXECUTE FUNCTION (typo in schema - should be EXECUTE PROCEDURE in older PG)
  await pool.query(sql);
  console.log('Migration complete.');
  await pool.end();
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
