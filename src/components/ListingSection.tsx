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

  // State chính thức dùng để render dữ liệu ra giao diện bds
  const [activeKhuVuc, setActiveKhuVuc] = useState(forceDistrict || "all");
  const [activeLoaiHinh, setActiveLoaiHinh] = useState("all");
  const [activeKhoangGia, setActiveKhoangGia] = useState("all");
  const [activeHuong, setActiveHuong] = useState("all");
  const [activeTag, setActiveTag] = useState("all");

  // State tạm thời phục vụ thao tác chọn trên thanh công cụ
  const [tempKhuVuc, setTempKhuVuc] = useState(forceDistrict || "all");
  const [tempKhoangGia, setTempKhoangGia] = useState("all");
  const [tempHuong, setTempHuong] = useState("all");
  const [tempTag, setTempTag] = useState("all");

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  // Quản lý Phân trang thông qua SessionStorage
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

  // 🔥 TỐI ƯU HÓA LỚN: Dùng useMemo thay thế hoàn toàn useEffect gom toàn bộ logic lọc & sắp xếp bất động sản
  const filteredItems = useMemo(() => {
    let result = [...safeBdsItems];

    // Sắp xếp tin mới lên đầu
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

    // Thực hiện chuỗi bộ lọc lồng nhau
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

    // 💡 NÂNG CẤP: Xử lý logic Tag lọc thêm phần "cho thue"
    if (activeTag !== "all") {
      result = result.filter(i => {
        const text = cleanVietnameseText((i.tieude || "") + " " + (i.mota || i.moTa || "") + " " + (i.tag || "") + " " + (i.loaiHinh || ""));
        if (activeTag === "mattien") return (i.isMatTien || text.includes("mat tien"));
        if (activeTag === "chinhchu") return text.includes("chinh chu");
        if (activeTag === "chothue") return text.includes("cho thue"); // <--- Thêm nhận diện Nhà cho thuê
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
    setIsDrawerOpen(false);

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
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1 tracking-wider">Phường / Xã</label>
        <select disabled={!!forceDistrict} value={tempKhuVuc} onChange={(e) => setTempKhuVuc(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold focus:outline-none focus:border-orange-500 focus:bg-white text-slate-700 shadow-xs transition-all">
          <option value="all">Tất cả Vị trí</option>
          <option disabled className="font-bold text-slate-400 bg-slate-100">-- Danh sách Phường --</option>
          {["Hải Châu", "Hòa Cường", "Thanh Khê", "An Khê", "An Hải", "Sơn Trà", "Ngũ Hành Sơn", "Hòa Khánh", "Hải Vân", "Liên Chiểu", "Cẩm Lệ", "Hòa Xuân", "Hòa Vang", "Bà Nà", "Hòa Tiến", "Hòa Phước"].map(p => <option key={p} value={p}>{p}</option>)}
          <option disabled className="font-bold text-slate-400 bg-slate-100">-- Danh sách Xã --</option>
          {["Hòa Bắc", "Hòa Liên", "Hòa Ninh"].map(x => <option key={x} value={x}>{x}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1 tracking-wider">Khoảng Giá</label>
        <select value={tempKhoangGia} onChange={(e) => setTempKhoangGia(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold focus:outline-none focus:border-orange-500 focus:bg-white text-slate-700 shadow-xs transition-all">
          <option value="all">Tất cả mức giá</option>
          <option value="duoi3">Dưới 3 Tỷ</option>
          <option value="3to5">Từ 3 - 5 Tỷ</option>
          <option value="tren5">Trên 5 Tỷ</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1 tracking-wider">Hướng Nhà</label>
        <select value={tempHuong} onChange={(e) => setTempHuong(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold focus:outline-none focus:border-orange-500 focus:bg-white text-slate-700 shadow-xs transition-all">
          <option value="all">Tất cả các hướng</option>
          {["Đông", "Tây", "Nam", "Bắc"].map(h => <option key={h} value={h}>Hướng {h}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1 tracking-wider">Nhóm Đặc Quyền</label>
        <select value={tempTag} onChange={(e) => setTempTag(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold focus:outline-none focus:border-orange-500 focus:bg-white text-slate-700 shadow-xs transition-all">
          <option value="all">Tất cả phân nhóm</option>
          <option value="mattien">🏢 Mặt Tiền Kinh Doanh</option>
          <option value="chinhchu">✓ Hàng Chính Chủ</option>
          <option value="chothue">🔑 Nhà Cho Thuê</option> {/* <--- Bổ sung thẻ đặc quyền */}
        </select>
      </div>
    </>
  );

  return (
    <>
      {/* 1. HỆ THỐNG BỘ LỌC TÌM KIẾM CHI TIẾT */}
      <section className="max-w-7xl mx-auto w-full px-4 -mt-10 relative z-10">
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-xl space-y-5">
          
          {/* TAB CHỌN LOẠI HÌNH TRÊN PC */}
          <div className="flex border-b border-gray-100 pb-3 items-center justify-between gap-4">
            <div className="flex-1 max-w-xl flex gap-1 bg-gray-100 p-1 rounded-xl">
              {[
                { id: "all", label: "Tất Cả BDS" },
                { id: "Đất nền", label: "⛳ Đất Nền" },
                { id: "Nhà phố", label: "🏠 Nhà Phố" },
                { id: "Cho thuê", label: "🔑 Cho Thuê" } // <--- Bổ sung Tab mới
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => { setActiveLoaiHinh(tab.id); setCurrentPage(1); }}
                  className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${activeLoaiHinh === tab.id ? "bg-white text-orange-500 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button 
              onClick={() => { setTempKhuVuc(activeKhuVuc); setTempKhoangGia(activeKhoangGia); setTempHuong(activeHuong); setTempTag(activeTag); setIsDrawerOpen(true); }}
              className="md:hidden flex items-center gap-1.5 bg-orange-50 text-orange-600 px-4 py-2.5 rounded-xl text-xs font-bold border border-orange-100 shrink-0"
            >
              <SlidersHorizontal size={14} />
              Lọc nâng cao {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </button>
          </div>

          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4">
            <FilterFields />
          </div>

          <div className="hidden md:flex items-center justify-between border-t border-gray-100/80 pt-4 mt-2">
            <div className="text-xs text-slate-400 font-medium italic">* Vui lòng chọn các tiêu chí trên và bấm nút tìm kiếm để cập nhật dữ liệu.</div>
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <button onClick={handleResetFilters} className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-red-500 px-4 py-2.5 rounded-xl hover:bg-red-50 transition-colors">
                  <RotateCcw size={14} /> Xóa bộ lọc
                </button>
              )}
              <button onClick={handleApplyFilters} className="bg-gradient-to-r from-orange-500 to-red-600 text-white font-extrabold text-xs px-7 py-3 rounded-xl flex items-center gap-2 shadow-md shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 active:scale-[0.97] transition-all tracking-wide">
                <Check size={14} /> Tìm kiếm ngay
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 📱 MOBILE DRAWER */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsDrawerOpen(false)} />
          <div className="relative bg-white rounded-t-3xl shadow-2xl h-[75vh] flex flex-col z-10 overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between border-b border-gray-100 p-4 shrink-0">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-orange-500" /><h4 className="font-bold text-gray-800 text-sm">Bộ lọc nâng cao</h4>
              </div>
              <button onClick={() => setIsDrawerOpen(false)} className="text-gray-400 p-1 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-40"><FilterFields /></div>

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent shrink-0 pb-20 shadow-[0_-12px_30px_rgba(0,0,0,0.04)] z-20">
              <div className="bg-white p-1 rounded-2xl border border-gray-100 shadow-md flex gap-2 mb-4">
                <button onClick={handleResetFilters} className="w-1/3 border border-gray-200 text-slate-600 font-bold text-xs py-3.5 rounded-xl text-center bg-slate-50 active:scale-[0.98] transition-transform">Đặt lại</button>
                <button onClick={handleApplyFilters} className="w-2/3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-extrabold text-xs py-3.5 rounded-xl text-center shadow-md shadow-orange-500/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-1.5"><Check size={14} /> Áp dụng ngay</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. DANH SÁCH BẤT ĐỘNG SẢN */}
      <main id="listing-section" className="max-w-7xl mx-auto w-full px-4 mt-16 mb-20 scroll-mt-28">
        {currentItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentItems.map((item) => (
              <BdsCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400 font-medium bg-slate-50 rounded-3xl border border-dashed">Không tìm thấy sản phẩm bất động sản nào phù hợp với bộ lọc.</div>
        )}

        {/* PHÂN TRANG */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            {Array.from({ length: totalPages }, (_, idx) => (
              <button 
                key={idx} 
                onClick={(e) => { 
                  e.preventDefault(); setCurrentPage(idx + 1); 
                  document.getElementById("listing-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }} 
                className={`w-9 h-9 rounded-xl text-sm transition-all font-bold ${currentPage === idx + 1 ? "bg-orange-500 text-white scale-105 shadow-md shadow-orange-500/20" : "bg-white border text-slate-600 hover:bg-slate-50"}`}
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

// 🔥 SUB-COMPONENT CARD BẤT ĐỘNG SẢN TÁCH BIỆT (GIÚP CODE GỌN GÀNG, SẠCH SẼ)
function BdsCard({ item }: { item: any }) {
  const thumbnail = layUrlAnhChuan(item.anh);
  const displayLocation = item.diaChi || item.diaChiFull || item.khuVucFull || "Đà Nẵng";
  const displayTime = item.ngayDang || item.ngay || "";

  // 💡 NÂNG CẤP: Nhận diện tự động các trạng thái đặc biệt
  const textLower = cleanVietnameseText((item.tieude || "") + " " + (item.mota || item.moTa || "") + " " + (item.tag || "") + " " + (item.loaiHinh || ""));
  const isChinhChu = textLower.includes("chinh chu");
  const isMatTien = textLower.includes("mat tien");
  const isSapHam = textLower.includes("sap ham") || textLower.includes("gia re");
  const isChoThue = textLower.includes("cho thue"); // <--- Quét tìm sản phẩm Cho Thuê

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
    <a href={`/nha-dat/${item.slug}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 flex flex-col h-full relative transform hover:-translate-y-1 block">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
        <Image src={thumbnail} alt={item.tieude || "Trần Huy Land"} fill className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out" sizes="(max-width: 1280px) 100vw" priority={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* 🏷️ KHU VỰC HIỂN THỊ NHÃN TAG (BADGES) CHUẨN MỚI */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {isSapHam && <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-md uppercase tracking-wider animate-pulse">🔥 Sập Hầm</span>}
          {isChoThue && <span className="bg-purple-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-md uppercase tracking-wider shadow-purple-500/30">🔑 Cho Thuê</span>}
          {isChinhChu && <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-md uppercase tracking-wider">✓ Chính Chủ</span>}
          {isMatTien && <span className="bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-md uppercase tracking-wider">🏢 Mặt Tiền</span>}
        </div>

        <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-extrabold text-sm px-3.5 py-1.5 rounded-xl shadow-lg border border-orange-400/20 z-10 tracking-wide transform group-hover:scale-110 transition-transform duration-300">{item.gia}</div>
      </div>

      <div className="p-4 flex flex-col flex-grow justify-between">
        <div>
          <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" /><span className="truncate">{displayLocation}</span>
          </div>
          <h3 className="text-gray-800 font-bold text-base line-clamp-2 group-hover:text-orange-500 transition-colors duration-200 mb-3 min-h-[3rem] leading-snug">{item.tieude}</h3>
        </div>

        <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-gray-50 text-gray-600 text-xs">
          <div className="flex flex-col items-center justify-center bg-gray-50/60 rounded-lg py-1.5 border border-gray-100/50">
            <Square className="w-3.5 h-3.5 text-orange-500 mb-0.5" /><span className="font-semibold text-gray-700 truncate max-w-full px-1">{item.dienTich || "---"}</span>
          </div>
          <div className="flex flex-col items-center justify-center bg-gray-50/60 rounded-lg py-1.5 border border-gray-100/50">
            <Compass className="w-3.5 h-3.5 text-orange-500 mb-0.5" /><span className="font-semibold text-gray-700 truncate max-w-full px-1">{item.huong || "---"}</span>
          </div>
          <div className="flex flex-col items-center justify-center bg-gray-50/60 rounded-lg py-1.5 border border-gray-100/50">
            <BedDouble className="w-3.5 h-3.5 text-orange-500 mb-0.5" /><span className="font-semibold text-gray-700 truncate max-w-full px-1">{cauTrucPhong}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-2">
          <span className="text-[11px] text-gray-400 italic flex items-center gap-1"><Clock className="w-3 h-3 text-gray-300" /> {formatTimeAgo(displayTime)}</span>
          <span className="text-orange-500 text-xs font-bold inline-flex items-center gap-0.5 group-hover:translate-x-1 transition-transform duration-200">Xem chi tiết <ChevronRight className="w-3.5 h-3.5" /></span>
        </div>
      </div>
    </a>
  );
}
