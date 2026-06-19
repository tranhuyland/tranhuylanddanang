import { getBdsData } from "@/lib/googleSheets";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";
import ListingSection from "@/components/ListingSection";
import { Metadata } from "next";
import React from "react";

// 🚀 KÍCH HOẠT ISR CACHE 60 GIÂY
export const revalidate = 60;

// 🏷️ TỪ ĐIỂN MAP URL SANG TÊN LOẠI HÌNH
const TYPE_MAP: Record<string, string> = {
  "dat": "Đất",
  "nha-pho": "Nhà phố",
  "can-ho": "Căn hộ",
  "cho-thue": "Cho thuê"
};

// Hàm khử dấu để lọc dữ liệu trên Server
const removeAccents = (str: string) => {
  if (!str) return "";
  return str.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").trim();
};

interface Props {
  params: Promise<{ slug: string }>;
}

// 🌐 1. BƠM THẺ SEO ĐỘNG CHO GOOGLE
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const exactName = TYPE_MAP[slug] || "Bất động sản";
  const action = slug === "cho-thue" ? "Cho thuê" : "Mua bán";

  return {
    title: `${action} ${exactName} Đà Nẵng chính chủ, giá tốt nhất | Trần Huy Land`,
    description: `Khám phá giỏ hàng ${exactName.toLowerCase()} tại Đà Nẵng. Cập nhật liên tục, vị trí đẹp, pháp lý rõ ràng, thông tin minh bạch từ Trần Huy Land.`,
  };
}

// 🖥️ 2. GIAO DIỆN LỌC SẴN SẢN PHẨM TRÊN SERVER
export default async function PropertyTypePage({ params }: Props) {
  const { slug } = await params;
  const exactName = TYPE_MAP[slug] || "Bất động sản";
  const action = slug === "cho-thue" ? "Cho thuê" : "Mua bán";
  
  const allData = await getBdsData();

  // Thuật toán ép lọc dữ liệu chuẩn xác trước khi đẩy xuống giao diện
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

      {/* KHỐI HERO HEADER */}
      <div className="pt-28 pb-12 bg-slate-900 text-center px-4">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
          {action} <span className="text-orange-500">{exactName}</span> Đà Nẵng
        </h1>
        <p className="text-slate-300 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          Tổng hợp giỏ hàng {exactName.toLowerCase()} chính chủ, giá tốt nhất tại Đà Nẵng. Pháp lý chuẩn, cập nhật mới nhất hôm nay.
        </p>
      </div>

      {/* DANH SÁCH SẢN PHẨM ĐÃ ÉP LỌC */}
      <div className="flex-grow -mt-4">
        <ListingSection allBdsItems={filteredData} />
      </div>

      <Footer />
      <FloatingWidgets />
    </main>
  );
}
