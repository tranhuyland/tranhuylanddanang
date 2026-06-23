import React from "react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Calendar, ChevronRight } from "lucide-react";
import { getBlogData } from "@/lib/googleSheets";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Góc Tư Vấn Bất Động Sản Đà Nẵng | Trần Huy Land",
  description: "Chuyên mục chia sẻ kinh nghiệm mua bán nhà đất, thủ tục pháp lý, sổ đỏ và phân tích thị trường bất động sản thực tế tại Đà Nẵng.",
  openGraph: {
    title: "Góc Tư Vấn Bất Động Sản Đà Nẵng | Trần Huy Land",
    description: "Chuyên mục chia sẻ kinh nghiệm mua bán nhà đất thực tế tại Đà Nẵng.",
    type: "website",
  }
};

export default async function BlogPage() {
  const blogs = await getBlogData();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-orange-500 selection:text-white">
      <Header />

      {/* KHỐI BANNER CHUYÊN MỤC */}
      <div className="bg-slate-900 text-white pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.15),transparent_50%)]" />
        <div className="max-w-6xl mx-auto px-4 relative z-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-400 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-orange-500/30">
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

      {/* DANH SÁCH BÀI VIẾT DẠNG LƯỚI */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-12">
        {blogs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-xs">
            <p className="text-slate-400 font-semibold">Chuyên mục đang được chuẩn bị nội dung chuyên sâu...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <article 
                key={blog.slug}
                className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xs hover:shadow-xl hover:-translate-y-1.5 active:scale-[0.99] transition-all duration-300 group flex flex-col h-full"
              >
                <Link href={`/blog/${blog.slug}`} className="block relative aspect-video overflow-hidden bg-slate-100">
                  <Image
                    src={blog.image || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=600&auto=format&fit=crop"}
                    alt={blog.title}
                    fill
                    sizes="(max-w-768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized={true}
                  />
                </Link>
                
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-3">
                    <Calendar size={13} className="text-slate-400" />
                    <span>{blog.date || "Mới cập nhật"}</span>
                  </div>
                  
                  <h2 className="text-lg font-bold leading-snug text-slate-900 group-hover:text-orange-600 transition-colors mb-3 line-clamp-2">
                    <Link href={`/blog/${blog.slug}`}>
                      {blog.title}
                    </Link>
                  </h2>
                  
                  <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3">
                    {blog.excerpt}
                  </p>
                  
                  <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                    <Link 
                      href={`/blog/${blog.slug}`}
                      className="inline-flex items-center gap-1 text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors"
                    >
                      Đọc bài viết <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
      <FloatingWidgets />
    </div>
  );
}
