'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Search, SlidersHorizontal } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  // Lắng nghe sự kiện cuộn trang để ẩn/hiện Logo
  useEffect(() => {
    const handleScroll = () => {
      // Khi cuộn qua 40px, logo sẽ bắt đầu ẩn đi
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm transition-all duration-300">
      
      {/* 1. KHU VỰC LOGO (Tự động ẩn khi cuộn) */}
      <div
        className={`flex items-center justify-center overflow-hidden transition-all duration-300 ease-in-out ${
          isScrolled ? 'h-0 opacity-0' : 'h-14 opacity-100'
        }`}
      >
        <Link href="/" className="relative h-10 w-40 mt-2 block">
          {/* 🚨 LƯU Ý: Anh thay icon.png bằng tên file logo thật của anh nhé */}
          <Image
            src="/icon.png" 
            alt="Logo"
            fill
            className="object-contain"
            priority
          />
        </Link>
      </div>

      {/* 2. KHU VỰC CÔNG CỤ (Nút Back + Tìm kiếm + Bộ lọc) */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        
        {/* Nút Back */}
        <button
          onClick={() => router.back()}
          className="p-2 text-slate-600 hover:bg-slate-100 active:bg-slate-200 rounded-full transition-colors active:scale-95"
          aria-label="Quay về"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Ô Tìm kiếm */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm khu vực, đường, dự án..."
            className="w-full bg-slate-100 text-[13px] sm:text-sm text-slate-700 rounded-full py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-orange-500/50 transition-all border border-transparent focus:border-orange-200 focus:bg-white"
          />
        </div>

        {/* Nút Bộ lọc */}
        <button
          className="p-2.5 bg-slate-100 text-slate-700 hover:text-orange-600 hover:bg-orange-50 active:bg-orange-100 rounded-full transition-colors active:scale-95"
          aria-label="Bộ lọc"
          // onClick={() => Mở_Hàm_Bộ_Lọc_Của_Anh()} 
        >
          <SlidersHorizontal size={20} />
        </button>
      </div>
    </header>
  );
}
