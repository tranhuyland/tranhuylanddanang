'use client'; // Thêm dòng này để cho phép dùng state/sự kiện
import React from 'react';
import Image from 'next/image';
import { Phone, MessageCircle, Building2, MapPin, TrendingUp, FileText } from 'lucide-react';

export default function Hero() {
  // Hàm này kích hoạt sự kiện mở Modal Ký Gửi
  const handleOpenKyGui = () => {
    // Chúng ta tạo một sự kiện tùy chỉnh để Modals.tsx lắng nghe
    window.dispatchEvent(new CustomEvent('open-ky-goi-modal'));
  };

  return (
    <section className="relative w-full h-[65vh] min-h-[480px] flex items-center mb-10 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://res.cloudinary.com/ds6k0kfbz/image/upload/f_auto,q_auto/v1727771746/hero_banner_bds_vn.jpg"
          alt=""
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/40 to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 relative z-10">
        <div className="w-full md:max-w-xl lg:max-w-2xl bg-white/90 backdrop-blur-xl p-5 md:p-8 rounded-[2.5rem] shadow-2xl border border-white/50 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 text-orange-600 text-[11px] md:text-xs font-bold uppercase tracking-wider mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            Kho Nhà Đất Chính Chủ Đà Nẵng
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-800 leading-[1.2] tracking-tight mb-3">
            Nhà Thật • Giá Thật <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
              Giao Dịch Minh Bạch
            </span>
          </h1>

          <p className="text-slate-500 font-medium text-sm md:text-base mb-5 max-w-lg leading-relaxed">
            Chuyên phân phối nhà phố, đất nền, mặt tiền kinh doanh tại Đà Nẵng. Hình ảnh thực tế, hỗ trợ đối chiếu sổ đỏ trực tiếp từ chủ nhà.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <a 
              href="tel:0905778852" 
              className="w-full sm:w-auto flex justify-center items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-2.5 px-6 rounded-full shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
            >
              <Phone className="w-4 h-4 md:w-5 md:h-5" /> Liên Hệ Tư Vấn
            </a>
            
            {/* NÚT KÝ GỬI NHÀ ĐẤT - Gọi Modal */}
            <button 
              onClick={handleOpenKyGui}
              className="w-full sm:w-auto flex justify-center items-center gap-2 bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 font-bold py-2.5 px-6 rounded-full transition-all duration-300 active:scale-95"
            >
              <FileText className="w-4 h-4 md:w-5 md:h-5" /> Ký Gởi Nhà Đất
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-200/60">
             <div className="flex flex-col">
                <span className="flex items-center gap-1 text-slate-800 font-black text-lg md:text-xl"><Building2 className="w-4 h-4 text-orange-500"/> 500+</span>
                <span className="text-slate-500 text-[10px] md:text-xs font-medium uppercase tracking-wide mt-0.5">Sản Phẩm</span>
             </div>
             <div className="flex flex-col border-l border-slate-200/60 pl-3 md:pl-4">
                <span className="flex items-center gap-1 text-slate-800 font-black text-lg md:text-xl"><MapPin className="w-4 h-4 text-orange-500"/> 100%</span>
                <span className="text-slate-500 text-[10px] md:text-xs font-medium uppercase tracking-wide mt-0.5">Chính Chủ</span>
             </div>
             <div className="flex flex-col border-l border-slate-200/60 pl-3 md:pl-4">
                <span className="flex items-center gap-1 text-slate-800 font-black text-lg md:text-xl"><TrendingUp className="w-4 h-4 text-orange-500"/> Siêu</span>
                <span className="text-slate-500 text-[10px] md:text-xs font-medium uppercase tracking-wide mt-0.5">Đầu Tư</span>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
