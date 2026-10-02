import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { createApp } from './app';
import { ADMIN_EMAIL, openDatabase } from './db';

// Awal program untuk menjalankan aplikasi di komputer sendiri.
// Versi online di Vercel memakai server/vercel.ts.
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT ?? 3000);
const isProduction = process.argv.includes('--production') || process.env.NODE_ENV === 'production';
const databaseFile = process.env.DATABASE_FILE ?? path.join(rootDir, 'data', 'wedlify.db');

const database = openDatabase({ file: databaseFile });
const app = createApp(() => database);
const server = http.createServer(app);

await database;

if (isProduction) {
  // Hasil `npm run build` disajikan langsung oleh server ini.
  const distDir = path.join(rootDir, 'dist');

  app.use(express.static(distDir));
  app.get('*', (_req, res) => res.sendFile(path.join(distDir, 'index.html')));
} else {
  // Saat pengembangan, Vite berjalan di dalam server yang sama.
  const { createServer } = await import('vite');
  const vite = await createServer({
    root: rootDir,
    appType: 'spa',
    server: { middlewareMode: true, hmr: process.env.DISABLE_HMR === 'true' ? false : { server } },
  });

  app.use(vite.middlewares);
}

server.listen(port, '0.0.0.0', () => {
  console.log(`Wedlify berjalan di http://localhost:${port}`);
  console.log(`Database: ${databaseFile}`);
  console.log(`Akun admin: ${ADMIN_EMAIL}`);
});
