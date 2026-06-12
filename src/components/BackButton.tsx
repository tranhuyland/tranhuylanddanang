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
      // 🌟 Đã thu nhỏ: px-4 py-2.5 thành px-3 py-1.5, và gap-1.5 thành gap-1
      className={`fixed right-6 z-40 px-3 py-1.5 flex items-center gap-1 rounded-full bg-white border border-slate-200 text-slate-700 shadow-xl transition-all duration-300 hover:border-orange-500 hover:text-orange-600 active:scale-95 ${
        isVisible 
          ? "opacity-100 translate-y-0 pointer-events-auto" 
          : "opacity-0 translate-y-5 pointer-events-none"
      }`}
      style={{ bottom: "150px" }} // Nằm trên nút ScrollToTop (95px + 55px)
    >
      {/* 🌟 Đã thu nhỏ icon: w-5 h-5 thành w-4 h-4 */}
      <ChevronLeft className="w-4 h-4" />
      <span className="text-[11px] font-bold uppercase tracking-wider">Quay về</span>
    </button>
  );
}
