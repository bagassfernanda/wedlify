import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthLayout from '@/src/components/account/AuthLayout';
import { Alert, TextField } from '@/src/components/account/ui';
import { api, reportFailure } from '@/src/lib/api';
import { navigate } from '@/src/lib/router';
import { PASSWORD_MIN, registerSchema } from '@/src/lib/validation';
import type { RegisterInput } from '@/src/lib/validation';

export default function RegisterPage() {
  const [formError, setFormError] = useState('');
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', phone: '', password: '', confirmPassword: '' },
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = async (data: RegisterInput) => {
    setFormError('');
    const result = await api('POST', '/auth/register', data);

    if (!result.ok) {
      setFormError(reportFailure(result, form));
      return;
    }

    navigate('/login?info=registered');
  };

  return (
    <AuthLayout
      title="Daftar Akun"
      subtitle="Buat akun Wedlify untuk memesan undangan dan memantau statusnya."
      footer={
        <>
          Sudah punya akun?{' '}
          <a href="#/login" className="font-semibold text-brand-gold hover:underline">
            Masuk
          </a>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {formError && <Alert tone="error">{formError}</Alert>}

        <TextField
          label="Nama Lengkap"
          autoComplete="name"
          placeholder="misal: Sarah Amelia"
          error={errors.name?.message}
          {...register('name')}
        />
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="nama@email.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <TextField
          label="Nomor WhatsApp"
          type="tel"
          autoComplete="tel"
          placeholder="081234567890"
          hint="Diawali 08, 10 sampai 13 digit"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="new-password"
          hint={`Minimal ${PASSWORD_MIN} karakter, mengandung huruf dan angka`}
          error={errors.password?.message}
          {...register('password')}
        />
        <TextField
          label="Konfirmasi Password"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          data-testid="register-submit"
          className="w-full btn-primary py-4 disabled:opacity-70"
        >
          Daftar
        </button>
      </form>
    </AuthLayout>
  );
}
