import { getBdsData } from "@/lib/googleSheets";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import PropertyClient from "./PropertyClient";
import Script from "next/script"; // 🌟 Import thêm Script của Next.js

// Bật cơ chế tải động liên tục để website tự cập nhật nhà đất mới từ Google Sheet ngay lập tức
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

// 🌐 1. TỐI ƯU SEO METADATA ĐỘNG CHUẨN GOOGLE
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const data = await getBdsData();
  const item = data.find((p) => p.slug === slug) as any;

  if (!item) {
    return { title: "Không tìm thấy sản phẩm - Trần Huy Land" };
  }

  const titleText = item.tieude || item.Tieude || "Chi tiết bất động sản";
  const priceText = item.gia || item.Gia || "Liên hệ";
  const areaText = item.dienTich || item.DienTich || "Chưa rõ";
  const locationText = item.khuVucFull || item.khuvucFull || "Đà Nẵng";
  const anhGoc = item.anh || item.Anh || "";
  const danhSachAnh = anhGoc ? anhGoc.split(",").map((a: string) => a.trim()) : [];
  const imageSeo = danhSachAnh.find((a: string) => a.startsWith("http")) || "/icon.png";

  return {
    title: `${titleText} - Giá tốt: ${priceText} | Trần Huy Land`,
    description: `Bán bất động sản chính chủ tại ${locationText}. Diện tích thực tế: ${areaText}, giá bán công khai: ${priceText}. Sổ hồng chính chủ, hỗ trợ tư vấn pháp lý nhanh chóng.`,
    openGraph: {
      title: titleText,
      description: `Diện tích ${areaText} - Giá công khai ${priceText} tại khu vực ${locationText}.`,
      images: [{ url: imageSeo }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: titleText,
      images: [imageSeo],
    },
  };
}

// 🏢 2. KHUNG TRANG RENDER THỜI GIAN THỰC TỪ SERVER
export default async function NhaDatDetail({ params }: Props) {
  const { slug } = await params;
  const data = await getBdsData();
  const item = data.find((p) => p.slug === slug) as any;

  if (!item) notFound();

  const titleText = item.tieude || item.Tieude || "";
  
  // Xử lý giá: Schema yêu cầu giá dạng số thuần (Ví dụ từ "3.5 tỷ" hoặc "3500000000" chuyển về dạng số)
  // Nếu dữ liệu trong Google Sheet của bạn đã là số thuần thì giữ nguyên, nếu có chữ bạn nên clean nó.
  const rawPrice = item.gia || item.Gia || "0";
  const priceNumber = parseFloat(rawPrice.replace(/[^0-9]/g, "")) || 0; 

  const locationText = item.khuVucFull || item.khuvucFull || "Đà Nẵng";
  const anhGoc = item.anh || item.Anh || "";
  const danhSachAnh = anhGoc ? anhGoc.split(",").map((a: string) => a.trim()) : [];
  const imageSeo = danhSachAnh.find((a: string) => a.startsWith("http")) || "";

  // 🛠️ CẬP NHẬT CẤU TRÚC SCHEMA LỒNG NHAU ĐỦ 3 PHẦN: RealEstateListing -> Residence -> Place
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": titleText,
    "description": `${titleText} tại khu vực ${locationText}.`,
    "datePosted": item.ngayDang || item.NgayDang || new Date().toISOString().split('T')[0],
    "image": imageSeo,
    "priceCurrency": "VND",
    "price": priceNumber > 0 ? priceNumber : rawPrice, 
    "about": {
      "@type": "Residence", // 🏠 TẦNG 2: Định nghĩa đây là một nơi cư trú/bất động sản
      "name": titleText,
      "description": `Bất động sản diện tích ${item.dienTich || item.DienTich || "Chưa rõ"}`,
      "address": {
        "@type": "PostalAddress", // 📍 TẦNG 3: Chi tiết địa điểm (Place) thuộc Residence
        "streetAddress": locationText,
        "addressLocality": "Đà Nẵng", // Bạn có thể tách quận huyện từ Google Sheet nếu có
        "addressRegion": "Đà Nẵng",
        "addressCountry": "VN"
      }
    }
  };

  return (
    <>
      {/* ⚡ Sử dụng component Script của Next.js để tối ưu hóa việc load script ngầm */}
      <Script
        id="bds-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />
      <main className="max-w-4xl mx-auto px-4 py-10 flex-1 w-full max-w-full overflow-hidden">
        <Link
          href="/"
          scroll={false}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> QUAY LẠI TRANG CHỦ
        </Link>

        {/* Bàn giao gói dữ liệu gốc siêu sạch sang cho Client xử lý hiệu ứng tương tác */}
        <PropertyClient item={item} />
      </main>
      <Footer />
      <FloatingWidgets />
    </>
  );
}
