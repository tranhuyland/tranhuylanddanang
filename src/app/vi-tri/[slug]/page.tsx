'use client'; 

import { getBdsData } from "@/lib/googleSheets";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";
import ListingSection from "@/components/ListingSection";
import React, { useState } from "react";
import Link from "next/link";
import { Home, ChevronRight, ChevronDown, MapPin } from "lucide-react";

// Danh sách khu vực anh muốn hiển thị
const ALL_LOCATIONS = [
  { name: "An Hải", slug: "an-hai" },
  { name: "An Khê", slug: "an-khe" },
  { name: "Cẩm Lệ", slug: "cam-le" },
  { name: "Hải Châu", slug: "hai-chau" },
  { name: "Hòa Cường", slug: "hoa-cuong" },
  { name: "Hòa Xuân", slug: "hoa-xuan" },
  { name: "Liên Chiểu", slug: "lien-chieu" },
  { name: "Ngũ Hành Sơn", slug: "ngu-hanh-son" },
  { name: "Sơn Trà", slug: "son-tra" },
  { name: "Thanh Khê", slug: "thanh-khe" },
];

export default async function LocationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const exactName = slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  
  // Dữ liệu sẽ được fetch phía Server để tối ưu SEO
  const allData = await getBdsData();

  return (
    <LocationPageContent allData={allData} slug={slug} exactName={exactName} />
  );
}

// Component phụ để xử lý các logic Client (Dropdown)
function LocationPageContent({ allData, slug, exactName }: { allData: any[], slug: string, exactName: string }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      {/* DẢI BREADCRUMB GIM CỐ ĐỊNH (STICKY) SÁT HEADER */}
      <div className="sticky top-[72px] z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm">
          <Link href="/" className="text-slate-500 hover:text-orange-600 flex items-center gap-1">
            <Home className="w-4 h-4" />
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1 font-bold text-orange-600 hover:text-orange-700 transition-colors"
            >
              <MapPin className="w-4 h-4" />
              {exactName}
              <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* DROPDOWN CHUYỂN TRANG */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in duration-200">
                {ALL_LOCATIONS.map((loc) => (
                  <Link 
                    key={loc.slug}
                    href={`/phuong/${loc.slug}`}
                    onClick={() => setIsDropdownOpen(false)}
                    className={`block px-4 py-2 hover:bg-orange-50 ${loc.slug === slug ? 'text-orange-600 font-bold bg-orange-50' : 'text-slate-700'}`}
                  >
                    {loc.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KHỐI HERO */}
      <div className="pt-20 pb-12 bg-slate-900 text-center px-4">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
          Nhà đất <span className="text-orange-500">{exactName}</span>, Đà Nẵng
        </h1>
        <p className="text-slate-300 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          Tổng hợp giỏ hàng bất động sản chính chủ, giá tốt nhất tại khu vực {exactName}. Thông tin minh bạch, cập nhật mới nhất hôm nay.
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
