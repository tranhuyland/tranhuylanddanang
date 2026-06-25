import Image from 'next/image';
import { Phone } from 'lucide-react';
import KyGuiButton from './KyGuiButton';

const HERO_STATS = [
  { value: '500+', label: 'Sản Phẩm' },
  { value: '100%', label: 'Chính Chủ' },
  { value: 'Siêu', label: 'Đầu Tư' },
] as const;

export default function Hero() {
  return (
    <section className="relative w-full h-[65vh] min-h-[480px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-bg.jpg"
          alt="Toàn cảnh Đà Nẵng"
          fill
          priority
          fetchPriority="high"
          quality={85}
          sizes="100vw"
          className="object-cover object-center"
        />

        <div className="absolute inset-0 bg-slate-900/45" />
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 relative z-10">
        <div className="w-full md:max-w-xl lg:max-w-2xl bg-slate-900/40 p-6 md:p-8 rounded-[2rem] border border-white/15">

          <h1 className="text-[32px] sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight mb-4">
            Trần Huy Land
            <br />
            <span className="text-orange-400">
              Kho Nhà Đất Đà Nẵng
            </span>
          </h1>

          <p className="text-slate-100 font-medium text-base sm:text-lg mb-6 max-w-md leading-relaxed">
            Nhà thật, giá thật, pháp lý minh bạch. Hình ảnh khảo sát thực tế,
            hỗ trợ đối chiếu sổ đỏ ngay.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <a
              href="tel:0905778852"
              className="w-full sm:w-auto flex justify-center items-center gap-2 bg-slate-900 text-white font-bold py-3.5 px-8 rounded-full hover:bg-slate-800 transition-colors"
            >
              <Phone className="w-4 h-4" />
              Gọi Ngay
            </a>

            <KyGuiButton />
          </div>

          <div className="grid grid-cols-3 gap-2 mt-8 pt-6 border-t border-white/20">
            {HERO_STATS.map((stat, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  idx > 0 ? 'border-l border-white/20 pl-3 md:pl-4' : ''
                }`}
              >
                <span className="text-white font-black text-xl md:text-2xl">
                  {stat.value}
                </span>

                <span className="text-slate-300 text-[11px] font-bold uppercase tracking-wider mt-1">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
