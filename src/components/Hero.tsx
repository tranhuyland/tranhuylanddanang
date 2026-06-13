'use client';
import React from 'react';
import Image from 'next/image';
import { Phone, Building2, MapPin, TrendingUp, FileText } from 'lucide-react';

export default function Hero() {
  const handleOpenKyGui = () => {
    window.dispatchEvent(new CustomEvent('open-ky-goi-modal'));
  };

  return (
    // 🔥 CHỈNH SỬA: Tăng chiều cao lên h-[70vh] trên mobile để lộ ảnh nền nhiều hơn
    <section className="relative w-full h-[70vh] md:h-[65vh] min-h-[480px] flex items-center mb-10 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-bg.jpg"
          alt="Toàn cảnh flycam Đà Nẵng"
          fill
          className="object-cover object-center blur-[2px] scale-105 transition-transform duration-1000"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/50 to-slate-900/20"></div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 relative z-10">
        {/* 🔥 CHỈNH SỬA: Giảm padding trên mobile (p-4) để hộp chữ gọn gàng hơn, không che hết ảnh */}
        <div className="w-full md:max-w-xl lg:max-w-2xl bg-white/95 backdrop-blur-xl p-4 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl border border-white/50 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-100 text-orange-600 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-3">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500"></span>
            </span>
            Kho Nhà Đất Đà Nẵng
          </div>

          {/* Thu nhỏ bớt chữ trên mobile một chút để không bị xuống dòng quá nhiều */}
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-slate-800 leading-[1.2] tracking-tight mb-2">
            Nhà Thật • Giá Thật <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
              Giao Dịch Minh Bạch
            </span>
          </h1>

          <p className="text-slate-500 font-medium text-xs md:text-base mb-4 max-w-lg leading-relaxed">
            Chuyên phân phối nhà phố, đất nền, mặt tiền kinh doanh tại Đà Nẵng. Hình ảnh thực tế, hỗ trợ đối chiếu sổ đỏ trực tiếp từ chủ nhà.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <a 
              href="tel:0905778852" 
              className="w-full sm:w-auto flex justify-center items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-2.5 px-5 rounded-full shadow-lg shadow-orange-500/30 text-sm hover:shadow-orange-500/50 hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
            >
              <Phone className="w-4 h-4" /> Liên Hệ Tư Vấn
            </a>
            
            <button 
              onClick={handleOpenKyGui}
              className="w-full sm:w-auto flex justify-center items-center gap-2 bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 font-bold py-2.5 px-5 rounded-full text-sm transition-all duration-300 active:scale-95"
            >
              <FileText className="w-4 h-4" /> Ký Gởi Nhà Đất
            </button>
          </div>

          {/* 🔥 CHỈNH SỬA: Thu gọn phần chỉ số dưới cùng để vừa vặn, không đẩy khung dài ra */}
          <div className="grid grid-cols-3 gap-1 mt-4 pt-3 border-t border-slate-200/60">
             <div className="flex flex-col items-center sm:items-start">
                <span className="flex items-center gap-1 text-slate-800 font-black text-base md:text-xl"><Building2 className="w-3.5 h-3.5 text-orange-500"/> 500+</span>
                <span className="text-slate-400 text-[9px] md:text-xs font-bold uppercase tracking-wide mt-0.5">Sản Phẩm</span>
             </div>
             <div className="flex flex-col items-center sm:items-start border-l border-slate-200/60 pl-1 sm:pl-4">
                <span className="flex items-center gap-1 text-slate-800 font-black text-base md:text-xl"><MapPin className="w-3.5 h-3.5 text-orange-500"/> 100%</span>
                <span className="text-slate-400 text-[9px] md:text-xs font-bold uppercase tracking-wide mt-0.5">Chính Chủ</span>
             </div>
             <div className="flex flex-col items-center sm:items-start border-l border-slate-200/60 pl-1 sm:pl-4">
                <span className="flex items-center gap-1 text-slate-800 font-black text-base md:text-xl"><TrendingUp className="w-3.5 h-3.5 text-orange-500"/> Siêu</span>
                <span className="text-slate-400 text-[9px] md:text-xs font-bold uppercase tracking-wide mt-0.5">Đầu Tư</span>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}
