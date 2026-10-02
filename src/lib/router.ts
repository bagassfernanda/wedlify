import { useEffect, useState } from 'react';
import type { Role } from './orderRules';

// Halaman akun memakai hash berawalan "#/" (misal "#/login"),
// sedangkan hash biasa (misal "#pricing") tetap menjadi anchor landing page.
export function getRoute(): string | null {
  const { hash } = window.location;
  return hash.startsWith('#/') ? hash.slice(1) : null;
}

export function navigate(path: string): void {
  window.location.hash = path;
}

export function useRoute(): string | null {
  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    const handleHashChange = () => setRoute(getRoute());

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return route;
}

export const PUBLIC_PATHS = ['/login', '/register', '/forgot-password'];

export function homePath(role: Role): string {
  return role === 'admin' ? '/admin' : '/orders';
}

// Halaman "/admin..." hanya untuk admin, halaman pesanan dan profil hanya untuk pelanggan.
export function isAllowedPath(path: string, role: Role): boolean {
  return role === 'admin' ? /^\/admin(\/[\w-]+)*$/.test(path) : /^\/(orders|profile)(\/[\w-]+)*$/.test(path);
}

export function pathAfterLogin(next: string | null, role: Role): string {
  return next !== null && isAllowedPath(next, role) ? next : homePath(role);
}
