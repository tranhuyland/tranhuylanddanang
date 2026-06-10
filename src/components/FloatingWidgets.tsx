'use client';
import React, { useState } from "react";
import { Phone, FilePlus2 } from "lucide-react";
import { Modals } from "./Modals";

export default function FloatingWidgets() {
  const [isOpenKyGui, setIsOpenKyGui] = useState(false);
  
  // Thông tin cấu hình nhanh liên hệ của anh Huy
  const phoneNumber = "0905778852";
  const zaloUrl = "https://zalo.me/0905778852";

  return (
    <>
      {/* 1. THANH TIỆN ÍCH LIÊN HỆ DƯỚI ĐÁY MÀN HÌNH (Chỉ hiện trên Điện thoại - dưới 768px) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 grid grid-cols-3 z-50 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
        
        {/* Cột 1: Nút Gọi Ngay (Nền xanh lá cây chuẩn phong thủy) */}
        <a 
          href={`tel:${phoneNumber}`} 
          className="flex flex-col items-center justify-center bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 transition-colors duration-150"
        >
          <div className="relative flex items-center justify-center mb-1">
            {/* Hiệu ứng sóng rung nhẹ lan tỏa thu hút sự chú ý */}
            <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-white opacity-45"></span>
            <Phone className="w-4 h-4 relative z-10 fill-white/10" />
          </div>
          <span className="text-[11px] font-medium tracking-wide">Gọi điện</span>
        </a>

        {/* Cột 2: Nút Nhắn Tin Zalo (Nền màu xanh thương hiệu Zalo phẳng) */}
        <a 
          href={zaloUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex flex-col items-center justify-center bg-[#0068ff] text-white hover:bg-[#0056d6] active:bg-[#004bb8] transition-colors duration-150 border-x border-white/10"
        >
          <span className="font-black text-base tracking-tighter mb-0.5">Zalo</span>
          <span className="text-[11px] font-medium tracking-wide">Chat Zalo</span>
        </a>

        {/* Cột 3: Nút Ký Gửi Nhanh (Kích hoạt Popup Form của anh) */}
        <button 
          onClick={() => setIsOpenKyGui(true)} 
          className="flex flex-col items-center justify-center bg-amber-500 text-slate-900 hover:bg-amber-600 active:bg-amber-700 transition-colors duration-150"
        >
          <FilePlus2 className="w-4 h-4 mb-1" />
          <span className="text-[11px] font-bold tracking-wide">Nhận tư vấn</span>
        </button>

      </div>

      {/* 2. NÚT LIÊN HỆ DẠNG TRÒN NỔI (Chỉ hiển thị khi xem trên Máy tính / Máy tính bảng) */}
      <div className="hidden md:flex fixed bottom-6 right-6 z-40 flex-col gap-3">
        {/* Nút Zalo Máy tính */}
        <a 
          href={zaloUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="w-14 h-14 rounded-full bg-[#0068ff] text-white flex items-center justify-center shadow-2xl font-bold text-sm hover:scale-110 active:scale-95 transition-transform group relative"
        >
          Zalo
          <span className="absolute right-16 bg-slate-900 text-white text-xs px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-md">
            Nhắn Zalo ngay
          </span>
        </a>
        
        {/* Nút Gọi Ngay Máy tính */}
        <a 
          href={`tel:${phoneNumber}`} 
          className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-transform group relative"
        >
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-600 opacity-25"></span>
          <Phone className="w-5 h-5 relative z-10 fill-white/10" />
          <span className="absolute right-16 bg-slate-900 text-white text-xs px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-md">
            Gọi: {phoneNumber}
          </span>
        </a>
      </div>

      {/* Popup Form ký gửi tự động của anh Huy */}
      <Modals type="kygui" isOpen={isOpenKyGui} onClose={() => setIsOpenKyGui(false)} />
    </>
  );
}
