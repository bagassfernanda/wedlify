import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=2000"
          alt="Wedding background"
          className="w-full h-full object-cover opacity-20"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-beige/50 via-transparent to-brand-beige" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-xs font-semibold tracking-widest uppercase text-brand-gold border border-brand-gold/30 rounded-full">
            Undangan Digital Impianmu, Start From 150k
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-brand-ink leading-[1.1] mb-8">
            Wujudkan Undangan <br />
            <span className="italic text-brand-gold">Pernikahan Impian</span>
          </h1>
          <p className="font-elegant text-2xl md:text-3xl text-brand-ink/70 max-w-3xl mx-auto mb-5 leading-relaxed">
            Undangan digital dan cetak elegan yang dirancang untuk membuat hari spesial Anda tak terlupakan. Sederhana, cepat, dan dibuat dengan indah.
          </p>
          <p className="text-sm md:text-base text-brand-gold max-w-xl mx-auto mb-10 font-semibold leading-relaxed tracking-wide">
            Untuk pasangan milenial Indonesia yang ingin kesan pertama tamu selalu berkesan — tanpa ribet, tanpa mahal.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#templates" className="btn-primary flex items-center gap-2 group uppercase text-xs tracking-[0.18em]">
              Lihat Katalog
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a href="#about" className="btn-secondary uppercase text-xs tracking-[0.18em]">
              Pelajari Lebih Lanjut
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
