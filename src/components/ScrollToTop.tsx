"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Khi khách cuộn xuống quá 400px (khoảng 1 màn hình điện thoại) thì nút mới hiện ra
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
      // 🌟 CẬP NHẬT GIAO DIỆN: Chuyển sang hình viên thuốc (pill), thêm flex để căn chỉnh icon và chữ
      className={`fixed right-6 z-50 px-4 py-2.5 flex items-center gap-1.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-xl transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 cursor-pointer ${
        isVisible 
          ? "opacity-100 translate-y-0 pointer-events-auto" 
          : "opacity-0 translate-y-5 pointer-events-none"
      }`}
      // 💡 Đặt cách đáy 95px để né thanh 2 nút Gọi/Zalo cố định dưới đáy màn hình điện thoại
      style={{ bottom: "95px" }}
      aria-label="Cuộn lên đầu trang"
    >
      {/* Icon mũi tên nhỏ hơn một chút để cân bằng với chữ */}
      <ChevronUp className="w-4 h-4 stroke-[3]" />
      
      {/* 🌟 Thêm chữ "nhỏ nhỏ" theo yêu cầu của anh Huy */}
      <span className="text-[11px] font-bold leading-none whitespace-nowrap uppercase tracking-wider">
        trở lên trên
      </span>
    </button>
  );
}
