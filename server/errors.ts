import type * as z from 'zod';

// Kesalahan yang dikirim ke klien sebagai { error, field } dengan kode status HTTP.
export class HttpError extends Error {
  status: number;
  field?: string;

  constructor(status: number, message: string, field?: string) {
    super(message);
    this.status = status;
    this.field = field;
  }
}

export function parseInput<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);

  if (result.success) {
    return result.data;
  }

  const issue = result.error.issues[0];
  const field = typeof issue.path[0] === 'string' ? issue.path[0] : undefined;
  // Pesan bawaan Zod (berbahasa Inggris) muncul saat field tidak dikirim atau bertipe salah.
  const message = issue.message.startsWith('Invalid input')
    ? `Data ${field ?? 'yang dikirim'} wajib diisi dengan format yang benar`
    : issue.message;

  throw new HttpError(422, message, field);
}
