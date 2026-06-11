'use client';
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { MapPin, Compass, Clock, Square, ChevronRight, BedDouble, SlidersHorizontal, X, Check, RotateCcw } from "lucide-react";

interface ListingSectionProps {
  allBdsItems: any[];
  forceDistrict?: string;
}

// Hàm chuẩn hóa tiếng Việt viết gọn bằng Regex tối ưu hiệu năng
const cleanVietnameseText = (str: string) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .trim();
};

// Hàm tính thời gian đăng tin chuẩn xác
const formatTimeAgo = (dateStr: string) => {
  if (!dateStr) return "Tin mới";
  const parts = dateStr.split(/[-/]/);
  if (parts.length !== 3) return "Hôm nay";
  const day = parseInt(parts[0], 10), month = parseInt(parts[1], 10) - 1, year = parseInt(parts[2], 10);
  const diffDays = Math.floor((new Date().setHours(0,0,0,0) - new Date(year, month, day).setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
  return diffDays <= 0 ? "Hôm nay" : diffDays === 1 ? "1 ngày trước" : diffDays < 7 ? `${diffDays} ngày trước` : `${Math.floor(diffDays / 7)} tuần trước`;
};

// Hàm xử lý chuỗi ảnh dự phòng nhanh
const layUrlAnhChuan = (chuoiAnh: string) => {
  if (!chuoiAnh) return 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80';
  const danhSach = chuoiAnh.split(",").map(a => a.trim()).filter(a => a.startsWith("http"));
  return danhSach.length > 0 ? danhSach[0] : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80';
};

export default function ListingSection({ allBdsItems = [], forceDistrict }: ListingSectionProps) {
  const safeBdsItems = Array.isArray(allBdsItems) ? allBdsItems : [];

  const [activeKhuVuc, setActiveKhuVuc] = useState(forceDistrict || "all");
  const [activeLoaiHinh, setActiveLoaiHinh] = useState("all");
  const [activeKhoangGia, setActiveKhoangGia] = useState("all");
  const [activeHuong, setActiveHuong] = useState("all");
  const [activeTag, setActiveTag] = useState("all");

  const [tempKhuVuc, setTempKhuVuc] = useState(forceDistrict || "all");
  const [tempKhoangGia, setTempKhoangGia] = useState("all");
  const [tempHuong, setTempHuong] = useState("all");
  const [tempTag, setTempTag] = useState("all");

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

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

  // 🚀 TÍNH NĂNG MỚI: BẮT SỰ KIỆN VUỐT BACK TRÊN ĐIỆN THOẠI ĐỂ TẮT BỘ LỌC
  useEffect(() => {
    const handlePopState = () => {
      if (isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };

    if (isDrawerOpen) {
      window.history.pushState({ drawer: 'open' }, '');
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isDrawerOpen]);

  const closeDrawer = () => {
    if (window.history.state && window.history.state.drawer === 'open') {
      window.history.back(); 
    } else {
      setIsDrawerOpen(false);
    }
  };

  const filteredItems = useMemo(() => {
    let result = [...safeBdsItems];

    result.sort((a: any, b: any) => {
      const dateStrA = a.ngayDang || a.ngay || "";
      const dateStrB = b.ngayDang || b.ngay || "";

      const convertToTimestamp = (dStr: string) => {
        if (!dStr) return 0;
        const parts = dStr.split(/[-/]/);
        return parts.length === 3 ? new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10)).getTime() : 0;
      };

      const timeDiff = convertToTimestamp(dateStrB) - convertToTimestamp(dateStrA);
      return timeDiff !== 0 ? timeDiff : (Number(b.id) || 0) - (Number(a.id) || 0);
    });

    if (activeKhuVuc !== "all") {
      const target = cleanVietnameseText(activeKhuVuc);
      result = result.filter(i => 
        cleanVietnameseText(i.diaChi || i.diaChiFull || i.diChi || i.dia_chi || "").includes(target) || 
        cleanVietnameseText(i.khuVucFull || i.khuVuc || "").includes(target)
      );
    }

    if (activeLoaiHinh !== "all") {
      const target = cleanVietnameseText(activeLoaiHinh);
      result = result.filter(i => 
        cleanVietnameseText(i.phân_loại || i.phanLoai || i.loaiHinh || "").includes(target) || 
        cleanVietnameseText(i.tieude || i.tieuDe || "").includes(target)
      );
    }

    if (activeKhoangGia !== "all") {
      const parseGia = (str: string) => str ? parseFloat(str.replace(/[^0-9.]/g, "")) || 0 : 0;
      result = result.filter(i => {
        const gia = Number(i.soGia) || parseGia(i.gia);
        if (activeKhoangGia === "duoi3") return gia < 3.0;
        if (activeKhoangGia === "3to5") return gia >= 3.0 && gia <= 5.0;
        return gia > 5.0;
      });
    }

    if (activeHuong !== "all") {
      const target = cleanVietnameseText(activeHuong);
      result = result.filter(i => cleanVietnameseText(i.huong || "").includes(target));
    }

    if (activeTag !== "all") {
      result = result.filter(i => {
        const text = cleanVietnameseText((i.tieude || "") + " " + (i.mota || i.moTa || "") + " " + (i.tag || "") + " " + (i.loaiHinh || ""));
        
        if (activeTag === "mattien") return (i.isMatTien || text.includes("mat tien"));
        if (activeTag === "chinhchu") return text.includes("chinh chu");
        
        if (activeTag === "chothue") {
          const strictTextChoThue = cleanVietnameseText((i.tieude || "") + " " + (i.tag || "") + " " + (i.loaiHinh || ""));
          return strictTextChoThue.includes("cho thue");
        }
        
        return true;
      });
    }

    return result;
  }, [activeKhuVuc, activeLoaiHinh, activeKhoangGia, activeHuong, activeTag, safeBdsItems]);

  const activeFiltersCount = 
    (activeKhuVuc !== "all" ? 1 : 0) + 
    (activeKhoangGia !== "all" ? 1 : 0) + 
    (activeHuong !== "all" ? 1 : 0) + 
    (activeTag !== "all" ? 1 : 0);

  const currentItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const handleApplyFilters = () => {
    setActiveKhuVuc(tempKhuVuc);
    setActiveKhoangGia(tempKhoangGia);
    setActiveHuong(tempHuong);
    setActiveTag(tempTag);
    setCurrentPage(1);
    closeDrawer();

    setTimeout(() => {
      document.getElementById("listing-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleResetFilters = () => {
    const defDistrict = forceDistrict || "all";
    setTempKhuVuc(defDistrict); setTempKhoangGia("all"); setTempHuong("all"); setTempTag("all");
    setActiveKhuVuc(defDistrict); setActiveKhoangGia("all"); setActiveHuong("all"); setActiveTag("all");
    setActiveLoaiHinh("all"); setCurrentPage(1);
  };

  const FilterFields = () => (
    <>
      <div className="space-y-2">
        <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest pl-1">Phường / Xã</label>
        <select disabled={!!forceDistrict} value={tempKhuVuc} onChange={(e) => setTempKhuVuc(e.target.value)} className="w-full bg-slate-50 border border-slate-200 hover:border-orange-300 focus:border-orange-500 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-700 outline-none transition-all cursor-pointer appearance-none">
          <option value="all">Tất cả Vị trí</option>
          <option disabled className="font-bold text-slate-400 bg-slate-100">-- Danh sách Phường --</option>
          {["Hải Châu", "Hòa Cường", "Thanh Khê", "An Khê", "An Hải", "Sơn Trà", "Ngũ Hành Sơn", "Hòa Khánh", "Hải Vân", "Liên Chiểu", "Cẩm Lệ", "Hòa Xuân", "Hòa Vang", "Bà Nà", "Hòa Tiến", "Hòa Phước"].map(p => <option key={p} value={p}>{p}</option>)}
          <option disabled className="font-bold text-slate-400 bg-slate-100">-- Danh sách Xã --</option>
          {["Hòa Bắc", "Hòa Liên", "Hòa Ninh"].map(x => <option key={x} value={x}>{x}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest pl-1">Khoảng Giá</label>
        <select value={tempKhoangGia} onChange={(e) => setTempKhoangGia(e.target.value)} className="w-full bg-slate-50 border border-slate-200 hover:border-orange-300 focus:border-orange-500 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-700 outline-none transition-all cursor-pointer appearance-none">
          <option value="all">Tất cả mức giá</option>
          <option value="duoi3">Dưới 3 Tỷ</option>
          <option value="3to5">Từ 3 - 5 Tỷ</option>
          <option value="tren5">Trên 5 Tỷ</option>
        </select>
      </div>
      <div className="space-y-2">
        <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest pl-1">Hướng Nhà</label>
        <select value={tempHuong} onChange={(e) => setTempHuong(e.target.value)} className="w-full bg-slate-50 border border-slate-200 hover:border-orange-300 focus:border-orange-500 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-700 outline-none transition-all cursor-pointer appearance-none">
          <option value="all">Tất cả các hướng</option>
          {["Đông", "Tây", "Nam", "Bắc"].map(h => <option key={h} value={h}>Hướng {h}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest pl-1">Nhóm Đặc Quyền</label>
        <select value={tempTag} onChange={(e) => setTempTag(e.target.value)} className="w-full bg-slate-50 border border-slate-200 hover:border-orange-300 focus:border-orange-500 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-700 outline-none transition-all cursor-pointer appearance-none">
          <option value="all">Tất cả phân nhóm</option>
          <option value="mattien">🏢 Mặt Tiền Kinh Doanh</option>
          <option value="chinhchu">✓ Hàng Chính Chủ</option>
          <option value="chothue">🔑 Nhà Cho Thuê</option>
        </select>
      </div>
    </>
  );

  return (
    <>
      <section className="max-w-7xl mx-auto w-full px-4 -mt-10 relative z-10">
        <div className="bg-white p-5 sm:p-8 rounded-[2rem] border border-slate-100 shadow-xl">
          
          {/* TAB ĐIỀU HƯỚNG TÁCH BIỆT - NGĂN NẮP & CHỮ TO RÕ */}
          <div className="flex w-full justify-between items-center gap-1 sm:gap-2 border-b-2 border-slate-100 mb-6 pb-0">
            {[
              { id: "all", label: "Tất cả" },
              { id: "Đất nền", label: "⛳ Đất nền" },
              { id: "Nhà phố", label: "🏠 Nhà phố" },
              { id: "Cho thuê", label: "🔑 Cho thuê" }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => { setActiveLoaiHinh(tab.id); setCurrentPage(1); }}
                className={`flex-1 flex justify-center whitespace-nowrap text-center py-4 px-0.5 text-[13px] min-[390px]:text-[14px] md:text-[16px] font-extrabold transition-all relative rounded-t-xl ${
                  activeLoaiHinh === tab.id 
                    ? "text-orange-600 bg-orange-50/50" 
                    : "text-slate-400 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                {tab.label}
                {/* Thanh gạch chân phẳng siêu nét, thu ngắn lại 80% để tạo rãnh ngăn cách */}
                {activeLoaiHinh === tab.id && (
                  <span className="absolute bottom-[-2px] left-[10%] w-[80%] h-[4px] bg-gradient-to-r from-orange-500 to-red-600 rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          {/* NÚT MỞ BỘ LỌC TRÊN MOBILE TO RÕ */}
          <button 
            onClick={() => { setTempKhuVuc(activeKhuVuc); setTempKhoangGia(activeKhoangGia); setTempHuong(activeHuong); setTempTag(activeTag); setIsDrawerOpen(true); }}
            className="md:hidden w-full mb-2 flex items-center justify-center gap-2 bg-orange-50/50 text-orange-600 px-4 py-4 rounded-2xl text-sm font-bold border border-orange-100 hover:bg-orange-50 active:scale-[0.98] transition-all"
          >
            <SlidersHorizontal size={18} />
            Mở bộ lọc chi tiết {activeFiltersCount > 0 && <span className="bg-red-500 text-white w-5 h-5 rounded-full text-[10px] flex items-center justify-center shadow-sm shadow-red-500/30">{activeFiltersCount}</span>}
          </button>

          {/* LƯỚI BỘ LỌC TRÊN PC */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FilterFields />
          </div>

          <div className="hidden md:flex items-center justify-between border-t border-slate-100 pt-6 mt-6">
            <div className="text-xs text-slate-400 font-medium italic">* Vui lòng chọn các tiêu chí trên và bấm nút tìm kiếm để cập nhật dữ liệu.</div>
            <div className="flex items-center gap-3">
              {activeFiltersCount > 0 && (
                <button onClick={handleResetFilters} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-red-500 px-5 py-3 rounded-xl hover:bg-red-50 transition-colors">
                  <RotateCcw size={16} /> Xóa lọc
                </button>
              )}
              <button onClick={handleApplyFilters} className="bg-gradient-to-r from-orange-500 to-red-600 text-white font-extrabold text-sm px-8 py-3.5 rounded-xl flex items-center gap-2 shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all tracking-wide">
                <Check size={16} /> Tìm kiếm ngay
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 📱 MOBILE DRAWER (Bộ lọc trượt lên) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeDrawer} />
          <div className="relative bg-white rounded-t-[2rem] shadow-2xl h-[85vh] flex flex-col z-10 overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 p-5 shrink-0">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-orange-500" />
                <h4 className="font-extrabold text-slate-800 text-base">Bộ lọc nâng cao</h4>
              </div>
              <button onClick={closeDrawer} className="text-slate-400 p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={22} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6 pb-48">
              <FilterFields />
            </div>

            {/* KHU VỰC NÚT BẤM DƯỚI CÙNG */}
            <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-white via-white/90 to-transparent shrink-0 pt-12 pb-28 z-20 pointer-events-none">
              <div className="flex gap-3 bg-white p-2 rounded-[1.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-100 pointer-events-auto">
                <button onClick={handleResetFilters} className="w-1/3 text-slate-600 font-bold text-sm py-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 active:scale-[0.98] transition-all">Đặt lại</button>
                <button onClick={handleApplyFilters} className="w-2/3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-extrabold text-sm py-3.5 rounded-xl shadow-md shadow-orange-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                  <Check size={18} /> Áp dụng ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. DANH SÁCH BẤT ĐỘNG SẢN */}
      <main id="listing-section" className="max-w-7xl mx-auto w-full px-4 mt-12 mb-20 scroll-mt-28">
        {currentItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentItems.map((item) => (
              <BdsCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 flex flex-col items-center justify-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
             <Image src="https://images.unsplash.com/photo-1584824486509-11459466a200?w=120&q=80" width={80} height={80} alt="Empty" className="mb-4 opacity-50 grayscale rounded-full" />
             <p className="text-slate-500 font-bold text-lg">Không tìm thấy sản phẩm phù hợp</p>
             <p className="text-slate-400 text-sm mt-1">Vui lòng điều chỉnh lại bộ lọc để xem các kết quả khác.</p>
          </div>
        )}

        {/* PHÂN TRANG */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-16">
            {Array.from({ length: totalPages }, (_, idx) => (
              <button 
                key={idx} 
                onClick={(e) => { 
                  e.preventDefault(); setCurrentPage(idx + 1); 
                  document.getElementById("listing-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }} 
                className={`w-10 h-10 rounded-xl text-sm transition-all font-bold ${currentPage === idx + 1 ? "bg-gradient-to-tr from-orange-500 to-red-500 text-white scale-110 shadow-lg shadow-orange-500/30" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
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

// 🔥 SUB-COMPONENT CARD BẤT ĐỘNG SẢN TÁCH BIỆT
function BdsCard({ item }: { item: any }) {
  const thumbnail = layUrlAnhChuan(item.anh);
  const displayLocation = item.diaChi || item.diaChiFull || item.khuVucFull || "Đà Nẵng";
  const displayTime = item.ngayDang || item.ngay || "";

  const textLower = cleanVietnameseText((item.tieude || "") + " " + (item.mota || item.moTa || "") + " " + (item.tag || "") + " " + (item.loaiHinh || ""));
  const isChinhChu = textLower.includes("chinh chu");
  const isMatTien = textLower.includes("mat tien");
  const isSapHam = textLower.includes("sap ham") || textLower.includes("gia re");
  
  const textChoThue = cleanVietnameseText((item.tieude || "") + " " + (item.tag || "") + " " + (item.loaiHinh || item.phân_loại || ""));
  const isChoThue = textChoThue.includes("cho thue");

  const cauTrucPhong = useMemo(() => {
    const currentLoaiHinh = item.phân_loại || item.loaiHinh || '';
    if (cleanVietnameseText(currentLoaiHinh).includes("dat")) return "Đất trống";

    const combinedText = ((item.tieude || "") + " " + (item.mota || item.moTa || "")).toLowerCase();
    const matchTang = combinedText.match(/(\d+)\s*(tầng|tang)/i);
    const matchPhong = combinedText.match(/(\d+)\s*(pn|phòng ngủ|phong ngu)/i);
    
    if (matchTang && matchPhong) return `${matchTang[1]} Tầng - ${matchPhong[1]} PN`;
    if (matchTang) return `${matchTang[1]} Tầng`;
    if (matchPhong) return `${matchPhong[1]} PN`;
    return "Nhà ở";
  }, [item]);

  return (
    <a href={`/nha-dat/${item.slug}`} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl border border-slate-100 transition-all duration-300 flex flex-col h-full relative transform hover:-translate-y-1 block">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <Image src={thumbnail} alt={item.tieude || "Trần Huy Land"} fill className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" sizes="(max-width: 1280px) 100vw" priority={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {isSapHam && <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-md uppercase tracking-wider animate-pulse">🔥 Sập Hầm</span>}
          {isChoThue && <span className="bg-purple-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-md uppercase tracking-wider shadow-purple-500/30">🔑 Cho Thuê</span>}
          {isChinhChu && <span className="bg-emerald-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-md uppercase tracking-wider">✓ Chính Chủ</span>}
          {isMatTien && <span className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-md uppercase tracking-wider">🏢 Mặt Tiền</span>}
        </div>

        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-orange-600 font-extrabold text-sm px-4 py-2 rounded-xl shadow-lg z-10 tracking-wide transform group-hover:scale-105 transition-transform duration-300">{item.gia}</div>
      </div>

      <div className="p-5 flex flex-col flex-grow justify-between">
        <div>
          <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" /><span className="truncate">{displayLocation}</span>
          </div>
          <h3 className="text-slate-800 font-extrabold text-[15px] sm:text-base line-clamp-2 group-hover:text-orange-600 transition-colors duration-200 mb-4 min-h-[3rem] leading-snug">{item.tieude}</h3>
        </div>

        <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-slate-600 text-xs">
          <div className="flex flex-col items-center justify-center bg-slate-50 rounded-xl py-2">
            <Square className="w-4 h-4 text-slate-400 mb-1" /><span className="font-bold text-slate-700 truncate max-w-full px-1">{item.dienTich || "---"}</span>
          </div>
          <div className="flex flex-col items-center justify-center bg-slate-50 rounded-xl py-2">
            <Compass className="w-4 h-4 text-slate-400 mb-1" /><span className="font-bold text-slate-700 truncate max-w-full px-1">{item.huong || "---"}</span>
          </div>
          <div className="flex flex-col items-center justify-center bg-slate-50 rounded-xl py-2">
            <BedDouble className="w-4 h-4 text-slate-400 mb-1" /><span className="font-bold text-slate-700 truncate max-w-full px-1">{cauTrucPhong}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-1">
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-300" /> {formatTimeAgo(displayTime)}</span>
          <span className="text-orange-500 text-xs font-extrabold inline-flex items-center gap-0.5 group-hover:translate-x-1 transition-transform duration-200">Chi tiết <ChevronRight className="w-4 h-4" /></span>
        </div>
      </div>
    </a>
  );
}
