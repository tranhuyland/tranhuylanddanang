"use client";
import dynamic from "next/dynamic";
import { useMemo } from "react";

// TẮT SSR: Ép Next.js chỉ render bản đồ khi đã xuống trình duyệt (Tránh lỗi window is not defined)
export default function MapView({ bdsList }: { bdsList: any[] }) {
  const Map = useMemo(
    () => dynamic(() => import("@/components/MapWrapper"), { 
      ssr: false,
      loading: () => <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-500 animate-pulse">Đang tải bản đồ Đà Nẵng...</div>
    }),
    []
  );

  return (
    <div className="w-full h-[400px] md:h-[600px] rounded-2xl overflow-hidden shadow-lg border border-slate-200 relative z-0">
      <Map bdsList={bdsList} />
    </div>
  );
}
