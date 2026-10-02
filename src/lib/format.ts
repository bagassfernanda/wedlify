// Semua aturan tanggal memakai Waktu Indonesia Barat, di browser maupun di
// server, supaya "hari ini" sama walaupun server online berjalan dengan jam UTC.
const BUSINESS_TIME_ZONE = 'Asia/Jakarta';

const isoDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: BUSINESS_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

// Tanggal WIB dalam format YYYY-MM-DD, sama dengan nilai <input type="date">.
export function toISODate(date: Date): string {
  return isoDateFormatter.format(date);
}

export function addDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('id-ID', {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
