'use client'; // Bắt buộc để dùng Dropdown tương tác

import React, { useState } from "react";
import Link from "next/link";
import { Home, ChevronRight, ChevronDown } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";
import ListingSection from "@/components/ListingSection";

// Danh sách các khu vực để tạo Dropdown
const ALL_LOCATIONS = [
  { name: "An Hải", slug: "an-hai" },
  { name: "An Khê", slug: "an-khe" },
  { name: "Hải Châu", slug: "hai-chau" },
  { name: "Hòa Cường", slug: "hoa-cuong" },
  { name: "Hòa Khánh", slug: "hoa-khanh" },
  { name: "Liên Chiểu", slug: "lien-chieu" },
  { name: "Sơn Trà", slug: "son-tra" },
  { name: "Thanh Khê", slug: "thanh-khe" },
  // ... Anh bổ sung thêm các khu vực khác vào đây
];

export default function LocationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Tìm tên hiển thị dựa trên slug
  const exactName = ALL_LOCATIONS.find(l => l.slug === slug)?.name || "Khu vực";

  return (
    <main className="min-h-screen bg-slate-50">
      <Header />

      {/* 🚀 DẢI BREADCRUMB STICKY: Nằm sát dưới Header */}
      <div className="sticky top-[72px] z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 overflow-x-auto">
          <Link href="/" className="flex items-center text-slate-500 hover:text-orange-600">
            <Home className="w-4 h-4" />
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          
          {/* Dropdown Vị trí */}
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1 bg-orange-50 text-orange-600 px-3 py-1 rounded-lg font-bold text-sm hover:bg-orange-100 transition-all"
            >
              {exactName}
              <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Menu xổ xuống */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                {ALL_LOCATIONS.map((loc) => (
                  <Link 
                    key={loc.slug} 
                    href={`/phuong/${loc.slug}`}
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-600 font-medium"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    {loc.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nội dung trang */}
      <div className="pt-4">
        <ListingSection allBdsItems={[]} forceDistrict={exactName} />
      </div>

      <Footer />
      <FloatingWidgets />
    </main>
  );
}
