import type { ReactNode } from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import type { Role } from '@/src/lib/orderRules';
import { navigate } from '@/src/lib/router';
import { cn } from '@/src/lib/utils';

const linksByRole: Record<Role, { name: string; href: string; path: string; exact?: boolean }[]> = {
  customer: [
    { name: 'Pesanan Saya', href: '#/orders', path: '/orders' },
    { name: 'Profil', href: '#/profile', path: '/profile' },
  ],
  admin: [
    { name: 'Dashboard', href: '#/admin', path: '/admin', exact: true },
    { name: 'Pesanan', href: '#/admin/orders', path: '/admin/orders' },
    { name: 'Pelanggan', href: '#/admin/customers', path: '/admin/customers' },
    { name: 'Kode Promo', href: '#/admin/promos', path: '/admin/promos' },
  ],
};

interface AccountLayoutProps {
  path: string;
  children: ReactNode;
}

export default function AccountLayout({ path, children }: AccountLayoutProps) {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login?info=logout');
  };

  return (
    <div className="min-h-screen bg-brand-pastel">
      <header className="sticky top-0 z-40 border-b border-brand-beige bg-white/95 px-6 py-3 backdrop-blur-md">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <a href="#home" aria-label="Kembali ke halaman utama">
            <img src="/wedlify-logo-clean.png" alt="Wedlify" className="h-12 w-auto" />
          </a>

          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2" data-testid={`nav-${user.role}`}>
            {linksByRole[user.role].map((link) => {
              const isActive = link.exact ? path === link.path : path.startsWith(link.path);

              return (
                <a
                  key={link.name}
                  href={link.href}
                  className={cn(
                    'text-sm font-semibold transition-colors',
                    isActive ? 'text-brand-gold' : 'text-brand-ink/65 hover:text-brand-gold',
                  )}
                >
                  {link.name}
                </a>
              );
            })}
            <button
              type="button"
              onClick={handleLogout}
              data-testid="logout-button"
              className="flex items-center gap-2 text-sm font-semibold text-brand-ink/65 hover:text-brand-gold"
            >
              <LogOut className="h-4 w-4" />
              Keluar
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <p className="text-sm text-brand-ink/50 mb-6" data-testid="current-user">
          Masuk sebagai <strong className="text-brand-ink/80">{user.name}</strong> ({user.email}),{' '}
          {user.role === 'admin' ? 'Admin' : 'Pelanggan'}
        </p>
        {children}
      </main>
    </div>
  );
}
