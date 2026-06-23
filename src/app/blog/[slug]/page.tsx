import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Calendar, ChevronLeft, User, Phone } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { getBlogData } from "@/lib/googleSheets";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

// Hàm tự động xuất dữ liệu cấu trúc Meta SEO cho bọ Googlebot đọc
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const blogs = await getBlogData();
  const blog = blogs.find(b => b.slug === slug);

  if (!blog) return { title: "Không tìm thấy nội dung" };

  return {
    title: `${blog.title} | Trần Huy Land`,
    description: blog.excerpt || "Tư vấn bất động sản chuyên sâu tại Đà Nẵng.",
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const blogs = await getBlogData();
  const blog = blogs.find(b => b.slug === slug);

  if (!blog) notFound();

  // Thuật toán bóc tách hàng văn bản trong content để xuống dòng đẹp mắt
  const contentBody = blog.content || "";

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-slate-900 selection:bg-orange-500 selection:text-white">
      <Header />

      <main className="flex-1 pt-28 pb-20 max-w-4xl w-full mx-auto px-4">
        {/* NÚT QUAY LẠI CHUẨN UX */}
        <div className="mb-6">
          <Link 
            href="/blog"
            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-orange-600 transition-colors bg-slate-50 px-4 py-2 rounded-full border border-slate-100"
          >
            <ChevronLeft size={14} /> Quay lại chuyên mục
          </Link>
        </div>

        {/* TIÊU ĐỀ & THÔNG TIN TÁC GIẢ */}
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight mb-4">
          {blog.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-slate-400 text-xs font-semibold mb-8 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
            <User size={13} />
            <span>Tác giả: Trần Huy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar size={13} />
            <span>Đăng ngày: {blog.date || "Mới nhất"}</span>
          </div>
        </div>

        {/* ẢNH BÌA PHÓNG LỚN TRONG BÀI VIẾT */}
        <div className="relative aspect-video rounded-3xl overflow-hidden mb-10 bg-slate-50 border border-slate-100">
          <Image
            src={blog.image || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200&auto=format&fit=crop"}
            alt={blog.title}
            fill
            priority={true}
            className="object-cover"
            unoptimized={true}
          />
        </div>

        {/* KHỐI NỘI DUNG CHÍNH RENDER MARKDOWN MƯỢT MÀ */}
        <article className="prose prose-slate max-w-none text-slate-800 leading-relaxed text-base md:text-[17px] whitespace-pre-line">
          <ReactMarkdown
            components={{
              strong: ({ node, ...props }) => <strong className="font-extrabold text-slate-900" {...props} />,
              p: ({ node, ...props }) => <p className="mb-6 last:mb-0" {...props} />
            }}
          >
            {contentBody}
          </ReactMarkdown>
        </article>

        {/* HỘP KÊU GỌI HÀNH ĐỘNG (CTA) CUỐI BÀI VIẾT TĂNG TỶ LỆ CHỐT KHÁCH */}
        <div className="mt-16 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 rounded-3xl relative overflow-hidden border border-slate-800 shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.1),transparent_40%)]" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <h3 className="text-xl font-bold mb-1.5 text-white">Bạn cần tư vấn sâu hơn về bài viết này?</h3>
              <p className="text-slate-400 text-sm max-w-md">Hãy liên hệ trực tiếp với Trần Huy Land để được giải đáp thắc mắc, kiểm tra quy hoạch và hỗ trợ xem nhà đất thực tế 24/7.</p>
            </div>
            <a 
              href="tel:0905778852" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-sm uppercase tracking-wider px-6 py-4 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all shrink-0"
            >
              <Phone size={16} /> Liên hệ Hotline ngay
            </a>
          </div>
        </div>
      </main>

      <Footer />
      <FloatingWidgets />
    </div>
  );
}
