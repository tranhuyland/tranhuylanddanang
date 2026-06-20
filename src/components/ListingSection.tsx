'use client';

import React, { useState, useEffect, useMemo } from "react";
import { 
  SlidersHorizontal, Check, RotateCcw, X, Heart, 
  Map as MapIcon, List, ChevronLeft, ChevronRight, 
  ChevronsLeft, ChevronsRight, MoreHorizontal 
} from "lucide-react";
import FilterWidget from "./FilterWidget"; 
import MapView from "./MapView";
import BdsCard from "./BdsCard"; // Import component thẻ sản phẩm vừa tách
import { extractPriceInBillion, parsePropertyTags, removeAccents, generatePagination } from "@/lib/bdsHelpers"; // Import thuật toán từ file helpers

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
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  const itemsPerPage = 6;
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
    const handleOpenDrawer = () => { setTempFilters(filters); setIsDrawerOpen(true); };
    const handleSearch = (e: any) => { setSearchTerm(e.detail); setFilters(initialFilters); setTempFilters(initialFilters); setCurrentPage(1); };
    window.addEventListener('openFilterDrawer', handleOpenDrawer);
    window.addEventListener('searchBds', handleSearch);
    return () => {
      window.removeEventListener('openFilterDrawer', handleOpenDrawer);
      window.removeEventListener('searchBds', handleSearch);
    };
  }, [filters, initialFilters]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const newFavs = favoriteIds.includes(id) ? favoriteIds.filter(f => f !== id) : [...favoriteIds, id];
    setFavoriteIds(newFavs);
    localStorage.setItem('thl_favorites', JSON.stringify(newFavs));
  };

  const handleToggleShowFavorites = () => {
    setShowFavorites(!showFavorites);
    setCurrentPage(1);
    if (!showFavorites) { setFilters(initialFilters); setTempFilters(initialFilters); setActiveLoaiHinh("all"); }
  };

  const handleApplyFilters = () => {
    setFilters(tempFilters); setCurrentPage(1); setIsDrawerOpen(false);
    setTimeout(() => {
      const section = document.getElementById("listing-section");
      if (section) window.scrollTo({ top: section.getBoundingClientRect().top + window.scrollY - 100, behavior: 'smooth' });
    }, 50);
  };

  const handleResetFilters = () => {
    setTempFilters(initialFilters); setFilters(initialFilters); setActiveLoaiHinh("all"); setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    setTimeout(() => {
      const section = document.getElementById("listing-section");
      if (section) window.scrollTo({ top: section.getBoundingClientRect().top + window.scrollY - 100, behavior: 'smooth' });
    }, 10);
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
        const giaTy = extractPriceInBillion(i.gia, i.soGia);
        if (filters.khoangGia === "duoi3") return giaTy > 0 && giaTy < 3.0;
        if (filters.khoangGia === "3to5") return giaTy >= 3.0 && giaTy <= 5.0;
        return giaTy > 5.0;
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

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginationArray = generatePagination(currentPage, totalPages);

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
                  <button key={tab.id} aria-label={`Lọc theo ${tab.label}`}
                    onClick={() => { { setActiveLoaiHinh(tab.id); setShowFavorites(false); setFilters(initialFilters); setTempFilters(initialFilters); setCurrentPage(1); } }}
                    className={`flex-1 min-w-[80px] flex flex-col justify-center items-center py-4 px-2 transition-all relative ${index === 0 ? 'rounded-tl-[2rem] sm:rounded-none' : ''} ${isActive ? "text-orange-600 bg-white" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/80"}`}
                  >
                    <span className="whitespace-nowrap text-center text-[12px] min-[390px]:text-[13px] md:text-[15px] font-extrabold">{tab.label}</span>
                    <span className={`text-[10px] md:text-[11px] mt-0.5 font-semibold ${isActive ? "text-orange-600" : "text-slate-500"}`}>({currentCount})</span>
                    {isActive && <span className="absolute bottom-[-2px] left-0 w-full h-[3px] bg-gradient-to-r from-orange-500 to-red-600" />}
                  </button>
                );
              })}
              <button aria-label="Xem danh sách tin đã lưu" onClick={handleToggleShowFavorites}
                className={`hidden md:flex flex-1 sm:flex-none sm:px-8 flex-col justify-center items-center py-4 px-1 transition-all relative border-l-2 border-slate-100 ${showFavorites ? 'text-red-500 bg-white' : 'text-slate-500 hover:text-red-500 hover:bg-slate-100/80'}`}
              >
                <span className="whitespace-nowrap text-center text-[13px] min-[390px]:text-[14px] md:text-[16px] font-extrabold flex items-center gap-1.5">
                  <Heart size={16} fill={showFavorites ? "currentColor" : "none"} aria-hidden="true" /> Đã lưu
                </span>
                <span className={`text-[10px] md:text-[11px] mt-0.5 font-semibold ${showFavorites ? 'text-red-500' : 'text-slate-500'}`}>({isClient ? favoriteIds.length : 0})</span>
                {showFavorites && <span className="absolute bottom-[-2px] left-0 w-full h-[3px] bg-red-500" /> }
              </button>
            </div>

            <div className="px-4 sm:px-8">
              <div className="md:hidden flex gap-2 mb-2">
                <button aria-label="Mở bộ lọc nâng cao" onClick={() => { setTempFilters(filters); setIsDrawerOpen(true); }}
                  className="flex-1 flex items-center justify-center gap-2 bg-orange-50/50 text-orange-600 px-4 py-3 rounded-2xl text-sm font-bold border border-orange-100 transition-all active:scale-95"
                >
                  <SlidersHorizontal size={18} aria-hidden="true" /> Bộ lọc chi tiết 
                  {activeFiltersCount > 0 && <span className="bg-red-500 text-white w-5 h-5 rounded-full text-[10px] flex items-center justify-center shadow-md">{activeFiltersCount}</span>}
                </button>
                <button aria-label="Xem tin đã lưu" onClick={handleToggleShowFavorites}
                  className={`flex flex-col items-center justify-center px-4 py-2 rounded-2xl text-sm font-bold border transition-all active:scale-95 ${showFavorites ? 'bg-red-500 text-white border-red-500 shadow-md shadow-red-500/30' : 'bg-red-50 text-red-500 border-red-100'}`}
                >
                  <Heart size={20} fill={showFavorites ? "currentColor" : "none"} className={showFavorites ? "text-white" : "text-red-500"} aria-hidden="true" />
                  <span className="text-[11px] mt-0.5 whitespace-nowrap">Đã lưu ({isClient ? favoriteIds.length : 0})</span>
                </button>
              </div>

              {activeFiltersCount > 0 && !showFavorites && (
                <button aria-label="Hủy toàn bộ bộ lọc" onClick={handleResetFilters}
                  className="md:hidden w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-2xl text-sm font-bold border border-red-100 transition-all active:scale-95 mb-2"
                >
                  <X size={18} aria-hidden="true" /> Hủy bỏ bộ lọc đang áp dụng
                </button>
              )}

              <FilterWidget 
                tempFilters={tempFilters} handleFilterChange={(k: string, v: string) => setTempFilters(p => ({...p, [k]: v}))} 
                forceDistrict={forceDistrict} isDrawerOpen={isDrawerOpen} closeDrawer={() => setIsDrawerOpen(false)}
                handleResetFilters={handleResetFilters} handleApplyFilters={handleApplyFilters}
              />

              <div className="hidden md:flex items-center justify-between border-t border-slate-100 pt-6 mt-6">
                <div className="text-xs text-slate-500 font-medium italic">* Vui lòng chọn các tiêu chí trên và nhấn Tìm kiếm.</div>
                <div className="flex items-center gap-3">
                  {activeFiltersCount > 0 && (
                    <button onClick={handleResetFilters} aria-label="Xóa bộ lọc" className="text-sm font-bold text-slate-500 hover:text-red-500 px-5 py-3 rounded-xl hover:bg-red-50">
                      <RotateCcw size={16} className="inline mr-2" aria-hidden="true" />Xóa lọc
                    </button>
                  )}
                  <button onClick={handleApplyFilters} aria-label="Tìm kiếm ngay" className="bg-gradient-to-r from-orange-500 to-red-600 text-white font-extrabold text-sm px-8 py-3.5 rounded-xl shadow-lg hover:scale-[1.02] transition-all">
                    <Check size={16} className="inline mr-2" aria-hidden="true" />Tìm kiếm ngay
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main id="listing-section" className="max-w-7xl mx-auto w-full px-4 mt-8 mb-20 scroll-mt-28 min-h-[80vh]">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-lg md:text-xl font-bold text-slate-800">
            Tìm thấy <span className="text-orange-600">{filteredItems.length}</span> bất động sản phù hợp
          </h2>
          <div className="bg-white p-1 rounded-xl border border-slate-200 inline-flex shadow-sm">
            <button aria-label="Xem dạng danh sách" onClick={() => setViewMode("list")} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${viewMode === "list" ? "bg-orange-50 text-orange-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
              <List className="w-4 h-4" aria-hidden="true" /> Danh sách
            </button>
            <button aria-label="Xem dạng bản đồ" onClick={() => setViewMode("map")} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${viewMode === "map" ? "bg-orange-50 text-orange-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
              <MapIcon className="w-4 h-4" aria-hidden="true" /> Bản đồ
            </button>
          </div>
        </div>

        {filteredItems.length > 0 ? (
          viewMode === "list" ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
                {filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item, index) => {
                   const bdsId = item.id?.toString() || item.slug;
                   return (
                     <BdsCard key={bdsId} item={item} rank={(currentPage - 1) * itemsPerPage + index + 1} 
                       isFavorite={favoriteIds.includes(bdsId)} onToggleFavorite={(e: React.MouseEvent) => toggleFavorite(bdsId, e)}
                     />
                   );
                })}
              </div>
              {totalPages > 1 && (
                <div className="flex flex-wrap justify-center items-center gap-1.5 sm:gap-2 mt-12 sm:mt-16">
                  <button onClick={() => handlePageChange(1)} disabled={currentPage === 1} aria-label="Trang đầu" 
                    className={`hidden sm:flex items-center justify-center px-3 h-10 rounded-xl font-bold transition-all ${currentPage === 1 ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-600 shadow-sm active:scale-95'}`}
                  >
                    <ChevronsLeft size={18} />
                  </button>
                  <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} aria-label="Trang trước" 
                    className={`flex items-center justify-center gap-1 px-3 sm:px-4 h-10 rounded-xl font-bold transition-all ${currentPage === 1 ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-600 shadow-sm active:scale-95'}`}
                  >
                    <ChevronLeft size={16} strokeWidth={2.5} /> <span className="text-[13px] hidden min-[390px]:inline">Trước</span>
                  </button>
                  {paginationArray.map((page, idx) => (
                    page === '...' ? (
                      <div key={`dots-${idx}`} className="w-8 h-10 flex items-center justify-center text-slate-400">
                        <MoreHorizontal size={18} />
                      </div>
                    ) : (
                      <button key={idx} aria-label={`Trang ${page}`} onClick={() => handlePageChange(page as number)} 
                        className={`min-w-[40px] px-1 h-10 rounded-xl font-bold text-sm transition-all ${currentPage === page ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md shadow-orange-500/30" : "bg-white border border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-600 active:scale-95"}`}
                      >
                        {page}
                      </button>
                    )
                  ))}
                  <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} aria-label="Trang sau" 
                    className={`flex items-center justify-center gap-1 px-3 sm:px-4 h-10 rounded-xl font-bold transition-all ${currentPage === totalPages ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-600 shadow-sm active:scale-95'}`}
                  >
                     <span className="text-[13px] hidden min-[390px]:inline">Sau</span> <ChevronRight size={16} strokeWidth={2.5} />
                  </button>
                  <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} aria-label="Trang cuối" 
                    className={`hidden sm:flex items-center justify-center px-3 h-10 rounded-xl font-bold transition-all ${currentPage === totalPages ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-600 shadow-sm active:scale-95'}`}
                  >
                    <ChevronsRight size={18} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="animate-in fade-in zoom-in-95 duration-500 rounded-[2rem] overflow-hidden border-2 border-slate-200 shadow-xl w-full">
              <MapView bdsList={filteredItems} />
            </div>
          )
        ) : (
          <div className="text-center py-24 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
            <p className="text-slate-500 font-bold text-lg">{showFavorites ? "Anh chưa lưu tin yêu thích nào" : "Không tìm thấy sản phẩm phù hợp"}</p>
            <p className="text-sm text-slate-400 mt-2">Hãy thử thay đổi điều kiện tìm kiếm hoặc xem lại từ khóa nhé.</p>
          </div>
        )}
      </main>
    </>
  );
}
