import { useCallback, useEffect, useState } from 'react';
import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';

export interface ApiFailure {
  ok: false;
  status: number;
  error: string;
  field?: string;
}

export type ApiResult<T> = { ok: true; data: T } | ApiFailure;

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Semua data diambil dari server lewat /api. Cookie sesi ikut terkirim otomatis.
export async function api<T>(method: Method, path: string, body?: unknown): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`/api${path}`, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = response.status === 204 ? null : await response.json().catch(() => null);

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: data?.error ?? 'Terjadi kesalahan pada server.',
        field: data?.field,
      };
    }

    return { ok: true, data: data as T };
  } catch {
    return { ok: false, status: 0, error: 'Tidak dapat terhubung ke server. Pastikan server berjalan.' };
  }
}

// Menaruh pesan server di bawah field yang bersangkutan. Jika pesannya bukan
// tentang field di form ini, pesan dikembalikan untuk ditampilkan di atas form.
export function reportFailure<T extends FieldValues>(
  failure: ApiFailure,
  form: Pick<UseFormReturn<T>, 'setError' | 'getValues'>,
): string {
  if (failure.field && Object.hasOwn(form.getValues(), failure.field)) {
    form.setError(failure.field as Path<T>, { message: failure.error });
    return '';
  }

  return failure.error;
}

interface ApiData<T> {
  data: T | null;
  error: string;
  loading: boolean;
}

export function useApiData<T>(path: string) {
  const [state, setState] = useState<ApiData<T>>({ data: null, error: '', loading: true });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;

    api<T>('GET', path).then((result) => {
      if (active) {
        setState(
          result.ok
            ? { data: result.data, error: '', loading: false }
            : { data: null, error: result.error, loading: false },
        );
      }
    });

    return () => {
      active = false;
    };
  }, [path, version]);

  const reload = useCallback(() => setVersion((current) => current + 1), []);
  const setData = useCallback((data: T) => setState({ data, error: '', loading: false }), []);

  return { ...state, reload, setData };
}
