import React from "react";
import Image from "next/image";
import { MapPin, Phone, MessageSquare } from "lucide-react";

export default function Footer() {
  return (
    <footer class="bg-slate-950 text-slate-400 text-xs mt-auto border-t border-slate-900">
      <div class="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <div class="flex items-center gap-2.5 mb-5">
            <div class="relative h-10 w-10">
              <Image src="https://i.postimg.cc/JhKg8VZ9/70554272-47DB-4D3A-A1AE-2782EFCAF00F.png" alt="Trần Huy Land" fill class="object-contain" />
            </div>
            <div>
              <h3 class="text-white font-extrabold text-base tracking-wide">TRẦN HUY LAND</h3>
              <p class="text-[10px] uppercase tracking-widest text-slate-500">Giỏ Hàng Nhà Đất Thực Tế</p>
            </div>
          </div>
          <p class="leading-relaxed text-slate-400">Chuyên phân phối, nhận ký gửi môi giới nhà phố, đất nền thổ cư, mặt tiền kinh doanh chính chủ tại địa bàn Đà Nẵng.</p>
        </div>
        <div>
          <h4 class="text-white font-bold text-sm uppercase tracking-wider mb-5">KHU VỰC KHẢO SÁT CHÍNH</h4>
          <ul class="space-y-3 text-slate-400 text-sm font-medium">
            <li>Nhà đất Quận Hải Châu</li>
            <li>Nhà đất Quận Cẩm Lệ</li>
            <li>Nhà đất Quận Sơn Trà</li>
            <li>Thị trường Bất Động Sản Đà Nẵng</li>
          </ul>
        </div>
        <div>
          <h4 class="text-white font-bold text-sm uppercase tracking-wider mb-5">THÔNG TIN LIÊN HỆ CHÍNH THỨC</h4>
          <ul class="space-y-3 text-slate-400 text-sm font-medium">
            <li class="flex items-center gap-2"><MapPin class="w-4 h-4 text-slate-500" /> Văn phòng: 26 Cẩm Bá Thước, Hải Châu, Đà Nẵng</li>
            <li class="flex items-center gap-2"><Phone class="w-4 h-4 text-slate-500" /> Hotline tư vấn: 0931 555 551</li>
            <li class="flex items-center gap-2"><MessageSquare class="w-4 h-4 text-slate-500" /> Kênh kết nối: zalo.me/0931555551</li>
          </ul>
        </div>
      </div>
      <div class="border-t border-white/5 text-center py-6 text-slate-600 font-medium max-w-7xl mx-auto px-4">
        © 2026 Trần Huy Land. Toàn bộ cấu trúc mã nguồn được tối ưu tự động hóa dữ liệu cấu trúc Google SEO. All rights reserved.
      </div>
    </footer>
  );
}
