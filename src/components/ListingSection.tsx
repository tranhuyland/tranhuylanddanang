'use client';
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { MapPin, Compass, Clock, Square, ChevronRight, BedDouble, Check, RotateCcw } from "lucide-react";
import { layUrlAnhChuan, cleanVietnameseText } from "@/lib/utils"; 
import FilterWidget from "./FilterWidget"; // 🔥 Gọi Component vừa tách vào

interface ListingSectionProps {
  allBdsItems: any[];
  forceDistrict?: string;
}

const TAB_OPTIONS = [
  { id: "all", label: "Tất cả" },
  { id: "Đất nền", label: "⛳ Đất nền" },
  { id: "Nhà phố", label: "🏠 Nhà phố" },
  { id: "Cho thuê", label: "🔑 Cho thuê" }
];

const formatTimeAgo = (dateStr: string) => {
  if (!dateStr) return "Tin mới";
  const parts = dateStr.split(/[-/]/);
  if (parts.length !== 3) return "Hôm nay";
  const day = parseInt(parts[0], 10), month = parseInt(parts[1], 10) - 1, year = parseInt(parts[2], 10);
  const diffDays = Math.floor((new Date().setHours(0, 0, 0, 0) - new Date(year, month, day).setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24));
  return diffDays <= 0 ? "Hôm nay" : diffDays === 1 ? "1 ngày trước" : diffDays < 7 ? `${diffDays} ngày trước` : `${Math.floor(diffDays / 7)} tuần trước`;
};

export default function ListingSection({ allBdsItems = [], forceDistrict }: ListingSectionProps) {
  const safeBdsItems = Array.isArray(allBdsItems) ? allBdsItems : [];
  const initialFilters = { khuVuc: forceDistrict || "all", khoangGia: "all", huong: "all", tag: "all" };
  
  const [filters, setFilters] = useState(initialFilters);
  const [tempFilters, setTempFilters] = useState(initialFilters);
  const [activeLoaiHinh, setActiveLoaiHinh] = useState("all");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;
  const [searchTerm, setSearchTerm] = useState("");

  const handleFilterChange = (key: string, value: string) => setTempFilters(prev => ({ ...prev, [key]: value }));

  // 🔥 LẮNG NGHE LỆNH TỪ HEADER TRUYỀN XUỐNG
  useEffect(() => {
    const handleOpenDrawer = () => {
      setTempFilters(filters);
      setIsDrawerOpen(true);
    };
    const handleSearch = (e: any) => {
      setSearchTerm(e.detail);
      setCurrentPage(1);
    };

    window.addEventListener('openFilterDrawer', handleOpenDrawer);
    window.addEventListener('searchBds', handleSearch);

    return () => {
      window.removeEventListener('openFilterDrawer', handleOpenDrawer);
      window.removeEventListener('searchBds', handleSearch);
    };
  }, [filters]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPage = sessionStorage.getItem("bds_page");
      if (savedPage) setCurrentPage(parseInt(savedPage, 10));
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && currentPage > 0) {
      sessionStorage.setItem("bds_page", currentPage.toString());
    }
  }, [currentPage]);

  useEffect(() => {
    const handlePopState = () => isDrawerOpen && setIsDrawerOpen(false);
    if (isDrawerOpen) {
      window.history.pushState({ drawer: 'open' }, '');
      window.addEventListener('popstate', handlePopState);
    }
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isDrawerOpen]);

  const closeDrawer = () => {
    if (window.history.state?.drawer === 'open') window.history.back();
    else setIsDrawerOpen(false);
  };

  const filteredItems = useMemo(() => {
    let result = [...safeBdsItems].sort((a: any, b: any) => {
      const getTime = (d: string) => d ? new Date(d.split(/[-/]/)[2] as any, Number(d.split(/[-/]/)[1]) - 1, d.split(/[-/]/)[0] as any).getTime() : 0;
      const timeDiff = getTime(b.ngayDang || b.ngay) - getTime(a.ngayDang || a.ngay);
      return timeDiff !== 0 ? timeDiff : (Number(b.id) || 0) - (Number(a.id) || 0);
    });

    if (searchTerm) {
      const target = cleanVietnameseText(searchTerm);
      result = result.filter(i => cleanVietnameseText(`${i.tieude || ""} ${i.diaChi || ""} ${i.khuVuc || ""} ${i.mota || ""}`).includes(target));
    }
    if (filters.khuVuc !== "all") {
      const target = cleanVietnameseText(filters.khuVuc);
      result = result.filter(i => cleanVietnameseText(`${i.diaChi || ""} ${i.diaChiFull || ""} ${i.khuVuc || ""}`).includes(target));
    }
    if (activeLoaiHinh !== "all") {
      const target = cleanVietnameseText(activeLoaiHinh);
      result = result.filter(i => cleanVietnameseText(`${i.phanLoai || ""} ${i.loaiHinh || ""} ${i.tieude || ""}`).includes(target));
    }
    if (filters.khoangGia !== "all") {
      result = result.filter(i => {
        const gia = Number(i.soGia) || (i.gia ? parseFloat(i.gia.replace(/[^0-9.]/g, "")) : 0);
        return filters.khoangGia === "duoi3" ? gia < 3.0 : filters.khoangGia === "3to5" ? gia >= 3.0 && gia <= 5.0 : gia > 5.0;
      });
    }
    if (filters.huong !== "all") result = result.filter(i => cleanVietnameseText(i.huong || "").includes(cleanVietnameseText(filters.huong)));
    if (filters.tag !== "all") {
      result = result.filter(i => {
        const text = cleanVietnameseText(`${i.tieude || ""} ${i.mota || ""} ${i.tag || ""} ${i.loaiHinh || ""}`);
        if (filters.tag === "mattien") return i.isMatTien || text.includes("mat tien");
        if (filters.tag === "chinhchu") return text.includes("chinh chu");
        if (filters.tag === "chothue") return cleanVietnameseText(`${i.tieude || ""} ${i.tag || ""} ${i.loaiHinh || ""}`).includes("cho thue");
        return true;
      });
    }
    return result;
  }, [filters, activeLoaiHinh, searchTerm, safeBdsItems]);

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setCurrentPage(1);
    closeDrawer();
    setTimeout(() => document.getElementById("listing-section")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const handleResetFilters = () => {
    const resetState = { ...initialFilters, khuVuc: forceDistrict || "all" };
    setTempFilters(resetState); setFilters(resetState); setActiveLoaiHinh("all"); setCurrentPage(1);
  };

  return (
    <>
      <section className="max-w-7xl mx-auto w-full px-4 -mt-10 relative z-10">
        <div className="bg-white p-5 sm:p-8 rounded-[2rem] border border-slate-100 shadow-xl">
          <div className="flex w-full justify-between items-center gap-1 sm:gap-2 border-b-2 border-slate-100 mb-6 pb-0">
            {TAB_OPTIONS.map(tab => (
              <button key={tab.id} onClick={() => { setActiveLoaiHinh(tab.id); setCurrentPage(1); }}
                className={`flex-1 flex justify-center whitespace-nowrap text-center py-4 px-0.5 text-[13px] min-[390px]:text-[14px] md:text-[16px] font-extrabold transition-all relative rounded-t-xl ${activeLoaiHinh === tab.id ? "text-orange-600 bg-orange-50/50" : "text-slate-400 hover:text-slate-800 hover:bg-slate-50"}`}>
                {tab.label}
                {activeLoaiHinh === tab.id && <span className="absolute bottom-[-2px] left-[10%] w-[80%] h-[4px] bg-gradient-to-r from-orange-500 to-red-600 rounded-t-full" />}
              </button>
            ))}
          </div>

          {/* 🔥 LẮP GHÉP BỘ LỌC GỌN GÀNG TẠI ĐÂY */}
          <FilterWidget 
            tempFilters={tempFilters} 
            handleFilterChange={handleFilterChange} 
            forceDistrict={forceDistrict}
            isDrawerOpen={isDrawerOpen}
            closeDrawer={closeDrawer}
            handleResetFilters={handleResetFilters}
            handleApplyFilters={handleApplyFilters}
          />

          <div className="hidden md:flex items-center justify-between border-t border-slate-100 pt-6 mt-6">
            <div className="text-xs text-slate-400 font-medium italic">* Vui lòng chọn các tiêu chí trên và nhấn Tìm kiếm.</div>
            <div className="flex items-center gap-3">
              {Object.values(filters).some(v => v !== "all") && <button onClick={handleResetFilters} className="text-sm font-bold text-slate-500 hover:text-red-500 px-5 py-3 rounded-xl hover:bg-red-50"><RotateCcw size={16} className="inline mr-2" />Xóa lọc</button>}
              <button onClick={handleApplyFilters} className="bg-gradient-to-r from-orange-500 to-red-600 text-white font-extrabold text-sm px-8 py-3.5 rounded-xl shadow-lg hover:scale-[1.02] transition-all"><Check size={16} className="inline mr-2" />Tìm kiếm ngay</button>
            </div>
          </div>
        </div>
      </section>

      <main id="listing-section" className="max-w-7xl mx-auto w-full px-4 mt-6 mb-20 scroll-mt-28">
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item, index) => (
              <BdsCard key={item.id} item={item} rank={(currentPage - 1) * itemsPerPage + index + 1} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200"><p className="text-slate-500 font-bold text-lg">Không tìm thấy sản phẩm phù hợp</p></div>
        )}
        {Math.ceil(filteredItems.length / itemsPerPage) > 1 && (
          <div className="flex justify-center gap-2 mt-16">
            {Array.from({ length: Math.ceil(filteredItems.length / itemsPerPage) }, (_, idx) => (
              <button key={idx} onClick={() => { setCurrentPage(idx + 1); document.getElementById("listing-section")?.scrollIntoView({ behavior: "smooth" }); }}
                className={`w-10 h-10 rounded-xl font-bold ${currentPage === idx + 1 ? "bg-orange-500 text-white" : "bg-white border text-slate-600"}`}>{idx + 1}</button>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

function BdsCard({ item, rank }: { item: any, rank?: number }) {
  const thumbnail = layUrlAnhChuan(item.anh);
  const displayLocation = item.khuVuc || item.diaChi || item.diaChiFull || item.khuVucFull || "Đà Nẵng";
  const displayTime = item.ngayDang || item.ngay || "";

  const textLower = cleanVietnameseText(`${item.tieude || ""} ${item.mota || item.moTa || ""} ${item.tag || ""} ${item.loaiHinh || ""}`);
  const isChinhChu = textLower.includes("chinh chu");
  const isMatTien = textLower.includes("mat tien");
  const isSapHam = textLower.includes("sap ham") || textLower.includes("gia re");
  
  const strictTextChoThue = cleanVietnameseText(`${item.tieude || ""} ${item.tag || ""} ${item.loaiHinh || item.phân_loại || ""}`);
  const isChoThue = strictTextChoThue.includes("cho thue");

  const cauTrucPhong = useMemo(() => {
    const currentLoaiHinh = item.phân_loại || item.loaiHinh || '';
    if (cleanVietnameseText(currentLoaiHinh).includes("dat")) return "Đất trống";

    const combinedText = `${item.tieude || ""} ${item.mota || item.moTa || ""}`.toLowerCase();
    const matchTang = combinedText.match(/(\d+)\s*(tầng|tang)/i);
    const matchPhong = combinedText.match(/(\d+)\s*(pn|phòng ngủ|phong ngu)/i);
    
    if (matchTang && matchPhong) return `${matchTang[1]} Tầng - ${matchPhong[1]} PN`;
    if (matchTang) return `${matchTang[1]} Tầng`;
    if (matchPhong) return `${matchPhong[1]} PN`;
    return "Nhà ở";
  }, [item]);

  return (
    <a href={`/nha-dat/${item.slug}`} onTouchStart={() => {}} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-orange-500/10 active:shadow-orange-500/20 border border-slate-100 hover:border-orange-200 active:border-orange-300 transition-all duration-300 flex flex-col h-full relative transform hover:-translate-y-1.5 active:translate-y-0 active:scale-[0.98] block">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <Image src={thumbnail} alt={item.tieude || "Trần Huy Land"} fill className="object-cover group-hover:scale-110 group-active:scale-110 transition-transform duration-700 ease-out" sizes="(max-width: 1280px) 100vw" priority={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5 z-10">
          {rank && <span className="bg-red-600/90 backdrop-blur-sm text-white text-[11px] font-bold px-2 py-1 rounded-md shadow-sm tracking-wider">#{rank}</span>}
          {isSapHam && <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-md uppercase tracking-wider animate-pulse">🔥 Sập Hầm</span>}
          {isChoThue && <span className="bg-purple-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-md uppercase tracking-wider shadow-purple-500/30">🔑 Cho Thuê</span>}
          {isChinhChu && <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-md uppercase tracking-wider">✓ Chính Chủ</span>}
          {isMatTien && <span className="bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-md uppercase tracking-wider">🏢 Mặt Tiền</span>}
        </div>

        <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-extrabold text-sm px-3.5 py-1.5 rounded-xl shadow-lg border border-orange-400/20 z-10 tracking-wide transform group-hover:scale-110 group-active:scale-110 group-hover:shadow-orange-500/40 group-active:shadow-orange-500/40 transition-all duration-300">
          {item.gia}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow justify-between">
        <div>
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5 group-hover:text-orange-500 group-active:text-orange-500 transition-colors duration-300">
            <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" /><span className="truncate">{displayLocation}</span>
          </div>
          <h3 className="text-slate-800 font-extrabold text-[15px] sm:text-base line-clamp-2 group-hover:text-orange-600 group-active:text-orange-600 transition-colors duration-300 group-active:duration-75 h-[2.6rem] sm:h-[3rem] overflow-hidden leading-snug mb-4">
            {item.tieude}
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-50 text-slate-600 text-xs">
          <div className="flex flex-col items-center justify-center bg-slate-50 rounded-xl py-2 group-hover:bg-orange-50 group-active:bg-orange-50 transition-colors duration-300 group-active:duration-75">
            <Square className="w-4 h-4 text-orange-500 mb-1" /><span className="font-bold text-slate-700 truncate max-w-full px-1">{item.dienTich || "---"}</span>
          </div>
          <div className="flex flex-col items-center justify-center bg-slate-50 rounded-xl py-2 group-hover:bg-orange-50 group-active:bg-orange-50 transition-colors duration-300 group-active:duration-75">
            <Compass className="w-4 h-4 text-orange-500 mb-1" /><span className="font-bold text-slate-700 truncate max-w-full px-1">{item.huong || "---"}</span>
          </div>
          <div className="flex flex-col items-center justify-center bg-slate-50 rounded-xl py-2 group-hover:bg-orange-50 group-active:bg-orange-50 transition-colors duration-300 group-active:duration-75">
            <BedDouble className="w-4 h-4 text-orange-500 mb-1" /><span className="font-bold text-slate-700 truncate max-w-full px-1">{cauTrucPhong}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-1">
          <span className="text-[11px] text-slate-400 italic flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-300" /> {formatTimeAgo(displayTime)}</span>
          <span className="text-orange-500 text-xs font-extrabold inline-flex items-center gap-0.5 group-hover:translate-x-1.5 group-active:translate-x-1.5 transition-transform duration-300">Chi tiết <ChevronRight className="w-4 h-4" /></span>
        </div>
      </div>
    </a>
  );
}
