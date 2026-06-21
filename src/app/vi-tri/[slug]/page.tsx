'use client';

import React, { useState } from "react";
import Link from "next/link";
import { Home, ChevronRight, ChevronDown } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";
import ListingSection from "@/components/ListingSection";

// Danh sách các phường để hiển thị trong dropdown
const ALL_LOCATIONS = [
  { name: "Hải Châu", slug: "hai-chau" },
  { name: "Hòa Cường", slug: "hoa-cuong" },
  { name: "Hòa Xuân", slug: "hoa-xuan" },
  { name: "Thanh Khê", slug: "thanh-khe" },
  { name: "Cẩm Lệ", slug: "cam-le" },
  { name: "Sơn Trà", slug: "son-tra" },
  { name: "Liên Chiểu", slug: "lien-chieu" },
];

export default function LocationPage({ params, allData, slug, exactName }: any) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      {/* 🛠️ BREADCRUMB CỐ ĐỊNH SÁT HEADER */}
      <div className="sticky top-[72px] z-40 bg-slate-50/80 backdrop-blur-md border-b border-slate-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm">
          <Link href="/" className="flex items-center gap-1 text-slate-500 hover:text-orange-600">
            <Home className="w-4 h-4" />
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          
          {/* Dropdown Phường */}
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1 font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-lg hover:bg-orange-200 transition-all"
            >
              {exactName}
              <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
                {ALL_LOCATIONS.map((loc) => (
                  <Link 
                    key={loc.slug}
                    href={`/phuong/${loc.slug}`}
                    className="block px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium transition-colors"
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

      {/* NỘI DUNG CHÍNH */}
      <div className="flex-grow pt-4">
        <ListingSection allBdsItems={allData} forceDistrict={exactName} />
      </div>

      <Footer />
      <FloatingWidgets />
    </main>
  );
}
