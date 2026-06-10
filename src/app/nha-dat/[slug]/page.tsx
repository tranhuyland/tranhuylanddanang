"use client";

import { getBdsData } from "@/lib/googleSheets"; 
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";
import PropertyGallery from "@/components/SlideBds"; 
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, MapPin, Calendar, ShieldCheck, Layers, Map, FileText, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import React, { useState, useEffect } from "react";

// Cấu trúc Type chuẩn của Next.js 15 dành cho Params dạng Promise
interface Props { 
  params: Promise<{ slug: string }>; 
}

export default function NhaDatDetail({ params }: Props) {
  // Giải nén params an toàn bằng React.use() do cấu trúc component dạng client hoặc unwrapped
  const { slug } = React.use(params);
  
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Fetch dữ liệu phía Client để đồng bộ trạng thái Popup tương tác
  useEffect(() => {
    async function loadData() {
      try {
        const data = await getBdsData();
        const foundItem = data.find(p => p.slug === slug);
        if (foundItem) {
          setItem(foundItem);
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu chi tiết:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!item) notFound();
  
  // Thu thập danh sách ảnh chính từ cột 'anh' trong Google Sheet
  const anhGoc = item.anh || item.Anh || "";
  const danhSachAnh = anhGoc ? anhGoc.split(",").map((a: string) => a.trim()).filter((a: string) => a !== "" && a.startsWith("http")) : [];

  // Gom thêm ảnh sổ đỏ/bản vẽ vào chung danh sách slide nếu có để khách tiện vuốt xem một lượt
  const anhSoDoGoc = item.anhSoDo || item.AnhSoDo || "";
  const tatCaAnhGallery = [...danhSachAnh];
  if (anhSoDoGoc && anhSoDoGoc.startsWith("http") && !tatCaAnhGallery.includes(anhSoDoGoc)) {
    tatCaAnhGallery.push(anhSoDoGoc);
  }

  // Khắc phục lỗi lệch chữ hoa/thường để bảo đảm luôn lấy được văn bản mô tả từ Google Sheet
  const noiDungMoTa = item.mota || item.moTa || item.Mota || item.description || item.Description || "Thông tin đang được cập nhật...";

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-10 flex-1 w-full max-w-full overflow-hidden">
        <Link href="/" scroll={false} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> QUAY LẠI TRANG CHỦ
        </Link>
        
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden w-full max-w-full">
          
          {/* KHU VỰC TRÌNH CHIẾU MEDIA */}
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

            <div className="grid grid-cols-2 gap-3 mb-6 w-full">
              {(item.linkMap || item.LinkMap) && (
                <a href={item.linkMap || item.LinkMap} target="_blank" rel="noopener noreferrer" className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 rounded-xl py-2.5 px-3 text-center text-xs flex items-center justify-center gap-1.5 transition-colors">
                  <Map className="w-4 h-4" /> Vị Trí Bản Đồ
                </a>
              )}
              {anhSoDoGoc && (
                <button 
                  onClick={() => setIsPopupOpen(true)} 
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 rounded-xl py-2.5 px-3 text-center text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4" /> Sổ Hồng Bản Vẽ
                </button>
              )}
            </div>

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
                  strong: ({node, ...props}) => <strong className="font-black text-slate-900 bg-amber-50 px-1 rounded text-amber-700" {...props} />,
                }}
              >
                {noiDungMoTa}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <FloatingWidgets /> 

      {/* POPUP SỔ HỒNG THÔNG MINH - BẤM X HOẶC VUỐT RA NGOÀI ĐỂ ĐÓNG */}
      {isPopupOpen && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-[99999] flex items-center justify-center p-4 animate-fade-in touch-none"
          onClick={() => setIsPopupOpen(false)}
        >
          {/* Nút đóng hình tròn góc trên bên phải */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsPopupOpen(false);
            }}
            className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white rounded-full p-2.5 transition-all z-50 cursor-pointer border border-white/10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Vùng chứa hình ảnh thực tế */}
          <div 
            className="relative max-w-3xl max-h-[85vh] w-full h-full flex items-center justify-center select-none"
            onClick={(e) => e.stopPropagation()} // Chống tắt khi click trúng ảnh
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={anhSoDoGoc} 
              alt="Sổ hồng bản vẽ chi tiết" 
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl pointer-events-auto cursor-zoom-in"
            />
          </div>
        </div>
      )}
    </>
  );
}
