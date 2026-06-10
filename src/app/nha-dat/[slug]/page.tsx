import { getBdsData } from "@/lib/googleSheets";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import PropertyClient from "./PropertyClient";

// Bật cơ chế tải động liên tục để website tự cập nhật nhà đất mới từ Google Sheet ngay lập tức
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

// 🌐 1. TỐI ƯU SEO METADATA ĐỘNG CHUẨN GOOGLE (Robot đọc được ngay)
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

// 🏢 2. KHUNG TRANG RENDER THỜI GIAN THỰC TỪ SERVER (Tải tức thì dưới 0.1 giây)
export default async function NhaDatDetail({ params }: Props) {
  const { slug } = await params;
  const data = await getBdsData();
  const item = data.find((p) => p.slug === slug) as any;

  if (!item) notFound();

  // Khai báo cấu trúc dữ liệu Schema tự động báo cáo lên Google Bot (Thúc đẩy lên Top nhanh hơn)
  const titleText = item.tieude || item.Tieude || "";
  const priceText = item.gia || item.Gia || "";
  const locationText = item.khuVucFull || item.khuvucFull || "";
  const anhGoc = item.anh || item.Anh || "";
  const danhSachAnh = anhGoc ? anhGoc.split(",").map((a: string) => a.trim()) : [];
  const imageSeo = danhSachAnh.find((a: string) => a.startsWith("http")) || "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": titleText,
    "description": `${titleText} tại khu vực ${locationText} với mức giá ${priceText}`,
    "datePosted": item.ngayDang || item.NgayDang || new Date().toISOString(),
    "image": imageSeo,
    "offers": {
      "@type": "Offer",
      "price": priceText,
      "priceCurrency": "VND",
    },
  };

  return (
    <>
      {/* Tích hợp trực tiếp cấu trúc JSON-LD ẩn giúp gia tăng sức mạnh SEO */}
      <script
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
