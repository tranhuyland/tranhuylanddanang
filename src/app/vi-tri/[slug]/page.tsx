import { getBdsData } from "@/lib/googleSheets";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";
import ListingSection from "@/components/ListingSection";
import { Metadata } from "next";
import React from "react";
import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";

// 🚀 KÍCH HOẠT ISR CACHE
export const revalidate = 60;

const LOCATION_MAP: Record<string, string> = {
  "an-hai": "An Hải", "an-khe": "An Khê", "ba-na": "Bà Nà",
  "cam-le": "Cẩm Lệ", "hai-chau": "Hải Châu", "hai-van": "Hải Vân",
  "hoa-bac": "Hòa Bắc", "hoa-cuong": "Hòa Cường", "hoa-khanh": "Hòa Khánh",
  "hoa-lien": "Hòa Liên", "hoa-ninh": "Hòa Ninh", "hoa-phuoc": "Hòa Phước",
  "hoa-tien": "Hòa Tiến", "hoa-vang": "Hòa Vang", "hoa-xuan": "Hòa Xuân",
  "lien-chieu": "Liên Chiểu", "ngu-hanh-son": "Ngũ Hành Sơn",
  "son-tra": "Sơn Trà", "thanh-khe": "Thanh Khê"
};

interface Props {
  params: Promise<{ slug: string }>;
}

// 🌐 1. BƠM THẺ SEO ĐỘNG CHO GOOGLE (Đã khôi phục đầy đủ OpenGraph)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const exactName = LOCATION_MAP[slug] || slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  
  const titleText = `Mua bán nhà đất ${exactName}, Đà Nẵng giá tốt nhất | Trần Huy Land`;
  const descriptionText = `Danh sách bất động sản, nhà đất chính chủ tại khu vực ${exactName}, Đà Nẵng. Cập nhật mới nhất hôm nay, giá rẻ, vị trí đẹp, thông tin minh bạch.`;

  return {
    title: titleText,
    description: descriptionText,
    openGraph: {
      title: titleText,
      description: descriptionText,
      siteName: "Trần Huy Land",
      type: "website",
    },
  };
}

export default async function LocationPage({ params }: Props) {
  const { slug } = await params;
  const exactName = LOCATION_MAP[slug] || slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const allData = await getBdsData();

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      {/* 🗺️ BREADCRUMB DÁN SÁT HEADER + CHỮ KHU VỰC MÀU CAM CỰC ĐẸP */}
      <nav className="sticky top-[56px] md:top-[64px] z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-slate-500 flex-nowrap overflow-hidden">
          
          <Link
            href="/"
            className="flex items-center gap-1 text-slate-600 hover:text-orange-600 transition-colors font-semibold shrink-0"
          >
            <Home className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            Trang chủ
          </Link>

          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          
          <span className="text-slate-700 font-semibold shrink-0">Khu vực</span>
          
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          
          {/* 🔥 Tên khu vực bôi đậm (font-extrabold), màu cam (orange-600), cỡ chữ đồng bộ */}
          <span className="text-orange-600 font-extrabold min-w-0 flex-1 truncate text-[13px] sm:text-[14.5px] tracking-tight">
            {exactName}
          </span>

        </div>
      </nav>

      {/* KHỐI HERO: DÙNG !mt-0 VÀ pt-2 ĐỂ ÉP SÁT LÊN TRÊN */}
      <div className="pt-2 pb-12 bg-slate-900 text-center px-4 !mt-0">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
          Nhà đất <span className="text-orange-500">{exactName}</span>, Đà Nẵng
        </h1>
        <p className="text-slate-300 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          Tổng hợp giỏ hàng bất động sản chính chủ, giá tốt nhất tại khu vực {exactName}.
        </p>
      </div>

      <div className="flex-grow -mt-4">
        <ListingSection allBdsItems={allData} forceDistrict={exactName} />
      </div>

      <Footer />
      <FloatingWidgets />
    </main>
  );
}
