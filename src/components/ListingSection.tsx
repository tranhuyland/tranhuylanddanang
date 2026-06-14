'use client';
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Compass, Clock, Square, ChevronRight, BedDouble, SlidersHorizontal, Check, RotateCcw, X, Phone, Heart, ImageIcon, Bath } from "lucide-react";
import { layUrlAnhChuan } from "@/lib/utils"; 
import FilterWidget from "./FilterWidget"; 

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

// ==========================================
// 🛠️ CÁC HÀM TIỆN ÍCH (HELPERS) ĐỘC LẬP
// ==========================================

const removeAccents = (str: string) => {
  if (!str) return "";
  return str.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").trim();
};

const formatTimeAgo = (dateStr: string) => {
  if (!dateStr) return "Tin mới";
  const parts = dateStr.split(/[-/]/);
  if (parts.length !== 3) return "Hôm nay";
  const day = parseInt(parts[0], 10), month = parseInt(parts[1], 10) - 1, year = parseInt(parts[2], 10);
  const diffDays = Math.floor((new Date().setHours(0, 0, 0, 0) - new Date(year, month, day).setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24));
  return diffDays <= 0 ? "Hôm nay" : diffDays === 1 ? "1 ngày trước" : diffDays < 7 ? `${diffDays} ngày trước` : `${Math.floor(diffDays / 7)} tuần trước`;
};

const parsePropertyTags = (item: any) => {
  const textLower = removeAccents(`${item.tieude || ""} ${item.mota || item.moTa || ""} ${item.tag || ""} ${item.loaiHinh || ""}`);
  const isChinhChu = textLower.includes("chinh chu");
  const isSapHam = textLower.includes("sap ham") || textLower.includes("gia re");

  const strictTextChoThue = removeAccents(`${item.tieude || ""} ${item.tag || ""} ${item.loaiHinh || item.phân_loại || ""}`);
  const isChoThue = strictTextChoThue.includes("cho thue");

  const strictTextViTri = removeAccents(`${item.tieude || ""} ${item.tag || ""} ${item.loaiHinh || item.phân_loại || ""}`);
  const isMatTienFake = strictTextViTri.includes("cach mat tien") || strictTextViTri.includes("sau lung can mat tien") || strictTextViTri.includes("sau lung mat tien") || strictTextViTri.includes("sau mat tien") || strictTextViTri.includes("gan mat tien");
  const isKietHem = strictTextViTri.includes("kiet") || strictTextViTri.includes("hem") || isMatTienFake;
  const isMatTien = strictTextViTri.includes("mat tien") && !isKietHem;

  return { isChinhChu, isSapHam, isChoThue, isKietHem, isMatTien };
};

const countImages = (item: any) => {
  if (item.soLuongAnh) return item.soLuongAnh; 
  if (typeof item.anh === 'string') {
    const links = item.anh.split(/[\n,]/).filter((link: string) => link.trim() !== '');
    return links.length > 0 ? links.length : 1;
  }
  if (Array.isArray(item.anh)) return item.anh.length;
  return 1;
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
            if (match) {
                giaTriTrieu = parseFloat(match[1].replace(/,/g, '.'));
            }
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

const extractRooms = (item: any) => {
  const currentLoaiHinh = item.phân_loại || item.loaiHinh || '';
  if (removeAccents(currentLoaiHinh).includes("dat")) return { pn: null, wc: null }; 
  
  const combinedText = `${item.tieude || ""} ${item.mota || item.moTa || ""}`.toLowerCase();
  const matchPhong = combinedText.match(/(\d+)\s*(pn|phòng ngủ|phong ngu)/i);
  const matchWC = combinedText.match(/(\d+)\s*(wc|phòng tắm|phong tam|nha ve sinh)/i);
  
  return {
    pn: matchPhong ? matchPhong[1] : null,
    wc: matchWC ? matchWC[1] : null
  };
};

// ==========================================
// 🏢 COMPONENT CHÍNH: BỘ LỌC DANH SÁCH SẢN PHẨM
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

  const handleFilterChange = (key: string, value: string) => setTempFilters(prev => ({ ...prev, [key]: value }));

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem("thl_favorites");
    if (saved) {
      try { setFavoriteIds(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    let newFavs;
    if (favoriteIds.includes(id)) {
      newFavs = favoriteIds.filter(f => f !== id);
    } else {
      newFavs = [...favoriteIds, id];
    }
    setFavoriteIds(newFavs);
    localStorage.setItem('thl_favorites', JSON.stringify(newFavs));
  };

  const handleToggleShowFavorites = () => {
    const nextVal = !showFavorites;
    setShowFavorites(nextVal);
    setCurrentPage(1);
    if (nextVal) {
      setFilters(initialFilters);
      setTempFilters(initialFilters);
      setActiveLoaiHinh("all");
    }
  };

  useEffect(() => {
    const handleOpenDrawer = () => {
      setTempFilters(filters);
      setIsDrawerOpen(true);
    };
    
    const handleSearch = (e: any) => {
      setSearchTerm(e.detail);
      const resetState = { khuVuc: forceDistrict || "all", khoangGia: "all", huong: "all", tag: "all" };
      setFilters(resetState);
      setTempFilters(resetState);
      setCurrentPage(1); 
    };

    window.addEventListener('openFilterDrawer', handleOpenDrawer);
    window.addEventListener('searchBds', handleSearch);

    return () => {
      window.removeEventListener('openFilterDrawer', handleOpenDrawer);
      window.removeEventListener('searchBds', handleSearch);
    };
  }, [filters, forceDistrict]);

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

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: safeBdsItems.length,
      "Đất nền": 0,
      "Nhà phố": 0,
      "Cho thuê": 0,
    };

    safeBdsItems.forEach((i: any) => {
      if (!i) return;
      const searchStr = removeAccents(`${i.phanLoai || ""} ${i.loaiHinh || ""} ${i.tieude || ""}`);
      if (searchStr.includes(removeAccents("Đất nền"))) counts["Đất nền"]++;
      if (searchStr.includes(removeAccents("Nhà phố"))) counts["Nhà phố"]++;
      if (searchStr.includes(removeAccents("Cho thuê"))) counts["Cho thuê"]++;
    });

    return counts;
  }, [safeBdsItems]);

  const filteredItems = useMemo(() => {
    let result = [...safeBdsItems];

    if (showFavorites) {
      result = result.filter(i => favoriteIds.includes(i.id?.toString() || i.slug));
    }

    result.sort((a: any, b: any) => {
      const getTime = (d: string) => {
        if (!d) return 0;
        const parts = d.split(/[-/]/);
        if (parts.length < 3) return 0;
        return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])).getTime();
      };
      const timeDiff = getTime(b.ngayDang || b.ngay) - getTime(a.ngayDang || a.ngay);
      return timeDiff !== 0 ? timeDiff : (Number(b.id) || 0) - (Number(a.id) || 0);
    });

    if (searchTerm) {
      const target = removeAccents(searchTerm);
      result = result.filter(i => {
        const fullText = removeAccents(`${i.tieude || ""} ${i.diaChi || ""} ${i.diaChiFull || ""} ${i.khuVuc || ""} ${i.khuVucFull || ""} ${i.mota || ""} ${i.moTa || ""} ${i.phuong || ""}`);
        return fullText.includes(target);
      });
    }

    if (filters.khuVuc !== "all") {
      const target = removeAccents(filters.khuVuc);
      result = result.filter(i => removeAccents(`${i.diaChi || ""} ${i.diaChiFull || ""} ${i.khuVuc || ""}`).includes(target));
    }
    
    if (!showFavorites && activeLoaiHinh !== "all") {
      const target = removeAccents(activeLoaiHinh);
      result = result.filter(i => removeAccents(`${i.phanLoai || ""} ${i.loaiHinh || ""} ${i.tieude || ""}`).includes(target));
    }
    
    if (filters.khoangGia !== "all") {
      result = result.filter(i => {
        const gia = Number(i.soGia) || (i.gia ? parseFloat(i.gia.replace(/[^0-9.]/g, "")) : 0);
        return filters.khoangGia === "duoi3" ? gia < 3.0 : filters.khoangGia === "3to5" ? gia >= 3.0 && gia <= 5.0 : gia > 5.0;
      });
    }
    
    if (filters.huong !== "all") result = result.filter(i => removeAccents(i.huong || "").includes(removeAccents(filters.huong)));
    
    if (filters.tag !== "all") {
      result = result.filter(i => {
        const tags = parsePropertyTags(i);
        if (filters.tag === "mattien") return i.isMatTien || tags.isMatTien;
        if (filters.tag === "chinhchu") return tags.isChinhChu;
        if (filters.tag === "chothue") return tags.isChoThue;
        return true;
      });
    }
    
    return result;
  }, [filters, activeLoaiHinh, searchTerm, safeBdsItems, showFavorites, favoriteIds]);

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setCurrentPage(1);
    closeDrawer();
    setTimeout(() => document.getElementById("listing-section")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const handleResetFilters = () => {
    const resetState = { ...initialFilters, khuVuc: forceDistrict || "all" };
    setTempFilters(resetState); 
    setFilters(resetState); 
    setActiveLoaiHinh("all"); 
    setCurrentPage(1);
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== "all").length;

  return (
    <>
      <section className="w-full relative z-10 -mt-6 sm:-mt-10">
        <div className="bg-white w-full shadow-lg border-b border-slate-200 rounded-t-[2rem] sm:rounded-none pb-6">
          <div className="max-w-7xl mx-auto">
            
            <div className="flex w-full items-stretch mb-6 border-b-2 border-slate-100 bg-slate-50 rounded-t-[2rem] sm:rounded-none overflow-hidden">
              {TAB_OPTIONS.map((tab, index) => {
                const currentCount = tab.id === "all" ? tabCounts.all : tabCounts[tab.id as keyof typeof tabCounts] || 0;
                const isFirst = index === 0;
                
                return (
                  <button 
                    key={tab.id} 
                    onClick={() => { 
                      setActiveLoaiHinh(tab.id); 
                      setShowFavorites(false); 
                      const resetState = { khuVuc: forceDistrict || "all", khoangGia: "all", huong: "all", tag: "all" };
                      setFilters(resetState);
                      setTempFilters(resetState);
                      setCurrentPage(1); 
                    }}
                    className={`flex-1 flex flex-col justify-center items-center py-4 px-1 transition-all relative ${isFirst ? 'rounded-tl-[2rem] sm:rounded-none' : ''} ${
                      !showFavorites && activeLoaiHinh === tab.id 
                        ? "text-orange-600 bg-white" 
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/80"
                    }`}
                  >
                    <span className="whitespace-nowrap text-center text-[13px] min-[390px]:text-[14px] md:text-[16px] font-extrabold">
                      {tab.label}
                    </span>
                    <span className={`text-[10px] md:text-[11px] mt-0.5 font-semibold ${!showFavorites && activeLoaiHinh === tab.id ? "text-orange-500" : "text-slate-400"}`}>
                      ({currentCount} SP)
                    </span>
                    {!showFavorites && activeLoaiHinh === tab.id && (
                      <span className="absolute bottom-[-2px] left-0 w-full h-[3px] bg-gradient-to-r from-orange-500 to-red-600" />
                    )}
                  </button>
                );
              })}

              <button 
                onClick={handleToggleShowFavorites}
                className={`hidden sm:flex flex-1 sm:flex-none sm:px-8 flex-col justify-center items-center py-4 px-1 transition-all relative border-l-2 border-slate-100 ${showFavorites ? 'text-red-500 bg-white' : 'text-slate-500 hover:text-red-500 hover:bg-slate-100/80'}`}
              >
                <span className="whitespace-nowrap text-center text-[13px] min-[390px]:text-[14px] md:text-[16px] font-extrabold flex items-center gap-1.5">
                  <Heart size={16} fill={showFavorites ? "currentColor" : "none"} /> Đã lưu
                </span>
                <span className={`text-[10px] md:text-[11px] mt-0.5 font-semibold ${showFavorites ? 'text-red-400' : 'text-slate-400'}`}>
                  ({isClient ? favoriteIds.length : 0} SP)
                </span>
                {showFavorites && <span className="absolute bottom-[-2px] left-0 w-full h-[3px] bg-red-500" /> }
              </button>
            </div>

            <div className="px-4 sm:px-8">
              <div className="md:hidden flex gap-2 mb-2">
                <button onClick={() => { setTempFilters(filters); setIsDrawerOpen(true); }}
                  className="flex-1 flex items-center justify-center gap-2 bg-orange-50/50 text-orange-600 px-4 py-3 rounded-2xl text-sm font-bold border border-orange-100 transition-all active:scale-95">
                  <SlidersHorizontal size={18} />
                  Bộ lọc chi tiết 
                  {activeFiltersCount > 0 && (
                    <span className="bg-red-500 text-white w-5 h-5 rounded-full text-[10px] flex items-center justify-center shadow-md">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
                
                <button onClick={handleToggleShowFavorites}
                  className={`flex flex-col items-center justify-center px-4 py-2 rounded-2xl text-sm font-bold border transition-all active:scale-95 ${showFavorites ? 'bg-red-500 text-white border-red-500 shadow-md shadow-red-500/30' : 'bg-red-50 text-red-500 border-red-100'}`}>
                  <Heart size={20} fill={showFavorites ? "currentColor" : "none"} className={showFavorites ? "text-white" : "text-red-500"} />
                  <span className="text-[11px] mt-0.5 whitespace-nowrap">Đã lưu ({isClient ? favoriteIds.length : 0})</span>
                </button>
              </div>

              {activeFiltersCount > 0 && !showFavorites && (
                <button onClick={handleResetFilters}
                  className="md:hidden w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-2xl text-sm font-bold border border-red-100 transition-all active:scale-95 mb-2">
                  <X size={18} /> Hủy bỏ bộ lọc đang áp dụng
                </button>
              )}

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
                  {activeFiltersCount > 0 && <button onClick={handleResetFilters} className="text-sm font-bold text-slate-500 hover:text-red-500 px-5 py-3 rounded-xl hover:bg-red-50"><RotateCcw size={16} className="inline mr-2" />Xóa lọc</button>}
                  <button onClick={handleApplyFilters} className="bg-gradient-to-r from-orange-500 to-red-600 text-white font-extrabold text-sm px-8 py-3.5 rounded-xl shadow-lg hover:scale-[1.02] transition-all"><Check size={16} className="inline mr-2" />Tìm kiếm ngay</button>
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
            <p className="text-sm text-slate-400 mt-2">
              {showFavorites ? "Hãy bấm vào biểu tượng trái tim (❤️) trên sản phẩm để lưu lại nhé!" : "Thử bỏ bớt dấu hoặc gõ từ khóa ngắn hơn xem sao anh nhé."}
            </p>
          </div>
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


// ==========================================
// 🏡 SUB-COMPONENT: THẺ SẢN PHẨM BĐS 
// ==========================================

function BdsCard({ item, rank, isFavorite, onToggleFavorite }: { item: any, rank?: number, isFavorite: boolean, onToggleFavorite: (e: React.MouseEvent) => void }) {
  const thumbnail = layUrlAnhChuan(item.anh);
  const displayLocation = item.khuVuc || item.diaChi || item.diaChiFull || item.khuVucFull || "Đà Nẵng";
  const displayTime = item.ngayDang || item.ngay || "";

  const soLuongAnhChinhXac = useMemo(() => countImages(item), [item]);
  const giaM2 = useMemo(() => calculateGiaM2(item), [item]);
  const { pn, wc } = useMemo(() => extractRooms(item), [item]);
  const { isChinhChu, isSapHam, isChoThue, isMatTien, isKietHem } = useMemo(() => parsePropertyTags(item), [item]);

  return (
    <Link 
      href={`/nha-dat/${item.slug}`} 
      className="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-orange-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col h-full block transform hover:-translate-y-1 active:translate-y-0 active:scale-[0.98]"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <Image 
          src={thumbnail} 
          alt={item.tieude || "Trần Huy Land"} 
          fill 
          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
          sizes="(max-width: 1280px) 100vw" 
          priority={false} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute top-2 left-0 flex flex-col items-start gap-1.5 z-10">
          {rank && <span className="bg-[#E03C31] text-white text-[11px] font-bold px-2.5 py-1 rounded-r shadow-sm tracking-wider uppercase">VIP {rank}</span>}
          {isSapHam && <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 ml-2 rounded shadow-sm uppercase tracking-wider animate-pulse">🔥 Sập Hầm</span>}
          {isChoThue && <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 ml-2 rounded shadow-sm uppercase tracking-wider">🔑 Cho Thuê</span>}
          {isChinhChu && <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 ml-2 rounded shadow-sm uppercase tracking-wider">✓ Chính Chủ</span>}
          {isMatTien && <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 ml-2 rounded shadow-sm uppercase tracking-wider">🏢 Mặt Tiền</span>}
          {isKietHem && <span className="bg-cyan-600 text-white text-[10px] font-bold px-2 py-0.5 ml-2 rounded shadow-sm uppercase tracking-wider">🛣️ Kiệt/Hẻm</span>}
        </div>

        <div className="absolute bottom-2 right-2 bg-slate-900/70 text-white text-[11px] font-medium px-2 py-1 rounded flex items-center gap-1.5 z-10 backdrop-blur-sm">
          <ImageIcon size={12} />
          <span>{soLuongAnhChinhXac}</span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow justify-between">
        <div>
          <h3 className="text-[#2C2C2C] font-bold text-[14px] sm:text-[15px] uppercase line-clamp-2 leading-snug mb-3 group-hover:text-orange-600 transition-colors duration-300 h-[2.6rem] sm:h-[2.8rem]">
            {item.tieude}
          </h3>

          <div className="flex flex-wrap items-center text-[14px] text-[#505050] mb-3 gap-x-2 gap-y-1">
            <span className="text-[#E03C31] font-bold text-[16px] whitespace-nowrap">
              {item.gia || "Thỏa thuận"}
            </span>

            {item.dienTich && (
              <>
                <span className="text-slate-300 text-[10px]">●</span>
                <span className="whitespace-nowrap font-bold text-[#E03C31]">{item.dienTich}</span>
              </>
            )}
            
            {giaM2 && (
              <>
                <span className="text-slate-300 text-[10px]">●</span>
                <span className="whitespace-nowrap font-medium text-[#777] text-[13px]">{giaM2}</span>
              </>
            )}

            {pn && (
              <>
                <span className="text-slate-300 text-[10px]">●</span>
                <span className="flex items-center gap-1 whitespace-nowrap font-medium">
                  {pn} <BedDouble size={14} className="text-slate-400" />
                </span>
              </>
            )}

            {wc && (
              <>
                <span className="text-slate-300 text-[10px]">●</span>
                <span className="flex items-center gap-1 whitespace-nowrap font-medium">
                  {wc} <Bath size={14} className="text-slate-400" />
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[13px] text-[#666] mb-4">
            <MapPin size={14} className="text-slate-400 shrink-0" />
            <span className="truncate">{displayLocation}</span>
          </div>
        </div>

        <div className="mt-auto border-t border-slate-100 pt-3 flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-[50%]">
            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center shrink-0 border border-slate-200">
              <img 
                src="https://tranhuyland.vn/logo.png" 
                alt="Trần Huy Land"
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=TH&background=random&color=fff&bold=true'; }}
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[12px] font-bold text-[#2C2C2C] truncate">Trần Huy Land</span>
              <span className="text-[11px] text-[#999] truncate">{formatTimeAgo(displayTime)}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 pl-1">
            <button 
              className="bg-[#009177] text-white text-[12px] sm:text-[13px] font-bold px-2.5 py-1.5 rounded flex items-center gap-1.5 hover:bg-[#007a64] active:scale-95 transition-all shadow-sm"
              onClick={(e) => { 
                e.preventDefault(); 
                window.location.href = 'tel:0905778852'; 
              }}
            >
              <Phone size={13} className="fill-current" />
              <span className="hidden min-[380px]:inline">0905 778 852</span>
              <span className="min-[380px]:hidden">Gọi</span>
            </button>
            
            <button 
              className={`p-1.5 border rounded active:scale-95 transition-all shadow-sm ${isFavorite ? 'border-red-200 text-red-500 bg-red-50' : 'border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-500 hover:bg-red-50'}`}
              onClick={onToggleFavorite}
            >
              <Heart size={15} fill={isFavorite ? "currentColor" : "none"} className={isFavorite ? "animate-pulse" : ""} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
