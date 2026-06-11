'use client';
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { MapPin, Compass, Clock, Square, ChevronRight, BedDouble, SlidersHorizontal, X, Check, RotateCcw } from "lucide-react";

// ==========================================
// 1. CẤU HÌNH INTERFACE & BIẾN TĨNH (CONSTANTS)
// ==========================================
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

const PHUONG_XA = {
  phuong: ["Hải Châu", "Hòa Cường", "Thanh Khê", "An Khê", "An Hải", "Sơn Trà", "Ngũ Hành Sơn", "Hòa Khánh", "Hải Vân", "Liên Chiểu", "Cẩm Lệ", "Hòa Xuân", "Hòa Vang", "Bà Nà", "Hòa Tiến", "Hòa Phước"],
  xa: ["Hòa Bắc", "Hòa Liên", "Hòa Ninh"]
};

// ==========================================
// 2. CÁC HÀM TIỆN ÍCH (HELPERS)
// ==========================================
const cleanVietnameseText = (str: string) => {
  if (!str) return "";
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").trim();
};

const formatTimeAgo = (dateStr: string) => {
  if (!dateStr) return "Tin mới";
  const parts = dateStr.split(/[-/]/);
  if (parts.length !== 3) return "Hôm nay";
  const day = parseInt(parts[0], 10), month = parseInt(parts[1], 10) - 1, year = parseInt(parts[2], 10);
  const diffDays = Math.floor((new Date().setHours(0, 0, 0, 0) - new Date(year, month, day).setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24));
  return diffDays <= 0 ? "Hôm nay" : diffDays === 1 ? "1 ngày trước" : diffDays < 7 ? `${diffDays} ngày trước` : `${Math.floor(diffDays / 7)} tuần trước`;
};

const layUrlAnhChuan = (chuoiAnh: string) => {
  if (!chuoiAnh) return 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80';
  const danhSach = chuoiAnh.split(",").map(a => a.trim()).filter(a => a.startsWith("http"));
  return danhSach.length > 0 ? danhSach[0] : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80';
};

// ==========================================
// 3. COMPONENT CON LỌC DỮ LIỆU
// ==========================================
const FilterFields = ({ tempFilters, handleFilterChange, forceDistrict }: any) => (
  <>
    <div className="space-y-2">
      <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest pl-1">Phường / Xã</label>
      <select disabled={!!forceDistrict} value={tempFilters.khuVuc} onChange={(e) => handleFilterChange('khuVuc', e.target.value)} className="w-full bg-slate-50/80 border border-slate-200 hover:border-orange-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none transition-all duration-200 cursor-pointer appearance-none shadow-sm">
        <option value="all">Tất cả Vị trí</option>
        <option disabled className="font-bold text-slate-400 bg-slate-100">-- Danh sách Phường --</option>
        {PHUONG_XA.phuong.map(p => <option key={p} value={p}>{p}</option>)}
        <option disabled className="font-bold text-slate-400 bg-slate-100">-- Danh sách Xã --</option>
        {PHUONG_XA.xa.map(x => <option key={x} value={x}>{x}</option>)}
      </select>
    </div>
    <div className="space-y-2">
      <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest pl-1">Khoảng Giá</label>
      <select value={tempFilters.khoangGia} onChange={(e) => handleFilterChange('khoangGia', e.target.value)} className="w-full bg-slate-50/80 border border-slate-200 hover:border-orange-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none transition-all duration-200 cursor-pointer appearance-none shadow-sm">
        <option value="all">Tất cả mức giá</option>
        <option value="duoi3">Dưới 3 Tỷ</option>
        <option value="3to5">Từ 3 - 5 Tỷ</option>
        <option value="tren5">Trên 5 Tỷ</option>
      </select>
    </div>
    <div className="space-y-2">
      <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest pl-1">Hướng Nhà</label>
      <select value={tempFilters.huong} onChange={(e) => handleFilterChange('huong', e.target.value)} className="w-full bg-slate-50/80 border border-slate-200 hover:border-orange-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none transition-all duration-200 cursor-pointer appearance-none shadow-sm">
        <option value="all">Tất cả các hướng</option>
        {["Đông", "Tây", "Nam", "Bắc"].map(h => <option key={h} value={h}>Hướng {h}</option>)}
      </select>
    </div>
    <div className="space-y-2">
      <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest pl-1">Nhóm Đặc Quyền</label>
      <select value={tempFilters.tag} onChange={(e) => handleFilterChange('tag', e.target.value)} className="w-full bg-slate-50/80 border border-slate-200 hover:border-orange-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none transition-all duration-200 cursor-pointer appearance-none shadow-sm">
        <option value="all">Tất cả phân nhóm</option>
        <option value="mattien">🏢 Mặt Tiền Kinh Doanh</option>
        <option value="chinhchu">✓ Hàng Chính Chủ</option>
        <option value="chothue">🔑 Nhà Cho Thuê</option>
      </select>
    </div>
  </>
);

// ==========================================
// 4. COMPONENT CHÍNH
// ==========================================
export default function ListingSection({ allBdsItems = [], forceDistrict }: ListingSectionProps) {
  const safeBdsItems = Array.isArray(allBdsItems) ? allBdsItems : [];
  const initialFilters = { khuVuc: forceDistrict || "all", khoangGia: "all", huong: "all", tag: "all" };
  
  const [filters, setFilters] = useState(initialFilters);
  const [tempFilters, setTempFilters] = useState(initialFilters);
  const [activeLoaiHinh, setActiveLoaiHinh] = useState("all");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  const handleFilterChange = (key: string, value: string) => setTempFilters(prev => ({ ...prev, [key]: value }));

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

  // Back button handling
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
  }, [filters, activeLoaiHinh, safeBdsItems]);

  const activeFiltersCount = Object.keys(filters).reduce((acc, key) => 
    filters[key as keyof typeof filters] !== "all" ? acc + 1 : acc, 0
  );

  const currentItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

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
      <section className="max-w-7xl mx-auto w-full px-4 -mt-8 relative z-10">
        <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40">
          
          <div className="flex w-full justify-between items-center gap-2 sm:gap-4 border-b-2 border-slate-100 mb-8 pb-0">
            {TAB_OPTIONS.map(tab => (
              <button 
                key={tab.id}
                onClick={() => { setActiveLoaiHinh(tab.id); setCurrentPage(1); }}
                className={`flex-1 flex justify-center whitespace-nowrap text-center py-4 sm:py-5 px-1 text-[14px] min-[390px]:text-[15px] md:text-[17px] font-extrabold transition-all duration-300 relative rounded-t-2xl ${
                  activeLoaiHinh === tab.id 
                    ? "text-orange-600 bg-orange-50/80" 
                    : "text-slate-400 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                {tab.label}
                {activeLoaiHinh === tab.id && (
                  <span className="absolute bottom-[-2px] left-[10%] w-[80%] h-[4px] bg-gradient-to-r from-orange-500 to-red-600 rounded-t-full shadow-sm shadow-orange-500/50" />
                )}
              </button>
            ))}
          </div>

          <button 
            onClick={() => { setTempFilters(filters); setIsDrawerOpen(true); }}
            className="md:hidden w-full mb-4 flex items-center justify-center gap-3 bg-orange-50/80 text-orange-600 px-6 py-5 rounded-2xl text-base font-extrabold border border-orange-200 hover:bg-orange-100 active:scale-[0.98] transition-all duration-200 shadow-sm"
          >
            <SlidersHorizontal size={20} />
            Mở bộ lọc chi tiết {activeFiltersCount > 0 && <span className="bg-red-500 text-white w-6 h-6 rounded-full text-[11px] flex items-center justify-center shadow-md shadow-red-500/40">{activeFiltersCount}</span>}
          </button>

          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FilterFields tempFilters={tempFilters} handleFilterChange={handleFilterChange} forceDistrict={forceDistrict} />
          </div>

          <div className="hidden md:flex items-center justify-between border-t border-slate-100 pt-8 mt-8">
            <div className="text-sm text-slate-400 font-medium italic">* Vui lòng chọn các tiêu chí trên và nhấn Tìm kiếm.</div>
            <div className="flex items-center gap-4">
              {Object.values(filters).some(v => v !== "all") && (
                <button onClick={handleResetFilters} className="flex items-center gap-2 text-[15px] font-extrabold text-slate-500 hover:text-red-500 px-6 py-3.5 rounded-xl hover:bg-red-50 transition-colors">
                  <RotateCcw size={18} />Xóa lọc
                </button>
              )}
              <button onClick={handleApplyFilters} className="bg-gradient-to-r from-orange-500 to-red-600 text-white font-extrabold text-[15px] px-10 py-4 rounded-2xl shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 flex items-center gap-2">
                <Check size={20} />Tìm kiếm ngay
              </button>
            </div>
          </div>
        </div>
      </section>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md transition-opacity duration-300" onClick={closeDrawer} />
          <div className="relative bg-white rounded-t-[2.5rem] shadow-2xl h-[85vh] flex flex-col z-10 overflow-hidden animate-in slide-in-from-bottom-8 duration-400 ease-out">
            <div className="flex items-center justify-between border-b border-slate-100 p-6 shrink-0 bg-white/80 backdrop-blur-sm z-10">
              <div className="flex items-center gap-3">
                <SlidersHorizontal size={22} className="text-orange-500" />
                <h4 className="font-extrabold text-slate-800 text-lg">Bộ lọc nâng cao</h4>
              </div>
              <button onClick={closeDrawer} className="text-slate-400 p-2.5 hover:bg-slate-100 hover:text-slate-700 rounded-full transition-colors bg-slate-50"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-52">
              <FilterFields tempFilters={tempFilters} handleFilterChange={handleFilterChange} forceDistrict={forceDistrict} />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white/95 to-transparent shrink-0 pt-16 pb-28 z-20 pointer-events-none">
              <div className="flex gap-4 bg-white p-2.5 rounded-[2rem] shadow-[0_15px_50px_rgba(0,0,0,0.12)] border border-slate-100 pointer-events-auto">
                <button onClick={handleResetFilters} className="w-1/3 text-slate-600 font-extrabold text-[15px] py-4 rounded-2xl bg-slate-50 hover:bg-slate-100 active:scale-[0.98] transition-all duration-200">Đặt lại</button>
                <button onClick={handleApplyFilters} className="w-2/3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-extrabold text-[15px] py-4 rounded-2xl shadow-xl shadow-orange-500/30 hover:shadow-orange-500/40 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2">
                  <Check size={20} /> Áp dụng ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main id="listing-section" className="max-w-7xl mx-auto w-full px-4 mt-16 mb-24 scroll-mt-32">
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item) => <BdsCard key={item.id} item={item} />)}
          </div>
        ) : (
          <div className="text-center py-32 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 m-4">
             <Image src="https://images.unsplash.com/photo-1584824486509-11459466a200?w=120&q=80" width={100} height={100} alt="Empty" className="mb-6 opacity-40 grayscale rounded-full mx-auto" />
             <p className="text-slate-500 font-extrabold text-xl">Không tìm thấy sản phẩm phù hợp</p>
             <p className="text-slate-400 text-base mt-2">Vui lòng điều chỉnh lại bộ lọc để xem các kết quả khác.</p>
          </div>
        )}
        
        {Math.ceil(filteredItems.length / itemsPerPage) > 1 && (
          <div className="flex justify-center gap-3 mt-20">
            {Array.from({ length: Math.ceil(filteredItems.length / itemsPerPage) }, (_, idx) => (
              <button key={idx} onClick={() => { setCurrentPage(idx + 1); document.getElementById("listing-section")?.scrollIntoView({ behavior: "smooth" }); }}
                className={`w-12 h-12 rounded-2xl font-extrabold text-base transition-all duration-300 ${
                  currentPage === idx + 1 
                    ? "bg-gradient-to-tr from-orange-500 to-red-500 text-white scale-110 shadow-xl shadow-orange-500/30" 
                    : "bg-white border-2 border-slate-100 text-slate-500 hover:border-orange-200 hover:text-orange-500"
                }`}>
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
// 5. COMPONENT THẺ BĐS (Đã Fix lỗi dòng thứ 3 lồi ra)
// ==========================================
function BdsCard({ item }: { item: any }) {
  const thumbnail = layUrlAnhChuan(item.anh);
  const textLower = cleanVietnameseText(`${item.tieude || ""} ${item.mota || ""} ${item.tag || ""} ${item.loaiHinh || ""}`);
  const cauTruc = useMemo(() => {
    if (cleanVietnameseText(item.phanLoai || item.loaiHinh || '').includes("dat")) return "Đất trống";
    const text = (item.tieude + " " + item.mota).toLowerCase();
    const t = text.match(/(\d+)\s*(tầng|tang)/i), p = text.match(/(\d+)\s*(pn|phòng ngủ|phong ngu)/i);
    return t && p ? `${t[1]} Tầng - ${p[1]} PN` : t ? `${t[1]} Tầng` : p ? `${p[1]} PN` : "Nhà ở";
  }, [item]);

  return (
    <a href={`/nha-dat/${item.slug}`} className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl border border-slate-100 transition-all duration-300 flex flex-col h-full relative transform hover:-translate-y-1.5 block">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <Image src={thumbnail} alt={item.tieude} fill className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" sizes="(max-width: 1280px) 100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 text-white">
          {textLower.includes("sap ham") && <span className="bg-red-500 text-[10px] sm:text-[11px] font-extrabold px-3 py-1.5 rounded-lg shadow-md animate-pulse uppercase tracking-wider">🔥 SẬP HẦM</span>}
          {cleanVietnameseText(`${item.tieude} ${item.tag} ${item.loaiHinh}`).includes("cho thue") && <span className="bg-purple-600 text-[10px] sm:text-[11px] font-extrabold px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-md shadow-purple-900/20">🔑 CHO THUÊ</span>}
          {textLower.includes("chinh chu") && <span className="bg-emerald-600 text-[10px] sm:text-[11px] font-extrabold px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-md shadow-emerald-900/20">✓ CHÍNH CHỦ</span>}
        </div>
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-orange-600 font-black text-sm sm:text-[15px] px-5 py-2.5 rounded-xl shadow-xl">{item.gia}</div>
      </div>

      <div className="p-6 flex flex-col flex-grow justify-between">
        <div>
          <div className="text-slate-400 text-[11px] font-extrabold uppercase mb-3 flex items-center gap-1.5 tracking-wider"><MapPin className="w-4 h-4 text-orange-500" /><span className="truncate">{item.diaChi || item.khuVucFull || "Đà Nẵng"}</span></div>
          <h3 className="text-slate-800 font-extrabold text-[16px] sm:text-[17px] group-hover:text-orange-600 transition-colors duration-200 h-[2.8rem] sm:h-[3.2rem] line-clamp-2 overflow-hidden leading-snug mb-5">
            {item.tieude}
          </h3>
        </div>
        <div className="grid grid-cols-3 gap-3 py-4 border-y border-slate-100 text-slate-600 text-[13px] text-center">
          <div className="bg-slate-50/80 rounded-2xl py-2.5"><Square className="w-4 h-4 text-slate-400 mx-auto mb-1.5" /><span className="font-extrabold">{item.dienTich || "---"}</span></div>
          <div className="bg-slate-50/80 rounded-2xl py-2.5"><Compass className="w-4 h-4 text-slate-400 mx-auto mb-1.5" /><span className="font-extrabold">{item.huong || "---"}</span></div>
          <div className="bg-slate-50/80 rounded-2xl py-2.5"><BedDouble className="w-4 h-4 text-slate-400 mx-auto mb-1.5" /><span className="font-extrabold">{cauTruc}</span></div>
        </div>
        <div className="flex items-center justify-between mt-5 pt-1">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-300" /> {formatTimeAgo(item.ngayDang || item.ngay)}</span>
          <span className="text-orange-500 text-[13px] font-extrabold flex items-center gap-1 group-hover:translate-x-1.5 transition-transform duration-300">Xem chi tiết <ChevronRight className="w-4 h-4" /></span>
        </div>
      </div>
    </a>
  );
}
