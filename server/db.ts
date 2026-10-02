import fs from 'node:fs';
import path from 'node:path';
import { hashPassword } from './password';

type SqlValue = string | number | null;

// Dua penyimpanan dengan perintah SQL yang sama: berkas SQLite untuk lokal,
// dan Turso (SQLite versi cloud) untuk versi online.
export interface Db {
  one<T>(sql: string, params: SqlValue[]): Promise<T | undefined>;
  all<T>(sql: string, params: SqlValue[]): Promise<T[]>;
  run(sql: string, params: SqlValue[]): Promise<{ changes: number; lastId: number }>;
  script(sql: string): Promise<void>;
}

export type DatabaseTarget = { file: string } | { url: string; authToken?: string };

export const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'admin123';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('customer', 'admin')),
  is_active INTEGER NOT NULL DEFAULT 1,
  failed_login_count INTEGER NOT NULL DEFAULT 0,
  locked_until INTEGER,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS password_resets (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS promos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('percent', 'fixed')),
  value INTEGER NOT NULL,
  min_subtotal INTEGER NOT NULL,
  max_discount INTEGER,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  bride_name TEXT NOT NULL,
  groom_name TEXT NOT NULL,
  wedding_date TEXT NOT NULL,
  location TEXT NOT NULL,
  template_name TEXT NOT NULL,
  package_name TEXT NOT NULL,
  guest_count INTEGER NOT NULL,
  extra_print_qty INTEGER NOT NULL,
  promo_code TEXT NOT NULL DEFAULT '',
  design_notes TEXT NOT NULL DEFAULT '',
  package_price INTEGER NOT NULL,
  print_cost INTEGER NOT NULL,
  subtotal INTEGER NOT NULL,
  discount INTEGER NOT NULL,
  total INTEGER NOT NULL,
  status TEXT NOT NULL,
  payment_method TEXT,
  payment_sender TEXT,
  payment_amount INTEGER,
  payment_date TEXT,
  reject_reason TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;

async function openLocalFile(file: string): Promise<Db> {
  const { DatabaseSync } = await import('node:sqlite');

  if (file !== ':memory:') {
    fs.mkdirSync(path.dirname(file), { recursive: true });
  }

  const sqlite = new DatabaseSync(file);
  sqlite.exec('PRAGMA foreign_keys = ON');

  return {
    one: async <T>(sql: string, params: SqlValue[]) => sqlite.prepare(sql).get(...params) as T | undefined,
    all: async <T>(sql: string, params: SqlValue[]) => sqlite.prepare(sql).all(...params) as T[],
    run: async (sql, params) => {
      const result = sqlite.prepare(sql).run(...params);
      return { changes: Number(result.changes), lastId: Number(result.lastInsertRowid) };
    },
    script: async (sql) => sqlite.exec(sql),
  };
}

async function openTurso(url: string, authToken: string | undefined): Promise<Db> {
  const { createClient } = await import('@libsql/client/web');
  const client = createClient({ url, authToken });

  return {
    one: async <T>(sql: string, params: SqlValue[]) =>
      (await client.execute({ sql, args: params })).rows[0] as unknown as T | undefined,
    all: async <T>(sql: string, params: SqlValue[]) =>
      (await client.execute({ sql, args: params })).rows as unknown as T[],
    run: async (sql, params) => {
      const result = await client.execute({ sql, args: params });
      return { changes: result.rowsAffected, lastId: Number(result.lastInsertRowid ?? 0) };
    },
    script: (sql) => client.executeMultiple(sql),
  };
}

export async function openDatabase(target: DatabaseTarget): Promise<Db> {
  const db = 'url' in target ? await openTurso(target.url, target.authToken) : await openLocalFile(target.file);

  await db.script(SCHEMA);
  await seedDatabase(db);
  return db;
}

export function queryOne<T>(db: Db, sql: string, ...params: SqlValue[]): Promise<T | undefined> {
  return db.one<T>(sql, params);
}

export function queryAll<T>(db: Db, sql: string, ...params: SqlValue[]): Promise<T[]> {
  return db.all<T>(sql, params);
}

export function execute(db: Db, sql: string, ...params: SqlValue[]): Promise<{ changes: number; lastId: number }> {
  return db.run(sql, params);
}

// Akun admin dan promo awal dibuat satu kali saat database baru.
// "OR IGNORE" menjaga agar dua server yang menyala bersamaan tidak bentrok.
async function seedDatabase(db: Db): Promise<void> {
  const now = new Date().toISOString();

  if (!(await queryOne(db, 'SELECT id FROM users WHERE email = ?', ADMIN_EMAIL))) {
    await execute(
      db,
      'INSERT OR IGNORE INTO users (name, email, phone, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      'Admin Wedlify',
      ADMIN_EMAIL,
      '082228931153',
      hashPassword(ADMIN_PASSWORD),
      'admin',
      now,
    );
  }

  if (!(await queryOne(db, "SELECT value FROM meta WHERE key = 'promos_seeded'"))) {
    const insertPromo =
      'INSERT OR IGNORE INTO promos (code, type, value, min_subtotal, max_discount, created_at) VALUES (?, ?, ?, ?, ?, ?)';

    await execute(db, insertPromo, 'WEDLIFY10', 'percent', 10, 300_000, 75_000, now);
    await execute(db, insertPromo, 'NIKAH50', 'fixed', 50_000, 500_000, null, now);
    await execute(db, "INSERT OR IGNORE INTO meta (key, value) VALUES ('promos_seeded', '1')");
  }
}
