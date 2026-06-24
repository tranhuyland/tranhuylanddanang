import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Calendar, ChevronLeft, User, Phone, ArrowRight, Building2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { getBlogData } from "@/lib/googleSheets";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

// 🌐 HÀM 1: TỰ ĐỘNG SINH META SEO CHUẨN GOOGLE
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const blogs = await getBlogData();
  const blog = blogs.find(b => b.slug === slug);

  if (!blog) return { title: "Không tìm thấy nội dung - Trần Huy Land" };

  return {
    title: `${blog.title} | Trần Huy Land`,
    description: blog.excerpt || "Tư vấn và chia sẻ kinh nghiệm đầu tư bất động sản chuyên sâu tại Đà Nẵng.",
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const blogs = await getBlogData();
  const blog = blogs.find(b => b.slug === slug);

  if (!blog) notFound();

  const contentBody = blog.content || "";

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-slate-900 selection:bg-orange-500 selection:text-white">
      <Header />

      {/* 🚀 BÍ MẬT 1: Thu hẹp max-w-4xl xuống max-w-3xl (768px). Đây là "Kích thước ranh giới mắt" chuẩn Medium */}
      <main className="flex-1 pt-28 pb-20 max-w-3xl w-full mx-auto px-4 sm:px-6">
        
        {/* NÚT QUAY LẠI */}
        <div className="mb-8">
          <Link 
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs md:text-sm font-bold uppercase tracking-wider text-slate-500 hover:text-orange-600 transition-all bg-slate-100/80 hover:bg-orange-50 px-4.5 py-2.5 rounded-full border border-slate-200/60"
          >
            <ChevronLeft size={16} className="text-orange-500" /> 
            <span>Quay lại Góc chia sẻ</span>
          </Link>
        </div>

        {/* 🚀 BÍ MẬT 2: Tiêu đề H1 chuẩn Báo chí (32px - 34px), đậm vừa phải font-bold */}
        <h1 className="text-[26px] sm:text-[30px] md:text-[34px] font-bold tracking-tight text-[#111111] leading-[1.3] mb-4">
          {blog.title}
        </h1>

        {/* 🚀 BÍ MẬT 3: Gỡ bỏ các "Hộp màu sặc sỡ" ở thanh tác giả, chuyển về text xám thanh lịch */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-3 text-slate-500 text-xs md:text-sm font-medium mb-10 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-800">
            <User size={15} className="text-orange-500" />
            <span>Trần Huy</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1.5 text-slate-500">
            <Calendar size={15} />
            <span>Xuất bản: {blog.date || "Mới nhất"}</span>
          </div>
        </div>

        {/* ẢNH BÌA PHÓNG LỚN */}
        <div className="relative aspect-video rounded-2xl md:rounded-3xl overflow-hidden mb-12 bg-slate-50 border border-slate-100 shadow-md">
          <Image
            src={blog.image || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200&auto=format&fit=crop"}
            alt={blog.title}
            fill
            priority={true}
            className="object-cover hover:scale-105 transition-transform duration-700"
            unoptimized={true}
          />
        </div>

        {/* 🚀 BÍ MẬT 4: TYPOGRAPHY THÂN BÀI — 18px, dòng giãn 1.8, màu Soft Charcoal #222222 */}
        <article className="prose prose-slate max-w-none text-[#222222] text-[17px] md:text-[18px] leading-[1.8] tracking-[0.005em] whitespace-pre-line">
          <ReactMarkdown
            components={{
              // Chữ đậm: Trả về font-bold (700) để không bị "nặng cộp" trang viết
              strong: ({ node, ...props }) => <strong className="font-bold text-[#111111]" {...props} />,
              
              // Đoạn văn: Cách nhau đúng 24px chuẩn nhịp thở mắt
              p: ({ node, ...props }) => <p className="mb-6 last:mb-0" {...props} />,
              
              // Thẻ H2: Sang trọng, có đường gạch chân mờ phân tách chương
              h2: ({ node, ...props }) => <h2 className="text-[20px] md:text-[22px] font-bold text-[#111111] mt-12 mb-4 pb-2 border-b border-slate-100" {...props} />,
              
              // Thẻ H3: Tinh tế
              h3: ({ node, ...props }) => <h3 className="text-[18px] md:text-[19px] font-bold text-slate-800 mt-8 mb-3" {...props} />,
              
              // Danh sách
              ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-6 space-y-2.5 text-[#222222]" {...props} />,
              li: ({ node, ...props }) => <li className="leading-[1.8]" {...props} />,
              
              // Lõi Ma Trận Silo (Giữ nguyên)
              a: ({ node, href, children, ...props }) => {
                if (!href) return <span {...props}>{children}</span>;

                const isInternal = href.startsWith("/") || href.includes("tranhuyland.vn");

                if (isInternal) {
                  const cleanHref = href.replace(/^(?:https?:\/\/)?(?:www\.)?tranhuyland\.vn/, "");
                  return (
                    <Link
                      href={cleanHref || "/"}
                      className="font-bold text-orange-600 hover:text-orange-700 underline decoration-orange-300 hover:decoration-orange-600 decoration-2 underline-offset-4 transition-all bg-orange-50/60 hover:bg-orange-100 px-1 py-0.5 rounded"
                      {...props}
                    >
                      {children}
                    </Link>
                  );
                }

                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-blue-600 hover:text-blue-800 underline decoration-blue-200 hover:decoration-blue-500 underline-offset-4 transition-all inline-flex items-center gap-0.5 bg-blue-50/50 px-1 py-0.5 rounded"
                    {...props}
                  >
                    <span>{children}</span>
                    <ArrowRight size={13} className="-rotate-45 text-blue-500 inline" />
                  </a>
                );
              }
            }}
          >
            {contentBody}
          </ReactMarkdown>
        </article>

        {/* HỘP PHỄU CHUYỂN ĐỔI KÉP */}
        <div className="mt-16 bg-gradient-to-br from-slate-900 via-slate-800 to-orange-950 text-white p-8 md:p-10 rounded-3xl relative overflow-hidden border border-slate-800 shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.15),transparent_50%)]" />
          
          <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
            <span className="bg-orange-500 text-white text-[11px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full mb-4 shadow-sm">
              Đồng hành cùng nhà đầu tư
            </span>
            <h3 className="text-xl md:text-2xl font-extrabold mb-3 text-white">
              Bạn cần tìm Bất động sản thực tế khớp với tiêu chí này?
            </h3>
            <p className="text-slate-300 text-sm md:text-base mb-8 leading-relaxed">
              Trần Huy Land nắm giữ giỏ hàng hơn 500+ sản phẩm chính chủ tại Hải Châu, Cẩm Lệ và rải rác đắc địa khắp Đà Nẵng. Minh bạch pháp lý, làm việc trực tiếp giá gốc.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <Link 
                href="/" 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm uppercase tracking-wider px-7 py-4 rounded-2xl shadow-lg hover:shadow-orange-500/25 transition-all"
              >
                <Building2 size={18} />
                <span>Xem Giỏ hàng Nhà Đất</span>
              </Link>

              <a 
                href="tel:0905778852" 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-sm uppercase tracking-wider px-7 py-4 rounded-2xl border border-white/10 backdrop-blur-md transition-all"
              >
                <Phone size={18} className="text-orange-400" />
                <span>0905.778.852</span>
              </a>
            </div>
            <span className="text-slate-400 text-xs mt-4 italic">
              *Hỗ trợ tra cứu trích lục bản đồ & quy hoạch Đà Nẵng hoàn toàn miễn phí.
            </span>
          </div>
        </div>

      </main>

      <Footer />
      <FloatingWidgets />
    </div>
  );
}
