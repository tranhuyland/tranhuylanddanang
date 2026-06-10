'use client';
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { MapPin, Compass, Clock, Square, ChevronRight, BedDouble, SlidersHorizontal, X, Check, RotateCcw } from "lucide-react";

interface ListingSectionProps {
  allBdsItems: any[];
  forceDistrict?: string;
}

const cleanVietnameseText = (str: string) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .trim();
};

export default function ListingSection({ allBdsItems = [], forceDistrict }: ListingSectionProps) {
  const safeBdsItems = Array.isArray(allBdsItems) ? allBdsItems : [];

  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  
  // State chính thức dùng để render dữ liệu
  const [activeKhuVuc, setActiveKhuVuc] = useState(forceDistrict || "all");
  const [activeLoaiHinh, setActiveLoaiHinh] = useState("all");
  const [activeKhoangGia, setActiveKhoangGia] = useState("all");
  const [activeHuong, setActiveHuong] = useState("all");
  const [activeTag, setActiveTag] = useState("all");

  // State tạm thời khi người dùng đang thao tác trong bộ lọc
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

  // Hàm kích hoạt bộ lọc khi bấm Áp dụng
  const handleApplyFilters = () => {
    setActiveKhuVuc(tempKhuVuc);
    setActiveKhoangGia(tempKhoangGia);
    setActiveHuong(tempHuong);
    setActiveTag(tempTag);
    setCurrentPage(1);
    setIsDrawerOpen(false);

    setTimeout(() => {
      const element = document.getElementById("listing-section");
      if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  // Hàm reset bộ lọc
  const handleResetFilters = () => {
    setTempKhuVuc(forceDistrict || "all");
    setTempKhoangGia("all");
    setTempHuong("all");
    setTempTag("all");
    
    setActiveKhuVuc(forceDistrict || "all");
    setActiveKhoangGia("all");
    setActiveHuong("all");
    setActiveTag("all");
    setActiveLoaiHinh("all");
    setCurrentPage(1);
  };

  // Đổi tab Loại hình nhanh
  const handleSelectLoaiHinh = (type: string) => {
    setActiveLoaiHinh(type);
    setCurrentPage(1);
  };

  useEffect(() => {
    let result = [...safeBdsItems];

    result.sort((a: any, b: any) => {
      const dateStrA = a.ngayDang || a.ngay || "";
      const dateStrB = b.ngayDang || b.ngay || "";

      const convertToTimestamp = (dStr: string) => {
        if (!dStr) return 0;
        const parts = dStr.split(/[-/]/);
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const year = parseInt(parts[2], 10);
          return new Date(year, month, day).getTime();
        }
        return 0;
      };

      const timeA = convertToTimestamp(dateStrA);
      const timeB = convertToTimestamp(dateStrB);

      if (timeB !== timeA) return timeB - timeA;
      return (Number(b.id) || 0) - (Number(a.id) || 0);
    });

    if (activeKhuVuc !== "all") {
      result = result.filter((i: any) => {
        const checkDiaChi = cleanVietnameseText(i.diaChi || i.diaChiFull || i.diChi || i.dia_chi || "");
        const checkKhuVuc = cleanVietnameseText(i.khuVucFull || i.khuVuc || "");
        const targetKhuVuc = cleanVietnameseText(activeKhuVuc);
        return checkDiaChi.includes(targetKhuVuc) || checkKhuVuc.includes(targetKhuVuc);
      });
    }
    if (activeLoaiHinh !== "all") {
      result = result.filter((i: any) => {
        const checkPhanLoai = cleanVietnameseText(i.phân_loại || i.phanLoai || i.loaiHinh || "");
        const checkTieude = cleanVietnameseText(i.tieude || i.tieuDe || "");
        const targetLoaiHinh = cleanVietnameseText(activeLoaiHinh);
        return checkPhanLoai.includes(targetLoaiHinh) || checkTieude.includes(targetLoaiHinh);
      });
    }
    if (activeKhoangGia !== "all") {
      const parseGia = (giaStr: string) => {
        if (!giaStr) return 0;
        const num = parseFloat(giaStr.replace(/[^0-9.]/g, ""));
        return isNaN(num) ? 0 : num;
      };
      const getGiaNumber = (item: any) => Number(item.soGia) || parseGia(item.gia);

      if (activeKhoangGia === "duoi3") result = result.filter(i => getGiaNumber(i) < 3.0);
      else if (activeKhoangGia === "3to5") result = result.filter(i => getGiaNumber(i) >= 3.0 && getGiaNumber(i) <= 5.0);
      else if (activeKhoangGia === "tren5") result = result.filter(i => getGiaNumber(i) > 5.0);
    }
    if (activeHuong !== "all") {
      result = result.filter((i: any) => cleanVietnameseText(i.huong || "").includes(cleanVietnameseText(activeHuong)));
    }
    if (activeTag === "mattien") {
      result = result.filter((i: any) => i.isMatTien === true || cleanVietnameseText(i.tieude || "").includes("mat tien") || cleanVietnameseText(i.tag || "").includes("mat tien") || cleanVietnameseText(i.mota || i.moTa || "").includes("mat tien"));
    } else if (activeTag === "chinhchu") {
      result = result.filter((i: any) => cleanVietnameseText(i.tag || "").includes("chinh chu") || cleanVietnameseText(i.mota || i.moTa || "").includes("chinh chu") || cleanVietnameseText(i.tieude || "").includes("chinh chu"));
    }
    
    setFilteredItems(result);
  }, [activeKhuVuc, activeLoaiHinh, activeKhoangGia, activeHuong, activeTag, safeBdsItems]);

  const formatTimeAgo = (dateStr: string) => {
    if (!dateStr) return "Tin mới";
    const parts = dateStr.split(/[-/]/);
    if (parts.length !== 3) return "Hôm nay";
    const day = parseInt(parts[0], 10), month = parseInt(parts[1], 10) - 1, year = parseInt(parts[2], 10);
    const diffDays = Math.floor((new Date().setHours(0,0,0,0) - new Date(year, month, day).setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
    return diffDays <= 0 ? "Hôm nay" : diffDays === 1 ? "1 ngày trước" : diffDays < 7 ? `${diffDays} ngày trước` : `${Math.floor(diffDays / 7)} tuần trước`;
  };

  const layUrlAnhChuan = (chuoiAnh: string) => {
    if (!chuoiAnh) return 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80';
    const danhSach = chuoiAnh.split(",").map(a => a.trim()).filter(a => a.startsWith("http"));
    return danhSach.length > 0 ? danhSach[0] : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80';
  };

  const activeFiltersCount = 
    (activeKhuVuc !== "all" ? 1 : 0) + 
    (activeKhoangGia !== "all" ? 1 : 0) + 
    (activeHuong !== "all" ? 1 : 0) + 
    (activeTag !== "all" ? 1 : 0);

  const currentItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Khối ô Select tiêu chí
  const FilterFields = () => (
    <>
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1 tracking-wider">Phường / Xã</label>
        <select 
          disabled={!!forceDistrict} 
          value={tempKhuVuc} 
          onChange={(e) => setTempKhuVuc(e.target.value)} 
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold focus:outline-none focus:border-orange-500 focus:bg-white text-slate-700 shadow-xs transition-all"
        >
          <option value="all">Tất cả Vị trí</option>
          <option disabled className="font-bold text-slate-400 bg-slate-100">-- Danh sách Phường --</option>
          <option value="Hải Châu">Hải Châu</option>
          <option value="Hòa Cường">Hòa Cường</option>
          <option value="Thanh Khê">Thanh Khê</option>
          <option value="An Khê">An Khê</option>
          <option value="An Hải">An Hải</option>
          <option value="Sơn Trà">Sơn Trà</option>
          <option value="Ngũ Hành Sơn">Ngũ Hành Sơn</option>
          <option value="Hòa Khánh">Hòa Khánh</option>
          <option value="Hải Vân">Hải Vân</option>
          <option value="Liên Chiểu">Liên Chiểu</option>
          <option value="Cẩm Lệ">Cẩm Lệ</option>
          <option value="Hòa Xuân">Hòa Xuân</option>
          <option value="Hòa Vang">Hòa Vang</option>
          <option value="Bà Nà">Bà Nà</option>
          <option value="Hòa Tiến">Hòa Tiến</option>
          <option value="Hòa Phước">Hòa Phước</option>
          <option disabled className="font-bold text-slate-400 bg-slate-100">-- Danh sách Xã --</option>
          <option value="Hòa Bắc">Hòa Bắc</option>
          <option value="Hòa Liên">Hòa Liên</option>
          <option value="Hòa Ninh">Hòa Ninh</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1 tracking-wider">Khoảng Giá</label>
        <select 
          value={tempKhoangGia} 
          onChange={(e) => setTempKhoangGia(e.target.value)} 
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold focus:outline-none focus:border-orange-500 focus:bg-white text-slate-700 shadow-xs transition-all"
        >
          <option value="all">Tất cả mức giá</option>
          <option value="duoi3">Dưới 3 Tỷ</option>
          <option value="3to5">Từ 3 - 5 Tỷ</option>
          <option value="tren5">Trên 5 Tỷ</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1 tracking-wider">Hướng Nhà</label>
        <select 
          value={tempHuong} 
          onChange={(e) => setTempHuong(e.target.value)} 
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold focus:outline-none focus:border-orange-500 focus:bg-white text-slate-700 shadow-xs transition-all"
        >
          <option value="all">Tất cả các hướng</option>
          <option value="Đông">Hướng Đông</option>
          <option value="Tây">Hướng Tây</option>
          <option value="Nam">Hướng Nam</option>
          <option value="Bắc">Hướng Bắc</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1 tracking-wider">Nhóm Đặc Quyền</label>
        <select 
          value={tempTag} 
          onChange={(e) => setTempTag(e.target.value)} 
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold focus:outline-none focus:border-orange-500 focus:bg-white text-slate-700 shadow-xs transition-all"
        >
          <option value="all">Tất cả phân nhóm</option>
          <option value="mattien">🏢 Mặt Tiền Kinh Doanh</option>
          <option value="chinhchu">✓ Hàng Chính Chủ</option>
        </select>
      </div>
    </>
  );

  return (
    <>
      {/* 1. HỆ THỐNG BỘ LỌC TÌM KIẾM CHI TIẾT */}
      <section className="max-w-7xl mx-auto w-full px-4 -mt-10 relative z-10">
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-xl space-y-5">
          
          {/* HÀNG TAB CHỌN NHANH LOẠI HÌNH */}
          <div className="flex border-b border-gray-100 pb-3 items-center justify-between gap-4">
            <div className="flex-1 max-w-xl flex gap-1 bg-gray-100 p-1 rounded-xl">
              <button 
                onClick={() => handleSelectLoaiHinh("all")}
                className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${activeLoaiHinh === "all" ? "bg-white text-orange-500 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
              >
                Tất Cả BDS
              </button>
              <button 
                onClick={() => handleSelectLoaiHinh("Đất nền")}
                className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${activeLoaiHinh === "Đất nền" ? "bg-white text-orange-500 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
              >
                ⛳ Đất Nền
              </button>
              <button 
                onClick={() => handleSelectLoaiHinh("Nhà phố")}
                className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${activeLoaiHinh === "Nhà phố" ? "bg-white text-orange-500 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
              >
                🏠 Nhà Phố
              </button>
            </div>

            {/* NÚT BẤM MỞ ĐIỀU KHIỂN BỘ LỌC TRÊN MOBILE */}
            <button 
              onClick={() => {
                setTempKhuVuc(activeKhuVuc);
                setTempKhoangGia(activeKhoangGia);
                setTempHuong(activeHuong);
                setTempTag(activeTag);
                setIsDrawerOpen(true);
              }}
              className="md:hidden flex items-center gap-1.5 bg-orange-50 text-orange-600 px-4 py-2.5 rounded-xl text-xs font-bold border border-orange-100 shrink-0"
            >
              <SlidersHorizontal size={14} />
              Lọc nâng cao {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </button>
          </div>

          {/* GIAO DIỆN BỘ LỌC TRÊN MÁY TÍNH */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4">
            <FilterFields />
          </div>

          {/* THANH NÚT ÁP DỤNG TRÊN DESKTOP */}
          <div className="hidden md:flex items-center justify-between border-t border-gray-100/80 pt-4 mt-2">
            <div className="text-xs text-slate-400 font-medium italic">
              * Vui lòng chọn các tiêu chí trên và bấm nút tìm kiếm để cập nhật dữ liệu.
            </div>
            
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <button 
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-red-500 px-4 py-2.5 rounded-xl hover:bg-red-50 transition-colors"
                >
                  <RotateCcw size={14} /> Xóa bộ lọc
                </button>
              )}
              <button 
                onClick={handleApplyFilters}
                className="bg-gradient-to-r from-orange-500 to-red-600 text-white font-extrabold text-xs px-7 py-3 rounded-xl flex items-center gap-2 shadow-md shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 active:scale-[0.97] transition-all tracking-wide"
              >
                <Check size={14} /> Tìm kiếm ngay
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 📱 KHU VỰC MOBILE DRAWER MODAL - SỬA LỖI TRÀN NỘI DUNG VÀ DÍNH NÚT GIỮA CÁC KHỐI LỌC */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsDrawerOpen(false)} />
          
          <div className="relative bg-white rounded-t-3xl shadow-2xl h-[75vh] flex flex-col z-10 overflow-hidden animate-in slide-in-from-bottom duration-300">
            
            {/* Header Drawer */}
            <div className="flex items-center justify-between border-b border-gray-100 p-4 shrink-0">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-orange-500" />
                <h4 className="font-bold text-gray-800 text-sm">Bộ lọc nâng cao</h4>
              </div>
              <button onClick={() => setIsDrawerOpen(false)} className="text-gray-400 p-1 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            {/* Thân cuộn: Đã tăng pb-40 để khi cuộn xuống cùng, ô Nhóm đặc quyền hoàn toàn hiển thị trọn vẹn, không bao giờ dính nút bấm bên dưới */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-40">
              <FilterFields />
            </div>

            {/* Khối chứa nút hành động cố định sát đáy: Đã căn lề chuẩn mb-20 để tạo khoảng trắng cách ly hoàn toàn với 3 nút cuộc gọi/Zalo hệ thống */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent shrink-0 pb-20 shadow-[0_-12px_30px_rgba(0,0,0,0.04)] z-20">
              <div className="bg-white p-1 rounded-2xl border border-gray-100 shadow-md flex gap-2 mb-4">
                <button 
                  onClick={handleResetFilters}
                  className="w-1/3 border border-gray-200 text-slate-600 font-bold text-xs py-3.5 rounded-xl text-center bg-slate-50 active:scale-[0.98] transition-transform"
                >
                  Đặt lại
                </button>
                <button 
                  onClick={handleApplyFilters}
                  className="w-2/3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-extrabold text-xs py-3.5 rounded-xl text-center shadow-md shadow-orange-500/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-1.5"
                >
                  <Check size={14} /> Áp dụng ngay
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 2. DANH SÁCH SẢN PHẨM */}
      <main id="listing-section" className="max-w-7xl mx-auto w-full px-4 mt-16 mb-20 scroll-mt-28">
        {currentItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentItems.map((item) => {
              const thumbnail = layUrlAnhChuan(item.anh);
              const displayLocation = item.diaChi || item.diaChiFull || item.khuVucFull || "Đà Nẵng";
              const displayTime = item.ngayDang || item.ngay || "";

              const textLower = cleanVietnameseText((item.tieude || "") + " " + (item.mota || item.moTa || "") + " " + (item.tag || ""));
              const isChinhChu = textLower.includes("chinh chu");
              const isMatTien = textLower.includes("mat tien");
              const isSapHam = textLower.includes("sap ham") || textLower.includes("gia re");

              let cauTrucPhong = "---";
              const currentLoaiHinh = item.phân_loại || item.loaiHinh || '';
              
              if (cleanVietnameseText(currentLoaiHinh).includes("dat")) {
                cauTrucPhong = "Đất trống";
              } else {
                const combinedText = ((item.tieude || "") + " " + (item.mota || item.moTa || "")).toLowerCase();
                const matchTangResult = combinedText.match(/(\d+)\s*(tầng|tang)/i);
                const matchPhongResult = combinedText.match(/(\d+)\s*(pn|phòng ngủ|phong ngu)/i);
                
                if (matchTangResult && matchPhongResult) {
                  cauTrucPhong = `${matchTangResult[1]} Tầng - ${matchPhongResult[1]} PN`;
                } else if (matchTangResult) {
                  cauTrucPhong = `${matchTangResult[1]} Tầng`;
                } else if (matchPhongResult) {
                  cauTrucPhong = `${matchPhongResult[1]} PN`;
                } else {
                  cauTrucPhong = "Nhà ở";
                }
              }

              return (
                <a 
                  href={`/nha-dat/${item.slug}`}
                  key={item.id}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 flex flex-col h-full relative transform hover:-translate-y-1 block"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                    <Image src={thumbnail} alt={item.tieude || "Trần Huy Land"} fill className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out" sizes="(max-w-7xl) 100vw" priority />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                      {isSapHam && (
                        <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-md uppercase tracking-wider animate-pulse">
                          🔥 Sập Hầm
                        </span>
                      )}
                      {isChinhChu && (
                        <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-md uppercase tracking-wider">
                          ✓ Chính Chủ
                        </span>
                      )}
                      {isMatTien && (
                        <span className="bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-md uppercase tracking-wider">
                          🏢 Mặt Tiền
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-extrabold text-sm px-3.5 py-1.5 rounded-xl shadow-lg border border-orange-400/20 z-10 tracking-wide transform group-hover:scale-110 transition-transform duration-300">
                      {item.gia}
                    </div>
                  </div>

                  <div className="p-4 flex flex-col flex-grow justify-between">
                    <div>
                      <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        <span className="truncate">{displayLocation}</span>
                      </div>

                      <h3 className="text-gray-800 font-bold text-base line-clamp-2 group-hover:text-orange-500 transition-colors duration-200 mb-3 min-h-[3rem] leading-snug">
                        {item.tieude}
                      </h3>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-gray-50 text-gray-600 text-xs">
                      <div className="flex flex-col items-center justify-center bg-gray-50/60 rounded-lg py-1.5 border border-gray-100/50">
                        <Square className="w-3.5 h-3.5 text-orange-500 mb-0.5" />
                        <span className="font-semibold text-gray-700 truncate max-w-full px-1">{item.dienTich || "---"}</span>
                      </div>

                      <div className="flex flex-col items-center justify-center bg-gray-50/60 rounded-lg py-1.5 border border-gray-100/50">
                        <Compass className="w-3.5 h-3.5 text-orange-500 mb-0.5" />
                        <span className="font-semibold text-gray-700 truncate max-w-full px-1">{item.huong || "---"}</span>
                      </div>

                      <div className="flex flex-col items-center justify-center bg-gray-50/60 rounded-lg py-1.5 border border-gray-100/50">
                        <BedDouble className="w-3.5 h-3.5 text-orange-500 mb-0.5" />
                        <span className="font-semibold text-gray-700 truncate max-w-full px-1">{cauTrucPhong}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2">
                      <span className="text-[11px] text-gray-400 italic flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-300" /> {formatTimeAgo(displayTime)}
                      </span>
                      <span className="text-orange-500 text-xs font-bold inline-flex items-center gap-0.5 group-hover:translate-x-1 transition-transform duration-200">
                        Xem chi tiết <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400 font-medium bg-slate-50 rounded-3xl border border-dashed">
            Không tìm thấy sản phẩm bất động sản nào phù hợp với bộ lọc.
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            {Array.from({ length: totalPages }, (_, idx) => (
              <button 
                key={idx} 
                onClick={(e) => { 
                  e.preventDefault(); 
                  setCurrentPage(idx + 1); 
                  const element = document.getElementById("listing-section");
                  if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
                }} 
                className={`w-9 h-9 rounded-xl text-sm transition-all font-bold ${
                  currentPage === idx + 1 ? "bg-orange-500 text-white scale-105 shadow-md shadow-orange-500/20" : "bg-white border text-slate-600 hover:bg-slate-50"
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
