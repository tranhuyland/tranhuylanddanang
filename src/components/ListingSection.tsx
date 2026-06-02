'use client';
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RealEstateItem } from "@/lib/googleSheets";
import { MapPin, Compass, Clock, Square, Bed, ChevronRight, X, ArrowLeft } from "lucide-react";

interface ListingSectionProps { allBdsItems: RealEstateItem[]; forceDistrict?: string; }

export default function ListingSection({ allBdsItems, forceDistrict }: ListingSectionProps) {
  const router = useRouter();
  const [filteredItems, setFilteredItems] = useState<RealEstateItem[]>(allBdsItems);
  const [khuVuc, setKhuVuc] = useState(forceDistrict || "all");
  const [loaiHinh, setLoaiHinh] = useState("all");
  const [khoangGia, setKhoangGia] = useState("all");
  const [huong, setHuong] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");
  
  // State quản lý sản phẩm được chọn để hiển thị Popup
  const [selectedProduct, setSelectedProduct] = useState<RealEstateItem | null>(null);
  
  // Biến cờ hiệu ngăn chặn việc tự reset trang khi click xem chi tiết
  const [isNavigating, setIsNavigating] = useState(false);

  const [currentPage, setCurrentPage] = useState(() => {
    if (typeof window !== "undefined") {
      return parseInt(sessionStorage.getItem("bds_page") || "1");
    }
    return 1;
  });
  const itemsPerPage = 6;

  // Khóa cuộn trang của nền khi Popup mở (giúp trải nghiệm giống như trang mới hoàn toàn)
  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedProduct]);

  // Tự động cuộn lên đầu danh sách sản phẩm khi đổi trang
  useEffect(() => {
    if (isNavigating) return;
    sessionStorage.setItem("bds_page", currentPage.toString());
    
    const element = document.getElementById("listing-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [currentPage, isNavigating]);

  // Bộ lọc tìm kiếm
  useEffect(() => {
    if (isNavigating) return;

    let result = allBdsItems;
    if (khuVuc !== "all") result = result.filter(i => i.khuVuc === khuVuc);
    if (loaiHinh !== "all") result = result.filter(i => i.loaiHinh === loaiHinh);
    if (khoangGia !== "all") {
      if (khoangGia === "duoi3") result = result.filter(i => i.soGia < 3.0);
      else if (khoangGia === "3to5") result = result.filter(i => i.soGia >= 3.0 && i.soGia <= 5.0);
      else if (khoangGia === "tren5") result = result.filter(i => i.soGia > 5.0);
    }
    if (huong !== "all") result = result.filter(i => i.huong?.toLowerCase().includes(huong.toLowerCase()));
    if (selectedTag === "mattien") result = result.filter(i => i.isMatTien === true);
    else if (selectedTag === "chinhchu") result = result.filter(i => i.tag?.includes("Chính Chủ"));
    
    setFilteredItems(result);
    
    const savedPage = parseInt(sessionStorage.getItem("bds_page") || "1");
    if (savedPage === 1) {
      setCurrentPage(1);
    }
  }, [khuVuc, loaiHinh, khoangGia, huong, selectedTag, allBdsItems, isNavigating]);

  const formatTimeAgo = (dateStr: string) => {
    if (!dateStr) return "Tin mới";
    const parts = dateStr.split(/[-/]/);
    if (parts.length !== 3) return "Hôm nay";
    const day = parseInt(parts[0], 10), month = parseInt(parts[1], 10) - 1, year = parseInt(parts[2], 10);
    const ngayDang = new Date(year, month, day), homNay = new Date();
    ngayDang.setHours(0,0,0,0); homNay.setHours(0,0,0,0);
    const diffDays = Math.floor((homNay.getTime() - ngayDang.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "Hôm nay";
    if (diffDays === 1) return "1 ngày trước";
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return `${Math.floor(diffDays / 7)} tuần trước`;
  };

  const layUrlAnhChuan = (chuoiAnh: string) => {
    if (!chuoiAnh) return 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80';
    const danhSach = chuoiAnh.split(",").map(a => a.trim()).filter(a => a !== "" && a.startsWith("http"));
    return danhSach.length > 0 ? danhSach[0] : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80';
  };

  const getTagStyle = (tagText: string) => {
    const text = tagText?.toLowerCase() || "";
    if (text.includes("sập hầm") || text.includes("cắt lỗ") || text.includes("ngộp")) {
      return "bg-red-600 text-white font-black uppercase tracking-wider animate-pulse";
    }
    if (text.includes("mặt tiền")) {
      return "bg-amber-500 text-slate-950 font-black uppercase tracking-wider";
    }
    if (text.includes("chính chủ")) {
      return "bg-emerald-600 text-white font-bold uppercase tracking-wider";
    }
    return "bg-slate-900 text-white font-medium";
  };

  const handleViewDetail = (slug: string) => {
    setIsNavigating(true);
    router.push(`/nha-dat/${slug}`);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  return (
    <>
      <section className="max-w-7xl mx-auto w-full px-4 -mt-10 relative z-10">
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-xl space-y-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1 tracking-wider">Khu Vực</label>
              <select disabled={!!forceDistrict} value={khuVuc} onChange={(e) => { sessionStorage.setItem("bds_page", "1"); setKhuVuc(e.target.value); }} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold focus:outline-none focus:border-amber-500 text-slate-700">
                <option value="all">Tất cả Quận Huyện</option>
                <option value="Hải Châu">Quận Hải Châu</option><option value="Thanh Khê">Quận Thanh Khê</option>
                <option value="Liên Chiểu">Quận Liên Chiểu</option><option value="Cẩm Lệ">Quận Cẩm Lệ</option>
                <option value="Sơn Trà">Quận Sơn Trà</option><option value="Ngũ Hành Sơn">Quận Ngũ Hành Sơn</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1 tracking-wider">Loại Hình</label>
              <select value={loaiHinh} onChange={(e) => { sessionStorage.setItem("bds_page", "1"); setLoaiHinh(e.target.value); }} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold focus:outline-none focus:border-amber-500 text-slate-700">
                <option value="all">Tất cả Loại hình</option><option value="Nhà phố">Nhà phố / Kiệt</option><option value="Đất nền">Đất nền / Đất ở</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1 tracking-wider">Khoảng Giá</label>
              <select value={khoangGia} onChange={(e) => { sessionStorage.setItem("bds_page", "1"); setKhoangGia(e.target.value); }} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold focus:outline-none focus:border-amber-500 text-slate-700">
                <option value="all">Tất cả mức giá</option><option value="duoi3">Dưới 3 Tỷ</option><option value="3to5">Từ 3 - 5 Tỷ</option><option value="tren5">Trên 5 Tỷ</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1 tracking-wider">Hướng Nhà</label>
              <select value={huong} onChange={(e) => { sessionStorage.setItem("bds_page", "1"); setHuong(e.target.value); }} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold focus:outline-none focus:border-amber-500 text-slate-700">
                <option value="all">Tất cả các hướng</option><option value="Đông">Hướng Đông</option><option value="Tây">Hướng Tây</option><option value="Nam">Hướng Nam</option><option value="Bắc">Hướng Bắc</option>
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100 items-center">
            <button onClick={() => { sessionStorage.setItem("bds_page", "1"); setSelectedTag("all"); }} className={`text-xs font-bold px-4 py-2 rounded-xl ${selectedTag === "all" ? "bg-slate-900 text-white" : "bg-white border text-slate-600"}`}>Tất Cả</button>
            <button onClick={() => { sessionStorage.setItem("bds_page", "1"); setSelectedTag("mattien"); }} className={`text-xs font-bold px-4 py-2 rounded-xl ${selectedTag === "mattien" ? "bg-slate-900 text-white" : "bg-white border text-slate-600"}`}>Mặt Tiền Kinh Doanh</button>
            <button onClick={() => { sessionStorage.setItem("bds_page", "1"); setSelectedTag("chinhchu"); }} className={`text-xs font-bold px-4 py-2 rounded-xl ${selectedTag === "chinhchu" ? "bg-slate-900 text-white" : "bg-white border text-slate-600"}`}>Hàng Chính Chủ</button>
          </div>
        </div>
      </section>

      <main id="listing-section" className="max-w-7xl mx-auto w-full px-4 mt-16 mb-20 scroll-mt-28">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {currentItems.map((item) => {
            const thumbnail = layUrlAnhChuan(item.anh);
            return (
              <div 
                key={item.id}
                onClick={() => setSelectedProduct(item)}
                className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group transform hover:-translate-y-1 cursor-pointer"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <Image src={thumbnail} alt={item.tieude} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-w-7xl) 100vw" priority />
                  <span className={`absolute top-3 left-3 text-[10px] px-2.5 py-1 rounded-lg shadow-sm ${getTagStyle(item.tag)}`}>
                    {item.tag || 'Nhà Đất'}
                  </span>
                  {item.huong && <span className="absolute top-3 right-3 bg-white/95 text-slate-800 font-extrabold text-[10px] px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1"><Compass className="w-3 h-3 text-amber-500" />{item.huong}</span>}
                  <span className="absolute bottom-3 left-3 bg-black/60 text-white text-[10px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1"><Clock className="w-3 h-3 text-amber-400" /> {formatTimeAgo(item.ngayDang)}</span>
                  <span className="absolute bottom-3 right-3 bg-slate-900/90 text-white font-extrabold text-sm px-3 py-1 rounded-xl shadow-md">{item.gia}</span>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2"><MapPin className="w-3.5 h-3.5 text-amber-500" /><span className="truncate">{item.khuVucFull}</span></div>
                    <h3 className="font-bold text-slate-900 line-clamp-2 group-hover:text-amber-500 text-sm sm:text-base leading-snug transition-colors">{item.tieude}</h3>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-slate-500 text-sm font-medium">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-400"><span><Square className="w-3.5 h-3.5 inline mr-0.5" /> {item.dienTich}</span><span><Bed className="w-3.5 h-3.5 inline mr-0.5" /> {item.phongNgu || 'Đất ở'}</span></div>
                    <span className="text-amber-500 font-bold flex items-center gap-0.5 text-xs uppercase tracking-wider">Chi tiết <ChevronRight className="w-3 h-3" /></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10">
            {Array.from({ length: totalPages }, (_, idx) => (
              <button 
                key={idx} 
                onClick={(e) => { 
                  e.preventDefault(); 
                  setCurrentPage(idx + 1); 
                }} 
                className={`w-9 h-9 rounded-xl text-sm transition-all font-bold ${currentPage === idx + 1 ? "bg-amber-500 text-slate-900 scale-105" : "bg-white border text-slate-600"}`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        )}
      </main>

      {/* GIAO DIỆN POPUP PHỦ KÍN TOÀN MÀN HÌNH (FULL PAGE MODAL) */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-white z-[999] flex flex-col w-full h-screen overflow-y-auto animate-in fade-in slide-in-from-bottom duration-200">
          
          {/* Thanh tiêu đề trên cùng (Sticky Header) giống như app điện thoại */}
          <div className="sticky top-0 bg-white border-b border-slate-100 px-4 py-4 flex items-center gap-3 z-20 shadow-sm">
            <button 
              onClick={() => setSelectedProduct(null)}
              className="text-slate-800 hover:bg-slate-100 p-2 rounded-full transition-colors flex items-center justify-center"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1 truncate">
              <span className="text-[10px] font-bold uppercase text-amber-500 tracking-wider block mb-0.5">{selectedProduct.khuVucFull}</span>
              <h2 className="font-bold text-slate-900 text-sm truncate">{selectedProduct.tieude}</h2>
            </div>
            <button 
              onClick={() => setSelectedProduct(null)}
              className="text-slate-400 hover:bg-slate-100 p-2 rounded-full transition-colors flex items-center justify-center md:flex hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Phần nội dung chi tiết cuộn trang bên dưới */}
          <div className="w-full max-w-4xl mx-auto flex-1 pb-24">
            
            {/* Ảnh lớn và các Tag trạng thái */}
            <div className="relative w-full aspect-[16/10] sm:aspect-[21/9] bg-slate-100 sm:rounded-2xl sm:mt-4 overflow-hidden">
              <Image 
                src={layUrlAnhChuan(selectedProduct.anh)} 
                alt={selectedProduct.tieude} 
                fill 
                className="object-cover" 
                sizes="(max-w-4xl) 100vw"
                priority
              />
              <span className={`absolute top-4 left-4 text-xs px-3 py-1.5 rounded-xl shadow-md ${getTagStyle(selectedProduct.tag)}`}>
                {selectedProduct.tag || 'Nhà Đất'}
              </span>
              <span className="absolute bottom-4 right-4 bg-slate-900/95 text-amber-400 font-black text-lg px-5 py-2 rounded-2xl shadow-xl">
                {selectedProduct.gia}
              </span>
            </div>

            {/* Thông tin mô tả chi tiết sản phẩm */}
            <div className="p-4 sm:p-6 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{selectedProduct.khuVucFull}</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                  {selectedProduct.tieude}
                </h1>
              </div>

              {/* Hộp thông số tiện ích trực quan */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-5 rounded-2xl text-center border border-slate-100">
                <div className="flex flex-col items-center justify-center border-r border-slate-200">
                  <Square className="w-6 h-6 text-amber-500 mb-1" />
                  <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Diện tích</span>
                  <span className="text-base font-black text-slate-800 mt-0.5">{selectedProduct.dienTich}</span>
                </div>
                <div className="flex flex-col items-center justify-center border-r border-slate-200">
                  <Bed className="w-6 h-6 text-amber-500 mb-1" />
                  <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Phòng ngủ</span>
                  <span className="text-base font-black text-slate-800 mt-0.5">{selectedProduct.phongNgu || 'Đất ở'}</span>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <Compass className="w-6 h-6 text-amber-500 mb-1" />
                  <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Hướng</span>
                  <span className="text-base font-black text-slate-800 mt-0.5">{selectedProduct.huong || 'Chưa rõ'}</span>
                </div>
              </div>

              {/* Thông tin thời gian đăng */}
              <div className="flex items-center gap-2 text-xs text-slate-400 border-t border-slate-100 pt-4 font-medium">
                <Clock className="w-4 h-4" />
                <span>Cập nhật lịch đăng: {formatTimeAgo(selectedProduct.ngayDang)} vào ngày ({selectedProduct.ngayDang})</span>
              </div>
            </div>
          </div>

          {/* Thanh công cụ hành động dưới cùng cố định (Fixed Bottom Bar) */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20 flex justify-center">
            <div className="w-full max-w-4xl flex gap-3">
              <button 
                onClick={() => setSelectedProduct(null)}
                className="flex-1 bg-slate-100 text-slate-700 text-sm font-bold py-4 rounded-xl hover:bg-slate-200 transition-colors"
              >
                Quay lại danh sách
              </button>
              <button
                onClick={() => handleViewDetail(selectedProduct.slug)}
                className="flex-1 bg-amber-500 text-slate-900 text-sm font-bold py-4 rounded-xl hover:bg-amber-400 transition-colors text-center flex items-center justify-center gap-1 shadow-md shadow-amber-500/20"
              >
                Xem chi tiết & liên hệ <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      )}
    </>
  );
}
