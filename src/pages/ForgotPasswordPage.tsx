import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthLayout from '@/src/components/account/AuthLayout';
import { Alert, TextField } from '@/src/components/account/ui';
import { api, reportFailure } from '@/src/lib/api';
import { navigate } from '@/src/lib/router';
import { PASSWORD_MIN, forgotPasswordSchema, resetPasswordSchema } from '@/src/lib/validation';
import type { ForgotPasswordInput, ResetPasswordInput } from '@/src/lib/validation';

const footer = (
  <>
    Ingat password Anda?{' '}
    <a href="#/login" className="font-semibold text-brand-gold hover:underline">
      Masuk
    </a>
  </>
);

interface SimulatedEmail {
  code: string;
  expiresInMinutes: number;
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [simulatedEmail, setSimulatedEmail] = useState<SimulatedEmail | null>(null);
  const [formError, setFormError] = useState('');

  const requestForm = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });
  const resetForm = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { code: '', password: '', confirmPassword: '' },
  });

  const sendCode = async (targetEmail: string) => {
    setFormError('');
    const result = await api<{ simulatedEmail: SimulatedEmail }>('POST', '/auth/forgot-password', {
      email: targetEmail,
    });

    if (!result.ok) {
      setSimulatedEmail(null);
      setFormError(result.error);
      return;
    }

    setEmail(targetEmail);
    setSimulatedEmail(result.data.simulatedEmail);
  };

  const onReset = async (data: ResetPasswordInput) => {
    setFormError('');
    const result = await api('POST', '/auth/reset-password', { email, ...data });

    if (!result.ok) {
      setFormError(reportFailure(result, resetForm));
      return;
    }

    navigate('/login?info=reset');
  };

  if (!simulatedEmail) {
    return (
      <AuthLayout
        title="Lupa Password"
        subtitle="Masukkan email akun Anda untuk mendapatkan kode reset password."
        footer={footer}
      >
        <form
          onSubmit={requestForm.handleSubmit((data) => sendCode(data.email))}
          noValidate
          className="space-y-5"
        >
          {formError && <Alert tone="error">{formError}</Alert>}

          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="nama@email.com"
            error={requestForm.formState.errors.email?.message}
            {...requestForm.register('email')}
          />

          <button type="submit" data-testid="forgot-submit" className="w-full btn-primary py-4">
            Kirim Kode Reset
          </button>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Atur Password Baru"
      subtitle={`Masukkan kode reset untuk ${email} dan password baru Anda.`}
      footer={footer}
    >
      <form onSubmit={resetForm.handleSubmit(onReset)} noValidate className="space-y-5">
        <Alert tone="info" testId="reset-code-box">
          <p className="font-semibold">Simulasi email</p>
          <p>
            Kode reset Anda: <strong data-testid="reset-code">{simulatedEmail.code}</strong>. Berlaku{' '}
            {simulatedEmail.expiresInMinutes} menit.
          </p>
        </Alert>
        {formError && <Alert tone="error">{formError}</Alert>}

        <TextField
          label="Kode Reset"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="6 digit angka"
          error={resetForm.formState.errors.code?.message}
          {...resetForm.register('code')}
        />
        <TextField
          label="Password Baru"
          type="password"
          autoComplete="new-password"
          hint={`Minimal ${PASSWORD_MIN} karakter, mengandung huruf dan angka`}
          error={resetForm.formState.errors.password?.message}
          {...resetForm.register('password')}
        />
        <TextField
          label="Konfirmasi Password Baru"
          type="password"
          autoComplete="new-password"
          error={resetForm.formState.errors.confirmPassword?.message}
          {...resetForm.register('confirmPassword')}
        />

        <button
          type="submit"
          disabled={resetForm.formState.isSubmitting}
          data-testid="reset-submit"
          className="w-full btn-primary py-4 disabled:opacity-70"
        >
          Simpan Password Baru
        </button>
        <button
          type="button"
          onClick={() => sendCode(email)}
          data-testid="resend-code"
          className="w-full text-sm font-semibold text-brand-gold hover:underline"
        >
          Minta kode baru
        </button>
      </form>
    </AuthLayout>
  );
}
