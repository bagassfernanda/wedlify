import { MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function WhatsAppButton() {
  const phoneNumber = '6282228931153';
  const message = encodeURIComponent('Halo Wedlify! Saya tertarik dengan layanan undangan pernikahan Anda. Bisa bantu saya?');
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-8 right-8 z-[60] w-16 h-16 bg-brand-gold text-white rounded-full flex items-center justify-center shadow-2xl shadow-brand-gold/25 hover:bg-[#a26f31] transition-colors group border border-white/70"
    >
      <MessageCircle className="w-8 h-8" />
      <span className="absolute right-full mr-4 bg-white text-brand-ink px-4 py-2 rounded-xl shadow-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-brand-beige">
        Chat dengan kami
      </span>
    </motion.a>
  );
}
