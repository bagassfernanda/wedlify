import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, Eye, Heart, Sparkles, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';

type FilterCategory = 'Semua' | 'Elegant' | 'Floral' | 'Modern' | 'Traditional' | 'Premium';
type TemplateCategory = 'Digital' | 'Premium' | 'Custom';

interface CatalogTemplate {
  id: string;
  title: string;
  image: string;
  style: string;
  category: TemplateCategory;
  description: string;
  fitFor: string;
  tags: Exclude<FilterCategory, 'Semua'>[];
  features: string[];
}

interface TemplateCatalogProps {
  onSelectTemplate: (templateName: string) => void;
}

const filterCategories: FilterCategory[] = [
  'Semua',
  'Elegant',
  'Floral',
  'Modern',
  'Traditional',
  'Premium',
];

const includedFeatures = [
  'Cover undangan',
  'Countdown acara',
  'Detail akad & resepsi',
  'Galeri foto',
  'RSVP',
  'Love story',
  'Maps lokasi',
  'Musik',
];

const templates: CatalogTemplate[] = [
  {
    id: 'elegant-gold',
    title: 'Elegant Gold',
    image: '/templates/elegant-gold.png',
    style: 'Elegant',
    category: 'Premium',
    description: 'Nuansa ivory dengan detail rose-gold yang lembut untuk kesan klasik dan berkelas.',
    fitFor: 'Pernikahan ballroom, garden party elegan, atau intimate wedding dengan palet cream dan blush.',
    tags: ['Elegant', 'Premium'],
    features: includedFeatures,
  },
  {
    id: 'soft-floral',
    title: 'Soft Floral',
    image: '/templates/soft-floral.png',
    style: 'Floral',
    category: 'Digital',
    description: 'Rangkaian bunga blush pink memberi kesan romantis, manis, dan tetap clean.',
    fitFor: 'Akad dan resepsi bernuansa garden, soft romantic, atau dekorasi bunga pastel.',
    tags: ['Floral'],
    features: includedFeatures,
  },
  {
    id: 'modern-minimalist',
    title: 'Modern Minimalist',
    image: '/templates/modern-minimalist.png',
    style: 'Modern',
    category: 'Digital',
    description: 'Desain minimal dengan botanical line art untuk pasangan yang menyukai tampilan tenang.',
    fitFor: 'Pernikahan modern, semi outdoor, atau konsep intimate dengan warna sage, cream, dan putih.',
    tags: ['Modern'],
    features: includedFeatures,
  },
  {
    id: 'rustic-garden',
    title: 'Rustic Garden',
    image: '/templates/rustic-garden.png',
    style: 'Floral',
    category: 'Custom',
    description: 'Sentuhan kayu, lampu hangat, dan foliage memberi suasana outdoor yang natural.',
    fitFor: 'Garden wedding, rustic outdoor, akad sore, atau resepsi dengan dekorasi kayu dan tanaman.',
    tags: ['Floral', 'Traditional'],
    features: includedFeatures,
  },
  {
    id: 'luxury-black',
    title: 'Luxury Black',
    image: '/templates/luxury-black.png',
    style: 'Elegant',
    category: 'Premium',
    description: 'Kombinasi hitam dan rose-gold untuk tampilan dramatis, formal, dan mewah.',
    fitFor: 'Resepsi malam, ballroom luxury, atau konsep black-tie wedding yang glamor.',
    tags: ['Elegant', 'Premium'],
    features: includedFeatures,
  },
  {
    id: 'pastel-romance',
    title: 'Pastel Romance',
    image: '/templates/pastel-romance.png',
    style: 'Floral',
    category: 'Digital',
    description: 'Lavender dan blush pink watercolor menciptakan undangan yang lembut dan feminin.',
    fitFor: 'Pernikahan romantis, bridal shower style, atau dekorasi pastel dengan banyak bunga.',
    tags: ['Floral'],
    features: includedFeatures,
  },
  {
    id: 'ocean-blue-beach',
    title: 'Ocean Blue Beach Romance',
    image: '/templates/ocean-blue-beach.png',
    style: 'Floral',
    category: 'Premium',
    description: 'Aksen ocean blue, shell, dan floral cream memberi kesan beach wedding yang lembut.',
    fitFor: 'Pernikahan beach romance, outdoor seaside, atau dekorasi biru pastel dengan cream dan pearl detail.',
    tags: ['Floral', 'Premium'],
    features: includedFeatures,
  },
  {
    id: 'peacock-royal',
    title: 'Peacock Royal Elegance',
    image: '/templates/peacock-royal.png',
    style: 'Elegant',
    category: 'Premium',
    description: 'Detail merak, navy, teal, dan gold menciptakan undangan royal yang berani dan elegan.',
    fitFor: 'Resepsi glamor, tema royal heritage modern, atau dekorasi navy gold dengan sentuhan tradisional.',
    tags: ['Elegant', 'Premium', 'Traditional'],
    features: includedFeatures,
  },
  {
    id: 'islamic-classic',
    title: 'Islamic Classic',
    image: '/templates/islamic-classic.png',
    style: 'Traditional',
    category: 'Premium',
    description: 'Ornamen islami emerald dan cream menghadirkan kesan sakral, teduh, dan premium.',
    fitFor: 'Akad nikah islami, walimatul ursy, atau resepsi dengan dekorasi emerald, gold, dan cream.',
    tags: ['Traditional', 'Premium', 'Elegant'],
    features: includedFeatures,
  },
  {
    id: 'javanese-traditional',
    title: 'Javanese Traditional',
    image: '/templates/javanese-traditional.png',
    style: 'Traditional',
    category: 'Custom',
    description: 'Motif Jawa klasik dengan maroon dan gold untuk nuansa adat yang megah.',
    fitFor: 'Pernikahan adat Jawa, resepsi tradisional, atau konsep royal heritage.',
    tags: ['Traditional', 'Premium'],
    features: includedFeatures,
  },
  {
    id: 'korean-soft',
    title: 'Korean Soft',
    image: '/templates/korean-soft.png',
    style: 'Modern',
    category: 'Digital',
    description: 'Komposisi beige, bunga putih, dan ruang kosong luas untuk nuansa Korean wedding.',
    fitFor: 'Pernikahan minimal, Korean inspired, atau prewedding dengan tone cream dan ivory.',
    tags: ['Modern'],
    features: includedFeatures,
  },
  {
    id: 'premium-magazine',
    title: 'Premium Magazine',
    image: '/templates/premium-magazine.png',
    style: 'Premium',
    category: 'Custom',
    description: 'Layout editorial dengan foto utama besar seperti cover majalah pernikahan.',
    fitFor: 'Pasangan yang ingin undangan photo-based, modern luxury, dan terasa personal.',
    tags: ['Modern', 'Premium'],
    features: includedFeatures,
  },
];

export default function TemplateCatalog({ onSelectTemplate }: TemplateCatalogProps) {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('Semua');
  const [selectedTemplate, setSelectedTemplate] = useState<CatalogTemplate | null>(null);

  const filteredTemplates = useMemo(() => {
    if (activeFilter === 'Semua') {
      return templates;
    }

    return templates.filter((template) => template.tags.includes(activeFilter));
  }, [activeFilter]);

  useEffect(() => {
    if (!selectedTemplate) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedTemplate(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTemplate]);

  const handleChooseTemplate = (template: CatalogTemplate) => {
    onSelectTemplate(template.title);
    setSelectedTemplate(null);

    window.setTimeout(() => {
      document.getElementById('order')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 80);
  };

  return (
    <section
      id="templates"
      className="scroll-mt-24 py-24 bg-gradient-to-b from-brand-pastel via-white to-brand-beige/70 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 text-brand-gold font-semibold tracking-widest uppercase text-xs mb-4">
              <Sparkles className="w-4 h-4" />
              Katalog Template
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-ink mb-4">
              Pilih Tema Undangan yang Paling Mewakili Hari Bahagia Anda
            </h2>
            <p className="text-brand-ink/60 text-lg leading-relaxed">
              Setiap template dibuat dengan nuansa pink-cream yang lembut, detail elegan, dan struktur digital siap dikustom sesuai cerita pernikahan Anda.
            </p>
          </div>
          <a href="#order" className="btn-secondary whitespace-nowrap text-center">
            Request Desain Custom
          </a>
        </div>

        <div className="mb-10 -mx-6 px-6 overflow-x-auto">
          <div className="flex w-max min-w-full gap-3 pb-2">
            {filterCategories.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  'rounded-full border px-5 py-2.5 text-sm font-semibold transition-all duration-300',
                  activeFilter === filter
                    ? 'border-brand-gold bg-brand-gold text-white shadow-sm shadow-brand-gold/20'
                    : 'border-brand-gold/20 bg-white/80 text-brand-ink/65 hover:border-brand-gold/50 hover:text-brand-gold'
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredTemplates.map((template, index) => (
              <motion.article
                layout
                key={template.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ delay: index * 0.04, duration: 0.35 }}
                className="group overflow-hidden rounded-3xl border border-brand-gold/15 bg-white shadow-sm shadow-brand-gold/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-gold/10"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-brand-beige">
                  <img
                    src={template.image}
                    alt={`Preview template ${template.title}`}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-brand-ink shadow-sm">
                      {template.style}
                    </span>
                    <span className="rounded-full bg-brand-gold px-3 py-1 text-xs font-semibold text-white shadow-sm">
                      {template.category}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="mb-4 min-h-[7rem]">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-gold">
                      {template.style} Style
                    </p>
                    <h3 className="mb-2 text-2xl font-serif font-bold text-brand-ink">
                      {template.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-brand-ink/60">
                      {template.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedTemplate(template)}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-gold/30 px-4 py-2.5 text-sm font-semibold text-brand-gold transition-colors hover:bg-brand-gold/10"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChooseTemplate(template)}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-gold px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-gold/90"
                    >
                      <Heart className="w-4 h-4" />
                      Pilih Tema
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedTemplate && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.button
              type="button"
              aria-label="Tutup preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTemplate(null)}
              className="absolute inset-0 bg-brand-ink/75 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 18 }}
              className="relative z-10 w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-2xl"
            >
              <button
                type="button"
                aria-label="Tutup modal preview"
                onClick={() => setSelectedTemplate(null)}
                className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-brand-ink shadow-sm transition-colors hover:bg-brand-beige"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
                <div className="bg-brand-beige p-4 md:p-6 lg:min-h-[720px]">
                  <img
                    src={selectedTemplate.image}
                    alt={`Preview besar template ${selectedTemplate.title}`}
                    className="h-full max-h-[76vh] min-h-[420px] w-full rounded-[1.5rem] object-cover shadow-xl shadow-brand-ink/10"
                  />
                </div>

                <div className="p-6 md:p-10 lg:p-12">
                  <div className="mb-5 flex flex-wrap gap-2">
                    <span className="rounded-full bg-brand-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-gold">
                      {selectedTemplate.style}
                    </span>
                    <span className="rounded-full bg-brand-ink px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                      {selectedTemplate.category}
                    </span>
                  </div>

                  <h3 className="mb-4 text-4xl md:text-5xl font-serif font-bold text-brand-ink">
                    {selectedTemplate.title}
                  </h3>
                  <p className="mb-7 text-base leading-relaxed text-brand-ink/65">
                    {selectedTemplate.description}
                  </p>

                  <div className="mb-8 rounded-2xl border border-brand-gold/15 bg-brand-pastel p-5">
                    <p className="mb-2 text-sm font-semibold text-brand-gold">
                      Cocok untuk tema pernikahan
                    </p>
                    <p className="leading-relaxed text-brand-ink/70">
                      {selectedTemplate.fitFor}
                    </p>
                  </div>

                  <div className="mb-9">
                    <p className="mb-4 text-sm font-semibold text-brand-ink/75">
                      Fitur yang termasuk
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {selectedTemplate.features.map((feature) => (
                        <div
                          key={feature}
                          className="flex items-center gap-3 rounded-2xl bg-brand-beige/60 px-4 py-3 text-sm font-medium text-brand-ink/75"
                        >
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-gold" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => handleChooseTemplate(selectedTemplate)}
                      className="btn-primary inline-flex items-center justify-center gap-2"
                    >
                      <Heart className="w-4 h-4" />
                      Pilih Tema Ini
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedTemplate(null)}
                      className="btn-secondary"
                    >
                      Tutup Preview
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
