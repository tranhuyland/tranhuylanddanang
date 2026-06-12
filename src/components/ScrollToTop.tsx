// src/components/ScrollToTop.tsx
'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react'; // Hoặc thư viện icon anh đang dùng

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      // Đã thay đổi p-3 thành p-2 để nút nhỏ hơn
      className="fixed right-4 bottom-24 p-2 bg-orange-500 text-white rounded-full shadow-lg transition-all hover:scale-110 active:scale-95 z-50"
      aria-label="Trở lên trên"
    >
      {/* Đã thay đổi size={24} thành size={20} */}
      <ArrowUp size={20} />
    </button>
  );
}
