import { useState } from 'react';
import { Check, ShieldCheck, Clock, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import type { Package } from '@/src/types';

const packages: Package[] = [
  {
    name: 'Basic',
    price: 'Rp 150rb',
    features: [
      'Undangan Digital',
      'Template Standar',
      'Pelacakan RSVP',
      'Link Google Maps',
      'Hosting 3 Bulan',
      '2x Revisi Gratis',
    ],
  },
  {
    name: 'Standard',
    price: 'Rp 300rb',
    recommended: true,
    features: [
      'Digital + 50 Cetak',
      'Template Premium',
      'Integrasi Musik',
      'Galeri Foto (10 foto)',
      'Hosting 6 Bulan',
      'Link Domain Kustom',
      '5x Revisi Gratis',
    ],
  },
  {
    name: 'Premium',
    price: 'Rp 500rb',
    features: [
      'Digital + 150 Cetak',
      'Desain Kustom Eksklusif',
      'Fitur Digital Lengkap',
      'Foto Tidak Terbatas',
      'Hosting 12 Bulan',
      'Dukungan Prioritas',
      'Revisi Tidak Terbatas',
      'Cetak Foil Emas',
    ],
  },
];

interface PricingProps {
  selectedPackageName?: string;
  onSelectPackage: (packageName: string) => void;
}

export default function Pricing({
  selectedPackageName = '',
  onSelectPackage,
}: PricingProps) {
  const [hoveredPackageName, setHoveredPackageName] = useState('');
  const activePackageName = hoveredPackageName || selectedPackageName;

  const handleSelectPackage = (packageName: string) => {
    onSelectPackage(packageName);

    window.setTimeout(() => {
      document.getElementById('order')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 80);
  };

  return (
    <section id="pricing" className="py-24 bg-brand-pastel">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-brand-gold font-semibold tracking-widest uppercase text-xs mb-4 block">
            Paket Harga
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-ink mb-6">
            Pilih Paket Anda
          </h2>
          <p className="text-brand-ink/60 text-lg">
            Harga transparan tanpa biaya tersembunyi. Pilih paket yang paling sesuai dengan kebutuhan pernikahan Anda.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.name}
              onMouseEnter={() => setHoveredPackageName(pkg.name)}
              onMouseLeave={() => setHoveredPackageName('')}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={cn(
                'relative bg-white p-10 rounded-3xl border transition-all duration-300',
                activePackageName === pkg.name
                  ? 'z-10 -translate-y-2 border-brand-gold shadow-2xl shadow-brand-gold/15'
                  : 'border-brand-beige shadow-sm hover:border-brand-gold/50 hover:shadow-xl hover:shadow-brand-gold/10'
              )}
            >
              {activePackageName === pkg.name && (
                <div className="absolute right-6 top-6 rounded-full bg-brand-gold/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">
                  {selectedPackageName === pkg.name ? 'Dipilih' : 'Lihat Paket'}
                </div>
              )}
              <h3 className="text-xl font-bold text-brand-ink mb-2">{pkg.name}</h3>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-serif font-bold text-brand-ink">{pkg.price}</span>
                <span className="text-brand-ink/40 text-sm">/ paket</span>
              </div>
              <ul className="space-y-4 mb-10">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-brand-ink/70">
                    <Check className="w-5 h-5 text-brand-gold shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => handleSelectPackage(pkg.name)}
                className={cn(
                  'block w-full rounded-md py-3 font-bold transition-all duration-300',
                  activePackageName === pkg.name
                    ? 'bg-brand-gold text-white shadow-lg shadow-brand-gold/15'
                    : 'bg-brand-beige text-brand-ink hover:bg-brand-gold hover:text-white'
                )}
              >
                Pilih {pkg.name}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Guarantee strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 bg-white rounded-2xl border border-brand-beige px-8 py-6 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-brand-ink/70"
        >
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-brand-gold shrink-0" />
            <span>Harga sudah final, <strong className="text-brand-ink">tanpa biaya tersembunyi</strong></span>
          </div>
          <div className="hidden sm:block w-px h-5 bg-brand-beige" />
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-brand-gold shrink-0" />
            <span>Undangan selesai <strong className="text-brand-ink">dalam 2 hari kerja</strong></span>
          </div>
          <div className="hidden sm:block w-px h-5 bg-brand-beige" />
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-brand-gold shrink-0" />
            <span>Revisi gratis <strong className="text-brand-ink">sampai kamu puas</strong></span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
