import { useState } from 'react';
import { Alert } from '@/src/components/account/ui';
import { api, useApiData } from '@/src/lib/api';
import { formatDate, toISODate } from '@/src/lib/format';
import type { Customer } from '@/src/lib/models';
import { cn } from '@/src/lib/utils';

export default function AdminCustomersPage() {
  const { data, error, loading, setData } = useApiData<{ customers: Customer[] }>('/admin/customers');
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState('');

  const toggleActive = async (customer: Customer) => {
    const result = await api<{ customer: Customer }>('PATCH', `/admin/customers/${customer.id}`, {
      isActive: !customer.isActive,
    });

    if (!result.ok || !data) {
      setNotice('');
      setActionError(result.ok ? '' : result.error);
      return;
    }

    const updated = result.data.customer;

    setActionError('');
    setData({ customers: data.customers.map((item) => (item.id === updated.id ? updated : item)) });
    setNotice(`Akun ${updated.email} ${updated.isActive ? 'diaktifkan kembali' : 'dinonaktifkan'}.`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif font-bold text-brand-ink">Pelanggan</h1>

      {notice && <Alert tone="success">{notice}</Alert>}
      {(error || actionError) && <Alert tone="error">{error || actionError}</Alert>}
      {loading && <p className="text-sm text-brand-ink/60">Memuat pelanggan...</p>}

      {data && data.customers.length === 0 && (
        <div data-testid="customers-empty" className="rounded-3xl border border-brand-beige bg-white p-10 text-center text-brand-ink/70">
          Belum ada pelanggan yang mendaftar.
        </div>
      )}

      {data && data.customers.length > 0 && (
        <div className="overflow-x-auto rounded-3xl border border-brand-beige bg-white">
          <table className="w-full text-left text-sm" data-testid="customer-table">
            <thead className="border-b border-brand-beige text-brand-ink/50">
              <tr>
                <th className="px-6 py-4 font-semibold">Nama</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">WhatsApp</th>
                <th className="px-6 py-4 font-semibold">Bergabung</th>
                <th className="px-6 py-4 font-semibold">Pesanan</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-beige">
              {data.customers.map((customer) => (
                <tr key={customer.id} data-testid={`customer-${customer.email}`}>
                  <td className="px-6 py-4 font-semibold text-brand-ink">{customer.name}</td>
                  <td className="px-6 py-4">{customer.email}</td>
                  <td className="px-6 py-4">{customer.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatDate(toISODate(new Date(customer.createdAt)))}</td>
                  <td className="px-6 py-4">{customer.orderCount}</td>
                  <td className="px-6 py-4">
                    <span
                      data-testid="customer-status"
                      className={cn(
                        'inline-flex rounded-full px-3 py-1 text-xs font-bold',
                        customer.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700',
                      )}
                    >
                      {customer.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => toggleActive(customer)}
                      data-testid="toggle-customer"
                      className="font-semibold text-brand-gold hover:underline"
                    >
                      {customer.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
