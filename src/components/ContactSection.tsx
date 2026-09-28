import { Instagram, Mail, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

const WHATSAPP_URL = 'https://wa.me/6282228931153?text=Halo%20Wedlify%21%20Saya%20ingin%20bertanya%20tentang%20undangan%20pernikahan.';
const INSTAGRAM_URL = 'https://www.instagram.com/wedlify.id?igsh=NHdieGdtNzEwa3k4';
const EMAIL_URL = 'mailto:wedlify@gmail.com';

const contactLinks = [
  {
    label: 'Instagram',
    value: '@wedlify.id',
    href: INSTAGRAM_URL,
    icon: Instagram,
  },
  {
    label: 'WhatsApp',
    value: '0822 2893 1153',
    href: WHATSAPP_URL,
    icon: MessageCircle,
  },
  {
    label: 'Email',
    value: 'wedlify@gmail.com',
    href: EMAIL_URL,
    icon: Mail,
  },
];

export default function ContactSection() {
  return (
    <section id="contact" className="scroll-mt-24 bg-brand-pastel py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="relative overflow-hidden rounded-[2rem] border border-brand-gold/15 bg-white px-6 py-14 text-center shadow-xl shadow-brand-gold/5 md:px-12"
        >
          <img
            src="/templates/soft-floral.png"
            alt=""
            className="pointer-events-none absolute -left-24 bottom-0 h-full max-h-[420px] opacity-[0.12]"
          />
          <img
            src="/templates/elegant-gold.png"
            alt=""
            className="pointer-events-none absolute -right-24 top-0 h-full max-h-[420px] opacity-[0.1]"
          />

          <div className="relative z-10 mx-auto max-w-3xl">
            <span className="mb-4 block text-xs font-semibold uppercase tracking-[0.24em] text-brand-gold">
              Contact Wedlify
            </span>
            <h2 className="mb-5 text-4xl font-serif font-bold text-brand-ink md:text-5xl">
              Diskusikan Undangan Impian Anda
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-brand-ink/60">
              Hubungi kami melalui channel favorit Anda untuk konsultasi desain, pilihan paket, atau referensi tema undangan.
            </p>
          </div>

          <div className="relative z-10 grid gap-4 md:grid-cols-3">
            {contactLinks.map((contact) => {
              const Icon = contact.icon;

              return (
                <a
                  key={contact.label}
                  href={contact.href}
                  target={contact.href.startsWith('http') ? '_blank' : undefined}
                  rel={contact.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="group rounded-2xl border border-brand-gold/15 bg-brand-pastel/80 p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold/40 hover:bg-white hover:shadow-lg hover:shadow-brand-gold/10"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-brand-gold text-white transition-transform duration-300 group-hover:scale-105">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mb-1 text-sm font-semibold uppercase tracking-[0.18em] text-brand-gold">
                    {contact.label}
                  </p>
                  <p className="text-lg font-semibold text-brand-ink">
                    {contact.value}
                  </p>
                </a>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
