"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";

export default function BackButton() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Chỉ hiện nút Back khi đã cuộn qua 200px
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 200);
    };
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <button
      onClick={() => router.back()}
      // 🌟 NÚT BACK CHUYỂN SANG GÓC TRÁI VÀ BỎ THUỘC TÍNH STYLE CŨ
      className={`fixed left-4 bottom-20 md:left-6 md:bottom-6 z-40 px-3 py-1.5 flex items-center gap-1 rounded-full bg-white border border-slate-200 text-slate-700 shadow-xl transition-all duration-300 hover:border-orange-500 hover:text-orange-600 active:scale-95 ${
        isVisible 
          ? "opacity-100 translate-y-0 pointer-events-auto" 
          : "opacity-0 translate-y-5 pointer-events-none"
      }`}
    >
      <ChevronLeft className="w-4 h-4" />
      <span className="text-[11px] font-bold uppercase tracking-wider">Quay về</span>
    </button>
  );
}
