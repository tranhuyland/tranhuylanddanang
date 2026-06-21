'use client'; 
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // 🚀 Dùng để chuyển trang
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
  const router = useRouter(); // Khởi tạo router
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const exactName = slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  return (
    // ... (Phần Header giữ nguyên)
    
    /* DẢI BREADCRUMB STICKY MỚI */
    <div className="sticky top-[72px] z-40 bg-white border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center">
        <Link href="/" className="text-slate-500 hover:text-orange-600">
          <Home className="w-4 h-4" />
        </Link>
        <ChevronRight className="w-4 h-4 text-slate-400 mx-2" />
        
        {/* NÚT CHỌN KHU VỰC - KHI BẤM SẼ XỔ DROPDOWN */}
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1 font-bold text-orange-600 hover:bg-orange-50 px-2 py-1 rounded transition-colors"
          >
            <MapPin className="w-4 h-4" />
            {exactName}
            <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* DROPDOWN CHUYỂN TRANG */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
              {ALL_LOCATIONS.map((loc) => (
                <Link 
                  key={loc.slug}
                  href={`/phuong/${loc.slug}`} // 🚀 CHUYỂN TRANG CHUẨN SEO
                  onClick={() => setIsDropdownOpen(false)}
                  className={`block px-4 py-2 hover:bg-orange-50 ${loc.slug === slug ? 'text-orange-600 font-bold' : 'text-slate-700'}`}
                >
                  {loc.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    
    // ... (Các phần còn lại của page)
  );
}
