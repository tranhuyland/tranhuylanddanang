'use client';
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Modals } from "./Modals";

export default function Header() {
  const [isOpenKyGui, setIsOpenKyGui] = useState(false);
  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 glass border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative h-9 w-9 sm:h-11 sm:w-11">
              <Image src="https://i.postimg.cc/JhKg8VZ9/70554272-47DB-4D3A-A1AE-2782EFCAF00F.png" alt="Trần Huy Land" fill className="object-contain" />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">TRẦN HUY LAND</h1>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Giỏ Hàng Thật • Pháp Lý Minh Bạch</p>
            </div>
          </Link>
          <nav className="hidden lg:flex items-center gap-8 text-sm font-bold text-slate-600">
            <Link href="/" className="hover:text-slate-900 transition-all">Trang Chủ</Link>
            <a href="#listing-section" className="hover:text-slate-900 transition-all">Nhà Đất Đang Bán</a>
            <a href="#about-section" className="hover:text-slate-900 transition-all">Giới Thiệu</a>
            <a href="#blog-section" className="hover:text-slate-900 transition-all">Tin Tức Khảo Sát</a>
          </nav>
          <button onClick={() => setIsOpenKyGui(true)} className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold text-sm px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm">
            <PlusCircle className="w-4 h-4" /> Ký Gửi Nhanh
          </button>
        </div>
      </header>
      <Modals type="kygui" isOpen={isOpenKyGui} onClose={() => setIsOpenKyGui(false)} />
    </>
  );
}
