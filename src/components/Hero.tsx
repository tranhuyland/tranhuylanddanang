import React from 'react';
import Image from 'next/image';
import { Phone, MessageCircle, Building2, MapPin, TrendingUp } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative w-full h-[85vh] min-h-[600px] flex items-center mb-16 overflow-hidden">
      
      {/* KHU VỰC 1: ẢNH NỀN TOÀN MÀN HÌNH (BACKGROUND) */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://res.cloudinary.com/ds6k0kfbz/image/upload/f_auto,q_auto/v1727771746/hero_banner_bds_vn.jpg"
          alt="Trần Huy Land - Kho nhà đất chính chủ Đà Nẵng"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Lớp phủ gradient chéo để làm nổi khối chữ bên trái */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/40 to-transparent"></div>
      </div>

      {/* KHU VỰC 2: KHỐI NỘI DUNG (GLASSMORPHISM BOX) */}
      <div className="max-w-7xl mx-auto w-full px-4 relative z-10">
        
        {/* Khối Box nằm lệch trái */}
        <div className="w-full md:max-w-xl lg:max-w-2xl bg-white/90 backdrop-blur-xl p-6 md:p-10 rounded-[2.5rem] shadow-2xl border border-white/50 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          
          {/* Nhãn nhỏ trên cùng */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 text-orange-600 text-xs font-bold uppercase tracking-wider mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            Kho Nhà Đất Chính Chủ Đà Nẵng
          </div>

          {/* Tiêu đề chính */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-800 leading-[1.1] tracking-tight mb-4">
            Nhà Thật • Giá Thật <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
              Giao Dịch Minh Bạch
            </span>
          </h1>

          {/* Mô tả phụ */}
          <p className="text-slate-500 font-medium text-[15px] md:text-base mb-8 max-w-lg leading-relaxed">
            Chuyên phân phối nhà phố, đất nền, mặt tiền kinh doanh tại Đà Nẵng. Hình ảnh thực tế, hỗ trợ đối chiếu sổ đỏ trực tiếp từ chủ nhà.
          </p>

          {/* NÚT LIÊN HỆ ĐƯỢC THIẾT KẾ LẠI CỰC ĐẸP */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <a 
              href="tel:0905778852" 
              className="w-full sm:w-auto flex justify-center items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-3.5 px-8 rounded-full shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
            >
              <Phone className="w-5 h-5" /> Liên Hệ Tư Vấn
            </a>
            <a 
              href="https://zalo.me/0905778852" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-full sm:w-auto flex justify-center items-center gap-2 bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 font-bold py-3.5 px-8 rounded-full transition-all duration-300 active:scale-95"
            >
              <MessageCircle className="w-5 h-5" /> Xem Giỏ Hàng Zalo
            </a>
          </div>

          {/* Dải thống kê nhanh (Trust Indicators) */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-200/60">
             <div className="flex flex-col">
                <span className="flex items-center gap-1.5 text-slate-800 font-black text-xl md:text-2xl"><Building2 className="w-4 h-4 text-orange-500"/> 500+</span>
                <span className="text-slate-500 text-[10px] md:text-xs font-medium uppercase tracking-wide mt-1">Sản Phẩm</span>
             </div>
             <div className="flex flex-col border-l border-slate-200/60 pl-4">
                <span className="flex items-center gap-1.5 text-slate-800 font-black text-xl md:text-2xl"><MapPin className="w-4 h-4 text-orange-500"/> 100%</span>
                <span className="text-slate-500 text-[10px] md:text-xs font-medium uppercase tracking-wide mt-1">Chính Chủ</span>
             </div>
             <div className="flex flex-col border-l border-slate-200/60 pl-4">
                <span className="flex items-center gap-1.5 text-slate-800 font-black text-xl md:text-2xl"><TrendingUp className="w-4 h-4 text-orange-500"/> Siêu</span>
                <span className="text-slate-500 text-[10px] md:text-xs font-medium uppercase tracking-wide mt-1">Đầu Tư</span>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}
