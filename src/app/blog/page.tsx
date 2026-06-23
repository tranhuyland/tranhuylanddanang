import React from "react";
import { BookOpen } from "lucide-react";
import { getBlogData } from "@/lib/googleSheets";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";
import BlogList from "@/components/BlogList";

export const dynamic = "force-dynamic";

// 🌐 NÂNG CẤP VŨ KHÍ SEO META ĐẦY ĐỦ CHO GOOGLE & ZALO
export const metadata = {
  title: "Góc Tư Vấn Bất Động Sản Đà Nẵng | Trần Huy Land",
  description: "Chuyên mục chia sẻ kinh nghiệm mua bán nhà đất, thủ tục pháp lý, sổ đỏ và phân tích thị trường bất động sản thực tế tại Đà Nẵng.",
  alternates: {
    canonical: "https://tranhuyland.vn/blog",
  },
  openGraph: {
    title: "Góc Tư Vấn Bất Động Sản Đà Nẵng | Trần Huy Land",
    description: "Chuyên mục chia sẻ kinh nghiệm mua bán nhà đất thực tế tại Đà Nẵng.",
    url: "https://tranhuyland.vn/blog",
    siteName: "Trần Huy Land",
    type: "website",
    images: [
      {
        url: "https://tranhuyland.vn/banner-blog-seo.jpg", // Link ảnh đại diện chuyên mục Blog của anh
        width: 1200,
        height: 630,
        alt: "Góc tư vấn kiến thức nhà đất Trần Huy Land",
      },
    ],
  },
};

export default async function BlogPage() {
  // 1. Máy chủ kéo toàn bộ bài viết từ Google Sheet
  const blogs = await getBlogData();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-orange-500 selection:text-white">
      <Header />

      {/* 🌟 KHỐI BANNER CHUYÊN MỤC CẤP CAO */}
      <div className="bg-slate-900 text-white pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.15),transparent_50%)]" />
        <div className="max-w-6xl mx-auto px-4 relative z-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-orange-50/20 text-orange-400 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-orange-500/30">
            <BookOpen size={14} /> Knowledge Hub
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            Góc Tư Vấn & Chia Sẻ
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl">
            Nơi tổng hợp những kiến thức thực chiến về pháp lý sổ đỏ, kinh nghiệm định giá và thông tin quy hoạch mới nhất tại Đà Nẵng từ Trần Huy Land.
          </p>
        </div>
      </div>

      {/* 🌟 GIAO PHÓ HOÀN TOÀN DỮ LIỆU SẠCH XUỐNG CHO COMPONENT CLIENT */}
      <main className="flex-1 w-full pb-12">
        <BlogList allBlogItems={blogs} />
      </main>

      <Footer />
      <FloatingWidgets />
    </div>
  );
}
