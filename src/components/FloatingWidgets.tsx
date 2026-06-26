'use client';
import React from "react";
import { Phone } from "lucide-react";

export default function FloatingWidgets() {
  const phoneNumber = "0905778852";
  
  return (
    <>
      {/* 1. THANH TIỆN ÍCH DƯỚI ĐÁY MÀN HÌNH (Mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-[56px] bg-white border-t border-slate-200 grid grid-cols-2 z-50 shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">
        
        {/* Nút Gọi điện - Dùng Tailwind để ép hiệu ứng nhấn nút cực nhạy */}
        <a 
          href={`tel:${phoneNumber}`} 
          aria-label="Gọi điện thoại ngay cho Trần Huy Land"
          className="flex flex-col items-center justify-center bg-slate-900 text-white active:scale-95 active:bg-slate-950 transition-all duration-75 p-2"
        >
          <div className="relative flex items-center justify-center mb-0.5">
            <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-amber-400 opacity-40"></span>
            <Phone className="w-4 h-4 relative z-10 text-amber-400 fill-amber-400" />
          </div>
          <span className="text-[11px] font-medium tracking-wide">Gọi ngay</span>
        </a>

        {/* Nút Zalo - Tối ưu bằng cách bỏ bớt thuộc tính thừa */}
        <a 
          href={`https://zalo.me/${phoneNumber}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          aria-label="Nhắn tin Zalo ngay cho Trần Huy Land"
          className="flex flex-col items-center justify-center bg-[#0068ff] text-white active:scale-95 active:bg-[#0056d6] transition-all duration-75 border-l border-white/10 p-2"
        >
          <span className="font-black text-base tracking-tighter mb-0.5">Zalo</span>
          <span className="text-[11px] font-medium tracking-wide">Nhắn Zalo</span>
        </a>
      </div>

      {/* 2. NÚT TRÒN NỔI (PC) */}
      <div className="hidden md:flex fixed bottom-6 right-6 z-40 flex-col gap-4">
        {/* Nút Zalo PC */}
        <a 
          href={`https://zalo.me/${phoneNumber}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          aria-label="Nhắn tin Zalo qua Web"
          className="w-14 h-14 rounded-full bg-[#0068ff] text-white flex items-center justify-center shadow-2xl font-bold text-sm hover:scale-110 active:scale-95 transition-all group relative"
        >
          <span className="font-bold">Zalo</span>
          <span className="absolute right-16 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-md">
            Nhắn Zalo ngay
          </span>
        </a>
        
        {/* Nút Gọi PC */}
        <a 
          href={`tel:${phoneNumber}`} 
          aria-label="Gọi điện trực tiếp"
          className="w-14 h-14 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all group relative"
        >
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-25"></span>
          <Phone className="w-6 h-6 relative z-10 text-slate-900 fill-slate-900/10" />
          <span className="absolute right-16 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-md">
            Gọi: 0905.778.852
          </span>
        </a>
      </div>
    </>
  );
}
