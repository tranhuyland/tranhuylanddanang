'use client';
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { MapPin, Compass, Clock, Square, ChevronRight, PenTool } from "lucide-react";
import { Modals } from "./Modals";

interface ListingSectionProps {
  allBdsItems: any[];
  forceDistrict?: string;
}

export default function ListingSection({ allBdsItems = [], forceDistrict }: ListingSectionProps) {
  const safeBdsItems = Array.isArray(allBdsItems) ? allBdsItems : [];

  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [khuVuc, setKhuVuc] = useState(forceDistrict || "all");
  const [loaiHinh, setLoaiHinh] = useState("all");
  const [khoangGia, setKhoangGia] = useState("all");
  const [huong, setHuong] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");

  const [modalType, setModalType] = useState<"bds" | "kygui" | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPage = sessionStorage.getItem("bds_page");
      if (savedPage) {
        setCurrentPage(parseInt(savedPage, 10));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && currentPage > 0) {
      sessionStorage.setItem("bds_page", currentPage.toString());
    }
  }, [currentPage]);

  // Bộ lọc tìm kiếm kết hợp TỰ ĐỘNG SẮP XẾP BÀI MỚI NHẤT LÊN ĐẦU TIÊN
  useEffect(() => {
    let result = [...safeBdsItems];

    // LOGIC SẮP XẾP SẢN PHẨM MỚI NHẤT LÊN ĐẦU TIÊN
    result.sort((a, b) => {
      const dateA = a.ngayDang || a.ngay || "";
      const dateB = b.ngayDang || b.ngay || "";

      if (dateA && dateB) {
        const parseDate = (dStr: string) => {
          const parts = dStr.split(/[-/]/);
          if (parts.length === 3) {
            // Chuyển đổi định dạng ngày DD/MM/YYYY để so sánh chính xác mốc thời gian
            return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10)).getTime();
          }
          return 0;
        };
        const diff = parseDate(dateB) - parseDate(dateA);
        if (diff !== 0) return diff; 
      }
      // Nếu trùng ngày hoặc không có ngày đăng, xếp theo ID giảm dần (ID lớn xếp trước)
      return (Number(b.id) || 0) - (Number(a.id) || 0);
    });

    // HỆ THỐNG BỘ LỌC DỮ LIỆU
    if (khuVuc !== "all") {
      result = result.filter(i => 
        i.diaChi?.toLowerCase().includes(khuVuc.toLowerCase()) || 
        i.khuVucFull?.toLowerCase().includes(khuVuc.toLowerCase()) ||
        i.khuVuc?.toLowerCase().includes(khuVuc.toLowerCase())
      );
    }
    if (loaiHinh !== "all") {
      result = result.filter(i => 
        i.phân_loại?.toLowerCase().includes(loaiHinh.toLowerCase()) || 
        i.loaiHinh?.toLowerCase().includes(loaiHinh.toLowerCase()) || 
        i.tieude?.toLowerCase().includes(loaiHinh.toLowerCase())
      );
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
      result = result.filter(i => i.huong?.toLowerCase().includes(huong.toLowerCase()));
    }
    if (selectedTag === "mattien") {
      result = result.filter(i => i.isMatTien === true || i.tieude?.toLowerCase().includes("mặt tiền") || i.tag?.toLowerCase().includes("mặt tiền"));
    } else if (selectedTag === "chinhchu") {
      result = result.filter(i => i.tag?.toLowerCase().includes("chính chủ") || i.mota?.toLowerCase().includes("chính chủ"));
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
    if (typeof window !== "undefined") {
      sessionStorage.setItem("bds_page", "1");
    }
  };

  const itemsPerPage = 6;
  const currentItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  return (
    <>
      {/* THANH BỘ LỌC TÌM KIẾM */}
      <section className="max-w-7xl mx-auto w-full px-4 -mt-10 relative z-10">
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-xl space-y-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1 tracking-wider">Khu Vực</label>
              <select disabled={!!forceDistrict} value={khuVuc} onChange={(e) => handleFilterChange("khuVuc", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold focus:outline-none focus:border-amber-500 text-slate-700">
                <option value="all">Tất cả Quận Huyện</option><option value="Hải Châu">Quận Hải Châu</option><option value="Thanh Khê">Quận Thanh Khê</option><option value="Liên Chiểu">Quận Liên Chiểu</option><option value="Cẩm Lệ">Quận Cẩm Lệ</option><option value="Sơn Trà">Quận Sơn Trà</option><option value="Ngũ Hành Sơn">Quận Ngũ Hành Sơn</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1 tracking-wider">Loại Hình</label>
              <select value={loaiHinh} onChange={(e) => handleFilterChange("loaiHinh", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold focus:outline-none focus:border-amber-500 text-slate-700">
                <option value="all">Tất cả Loại hình</option><option value="Nhà phố">Nhà phố / Kiệt</option><option value="Đất nền">Đất nền / Đất ở</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1 tracking-wider">Khoảng Giá</label>
              <select value={khoangGia} onChange={(e) => handleFilterChange("khoangGia", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold focus:outline-none focus:border-amber-500 text-slate-700">
                <option value="all">Tất cả mức giá</option><option value="duoi3">Dưới 3 Tỷ</option><option value="3to5">Từ 3 - 5 Tỷ</option><option value="tren5">Trên 5 Tỷ</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1 tracking-wider">Hướng Nhà</label>
              <select value={huong} onChange={(e) => handleFilterChange("huong", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold focus:outline-none focus:border-amber-500 text-slate-700">
                <option value="all">Tất cả các hướng</option><option value="Đông">Hướng Đông</option><option value="Tây">Hướng Tây</option><option value="Nam">Hướng Nam</option><option value="Bắc">Hướng Bắc</option>
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100 items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center">
              <button onClick={() => handleFilterChange("tag", "all")} className={`text-xs font-bold px-4 py-2 rounded-xl ${selectedTag === "all" ? "bg-slate-900 text-white" : "bg-white border text-slate-600"}`}>Tất Cả</button>
              <button onClick={() => handleFilterChange("tag", "mattien")} className={`text-xs font-bold px-4 py-2 rounded-xl ${selectedTag === "mattien" ? "bg-slate-900 text-white" : "bg-white border text-slate-600"}`}>Mặt Tiền Kinh Doanh</button>
              <button onClick={() => handleFilterChange("tag", "chinhchu")} className={`text-xs font-bold px-4 py-2 rounded-xl ${selectedTag === "chinhchu" ? "bg-slate-900 text-white" : "bg-white border text-slate-600"}`}>Hàng Chính Chủ</button>
            </div>
            <button onClick={() => { setModalType("kygui"); setSelectedProduct(null); }} className="bg-amber-500 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md hover:bg-amber-600 transition-colors">
              <PenTool size={14} /> Ký gửi nhà đất
            </button>
          </div>
        </div>
      </section>

      {/* DANH SÁCH LƯỚI SẢN PHẨM */}
      <main id="listing-section" className="max-w-7xl mx-auto w-full px-4 mt-16 mb-20 scroll-mt-28">
        {currentItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {currentItems.map((item) => {
              const thumbnail = layUrlAnhChuan(item.anh);
              const displayLocation = item.diaChi || item.khuVucFull || "Đà Nẵng";
              const displayTime = item.ngayDang || item.ngay || "";

              return (
                <div 
                  key={item.id}
                  onClick={() => { setSelectedProduct(item); setModalType("bds"); }}
                  className="cursor-pointer bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group transform hover:-translate-y-1"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    <Image src={thumbnail} alt={item.tieude || "Trần Huy Land"} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-w-7xl) 100vw" priority />
                    <span className="absolute top-3 left-3 text-[10px] px-2.5 py-1 rounded-lg shadow-sm bg-slate-900 text-white font-medium">
                      {item.phân_loại || item.loaiHinh || 'Nhà Đất'}
                    </span>
                    {item.huong && (
                      <span className="absolute top-3 right-3 bg-white/95 text-slate-800 font-extrabold text-[10px] px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1">
                        <Compass className="w-3 h-3 text-amber-500" />{item.huong}
                      </span>
                    )}
                    <span className="absolute bottom-3 left-3 bg-black/60 text-white text-[10px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" /> {formatTimeAgo(displayTime)}
                    </span>
                    <span className="absolute bottom-3 right-3 bg-slate-900/90 text-white font-extrabold text-sm px-3 py-1 rounded-xl shadow-md">
                      {item.gia}
                    </span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                        <MapPin className="w-3.5 h-3.5 text-amber-500" />
                        <span className="truncate">{displayLocation}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 line-clamp-2 group-hover:text-amber-500 text-sm sm:text-base leading-snug transition-colors">
                        {item.tieude}
                      </h3>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-slate-500 text-sm font-medium">
                      <div className="text-xs text-slate-400 flex items-center gap-3">
                        <span><Square className="w-3.5 h-3.5 inline mr-0.5" /> {item.dienTich || "---"}</span>
                      </div>
                      <span className="text-amber-500 font-bold flex items-center gap-0.5 text-xs uppercase tracking-wider">
                        Chi tiết <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400 font-medium bg-slate-50 rounded-3xl border border-dashed">
            Không tìm thấy sản phẩm bất động sản nào phù hợp với bộ lọc.
          </div>
        )}

        {/* PHÂN TRANG */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10">
            {Array.from({ length: totalPages }, (_, idx) => (
              <button 
                key={idx} 
                onClick={(e) => { 
                  e.preventDefault(); 
                  setCurrentPage(idx + 1); 
                  window.scrollTo({ top: 350, behavior: "smooth" }); 
                }} 
                className={`w-9 h-9 rounded-xl text-sm transition-all font-bold ${
                  currentPage === idx + 1 ? "bg-amber-500 text-slate-900 scale-105" : "bg-white border text-slate-600 hover:bg-slate-50"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        )}
      </main>

      {/* POPUP MODALS ĐA NĂNG */}
      {modalType && (
        <Modals 
          type={modalType} 
          isOpen={!!modalType} 
          onClose={() => { setModalType(null); setSelectedProduct(null); }} 
          item={selectedProduct} 
        />
      )}
    </>
  );
}
