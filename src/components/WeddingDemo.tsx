import { useState } from 'react';
import { motion } from 'motion/react';
import { ExternalLink, Smartphone, MapPin, Calendar, Clock } from 'lucide-react';

const DEMO_URL = 'https://weddingwildandea-v2.vercel.app';

export default function WeddingDemo() {
  const [iframeError, setIframeError] = useState(false);

  return (
    <section id="demo" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-brand-gold font-semibold tracking-widest uppercase text-xs mb-4 block">
            Contoh Nyata
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-ink mb-6">
            Lihat Undangan Digital Kami
          </h2>
          <p className="text-brand-ink/60 text-lg">
            Inilah yang akan diterima tamu undangan Anda — elegan, interaktif, dan bisa dibuka dari mana saja.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Detail Undangan */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="bg-brand-pastel rounded-3xl p-8 border border-brand-beige">
              <p className="text-brand-ink/70 text-sm mb-6 leading-relaxed">
                Assalamualaikum Wr. Wb. 🌸<br /><br />
                Yth. Bapak/Ibu/Saudara/i 🙏<br /><br />
                Dengan segala kerendahan hati, kami mengundang Anda untuk menghadiri acara pernikahan kami 💍✨
              </p>

              <div className="space-y-5">
                <div className="bg-white rounded-2xl p-5 border border-brand-beige">
                  <p className="text-brand-gold font-bold text-sm uppercase tracking-widest mb-3">Akad Nikah</p>
                  <div className="space-y-2 text-sm text-brand-ink/70">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-brand-gold flex-shrink-0" />
                      <span>Senin, 13 April 2026</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-brand-gold flex-shrink-0" />
                      <span>09.00 WIB – selesai</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-brand-gold flex-shrink-0 mt-0.5" />
                      <span>Dsn. Sumberwadung, RT 33/RW 12, Desa Kaligondo, Kec. Genteng, Banyuwangi</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-brand-beige">
                  <p className="text-brand-gold font-bold text-sm uppercase tracking-widest mb-3">Resepsi</p>
                  <div className="space-y-2 text-sm text-brand-ink/70">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-brand-gold flex-shrink-0" />
                      <span>Senin, 13 April 2026</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-brand-gold flex-shrink-0" />
                      <span>12.00 WIB – selesai</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-brand-gold flex-shrink-0 mt-0.5" />
                      <span>Dsn. Sumberwadung, RT 33/RW 12, Desa Kaligondo, Kec. Genteng, Banyuwangi</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-brand-ink/60 text-sm mt-6 italic">
                Merupakan suatu kehormatan apabila Anda berkenan hadir untuk memberikan doa restu 🤲✨
              </p>
            </div>

            <a
              href={DEMO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex items-center justify-center gap-2 w-full"
            >
              <ExternalLink className="w-5 h-5" />
              Buka Undangan Digital Langsung
            </a>
          </motion.div>

          {/* Phone Mockup dengan iframe */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-center"
          >
            <div className="flex flex-col items-center">
              {/* Phone frame */}
              <div className="relative w-[300px] h-[620px] bg-brand-ink rounded-[3rem] shadow-2xl border-[10px] border-brand-ink overflow-hidden">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-brand-ink rounded-b-2xl z-10" />

                {/* Screen */}
                <div className="w-full h-full rounded-[2.2rem] overflow-hidden bg-white relative">
                  {!iframeError ? (
                    <iframe
                      src={DEMO_URL}
                      title="Demo Undangan Digital"
                      className="h-full w-full border-0"
                      onError={() => setIframeError(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-brand-pastel">
                      <Smartphone className="w-12 h-12 text-brand-gold mb-4" />
                      <p className="text-brand-ink font-semibold mb-2">Undangan Digital</p>
                      <p className="text-brand-ink/60 text-sm mb-6">
                        Klik tombol di bawah untuk membuka contoh undangan
                      </p>
                      <a
                        href={DEMO_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary text-sm px-6 py-2"
                      >
                        Buka Demo
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <a
                href={DEMO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center justify-center rounded-md bg-brand-gold px-8 py-3 text-sm font-bold text-white shadow-lg shadow-brand-gold/20 transition-colors hover:bg-[#a26f31]"
              >
                Live Demo ✨
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
