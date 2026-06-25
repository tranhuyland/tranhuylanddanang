'use client';

import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Heart, ImageIcon, BedDouble, Bath, Clock, Share2 } from "lucide-react";
import { layUrlAnhChuan } from "@/lib/utils";
import { parseDateInfo, parsePropertyTags, countImages, calculateGiaM2, extractRooms } from "@/lib/bdsHelpers";

interface BdsCardProps {
  item: any;
  rank?: number;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
}

export default function BdsCard({ item, rank, isFavorite, onToggleFavorite }: BdsCardProps) {
  const thumbnail = layUrlAnhChuan(item.anh, 400);
  const displayLocation = item.khuVuc || item.diaChi || item.diaChiFull || item.khuVucFull || "Đà Nẵng";
  const soLuongAnh = useMemo(() => countImages(item), [item]);
  const giaM2 = useMemo(() => calculateGiaM2(item), [item]);
  const { pn, wc } = useMemo(() => extractRooms(item), [item]);
  const tags = useMemo(() => parsePropertyTags(item), [item]);
  const dateInfo = useMemo(() => parseDateInfo(item.ngayDang || item.ngay || ""), [item]);

  // 🔥 THUẬT TOÁN TÍNH TUỔI TIN ĐĂNG
  const daysOld = useMemo(() => {
    const rawDate = item.ngayDang || item.ngay || "";
    if (!rawDate) return 999;

    let d: Date;
    if (rawDate.includes("T")) {
      d = new Date(rawDate);
    } else {
      const dateOnly = rawDate.trim().split(" ")[0]; 
      const parts = dateOnly.split(/[-/]/);
      if (parts.length >= 3) {
        if (parts[0].length === 4) {
          d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])); 
        } else {
          d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])); 
        }
      } else {
        d = new Date(dateOnly);
      }
    }

    if (isNaN(d.getTime())) return 999;

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);

    const diffTime = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays < 0 ? 0 : diffDays; 
  }, [item.ngayDang, item.ngay]);

  // 1. Mốc 48 giờ (Tương đương <= 2 ngày: Hôm nay, Hôm qua, Hôm kia)
  const isTinMoi = daysOld <= 2;

  // 2. Chuỗi text gộp thông minh cho Tem đỏ
  const rankBadgeText = isTinMoi 
    ? `Tin mới ${rank ? `#${rank}` : ''}`.trim()
    : rank ? `THL #${rank}` : 'THL';

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const url = `${window.location.origin}/nha-dat/${item.slug}`;
    if (navigator.share) {
      try { await navigator.share({ title: item.tieude, text: 'Xem bất động sản này trên website:', url }); } catch (error) {}
    } else {
      navigator.clipboard.writeText(url).then(() => { alert("Đã sao chép đường dẫn chia sẻ!"); });
    }
  };

  return (
    <Link href={`/nha-dat/${item.slug}`} aria-label={`Xem chi tiết: ${item.tieude}`}
      onClick={() => { document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important'); setTimeout(() => document.documentElement.style.removeProperty('scroll-behavior'), 300); }}
      className="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-orange-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] block"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <Image src={thumbnail} alt={item.tieude || "Trần Huy Land"} fill className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out" sizes="(max-width: 1280px) 100vw" priority={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute top-2 left-0 flex flex-col items-start gap-1.5 z-10">
          
          {/* 🌟 THÊM BÙA CHÚ suppressHydrationWarning: Ép React bỏ qua lỗi #418 do lệch múi giờ Server vs Client */}
          <span suppressHydrationWarning className="bg-[#E03C31] text-white text-[11px] font-bold px-2.5 py-1 rounded-r shadow-sm tracking-wider">
            {rankBadgeText}
          </span>

          {tags.isSapHam && <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 ml-2 rounded shadow-sm uppercase tracking-wider animate-pulse">🔥 Sập Hầm</span>}
          {tags.isChoThue && <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 ml-2 rounded shadow-sm uppercase tracking-wider">🔑 Cho Thuê</span>}
          {tags.isChinhChu && <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 ml-2 rounded shadow-sm uppercase tracking-wider">✓ Chính Chủ</span>}
          {tags.isNhaMatTien && <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 ml-2 rounded shadow-sm uppercase tracking-wider">🏢 Nhà Mặt Tiền</span>}
          {tags.isNhaKiet && <span className="bg-cyan-600 text-white text-[10px] font-bold px-2 py-0.5 ml-2 rounded shadow-sm uppercase tracking-wider">🛣️ Nhà Kiệt</span>}
          {tags.isDatNen && <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 ml-2 rounded shadow-sm uppercase tracking-wider">⛳ Đất Nền</span>}
          {tags.isDatMatTien && <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 ml-2 rounded shadow-sm uppercase tracking-wider">⛳ Đất Mặt Tiền</span>}
          {tags.isDatKiet && <span className="bg-cyan-500 text-white text-[10px] font-bold px-2 py-0.5 ml-2 rounded shadow-sm uppercase tracking-wider">⛳ Đất Kiệt</span>}
          {tags.isCanHo && <span className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 ml-2 rounded shadow-sm uppercase tracking-wider">🏢 Căn Hộ</span>}
        </div>

        <div className="absolute bottom-2 right-2 bg-slate-900/70 text-white text-[11px] font-medium px-2 py-1 rounded flex items-center gap-1.5 z-10 backdrop-blur-sm">
          <ImageIcon size={12} aria-hidden="true" /><span className="text-white">{soLuongAnh}</span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow justify-between">
        <div>
          <h2 className="text-[#2C2C2C] font-bold text-[14px] sm:text-[15px] uppercase line-clamp-2 leading-snug mb-3 group-hover:text-orange-600 transition-colors duration-300 h-[2.6rem] sm:h-[2.8rem]">
            {item.tieude}
          </h2>
          <div className="flex flex-wrap items-center text-[14px] text-[#505050] mb-3 gap-x-2 gap-y-1">
            <span className="text-[#E03C31] font-bold text-[16px] whitespace-nowrap">{item.gia || "Thỏa thuận"}</span>
            {item.dienTich && <><span className="text-slate-300 text-[10px]">●</span><span className="whitespace-nowrap font-bold text-[#E03C31]">{item.dienTich}</span></>}
            {giaM2 && <><span className="text-slate-300 text-[10px]">●</span><span className="whitespace-nowrap font-medium text-[#777] text-[13px]">{giaM2}</span></>}
            {pn && <><span className="text-slate-300 text-[10px]">●</span><span className="flex items-center gap-1 whitespace-nowrap font-medium">{pn} <BedDouble size={14} className="text-slate-400" /></span></>}
            {wc && <><span className="text-slate-300 text-[10px]">●</span><span className="flex items-center gap-1 whitespace-nowrap font-medium">{wc} <Bath size={14} className="text-slate-400" /></span></>}
          </div>
          <div className="flex items-center gap-1.5 text-[14px] sm:text-[15px] font-normal text-green-800 mb-4">
            <MapPin size={16} className="text-green-800 shrink-0" aria-hidden="true" />
            <span className="truncate">{displayLocation}</span>
          </div>
        </div>

        <div className="mt-auto border-t border-slate-100 pt-3 flex items-center justify-between">
          <div className="flex flex-col justify-center min-w-0 pr-2">
            <div className="flex items-center gap-1 text-[12px] sm:text-[13px] text-slate-800 font-bold truncate">
              <Clock size={13} strokeWidth={2} className="text-slate-600 shrink-0" aria-hidden="true" />
              {/* 🌟 THÊM BÙA CHÚ Ở ĐÂY NỮA */}
              <span suppressHydrationWarning>Ngày đăng: {dateInfo.fullDate} {dateInfo.time && ` ${dateInfo.time}`}</span>
            </div>
            {/* 🌟 VÀ Ở ĐÂY NỮA CHỐNG LỖI HIỂN THỊ CHỮ "HÔM QUA" */}
            <span suppressHydrationWarning className="text-[11px] sm:text-[12px] text-slate-600 font-normal italic mt-0.5 truncate pl-[18px]">
              {dateInfo.relative}
            </span>
          </div>
          
          <div className="flex items-center gap-1.5 shrink-0">
            <div role="button" tabIndex={0} aria-label="Chia sẻ tin này" className="px-3 py-2 sm:px-3 min-h-[44px] border rounded-xl active:scale-95 transition-all shadow-sm flex items-center justify-center gap-1.5 border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 cursor-pointer" onClick={handleShare} title="Chia sẻ tin">
              <Share2 size={15} aria-hidden="true" />
              <span className="text-[12px] sm:text-[13px] font-bold whitespace-nowrap">Chia sẻ</span>
            </div>

            <div role="button" tabIndex={0} aria-label={isFavorite ? "Bỏ lưu tin này" : "Lưu tin này"} className={`px-3 py-2 sm:px-3 min-h-[44px] border rounded-xl active:scale-95 transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer ${isFavorite ? 'border-red-200 text-red-500 bg-red-50' : 'border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-300 hover:bg-red-50'}`}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(e); }}
            >
              <Heart size={15} fill={isFavorite ? "currentColor" : "none"} aria-hidden="true" className={isFavorite ? "scale-110 transition-transform" : "transition-transform"} />
              <span className="text-[12px] sm:text-[13px] font-bold whitespace-nowrap">{isFavorite ? 'Đã lưu' : 'Lưu tin'}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
