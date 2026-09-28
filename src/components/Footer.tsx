import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-ink text-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <a href="/" className="flex items-center group">
              <img
                src="/wedlify-logo-clean.png"
                alt="Wedlify"
                className="h-16 w-auto"
              />
            </a>
            <p className="text-white/60 leading-relaxed">
              Layanan undangan pernikahan premium yang menyediakan solusi digital dan cetak elegan untuk hari spesial Anda.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://www.instagram.com/wedlify.id?igsh=NHdieGdtNzEwa3k4"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-brand-gold hover:border-brand-gold transition-all"
                aria-label="Instagram Wedlify"
              >
                {/* Instagram SVG */}
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-serif font-bold mb-6">Tautan Cepat</h4>
            <ul className="space-y-4">
              <li><a href="#about" className="text-white/60 hover:text-brand-gold transition-colors">Tentang Kami</a></li>
              <li><a href="#services" className="text-white/60 hover:text-brand-gold transition-colors">Layanan</a></li>
              <li><a href="#templates" className="text-white/60 hover:text-brand-gold transition-colors">Katalog</a></li>
              <li><a href="#demo" className="text-white/60 hover:text-brand-gold transition-colors">Demo Undangan</a></li>
              <li><a href="#testimonials" className="text-white/60 hover:text-brand-gold transition-colors">Testimoni</a></li>
              <li><a href="#pricing" className="text-white/60 hover:text-brand-gold transition-colors">Harga</a></li>
              <li><a href="#contact" className="text-white/60 hover:text-brand-gold transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-serif font-bold mb-6">Fitur</h4>
            <ul className="space-y-4">
              <li><a href="#services" className="text-white/60 hover:text-brand-gold transition-colors">Undangan Digital</a></li>
              <li><a href="#services" className="text-white/60 hover:text-brand-gold transition-colors">RSVP Real-time</a></li>
              <li><a href="#services" className="text-white/60 hover:text-brand-gold transition-colors">Integrasi Musik</a></li>
              <li><a href="#services" className="text-white/60 hover:text-brand-gold transition-colors">Desain Kustom</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-serif font-bold mb-6">Hubungi Kami</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-white/60">
                <Mail className="w-5 h-5 text-brand-gold shrink-0" />
                <span>wedlify@gmail.com</span>
              </li>
              <li className="flex items-start gap-3 text-white/60">
                <Phone className="w-5 h-5 text-brand-gold shrink-0" />
                <span>+62 822 2893 1153</span>
              </li>
              <li className="flex items-start gap-3 text-white/60">
                <MapPin className="w-5 h-5 text-brand-gold shrink-0" />
                <span>Jl. Wedding No. 123, Jakarta, Indonesia</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} Wedlify. Hak cipta dilindungi undang-undang.
          </p>
          <div className="flex gap-8 text-sm text-white/40">
            <a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a>
            <a href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
