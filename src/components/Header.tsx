'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Search, SlidersHorizontal, Menu, X, Home, PlusCircle, Phone } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Tính năng bật/tắt Menu

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-[55] bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-300">
        
        {/* 1. KHU VỰC LOGO (Tự thu gọn khi cuộn trang) */}
        <div className={`flex items-center justify-center overflow-hidden transition-all duration-300 ease-in-out ${isScrolled ? 'h-0 opacity-0' : 'h-14 opacity-100'}`}>
          <Link href="/" className="relative h-10 w-40 mt-2 block">
            <Image src="/icon.png" alt="Trần Huy Land" fill className="object-contain" priority />
          </Link>
        </div>

        {/* 2. KHU VỰC CÔNG CỤ (Luôn bám dính) */}
        <div className="flex items-center gap-1.5 px-3 py-2.5">
          {/* Nút Back */}
          <button onClick={() => router.back()} className="p-2 text-slate-600 hover:bg-slate-100 active:bg-slate-200 rounded-full transition-colors active:scale-95" aria-label="Quay về">
            <ChevronLeft size={24} />
          </button>

          {/* Ô Tìm Kiếm (Gõ là lọc danh sách bên dưới) */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-slate-400" />
            </div>
            <input
              type="text"
              onChange={(e) => window.dispatchEvent(new CustomEvent('searchBds', { detail: e.target.value }))}
              placeholder="Tìm khu vực, dự án..."
              className="w-full bg-slate-100 text-[13px] sm:text-sm text-slate-700 rounded-full py-2 pl-9 pr-3 outline-none focus:ring-2 focus:ring-orange-500/50 transition-all focus:bg-white border border-transparent focus:border-orange-200"
            />
          </div>

          {/* Nút Bộ Lọc (Bấm là mở Drawer bộ lọc ở file khác) */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('openFilterDrawer'))}
            className="p-2 bg-slate-100 text-slate-700 hover:text-orange-600 hover:bg-orange-50 active:bg-orange-100 rounded-full transition-colors active:scale-95"
            aria-label="Bộ lọc"
          >
            <SlidersHorizontal size={18} />
          </button>

          {/* Nút Menu Hamburger */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 bg-slate-100 text-slate-700 hover:text-orange-600 hover:bg-orange-50 active:bg-orange-100 rounded-full transition-colors active:scale-95"
            aria-label="Menu"
          >
            <Menu size={18} />
          </button>
        </div>
      </header>

      {/* 3. MENU BÊN PHẢI (Trượt ra khi bấm Hamburger) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          {/* Lớp kính mờ làm tối màn hình nền */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Bảng Menu điều hướng */}
          <div className="relative w-64 max-w-[80%] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header Menu */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <span className="font-extrabold text-slate-800 text-lg">Điều hướng</span>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 text-slate-400 hover:text-red-500 rounded-full bg-slate-50 active:scale-90 transition-transform">
                <X size={20} />
              </button>
            </div>
            
            {/* Danh sách Link */}
            <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-2 px-3">
              <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-orange-50 hover:text-orange-600 rounded-2xl font-bold transition-colors">
                <Home size={18} className="text-orange-500" /> Trang chủ
              </Link>
              
              <Link href="/dang-tin" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-orange-50 hover:text-orange-600 rounded-2xl font-bold transition-colors">
                <PlusCircle size={18} className="text-orange-500" /> Úp sản phẩm mới
              </Link>
              
              <div className="border-t border-slate-100 my-2"></div>
              
              {/* 🚨 Thay số điện thoại của anh vào đây nhé */}
              <a href="tel:0931555551" className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-orange-50 hover:text-orange-600 rounded-2xl font-bold transition-colors">
                <Phone size={18} className="text-orange-500" /> Gọi Hotline hỗ trợ
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
