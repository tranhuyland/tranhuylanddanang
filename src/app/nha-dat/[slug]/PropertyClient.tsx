"use client";

import PropertyGallery from "@/components/SlideBds";
import { MapPin, Calendar, ShieldCheck, Layers, Map, FileText, X, ZoomIn, ZoomOut, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import React, { useState, useEffect, useRef } from "react";
import { layUrlAnhChuan } from "@/lib/utils"; // <-- Import bùa chú tối ưu WebP

interface PropertyClientProps {
  item: any;
}

export default function PropertyClient({ item }: PropertyClientProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const touchStartDist = useRef(0);

  useEffect(() => {
    if (!isPopupOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isPopupOpen]);

  const anhGoc = item.anh || item.Anh || "";
  const danhSachAnh = anhGoc ? anhGoc.split(",").map((a: string) => a.trim()).filter((a: string) => a !== "" && a.startsWith("http")) : [];
  const anhSoDoGoc = item.anhSoDo || item.AnhSoDo || "";
  
  const tatCaAnhGallery = [...danhSachAnh];
  if (anhSoDoGoc && anhSoDoGoc.startsWith("http") && !tatCaAnhGallery.includes(anhSoDoGoc)) {
    tatCaAnhGallery.push(anhSoDoGoc);
  }

  const noiDungMoTa = item.mota || item.moTa || item.Mota || item.description || item.Description || "Thông tin đang được cập nhật...";

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.5, 1));
  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale === 1) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDist.current = dist;
    } else if (e.touches.length === 1 && scale > 1) {
      isDragging.current = true;
      dragStart.current = { x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDist.current > 0) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / touchStartDist.current;
      setScale(prev => Math.min(Math.max(prev * factor, 1), 4));
      touchStartDist.current = dist;
    } else if (e.touches.length === 1 && isDragging.current) {
      setPosition({
        x: e.touches[0].clientX - dragStart.current.x,
        y: e.touches[0].clientY - dragStart.current.y
      });
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden w-full max-w-full">
      <div className="relative aspect-[16/10] bg-slate-100 w-full max-w-full overflow-hidden group-gallery">
        {item.videoUrl ? (
          <div className="w-full h-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar max-w-full">
            <div className="w-full h-full flex-shrink-0 snap-start relative max-w-full">
              <iframe className="w-full h-full" src={item.videoUrl} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
            </div>
            <div className="w-full h-full flex-shrink-0 snap-start relative max-w-full">
              <PropertyGallery images={tatCaAnhGallery} alt={item.tieude || item.Title} />
            </div>
          </div>
        ) : (
          <PropertyGallery images={tatCaAnhGallery} alt={item.tieude || item.Title} />
        )}

        <div className="bg-slate-900/70 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-md absolute top-4 left-4 z-10 flex items-center gap-1 uppercase tracking-wider shadow pointer-events-none">
          <Layers className="w-3 h-3 text-amber-400" /> Media: {item.videoUrl ? '1 Video & ' : ''}{tatCaAnhGallery.length} Hình Ảnh
        </div>
      </div>

      <div className="p-6 sm:p-8 w-full max-w-full">
        <div className="flex items-center justify-between">
          <span className="bg-amber-500 text-slate-900 font-extrabold text-base px-3 py-1 rounded-xl shadow-sm">{item.gia || item.Gia}</span>
          <span className="text-xs text-slate-400 font-bold uppercase bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> {item.phapLy || item.PhapLy || 'Sổ hồng riêng'}
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-4 leading-snug">{item.tieude || item.Tieude}</h1>
        
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-400 text-xs mt-2 border-b border-slate-100 pb-4 font-semibold w-full">
          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-amber-500" />{item.khuVucFull || item.khuvucFull}</span>
          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Ngày đăng: {item.ngayDang || item.NgayDang}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 my-6 p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-600 text-center font-semibold w-full">
          <div>
            <div className="text-slate-400 text-[11px] font-bold uppercase mb-0.5 tracking-wider">Diện tích</div>
            <strong className="text-slate-900 text-sm sm:text-base">{item.dienTich || item.DienTich || '---'}</strong>
          </div>
          <div>
            <div className="text-slate-400 text-[11px] font-bold uppercase mb-0.5 tracking-wider">Cấu trúc</div>
            <strong className="text-slate-900 text-sm sm:text-base">{item.phongNgu || item.PhongNgu || 'Đất ở'}</strong>
          </div>
          <div>
            <div className="text-slate-400 text-[11px] font-bold uppercase mb-0.5 tracking-wider">Hướng</div>
            <strong className="text-slate-900 text-sm sm:text-base">{item.huong || item.Huong || 'Chưa rõ'}</strong>
          </div>
        </div>

        {((item.linkMap || item.LinkMap) || !!anhSoDoGoc) && (
          <div className={`grid gap-3 mb-6 w-full ${(item.linkMap || item.LinkMap) && !!anhSoDoGoc ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {(item.linkMap || item.LinkMap) && (
              <a 
                href={item.linkMap || item.LinkMap} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 rounded-xl py-2.5 px-3 text-center text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Map className="w-4 h-4" /> Vị Trí Bản Đồ
              </a>
            )}
            {!!anhSoDoGoc && (
              <button 
                onClick={() => setIsPopupOpen(true)} 
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 rounded-xl py-2.5 px-3 text-center text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer w-full"
              >
                <FileText className="w-4 h-4" /> Sổ Hồng Bản Vẽ
              </button>
            )}
          </div>
        )}

        <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-3">Mô tả chi tiết:</h4>
        
        <div className="text-slate-700 text-base sm:text-lg leading-relaxed text-justify w-full prose max-w-none">
          <ReactMarkdown
            components={{
              h1: ({node, ...props}) => <h1 className="text-xl sm:text-2xl font-black text-amber-600 mt-5 mb-2 border-b border-amber-100 pb-1" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 mt-4 mb-1.5" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-base sm:text-md font-bold text-slate-800 mt-3 mb-1" {...props} />,
              p: ({node, ...props}) => <p className="mb-3.5 whitespace-pre-wrap text-slate-600 font-medium" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3.5 space-y-1" {...props} />,
              li: ({node, ...props}) => <li className="text-slate-600 font-medium" {...props} />,
              strong: ({node, ...props}) => <strong className="font-black text-slate-900" {...props} />,
            }}
          >
            {noiDungMoTa}
          </ReactMarkdown>
        </div>
      </div>

      {isPopupOpen && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-md z-[99999] flex flex-col items-center justify-center animate-fade-in touch-none select-none"
          onClick={() => setIsPopupOpen(false)}
        >
          <div className="absolute top-4 left-4 z-50 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-white/10 p-1.5 rounded-xl">
            <button onClick={(e) => { e.stopPropagation(); handleZoomIn(); }} className="p-2 text-white hover:text-amber-400 bg-white/5 hover:bg-white/10 rounded-lg transition-all cursor-pointer" title="Phóng to">
              <ZoomIn className="w-5 h-5" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleZoomOut(); }} className="p-2 text-white hover:text-amber-400 bg-white/5 hover:bg-white/10 rounded-lg transition-all cursor-pointer" title="Thu nhỏ">
              <ZoomOut className="w-5 h-5" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleResetZoom(); }} className="p-2 text-white hover:text-amber-400 bg-white/5 hover:bg-white/10 rounded-lg transition-all cursor-pointer" title="Đặt lại kích thước gốc">
              <RefreshCw className="w-4 h-4" />
            </button>
            <span className="text-white text-[11px] font-bold px-2 tracking-wide bg-white/10 rounded-md py-1">Zoom: {Math.round(scale * 100)}%</span>
          </div>

          <button 
            onClick={(e) => { e.stopPropagation(); setIsPopupOpen(false); }}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2.5 transition-all z-50 cursor-pointer border border-white/10 shadow-lg"
          >
            <X className="w-6 h-6" />
          </button>

          <div 
            className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()} 
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={() => { isDragging.current = false; }}
            onMouseLeave={() => { isDragging.current = false; }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => { isDragging.current = false; touchStartDist.current = 0; }}
          >
            <img 
              src={layUrlAnhChuan(anhSoDoGoc)} /* 🔥 Tích hợp WebP cho ảnh sổ đỏ */
              alt="Sổ hồng bản vẽ chi tiết" 
              draggable={false}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transition: isDragging.current ? "none" : "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              className="max-w-[95vw] max-h-[80vh] object-contain rounded-lg shadow-2xl origin-center pointer-events-auto select-none"
            />
          </div>

          {scale === 1 && (
            <div className="absolute bottom-6 text-white/50 text-xs font-medium bg-black/40 px-4 py-1.5 rounded-full pointer-events-none tracking-wider uppercase text-center">
              Dùng 2 ngón tay hoặc bấm nút để phóng to bản vẽ
            </div>
          )}
        </div>
      )}
    </div>
  );
}
