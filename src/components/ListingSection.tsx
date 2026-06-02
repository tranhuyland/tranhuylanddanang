'use client';
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { RealEstateItem } from "@/lib/googleSheets";
import { MapPin, Compass, Clock, Square, Bed, ChevronRight } from "lucide-react";
import { Modals } from "./Modals";

interface ListingSectionProps { allBdsItems: RealEstateItem[]; forceDistrict?: string; }

export default function ListingSection({ allBdsItems, forceDistrict }: ListingSectionProps) {
  const [filteredItems, setFilteredItems] = useState<RealEstateItem[]>(allBdsItems);
  const [khuVuc, setKhuVuc] = useState(forceDistrict || "all");
  const [loaiHinh, setLoaiHinh] = useState("all");
  const [khoangGia, setKhoangGia] = useState("all");
  const [huong, setHuong] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  const [selectedItem, setSelectedItem] = useState<RealEstateItem | null>(null);
  const [isOpenDetail, setIsOpenDetail] = useState(false);

  useEffect(() => {
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
    setCurrentPage(1);
  }, [khuVuc, loaiHinh, khoangGia, huong, selectedTag, allBdsItems]);

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
              <select disabled={!!forceDistrict} value={khuVuc} onChange={(e) => setKhuVuc(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold focus:outline-none focus:border-amber-500 text-slate-700">
                <option value="all">Tất cả Quận Huyện</option>
                <option value="Hải Châu">Quận Hải Châu</option><option value="Thanh Khê">Quận Thanh Khê</option>
                <option value="Liên Chiểu">Quận Liên Chiểu</option><option value="Cẩm Lệ">Quận Cẩm Lệ</option>
                <option value="Sơn Trà">Quận Sơn Trà</option><option value="Ngũ Hành Sơn">Quận Ngũ Hành Sơn</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1 tracking-wider">Loại Hình</label>
              <select value={loaiHinh} onChange={(e) => setLoaiHinh(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold focus:outline-none focus:border-amber-500 text-slate-700">
                <option value="all">Tất cả Loại hình</option><option value="Nhà phố">Nhà phố / Kiệt</option><option value="Đất nền">Đất nền / Đất ở</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1 tracking-wider">Khoảng Giá</label>
              <select value={khoangGia} onChange={(e) => setKhoangGia(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold focus:outline-none focus:border-amber-500 text-slate-700">
                <option value="all">Tất cả mức giá</option><option value="duoi3">Dưới 3 Tỷ</option><option value="3to5">Từ 3 - 5 Tỷ</option><option value="tren5">Trên 5 Tỷ</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1 tracking-wider">Hướng Nhà</label>
              <select value={huong} onChange={(e) => setHuong(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold focus:outline-none focus:border-amber-500 text-slate-700">
                <option value="all">Tất cả các hướng</option><option value="Đông">Hướng Đông</option><option value="Tây">Hướng Tây</option><option value="Nam">Hướng Nam</option><option value="Bắc">Hướng Bắc</option>
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100 items-center">
            <button onClick={() => setSelectedTag("all")} className={`text-xs font-bold px-4 py-2 rounded-xl ${selectedTag === "all" ? "bg-slate-900 text-white" : "bg-white border text-slate-600"}`}>Tất Cả</button>
            <button onClick={() => setSelectedTag("mattien")} className={`text-xs font-bold px-4 py-2 rounded-xl ${selectedTag === "mattien" ? "bg-slate-900 text-white" : "bg-white border text-slate-600"}`}>Mặt Tiền Kinh Doanh</button>
            <button onClick={() => setSelectedTag("chinhchu")} className={`text-xs font-bold px-4 py-2 rounded-xl ${selectedTag === "chinhchu" ? "bg-slate-900 text-white" : "bg-white border text-slate-600"}`}>Hàng Chính Chủ</button>
          </div>
        </div>
      </section>

      <main id="listing-section" className="max-w-7xl mx-auto w-full px-4 mt-16 mb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {currentItems.map((item) => {
            const listAnh = item.anh ? item.anh.split(",") : [];
            const thumbnail = listAnh.length > 0 ? listAnh[0].trim() : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80';
            return (
              <article key={item.id} onClick={() => { setSelectedItem(item); setIsOpenDetail(true); }} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer transform hover:-translate-y-1">
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <Image src={thumbnail} alt={item.tieude} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  <span className={`absolute top-3 left-3 ${item.tagColor || 'bg-slate-900'} text-white font-bold text-[10px] uppercase px-2.5 py-1 rounded-lg`}>{item.tag || 'Bán Đất'}</span>
                  {item.huong && <span className="absolute top-3 right-3 bg-white/95 text-slate-800 font-extrabold text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1"><Compass className="w-3 h-3 text-amber-500" />{item.huong}</span>}
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
              </article>
            );
          })}
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10">
            {Array.from({ length: totalPages }, (_, idx) => (
              <button key={idx} onClick={() => setCurrentPage(idx + 1)} className={`w-9 h-9 rounded-xl text-sm transition-all font-bold ${currentPage === idx + 1 ? "bg-amber-500 text-slate-900 scale-105" : "bg-white border text-slate-600"}`}>{idx + 1}</button>
            ))}
          </div>
        )}
      </main>
      {selectedItem && <Modals type="detail" isOpen={isOpenDetail} item={selectedItem} onClose={() => { setIsOpenDetail(false); setSelectedItem(null); }} />}
    </>
  );
}
