import { getBdsData } from "@/lib/googleSheets";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";
import ListingSection from "@/components/ListingSection";
import { Metadata } from "next";
import React from "react";
import Link from "next/link"; // 🚀 Thêm Link tối ưu chuyển trang
import { Home, ChevronRight } from "lucide-react"; // 🚀 Thêm bộ icon điều hướng trực quan

// 🚀 KÍCH HOẠT ISR CACHE: Tự động làm mới dữ liệu mỗi 60 giây y như trang chủ
export const revalidate = 60;

// 🗺️ TỪ ĐIỂN MAP URL SANG TÊN VỊ TRÍ CHUẨN (Cập nhật sáp nhập Phường mới nhất)
const LOCATION_MAP: Record<string, string> = {
  "an-hai": "An Hải",
  "an-khe": "An Khê",
  "ba-na": "Bà Nà",
  "cam-le": "Cẩm Lệ",
  "hai-chau": "Hải Châu",
  "hai-van": "Hải Vân",
  "hoa-bac": "Hòa Bắc",
  "hoa-cuong": "Hòa Cường",
  "hoa-khanh": "Hòa Khánh",
  "hoa-lien": "Hòa Liên",
  "hoa-ninh": "Hòa Ninh",
  "hoa-phuoc": "Hòa Phước",
  "hoa-tien": "Hòa Tiến",
  "hoa-vang": "Hòa Vang",
  "hoa-xuan": "Hòa Xuân",
  "lien-chieu": "Liên Chiểu",
  "ngu-hanh-son": "Ngũ Hành Sơn",
  "son-tra": "Sơn Trà",
  "thanh-khe": "Thanh Khê"
};

interface Props {
  params: Promise<{ slug: string }>;
}

// 🌐 1. TỰ ĐỘNG BƠM THẺ SEO CHO GOOGLE THEO TỪNG VỊ TRÍ MỚI
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  // Lấy tên chuẩn từ từ điển, nếu không có thì tự động viết hoa chữ cái đầu
  const exactName = LOCATION_MAP[slug] || slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  return {
    title: `Mua bán nhà đất ${exactName}, Đà Nẵng giá tốt nhất | Trần Huy Land`,
    description: `Danh sách bất động sản, nhà đất chính chủ tại ${exactName}, Đà Nẵng. Cập nhật mới nhất, giá rẻ, vị trí đẹp, thông tin minh bạch.`,
    openGraph: {
      title: `Nhà đất ${exactName}, Đà Nẵng | Trần Huy Land`,
      description: `Khám phá giỏ hàng bất động sản giá tốt tại ${exactName}. Liên hệ Trần Huy Land ngay!`,
    }
  };
}

// 🖥️ 2. GIAO DIỆN HIỂN THỊ TỰ ĐỘNG LỌC SẢN PHẨM
export default async function LocationPage({ params }: Props) {
  const { slug } = await params;
  const exactName = LOCATION_MAP[slug] || slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const allData = await getBdsData();

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      {/* KHỐI HERO HEADER CHUẨN SEO + TÍCH HỢP BREADCRUMB VIÊN THUỐC */}
      <div className="pt-28 pb-12 bg-slate-900 text-center px-4 relative overflow-hidden">
        
        {/* 🗺️ BREADCRUMB DẠNG PILL (VIÊN THUỐC) - Thiết kế tinh tế trên nền tối */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs sm:text-sm text-slate-300 mb-6 backdrop-blur-md shadow-inner">
          <Link 
            href="/" 
            className="flex items-center gap-1 hover:text-orange-400 transition-colors font-semibold"
          >
            <Home className="w-3.5 h-3.5 text-slate-400" />
            Trang chủ
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-400 font-medium">Khu vực</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-orange-400 font-bold">{exactName}</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
          Nhà đất <span className="text-orange-500">{exactName}</span>, Đà Nẵng
        </h1>
        <p className="text-slate-300 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          Tổng hợp giỏ hàng bất động sản chính chủ, giá tốt nhất tại khu vực {exactName}. Thông tin minh bạch, cập nhật mới nhất hôm nay.
        </p>
      </div>

      {/* KHỐI DANH SÁCH ÉP LỌC SẴN THEO VỊ TRÍ */}
      <div className="flex-grow -mt-4">
        <ListingSection allBdsItems={allData} forceDistrict={exactName} />
      </div>

      <Footer />
      <FloatingWidgets />
    </main>
  );
}
