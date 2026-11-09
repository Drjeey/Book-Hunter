import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 30_000,
});

export async function getOwnerId(client = pool) {
  const result = await client.query("SELECT id FROM users ORDER BY id LIMIT 1");
  if (result.rowCount === 0) {
    throw new Error("Book Hunter's owner record is missing. Run the database migrations first.");
  }
  return result.rows[0].id;
}
