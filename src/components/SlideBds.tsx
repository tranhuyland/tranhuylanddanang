'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Zoom, Keyboard } from 'swiper/modules';

// Import CSS của Swiper
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/zoom';

interface PropertyGalleryProps {
  images: string[];
  alt: string;
}

export default function PropertyGallery({ images, alt }: PropertyGalleryProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [initialSlide, setInitialSlide] = useState(0);

  // XỬ LÝ SỰ KIỆN NÚT BACK / VUỐT TRÁI ĐỂ BACK TRÊN ĐIỆN THOẠI
  useEffect(() => {
    const handlePopState = () => {
      // Nếu Popup đang mở mà người dùng vuốt trái để Back, chỉ đóng Popup chứ không thoát trang
      if (isLightboxOpen) {
        setIsLightboxOpen(false);
      }
    };

    if (isLightboxOpen) {
      // Khi mở Popup, đẩy một trạng thái ảo vào lịch sử trình duyệt (#lightbox)
      window.history.pushState({ lightbox: true }, '');
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isLightboxOpen]);

  // Hàm đóng Popup chủ động (khi nhấn dấu X hoặc nhấn vùng nền đen)
  const closeLightbox = () => {
    if (isLightboxOpen) {
      setIsLightboxOpen(false);
      // Nếu người dùng chủ động đóng bằng nút X, xóa trạng thái ảo để tránh bị lệch nút Back của trình duyệt
      if (window.history.state?.lightbox) {
        window.history.back();
      }
    }
  };

  if (!images || images.length === 0) return null;

  const openLightbox = (index: number) => {
    setInitialSlide(index);
    setIsLightboxOpen(true);
  };

  const renderSwiper = (isLightbox: boolean) => (
    <Swiper
      modules={[Navigation, Pagination, Zoom, Keyboard]}
      spaceBetween={isLightbox ? 0 : 10}
      slidesPerView={1}
      navigation={{
        nextEl: '.swiper-button-next-custom',
        prevEl: '.swiper-button-prev-custom',
      }}
      pagination={{ clickable: true, type: isLightbox ? 'fraction' : 'bullets' }}
      zoom={isLightbox}
      keyboard={{ enabled: true }}
      initialSlide={initialSlide}
      className={`h-full w-full max-w-full ${isLightbox ? '' : 'rounded-lg overflow-hidden'}`}
    >
      {images.map((src, index) => (
        <SwiperSlide key={index} className={isLightbox ? 'overflow-auto' : ''}>
          {isLightbox ? (
            <div className="swiper-zoom-container flex items-center justify-center h-full w-full">
              <div className="relative w-full h-full max-w-7xl max-h-[90vh]">
                <Image
                  src={src}
                  alt={`${alt} - Hình ${index + 1}`}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  priority={index === 0}
                />
              </div>
            </div>
          ) : (
            <div 
              className="relative w-full h-full cursor-zoom-in group"
              style={{ minHeight: "100%" }}
              onClick={() => openLightbox(index)}
            >
              <Image
                src={src}
                alt={`${alt} - Hình ${index + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                priority={index === 0}
              />
            </div>
          )}
        </SwiperSlide>
      ))}

      <button className="swiper-button-prev-custom absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/30 text-white shadow-md transition hover:bg-white/50 disabled:opacity-0">
        ❮
      </button>
      <button className="swiper-button-next-custom absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/30 text-white shadow-md transition hover:bg-white/50 disabled:opacity-0">
        ❯
      </button>
    </Swiper>
  );

  return (
    <>
      <div className="property-gallery-normal w-full h-full relative">
        {renderSwiper(false)}
      </div>

      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex flex-col bg-black/95 animate-fade-in backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLightbox();
          }}
        >
          {/* Thanh tiêu đề Popup */}
          <div className="flex items-center justify-between p-4 text-white">
            <p className="text-sm font-medium line-clamp-1">{alt}</p>
            <button 
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20 text-2xl"
              onClick={closeLightbox}
            >
              ✕
            </button>
          </div>

          {/* Slider chính bên trong Popup */}
          <div className="flex-grow property-gallery-lightbox">
            {renderSwiper(true)}
          </div>
          
          <p className="p-4 text-center text-white/60 text-xs select-none">
            Mẹo: Có thể vuốt trái hoặc bấm Back để thoát chế độ phóng to
          </p>
        </div>
      )}
    </>
  );
}
