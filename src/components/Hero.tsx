'use client';
import React, { useState } from "react";
import { FileText } from "lucide-react"; 
import { Modals } from "./Modals"; // 🚨 Anh nhớ sửa lại đường dẫn import này cho khớp với file Modals của anh nhé (vd: "@/components/Modals")

export default function Hero() {
  // State để điều khiển việc đóng/mở bảng Ký gửi
  const [isOpenKyGui, setIsOpenKyGui] = useState(false);

  return (
    <section className="hero-bg text-white">
      {/* 🛠 Đã thu gọn chiều cao: Giảm padding từ py-20 sm:py-28 xuống py-12 sm:py-16 */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-1.5 text-xs font-bold mb-5 tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span> KHO NHÀ ĐẤT CHÍNH CHỦ ĐÀ NẴNG
          </div>
          
          {/* 🛠 Chữ tiêu đề thu gọn lại một chút trên mobile để đỡ chiếm diện tích */}
          <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
            Nhà Thật • Giá Thật • Giao Dịch Minh Bạch
          </h2>
          
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8">
            Chuyên phân phối nhà phố, đất nền, mặt tiền kinh doanh và nhà kiệt ô tô tại Hải Châu, Cẩm Lệ, Sơn Trà... Hình ảnh khảo sát thực tế, hỗ trợ đối chiếu sổ đỏ trực tiếp từ chủ nhà.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <a href="tel:0905778852" className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-6 py-3.5 rounded-2xl font-extrabold shadow-lg transition-all">
              Liên Hệ Tư Vấn
            </a>
            
            {/* 🛠 Nút Ký Gởi Nhanh: Đổi thẻ <a> thành thẻ <button> và thêm sự kiện mở Modal */}
            <button 
              onClick={() => setIsOpenKyGui(true)}
              className="border border-white/20 hover:bg-white/10 px-6 py-3.5 rounded-2xl font-bold transition-all flex items-center gap-2"
            >
              <FileText className="w-5 h-5" /> Ký Gởi Nhanh
            </button>
          </div>
        </div>
      </div>

      {/* 🛠 Nhúng Modal Ký Gửi vào đây. Nó sẽ bị ẩn đi cho đến khi isOpenKyGui = true */}
      <Modals type="kygui" isOpen={isOpenKyGui} onClose={() => setIsOpenKyGui(false)} />
    </section>
  );
}
