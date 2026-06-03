import { CheckCircle2, Zap, Palette, Clock } from 'lucide-react';
import { motion } from 'motion/react';

const benefits = [
  {
    icon: <Zap className="w-6 h-6 text-brand-gold" />,
    title: 'Mudah Digunakan',
    description: 'Alat desain intuitif kami membuat pembuatan undangan menjadi sangat mudah.',
  },
  {
    icon: <Palette className="w-6 h-6 text-brand-gold" />,
    title: 'Desain Modern',
    description: 'Template pilihan yang mengikuti tren dan estetika pernikahan terbaru.',
  },
  {
    icon: <CheckCircle2 className="w-6 h-6 text-brand-gold" />,
    title: 'Terjangkau',
    description: 'Undangan kualitas premium dengan harga yang sesuai dengan anggaran pernikahan Anda.',
  },
  {
    icon: <Clock className="w-6 h-6 text-brand-gold" />,
    title: 'Proses Cepat',
    description: 'Waktu pengerjaan cepat untuk undangan digital maupun cetak.',
  },
];

export default function About() {
  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-brand-gold font-semibold tracking-widest uppercase text-xs mb-4 block">
              Cerita Kami
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-ink mb-6 leading-tight">
              Merangkai Kenangan, <br />Satu Undangan Sekali Seumur Hidup
            </h2>
            <p className="text-brand-ink/70 text-lg mb-8 leading-relaxed">
              Wedlify lahir dari ide sederhana: bahwa setiap pernikahan layak mendapatkan undangan yang unik seperti pasangan itu sendiri. Kami menggabungkan keanggunan tradisional dengan teknologi modern untuk memberikan pengalaman yang mulus.
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">{benefit.icon}</div>
                  <div>
                    <h4 className="font-bold text-brand-ink mb-1">{benefit.title}</h4>
                    <p className="text-sm text-brand-ink/60">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?auto=format&fit=crop&q=80&w=1000"
                alt="Wedding invitation design process"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-10 -left-10 glass-card p-8 rounded-2xl hidden md:block max-w-xs">
              <p className="text-brand-gold font-serif italic text-2xl mb-2">"Awal yang sempurna untuk selamanya."</p>
              <p className="text-sm font-medium text-brand-ink/60">— Sarah & James</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
