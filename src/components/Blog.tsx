import React from "react";
import Link from "next/link";
import { Building2, Map, Car } from "lucide-react";

export default function Blog() {
  return (
    <section id="blog-section" class="max-w-7xl mx-auto w-full px-4 py-20">
      <div class="mb-10 text-center sm:text-left">
        <p class="text-amber-500 uppercase tracking-widest text-xs font-bold mb-2">GÓC CHIA SẺ KINH NGHIỆM</p>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900">Tin Tức & Kiến Thức Thị Trường</h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/quan/hai-chau" class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group block">
          <div class="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-4"><Building2 class="w-5 h-5" /></div>
          <h3 class="font-extrabold text-lg mb-3 text-slate-900 group-hover:text-amber-500 transition-colors">Có Nên Mua Nhà Hải Châu?</h3>
          <p class="text-slate-500 text-sm leading-relaxed text-justify">Phân tích chuyên sâu về tiềm năng lõi đô thị trung tâm Đà Nẵng.</p>
        </Link>
        <Link href="/quan/son-tra" class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group block">
          <div class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4"><Map class="w-5 h-5" /></div>
          <h3 class="font-extrabold text-lg mb-3 text-slate-900 group-hover:text-amber-500 transition-colors">Kinh Nghiệm Mua Đất Sơn Trà</h3>
          <p class="text-slate-500 text-sm leading-relaxed text-justify">Kiểm tra tranh chấp ranh giới và khoảng cách an toàn khi chọn mua thổ cư.</p>
        </Link>
        <Link href="/quan/cam-le" class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group block">
          <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4"><Car class="w-5 h-5" /></div>
          <h3 class="font-extrabold text-lg mb-3 text-slate-900 group-hover:text-amber-500 transition-colors">Nhà Kiệt Ô Tô Là Gì?</h3>
          <p class="text-slate-500 text-sm leading-relaxed text-justify">Cách thẩm định giá và giải thích ưu nhược điểm thực tế phân khúc kiệt hẻm rộng ô tô.</p>
        </Link>
      </div>
    </section>
  );}