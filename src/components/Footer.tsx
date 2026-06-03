import { Heart, Instagram, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-ink text-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <a href="/" className="flex items-center gap-2 group">
              <Heart className="w-6 h-6 text-brand-gold fill-brand-gold" />
              <span className="text-2xl font-serif font-bold tracking-tight">
                Wedlify
              </span>
            </a>
            <p className="text-white/60 leading-relaxed">
              Layanan undangan pernikahan premium yang menyediakan solusi digital dan cetak elegan untuk hari spesial Anda.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-brand-gold hover:border-brand-gold transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-brand-gold hover:border-brand-gold transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-brand-gold hover:border-brand-gold transition-all">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-serif font-bold mb-6">Tautan Cepat</h4>
            <ul className="space-y-4">
              <li><a href="#about" className="text-white/60 hover:text-brand-gold transition-colors">Tentang Kami</a></li>
              <li><a href="#services" className="text-white/60 hover:text-brand-gold transition-colors">Layanan</a></li>
              <li><a href="#demo" className="text-white/60 hover:text-brand-gold transition-colors">Demo Undangan</a></li>
              <li><a href="#testimonials" className="text-white/60 hover:text-brand-gold transition-colors">Testimoni</a></li>
              <li><a href="#pricing" className="text-white/60 hover:text-brand-gold transition-colors">Harga</a></li>
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
                <Mail className="w-5 h-5 text-brand-gold flex-shrink-0" />
                <span>farhan.uzie77@webmail.umm.ac.id</span>
              </li>
              <li className="flex items-start gap-3 text-white/60">
                <Phone className="w-5 h-5 text-brand-gold flex-shrink-0" />
                <span>+62 83832543989</span>
              </li>
              <li className="flex items-start gap-3 text-white/60">
                <MapPin className="w-5 h-5 text-brand-gold flex-shrink-0" />
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
