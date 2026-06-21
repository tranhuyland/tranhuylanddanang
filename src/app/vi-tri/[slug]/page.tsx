'use client'; // 🚀 Chuyển thành Client Component để xử lý Dropdown

import { getBdsData } from "@/lib/googleSheets";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";
import ListingSection from "@/components/ListingSection";
import React, { useState } from "react";
import Link from "next/link";
import { Home, ChevronRight, ChevronDown, MapPin } from "lucide-react";

// Danh sách các khu vực để render Dropdown
const ALL_LOCATIONS = [
  { name: "Hải Châu", slug: "hai-chau" },
  { name: "Hòa Cường", slug: "hoa-cuong" },
  { name: "Hòa Xuân", slug: "hoa-xuan" },
  { name: "Cẩm Lệ", slug: "cam-le" },
  { name: "Sơn Trà", slug: "son-tra" },
  { name: "Thanh Khê", slug: "thanh-khe" },
];

export default function LocationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const exactName = slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      {/* DẢI BREADCRUMB STICKY MỚI */}
      <div className="sticky top-[72px] z-40 bg-orange-50 border-b border-orange-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-slate-500 hover:text-orange-600 flex items-center gap-1">
              <Home className="w-4 h-4" />
            </Link>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            
            {/* DROPDOWN KHU VỰC */}
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1 font-bold text-orange-600 hover:bg-orange-100 px-2 py-1 rounded transition-colors"
              >
                <MapPin className="w-4 h-4" />
                {exactName}
                <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                  {ALL_LOCATIONS.map((loc) => (
                    <Link 
                      key={loc.slug}
                      href={`/phuong/${loc.slug}`}
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2 hover:bg-orange-50 text-slate-700 hover:text-orange-600 font-medium"
                    >
                      {loc.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-grow">
        <ListingSection allBdsItems={[]} forceDistrict={exactName} />
      </div>

      <Footer />
      <FloatingWidgets />
    </main>
  );
}
