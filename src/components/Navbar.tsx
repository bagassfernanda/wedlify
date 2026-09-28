import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import { ChevronDown, Instagram, Mail, Menu, MessageCircle, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const whatsappUrl = 'https://wa.me/6282228931153?text=Halo%20Wedlify%21%20Saya%20ingin%20bertanya%20tentang%20undangan%20pernikahan.';
const instagramUrl = 'https://www.instagram.com/wedlify.id?igsh=NHdieGdtNzEwa3k4';
const emailUrl = 'mailto:wedlify@gmail.com';

const navLinks = [
  { name: 'Tentang', href: '#about', id: 'about' },
  { name: 'Layanan', href: '#services', id: 'services' },
  { name: 'Katalog', href: '#templates', id: 'templates' },
  { name: 'Demo', href: '#demo', id: 'demo' },
  { name: 'Testimoni', href: '#testimonials', id: 'testimonials' },
  { name: 'Harga', href: '#pricing', id: 'pricing' },
];

const contactLinks = [
  { name: 'Instagram', href: instagramUrl, icon: Instagram },
  { name: 'WhatsApp', href: whatsappUrl, icon: MessageCircle },
  { name: 'Email', href: emailUrl, icon: Mail },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const handleLogoClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setIsMobileMenuOpen(false);
    window.history.replaceState(null, '', '#home');
    document.getElementById('home')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  useEffect(() => {
    const sectionIds = ['about', 'services', 'templates', 'demo', 'testimonials', 'pricing', 'order', 'contact'];

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      let current = 'home';

      for (const id of sectionIds) {
        const element = document.getElementById(id);
        if (!element) {
          continue;
        }

        if (element.getBoundingClientRect().top <= 150) {
          current = id;
        }
      }

      setActiveSection(current);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isContactActive = activeSection === 'contact';

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 border-b border-brand-beige/80 bg-white/95 px-6 transition-all duration-300',
        isScrolled ? 'py-2 shadow-sm backdrop-blur-md' : 'py-3'
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <a
          href="#home"
          onClick={handleLogoClick}
          className="flex items-center group"
          aria-label="Kembali ke halaman awal"
        >
          <img
            src="/wedlify-logo-clean.png"
            alt="Wedlify"
            className="h-14 w-auto transition-transform duration-300 group-hover:scale-105"
          />
        </a>

        <div className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;

            return (
              <a
                key={link.name}
                href={link.href}
                className={cn(
                  'relative py-2 text-sm font-semibold transition-colors',
                  isActive ? 'text-brand-gold' : 'text-brand-ink/65 hover:text-brand-gold'
                )}
              >
                {link.name}
                <span
                  className={cn(
                    'absolute bottom-0 left-1/2 h-0.5 -translate-x-1/2 rounded-full bg-brand-gold transition-all duration-300',
                    isActive ? 'w-8' : 'w-0'
                  )}
                />
              </a>
            );
          })}

          <div className="relative group">
            <a
              href="#contact"
              className={cn(
                'relative flex items-center gap-1 py-2 text-sm font-semibold transition-colors',
                isContactActive ? 'text-brand-gold' : 'text-brand-ink/65 hover:text-brand-gold'
              )}
            >
              Contact
              <ChevronDown className="h-4 w-4" />
              <span
                className={cn(
                  'absolute bottom-0 left-1/2 h-0.5 -translate-x-1/2 rounded-full bg-brand-gold transition-all duration-300',
                  isContactActive ? 'w-8' : 'w-0'
                )}
              />
            </a>

            <div className="invisible absolute right-0 top-full mt-3 w-56 translate-y-2 rounded-2xl border border-brand-gold/15 bg-white p-3 opacity-0 shadow-xl shadow-brand-gold/10 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
              {contactLinks.map((contact) => {
                const Icon = contact.icon;

                return (
                  <a
                    key={contact.name}
                    href={contact.href}
                    target={contact.href.startsWith('http') ? '_blank' : undefined}
                    rel={contact.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-brand-ink/70 transition-colors hover:bg-brand-beige hover:text-brand-gold"
                  >
                    <Icon className="h-4 w-4" />
                    {contact.name}
                  </a>
                );
              })}
            </div>
          </div>

          <a href="#order" className="btn-primary px-7 py-3 text-sm">
            Pesan Sekarang
          </a>
        </div>

        <button
          type="button"
          className="lg:hidden flex h-11 w-11 items-center justify-center rounded-full border border-brand-beige text-brand-ink"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 border-t border-brand-beige bg-white p-6 shadow-lg">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={cn(
                  'text-lg font-semibold',
                  activeSection === link.id ? 'text-brand-gold' : 'text-brand-ink'
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}

            <a
              href="#contact"
              className={cn(
                'text-lg font-semibold',
                isContactActive ? 'text-brand-gold' : 'text-brand-ink'
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </a>

            <div className="grid gap-2 rounded-2xl bg-brand-pastel p-3">
              {contactLinks.map((contact) => {
                const Icon = contact.icon;

                return (
                  <a
                    key={contact.name}
                    href={contact.href}
                    target={contact.href.startsWith('http') ? '_blank' : undefined}
                    rel={contact.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-brand-ink/70"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4 text-brand-gold" />
                    {contact.name}
                  </a>
                );
              })}
            </div>

            <a
              href="#order"
              className="btn-primary text-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Pesan Sekarang
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
