import { Pool, type QueryResultRow } from 'pg';

const connectionString = process.env.POSTGRES_URL || '';

let pool: Pool | null = null;
let usersTableReadyPromise: Promise<void> | null = null;

function getPool(): Pool {
  if (!connectionString) {
    throw new Error('POSTGRES_URL is not configured');
  }

  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl: connectionString.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
    });
  }

  return pool;
}

export async function ensureUsersTable(): Promise<void> {
  if (!usersTableReadyPromise) {
    usersTableReadyPromise = getPool()
      .query(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          username TEXT,
          avatar_url TEXT,
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          last_login_at TIMESTAMPTZ
        )
      `)
      .then(() => undefined)
      .catch(error => {
        usersTableReadyPromise = null;
        throw error;
      });
  }

  await usersTableReadyPromise;
}

export async function queryDb<T extends QueryResultRow>(text: string, values: unknown[] = []) {
  await ensureUsersTable();
  return getPool().query<T>(text, values);
}
