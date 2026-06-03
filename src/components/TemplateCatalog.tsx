import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, X } from 'lucide-react';
import type { Template } from '@/src/types';

const templates: Template[] = [
  {
    id: '1',
    title: 'Minimalist Elegance',
    image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=800',
    category: 'digital',
  },
  {
    id: '2',
    title: 'Floral Romance',
    image: 'https://images.unsplash.com/photo-1510076857177-7470076d4098?auto=format&fit=crop&q=80&w=800',
    category: 'printed',
  },
  {
    id: '3',
    title: 'Classic Gold',
    image: 'https://images.unsplash.com/photo-1522673607200-1648832cee98?auto=format&fit=crop&q=80&w=800',
    category: 'both',
  },
  {
    id: '4',
    title: 'Vintage Charm',
    image: 'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&fit=crop&q=80&w=800',
    category: 'digital',
  },
  {
    id: '5',
    title: 'Modern Abstract',
    image: 'https://images.unsplash.com/photo-1519225495810-75178319a139?auto=format&fit=crop&q=80&w=800',
    category: 'printed',
  },
  {
    id: '6',
    title: 'Bohemian Dream',
    image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=800',
    category: 'both',
  },
];

export default function TemplateCatalog() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  return (
    <section id="templates" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <span className="text-brand-gold font-semibold tracking-widest uppercase text-xs mb-4 block">
              Koleksi Kami
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-ink mb-4">
              Temukan Gaya Sempurna Anda
            </h2>
            <p className="text-brand-ink/60 text-lg">
              Pilih dari pilihan template premium kami, masing-masing dirancang untuk menangkap esensi cerita cinta Anda.
            </p>
          </div>
          <a href="#order" className="btn-secondary whitespace-nowrap">
            Permintaan Desain Kustom
          </a>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer"
              onClick={() => setSelectedTemplate(template)}
            >
              <img
                src={template.image}
                alt={template.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                <span className="text-white/60 text-xs uppercase tracking-widest mb-2">
                  {template.category}
                </span>
                <h4 className="text-white text-2xl font-serif font-bold mb-4">
                  {template.title}
                </h4>
                <div className="flex items-center gap-2 text-brand-gold font-medium">
                  <Eye className="w-5 h-5" />
                  Pratinjau Desain
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {selectedTemplate && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTemplate(null)}
              className="absolute inset-0 bg-brand-ink/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
            >
              <button
                onClick={() => setSelectedTemplate(null)}
                className="absolute top-6 right-6 z-10 p-2 bg-white/80 backdrop-blur-md rounded-full text-brand-ink hover:bg-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="md:w-1/2 h-[40vh] md:h-auto">
                <img
                  src={selectedTemplate.image}
                  alt={selectedTemplate.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="md:w-1/2 p-10 flex flex-col justify-center">
                <span className="text-brand-gold font-semibold tracking-widest uppercase text-xs mb-4 block">
                  Pratinjau Template
                </span>
                <h3 className="text-4xl font-serif font-bold text-brand-ink mb-6">
                  {selectedTemplate.title}
                </h3>
                <p className="text-brand-ink/60 mb-8 leading-relaxed">
                  Desain ini menampilkan tipografi elegan dan tata letak bersih, sempurna untuk perayaan pernikahan yang canggih. Dapat disesuaikan sepenuhnya dengan detail, foto, dan musik Anda.
                </p>
                <div className="space-y-4 mb-10">
                  <div className="flex items-center gap-3 text-brand-ink/80 font-medium">
                    <div className="w-2 h-2 rounded-full bg-brand-gold" />
                    Warna & Font yang Dapat Disesuaikan
                  </div>
                  <div className="flex items-center gap-3 text-brand-ink/80 font-medium">
                    <div className="w-2 h-2 rounded-full bg-brand-gold" />
                    Desain Responsif Mobile
                  </div>
                  <div className="flex items-center gap-3 text-brand-ink/80 font-medium">
                    <div className="w-2 h-2 rounded-full bg-brand-gold" />
                    Manajemen RSVP Sudah Termasuk
                  </div>
                </div>
                <a
                  href="#order"
                  onClick={() => setSelectedTemplate(null)}
                  className="btn-primary text-center"
                >
                  Pilih Template Ini
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
