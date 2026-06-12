'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Zoom, Keyboard } from 'swiper/modules';
import { layUrlAnhChuan } from "@/lib/utils";
import { PlayCircle, Image as ImageIcon, Map, X, ZoomIn, ZoomOut } from "lucide-react";

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/zoom';

interface PropertyGalleryProps {
  images: string[];
  alt: string;
  videoUrl?: string; 
  linkMap?: string;  
}

export default function SlideBds({ images, alt, videoUrl, linkMap }: PropertyGalleryProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'images' | 'video' | 'map'>('images');

  useEffect(() => {
    const handlePopState = () => setIsLightboxOpen(false);
    if (isLightboxOpen) {
      window.history.pushState({ lightbox: true }, '');
      window.addEventListener('popstate', handlePopState);
    }
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isLightboxOpen]);

  const closeLightbox = () => {
    if (isLightboxOpen) {
      setIsLightboxOpen(false);
      setTimeout(() => setActiveTab('images'), 300);
      if (window.history.state?.lightbox) window.history.back();
    }
  };

  const getYoutubeEmbedUrl = (url?: string) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
  };

  if (!images || images.length === 0) return null;

  return (
    <>
      {/* 1. GIAO DIỆN BÊN NGOÀI (ẢNH ĐƠN CHUẨN BATDONGSAN.COM) */}
      <div className="w-full aspect-[4/3] sm:aspect-[16/10] bg-gray-100 rounded-xl overflow-hidden relative border border-gray-200 group z-0">
        <Swiper
          modules={[Navigation, Pagination, Keyboard]}
          spaceBetween={0}
          slidesPerView={1}
          initialSlide={activeIndex}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          keyboard={{ enabled: true }}
          navigation={{ nextEl: '.nm-next', prevEl: '.nm-prev' }}
          pagination={{ type: 'fraction', el: '.nm-fraction' }}
          className="w-full h-full"
        >
          {images.map((img, idx) => (
            <SwiperSlide key={idx} className="flex items-center justify-center overflow-hidden">
              <div 
                className="w-full h-full relative cursor-zoom-in" 
                onClick={() => {
                  setActiveIndex(idx);
                  setActiveTab('images');
                  setIsLightboxOpen(true);
                }}
              >
                <Image src={layUrlAnhChuan(img)} alt={`${alt} - Hình ${idx + 1}`} fill sizes="(max-width: 768px) 100vw, 800px" className="object-cover" priority={idx === 0} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Đã xóa hidden, hiển thị mũi tên ở mọi thiết bị */}
        <button className="nm-prev absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white text-gray-800 rounded-md flex items-center justify-center shadow-lg hover:bg-gray-50 transition active:scale-95 disabled:opacity-0 cursor-pointer">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <button className="nm-next absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white text-gray-800 rounded-md flex items-center justify-center shadow-lg hover:bg-gray-50 transition active:scale-95 disabled:opacity-0 cursor-pointer">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>

        {/* Cục số trang góc phải dưới */}
        <div className="nm-fraction absolute bottom-3 right-3 z-10 flex items-center justify-center pointer-events-none"></div>
      </div>

      {/* 2. POPUP BÊN TRONG KHI PHÓNG TO (3 TAB) */}
      {isLightboxOpen && (
        <div className="fixed inset-0 bg-black z-[99999] flex flex-col animate-fade-in">
          <div className="relative w-full h-16 sm:h-20 flex items-center justify-between px-4 z-50 bg-black">
            <div className="w-16 sm:w-24 text-white text-sm sm:text-base font-medium">
              {activeTab === 'images' ? `${activeIndex + 1} / ${images.length}` : ''}
            </div>

            <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
              {videoUrl && (
                <button onClick={() => setActiveTab('video')} className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full border text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${activeTab === 'video' ? 'bg-white text-black border-white font-semibold' : 'border-white/40 text-white hover:bg-white/10'}`}>
                  <PlayCircle className="w-4 h-4" /> Video
                </button>
              )}
              <button onClick={() => setActiveTab('images')} className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full border text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${activeTab === 'images' ? 'bg-white text-black border-white font-semibold' : 'border-white/40 text-white hover:bg-white/10'}`}>
                <ImageIcon className="w-4 h-4" /> Hình ảnh
              </button>
              {linkMap && (
                <button onClick={() => setActiveTab('map')} className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full border text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${activeTab === 'map' ? 'bg-white text-black border-white font-semibold' : 'border-white/40 text-white hover:bg-white/10'}`}>
                  <Map className="w-4 h-4" /> Bản đồ
                </button>
              )}
            </div>

            <div className="flex items-center justify-end w-16 sm:w-24 gap-1 sm:gap-2">
              {activeTab === 'images' && (
                <>
                  <button className="hidden sm:flex text-white p-2 hover:bg-white/20 rounded-full transition cursor-pointer lb-zoom-out"><ZoomOut className="w-5 h-5" /></button>
                  <button className="hidden sm:flex text-white p-2 hover:bg-white/20 rounded-full transition cursor-pointer lb-zoom-in"><ZoomIn className="w-5 h-5" /></button>
                </>
              )}
              <button onClick={closeLightbox} className="text-white p-2 hover:bg-white/20 rounded-full transition cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="flex-1 w-full relative bg-black flex items-center justify-center overflow-hidden">
            {activeTab === 'images' && (
              <Swiper
                modules={[Navigation, Zoom, Keyboard]}
                spaceBetween={20}
                slidesPerView={1}
                initialSlide={activeIndex}
                onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                zoom={true}
                keyboard={{ enabled: true }}
                navigation={{ nextEl: '.lb-next', prevEl: '.lb-prev' }}
                className="w-full h-full lb-main-swiper"
              >
                {images.map((img, idx) => (
                  <SwiperSlide key={idx} className="flex items-center justify-center overflow-hidden">
                    <div className="swiper-zoom-container h-full w-full flex items-center justify-center">
                      <Image src={layUrlAnhChuan(img)} alt={`${alt} - Full ${idx + 1}`} width={1600} height={1200} className="object-contain max-h-[85vh] max-w-full" priority />
                    </div>
                  </SwiperSlide>
                ))}
                
                <button className="lb-prev absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center justify-center transition active:scale-95 disabled:opacity-0 cursor-pointer">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <button className="lb-next absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center justify-center transition active:scale-95 disabled:opacity-0 cursor-pointer">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              </Swiper>
            )}

            {activeTab === 'video' && videoUrl && (
              <div className="w-full h-[30vh] sm:h-[80vh] max-w-5xl mx-auto px-4">
                <iframe src={getYoutubeEmbedUrl(videoUrl)} className="w-full h-full rounded-lg" allowFullScreen></iframe>
              </div>
            )}

            {activeTab === 'map' && linkMap && (
              <div className="w-full h-[50vh] sm:h-[80vh] max-w-5xl mx-auto px-4">
                {linkMap.includes('<iframe') ? (
                  <div className="w-full h-full rounded-lg overflow-hidden [&>iframe]:w-full [&>iframe]:h-full" dangerouslySetInnerHTML={{ __html: linkMap }} />
                ) : (
                  <iframe src={linkMap} className="w-full h-full border-0 rounded-lg bg-white" allowFullScreen loading="lazy"></iframe>
                )}
              </div>
            )}
          </div>

          <div className="w-full h-16 flex items-center justify-center bg-black px-4">
             <p className="text-white/80 text-sm sm:text-base font-medium truncate max-w-2xl text-center">{alt}</p>
          </div>
        </div>
      )}

      {/* ÉP CSS TOÀN CỤC CHO CỤC ĐẾM SỐ ĐỂ LUÔN NỔI BẬT */}
      <style jsx global>{`
        .nm-fraction.swiper-pagination-fraction {
          width: auto !important;
          left: auto !important;
          background-color: rgba(0, 0, 0, 0.75) !important;
          color: #ffffff !important;
          padding: 4px 12px !important;
          border-radius: 6px !important;
          font-size: 13px !important;
          letter-spacing: 2px !important;
        }
        .lb-main-swiper .swiper-pagination { display: none !important; }
      `}</style>
    </>
  );
}
