import { useEffect } from 'react';
import AccountLayout from './components/account/AccountLayout';
import { Alert } from './components/account/ui';
import { useAuth } from './context/AuthContext';
import { PUBLIC_PATHS, getRoute, homePath, isAllowedPath, navigate, pathAfterLogin } from './lib/router';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import LoginPage from './pages/LoginPage';
import OrderDetailPage from './pages/OrderDetailPage';
import OrderFormPage from './pages/OrderFormPage';
import type { OrderPreset } from './pages/OrderFormPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminOrderDetailPage from './pages/admin/AdminOrderDetailPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminPromosPage from './pages/admin/AdminPromosPage';

interface AccountAppProps {
  route: string;
  preset: OrderPreset;
}

export default function AccountApp({ route, preset }: AccountAppProps) {
  const { user, loading } = useAuth();
  const [path, queryString = ''] = route.split('?');
  const query = new URLSearchParams(queryString);
  const info = query.get('info') ?? '';
  const next = query.get('next');
  const isPublicPath = PUBLIC_PATHS.includes(path);

  let redirectTo: string | null = null;

  if (loading) {
    redirectTo = null;
  } else if (!user && !isPublicPath) {
    redirectTo = `/login?info=required&next=${encodeURIComponent(path)}`;
  } else if (user && isPublicPath) {
    redirectTo = pathAfterLogin(next, user.role);
  } else if (user && path.startsWith('/admin') !== (user.role === 'admin')) {
    // Pelanggan tidak boleh membuka halaman admin, dan sebaliknya.
    redirectTo = homePath(user.role);
  }

  useEffect(() => {
    // Lewati jika alamat sudah berpindah, misalnya saat logout atau setelah login.
    if (redirectTo !== null && getRoute() === route) {
      navigate(redirectTo);
    }
  }, [redirectTo, route]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [path]);

  if (loading || redirectTo !== null) {
    return null;
  }

  if (path === '/login') {
    return <LoginPage info={info} next={next} />;
  }

  if (path === '/register') {
    return <RegisterPage />;
  }

  if (path === '/forgot-password') {
    return <ForgotPasswordPage />;
  }

  const orderDetail = /^\/orders\/([\w-]+)$/.exec(path);
  const orderEdit = /^\/orders\/([\w-]+)\/edit$/.exec(path);
  const adminOrderDetail = /^\/admin\/orders\/([\w-]+)$/.exec(path);
  let page = (
    <div className="space-y-4">
      <Alert tone="error">Halaman tidak ditemukan.</Alert>
      <a href={`#${user ? homePath(user.role) : '/login'}`} className="font-semibold text-brand-gold hover:underline">
        Kembali ke halaman utama akun
      </a>
    </div>
  );

  if (user && isAllowedPath(path, user.role)) {
    if (path === '/orders') {
      page = <OrdersPage info={info} />;
    } else if (path === '/orders/new') {
      page = <OrderFormPage key="new" preset={preset} />;
    } else if (orderEdit) {
      page = <OrderFormPage key={orderEdit[1]} orderId={orderEdit[1]} preset={preset} />;
    } else if (orderDetail) {
      page = <OrderDetailPage key={`${orderDetail[1]}-${info}`} orderId={orderDetail[1]} info={info} />;
    } else if (path === '/profile') {
      page = <ProfilePage />;
    } else if (path === '/admin') {
      page = <AdminDashboardPage />;
    } else if (path === '/admin/orders') {
      page = <AdminOrdersPage />;
    } else if (adminOrderDetail) {
      page = <AdminOrderDetailPage key={adminOrderDetail[1]} orderId={adminOrderDetail[1]} />;
    } else if (path === '/admin/customers') {
      page = <AdminCustomersPage />;
    } else if (path === '/admin/promos') {
      page = <AdminPromosPage />;
    }
  }

  return <AccountLayout path={path}>{page}</AccountLayout>;
}
