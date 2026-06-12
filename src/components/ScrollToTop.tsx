"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Khi khách cuộn xuống quá 400px thì nút mới bắt đầu hiện ra
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Hiệu ứng trượt mượt mà lên đỉnh
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed right-6 z-50 p-3 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-xl transition-all duration-300 ease-in-out hover:scale-110 active:scale-95 cursor-pointer ${
        isVisible 
          ? "opacity-100 translate-y-0 pointer-events-auto" 
          : "opacity-0 translate-y-5 pointer-events-none"
      }`}
      // 💡 Đặt cách đáy 95px để né thanh 2 nút Gọi/Zalo cố định dưới đáy màn hình điện thoại
      style={{ bottom: "95px" }}
      aria-label="Cuộn lên đầu trang"
    >
      <ChevronUp className="w-6 h-6 stroke-[3]" />
    </button>
  );
}
