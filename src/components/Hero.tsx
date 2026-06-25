'use client';
import React from 'react';
import Image from 'next/image';
import { Phone, Building2, MapPin, TrendingUp, FileText } from 'lucide-react';

const HERO_STATS = [
  { icon: Building2, value: '500+', label: 'Sản Phẩm' },
  { icon: MapPin, value: '100%', label: 'Chính Chủ' },
  { icon: TrendingUp, value: 'Siêu', label: 'Đầu Tư' },
] as const;

export default function Hero() {
  const handleOpenKyGui = () => {
    window.dispatchEvent(new CustomEvent('open-ky-goi-modal'));
  };

  return (
    // 💡 Định hình kích thước cứng tại đây: Mobile 65vh, PC tự co giãn theo tỷ lệ
    <section className="relative w-full h-[65vh] min-h-[480px] flex items-center justify-center overflow-hidden">
      
      {/* Background Hero - Cố định kích thước khung để tránh Layout Shift */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-bg.jpg"
          alt="Toàn cảnh Đà Nẵng"
          fill
          priority={true}
          fetchPriority="high"
          loading="eager"
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Lớp phủ tối */}
        <div className="absolute inset-0 bg-slate-900/40" />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto w-full px-4 relative z-10">
        <div className="w-full md:max-w-xl lg:max-w-2xl bg-white/10 backdrop-blur-md p-6 md:p-8 rounded-[2rem] shadow-2xl border border-white/20">
          
          <h1 className="text-[32px] sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight mb-4 drop-shadow-md">
            Trần Huy Land <br />
            <span className="text-orange-400">Kho Nhà Đất Đà Nẵng</span>
          </h1>

          <p className="text-slate-100 font-medium text-base sm:text-lg mb-6 max-w-md leading-relaxed drop-shadow-sm">
            Nhà thật, giá thật, pháp lý minh bạch. Hình ảnh khảo sát thực tế, hỗ trợ đối chiếu sổ đỏ ngay.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <a
              href="tel:0905778852"
              className="w-full sm:w-auto flex justify-center items-center gap-2 bg-slate-900 text-white font-bold py-3.5 px-8 rounded-full shadow-lg hover:bg-slate-800 transition-all active:scale-95"
            >
              <Phone className="w-4 h-4" />
              Gọi Ngay
            </a>

            <button
              onClick={handleOpenKyGui}
              className="w-full sm:w-auto flex justify-center items-center gap-2 bg-orange-500 text-white font-bold py-3.5 px-8 rounded-full shadow-lg hover:bg-orange-600 transition-all active:scale-95"
            >
              <FileText className="w-4 h-4" />
              Ký Gửi Nhanh
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 mt-8 pt-6 border-t border-white/20">
            {HERO_STATS.map((stat, idx) => (
              <div key={idx} className={`flex flex-col ${idx > 0 ? 'border-l border-white/20 pl-3 md:pl-4' : ''}`}>
                <span className="flex items-center gap-1.5 text-white font-black text-xl md:text-2xl">
                  <stat.icon className="w-5 h-5 text-orange-400 shrink-0" />
                  {stat.value}
                </span>
                <span className="text-slate-200 text-[11px] font-bold uppercase tracking-wider mt-1">
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
