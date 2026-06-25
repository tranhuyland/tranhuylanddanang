"use client";

import dynamic from "next/dynamic";

// Khởi tạo ngoài component để không tạo lại mỗi lần render
const MapWrapper = dynamic(
  () => import("@/components/MapWrapper"),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-500"
        aria-label="Đang tải bản đồ"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-slate-300 border-t-orange-500 rounded-full animate-spin" />
          <span className="text-sm font-medium">
            Đang tải bản đồ Đà Nẵng...
          </span>
        </div>
      </div>
    ),
  }
);

interface MapViewProps {
  bdsList: any[];
}

export default function MapView({ bdsList }: MapViewProps) {
  return (
    <section
      aria-label="Bản đồ bất động sản Đà Nẵng"
      className="relative"
    >
      <div className="w-full h-[400px] md:h-[600px] rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-slate-50 relative z-0">
        <MapWrapper bdsList={bdsList} />
      </div>
    </section>
  );
}
