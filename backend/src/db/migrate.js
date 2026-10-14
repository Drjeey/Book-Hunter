import { readdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { Pool } from 'pg'

const migrationsDirectory = fileURLToPath(new URL('../../../database/migrations/', import.meta.url))
const migrationLockId = 71824061

async function runMigrations() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is missing. Copy backend/.env.example to backend/.env and set your local PostgreSQL password.')
  }

  const pool = new Pool({ connectionString })

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `)

    const migrationFiles = (await readdir(migrationsDirectory))
      .filter((name) => /^\d+_[a-z0-9_-]+\.sql$/.test(name))
      .sort()

    const client = await pool.connect()
    try {
      for (const version of migrationFiles) {
        const sql = await readFile(new URL(`../../../database/migrations/${version}`, import.meta.url), 'utf8')
        await client.query('BEGIN')

        try {
          await client.query('SELECT pg_advisory_xact_lock($1::bigint)', [migrationLockId])
          const applied = await client.query(
            'SELECT 1 FROM schema_migrations WHERE version = $1',
            [version],
          )

          if (applied.rowCount > 0) {
            await client.query('ROLLBACK')
            console.log(`Already applied: ${version}`)
            continue
          }

          await client.query(sql)
          await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [version])
          await client.query('COMMIT')
          console.log(`Applied: ${version}`)
        } catch (error) {
          await client.query('ROLLBACK')
          throw error
        }
      }
    } finally {
      client.release()
    }
  } finally {
    await pool.end()
  }
}

runMigrations().catch((error) => {
  console.error(`Migration failed: ${error.message}`)
  process.exitCode = 1
})
