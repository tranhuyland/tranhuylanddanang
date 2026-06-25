"use client";

import PropertyGallery from "@/components/SlideBds";
import {
  MapPin,
  Calendar,
  ShieldCheck,
  Map,
  FileText,
  X,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  BedDouble,
  Bath,
  Compass,
  Heart,
  Share2,
} from "lucide-react";

import ReactMarkdown from "react-markdown";
import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { layUrlAnhChuan } from "@/lib/utils";
import { tuDongGaiLinkMaTran } from "@/lib/matrixLinker";

interface PropertyClientProps {
  item: any;
}

// ===================== HELPERS =====================
const removeAccents = (str: string) =>
  !str
    ? ""
    : str
        .toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .trim();

const extractRooms = (item: any) => {
  const type = removeAccents(item.phân_loại || item.loaiHinh || "");
  if (type.includes("dat")) return { pn: null, wc: null };

  let pn = item.phongNgu || item.pn || null;
  let wc = item.wc || item.phongTam || null;

  const text = removeAccents(
    `${item.tieude || ""} ${item.mota || ""}`
  ).replace(/<[^>]+>/g, " ");

  const m1 = text.match(/(\d+)\s*(pn|phong ngu|ngu)/i);
  if (m1) pn = m1[1];

  const m2 = text.match(/(\d+)\s*(wc|toilet|phong tam)/i);
  if (m2) wc = m2[1];

  return { pn, wc };
};

const calculateGiaM2 = (item: any) => {
  if (!item.gia || !item.dienTich) return null;
  return null;
};

// ===================== COMPONENT =====================
export default function PropertyClient({ item }: PropertyClientProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isFavorite, setIsFavorite] = useState(false);

  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // FIX: khai báo trước khi dùng
  const anhSoDoGoc = item.anhSoDo || item.AnhSoDo || "";

  const images = useMemo(() => {
    const raw = item.anh || "";
    const list = raw
      .split(",")
      .map((x: string) => x.trim())
      .filter((x: string) => x.startsWith("http"));

    if (anhSoDoGoc) list.push(anhSoDoGoc);
    return list;
  }, [item.anh, anhSoDoGoc]);

  const { pn, wc } = useMemo(() => extractRooms(item), [item]);

  const displayLocation = useMemo(() => {
    return (
      item.diaChiFull ||
      item.diaChi ||
      item.khuVucFull ||
      "Đà Nẵng"
    );
  }, [item]);

  // favorite
  useEffect(() => {
    const fav = JSON.parse(localStorage.getItem("thl_favorites") || "[]");
    setIsFavorite(fav.includes(item.slug));
  }, [item.slug]);

  const toggleFav = () => {
    const fav = JSON.parse(localStorage.getItem("thl_favorites") || "[]");

    let newFav;
    if (fav.includes(item.slug)) {
      newFav = fav.filter((x: string) => x !== item.slug);
      setIsFavorite(false);
    } else {
      newFav = [...fav, item.slug];
      setIsFavorite(true);
    }

    localStorage.setItem("thl_favorites", JSON.stringify(newFav));
  };

  return (
    <article className="bg-white rounded-xl border overflow-hidden">
      {/* Gallery */}
      <div className="p-2">
        <PropertyGallery images={images} alt={item.tieude} />
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex justify-between">
          <h1 className="text-xl font-bold">{item.tieude}</h1>

          <div className="flex gap-2">
            <button onClick={toggleFav}>
              <Heart
                className={isFavorite ? "text-red-500" : ""}
                fill={isFavorite ? "currentColor" : "none"}
              />
            </button>

            <button
              onClick={() =>
                navigator.clipboard.writeText(window.location.href)
              }
            >
              <Share2 />
            </button>
          </div>
        </div>

        <div className="flex gap-4 text-sm mt-2">
          <span className="flex items-center gap-1">
            <MapPin size={14} />
            {displayLocation}
          </span>

          <span className="flex items-center gap-1">
            <Calendar size={14} />
            {item.ngayDang || "Mới"}
          </span>
        </div>

        {/* price */}
        <div className="mt-4 text-red-600 font-bold text-2xl">
          {item.gia}
        </div>

        {/* specs */}
        <div className="flex gap-6 mt-4 text-sm">
          {pn && <span>🛏 {pn} PN</span>}
          {wc && <span>🚿 {wc} WC</span>}
          <span>📐 {item.dienTich}</span>
        </div>

        {/* map / sổ */}
        <div className="flex gap-2 mt-4">
          {item.linkMap && (
            <a
              href={item.linkMap}
              target="_blank"
              className="bg-blue-600 text-white px-3 py-2 rounded"
            >
              <Map size={14} /> Map
            </a>
          )}

          {anhSoDoGoc && (
            <button
              onClick={() => setIsPopupOpen(true)}
              className="bg-orange-500 text-white px-3 py-2 rounded"
            >
              <FileText size={14} /> Sổ
            </button>
          )}
        </div>

        {/* description */}
        <div className="mt-6 prose">
          <ReactMarkdown>
            {tuDongGaiLinkMaTran(item.mota || "")}
          </ReactMarkdown>
        </div>
      </div>
    </article>
  );
}
