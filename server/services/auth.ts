import { randomBytes, randomInt } from 'node:crypto';
import type { PublicUser } from '../../src/lib/models';
import type { Role } from '../../src/lib/orderRules';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  profileSchema,
  registerSchema,
  resetPasswordSchema,
} from '../../src/lib/validation';
import { execute, queryOne } from '../db';
import type { Db } from '../db';
import { HttpError, parseInput } from '../errors';
import { hashPassword, verifyPassword } from '../password';

export const MAX_FAILED_LOGIN = 5;
export const LOCK_DURATION_MS = 5 * 60 * 1000;
export const RESET_CODE_TTL_MS = 10 * 60 * 1000;
export const MAX_RESET_ATTEMPTS = 3;
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

interface UserRow {
  id: number;
  name: string;
  email: string;
  phone: string;
  password_hash: string;
  role: Role;
  is_active: number;
  failed_login_count: number;
  locked_until: number | null;
  created_at: string;
}

interface ResetRow {
  user_id: number;
  code: string;
  expires_at: number;
  attempts: number;
}

function toPublicUser({ id, name, email, phone, role }: UserRow): PublicUser {
  return { id, name, email, phone, role };
}

function findUserById(db: Db, id: number): Promise<UserRow | undefined> {
  return queryOne<UserRow>(db, 'SELECT * FROM users WHERE id = ?', id);
}

function findUserByEmail(db: Db, email: string): Promise<UserRow | undefined> {
  return queryOne<UserRow>(db, 'SELECT * FROM users WHERE email = ?', email);
}

export async function registerCustomer(db: Db, input: unknown, now = new Date()): Promise<PublicUser> {
  const { name, email, phone, password } = parseInput(registerSchema, input);

  if (await findUserByEmail(db, email)) {
    throw new HttpError(409, 'Email sudah terdaftar. Silakan masuk atau gunakan email lain.', 'email');
  }

  const { lastId } = await execute(
    db,
    'INSERT INTO users (name, email, phone, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    name,
    email,
    phone,
    hashPassword(password),
    'customer',
    now.toISOString(),
  );

  return { id: lastId, name, email, phone, role: 'customer' };
}

export async function login(
  db: Db,
  input: unknown,
  now = new Date(),
): Promise<{ user: PublicUser; token: string }> {
  const { email, password } = parseInput(loginSchema, input);
  const time = now.getTime();
  const user = await findUserByEmail(db, email);

  if (!user) {
    throw new HttpError(401, 'Email atau password salah.');
  }

  if (user.locked_until !== null && time < user.locked_until) {
    const minutesLeft = Math.ceil((user.locked_until - time) / 60_000);
    throw new HttpError(
      423,
      `Akun terkunci karena terlalu banyak percobaan gagal. Coba lagi dalam ${minutesLeft} menit.`,
    );
  }

  // Jika masa kunci sudah lewat, hitungan gagal dimulai lagi dari 0.
  let failedCount = user.locked_until !== null ? 0 : user.failed_login_count;

  if (!verifyPassword(password, user.password_hash)) {
    failedCount += 1;

    if (failedCount >= MAX_FAILED_LOGIN) {
      await execute(
        db,
        'UPDATE users SET failed_login_count = ?, locked_until = ? WHERE id = ?',
        failedCount,
        time + LOCK_DURATION_MS,
        user.id,
      );
      throw new HttpError(423, `Akun dikunci selama 5 menit karena ${MAX_FAILED_LOGIN} kali gagal masuk.`);
    }

    await execute(
      db,
      'UPDATE users SET failed_login_count = ?, locked_until = NULL WHERE id = ?',
      failedCount,
      user.id,
    );
    throw new HttpError(401, `Email atau password salah. Sisa percobaan: ${MAX_FAILED_LOGIN - failedCount}.`);
  }

  await execute(db, 'UPDATE users SET failed_login_count = 0, locked_until = NULL WHERE id = ?', user.id);

  if (user.is_active === 0) {
    throw new HttpError(403, 'Akun dinonaktifkan oleh admin. Hubungi admin Wedlify.');
  }

  const token = randomBytes(32).toString('hex');

  await execute(
    db,
    'INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)',
    token,
    user.id,
    time + SESSION_TTL_MS,
  );
  return { user: toPublicUser(user), token };
}

export async function getSessionUser(db: Db, token: string | null, now = new Date()): Promise<PublicUser | null> {
  if (!token) {
    return null;
  }

  const user = await queryOne<UserRow>(
    db,
    `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token = ? AND s.expires_at > ? AND u.is_active = 1`,
    token,
    now.getTime(),
  );

  return user ? toPublicUser(user) : null;
}

export async function logout(db: Db, token: string | null): Promise<void> {
  if (token) {
    await execute(db, 'DELETE FROM sessions WHERE token = ?', token);
  }
}

// Aplikasi belum punya layanan email, jadi kode reset dikembalikan ke halaman
// untuk ditampilkan sebagai simulasi email.
export async function requestPasswordReset(
  db: Db,
  input: unknown,
  now = new Date(),
): Promise<{ code: string; expiresInMinutes: number }> {
  const { email } = parseInput(forgotPasswordSchema, input);
  const user = await findUserByEmail(db, email);

  if (!user) {
    throw new HttpError(404, 'Email belum terdaftar.', 'email');
  }

  if (user.role === 'admin') {
    throw new HttpError(403, 'Reset password tidak tersedia untuk akun admin.', 'email');
  }

  const code = String(randomInt(0, 1_000_000)).padStart(6, '0');

  await execute(
    db,
    `INSERT INTO password_resets (user_id, code, expires_at, attempts) VALUES (?, ?, ?, 0)
     ON CONFLICT (user_id) DO UPDATE SET code = excluded.code, expires_at = excluded.expires_at, attempts = 0`,
    user.id,
    code,
    now.getTime() + RESET_CODE_TTL_MS,
  );

  return { code, expiresInMinutes: RESET_CODE_TTL_MS / 60_000 };
}

export async function resetPassword(db: Db, input: unknown, now = new Date()): Promise<void> {
  const body = (input ?? {}) as Record<string, unknown>;
  const { email } = parseInput(forgotPasswordSchema, { email: body.email });
  const { code, password } = parseInput(resetPasswordSchema, body);
  const user = await findUserByEmail(db, email);
  const request = user && (await queryOne<ResetRow>(db, 'SELECT * FROM password_resets WHERE user_id = ?', user.id));

  if (!user || !request) {
    throw new HttpError(400, 'Minta kode reset terlebih dahulu.');
  }

  if (now.getTime() > request.expires_at) {
    await execute(db, 'DELETE FROM password_resets WHERE user_id = ?', user.id);
    throw new HttpError(410, 'Kode reset sudah kedaluwarsa. Minta kode baru.');
  }

  if (code !== request.code) {
    const attempts = request.attempts + 1;

    if (attempts >= MAX_RESET_ATTEMPTS) {
      await execute(db, 'DELETE FROM password_resets WHERE user_id = ?', user.id);
      throw new HttpError(400, `Kode reset salah ${MAX_RESET_ATTEMPTS} kali. Minta kode baru.`);
    }

    await execute(db, 'UPDATE password_resets SET attempts = ? WHERE user_id = ?', attempts, user.id);
    throw new HttpError(400, `Kode reset salah. Sisa percobaan: ${MAX_RESET_ATTEMPTS - attempts}.`, 'code');
  }

  if (verifyPassword(password, user.password_hash)) {
    throw new HttpError(422, 'Password baru tidak boleh sama dengan password lama.', 'password');
  }

  await execute(
    db,
    'UPDATE users SET password_hash = ?, failed_login_count = 0, locked_until = NULL WHERE id = ?',
    hashPassword(password),
    user.id,
  );
  await execute(db, 'DELETE FROM password_resets WHERE user_id = ?', user.id);
  await execute(db, 'DELETE FROM sessions WHERE user_id = ?', user.id);
}

export async function updateProfile(db: Db, userId: number, input: unknown): Promise<PublicUser> {
  const { name, phone } = parseInput(profileSchema, input);

  await execute(db, 'UPDATE users SET name = ?, phone = ? WHERE id = ?', name, phone, userId);

  const user = await findUserById(db, userId);

  if (!user) {
    throw new HttpError(404, 'Akun tidak ditemukan. Silakan masuk kembali.');
  }

  return toPublicUser(user);
}

export async function changePassword(db: Db, userId: number, input: unknown): Promise<void> {
  const { currentPassword, password } = parseInput(changePasswordSchema, input);
  const user = await findUserById(db, userId);

  if (!user) {
    throw new HttpError(404, 'Akun tidak ditemukan. Silakan masuk kembali.');
  }

  if (!verifyPassword(currentPassword, user.password_hash)) {
    throw new HttpError(422, 'Password saat ini salah.', 'currentPassword');
  }

  await execute(db, 'UPDATE users SET password_hash = ? WHERE id = ?', hashPassword(password), userId);
}
