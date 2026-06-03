import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'motion/react';
import { Send } from 'lucide-react';

const orderSchema = z.object({
  brideName: z.string().min(2, 'Nama pengantin wanita wajib diisi'),
  groomName: z.string().min(2, 'Nama pengantin pria wajib diisi'),
  weddingDate: z.string().min(1, 'Tanggal pernikahan wajib diisi'),
  location: z.string().min(5, 'Lokasi wajib diisi'),
  message: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

export default function OrderForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
  });

  const onSubmit = async (data: OrderFormData) => {
    const message = `Halo Wedlify! Saya ingin memesan undangan pernikahan. Berikut detailnya:

👰 Pengantin Wanita: ${data.brideName}
🤵 Pengantin Pria: ${data.groomName}
📅 Tanggal Pernikahan: ${data.weddingDate}
📍 Lokasi: ${data.location}${data.message ? `\n📝 Pesan: ${data.message}` : ''}

Mohon informasi lebih lanjut. Terima kasih!`;

    const whatsappUrl = `https://wa.me/6283832543989?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    reset();
  };

  return (
    <section id="order" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-brand-gold font-semibold tracking-widest uppercase text-xs mb-4 block">
              Mulai Sekarang
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-ink mb-6">
              Siap Membuat Undangan <br />
              <span className="italic text-brand-gold">Sempurna Anda?</span>
            </h2>
            <p className="text-brand-ink/60 text-lg mb-8 leading-relaxed">
              Isi formulir dengan detail pernikahan Anda, dan tim kami akan menghubungi Anda untuk memulai proses desain. Kami memastikan setiap detail sempurna untuk hari spesial Anda.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-beige flex items-center justify-center text-brand-gold font-bold">1</div>
                <p className="font-medium text-brand-ink">Kirim detail pernikahan Anda</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-beige flex items-center justify-center text-brand-gold font-bold">2</div>
                <p className="font-medium text-brand-ink">Pilih template favorit Anda</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-beige flex items-center justify-center text-brand-gold font-bold">3</div>
                <p className="font-medium text-brand-ink">Tinjau dan finalisasi desain</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-brand-pastel p-8 md:p-12 rounded-3xl border border-brand-beige shadow-sm"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-brand-ink/70 ml-1">Nama Pengantin Wanita</label>
                  <input
                    {...register('brideName')}
                    placeholder="misal: Sarah"
                    className="w-full px-4 py-3 rounded-xl border border-brand-beige bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all"
                  />
                  {errors.brideName && <p className="text-red-500 text-xs mt-1 ml-1">{errors.brideName.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-brand-ink/70 ml-1">Nama Pengantin Pria</label>
                  <input
                    {...register('groomName')}
                    placeholder="misal: James"
                    className="w-full px-4 py-3 rounded-xl border border-brand-beige bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all"
                  />
                  {errors.groomName && <p className="text-red-500 text-xs mt-1 ml-1">{errors.groomName.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-brand-ink/70 ml-1">Tanggal Pernikahan</label>
                <input
                  {...register('weddingDate')}
                  type="date"
                  className="w-full px-4 py-3 rounded-xl border border-brand-beige bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all"
                />
                {errors.weddingDate && <p className="text-red-500 text-xs mt-1 ml-1">{errors.weddingDate.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-brand-ink/70 ml-1">Lokasi</label>
                <input
                  {...register('location')}
                  placeholder="misal: Grand Ballroom, Hotel Mulia"
                  className="w-full px-4 py-3 rounded-xl border border-brand-beige bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all"
                />
                {errors.location && <p className="text-red-500 text-xs mt-1 ml-1">{errors.location.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-brand-ink/70 ml-1">Pesan Kustom (Opsional)</label>
                <textarea
                  {...register('message')}
                  placeholder="Permintaan khusus atau catatan..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-brand-beige bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary flex items-center justify-center gap-2 py-4 disabled:opacity-70"
              >
                <>
                  Pesan via WhatsApp
                  <Send className="w-4 h-4" />
                </>
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
