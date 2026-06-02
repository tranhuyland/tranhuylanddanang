import React from "react";
import Image from "next/image";
import { MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer class="bg-slate-950 text-slate-400 text-xs mt-auto border-t border-slate-900">
      <div class="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <div class="flex items-center gap-2.5 mb-5">
            <div class="relative h-10 w-10"><Image src="https://i.postimg.cc/JhKg8VZ9/70554272-47DB-4D3A-A1AE-2782EFCAF00F.png" alt="Trần Huy Land" fill class="object-contain" /></div>
            <h3 class="text-white font-extrabold text-base tracking-wide">TRẦN HUY LAND</h3>
          </div>
          <p class="leading-relaxed">Chuyên nhận ký gửi môi giới nhà phố, đất nền, bất động sản thổ cư trung tâm Đà Nẵng.</p>
        </div>
        <div>
          <h4 class="text-white font-bold text-sm uppercase mb-5">ĐỊA BÀN KHẢO SÁT CHÍNH</h4>
          <ul class="space-y-3 text-sm"><li>Nhà đất Quận Hải Châu</li><li>Nhà đất Quận Cẩm Lệ</li><li>Nhà đất Quận Sơn Trà</li></ul>
        </div>
        <div>
          <h4 class="text-white font-bold text-sm uppercase mb-5">THÔNG TIN VĂN PHÒNG</h4>
          <ul class="space-y-3 text-sm">
            <li class="flex items-center gap-2"><MapPin class="w-4 h-4 text-slate-500" /> 26 Cẩm Bá Thước, Hải Châu, Đà Nẵng</li>
            <li class="flex items-center gap-2"><Phone class="w-4 h-4 text-slate-500" /> Hotline tư vấn: 0931 555 551</li>
          </ul>
        </div>
      </div>
    </footer>
  );}