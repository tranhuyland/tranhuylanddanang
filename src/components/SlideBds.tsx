'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore from 'swiper';
import { Navigation, Pagination, Thumbs, FreeMode, Zoom, Keyboard } from 'swiper/modules';

// Import CSS cốt lõi của Swiper
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';
import 'swiper/css/zoom';

interface PropertyGalleryProps {
  images: string[];
  alt: string;
  videoUrl?: string; // Link Video (YouTube)
  linkMap?: string;  // Link Google Maps (Nhúng)
}

export default function PropertyGallery({ images, alt, videoUrl, linkMap }: PropertyGalleryProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperCore | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Trạng thái quản lý 3 Tab: 'images' | 'video' | 'map'
  const [activeTab, setActiveTab] = useState<'images' | 'video' | 'map'>('images');

  // Hàm chuyển đổi link YouTube thường thành link Nhúng (Embed) để xem trực tiếp
  const getYoutubeEmbedUrl = (url?: string) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
  };

  // Nếu không có ảnh nào, hiển thị khung trống
  if (!images || images.length === 0) {
    return <div className="w-full aspect-[16/10] bg-gray-100 flex items-center justify-center rounded-lg text-gray-400">Không có hình ảnh</div>;
  }

  return (
    <>
      {/* --------------------------------------------------------- */}
      {/* KHU VỰC HIỂN THỊ CHÍNH (ẢNH / VIDEO / BẢN ĐỒ)               */}
      {/* --------------------------------------------------------- */}
      <div className="w-full property-gallery-normal flex flex-col gap-3">
        
        {/* Khung xem chính */}
        <div className="relative group rounded-xl overflow-hidden aspect-[16/10] border border-gray-200 bg-gray-100 shadow-sm">
          
          {/* TAB 1: HÌNH ẢNH */}
          {activeTab === 'images' && (
            <Swiper
              loop={true}
              spaceBetween={0}
              navigation={{ nextEl: '.main-next', prevEl: '.main-prev' }}
              pagination={{ clickable: true, el: '.main-pagination' }}
              thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
              modules={[Navigation, Pagination, Thumbs]}
              className="w-full h-full"
              onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            >
              {images.map((img, index) => (
                <SwiperSlide key={index} className="flex items-center justify-center">
                  <Image
                    src={img}
                    alt={`${alt} - Hình ${index + 1}`}
                    fill
                    className="object-contain cursor-zoom-in"
                    sizes="(max-width: 768px) 100vw, 800px"
                    priority={index === 0}
                    onClick={() => {
                      setActiveIndex(index);
                      setIsLightboxOpen(true);
                    }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          )}

          {/* TAB 2: VIDEO */}
          {activeTab === 'video' && videoUrl && (
            <iframe
              src={getYoutubeEmbedUrl(videoUrl)}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            ></iframe>
          )}

          {/* TAB 3: BẢN ĐỒ */}
          {activeTab === 'map' && linkMap && (
            <div className="w-full h-full">
              {linkMap.includes('<iframe') ? (
                // Nếu khách dán nguyên thẻ iframe của Google Maps
                <div className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full" dangerouslySetInnerHTML={{ __html: linkMap }} />
              ) : (
                // Nếu khách dán link nhúng
                <iframe src={linkMap} className="w-full h-full border-0" allowFullScreen loading="lazy"></iframe>
              )}
            </div>
          )}

          {/* Mũi tên điều hướng cho Hình Ảnh (Chỉ hiện khi ở tab ảnh) */}
          {activeTab === 'images' && (
            <>
              <button className="main-prev absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-white/70 hover:bg-white p-3 rounded-full text-gray-800 opacity-0 group-hover:opacity-100 transition shadow-md hidden md:block cursor-pointer">❮</button>
              <button className="main-next absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-white/70 hover:bg-white p-3 rounded-full text-gray-800 opacity-0 group-hover:opacity-100 transition shadow-md hidden md:block cursor-pointer">❯</button>
            </>
          )}
          
          {/* THANH 3 TAB NỔI BÊN TRONG KHUNG ẢNH */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex bg-black/60 backdrop-blur-md p-1.5 rounded-full shadow-lg overflow-hidden">
            <button 
              onClick={() => setActiveTab('images')}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${activeTab === 'images' ? 'bg-white text-orange-600 shadow-sm' : 'text-white hover:bg-white/20'}`}
            >
              🖼️ Hình ảnh
            </button>
            {videoUrl && (
              <button 
                onClick={() => setActiveTab('video')}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${activeTab === 'video' ? 'bg-white text-orange-600 shadow-sm' : 'text-white hover:bg-white/20'}`}
              >
                🎥 Video
              </button>
            )}
            {linkMap && (
              <button 
                onClick={() => setActiveTab('map')}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${activeTab === 'map' ? 'bg-white text-orange-600 shadow-sm' : 'text-white hover:bg-white/20'}`}
              >
                🗺️ Bản đồ
              </button>
            )}
          </div>
        </div>

        {/* Chấm tròn phân trang trên di động (Chỉ hiện khi ở tab ảnh) */}
        {activeTab === 'images' && <div className="main-pagination flex justify-center z-10 md:hidden pb-1"></div>}

        {/* MẢNG THUMBNAILS (Chỉ hiện khi ở tab ảnh) */}
        {activeTab === 'images' && (
          <div className="w-full">
            <Swiper
              onSwiper={setThumbsSwiper}
              loop={true}
              spaceBetween={10}
              slidesPerView={4}
              freeMode={true}
              watchSlidesProgress={true}
              modules={[FreeMode, Navigation, Thumbs]}
              breakpoints={{
                  640: { slidesPerView: 5 },
                  1024: { slidesPerView: 6 },
              }}
              className="thumbs-swiper"
            >
              {images.map((img, index) => (
                <SwiperSlide key={index} className="aspect-square rounded-md overflow-hidden cursor-pointer border-2 border-transparent hover:border-gray-300">
                  <Image src={img} alt={`${alt} thumb ${index + 1}`} fill className="object-cover" sizes="150px" />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>

      {/* --------------------------------------------------------- */}
      {/* POPUP PHÓNG TO ẢNH (LIGHTBOX) - Không thay đổi               */}
      {/* --------------------------------------------------------- */}
      {isLightboxOpen && activeTab === 'images' && (
        <div 
          className="fixed inset-0 bg-black/95 z-[9999] flex flex-col"
          onClick={(e) => { if (e.target === e.currentTarget) setIsLightboxOpen(false); }}
        >
          <div className="relative w-full h-20 flex items-center justify-center p-4">
            <button onClick={() => setIsLightboxOpen(false)} className="absolute right-6 top-4 text-white text-3xl font-light z-20 opacity-70 hover:opacity-100 transition">✕</button>
            <div className="flex items-center gap-6 z-20">
              <button className="lb-prev text-white text-3xl font-extralight bg-gray-800/30 p-2.5 rounded-lg hover:bg-gray-800/60 transition cursor-pointer">❮</button>
              <span className="text-white text-xl font-medium select-none min-w-[60px] text-center">{activeIndex + 1} / {images.length}</span>
              <button className="lb-next text-white text-3xl font-extralight bg-gray-800/30 p-2.5 rounded-lg hover:bg-gray-800/60 transition cursor-pointer">❯</button>
            </div>
          </div>

          <div className="flex-grow w-full relative overflow-hidden">
            <Swiper
              initialSlide={activeIndex}
              spaceBetween={0}
              navigation={{ nextEl: '.lb-next', prevEl: '.lb-prev' }}
              zoom={true}
              keyboard={{ enabled: true }}
              modules={[Navigation, Zoom, Keyboard]}
              className="w-full h-full lb-main-swiper"
              onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
            >
              {images.map((img, index) => (
                <SwiperSlide key={index} className="flex items-center justify-center overflow-hidden">
                  <div className="swiper-zoom-container h-full flex items-center justify-center">
                    <Image src={img} alt={`${alt} full ${index + 1}`} width={1600} height={1200} className="object-contain max-h-screen max-w-full" priority />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
          <p className="p-4 text-center text-white/50 text-xs select-none">Vuốt để chuyển ảnh hoặc dùng phím Esc để thoát</p>
        </div>
      )}
      
      <style jsx global>{`
        .property-gallery-normal .thumbs-swiper .swiper-slide-thumb-active { opacity: 1; border-color: #f97316 !important; }
        .property-gallery-normal .main-pagination .swiper-pagination-bullet { background: #9ca3af !important; opacity: 0.7; width: 8px; height: 8px; margin: 0 4px !important; }
        .property-gallery-normal .main-pagination .swiper-pagination-bullet-active { background: #f97316 !important; opacity: 1; width: 16px; border-radius: 4px; }
        .lb-main-swiper .swiper-button-next, .lb-main-swiper .swiper-button-prev, .lb-main-swiper .swiper-pagination { display: none !important; }
      `}</style>
    </>
  );
}
