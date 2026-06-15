'use client';

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  MapPin, SlidersHorizontal, Check, RotateCcw, X, 
  Heart, ImageIcon, BedDouble, Bath, Clock
} from "lucide-react";
import { layUrlAnhChuan } from "@/lib/utils"; 
import FilterWidget from "./FilterWidget"; 

// ==========================================
// 1. CẤU HÌNH & KIỂU DỮ LIỆU
// ==========================================
interface ListingSectionProps {
  allBdsItems: any[];
  forceDistrict?: string;
}

const TAB_OPTIONS = [
  { id: "all", label: "Tất cả" },
  { id: "Đất", label: "⛳ Đất" },
  { id: "Nhà phố", label: "🏠 Nhà phố" },
  { id: "Căn hộ", label: "🏢 Căn hộ" },
  { id: "Cho thuê", label: "🔑 Cho thuê" }
];

// ==========================================
// 2. CÁC HÀM TIỆN ÍCH (HELPERS)
// ==========================================
const removeAccents = (str: string) => {
  if (!str) return "";
  return str.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").trim();
};

// 🔥 HÀM BÓC TÁCH NGÀY GIỜ
const parseDateInfo = (dateStr: string) => {
  if (!dateStr) return { fullDate: "Hôm nay", time: "", relative: "Vừa xong" };

  try {
    const [datePart, timePart = ""] = dateStr.trim().split(/\s+/);
    const parts = datePart.split(/[-/]/);

    if (parts.length < 3) return { fullDate: dateStr, time: timePart, relative: "" };

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const yearRaw = parts[2];
    const year = yearRaw.length === 2 ? 2000 + parseInt(yearRaw) : parseInt(yearRaw, 10);

    const shortYear = year.toString().slice(-2);
    const formattedDate = `${day < 10 ? '0'+day : day}/${month < 9 ? '0'+(month+1) : month+1}/${shortYear}`;

    const diffDays = Math.floor((new Date().setHours(0, 0, 0, 0) - new Date(year, month, day).setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24));
    
    // Đổi thành "Cách đây X ngày" cực kỳ lịch sự
    const relative = diffDays <= 0 ? "Hôm nay" : `Cách đây ${diffDays} ngày`;

    const shortTime = timePart ? timePart.split(":").slice(0, 2).join(":") : "";

    return { fullDate: formattedDate, time: shortTime, relative };
  } catch(e) {
    return { fullDate: dateStr, time: "", relative: "" };
  }
};

// 🔥 NÂNG CẤP THUẬT TOÁN NHẬN DIỆN BADGE & TAB ĐỘC QUYỀN
const parsePropertyTags = (item: any) => {
  const rawTitleTag = `${item.tieude || ""} ${item.tag || ""} ${item.loaiHinh || item.phân_loại || ""}`.toLowerCase();
  const fullText = removeAccents(rawTitleTag);
  const moTaText = removeAccents(`${item.mota || item.moTa || ""}`);
  const strictChoThueText = removeAccents(`${item.tieude || ""} ${item.tag || ""} ${item.loaiHinh || item.phân_loại || ""}`);

  const isChinhChu = fullText.includes("chinh chu") || moTaText.includes("chinh chu");
  const isSapHam = fullText.includes("sap ham") || fullText.includes("gia re") || moTaText.includes("sap ham");
  
  let isChoThue = strictChoThueText.includes("cho thue");
  let isCanHo = fullText.includes("can ho") || fullText.includes("chung cu") || fullText.includes("apartment");
  const isMatTienFake = fullText.includes("cach mat tien") || fullText.includes("sau lung") || fullText.includes("gan mat tien");
  const hasDat = fullText.includes("dat");

  let isDatMatTien = false, isDatKiet = false, isDatNen = false;
  let isNhaMatTien = false, isNhaKiet = false;

  if (hasDat) {
    isCanHo = false;
    isChoThue = false;
    isNhaMatTien = false;
    isNhaKiet = false;
    
    if (fullText.includes("mat tien") && !isMatTienFake) {
      isDatMatTien = true;
    } else if (fullText.includes("dat nen") || fullText.includes("lo nen") || rawTitleTag.includes("nền")) {
      isDatNen = true;
    } else {
      isDatKiet = true;
    }
  } else if (!isCanHo) {
    if (fullText.includes("mat tien") && !isMatTienFake) {
      isNhaMatTien = true;
    } else {
      isNhaKiet = true;
    }
  }

  let primaryTab = "Nhà phố"; 
  if (hasDat) primaryTab = "Đất";
  else if (isCanHo) primaryTab = "Căn hộ";
  else if (isChoThue) primaryTab = "Cho thuê";

  return { isChinhChu, isSapHam, isChoThue, isNhaKiet, isNhaMatTien, isDatKiet, isDatMatTien, isDatNen, isCanHo, primaryTab };
};

const countImages = (item: any) => {
  if (item.soLuongAnh) return item.soLuongAnh; 
  if (typeof item.anh === 'string') {
    const links = item.anh.split(/[\n,]/).filter((link: string) => link.trim() !== '');
    return Math.max(links.length, 1);
  }
  return Array.isArray(item.anh) ? item.anh.length : 1;
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
      const tyMatch = giaStr.match(/([\d,.]+)\s*(?:tỷ|ty)\s*([\d]+)?/);
      if (tyMatch) {
        const ty = parseFloat(tyMatch[1].replace(/,/g, '.'));
        const trieuStr = tyMatch[2] || "";
        const trieu = trieuStr.length === 1 ? parseInt(trieuStr) * 100 : (trieuStr.length === 2 ? parseInt(trieuStr) * 10 : parseInt(trieuStr.substring(0, 3) || "0"));
        giaTriTrieu = ty * 1000 + trieu;
      } else {
        const trieuMatch = giaStr.match(/([\d,.]+)\s*(?:triệu|trieu)/);
        if (trieuMatch) giaTriTrieu = parseFloat(trieuMatch[1].replace(/,/g, '.'));
      }
    }
    
    const dtMatch = (item.dienTich || "").match(/([\d,.]+)/); 
    const dtNum = dtMatch ? parseFloat(dtMatch[1].replace(/[.,]+$/, '').replace(/,/g, '.')) : 0;
    
    if (giaTriTrieu > 0 && dtNum > 0) {
      return `${parseFloat((giaTriTrieu / dtNum).toFixed(2)).toLocaleString('vi-VN')} tr/m²`;
    }
  } catch(e) {}
  return null;
};

const extractRooms = (item: any) => {
  if (removeAccents(`${item.phân_loại || ""} ${item.loaiHinh || ""} ${item.tag || ""}`).includes("dat")) {
    return { pn: null, wc: null }; 
  }
  const text = `${item.tieude || ""} ${item.mota || item.moTa || ""}`.toLowerCase();
  const matchPhong = text.match(/(\d+)\s*(pn|phòng ngủ|phong ngu)/i);
  const matchWC = text.match(/(\d+)\s*(wc|phòng tắm|phong tam|nha ve sinh)/i);
  return { 
    pn: matchPhong && matchPhong[1] !== "0" ? matchPhong[1] : null, 
    wc: matchWC && matchWC[1] !== "0" ? matchWC[1] : null 
  };
};

// ==========================================
// 3. COMPONENT CHÍNH: BỘ LỌC DANH SÁCH
// ==========================================
export default function ListingSection({ allBdsItems = [], forceDistrict }: ListingSectionProps) {
  const safeBdsItems = Array.isArray(allBdsItems) ? allBdsItems : [];
  const initialFilters = { khuVuc: forceDistrict || "all", khoangGia: "all", huong: "all", tag: "all" };
  
  const [filters, setFilters] = useState(initialFilters);
  const [tempFilters, setTempFilters] = useState(initialFilters);
  const [activeLoaiHinh, setActiveLoaiHinh] = useState("all");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const itemsPerPage = 10;
  const activeFiltersCount = Object.values(filters).filter(v => v !== "all").length;

  useEffect(() => {
    setIsClient(true);
    try {
      const savedFavs = localStorage.getItem("thl_favorites");
      if (savedFavs) setFavoriteIds(JSON.parse(savedFavs));
      
      const savedPage = sessionStorage.getItem("bds_page");
      if (savedPage) setCurrentPage(parseInt(savedPage, 10));
    } catch (e) {}

    const handlePopState = () => {
      document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important');
      setTimeout(() => document.documentElement.style.removeProperty('scroll-behavior'), 150);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (currentPage > 0) sessionStorage.setItem("bds_page", currentPage.toString());
  }, [currentPage]);

  useEffect(() => {
    const handleOpenDrawer = () => {
      setTempFilters(filters);
      setIsDrawerOpen(true);
    };
    const handleSearch = (e: any) => {
      setSearchTerm(e.detail);
      setFilters(initialFilters);
      setTempFilters(initialFilters);
      setCurrentPage(1); 
    };

    window.addEventListener('openFilterDrawer', handleOpenDrawer);
    window.addEventListener('searchBds', handleSearch);
    return () => {
      window.removeEventListener('openFilterDrawer', handleOpenDrawer);
      window.removeEventListener('searchBds', handleSearch);
    };
  }, [filters, initialFilters]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newFavs = favoriteIds.includes(id) ? favoriteIds.filter(f => f !== id) : [...favoriteIds, id];
    setFavoriteIds(newFavs);
    localStorage.setItem('thl_favorites', JSON.stringify(newFavs));
  };

  const handleToggleShowFavorites = () => {
    setShowFavorites(!showFavorites);
    setCurrentPage(1);
    if (!showFavorites) {
      setFilters(initialFilters);
      setTempFilters(initialFilters);
      setActiveLoaiHinh("all");
    }
  };

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setCurrentPage(1);
    setIsDrawerOpen(false);
    setTimeout(() => document.getElementById("listing-section")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const handleResetFilters = () => {
    setTempFilters(initialFilters); 
    setFilters(initialFilters); 
    setActiveLoaiHinh("all"); 
    setCurrentPage(1);
  };

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: safeBdsItems.length, "Đất": 0, "Nhà phố": 0, "Căn hộ": 0, "Cho thuê": 0 };
    safeBdsItems.forEach(i => {
      if (!i) return;
      const primaryTab = parsePropertyTags(i).primaryTab;
      if (counts[primaryTab] !== undefined) counts[primaryTab]++;
    });
    return counts;
  }, [safeBdsItems]);

  const filteredItems = useMemo(() => {
    let result = safeBdsItems.filter(i => showFavorites ? favoriteIds.includes(i.id?.toString() || i.slug) : true);

    result.sort((a: any, b: any) => {
      const getTime = (d: string) => {
        if (!d) return 0;
        const parts = d.split(/[-/]/);
        return parts.length < 3 ? 0 : new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])).getTime();
      };
      const timeDiff = getTime(b.ngayDang || b.ngay) - getTime(a.ngayDang || a.ngay);
      return timeDiff !== 0 ? timeDiff : (Number(b.id) || 0) - (Number(a.id) || 0);
    });

    if (searchTerm) {
      const target = removeAccents(searchTerm);
      result = result.filter(i => removeAccents(`${i.tieude} ${i.diaChiFull} ${i.khuVucFull} ${i.moTa} ${i.phuong}`).includes(target));
    }

    if (filters.khuVuc !== "all") {
      const target = removeAccents(filters.khuVuc);
      result = result.filter(i => removeAccents(`${i.diaChiFull} ${i.khuVuc}`).includes(target));
    }
    
    if (!showFavorites && activeLoaiHinh !== "all") {
      result = result.filter(i => parsePropertyTags(i).primaryTab === activeLoaiHinh);
    }
    
    if (filters.khoangGia !== "all") {
      result = result.filter(i => {
        const gia = Number(i.soGia) || (i.gia ? parseFloat(i.gia.replace(/[^0-9.]/g, "")) : 0);
        if (filters.khoangGia === "duoi3") return gia < 3.0;
        if (filters.khoangGia === "3to5") return gia >= 3.0 && gia <= 5.0;
        return gia > 5.0;
      });
    }
    
    if (filters.huong !== "all") {
      const target = removeAccents(filters.huong);
      result = result.filter(i => removeAccents(i.huong || "").includes(target));
    }
    
    if (filters.tag !== "all") {
      result = result.filter(i => {
        const tags = parsePropertyTags(i);
        if (filters.tag === "mattien") return tags.isNhaMatTien || tags.isDatMatTien;
        if (filters.tag === "chinhchu") return tags.isChinhChu;
        if (filters.tag === "chothue") return tags.isChoThue;
        return true;
      });
    }
    
    return result;
  }, [filters, activeLoaiHinh, searchTerm, safeBdsItems, showFavorites, favoriteIds]);

  return (
    <>
      <section className="w-full relative z-10 -mt-6 sm:-mt-10">
        <div className="bg-white w-full shadow-lg border-b border-slate-200 rounded-t-[2rem] sm:rounded-none pb-6">
          <div className="max-w-7xl mx-auto">
            
            <div className="flex w-full items-stretch mb-6 border-b-2 border-slate-100 bg-slate-50 rounded-t-[2rem] sm:rounded-none overflow-hidden overflow-x-auto custom-scrollbar">
              {TAB_OPTIONS.map((tab, index) => {
                const currentCount = tab.id === "all" ? tabCounts.all : tabCounts[tab.id as keyof typeof tabCounts] || 0;
                const isActive = !showFavorites && activeLoaiHinh === tab.id;
                
                return (
                  <button 
                    key={tab.id} 
                    onClick={() => { 
                      setActiveLoaiHinh(tab.id); setShowFavorites(false); 
                      setFilters(initialFilters); setTempFilters(initialFilters); setCurrentPage(1); 
                    }}
                    className={`flex-1 min-w-[80px] flex flex-col justify-center items-center py-4 px-2 transition-all relative 
                      ${index === 0 ? 'rounded-tl-[2rem] sm:rounded-none' : ''} 
                      ${isActive ? "text-orange-600 bg-white" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/80"}
                    `}
                  >
                    <span className="whitespace-nowrap text-center text-[12px] min-[390px]:text-[13px] md:text-[15px] font-extrabold">{tab.label}</span>
                    <span className={`text-[10px] md:text-[11px] mt-0.5 font-semibold ${isActive ? "text-orange-500" : "text-slate-400"}`}>({currentCount})</span>
                    {isActive && <span className="absolute bottom-[-2px] left-0 w-full h-[3px] bg-gradient-to-r from-orange-500 to-red-600" />}
                  </button>
                );
              })}

              <button 
                onClick={handleToggleShowFavorites}
                className={`hidden md:flex flex-1 sm:flex-none sm:px-8 flex-col justify-center items-center py-4 px-1 transition-all relative border-l-2 border-slate-100 
                  ${showFavorites ? 'text-red-500 bg-white' : 'text-slate-500 hover:text-red-500 hover:bg-slate-100/80'}
                `}
              >
                <span className="whitespace-nowrap text-center text-[13px] min-[390px]:text-[14px] md:text-[16px] font-extrabold flex items-center gap-1.5">
                  <Heart size={16} fill={showFavorites ? "currentColor" : "none"} /> Đã lưu
                </span>
                <span className={`text-[10px] md:text-[11px] mt-0.5 font-semibold ${showFavorites ? 'text-red-400' : 'text-slate-400'}`}>
                  ({isClient ? favoriteIds.length : 0})
                </span>
                {showFavorites && <span className="absolute bottom-[-2px] left-0 w-full h-[3px] bg-red-500" /> }
              </button>
            </div>

            <div className="px-4 sm:px-8">
              <div className="md:hidden flex gap-2 mb-2">
                <button 
                  onClick={() => { setTempFilters(filters); setIsDrawerOpen(true); }}
                  className="flex-1 flex items-center justify-center gap-2 bg-orange-50/50 text-orange-600 px-4 py-3 rounded-2xl text-sm font-bold border border-orange-100 transition-all active:scale-95"
                >
                  <SlidersHorizontal size={18} /> Bộ lọc chi tiết 
                  {activeFiltersCount > 0 && <span className="bg-red-500 text-white w-5 h-5 rounded-full text-[10px] flex items-center justify-center shadow-md">{activeFiltersCount}</span>}
                </button>
                
                <button 
                  onClick={handleToggleShowFavorites}
                  className={`flex flex-col items-center justify-center px-4 py-2 rounded-2xl text-sm font-bold border transition-all active:scale-95 
                    ${showFavorites ? 'bg-red-500 text-white border-red-500 shadow-md shadow-red-500/30' : 'bg-red-50 text-red-500 border-red-100'}
                  `}
                >
                  <Heart size={20} fill={showFavorites ? "currentColor" : "none"} className={showFavorites ? "text-white" : "text-red-500"} />
                  <span className="text-[11px] mt-0.5 whitespace-nowrap">Đã lưu ({isClient ? favoriteIds.length : 0})</span>
                </button>
              </div>

              {activeFiltersCount > 0 && !showFavorites && (
                <button 
                  onClick={handleResetFilters}
                  className="md:hidden w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-2xl text-sm font-bold border border-red-100 transition-all active:scale-95 mb-2"
                >
                  <X size={18} /> Hủy bỏ bộ lọc đang áp dụng
                </button>
              )}

              <FilterWidget 
                tempFilters={tempFilters} 
                handleFilterChange={(k: string, v: string) => setTempFilters(p => ({...p, [k]: v}))} 
                forceDistrict={forceDistrict}
                isDrawerOpen={isDrawerOpen}
                closeDrawer={() => setIsDrawerOpen(false)}
                handleResetFilters={handleResetFilters}
                handleApplyFilters={handleApplyFilters}
              />

              <div className="hidden md:flex items-center justify-between border-t border-slate-100 pt-6 mt-6">
                <div className="text-xs text-slate-400 font-medium italic">* Vui lòng chọn các tiêu chí trên và nhấn Tìm kiếm.</div>
                <div className="flex items-center gap-3">
                  {activeFiltersCount > 0 && (
                    <button onClick={handleResetFilters} className="text-sm font-bold text-slate-500 hover:text-red-500 px-5 py-3 rounded-xl hover:bg-red-50">
                      <RotateCcw size={16} className="inline mr-2" />Xóa lọc
                    </button>
                  )}
                  <button onClick={handleApplyFilters} className="bg-gradient-to-r from-orange-500 to-red-600 text-white font-extrabold text-sm px-8 py-3.5 rounded-xl shadow-lg hover:scale-[1.02] transition-all">
                    <Check size={16} className="inline mr-2" />Tìm kiếm ngay
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <main id="listing-section" className="max-w-7xl mx-auto w-full px-4 mt-8 mb-20 scroll-mt-28">
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item, index) => {
               const bdsId = item.id?.toString() || item.slug;
               return (
                 <BdsCard 
                   key={bdsId} 
                   item={item} 
                   rank={(currentPage - 1) * itemsPerPage + index + 1} 
                   isFavorite={favoriteIds.includes(bdsId)}
                   onToggleFavorite={(e: React.MouseEvent) => toggleFavorite(bdsId, e)}
                 />
               );
            })}
          </div>
        ) : (
          <div className="text-center py-24 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
            <p className="text-slate-500 font-bold text-lg">
              {showFavorites ? "Anh chưa lưu tin yêu thích nào" : "Không tìm thấy sản phẩm phù hợp"}
            </p>
            <p className="text-sm text-slate-400 mt-2">Hãy thử thay đổi điều kiện tìm kiếm hoặc xem lại từ khóa nhé.</p>
          </div>
        )}
        
        {Math.ceil(filteredItems.length / itemsPerPage) > 1 && (
          <div className="flex justify-center flex-wrap gap-2 mt-16">
            {Array.from({ length: Math.ceil(filteredItems.length / itemsPerPage) }, (_, idx) => (
              <button 
                key={idx} 
                onClick={() => { 
                  setCurrentPage(idx + 1); 
                  document.getElementById("listing-section")?.scrollIntoView({ behavior: "smooth" }); 
                }}
                className={`w-10 h-10 rounded-xl font-bold transition-all ${
                  currentPage === idx + 1 ? "bg-orange-500 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:border-orange-300"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

// ==========================================
// 4. SUB-COMPONENT: THẺ SẢN PHẨM BĐS 
// ==========================================
function BdsCard({ item, rank, isFavorite, onToggleFavorite }: { item: any, rank?: number, isFavorite: boolean, onToggleFavorite: (e: React.MouseEvent) => void }) {
  const thumbnail = layUrlAnhChuan(item.anh);
  const displayLocation = item.khuVuc || item.diaChi || item.diaChiFull || item.khuVucFull || "Đà Nẵng";
  
  const soLuongAnhChinhXac = useMemo(() => countImages(item), [item]);
  const giaM2 = useMemo(() => calculateGiaM2(item), [item]);
  const { pn, wc } = useMemo(() => extractRooms(item), [item]);
  const tags = useMemo(() => parsePropertyTags(item), [item]);
  
  const dateInfo = useMemo(() => parseDateInfo(item.ngayDang || item.ngay || ""), [item]);

  return (
    <Link 
      href={`/nha-dat/${item.slug}`} 
      onClick={() => {
        document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important');
        setTimeout(() => document.documentElement.style.removeProperty('scroll-behavior'), 300);
      }}
      className="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-orange-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] block"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <Image src={thumbnail} alt={item.tieude || "Trần Huy Land"} fill className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out" sizes="(max-width: 1280px) 100vw" priority={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute top-2 left-0 flex flex-col items-start gap-1.5 z-10">
          {rank && <span className="bg-[#E03C31] text-white text-[11px] font-bold px-2.5 py-1 rounded-r shadow-sm tracking-wider uppercase">THL # {rank}</span>}
          {tags.isSapHam && <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 ml-2 rounded shadow-sm uppercase tracking-wider animate-pulse">🔥 Sập Hầm</span>}
          {tags.isChoThue && <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 ml-2 rounded shadow-sm uppercase tracking-wider">🔑 Cho Thuê</span>}
          {tags.isChinhChu && <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 ml-2 rounded shadow-sm uppercase tracking-wider">✓ Chính Chủ</span>}
          
          {tags.isNhaMatTien && <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 ml-2 rounded shadow-sm uppercase tracking-wider">🏢 Nhà Mặt Tiền</span>}
          {tags.isNhaKiet && <span className="bg-cyan-600 text-white text-[10px] font-bold px-2 py-0.5 ml-2 rounded shadow-sm uppercase tracking-wider">🛣️ Nhà Kiệt</span>}
          
          {tags.isDatNen && <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 ml-2 rounded shadow-sm uppercase tracking-wider">⛳ Đất Nền</span>}
          {tags.isDatMatTien && <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 ml-2 rounded shadow-sm uppercase tracking-wider">⛳ Đất Mặt Tiền</span>}
          {tags.isDatKiet && <span className="bg-cyan-500 text-white text-[10px] font-bold px-2 py-0.5 ml-2 rounded shadow-sm uppercase tracking-wider">⛳ Đất Kiệt</span>}
          
          {tags.isCanHo && <span className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 ml-2 rounded shadow-sm uppercase tracking-wider">🏢 Căn Hộ</span>}
        </div>

        <div className="absolute bottom-2 right-2 bg-slate-900/70 text-white text-[11px] font-medium px-2 py-1 rounded flex items-center gap-1.5 z-10 backdrop-blur-sm">
          <ImageIcon size={12} /><span>{soLuongAnhChinhXac}</span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow justify-between">
        <div>
          <h3 className="text-[#2C2C2C] font-bold text-[14px] sm:text-[15px] uppercase line-clamp-2 leading-snug mb-3 group-hover:text-orange-600 transition-colors duration-300 h-[2.6rem] sm:h-[2.8rem]">
            {item.tieude}
          </h3>
          <div className="flex flex-wrap items-center text-[14px] text-[#505050] mb-3 gap-x-2 gap-y-1">
            <span className="text-[#E03C31] font-bold text-[16px] whitespace-nowrap">{item.gia || "Thỏa thuận"}</span>
            {item.dienTich && <><span className="text-slate-300 text-[10px]">●</span><span className="whitespace-nowrap font-bold text-[#E03C31]">{item.dienTich}</span></>}
            {giaM2 && <><span className="text-slate-300 text-[10px]">●</span><span className="whitespace-nowrap font-medium text-[#777] text-[13px]">{giaM2}</span></>}
            {pn && <><span className="text-slate-300 text-[10px]">●</span><span className="flex items-center gap-1 whitespace-nowrap font-medium">{pn} <BedDouble size={14} className="text-slate-400" /></span></>}
            {wc && <><span className="text-slate-300 text-[10px]">●</span><span className="flex items-center gap-1 whitespace-nowrap font-medium">{wc} <Bath size={14} className="text-slate-400" /></span></>}
          </div>
          
          {/* 🔥 VÙNG HIỂN THỊ PHƯỜNG CHỮ MÀU ĐEN, IN THƯỜNG, TO RÕ */}
          <div className="flex items-center gap-1.5 text-[13px] sm:text-[14px] text-[#2C2C2C] mb-4">
            <MapPin size={15} className="text-slate-500 shrink-0" />
            <span className="truncate">{displayLocation}</span>
          </div>
        </div>

        <div className="mt-auto border-t border-slate-100 pt-3 flex items-center justify-between">
          
          {/* 🔥 KHU VỰC THỜI GIAN: BỎ TÊN NGƯỜI ĐĂNG, NGÀY ĐĂNG IN ĐẬM TO HƠN, CÁCH ĐÂY X NGÀY IN NGHIÊNG BÊN DƯỚI */}
          <div className="flex flex-col justify-center min-w-0 pr-2">
            <div className="flex items-center gap-1.5 text-[12px] sm:text-[13px] text-slate-800 font-bold truncate">
              <Clock size={13} strokeWidth={2} className="text-slate-600 shrink-0" />
              <span>Ngày đăng: {dateInfo.fullDate} {dateInfo.time && ` ${dateInfo.time}`}</span>
            </div>
            <span className="text-[11px] sm:text-[12px] text-slate-600 font-normal italic mt-0.5 truncate pl-[19px]">
              {dateInfo.relative}
            </span>
          </div>
          
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Nút Lưu Tin Thông Minh */}
            <button 
              className={`px-3 py-1.5 sm:px-4 border rounded-lg active:scale-95 transition-all shadow-sm flex items-center gap-1.5 ${
                isFavorite 
                  ? 'border-red-200 text-red-500 bg-red-50' 
                  : 'border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-300 hover:bg-red-50'
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleFavorite(e);
              }}
            >
              <Heart size={15} fill={isFavorite ? "currentColor" : "none"} className={isFavorite ? "scale-110 transition-transform" : "transition-transform"} />
              <span className="text-[11px] sm:text-[13px] font-bold whitespace-nowrap">
                {isFavorite ? 'Đã lưu' : 'Lưu tin +'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
