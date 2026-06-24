'use client';

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Share2 } from "lucide-react";

// 📁 DANH MỤC CÓ TÍCH HỢP TAB "ĐÃ LƯU"
const CATEGORIES = [
  { id: "all", label: "📚 Tất cả bài viết" },
  { id: "chia-se", label: "💡 Chia sẻ kinh nghiệm", value: "Chia sẻ kinh nghiệm" },
  { id: "kien-thuc", label: "📖 Kiến thức", value: "Kiến thức" },
  { id: "luat", label: "⚖️ Luật nhà đất", value: "Luật nhà đất" },
  { id: "nha-dep", label: "🏡 Nhà đẹp", value: "Nhà đẹp" },
  { id: "phong-thuy", label: "🔮 Phong thuỷ", value: "Phong thuỷ" },
  { id: "tin-tuc", label: "📰 Tin bất động sản", value: "Tin bất động sản" },
  { id: "saved", label: "❤️ Bài viết đã lưu" },
];

interface BlogListProps {
  allBlogItems: any[];
}

export default function BlogList({ allBlogItems = [] }: BlogListProps) {
  const safeBlogs = Array.isArray(allBlogItems) ? allBlogItems : [];
  const [activeTab, setActiveTab] = useState("all");

  const [favoriteSlugs, setFavoriteSlugs] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem("thl_blog_favorites");
    if (saved) {
      try {
        setFavoriteSlugs(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const toggleFavorite = (slug: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const updated = favoriteSlugs.includes(slug)
      ? favoriteSlugs.filter(s => s !== slug)
      : [...favoriteSlugs, slug];

    setFavoriteSlugs(updated);
    localStorage.setItem("thl_blog_favorites", JSON.stringify(updated));
  };

  const handleShare = async (blog: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const targetSlug = blog?.slug || blog?.Slug || "";
    const fullUrl = `${window.location.origin}/blog/${targetSlug}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: blog?.title || blog?.Title || "Bài viết từ Trần Huy Land",
          text: blog?.excerpt || blog?.Excerpt || "Kiến thức bất động sản Đà Nẵng",
          url: fullUrl,
        });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(fullUrl).then(() => alert("Đã sao chép link chia sẻ!"));
    }
  };

  // 🚀 TỐI ƯU 1: LỌC RA DANH SÁCH BÀI "ĐÃ LƯU CÓ THẬT" TRÊN SHEET VÀO MỘT BIẾN
  const actualSavedBlogs = useMemo(() => {
    return safeBlogs.filter(blog => {
      const targetSlug = (blog?.slug || blog?.Slug || "").toString();
      return favoriteSlugs.includes(targetSlug);
    });
  }, [safeBlogs, favoriteSlugs]);

  const savedCount = actualSavedBlogs.length; // <--- Con số luôn luôn chính xác tuyệt đối!

  // 🚀 TỐI ƯU 3: THUẬT TOÁN LỌC KÉP KHÁNG LỖI CHỮ HOA/THƯƠNG
  const filteredBlogs = useMemo(() => {
    if (activeTab === "all") return safeBlogs;
    if (activeTab === "saved") return actualSavedBlogs; // Tái sử dụng mảng trên, tiết kiệm RAM!

    const selectedCat = CATEGORIES.find(c => c.id === activeTab);
    const targetVal = (selectedCat?.value || "").toLowerCase().trim();

    return safeBlogs.filter(blog => {
      const blogCat = (blog?.category || blog?.Category || "").toString().toLowerCase().trim();
      return blogCat === targetVal;
    });
  }, [activeTab, safeBlogs, actualSavedBlogs]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* 🌟 THANH BẤM CHỌN DANH MỤC */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
        {CATEGORIES.map((tab) => {
          const isSavedTab = tab.id === "saved";
          const labelDisplay = isSavedTab ? `${tab.label} (${isClient ? savedCount : 0})` : tab.label;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 border shrink-0 ${
                activeTab === tab.id
                  ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20"
                  : isSavedTab && isClient && savedCount > 0
                  ? "bg-red-50 text-red-500 border-red-200 hover:bg-red-100" 
                  : "bg-white text-slate-600 border-slate-200 hover:border-orange-300 hover:text-orange-500"
              }`}
            >
              {labelDisplay}
            </button>
          );
        })}
      </div>

      {/* 🌟 LƯỚI BÀI VIẾT */}
      {filteredBlogs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm max-w-2xl mx-auto">
          <p className="text-slate-400 font-bold text-sm">
            {activeTab === "saved"
              ? "Bạn chưa lưu bài viết kiến thức nào vào danh sách."
              : "Chưa có bài viết nào thuộc danh mục này trên Trần Huy Land."}
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
            const currentExcerpt = blog?.excerpt || blog?.Excerpt || blog?.description || "";
            const isSaved = favoriteSlugs.includes(currentSlug);

            return (
              // 🚀 TỐI ƯU 2: Bọc thẻ div ngoài cùng để bảo vệ DOM, tách thẻ Link ra 2 khúc
              <div
                key={currentSlug}
                className="group bg-white rounded-3xl overflow-hidden border border-slate-100 hover:border-orange-200 shadow-xs hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1 relative"
              >
                {/* PHẦN 1: KHỐI ẢNH (Bấm vào ảnh nhảy trang) */}
                <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                  <Link href={`/blog/${currentSlug}`} className="absolute inset-0 z-0">
                    <Image src={currentImage} alt={currentTitle} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 1280px) 100vw" />
                  </Link>

                  <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs text-orange-600 font-extrabold text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-xl shadow-xs border border-orange-100 z-10 pointer-events-none">
                    {currentCat}
                  </span>

                  {/* NÚT BẤM NỔI (Đứng độc lập, bấm cực nhạy không bị cản) */}
                  <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
                    <div role="button" tabIndex={0} onClick={(e) => handleShare(blog, e)} className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-600 hover:text-orange-500 flex items-center justify-center shadow-md transition-all active:scale-90 cursor-pointer" title="Chia sẻ">
                      <Share2 size={15} />
                    </div>
                    <div role="button" tabIndex={0} onClick={(e) => toggleFavorite(currentSlug, e)} className="w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-md transition-all active:scale-90 cursor-pointer" title="Lưu bài">
                      <Heart size={15} className={`transition-colors ${isClient && isSaved ? "fill-red-500 text-red-500" : "text-slate-600 hover:text-red-500"}`} />
                    </div>
                  </div>
                </div>

                {/* PHẦN 2: KHỐI NỘI DUNG (Bấm vào chữ nhảy trang) */}
                <div className="p-5 flex flex-col flex-1">
                  <span className="text-xs text-slate-400 font-bold mb-2 block">📅 {currentDate}</span>
                  <Link href={`/blog/${currentSlug}`} className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-black text-slate-800 line-clamp-2 group-hover:text-orange-600 mb-2.5 leading-snug">{currentTitle}</h3>
                      <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed">{currentExcerpt}</p>
                    </div>
                    <div className="pt-4 mt-4 border-t border-slate-50 flex items-center text-orange-500 font-bold text-xs gap-1">
                      <span>Xem chi tiết</span> →
                    </div>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
