'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Zoom, Keyboard } from 'swiper/modules';

// Import CSS của Swiper
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/zoom';

// Định nghĩa dữ liệu đầu vào là 1 mảng các link ảnh
interface PropertyGalleryProps {
  images: string[]; // Ví dụ: ["link_anh_1.jpg", "link_anh_2.jpg"]
  alt: string;     // Tiêu đề bất động sản để làm ALT ảnh
}

export default function PropertyGallery({ images, alt }: PropertyGalleryProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [initialSlide, setInitialSlide] = useState(0);

  // Nếu không có ảnh hoặc mảng ảnh trống, không hiển thị gì
  if (!images || images.length === 0) return null;

  // Xử lý khi người dùng nhấn vào ảnh ở chế độ bình thường để mở Popup
  const openLightbox = (index: number) => {
    setInitialSlide(index); // Đặt ảnh được nhấn làm ảnh đầu tiên trong Slider Popup
    setIsLightboxOpen(true);
  };

  // Hàm hiển thị một Slider (sử dụng chung cho cả 2 chế độ)
  const renderSwiper = (isLightbox: boolean) => (
    <Swiper
      modules={[Navigation, Pagination, Zoom, Keyboard]} // Các tính năng hỗ trợ
      spaceBetween={isLightbox ? 0 : 10} // Khoảng cách giữa các ảnh
      slidesPerView={1}                   // Hiển thị 1 ảnh mỗi lần
      navigation={{
        nextEl: '.swiper-button-next-custom',
        prevEl: '.swiper-button-prev-custom',
      }}                                 // Nút điều hướng custom
      pagination={{ clickable: true, type: isLightbox ? 'fraction' : 'bullets' }} // Phân trang
      zoom={isLightbox}                  // Chỉ bật tính năng Zoom (pinch/double tap) trong Popup
      keyboard={{ enabled: true }}       // Hỗ trợ dùng phím mũi tên
      initialSlide={initialSlide}        // Ảnh bắt đầu
      className={`h-full w-full ${isLightbox ? '' : 'rounded-lg overflow-hidden'}`}
    >
      {images.map((src, index) => (
        <SwiperSlide key={index} className={isLightbox ? 'overflow-auto' : ''}>
          {isLightbox ? (
            // Nội dung bên trong Slider Popup: Có thêm class zoom-container
            <div className="swiper-zoom-container flex items-center justify-center h-full w-full">
              <div className="relative w-full h-full max-w-7xl max-h-[90vh]">
                <Image
                  src={src}
                  alt={`${alt} - Hình ${index + 1}`}
                  fill
                  sizes="100vw"
                  className="object-contain" // Hiển thị full ảnh, không cắt
                  priority={index === 0}    // Ưu tiên tải ảnh đầu tiên
                />
              </div>
            </div>
          ) : (
            // Nội dung bên trong Slider bình thường: Hiển thị full khung
            <div 
              className="relative w-full h-full aspect-[16/9] cursor-zoom-in group"
              onClick={() => openLightbox(index)} // Nhấn vào để mở Popup đúng ảnh này
            >
              <Image
                src={src}
                alt={`${alt} - Hình ${index + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          )}
        </SwiperSlide>
      ))}

      {/* CUSTOME NÚT ĐIỀU HƯỚNG (Đẹp hơn nút mặc định) */}
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
      {/* 1. HIỂN THỊ SLIDER TRÊN TRANG (CHẾ ĐỘ BÌNH THƯỜNG) */}
      <div className="property-gallery-normal w-full relative">
        {renderSwiper(false)}
      </div>

      {/* 2. POPUP LIGHTBOX KHI PHÓNG TO (HIỂN THỊ TRÊN CÙNG) */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex flex-col bg-black/95 animate-fade-in backdrop-blur-sm"
          // Chỉ đóng khi nhấn vào vùng nền đen, không đóng khi tương tác Slider
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsLightboxOpen(false);
          }}
        >
          {/* Thanh tiêu đề Popup (Có nút đóng) */}
          <div className="flex items-center justify-between p-4 text-white">
            <p className="text-sm font-medium line-clamp-1">{alt}</p>
            <button 
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20 text-2xl"
              onClick={() => setIsLightboxOpen(false)}
            >
              ✕
            </button>
          </div>

          {/* Slider chính bên trong Popup */}
          <div className="flex-grow property-gallery-lightbox">
            {renderSwiper(true)}
          </div>
          
          {/* Gợi ý nhỏ phía dưới */}
          <p className="p-4 text-center text-white/60 text-xs select-none">
            Mẹo: Có thể dùng phím mũi tên hoặc pinch để Zoom ảnh
          </p>
        </div>
      )}
    </>
  );
}
