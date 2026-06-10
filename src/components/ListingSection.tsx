'use client';
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { MapPin, Compass, Clock, Square, ChevronRight, PenTool } from "lucide-react";
import { Modals } from "./Modals";

interface ListingSectionProps {
  allBdsItems: any[];
  forceDistrict?: string;
}

// Thuật toán dọn dẹp bảng mã Unicode và loại bỏ dấu tiếng Việt để so sánh ngầm dứt điểm lỗi kẹt chữ
const cleanVietnameseText = (str: string) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")                  // Phân tách ký tự dấu ra khỏi nguyên âm gốc
    .replace(/[\u0300-\u036f]/g, "")  // Xóa sạch toàn bộ các ký tự dấu (huyền, sắc, hỏi, ngã, nặng)
    .replace(/đ/g, "d")                // Đồng bộ chữ đ thành d
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

  const [modalType, setModalType] = useState<"kygui" | null>(null);
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

  // Bộ lọc kết hợp logic TỰ ĐỘNG SẮP XẾP SẢN PHẨM MỚI NHẤT LÊN ĐẦU TIÊN
  useEffect(() => {
    let result = [...safeBdsItems];

    // THUẬT TOÁN ĐẢO TIN MỚI ĐĂNG LÊN ĐẦU (Khắc phục lỗi định dạng ngày Việt Nam)
    result.sort((a: any, b: any) => {
      const dateStrA = a.ngayDang || a.ngay || "";
      const dateStrB = b.ngayDang || b.ngay || "";

      // Hàm bóc tách chuỗi ngày dạng DD/MM/YYYY thành giá trị số miligiây chính xác để so sánh
      const convertToTimestamp = (dStr: string) => {
        if (!dStr) return 0;
        const parts = dStr.split(/[-/]/);
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1; // Tháng trong JS tính từ 0 - 11
          const year = parseInt(parts[2], 10);
          return new Date(year, month, day).getTime();
        }
        return 0;
      };

      const timeA = convertToTimestamp(dateStrA);
      const timeB = convertToTimestamp(dateStrB);

      // Sắp xếp giảm dần: thời gian lớn hơn (mới hơn) sẽ đứng trước
      if (timeB !== timeA) {
        return timeB - timeA;
      }
      
      // Nếu trùng ngày hoặc không có ngày đăng, xếp theo ID giảm dần (Hàng nhập sau lên đầu)
      return (Number(b.id) || 0) - (Number(a.id) || 0);
    });

    // Hệ thống các bộ lọc nâng cao kết hợp hàm xóa dấu thông minh chống lệch Unikey
    if (khuVuc !== "all") {
      result = result.filter((i: any) => {
        const checkDiaChi = cleanVietnameseText(i.diaChi || i.diChi || i.dia_chi || "");
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
      result = result.filter((i: any) => i.isMatTien === true || cleanVietnameseText(i.tieude || "").includes("mat tien") || cleanVietnameseText(i.tag || "").includes("mat tien"));
    } else if (selectedTag === "chinhchu") {
      result = result.filter((i: any) => cleanVietnameseText(i.tag || "").includes("chinh chu") || cleanVietnameseText(i.mota || i.moTa || "").includes("chinh chu"));
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

  const currentItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  return (
    <>
      {/* 1. THANH BỘ LỌC TÌM KIẾM CHI TIẾT THEO PHƯỜNG */}
      <section className="max-w-7xl mx-auto w-full px-4 -mt-10 relative z-10">
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-xl space-y-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1 tracking-wider">Phường / Xã</label>
              <select disabled={!!forceDistrict} value={khuVuc} onChange={(e) => handleFilterChange("khuVuc", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold focus:outline-none focus:border-amber-500 text-slate-700">
                <option value="all">Tất cả Vị trí</option>
                
                {/* DANH SÁCH 16 PHƯỜNG CHUẨN CỦA ANH */}
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

                {/* DANH SÁCH 3 XÃ CHUẨN CỦA ANH */}
                <option disabled className="font-bold text-slate-400 bg-slate-100">-- Danh sách Xã --</option>
                <option value="Hòa Bắc">Hòa Bắc</option>
                <option value="Hòa Liên">Hòa Liên</option>
                <option value="Hòa Ninh">Hòa Ninh</option>
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
            <button onClick={() => setModalType("kygui")} className="bg-amber-500 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md hover:bg-amber-600 transition-colors">
              <PenTool size={14} /> Ký gửi nhà đất
            </button>
          </div>
        </div>
      </section>

      {/* 2. DANH SÁCH SẢN PHẨM NHẢY URL TRANG RIÊNG BIỆT */}
      <main id="listing-section" className="max-w-7xl mx-auto w-full px-4 mt-16 mb-20 scroll-mt-28">
        {currentItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {currentItems.map((item) => {
              const thumbnail = layUrlAnhChuan(item.anh);
              const displayLocation = item.diaChi || item.diaChiFull || item.khuVucFull || "Đà Nẵng";
              const displayTime = item.ngayDang || item.ngay || "";

              return (
                <a 
                  href={`/nha-dat/${item.slug}`}
                  key={item.id}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group transform hover:-translate-y-1 block"
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
                </a>
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
                  const element = document.getElementById("listing-section");
                  if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
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

      {/* POPUP FORM KÝ GỬI */}
      {modalType === "kygui" && (
        <Modals 
          type="kygui" 
          isOpen={true} 
          onClose={() => setModalType(null)} 
        />
      )}
    </>
  );
}
