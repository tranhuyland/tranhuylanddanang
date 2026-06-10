'use client';
import React from "react";
import { Phone } from "lucide-react";

export default function FloatingWidgets() {
  const phoneNumber = "0905778852";
  
  return (
    <>
      {/* 1. THANH TIỆN ÍCH DƯỚI ĐÁY MÀN HÌNH - TINH GỌN 2 NÚT (Chỉ hiện trên Điện thoại) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-[56px] bg-white border-t border-slate-200 grid grid-cols-2 z-50 shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">
        
        {/* Nút 1: Gọi điện ngay (Chiếm 50% màn hình, màu đen sang trọng phối icon vàng) */}
        <a 
          href={`tel:${phoneNumber}`} 
          className="flex flex-col items-center justify-center bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 transition-colors duration-150"
        >
          <div className="relative flex items-center justify-center mb-0.5">
            {/* Sóng rung mini */}
            <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-amber-400 opacity-40"></span>
            <Phone className="w-4 h-4 relative z-10 text-amber-400 fill-amber-400" />
          </div>
          <span className="text-[11px] font-medium tracking-wide">Gọi điện ngay</span>
        </a>

        {/* Nút 2: Nhắn tin Zalo (Chiếm 50% màn hình, màu Zalo chuẩn thương hiệu) */}
        <a 
          href={`https://zalo.me/${phoneNumber}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex flex-col items-center justify-center bg-[#0068ff] text-white hover:bg-[#0056d6] active:bg-[#004bb8] transition-colors duration-150 border-l border-white/10"
        >
          <span className="font-black text-base tracking-tighter mb-0.5">Zalo</span>
          <span className="text-[11px] font-medium tracking-wide">Nhắn Zalo ngay</span>
        </a>

      </div>

      {/* 2. NÚT TRÒN NỔI TIỆN ÍCH (Giữ nguyên vẹn cho Máy tính / PC) */}
      <div className="hidden md:flex fixed bottom-6 right-6 z-40 flex-col gap-3">
        {/* Nút Zalo PC */}
        <a 
          href={`https://zalo.me/${phoneNumber}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="w-14 h-14 rounded-full bg-[#0068ff] text-white flex items-center justify-center shadow-2xl font-bold text-sm hover:scale-110 active:scale-95 transition-transform group relative"
        >
          Zalo
          <span className="absolute right-16 bg-slate-900 text-white text-xs px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-md">
            Nhắn Zalo ngay
          </span>
        </a>
        
        {/* Nút Gọi PC */}
        <a 
          href={`tel:${phoneNumber}`} 
          className="w-14 h-14 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-transform group relative"
        >
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-25"></span>
          <Phone className="w-5 h-5 relative z-10 text-slate-900 fill-slate-900/10" />
          <span className="absolute right-16 bg-slate-900 text-white text-xs px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-md">
            Gọi: 0905.778.852
          </span>
        </a>
      </div>
    </>
  );
}
