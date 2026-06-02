'use client';
import React, { useState } from "react";
import { Phone, FilePlus2 } from "lucide-react";
import { Modals } from "./Modals";

export default function FloatingWidgets() {
  const [isOpenKyGui, setIsOpenKyGui] = useState(false);
  return (
    <>
      <div class="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 border-t border-slate-200 px-4 py-3 flex gap-3 z-30 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <button onClick={() => setIsOpenKyGui(true)} class="flex-[2] bg-amber-500 text-slate-900 font-extrabold rounded-xl py-3 px-4 flex items-center justify-center gap-1.5 text-sm"><FilePlus2 class="w-4 h-4" /> Ký Gửi Nhanh</button>
        <a href="tel:0931555551" class="flex-[1.5] bg-slate-900 text-white font-bold rounded-xl py-3 px-4 flex items-center justify-center gap-1.5 text-sm"><Phone class="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Gọi Ngay</a>
        <a href="https://zalo.me/0931555551" target="_blank" rel="noopener noreferrer" class="flex-[1.5] bg-[#0068ff] text-white font-bold rounded-xl py-3 px-4 flex items-center justify-center text-sm text-center">Zalo</a>
      </div>
      <div class="hidden md:flex fixed bottom-6 right-6 z-40 flex-col gap-3">
        <a href="https://zalo.me/0931555551" target="_blank" rel="noopener noreferrer" class="w-14 h-14 rounded-full bg-[#0068ff] text-white flex items-center justify-center shadow-2xl font-bold text-sm hover:scale-105 transition-transform">Zalo</a>
        <a href="tel:0931555551" class="w-14 h-14 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center shadow-2xl floating"><Phone class="w-5 h-5 text-slate-900 fill-slate-900/10" /></a>
      </div>
      <Modals type="kygui" isOpen={isOpenKyGui} onClose={() => setIsOpenKyGui(false)} />
    </>
  );}