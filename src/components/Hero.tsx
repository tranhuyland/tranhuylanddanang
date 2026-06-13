import React from 'react';
import Image from 'next/image';
import { Phone, MessageCircle, Building2, MapPin, TrendingUp } from 'lucide-react';

export default function Hero() {
  return (
    // 💡 Đã giảm chiều cao: từ 85vh xuống 65vh, và min-h từ 600px xuống 480px
    <section className="relative w-full h-[65vh] min-h-[480px] flex items-center mb-10 overflow-hidden">
      
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
        
        {/* Khối Box nằm lệch trái - 💡 Thu gọn padding từ p-10 xuống p-8 */}
        <div className="w-full md:max-w-xl lg:max-w-2xl bg-white/90 backdrop-blur-xl p-5 md:p-8 rounded-[2rem] shadow-2xl border border-white/50 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          
          {/* Nhãn nhỏ trên cùng - Đã tối ưu cho nổi bật, viền mảnh mềm mại và dễ đọc */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/80 border border-orange-200 text-orange-700 text-xs md:text-sm font-bold shadow-sm mb-5 backdrop-blur-md">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-600"></span>
            </span>
            Trần Huy Land - Kho Nhà Đất Chính Chủ Đà Nẵng
          </div>

          {/* Tiêu đề chính - 💡 Thu nhỏ font chữ một chút (từ 6xl xuống 5xl) */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-800 leading-[1.2] tracking-tight mb-3">
            Nhà Thật • Giá Thật <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
              Giao Dịch Minh Bạch
            </span>
          </h1>

          {/* Mô tả phụ - 💡 Giảm margin mb-8 thành mb-5 */}
          <p className="text-slate-500 font-medium text-sm md:text-base mb-5 max-w-lg leading-relaxed">
            Chuyên phân phối nhà phố, đất nền, mặt tiền kinh doanh tại Đà Nẵng. Hình ảnh thực tế, hỗ trợ đối chiếu sổ đỏ trực tiếp từ chủ nhà.
          </p>

          {/* NÚT LIÊN HỆ - 💡 Căn chỉnh lại độ rộng nút (py-3.5 thành py-2.5) */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <a 
              href="tel:0905778852" 
              className="w-full sm:w-auto flex justify-center items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-2.5 px-6 rounded-full shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
            >
              <Phone className="w-4 h-4 md:w-5 md:h-5" /> Liên Hệ Tư Vấn
            </a>
            <a 
              href="https://zalo.me/0905778852" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-full sm:w-auto flex justify-center items-center gap-2 bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 font-bold py-2.5 px-6 rounded-full transition-all duration-300 active:scale-95"
            >
              <MessageCircle className="w-4 h-4 md:w-5 md:h-5" /> Xem Giỏ Hàng Zalo
            </a>
          </div>

          {/* Dải thống kê nhanh - 💡 Kéo gần lại khối nút bấm (mt-8 pt-8 thành mt-5 pt-4) */}
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
