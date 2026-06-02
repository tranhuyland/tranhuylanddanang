'use client';
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { RealEstateItem } from "@/lib/googleSheets";
import { MapPin, Compass, Clock, Square, Bed, ChevronRight } from "lucide-react";

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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  return (
    <>
      <section className="max-w-7xl mx-auto w-full px-4 -mt-10 relative z-10">
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-xl space-y-4">
          {/* ... (Các bộ lọc giữ nguyên) ... */}
        </div>
      </section>

      <main id="listing-section" className="max-w-7xl mx-auto w-full px-4 mt-16 mb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {currentItems.map((item) => {
            const thumbnail = layUrlAnhChuan(item.anh);
            return (
              <Link 
                href={`/nha-dat/${item.slug}`} 
                key={item.id} 
                scroll={false} 
                className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group transform hover:-translate-y-1 block"
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
              </Link>
            );
          })}
        </div>
      </main>
    </>
  );
}
