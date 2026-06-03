import { Globe, Smartphone, Music, MapPin, Users, Image } from 'lucide-react';
import { motion } from 'motion/react';

const features = [
  {
    icon: <Globe className="w-8 h-8 text-brand-gold" />,
    title: 'Website Undangan',
    description: 'Undangan berbasis website yang bisa dibuka dari HP maupun laptop tanpa perlu install apapun.',
  },
  {
    icon: <Users className="w-8 h-8 text-brand-gold" />,
    title: 'RSVP Real-time',
    description: 'Tamu konfirmasi kehadiran langsung di undangan, kamu bisa pantau daftar tamu kapan saja.',
  },
  {
    icon: <Music className="w-8 h-8 text-brand-gold" />,
    title: 'Integrasi Musik',
    description: 'Tambahkan lagu favorit yang otomatis memutar saat tamu membuka undangan digitalmu.',
  },
  {
    icon: <MapPin className="w-8 h-8 text-brand-gold" />,
    title: 'Google Maps',
    description: 'Link lokasi venue langsung terhubung ke Google Maps sehingga tamu mudah menemukan jalan.',
  },
  {
    icon: <Image className="w-8 h-8 text-brand-gold" />,
    title: 'Galeri Foto',
    description: 'Tampilkan momen terbaik kalian di galeri foto yang elegan dalam undangan digital.',
  },
  {
    icon: <Smartphone className="w-8 h-8 text-brand-gold" />,
    title: 'Mobile Friendly',
    description: 'Tampilan sempurna di semua ukuran layar — HP, tablet, maupun desktop.',
  },
];

export default function Services() {
  return (
    <section id="services" className="py-24 bg-brand-pastel">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-brand-gold font-semibold tracking-widest uppercase text-xs mb-4 block">
            Apa yang Kami Tawarkan
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-ink mb-6">
            Undangan Digital Lengkap untuk Hari Spesialmu
          </h2>
          <p className="text-brand-ink/60 text-lg">
            Semua fitur yang kamu butuhkan sudah tersedia — satu undangan digital yang memukau tamu dari pertama kali dibuka.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-brand-beige hover:shadow-xl transition-all duration-500 group"
            >
              <div className="mb-5 p-3 bg-brand-beige rounded-2xl w-fit group-hover:scale-110 transition-transform duration-500">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-brand-ink mb-3">
                {feature.title}
              </h3>
              <p className="text-brand-ink/60 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
