import React from "react";
import Link from "next/link";
import { Building2, Map, Car } from "lucide-react";

export default function Blog() {
  return (
    <section id="blog-section" className="max-w-7xl mx-auto w-full px-4 py-20">
      <div className="mb-10 text-center sm:text-left">
        <p className="text-amber-500 uppercase tracking-widest text-xs font-bold mb-2">GÓC CHIA SẺ KINH NGHIỆM</p>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Tin Tức & Kiến Thức Thị Trường</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/blog" className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group block">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-4"><Building2 className="w-5 h-5" /></div>
          <h3 className="font-extrabold text-lg mb-3 text-slate-900 group-hover:text-amber-500 transition-colors">Có Nên Mua Nhà Hải Châu?</h3>
          <p className="text-slate-500 text-sm leading-relaxed text-justify">Phân tích tiềm năng tăng giá bền vững tại lõi đô thị trung tâm Đà Nẵng.</p>
        </Link>
        <Link href="/blog" className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group block">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4"><Map className="w-5 h-5" /></div>
          <h3 className="font-extrabold text-lg mb-3 text-slate-900 group-hover:text-amber-500 transition-colors">Kinh Nghiệm Mua Đất Sơn Trà</h3>
          <p className="text-slate-500 text-sm leading-relaxed text-justify">Kiểm tra tranh chấp thửa đất và những lưu ý pháp lý quan trọng khi mua gần biển.</p>
        </Link>
        <Link href="/blog" className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group block">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4"><Car className="w-5 h-5" /></div>
          <h3 className="font-extrabold text-lg mb-3 text-slate-900 group-hover:text-amber-500 transition-colors">Nhà Kiệt Ô Tô Là Gì?</h3>
          <p className="text-slate-500 text-sm leading-relaxed text-justify">Cách định giá, đo lộ giới hẻm phân khúc kiệt hẻm rộng ô tô đỗ cửa.</p>
        </Link>
      </div>
    </section>
  );
}
