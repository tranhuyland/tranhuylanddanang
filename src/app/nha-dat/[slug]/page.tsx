'use client';
import React, { useState, useEffect } from "react";
import { getBdsData } from "@/lib/googleSheets";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin, Calendar, ShieldCheck, Square, Bed, Layers, Map, FileText, Phone } from "lucide-react";

interface Props { params: Promise<{ slug: string }>; }

export default function NhaDatDetail({ params }: Props) {
  const [slug, setSlug] = useState<string | null>(null);
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentMediaIndex, setCurrentMediaIndex] = useState<number>(0);

  // Giải nén params động đồng bộ Next.js 15
  useEffect(() => {
    params.then((resolvedParams) => {
      setSlug(resolvedParams.slug);
    });
  }, [params]);

  // Fetch dữ liệu bất động sản đồng bộ Client
  useEffect(() => {
    if (!slug) return;
    async function fetchData() {
      const data = await getBdsData();
      const foundItem = data.find(p => p.slug === slug);
      setItem(foundItem || null);
      setLoading(false);
    }
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-bold text-sm">
        Đang tải dữ liệu nhà đất...
      </div>
    );
  }

  if (!item) notFound();
  
  // Lọc danh sách hình ảnh hợp lệ
  const danhSachAnh = item.anh ? item.anh.split(",").map((a: string) => a.trim()).filter((a: string) => a !== "" && a.startsWith("http")) : [];

  // Tạo mảng tổng hợp cả Video và Ảnh để chạy Slide chung một luồng mượt mà
  const mediaList: any[] = [];
  if (item.videoUrl) {
    mediaList.push({ type: "video", url: item.videoUrl });
  }
  danhSachAnh.forEach((url: string) => {
    mediaList.push({ type: "image", url: url });
  });

  const nextMedia = (e: React.MouseEvent) => {
    e.preventDefault();
    if (mediaList.length > 0) {
      setCurrentMediaIndex((prev) => (prev === mediaList.length - 1 ? 0 : prev + 1));
    }
  };

  const prevMedia = (e: React.MouseEvent) => {
    e.preventDefault();
    if (mediaList.length > 0) {
      setCurrentMediaIndex((prev) => (prev === 0 ? mediaList.length - 1 : prev - 1));
    }
  };

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-10 flex-1">
        <Link href="/" scroll={false} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> QUAY LẠI TRANG CHỦ
        </Link>
        
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          
          {/* KHU VỰC SLIDE MEDIA KHỚP 100% GIAO DIỆN IMAGE.PNG */}
          <div className="relative aspect-[16/10] bg-slate-900 w-full group">
            <div className="w-full h-full flex items-center justify-center relative">
              {mediaList.length > 0 ? (
                mediaList[currentMediaIndex].type === "video" ? (
                  <iframe 
                    className="w-full h-full" 
                    src={mediaList[currentMediaIndex].url} 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                ) : (
                  <Image 
                    src={mediaList[currentMediaIndex].url} 
                    alt={item.tieude} 
                    fill 
                    className="object-contain" 
                    priority 
                    sizes="(max-w-4xl) 100vw" 
                  />
                )
              ) : (
                <div className="text-slate-400 text-xs">Không tìm thấy hình ảnh dữ liệu</div>
              )}
            </div>

            {/* NÚT MŨI TÊN ĐIỀU HƯỚNG SANG TRÁI (<) */}
            {mediaList.length > 1 && (
              <button 
                onClick={prevMedia} 
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-all z-10 shadow-lg"
              >
                <ChevronLeft size={20} />
              </button>
            )}

            {/* NÚT MŨI TÊN ĐIỀU HƯỚNG SANG PHẢI (>) */}
            {mediaList.length > 1 && (
              <button 
                onClick={nextMedia} 
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-all z-10 shadow-lg"
              >
                <ChevronRight size={20} />
              </button>
            )}

            {/* HÀNG NÚT CHẤM TRÒN ĐỊNH VỊ PHÍA DƯỚI CARD ẢNH */}
            {mediaList.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/30 px-3 py-1.5 rounded-full z-10">
                {mediaList.map((_, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setCurrentMediaIndex(idx)} 
                    className={`w-2 h-2 rounded-full transition-all ${currentMediaIndex === idx ? "bg-amber-500 scale-125" : "bg-white/60"}`}
                  />
                ))}
              </div>
            )}

            {/* TAG THÔNG BÁO SỐ LƯỢNG MEDIA */}
            <div className="bg-slate-900/70 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-md absolute top-4 left-4 z-10 flex items-center gap-1 uppercase tracking-wider shadow">
              <Layers className="w-3 h-3 text-amber-400" /> Media: {item.videoUrl ? '1 Video & ' : ''}{danhSachAnh.length} Ảnh
            </div>
          </div>

          {/* GIỮ NGUYÊN TOÀN BỘ PHẦN THÔNG TIN CHI TIẾT CŨ CỦA ANH HUY */}
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <span className="bg-amber-500 text-slate-900 font-extrabold text-base px-3 py-1 rounded-xl shadow-sm">{item.gia}</span>
              <span className="text-xs text-slate-400 font-bold uppercase bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> {item.phapLy || 'Sổ hồng riêng'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-4 leading-snug">{item.tieude}</h1>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-400 text-xs mt-2 border-b border-slate-100 pb-4 font-semibold">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-amber-500" />{item.khuVucFull}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Ngày đăng: {item.ngayDang}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 my-6 p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-600 text-center font-semibold">
              <div>
                <div className="text-slate-400 text-[11px] font-bold uppercase mb-0.5 tracking-wider">Diện tích</div>
                <strong className="text-slate-900 text-sm sm:text-base">{item.dienTich || '---'}</strong>
              </div>
              <div>
                <div className="text-slate-400 text-[11px] font-bold uppercase mb-0.5 tracking-wider">Cấu trúc</div>
                <strong className="text-slate-900 text-sm sm:text-base">{item.phongNgu || 'Đất ở'}</strong>
              </div>
              <div>
                <div className="text-slate-400 text-[11px] font-bold uppercase mb-0.5 tracking-wider">Hướng</div>
                <strong className="text-slate-900 text-sm sm:text-base">{item.huong || 'Chưa rõ'}</strong>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {item.linkMap && <a href={item.linkMap} target="_blank" rel="noopener noreferrer" className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 rounded-xl py-2.5 px-3 text-center text-xs flex items-center justify-center gap-1.5 transition-colors"><Map className="w-4 h-4" /> Vị Trí Bản Đồ</a>}
              {item.anhSoDo && <a href={item.anhSoDo} target="_blank" rel="noopener noreferrer" className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 rounded-xl py-2.5 px-3 text-center text-xs flex items-center justify-center gap-1.5 transition-colors"><FileText className="w-4 h-4" /> Sổ Hồng Bản Vẽ</a>}
            </div>

            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-2">Mô tả chi tiết:</h4>
            <p className="text-slate-700 text-sm leading-relaxed text-justify whitespace-pre-line mb-8">{item.moTa}</p>

            <div className="flex gap-3 border-t border-slate-100 pt-6">
              <a href="tel:0931555551" className="flex-1 bg-slate-900 text-white font-extrabold rounded-xl py-3 px-4 flex items-center justify-center gap-2 text-sm shadow-md transition-transform active:scale-95"><Phone className="w-4 h-4 text-amber-400 fill-amber-400" /> Gọi Thương Lượng</a>
              <a href="https://zalo.me/0931555551" target="_blank" rel="noopener noreferrer" className="flex-1 bg-[#0068ff] text-white font-extrabold rounded-xl py-3 px-4 flex items-center justify-center text-sm shadow-md text-center transition-transform active:scale-95">Kết Nối Zalo</a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <FloatingWidgets />
    </>
  );
}
