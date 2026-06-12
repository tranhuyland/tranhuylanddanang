'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Search, SlidersHorizontal, Menu, X, Home, PlusCircle, Phone } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname(); 
  
  // 🔥 TRÍ TUỆ NHÂN TẠO: Nhận diện xem khách đang ở Trang chủ hay Trang chi tiết
  const isHomePage = pathname === '/'; 

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hàm phát sóng sự kiện khi gõ tìm kiếm
  const handleSearchChange = (val: string) => {
    setSearchValue(val);
    window.dispatchEvent(new CustomEvent('searchBds', { detail: val }));
  };

  // Nâng cấp 1: Hàm xóa nhanh tìm kiếm
  const handleClearSearch = () => {
    setSearchValue("");
    window.dispatchEvent(new CustomEvent('searchBds', { detail: "" }));
  };

  return (
    <>
      {/* 🪟 Nâng cấp 3: Nền kính mờ Glassmorphism (backdrop-blur) */}
      <header className="sticky top-0 z-[55] bg-white/85 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-300">
        
        {/* 1. KHU VỰC LOGO (Chỉ hiện ở trang chủ, cuộn xuống tự thu gọn) */}
        {isHomePage && (
          <div className={`flex items-center justify-center overflow-hidden transition-all duration-300 ease-in-out ${isScrolled ? 'h-0 opacity-0' : 'h-14 opacity-100'}`}>
            <Link href="/" className="relative h-15 w-60 mt-2 block">
              <Image src="/logo.png" alt="Trần Huy Land" fill className="object-contain" priority />
            </Link>
          </div>
        )}

        {/* 2. KHU VỰC CÔNG CỤ (Tự biến hình theo trang) */}
        <div className="flex items-center justify-between px-3 py-2.5 min-h-[56px] gap-2">
          
          {/* 🔄 NẾU LÀ TRANG CHI TIẾT SẢN PHẨM */}
          {!isHomePage ? (
            <>
              <button onClick={() => router.back()} className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-full active:scale-95 transition-all">
                <ChevronLeft size={24} />
              </button>
              <div className="flex-1 text-center font-extrabold text-slate-700 text-[17px] mr-10">
                Chi tiết sản phẩm
              </div>
            </>
          ) : (
            /* 🏠 NẾU LÀ TRANG CHỦ (Hiện bộ lọc và tìm kiếm) */
            <div className="flex items-center gap-2 w-full">
              
              {/* Ô Tìm Kiếm */}
              <form 
                onSubmit={(e) => { e.preventDefault(); (document.activeElement as HTMLElement)?.blur(); }} 
                className="flex-1 relative flex items-center"
              >
                <div className="absolute left-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Tìm khu vực, đường, dự án..."
                  className="w-full bg-slate-100/80 text-[13.5px] font-medium text-slate-700 rounded-full py-2.5 pl-9 pr-9 outline-none focus:ring-2 focus:ring-orange-500/50 transition-all focus:bg-white border border-transparent focus:border-orange-200"
                />
                {/* ❌ Nâng cấp 1: Nút X xóa nhanh tìm kiếm */}
                {searchValue && (
                  <button 
                    type="button" 
                    onClick={handleClearSearch}
                    className="absolute right-3 p-1 bg-slate-200 hover:bg-slate-300 rounded-full text-slate-500 transition-colors"
                  >
                    <X size={12} />
                  </button>
                )}
              </form>

              {/* Nút Bộ Lọc (md:hidden nghĩa là Máy tính tự ẩn đi vì máy tính đã có 4 ô to đùng rồi) */}
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('openFilterDrawer'))}
                className="p-2.5 md:hidden bg-slate-100/80 text-slate-700 hover:text-orange-600 hover:bg-orange-50 active:bg-orange-100 rounded-full transition-all active:scale-95 relative"
                aria-label="Bộ lọc"
              >
                <SlidersHorizontal size={18} />
                {/* 🔴 Nâng cấp 2: Chấm đỏ trang trí báo hiệu bộ lọc */}
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>
            </div>
          )}

          {/* 🍔 Nâng cấp 4: Nút Menu Hamburger (Luôn hiện ở góc phải màn hình) */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2.5 bg-slate-100/80 text-slate-700 hover:text-orange-600 hover:bg-orange-50 active:bg-orange-100 rounded-full transition-all active:scale-95 shrink-0"
            aria-label="Menu"
          >
            <Menu size={18} />
          </button>

        </div>
      </header>

      {/* KHU VỰC MENU TRƯỢT TỪ BÊN PHẢI VÀO */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          {/* Lớp kính mờ che bên ngoài */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsMenuOpen(false)} />
          
          <div className="relative w-64 max-w-[80%] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <span className="font-extrabold text-slate-800 text-lg">Điều hướng</span>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 text-slate-400 hover:text-red-500 rounded-full bg-slate-50 active:scale-90 transition-transform">
                <X size={20} />
              </button>
            </div>
            
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
