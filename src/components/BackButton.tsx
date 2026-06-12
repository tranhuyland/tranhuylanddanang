"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      // 🌟 Tích hợp hàng loạt hiệu ứng thẩm mỹ cao cấp
      className="group inline-flex items-center gap-2 px-4 py-2.5 mb-6 bg-white border border-slate-200 text-slate-700 text-sm md:text-base font-bold rounded-full shadow-sm hover:shadow-md hover:border-orange-500 hover:text-orange-600 transition-all duration-300 active:scale-95 cursor-pointer"
    >
      {/* Icon mũi tên có hiệu ứng trượt nhẹ sang trái khi khách rê chuột */}
      <ChevronLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
      <span>Quay về</span>
    </button>
  );
}
