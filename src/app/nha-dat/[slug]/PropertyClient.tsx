"use client";

import PropertyGallery from "@/components/SlideBds";
import { MapPin, Calendar, ShieldCheck, Map, FileText, X, ZoomIn, ZoomOut, RefreshCw, BedDouble, Bath, Compass, Heart, Share2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { layUrlAnhChuan } from "@/lib/utils";
import { tuDongGaiLinkMaTran } from "@/lib/matrixLinker";

interface PropertyClientProps {
  item: any;
}

// ==========================================
// 🛠️ HÀM TIỆN ÍCH
// ==========================================
const removeAccents = (str: string) => {
  if (!str) return "";
  return str.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").trim();
};

const extractRooms = (item: any) => {
  const currentLoaiHinh = item.phân_loại || item.loaiHinh || '';
  if (removeAccents(currentLoaiHinh).includes("dat")) return { pn: null, wc: null }; 

  let pn = item.phongNgu || item.phongngu || item.pn || item.soPhongNgu || null;
  let wc = item.wc || item.phongTam || item.phongtam || item.soWc || item.soWC || null;

  const combinedText = `${item.tieude || ""} ${item.mota || item.moTa || ""}`;
  const textWithoutHtml = combinedText.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/[\u200B-\u200D\uFEFF\n\r]/g, ' ');
  const fullText = removeAccents(textWithoutHtml).toLowerCase();

  if (!pn) {
    const matchPhong1 = fullText.match(/(\d+)\s*(?:pn|phong ngu|p ngu|ngu|p\.ngu|phong)(?![a-z])/i);
    const matchPhong2 = fullText.match(/\b(?:pn|phong ngu|p ngu|ngu|p\.ngu|phong)[\s:-]*(\d+)/i);
    
    if (matchPhong1 && parseInt(matchPhong1[1]) > 0) {
      pn = parseInt(matchPhong1[1]).toString();
    } else if (matchPhong2 && parseInt(matchPhong2[1]) > 0) {
      pn = parseInt(matchPhong2[1]).toString();
    }
  }

  if (!wc) {
    const matchWC1 = fullText.match(/(\d+)\s*(?:wc|phong tam|nha ve sinh|phong ve sinh|toilet|nvs)(?![a-z])/i);
    const matchWC2 = fullText.match(/\b(?:wc|phong tam|nha ve sinh|phong ve sinh|toilet|nvs)[\s:-]*(\d+)/i);
    
    if (matchWC1 && parseInt(matchWC1[1]) > 0) {
      wc = parseInt(matchWC1[1]).toString();
    } else if (matchWC2 && parseInt(matchWC2[1]) > 0) {
      wc = parseInt(matchWC2[1]).toString();
    }
  }

  return { pn, wc };
};

const calculateGiaM2 = (item: any) => {
  if (item.giaM2) return item.giaM2; 
  try {
    let giaTriTrieu = 0;
    if (item.soGia && !isNaN(Number(item.soGia))) {
        const so = Number(item.soGia);
        giaTriTrieu = so < 1000 ? so * 1000 : so;
    } else {
        const giaStr = (item.gia || "").toLowerCase().replace(/x/g, '0');
        if (giaStr.includes('tỷ') || giaStr.includes('ty')) {
            const match = giaStr.match(/([\d,.]+)\s*(?:tỷ|ty)\s*([\d]+)?/);
            if (match) {
                const ty = parseFloat(match[1].replace(/,/g, '.'));
                let trieu = 0;
                if (match[2]) {
                    const trieuStr = match[2];
                    if (trieuStr.length === 1) trieu = parseInt(trieuStr) * 100;
                    else if (trieuStr.length === 2) trieu = parseInt(trieuStr) * 10;
                    else trieu = parseInt(trieuStr.substring(0, 3)); 
                }
                giaTriTrieu = ty * 1000 + trieu;
            }
        } else if (giaStr.includes('triệu') || giaStr.includes('trieu')) {
            const match = giaStr.match(/([\d,.]+)/);
            if (match) giaTriTrieu = parseFloat(match[1].replace(/,/g, '.'));
        }
    }
    const dtStr = (item.dienTich || "").toLowerCase();
    const dtMatch = dtStr.match(/([\d,.]+)/); 
    let dtNum = 0;
    if (dtMatch) {
        let cleanDt = dtMatch[1].replace(/[.,]+$/, ''); 
        dtNum = parseFloat(cleanDt.replace(/,/g, '.'));
    }
    if (giaTriTrieu > 0 && dtNum > 0) {
      const calc = giaTriTrieu / dtNum;
      return `${parseFloat(calc.toFixed(2)).toLocaleString('vi-VN')} tr/m²`;
    }
  } catch(e) {}
  return null;
};

// ==========================================
// 🏡 COMPONENT CHÍNH: CHI TIẾT SẢN PHẨM
// ==========================================
export default function PropertyClient({ item }: PropertyClientProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const touchStartDist = useRef(0);

  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!isPopupOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isPopupOpen]);

  useEffect(() => {
    const savedFavs = localStorage.getItem("thl_favorites");
    if (savedFavs) {
      const parsedFavs = JSON.parse(savedFavs);
      const bdsId = item.id?.toString() || item.slug;
      setIsFavorite(parsedFavs.includes(bdsId));
    }
  }, [item]);

  const handleToggleFavorite = () => {
    const bdsId = item.id?.toString() || item.slug;
    const savedFavs = localStorage.getItem("thl_favorites");
    let parsedFavs = savedFavs ? JSON.parse(savedFavs) : [];
    
    if (isFavorite) {
      parsedFavs = parsedFavs.filter((id: string) => id !== bdsId);
      setIsFavorite(false);
    } else {
      parsedFavs.push(bdsId);
      setIsFavorite(true);
    }
    localStorage.setItem("thl_favorites", JSON.stringify(parsedFavs));
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Đã sao chép đường dẫn sản phẩm!");
  };

  const anhGoc = item.anh || item.Anh || "";
  const danhSachAnh = anhGoc ? anhGoc.split(",").map((a: string) => a.trim()).filter((a: string) => a !== "" && a.startsWith("http")) : [];
  const anhSoDoGoc = item.anhSoDo || item.AnhSoDo || "";
  
  const tatCaAnhGallery = [...danhSachAnh];
  if (anhSoDoGoc && anhSoDoGoc.startsWith("http") && !tatCaAnhGallery.includes(anhSoDoGoc)) {
    tatCaAnhGallery.push(anhSoDoGoc);
  }

  const noiDungMoTa = item.mota || item.moTa || item.Mota || item.description || item.Description || "Thông tin đang được cập nhật...";
  const giaM2 = useMemo(() => calculateGiaM2(item), [item]);
  const { pn, wc } = useMemo(() => extractRooms(item), [item]);

  const displayLocation = useMemo(() => {
    if (item.diaChiFull) return item.diaChiFull;
    if (item.diachiFull) return item.diachiFull;
    if (item.diaChi) return item.diaChi;
    if (item.Diachi) return item.Diachi;
    
    const parts = [];
    if (item.duong || item.Duong) parts.push(item.duong || item.Duong);
    if (item.phuong || item.Phuong) parts.push(item.phuong || item.Phuong);
    if (item.khuVuc || item.Khuvuc || item.quan || item.Quan) parts.push(item.khuVuc || item.Khuvuc || item.quan || item.Quan);
    
    if (parts.length > 0) return parts.join(", ");
    
    return item.khuVucFull || item.khuvucFull || "Đà Nẵng";
  }, [item]);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.5, 1));
  const handleResetZoom = () => { setScale(1); setPosition({ x: 0, y: 0 }); };
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale === 1) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    setPosition({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  };
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      touchStartDist.current = dist;
    } else if (e.touches.length === 1 && scale > 1) {
      isDragging.current = true;
      dragStart.current = { x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y };
    }
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDist.current > 0) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      const factor = dist / touchStartDist.current;
      setScale(prev => Math.min(Math.max(prev * factor, 1), 4));
      touchStartDist.current = dist;
    } else if (e.touches.length === 1 && isDragging.current) {
      setPosition({ x: e.touches[0].clientX - dragStart.current.x, y: e.touches[0].clientY - dragStart.current.y });
    }
  };

  return (
    <article className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full max-w-full">
      
      {/* 🖼️ 1. GALLERY HÌNH ẢNH */}
      <div className="relative w-full max-w-full p-2 sm:p-3 pb-0">
        <PropertyGallery 
          images={tatCaAnhGallery} 
          alt={item.tieude || item.Title || "Trần Huy Land"} 
          videoUrl={item.videoUrl || item.VideoUrl} 
          linkMap={item.linkMap || item.LinkMap || item.toado} 
        />
      </div>

      {/* 📝 2. NỘI DUNG SẢN PHẨM */}
      <div className="p-5 sm:p-8 w-full max-w-full">
        
        <header>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-[1.3] tracking-tight flex-1 pr-0 sm:pr-4">
              {item.tieude || item.Tieude}
            </h1>
            <div className="flex items-center gap-2 shrink-0 self-start">
              <button onClick={handleCopyLink} className="p-2.5 border border-slate-200 rounded-full text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all bg-white shadow-sm active:scale-95 cursor-pointer" title="Chia sẻ">
                <Share2 size={18} />
              </button>
              <button onClick={handleToggleFavorite} className={`p-2.5 border rounded-full transition-all bg-white shadow-sm active:scale-95 cursor-pointer ${isFavorite ? 'border-red-200 text-red-500 bg-red-50' : 'border-slate-200 text-slate-500 hover:text-red-500 hover:bg-red-50'}`} title="Lưu tin">
                <Heart size={18} fill={isFavorite ? "currentColor" : "none"} className={isFavorite ? "animate-pulse" : ""} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-start gap-x-6 gap-y-3 text-slate-600 text-[14px] sm:text-[15px] mb-6 font-medium">
            <span className="flex items-start gap-1.5 leading-snug max-w-full">
              <MapPin size={18} className="text-amber-500 shrink-0 mt-0.5" />
              <span className="break-words leading-relaxed">{displayLocation}</span>
            </span>
            <span className="flex items-center gap-1.5 shrink-0">
              <Calendar size={18} className="text-slate-400 shrink-0" />Ngày đăng: {item.ngayDang || item.NgayDang || "Gần đây"}
            </span>
          </div>
        </header>

        <hr className="border-slate-100 mb-6" />

        {/* Mức Giá & Diện Tích */}
        <div className="flex flex-wrap items-end gap-x-8 gap-y-4 mb-6">
          <div>
            <div className="text-slate-400 text-[11px] font-bold mb-1 uppercase tracking-wider">Mức giá</div>
            <div className="text-[#E03C31] font-black text-3xl tracking-tight">{item.gia || item.Gia || "Thỏa thuận"}</div>
          </div>
          {item.dienTich && (
            <div>
              <div className="text-slate-400 text-[11px] font-bold mb-1 uppercase tracking-wider">Diện tích</div>
              <div className="text-[#E03C31] font-black text-2xl tracking-tight">{item.dienTich || item.DienTich}</div>
            </div>
          )}
          {giaM2 && (
            <div className="pb-1">
              <div className="text-slate-500 font-bold text-base">{giaM2}</div>
            </div>
          )}
        </div>

        {/* Bảng Thông số Kỹ thuật */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-slate-100 mb-8">
          {pn && (
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                <BedDouble size={18} className="text-slate-500" />
              </div>
              <div>
                <div className="text-slate-400 text-[11px] uppercase tracking-wider font-bold">Phòng ngủ</div>
                <div className="text-slate-800 font-bold text-[15px]">{pn}</div>
              </div>
            </div>
          )}
          {wc && (
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                <Bath size={18} className="text-slate-500" />
              </div>
              <div>
                <div className="text-slate-400 text-[11px] uppercase tracking-wider font-bold">Phòng tắm</div>
                <div className="text-slate-800 font-bold text-[15px]">{wc}</div>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
              <Compass size={18} className="text-slate-500" />
            </div>
            <div>
              <div className="text-slate-400 text-[11px] uppercase tracking-wider font-bold">Hướng nhà</div>
              <div className="text-slate-800 font-bold text-[15px]">{item.huong || item.Huong || 'Chưa rõ'}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
              <ShieldCheck size={18} className="text-emerald-500" />
            </div>
            <div className="min-w-0">
              <div className="text-emerald-600/70 text-[11px] uppercase tracking-wider font-bold">Pháp lý</div>
              <div className="text-emerald-700 font-bold text-[15px] truncate">{item.phapLy || item.PhapLy || 'Sổ đỏ/Sổ hồng'}</div>
            </div>
          </div>
        </div>

        {/* Nút bản đồ & Sổ */}
        {((item.linkMap || item.LinkMap) || !!anhSoDoGoc) && (
          <div className={`grid gap-2.5 sm:gap-4 mb-8 w-full ${(item.linkMap || item.LinkMap) && !!anhSoDoGoc ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {(item.linkMap || item.LinkMap) && (
              <a 
                href={item.linkMap || item.LinkMap} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-[#0068FF] hover:bg-[#0055D4] text-white font-bold rounded-xl py-3 sm:py-3.5 px-2 text-center text-[12px] min-[390px]:text-[13px] sm:text-[14px] whitespace-nowrap tracking-tight flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 border border-[#0068FF]"
              >
                <Map className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-white shrink-0" /> <span className="truncate">Xem vị trí bản đồ</span>
              </a>
            )}
            {!!anhSoDoGoc && (
              <button 
                onClick={() => setIsPopupOpen(true)} 
                className="bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold border border-orange-200 rounded-xl py-3 sm:py-3.5 px-2 text-center text-[12px] min-[390px]:text-[13px] sm:text-[14px] whitespace-nowrap tracking-tight flex items-center justify-center gap-1.5 transition-colors cursor-pointer w-full shadow-sm active:scale-95"
              >
                <FileText className="w-4 h-4 sm:w-[18px] sm:h-[18px] shrink-0" /> <span className="truncate">Xem sổ đỏ / Bản vẽ</span>
              </button>
            )}
          </div>
        )}

        {/* 🚀 LÕI RENDER KẾT HỢP: MARKDOWN + SILO LINK ADAPTER + TYPOGRAPHY TỶ LỆ VÀNG */}
        <div className="max-w-3xl mx-auto w-full pt-4">
          <h4 className="font-extrabold text-slate-900 text-lg mb-6 pb-2 border-b border-slate-100 flex items-center gap-2">
            Mô tả chi tiết
          </h4>
          <div className="prose prose-slate max-w-none text-[#222222] text-[17px] sm:text-[18px] leading-[1.8] tracking-[0.005em] whitespace-pre-line text-justify">
            <ReactMarkdown
              components={{
                h1: ({node, ...props}) => <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-8 mb-4" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-8 mb-3" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-6 mb-2 text-orange-600" {...props} />,
                p: ({node, ...props}) => <p className="mb-6 last:mb-0" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-6 space-y-2 text-[#222222]" {...props} />,
                li: ({node, ...props}) => <li className="leading-[1.8]" {...props} />,
                strong: ({node, ...props}) => <strong className="font-bold text-slate-900" {...props} />,
                
                // 🔥 BỘ LỌC ĐIỀU HƯỚNG MA TRẬN SILO
                a: ({node, ...props}) => {
                  const targetUrl = props.href || '#';
                  const isInternalSilo = targetUrl.startsWith('/') || targetUrl.includes('tranhuyland.vn');
                  
                  return isInternalSilo ? (
                    <Link 
                      href={targetUrl} 
                      className="text-[#E03C31] font-bold underline decoration-1 hover:decoration-2 hover:text-red-700 transition-all cursor-pointer"
                    >
                      {props.children}
                    </Link>
                  ) : (
                    <a 
                      href={targetUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 font-bold underline hover:text-blue-800 transition-colors cursor-pointer"
                    >
                      {props.children}
                    </a>
                  );
                }
              }}
            >
              {tuDongGaiLinkMaTran(noiDungMoTa)}
            </ReactMarkdown>
          </div>
        </div>

      </div>

      {/* POPUP XEM SỔ ĐỎ */}
      {isPopupOpen && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-md z-[99999] flex flex-col items-center justify-center animate-fade-in touch-none select-none"
          onClick={() => setIsPopupOpen(false)}
        >
          <div className="absolute top-4 left-4 z-50 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-white/10 p-1.5 rounded-xl">
            <button onClick={(e) => { e.stopPropagation(); handleZoomIn(); }} className="p-2 text-white hover:text-amber-400 bg-white/5 hover:bg-white/10 rounded-lg transition-all cursor-pointer">
              <ZoomIn size={20} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleZoomOut(); }} className="p-2 text-white hover:text-amber-400 bg-white/5 hover:bg-white/10 rounded-lg transition-all cursor-pointer">
              <ZoomOut size={20} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleResetZoom(); }} className="p-2 text-white hover:text-amber-400 bg-white/5 hover:bg-white/10 rounded-lg transition-all cursor-pointer">
              <RefreshCw size={16} />
            </button>
            <span className="text-white text-[11px] font-bold px-2 tracking-wide bg-white/10 rounded-md py-1">Zoom: {Math.round(scale * 100)}%</span>
          </div>

          <button 
            onClick={(e) => { e.stopPropagation(); setIsPopupOpen(false); }}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2.5 transition-all z-50 cursor-pointer border border-white/10 shadow-lg"
          >
            <X size={24} />
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
              src={layUrlAnhChuan(anhSoDoGoc)}
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
    </article>
  );
}
