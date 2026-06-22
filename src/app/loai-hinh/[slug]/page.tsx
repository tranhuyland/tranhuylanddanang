import { getBdsData } from "@/lib/googleSheets";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";
import ListingSection from "@/components/ListingSection";
import { Metadata } from "next";
import React from "react";
import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";

// 🚀 KÍCH HOẠT ISR: Tự động làm mới dữ liệu sau mỗi 60 giây
export const revalidate = 60;

const TYPE_MAP: Record<string, string> = {
  "dat": "Đất",
  "nha-pho": "Nhà phố",
  "can-ho": "Căn hộ",
  "cho-thue": "Cho thuê"
};

interface Props {
  params: Promise<{ slug: string }>;
}

// 🌐 BƠM THẺ SEO ĐỘNG CHO GOOGLE
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const exactName = TYPE_MAP[slug] || "Bất động sản";
  const action = slug === "cho-thue" ? "Cho thuê" : "Mua bán";

  return {
    title: `${action} ${exactName} Đà Nẵng chính chủ, giá tốt nhất | Trần Huy Land`,
    description: `Khám phá giỏ hàng ${exactName.toLowerCase()} tại Đà Nẵng. Cập nhật liên tục, vị trí đẹp, pháp lý rõ ràng, thông tin minh bạch từ Trần Huy Land.`,
    openGraph: {
      title: `${action} ${exactName} Đà Nẵng | Trần Huy Land`,
      description: `Khám phá các sản phẩm ${exactName.toLowerCase()} giá tốt nhất tại Đà Nẵng. Liên hệ Trần Huy Land ngay!`,
    }
  };
}

export default async function PropertyTypePage({ params }: Props) {
  const { slug } = await params;
  const exactName = TYPE_MAP[slug] || "Bất động sản";
  const action = slug === "cho-thue" ? "Cho thuê" : "Mua bán";
  
  const allData = await getBdsData();

  // Thuật toán lọc
  const removeAccents = (str: string) => {
    return str.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").trim();
  };

  const filteredData = allData.filter((item: any) => {
    const textToSearch = removeAccents(`${item.tieude || ""} ${item.tag || ""} ${item.loaiHinh || item.phân_loại || ""}`);
    if (slug === "dat") return textToSearch.includes("dat");
    if (slug === "nha-pho") return textToSearch.includes("nha pho");
    if (slug === "can-ho") return textToSearch.includes("can ho");
    if (slug === "cho-thue") return textToSearch.includes("cho thue");
    return true;
  });

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      {/* 🗺️ BREADCRUMB CỐ ĐỊNH SÁT HEADER */}
      <nav className="sticky top-[56px] z-40 bg-white border-b border-slate-200 shadow-sm w-full">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center text-sm text-slate-600">
          <Link href="/" className="hover:text-orange-600 flex items-center shrink-0">
            <Home className="w-4 h-4 mr-1" />
            Trang chủ
          </Link>
          <ChevronRight className="w-4 h-4 mx-2 text-slate-400" />
          <span className="font-medium text-slate-900 shrink-0">Loại hình</span>
          <ChevronRight className="w-4 h-4 mx-2 text-slate-400" />
          <span className="font-bold text-orange-600 truncate">{exactName}</span>
        </div>
      </nav>

      {/* KHỐI HERO: Giảm pt để dính sát Breadcrumb */}
      <div className="pt-2 pb-12 bg-slate-900 text-center px-4 !mt-0">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
          {action} <span className="text-orange-500">{exactName}</span> Đà Nẵng
        </h1>
        <p className="text-slate-300 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          Tổng hợp giỏ hàng {exactName.toLowerCase()} chính chủ, giá tốt nhất tại Đà Nẵng. Pháp lý chuẩn, cập nhật mới nhất hôm nay.
        </p>
      </div>

      <div className="flex-grow -mt-4">
        <ListingSection allBdsItems={filteredData} />
      </div>

      <Footer />
      <FloatingWidgets />
    </main>
  );
}
