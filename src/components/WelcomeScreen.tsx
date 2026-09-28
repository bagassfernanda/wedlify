import { motion } from 'motion/react';
import { ArrowDown } from 'lucide-react';

interface WelcomeScreenProps {
  onEnter: () => void;
}

export default function WelcomeScreen({ onEnter }: WelcomeScreenProps) {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#fffaf6_0%,#f7eee7_54%,#fffaf6_100%)] flex items-center justify-center px-6">
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/80 to-transparent" />
      <img
        src="/templates/soft-floral.png"
        alt=""
        className="pointer-events-none absolute -left-24 bottom-0 h-[54vh] max-h-[560px] opacity-[0.08] blur-[1px]"
      />
      <img
        src="/templates/elegant-gold.png"
        alt=""
        className="pointer-events-none absolute -right-28 top-12 h-[54vh] max-h-[560px] opacity-[0.08] blur-[1px]"
      />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center text-center"
      >
        <motion.img
          src="/wedlify-logo-clean.png"
          alt="Wedlify"
          className="mb-8 w-[min(78vw,430px)] drop-shadow-[0_24px_48px_rgba(185,130,59,0.16)]"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        />
        <motion.button
          type="button"
          onClick={onEnter}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center justify-center gap-3 rounded-md bg-brand-gold px-9 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white shadow-xl shadow-brand-gold/20 transition-colors hover:bg-[#a26f31]"
        >
          Mulai Sekarang
          <ArrowDown className="h-4 w-4" />
        </motion.button>
      </motion.div>
    </section>
  );
}
