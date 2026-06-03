import { motion } from 'motion/react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Rina & Dimas',
    date: 'Maret 2025',
    location: 'Jakarta',
    rating: 5,
    text: 'Undangan digitalnya luar biasa! Semua tamu kami sangat terkesan. Proses pesannya mudah dan hasilnya jauh melebihi ekspektasi kami. Wedlify benar-benar membuat hari pernikahan kami semakin berkesan.',
    image: 'https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&q=80&w=200',
  },
  {
    name: 'Ayu & Budi',
    date: 'Januari 2025',
    location: 'Surabaya',
    rating: 5,
    text: 'Pelayanan cepat dan responsif! Dalam 2 hari undangan sudah jadi dan langsung bisa disebarkan. Fitur RSVP-nya sangat membantu kami mengelola tamu. Sangat recommended untuk pasangan yang mau pernikahan modern.',
    image: 'https://images.unsplash.com/photo-1494774157365-9e04c6720e47?auto=format&fit=crop&q=80&w=200',
  },
  {
    name: 'Sari & Fajar',
    date: 'Februari 2025',
    location: 'Yogyakarta',
    rating: 5,
    text: 'Designnya cantik banget, sesuai dengan tema pernikahan kami yang rustic. Tim Wedlify sabar menerima revisi sampai kami puas. Harganya juga sangat terjangkau untuk kualitas sepremium ini!',
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&q=80&w=200',
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-brand-pastel">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-brand-gold font-semibold tracking-widest uppercase text-xs mb-4 block">
            Kata Mereka
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-ink mb-6">
            Pasangan yang Sudah Mempercayai Kami
          </h2>
          <p className="text-brand-ink/60 text-lg">
            Kebahagiaan mereka adalah kebanggaan kami. Simak pengalaman nyata dari pasangan yang telah menggunakan Wedlify.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-brand-beige hover:shadow-xl transition-all duration-500 flex flex-col"
            >
              <Quote className="w-8 h-8 text-brand-gold/30 mb-4" />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-brand-gold fill-brand-gold" />
                ))}
              </div>

              <p className="text-brand-ink/70 leading-relaxed flex-1 mb-8 text-sm">
                "{t.text}"
              </p>

              {/* Profile */}
              <div className="flex items-center gap-4 pt-6 border-t border-brand-beige">
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-12 h-12 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <p className="font-bold text-brand-ink text-sm">{t.name}</p>
                  <p className="text-brand-ink/50 text-xs">{t.date} · {t.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-3 gap-6 mt-16 bg-white rounded-3xl p-10 border border-brand-beige shadow-sm"
        >
          {[
            { value: '200+', label: 'Pasangan Bahagia' },
            { value: '4.9/5', label: 'Rating Rata-rata' },
            { value: '100%', label: 'Puas & Rekomendasi' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl md:text-4xl font-serif font-bold text-brand-gold mb-2">{stat.value}</p>
              <p className="text-brand-ink/60 text-sm">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
