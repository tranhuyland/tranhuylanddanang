import { getBdsData } from "@/lib/googleSheets";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";
import ListingSection from "@/components/ListingSection";
import { Metadata } from "next";
import React from "react";
import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const exactName = LOCATION_MAP[slug] || slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  return {
    title: `Mua bán nhà đất ${exactName}, Đà Nẵng giá tốt nhất | Trần Huy Land`,
    description: `Danh sách bất động sản tại ${exactName}, Đà Nẵng.`,
  };
}

export default async function LocationPage({ params }: Props) {
  const { slug } = await params;
  const exactName = LOCATION_MAP[slug] || slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const allData = await getBdsData();

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      {/* 🗺️ BREADCRUMB DÁN SÁT HEADER */}
      {/* top-[72px] là độ cao Header, nếu header anh cao hơn/thấp hơn thì chỉnh số này */}
      <nav className="sticky top-[72px] z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center text-sm text-slate-600">
          <Link href="/" className="hover:text-orange-600 flex items-center shrink-0">
            <Home className="w-4 h-4 mr-1" />
            Trang chủ
          </Link>
          <ChevronRight className="w-4 h-4 mx-2 text-slate-400" />
          <span className="font-medium text-slate-900 shrink-0">Khu vực</span>
          <ChevronRight className="w-4 h-4 mx-2 text-slate-400" />
          <span className="font-bold text-orange-600 truncate">{exactName}</span>
        </div>
      </nav>

      {/* KHỐI HERO HEADER - GIẢM PT ĐỂ DÍNH SÁT BREADCRUMB */}
      <div className="pt-4 pb-12 bg-slate-900 text-center px-4">
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
