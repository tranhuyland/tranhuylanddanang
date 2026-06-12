'use client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Image from 'next/image';

export default function PropertyGallery({ images }: { images: string[] }) {
  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden group">
      <Swiper
        modules={[Navigation, Pagination]}
        navigation={true}
        pagination={{ clickable: true }}
        className="w-full h-full"
      >
        {images.map((url, index) => (
          <SwiperSlide key={index}>
            <Image
              src={url}
              alt={`Ảnh sản phẩm ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 700px"
              priority={index === 0}
            />
          </SwiperSlide>
        ))}
      </Swiper>
      
      {/* CSS tùy chỉnh cho mũi tên và chấm tròn cam thương hiệu */}
      <style jsx global>{`
        .swiper-button-next, .swiper-button-prev { 
          color: white !important; 
          background: rgba(0,0,0,0.3); 
          padding: 20px; 
          border-radius: 50%; 
          width: 40px; 
          height: 40px; 
        }
        .swiper-pagination-bullet { background: white !important; opacity: 0.7; }
        .swiper-pagination-bullet-active { opacity: 1; background: #f97316 !important; }
      `}</style>
    </div>
  );
}
