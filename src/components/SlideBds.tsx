'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Zoom, Keyboard } from 'swiper/modules';
import { layUrlAnhChuan } from "@/lib/utils"; // Tích hợp hàm tối ưu ảnh WebP tập trung

// Import CSS cốt lõi của Swiper
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/zoom';

interface PropertyGalleryProps {
  images: string[];
  alt: string; // 🔥 Đã thêm dòng này để sửa dứt điểm lỗi build trên Vercel
}

export default function PropertyGallery({ images, alt }: PropertyGalleryProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [initialSlide, setInitialSlide] = useState(0);

  // Xử lý sự kiện nút Back hoặc cử chỉ vuốt để đóng Popup trên điện thoại (chống thoát trang)
  useEffect(() => {
    const handlePopState = () => {
      if (isLightboxOpen) {
        setIsLightboxOpen(false);
      }
    };

    if (isLightboxOpen) {
      window.history.pushState({ lightbox: true }, '');
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isLightboxOpen]);

  // Hàm đóng Popup chủ động khi bấm nút X hoặc bấm ra vùng nền đen ngoài ảnh
  const closeLightbox = () => {
    if (isLightboxOpen) {
      setIsLightboxOpen(false);
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
        nextEl: isLightbox ? '.swiper-button-next-lightbox' : '.swiper-button-next-normal',
        prevEl: isLightbox ? '.swiper-button-prev-lightbox' : '.swiper-button-prev-normal',
      }}
      pagination={{ 
        clickable: true, 
        type: isLightbox ? 'fraction' : 'bullets' 
      }}
      zoom={isLightbox}
      keyboard={{ enabled: true }}
      initialSlide={initialSlide}
      className={`h-full w-full max-w-full relative ${isLightbox ? '' : 'rounded-2xl overflow-hidden'}`}
    >
      {images.map((src, index) => {
        // Áp dụng chuẩn hóa URL ảnh WebP tự động từ Cloudinary
        const optimizedSrc = layUrlAnhChuan(src);

        return (
          <SwiperSlide key={index} className={isLightbox ? 'overflow-auto' : ''}>
            {isLightbox ? (
              <div className="swiper-zoom-container flex items-center justify-center h-full w-full">
                <div className="relative w-full h-full max-w-7xl max-h-[90vh]">
                  <Image
                    src={optimizedSrc}
                    alt={`${alt} - Hình phóng to ${index + 1}`}
                    fill
                    sizes="100vw"
                    className="object-contain"
                    priority={index === 0}
                  />
                </div>
              </div>
            ) : (
              <div 
                className="relative w-full h-full cursor-zoom-in group/item aspect-[4/3]"
                style={{ minHeight: "100%" }}
                onClick={() => openLightbox(index)}
              >
                <Image
                  src={optimizedSrc}
                  alt={`${alt} - Hình ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover/item:scale-105"
                  priority={index === 0}
                />
                {/* Lớp phủ shadow mờ nhẹ ở đáy để làm nổi bật các chấm phân trang */}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent pointer-events-none z-0" />
              </div>
            )}
          </SwiperSlide>
        );
      })}

      {/* Hệ thống nút mũi tên điều hướng tùy biến kiểu dáng tràn viền hiện đại */}
      {!isLightbox ? (
        <>
          <button className="swiper-button-prev-normal absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-xs border border-white/10 shadow-md transition-all duration-300 hover:bg-orange-600 hover:scale-105 active:scale-95 disabled:opacity-0 cursor-pointer">
            ❮
          </button>
          <button className="swiper-button-next-normal absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-xs border border-white/10 shadow-md transition-all duration-300 hover:bg-orange-600 hover:scale-105 active:scale-95 disabled:opacity-0 cursor-pointer">
            ❯
          </button>
        </>
      ) : (
        <>
          <button className="swiper-button-prev-lightbox absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all text-xl cursor-pointer">
            ❮
          </button>
          <button className="swiper-button-next-lightbox absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all text-xl cursor-pointer">
            ❯
          </button>
        </>
      )}
    </Swiper>
  );

  return (
    <>
      {/* Khung chứa slider ngoài trang chi tiết */}
      <div className="property-gallery-normal w-full h-full relative aspect-[4/3]">
        {renderSwiper(false)}
      </div>

      {/* Giao diện đóng mở xem ảnh toàn màn hình khi click (Lightbox) */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex flex-col bg-black/95 animate-fade-in backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLightbox();
          }}
        >
          {/* Thanh Header Popup */}
          <div className="flex items-center justify-between p-4 text-white bg-gradient-to-b from-black/50 to-transparent">
            <p className="text-sm font-medium line-clamp-1 pr-4">{alt}</p>
            <button 
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20 text-2xl active:scale-95 cursor-pointer"
              onClick={closeLightbox}
            >
              ✕
            </button>
          </div>

          {/* Vùng hiển thị slider lớn bên trong Popup */}
          <div className="flex-grow property-gallery-lightbox overflow-hidden relative">
            {renderSwiper(true)}
          </div>
          
          <p className="p-4 text-center text-white/60 text-xs select-none">
            Mẹo: Bạn có thể vuốt lên/xuống hoặc bấm nút Back của điện thoại để đóng
          </p>
        </div>
      )}

      {/* CSS Nhúng Toàn Cục để tùy biến giao diện Bullet Swiper tinh tế */}
      <style jsx global>{`
        /* Custom kiểu dáng các chấm phân trang */
        .property-gallery-normal .swiper-pagination-bullets {
          bottom: 16px !important;
          z-index: 10 !important;
        }
        .property-gallery-normal .swiper-pagination-bullet {
          background: #ffffff !important;
          opacity: 0.6 !important;
          width: 7px !important;
          height: 7px !important;
          margin: 0 4px !important;
          transition: all 0.3s ease !important;
          box-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }
        /* Hiệu ứng thanh dài màu Cam khi chấm tròn được kích hoạt */
        .property-gallery-normal .swiper-pagination-bullet-active {
          opacity: 1 !important;
          background: #ea580c !important; /* Màu cam thương hiệu */
          width: 20px !important;
          border-radius: 4px !important;
        }
        /* Kiểu dáng hiển thị phân số trang bên trong ảnh phóng to */
        .property-gallery-lightbox .swiper-pagination-fraction {
          color: rgba(255, 255, 255, 0.8) !important;
          font-size: 14px !important;
          bottom: 20px !important;
          font-weight: 500;
          background: rgba(0,0,0,0.4);
          padding: 4px 12px;
          border-radius: 9999px;
          width: auto !important;
          left: 50% !important;
          transform: translateX(-50%);
        }
      `}</style>
    </>
  );
}
