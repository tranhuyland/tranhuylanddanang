'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react'; 

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
      // 🌟 NÚT TRỞ LÊN TRÊN ĐÃ ĐƯỢC ĐẨY LÊN CAO (Nằm trên nút AI Chatbot)
      className="fixed right-4 bottom-[144px] md:right-6 md:bottom-[160px] p-2 bg-orange-500 text-white rounded-full shadow-lg transition-all hover:scale-110 active:scale-95 z-40"
      aria-label="Trở lên trên"
    >
      <ArrowUp size={20} />
    </button>
  );
}
