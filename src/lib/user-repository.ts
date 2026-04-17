import { randomUUID } from 'crypto';
import { queryDb } from '@/lib/db';

export interface DbUser {
  id: string;
  email: string;
  password_hash: string;
  username: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export async function findUserByEmail(email: string) {
  const normalizedEmail = email.toLowerCase();
  const result = await queryDb<DbUser>(
    `
      SELECT id, email, password_hash, username, avatar_url, is_active, created_at, updated_at, last_login_at
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [normalizedEmail],
  );

  return result.rows[0] ?? null;
}

export async function findUserById(id: string) {
  const result = await queryDb<DbUser>(
    `
      SELECT id, email, password_hash, username, avatar_url, is_active, created_at, updated_at, last_login_at
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );

  return result.rows[0] ?? null;
}

export async function createUser(email: string, passwordHash: string, username?: string) {
  const normalizedEmail = email.toLowerCase();
  const result = await queryDb<DbUser>(
    `
      INSERT INTO users (id, email, password_hash, username, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id, email, password_hash, username, avatar_url, is_active, created_at, updated_at, last_login_at
    `,
    [randomUUID(), normalizedEmail, passwordHash, username?.trim() || null],
  );

  return result.rows[0];
}

export async function updateLastLoginAt(id: string) {
  await queryDb(
    `
      UPDATE users
      SET last_login_at = NOW(), updated_at = NOW()
      WHERE id = $1
    `,
    [id],
  );
}
