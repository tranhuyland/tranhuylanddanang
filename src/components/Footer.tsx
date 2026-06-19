import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, ChevronRight } from "lucide-react";

export default function Footer() {
  // 🗺️ Danh sách các khu vực trọng điểm để SEO (Đã đồng bộ với danh sách Phường mới)
  const topLocations = [
    { name: "Hải Châu", slug: "hai-chau" },
    { name: "Hòa Cường", slug: "hoa-cuong" },
    { name: "Hòa Xuân", slug: "hoa-xuan" },
    { name: "Thanh Khê", slug: "thanh-khe" },
    { name: "Cẩm Lệ", slug: "cam-le" },
    { name: "Sơn Trà", slug: "son-tra" },
  ];

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs mt-auto border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-10">
        
        {/* CỘT 1: THÔNG TIN THƯƠNG HIỆU */}
        <div>
          <div className="flex items-center gap-2.5 mb-5">
            <div className="relative h-10 w-10">
              <Image 
                src="https://i.postimg.cc/JhKg8VZ9/70554272-47DB-4D3A-A1AE-2782EFCAF00F.png" 
                alt="Trần Huy Land" 
                fill 
                className="object-contain" 
              />
            </div>
            <h3 className="text-white font-extrabold text-base tracking-wide">TRẦN HUY LAND</h3>
          </div>
          <p className="leading-relaxed">
            Chuyên nhận ký gửi môi giới nhà phố, đất nền, bất động sản thổ cư trung tâm thành phố Đà Nẵng.
          </p>
        </div>

        {/* CỘT 2: SEO INTERNAL LINKS (Đã gắn Link động) */}
        <div>
          <h4 className="text-white font-bold text-sm uppercase mb-5">ĐỊA BÀN KHẢO SÁT CHÍNH</h4>
          <ul className="space-y-3 text-sm">
            {topLocations.map((loc) => (
              <li key={loc.slug}>
                <Link 
                  href={`/vi-tri/${loc.slug}`} 
                  className="flex items-center gap-2 hover:text-orange-500 hover:translate-x-1 transition-all duration-300"
                >
                  <ChevronRight className="w-4 h-4 text-orange-500" />
                  Nhà đất {loc.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* CỘT 3: THÔNG TIN LIÊN HỆ */}
        <div>
          <h4 className="text-white font-bold text-sm uppercase mb-5">THÔNG TIN VĂN PHÒNG</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-orange-500 shrink-0" /> 
              <span>Tầng 2, 26 Cầm Bá Thước, Hoà Cường, Đà Nẵng</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-orange-500 shrink-0" /> 
              <span>Hotline tư vấn: <strong className="text-white">0905 77 88 52</strong></span>
            </li>
          </ul>
        </div>

      </div>
    </footer>
  );
}
