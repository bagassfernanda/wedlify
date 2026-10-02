import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, TextField } from '@/src/components/account/ui';
import { useAuth } from '@/src/context/AuthContext';
import { api, reportFailure } from '@/src/lib/api';
import type { PublicUser } from '@/src/lib/models';
import { PASSWORD_MIN, changePasswordSchema, profileSchema } from '@/src/lib/validation';
import type { ChangePasswordInput, ProfileInput } from '@/src/lib/validation';

interface Feedback {
  tone: 'success' | 'error';
  message: string;
}

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [profileFeedback, setProfileFeedback] = useState<Feedback | null>(null);
  const [passwordFeedback, setPasswordFeedback] = useState<Feedback | null>(null);

  const profileForm = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '', phone: user?.phone ?? '' },
  });
  const passwordForm = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', password: '', confirmPassword: '' },
  });

  if (!user) {
    return null;
  }

  const onSaveProfile = async (data: ProfileInput) => {
    const result = await api<{ user: PublicUser }>('PATCH', '/profile', data);

    if (!result.ok) {
      const message = reportFailure(result, profileForm);
      setProfileFeedback(message ? { tone: 'error', message } : null);
      return;
    }

    setUser(result.data.user);
    setProfileFeedback({ tone: 'success', message: 'Profil berhasil diperbarui.' });
  };

  const onChangePassword = async (data: ChangePasswordInput) => {
    const result = await api('POST', '/profile/password', data);

    if (!result.ok) {
      const message = reportFailure(result, passwordForm);
      setPasswordFeedback(message ? { tone: 'error', message } : null);
      return;
    }

    passwordForm.reset();
    setPasswordFeedback({ tone: 'success', message: 'Password berhasil diubah.' });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif font-bold text-brand-ink">Profil</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={profileForm.handleSubmit(onSaveProfile)}
          noValidate
          data-testid="profile-form"
          className="space-y-5 rounded-3xl border border-brand-beige bg-white p-8"
        >
          <h2 className="text-lg font-serif font-bold text-brand-ink">Data Akun</h2>
          {profileFeedback && (
            <Alert tone={profileFeedback.tone} testId={`profile-${profileFeedback.tone}`}>
              {profileFeedback.message}
            </Alert>
          )}

          <TextField label="Email" name="email" value={user.email} disabled readOnly hint="Email tidak dapat diubah" />
          <TextField
            label="Nama Lengkap"
            autoComplete="name"
            error={profileForm.formState.errors.name?.message}
            {...profileForm.register('name')}
          />
          <TextField
            label="Nomor WhatsApp"
            type="tel"
            autoComplete="tel"
            hint="Diawali 08, 10 sampai 13 digit"
            error={profileForm.formState.errors.phone?.message}
            {...profileForm.register('phone')}
          />

          <button type="submit" data-testid="profile-submit" className="btn-primary px-6 py-3 text-sm">
            Simpan Profil
          </button>
        </form>

        <form
          onSubmit={passwordForm.handleSubmit(onChangePassword)}
          noValidate
          data-testid="password-form"
          className="space-y-5 rounded-3xl border border-brand-beige bg-white p-8"
        >
          <h2 className="text-lg font-serif font-bold text-brand-ink">Ubah Password</h2>
          {passwordFeedback && (
            <Alert tone={passwordFeedback.tone} testId={`password-${passwordFeedback.tone}`}>
              {passwordFeedback.message}
            </Alert>
          )}

          <TextField
            label="Password Saat Ini"
            type="password"
            autoComplete="current-password"
            error={passwordForm.formState.errors.currentPassword?.message}
            {...passwordForm.register('currentPassword')}
          />
          <TextField
            label="Password Baru"
            type="password"
            autoComplete="new-password"
            hint={`Minimal ${PASSWORD_MIN} karakter, mengandung huruf dan angka`}
            error={passwordForm.formState.errors.password?.message}
            {...passwordForm.register('password')}
          />
          <TextField
            label="Konfirmasi Password Baru"
            type="password"
            autoComplete="new-password"
            error={passwordForm.formState.errors.confirmPassword?.message}
            {...passwordForm.register('confirmPassword')}
          />

          <button
            type="submit"
            disabled={passwordForm.formState.isSubmitting}
            data-testid="password-submit"
            className="btn-primary px-6 py-3 text-sm disabled:opacity-70"
          >
            Ubah Password
          </button>
        </form>
      </div>
    </div>
  );
}
