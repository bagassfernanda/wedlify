import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthLayout from '@/src/components/account/AuthLayout';
import { Alert, TextField } from '@/src/components/account/ui';
import { useAuth } from '@/src/context/AuthContext';
import { api } from '@/src/lib/api';
import type { PublicUser } from '@/src/lib/models';
import { navigate, pathAfterLogin } from '@/src/lib/router';
import { loginSchema } from '@/src/lib/validation';
import type { LoginInput } from '@/src/lib/validation';

const infoMessages: Record<string, string> = {
  registered: 'Pendaftaran berhasil. Silakan masuk dengan akun Anda.',
  reset: 'Password berhasil diubah. Silakan masuk dengan password baru.',
  required: 'Silakan masuk terlebih dahulu untuk membuka halaman tersebut.',
  logout: 'Anda telah keluar.',
};

interface LoginPageProps {
  info: string;
  next: string | null;
}

export default function LoginPage({ info, next }: LoginPageProps) {
  const { setUser } = useAuth();
  const [formError, setFormError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginInput) => {
    setFormError('');
    const result = await api<{ user: PublicUser }>('POST', '/auth/login', data);

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    setUser(result.data.user);
    navigate(pathAfterLogin(next, result.data.user.role));
  };

  return (
    <AuthLayout
      title="Masuk"
      subtitle="Masuk untuk membuat dan memantau pesanan undangan Anda."
      footer={
        <>
          Belum punya akun?{' '}
          <a href="#/register" className="font-semibold text-brand-gold hover:underline">
            Daftar sekarang
          </a>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {infoMessages[info] && !formError && <Alert tone="info">{infoMessages[info]}</Alert>}
        {formError && <Alert tone="error">{formError}</Alert>}

        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="nama@email.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="text-right">
          <a href="#/forgot-password" className="text-sm font-semibold text-brand-gold hover:underline">
            Lupa password?
          </a>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          data-testid="login-submit"
          className="w-full btn-primary py-4 disabled:opacity-70"
        >
          Masuk
        </button>
      </form>
    </AuthLayout>
  );
}
