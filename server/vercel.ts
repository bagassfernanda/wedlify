import { createApp } from './app';
import { openDatabase } from './db';
import type { Db } from './db';

// Awal program untuk versi online: Vercel memanggil aplikasi ini setiap ada
// permintaan ke /api, dan datanya disimpan di Turso (SQLite versi cloud).
let database: Promise<Db> | undefined;

function getDatabase(): Promise<Db> {
  const url = process.env.TURSO_DATABASE_URL;

  if (!url) {
    return Promise.reject(new Error('TURSO_DATABASE_URL belum diatur di Vercel.'));
  }

  database ??= openDatabase({ url, authToken: process.env.TURSO_AUTH_TOKEN }).catch((error) => {
    // Kegagalan membuka koneksi tidak disimpan, supaya permintaan berikutnya mencoba lagi.
    database = undefined;
    throw error;
  });

  return database;
}

export default createApp(getDatabase);
