import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      // Berkas yang berisi aturan bisnis. Halaman React tidak diuji lewat unit test.
      include: ['src/lib/pricing.ts', 'src/lib/orderRules.ts', 'src/lib/format.ts', 'src/lib/validation.ts', 'server/services/**', 'server/password.ts', 'server/errors.ts'],
      reporter: ['text', 'html'],
    },
  },
});
