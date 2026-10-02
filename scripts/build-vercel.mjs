// Menyusun paket deploy untuk Vercel di folder .vercel/output:
// halaman web hasil Vite menjadi berkas statis, dan server Express menjadi satu fungsi /api.
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build as bundleServer } from 'esbuild';
import { build as buildSite } from 'vite';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = path.join(rootDir, '.vercel', 'output');
const functionDir = path.join(outputDir, 'functions', 'api.func');

await rm(outputDir, { recursive: true, force: true });

await buildSite({
  root: rootDir,
  build: { outDir: path.join(outputDir, 'static'), emptyOutDir: true },
});

await mkdir(functionDir, { recursive: true });
await bundleServer({
  entryPoints: [path.join(rootDir, 'server', 'vercel.ts')],
  outfile: path.join(functionDir, 'index.js'),
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'cjs',
  // Vercel memanggil hasil ekspor berkas ini sebagai penangan permintaan.
  footer: { js: 'module.exports = module.exports.default;' },
  logLevel: 'info',
});

await writeFile(path.join(functionDir, 'package.json'), JSON.stringify({ type: 'commonjs' }));
await writeFile(
  path.join(functionDir, '.vc-config.json'),
  JSON.stringify(
    {
      runtime: 'nodejs22.x',
      handler: 'index.js',
      launcherType: 'Nodejs',
      shouldAddHelpers: false,
      supportsResponseStreaming: true,
      // Region yang sama dengan database Turso (Tokyo) supaya kueri cepat.
      regions: ['hnd1'],
    },
    null,
    2,
  ),
);

await writeFile(
  path.join(outputDir, 'config.json'),
  JSON.stringify(
    {
      version: 3,
      routes: [
        { src: '^/api(?:/.*)?$', dest: '/api' },
        { handle: 'filesystem' },
        { src: '/(.*)', dest: '/index.html' },
      ],
    },
    null,
    2,
  ),
);

console.log(`Paket deploy siap di ${path.relative(rootDir, outputDir)}`);
