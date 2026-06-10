'use client';
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { MapPin, Compass, Clock, Square, ChevronRight, BedDouble, SlidersHorizontal, X } from "lucide-react";

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
  const [khuVuc, setKhuVuc] = useState(forceDistrict || "all");
  const [loaiHinh, setLoaiHinh] = useState("all");
  const [khoangGia, setKhoangGia] = useState("all");
  const [huong, setHuong] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");

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

    if (khuVuc !== "all") {
      result = result.filter((i: any) => {
        const checkDiaChi = cleanVietnameseText(i.diaChi || i.diaChiFull || i.diChi || i.dia_chi || "");
        const checkKhuVuc = cleanVietnameseText(i.khuVucFull || i.khuVuc || "");
        const targetKhuVuc = cleanVietnameseText(khuVuc);
        return checkDiaChi.includes(targetKhuVuc) || checkKhuVuc.includes(targetKhuVuc);
      });
    }
    if (loaiHinh !== "all") {
      result = result.filter((i: any) => {
        const checkPhanLoai = cleanVietnameseText(i.phân_loại || i.phanLoai || i.loaiHinh || "");
        const checkTieude = cleanVietnameseText(i.tieude || i.tieuDe || "");
        const targetLoaiHinh = cleanVietnameseText(loaiHinh);
        return checkPhanLoai.includes(targetLoaiHinh) || checkTieude.includes(targetLoaiHinh);
      });
    }
    if (khoangGia !== "all") {
      const parseGia = (giaStr: string) => {
        if (!giaStr) return 0;
        const num = parseFloat(giaStr.replace(/[^0-9.]/g, ""));
        return isNaN(num) ? 0 : num;
      };
      const getGiaNumber = (item: any) => Number(item.soGia) || parseGia(item.gia);

      if (khoangGia === "duoi3") result = result.filter(i => getGiaNumber(i) < 3.0);
      else if (khoangGia === "3to5") result = result.filter(i => getGiaNumber(i) >= 3.0 && getGiaNumber(i) <= 5.0);
      else if (khoangGia === "tren5") result = result.filter(i => getGiaNumber(i) > 5.0);
    }
    if (huong !== "all") {
      result = result.filter((i: any) => cleanVietnameseText(i.huong || "").includes(cleanVietnameseText(huong)));
    }
    if (selectedTag === "mattien") {
      result = result.filter((i: any) => i.isMatTien === true || cleanVietnameseText(i.tieude || "").includes("mat tien") || cleanVietnameseText(i.tag || "").includes("mat tien") || cleanVietnameseText(i.mota || i.moTa || "").includes("mat tien"));
    } else if (selectedTag === "chinhchu") {
      result = result.filter((i: any) => cleanVietnameseText(i.tag || "").includes("chinh chu") || cleanVietnameseText(i.mota || i.moTa || "").includes("chinh chu") || cleanVietnameseText(i.tieude || "").includes("chinh chu"));
    }
    
    setFilteredItems(result);
  }, [khuVuc, loaiHinh, khoangGia, huong, selectedTag, safeBdsItems]);

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

  const handleFilterChange = (filterType: string, value: string) => {
    if (filterType === "khuVuc") setKhuVuc(value);
    if (filterType === "loaiHinh") setLoaiHinh(value);
    if (filterType === "khoangGia") setKhoangGia(value);
    if (filterType === "huong") setHuong(value);
    if (filterType === "tag") setSelectedTag(value);
    setCurrentPage(1);
  };

  const activeFiltersCount = 
    (khuVuc !== "all" ? 1 : 0) + 
    (khoangGia !== "all" ? 1 : 0) + 
    (huong !== "all" ? 1 : 0) + 
    (selectedTag !== "all" ? 1 : 0);

  const currentItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const FilterFields = () => (
    <>
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1 tracking-wider">Phường / Xã</label>
        <select disabled={!!forceDistrict} value={khuVuc} onChange={(e) => handleFilterChange("khuVuc", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold focus:outline-none focus:border-orange-500 text-slate-700">
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
        <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1 tracking-wider">Khoảng Giá</label>
        <select value={khoangGia} onChange={(e) => handleFilterChange("khoangGia", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold focus:outline-none focus:border-orange-500 text-slate-700">
          <option value="all">Tất cả mức giá</option>
          <option value="duoi3">Dưới 3 Tỷ</option>
          <option value="3to5">Từ 3 - 5 Tỷ</option>
          <option value="tren5">Trên 5 Tỷ</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1 tracking-wider">Hướng Nhà</label>
        <select value={huong} onChange={(e) => handleFilterChange("huong", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold focus:outline-none focus:border-orange-500 text-slate-700">
          <option value="all">Tất cả các hướng</option>
          <option value="Đông">Hướng Đông</option>
          <option value="Tây">Hướng Tây</option>
          <option value="Nam">Hướng Nam</option>
          <option value="Bắc">Hướng Bắc</option>
        </select>
      </div>
    </>
  );

  return (
    <>
      {/* 1. HỆ THỐNG BỘ LỌC TÌM KIẾM CHI TIẾT CHUYÊN NGHIỆP */}
      <section className="max-w-7xl mx-auto w-full px-4 -mt-10 relative z-10">
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-xl space-y-4">
          
          {/* HÀNG TAB CHỌN NHANH LOẠI HÌNH - ĐÃ SỬA CÂN ĐỐI FULL CHIỀU RỘNG */}
          <div className="flex border-b border-gray-100 pb-3 items-center justify-between gap-4">
            <div className="flex-1 max-w-xl flex gap-1 bg-gray-100 p-1 rounded-xl">
              <button 
                onClick={() => handleFilterChange("loaiHinh", "all")}
                className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${loaiHinh === "all" ? "bg-white text-orange-500 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
              >
                Tất Cả BDS
              </button>
              <button 
                onClick={() => handleFilterChange("loaiHinh", "Đất nền")}
                className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${loaiHinh === "Đất nền" ? "bg-white text-orange-500 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
              >
                ⛳ Đất Nền
              </button>
              <button 
                onClick={() => handleFilterChange("loaiHinh", "Nhà phố")}
                className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${loaiHinh === "Nhà phố" ? "bg-white text-orange-500 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
              >
                🏠 Nhà Phố
              </button>
            </div>

            {/* NÚT BẤM MỞ ĐIỀU KHIỂN BỘ LỌC TRÊN MOBILE */}
            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="md:hidden flex items-center gap-1.5 bg-orange-50 text-orange-600 px-4 py-2.5 rounded-xl text-xs font-bold border border-orange-100 shrink-0"
            >
              <SlidersHorizontal size={14} />
              Lọc nâng cao {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </button>
          </div>

          {/* GIAO DIỆN BỘ LỌC TRÊN MÁY TÍNH */}
          <div className="hidden md:grid md:grid-cols-3 md:gap-4">
            <FilterFields />
          </div>

          {/* THANH THẺ TAG DƯỚI ĐÁY BỘ LỌC */}
          <div className="hidden md:flex flex-wrap gap-2 pt-1 items-center">
            <button onClick={() => handleFilterChange("tag", "all")} className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors ${selectedTag === "all" ? "bg-slate-900 text-white" : "bg-white border text-slate-600 hover:bg-slate-50"}`}>Tất Cả Tin</button>
            <button onClick={() => handleFilterChange("tag", "mattien")} className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors ${selectedTag === "mattien" ? "bg-slate-900 text-white" : "bg-white border text-slate-600 hover:bg-slate-50"}`}>🏢 Mặt Tiền Kinh Doanh</button>
            <button onClick={() => handleFilterChange("tag", "chinhchu")} className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors ${selectedTag === "chinhchu" ? "bg-slate-900 text-white" : "bg-white border text-slate-600 hover:bg-slate-50"}`}>✓ Hàng Chính Chủ</button>
          </div>

        </div>
      </section>

      {/* MOBILE DRAWER MODAL */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setIsDrawerOpen(false)} />
          <div className="relative bg-white rounded-t-3xl p-5 space-y-5 shadow-2xl max-h-[85vh] overflow-y-auto z-10">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-orange-500" />
                <h4 className="font-bold text-gray-800 text-sm">Bộ lọc nâng cao</h4>
              </div>
              <button onClick={() => setIsDrawerOpen(false)} className="text-gray-400 p-1 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <FilterFields />
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Nhóm đặc quyền</label>
                <div className="flex flex-col gap-2">
                  <button onClick={() => { handleFilterChange("tag", "all"); setIsDrawerOpen(false); }} className={`text-left text-xs font-bold p-3 rounded-xl border ${selectedTag === "all" ? "bg-orange-50 border-orange-300 text-orange-600" : "bg-white text-slate-600"}`}>Tất Cả Sản Phẩm</button>
                  <button onClick={() => { handleFilterChange("tag", "mattien"); setIsDrawerOpen(false); }} className={`text-left text-xs font-bold p-3 rounded-xl border ${selectedTag === "mattien" ? "bg-orange-50 border-orange-300 text-orange-600" : "bg-white text-slate-600"}`}>🏢 Mặt Tiền Kinh Doanh</button>
                  <button onClick={() => { handleFilterChange("tag", "chinhchu"); setIsDrawerOpen(false); }} className={`text-left text-xs font-bold p-3 rounded-xl border ${selectedTag === "chinhchu" ? "bg-orange-50 border-orange-300 text-orange-600" : "bg-white text-slate-600"}`}>✓ Hàng Chính Chủ</button>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-sm py-3 rounded-xl text-center shadow-lg"
              >
                Áp dụng bộ lọc {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </button>
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

              // 🔥 SỬA TRIỆT ĐỂ: THUẬT TOÁN QUÉT SỐ PHÒNG/TẦNG KHÔNG BỊ LỖI CHỮ THÔ
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
