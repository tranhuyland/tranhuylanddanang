'use client';
import React from 'react';
import { Phone, Building2, MapPin, TrendingUp, FileText } from 'lucide-react';

export default function Hero() {
  const handleOpenKyGui = () => {
    window.dispatchEvent(new CustomEvent('open-ky-goi-modal'));
  };

  return (
    <section className="relative w-full pt-12 pb-24 md:pt-20 md:pb-32 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="/hero-bg.jpg"
          alt="Toàn cảnh Đà Nẵng"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-slate-900/20"></div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 relative z-10">
        <div className="w-full md:max-w-xl lg:max-w-2xl bg-white/30 backdrop-blur-lg p-6 md:p-8 rounded-[2rem] shadow-2xl border border-white/50 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 text-orange-600 text-[11px] font-bold uppercase tracking-wider mb-4 shadow-sm border border-white">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            Kho Nhà Đất Đà Nẵng
          </div>

          <h1 className="text-[28px] sm:text-4xl lg:text-5xl font-black text-slate-900 leading-[1.2] tracking-tight mb-3">
            Nhà Thật • Giá Thật <br />
            {/* 🔥 SỬA LỖI NHỨC MẮT: Dùng màu cam đậm nét căng thay vì gradient mờ ảo */}
            <span className="text-orange-600 drop-shadow-sm">
              Giao Dịch Minh Bạch
            </span>
          </h1>

          <p className="text-slate-900 font-medium text-sm sm:text-base mb-6 max-w-lg leading-relaxed">
            Chuyên phân phối nhà phố, đất nền, mặt tiền kinh doanh tại Đà Nẵng. Hình ảnh thực tế, hỗ trợ đối chiếu sổ đỏ trực tiếp.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <a 
              href="tel:0905778852" 
              className="w-full sm:w-auto flex justify-center items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-orange-500/30 text-sm hover:shadow-orange-500/50 active:scale-95 transition-all"
            >
              <Phone className="w-4 h-4" /> Liên Hệ Tư Vấn
            </a>
            
            <button 
              onClick={handleOpenKyGui}
              className="w-full sm:w-auto flex justify-center items-center gap-2 bg-white/95 text-slate-800 border border-white hover:bg-white font-bold py-3 px-6 rounded-2xl text-sm shadow-md active:scale-95 transition-all"
            >
              <FileText className="w-4 h-4 text-blue-600" /> Ký Gởi Nhà Đất
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-slate-900/10">
             <div className="flex flex-col">
                <span className="flex items-center gap-1 text-slate-900 font-black text-lg"><Building2 className="w-4 h-4 text-orange-600"/> 500+</span>
                <span className="text-slate-800 text-[10px] font-bold uppercase tracking-wide mt-0.5">Sản Phẩm</span>
             </div>
             <div className="flex flex-col border-l border-slate-900/10 pl-3 md:pl-4">
                <span className="flex items-center gap-1 text-slate-900 font-black text-lg"><MapPin className="w-4 h-4 text-orange-600"/> 100%</span>
                <span className="text-slate-800 text-[10px] font-bold uppercase tracking-wide mt-0.5">Chính Chủ</span>
             </div>
             <div className="flex flex-col border-l border-slate-900/10 pl-3 md:pl-4">
                <span className="flex items-center gap-1 text-slate-900 font-black text-lg"><TrendingUp className="w-4 h-4 text-orange-600"/> Siêu</span>
                <span className="text-slate-800 text-[10px] font-bold uppercase tracking-wide mt-0.5">Đầu Tư</span>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}
