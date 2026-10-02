import type { ReactNode } from 'react';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fffaf6_0%,#f7eee7_54%,#fffaf6_100%)] px-6 py-10 flex flex-col items-center justify-center">
      <a href="#home" aria-label="Kembali ke halaman utama" className="mb-6">
        <img src="/wedlify-logo-clean.png" alt="Wedlify" className="h-20 w-auto" />
      </a>

      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-3xl border border-brand-beige shadow-sm">
        <h1 className="text-3xl font-serif font-bold text-brand-ink mb-2">{title}</h1>
        <p className="text-brand-ink/60 text-sm mb-8">{subtitle}</p>
        {children}
      </div>

      {footer && <div className="mt-6 text-sm text-brand-ink/70 text-center">{footer}</div>}

      <a href="#home" className="mt-4 text-sm font-semibold text-brand-ink/50 hover:text-brand-gold">
        Kembali ke halaman utama
      </a>
    </div>
  );
}
