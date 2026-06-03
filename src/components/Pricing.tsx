import { Check } from 'lucide-react';
import { motion } from 'motion/react';
import type { Package } from '@/src/types';

const packages: Package[] = [
  {
    name: 'Basic',
    price: 'Rp 250rb',
    features: [
      'Undangan Digital',
      'Template Standar',
      'Pelacakan RSVP',
      'Link Google Maps',
      'Hosting 3 Bulan',
    ],
  },
  {
    name: 'Standard',
    price: 'Rp 550rb',
    recommended: true,
    features: [
      'Digital + 50 Cetak',
      'Template Premium',
      'Integrasi Musik',
      'Galeri Foto (10 foto)',
      'Hosting 6 Bulan',
      'Link Domain Kustom',
    ],
  },
  {
    name: 'Premium',
    price: 'Rp 11jt',
    features: [
      'Digital + 150 Cetak',
      'Desain Kustom Eksklusif',
      'Fitur Digital Lengkap',
      'Foto Tidak Terbatas',
      'Hosting 12 Bulan',
      'Dukungan Prioritas',
      'Cetak Foil Emas',
    ],
  },
];

export default function Pricing() {
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
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={`relative bg-white p-10 rounded-3xl border ${
                pkg.recommended ? 'border-brand-gold shadow-xl scale-105 z-10' : 'border-brand-beige shadow-sm'
              }`}
            >
              {pkg.recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-gold text-white text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full">
                  Paling Populer
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
                    <Check className="w-5 h-5 text-brand-gold flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href="#order"
                className={`block text-center py-3 rounded-full font-bold transition-all duration-300 ${
                  pkg.recommended
                    ? 'bg-brand-gold text-white hover:bg-brand-gold/90'
                    : 'bg-brand-beige text-brand-ink hover:bg-brand-gold hover:text-white'
                }`}
              >
                Pilih {pkg.name}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
