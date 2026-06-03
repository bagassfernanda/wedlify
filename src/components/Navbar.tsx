import { useState, useEffect } from 'react';
import { Menu, X, Heart } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Tentang', href: '#about' },
    { name: 'Layanan', href: '#services' },
    { name: 'Demo', href: '#demo' },
    { name: 'Testimoni', href: '#testimonials' },
    { name: 'Harga', href: '#pricing' },
  ];

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4',
        isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 group">
          <Heart className="w-6 h-6 text-brand-gold fill-brand-gold group-hover:scale-110 transition-transform" />
          <span className="text-2xl font-serif font-bold tracking-tight text-brand-ink">
            Wedlify
          </span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-brand-ink/70 hover:text-brand-gold transition-colors"
            >
              {link.name}
            </a>
          ))}
          <a href="#order" className="btn-primary py-2 px-6 text-sm">
            Mulai Sekarang
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-brand-ink"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-brand-beige p-6 flex flex-col gap-4 animate-in fade-in slide-in-from-top-5">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-lg font-medium text-brand-ink"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </a>
          ))}
          <a
            href="#order"
            className="btn-primary text-center"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Mulai Sekarang
          </a>
        </div>
      )}
    </nav>
  );
}
