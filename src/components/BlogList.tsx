'use client';

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";

// 📁 DANH SÁCH DANH MỤC ĐỒNG BỘ VỚI TRANG ĐĂNG TIN
const CATEGORIES = [
  { id: "all", label: "📚 Tất cả bài viết" },
  { id: "chia-se", label: "💡 Chia sẻ kinh nghiệm", value: "Chia sẻ kinh nghiệm" },
  { id: "kien-thuc", label: "📖 Kiến thức", value: "Kiến thức" },
  { id: "luat", label: "⚖️ Luật nhà đất", value: "Luật nhà đất" },
  { id: "nha-dep", label: "🏡 Nhà đẹp", value: "Nhà đẹp" },
  { id: "phong-thuy", label: "🔮 Phong thuỷ", value: "Phong thuỷ" },
  { id: "tin-tuc", label: "📰 Tin bất động sản", value: "Tin bất động sản" },
];

interface BlogListProps {
  allBlogItems: any[];
}

export default function BlogList({ allBlogItems = [] }: BlogListProps) {
  // Lớp phòng vệ chống crash nếu mảng truyền từ server bị lỗi hoặc trống
  const safeBlogs = Array.isArray(allBlogItems) ? allBlogItems : [];
  const [activeTab, setActiveTab] = useState("all");

  // 🚀 THUẬT TOÁN PHÂN LOẠI TAB THEO DANH MỤC CHÍNH XÁC
  const filteredBlogs = useMemo(() => {
    if (activeTab === "all") return safeBlogs;
    const selectedCat = CATEGORIES.find(c => c.id === activeTab);
    return safeBlogs.filter(blog => {
      // Đọc linh hoạt cả category chữ thường hoặc Category viết hoa đổ từ Google Sheet
      const blogCat = (blog?.category || blog?.Category || "").toString().trim();
      return blogCat === selectedCat?.value;
    });
  }, [activeTab, safeBlogs]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* 🌟 THANH BẤM CHỌN DANH MỤC (Hỗ trợ lướt ngang mượt mà trên điện thoại) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
        {CATEGORIES.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 border shrink-0 ${
              activeTab === tab.id
                ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20"
                : "bg-white text-slate-600 border-slate-200 hover:border-orange-300 hover:text-orange-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 🌟 LƯỚI DANH SÁCH BÀI VIẾT BLOG */}
      {filteredBlogs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm max-w-2xl mx-auto">
          <p className="text-slate-400 font-bold text-sm">
            Chưa có bài viết nào thuộc danh mục này trên Trần Huy Land.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog: any, index: number) => {
            const currentCat = blog?.category || blog?.Category || "Kinh nghiệm";
            const currentTitle = blog?.title || blog?.Title || "Bài viết mới";
            const currentSlug = blog?.slug || blog?.Slug || index.toString();
            const currentImage = blog?.image || blog?.Image || "/blog-placeholder.jpg";
            const currentDate = blog?.date || blog?.Date || "Mới cập nhật";
            const currentExcerpt = blog?.excerpt || blog?.Excerpt || blog?.description || blog?.Description || "";

            return (
              <Link
                href={`/blog/${currentSlug}`}
                key={blog.id || currentSlug || index}
                className="group bg-white rounded-3xl overflow-hidden border border-slate-100 hover:border-orange-200 shadow-xs hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1"
              >
                {/* Khung ảnh bài viết */}
                <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                  <Image
                    src={currentImage}
                    alt={currentTitle}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    sizes="(max-width: 1280px) 100vw"
                  />
                  {/* Badge danh mục ghim trên ảnh bài viết */}
                  <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs text-orange-600 font-extrabold text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-xl shadow-xs border border-orange-100">
                    {currentCat}
                  </span>
                </div>

                {/* Phần thông tin nội dung */}
                <div className="p-5 flex flex-col flex-1">
                  <span className="text-xs text-slate-400 font-bold mb-2 block">
                    📅 {currentDate}
                  </span>
                  <h3 className="text-base font-black text-slate-800 line-clamp-2 group-hover:text-orange-600 transition-colors mb-2.5 leading-snug">
                    {currentTitle}
                  </h3>
                  <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed flex-1">
                    {currentExcerpt}
                  </p>
                  <div className="pt-4 mt-4 border-t border-slate-50 flex items-center text-orange-500 font-bold text-xs gap-1 group-hover:gap-2 transition-all">
                    <span>Xem chi tiết bài viết</span>
                    <span className="text-sm">→</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
