import { getBdsData } from "@/lib/googleSheets";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { notFound } from "next/navigation";
import PropertyClient from "./PropertyClient";
import Script from "next/script";
import { layUrlAnhChuan } from "@/lib/utils";
import dynamic from "next/dynamic"; // 🔥 B1: Import thư viện tải động của Next.js

// 🚀 B1: Lazy Load các component phụ trợ
// Đưa FloatingWidgets và BackButton sang dạng Client Component hoàn toàn (ssr: false)
// Giúp chống lỗi vỡ DOM (Hydration) và không chặn luồng render dữ liệu chính của nhà đất
const FloatingWidgets = dynamic(() => import("@/components/FloatingWidgets"), { ssr: false });
const BackButton = dynamic(() => import("@/components/BackButton"), { ssr: false });
// Giữ lại cơ chế tự động nạp cho SEO, nhưng tách riêng luồng tải
const RelatedProducts = dynamic(() => import("@/components/RelatedProducts")); 

// Bật cơ chế tải động liên tục để website tự cập nhật nhà đất mới từ Google Sheet ngay lập tức
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

// 🌐 1. TỐI ƯU SEO METADATA ĐỘNG CHUẨN GOOGLE & ZALO/FACEBOOK
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const data = await getBdsData();
  
  // Lớp bảo vệ chống crash khi Google API trả về lỗi
  const safeData = Array.isArray(data) ? data : [];
  const item = safeData.find((p) => p.slug === slug) as any;

  if (!item) {
    return { title: "Không tìm thấy sản phẩm - Trần Huy Land" };
  }

  const titleText = item.tieude || item.Tieude || "Chi tiết bất động sản";
  const priceText = item.gia || item.Gia || "Liên hệ";
  const areaText = item.dienTich || item.DienTich || "Chưa rõ";
  const locationText = item.khuVucFull || item.khuvucFull || "Đà Nẵng";
  
  // 📸 Bóc tách ảnh đầu tiên làm Thumbnail cho Zalo/FB
  const anhGoc = item.anh || item.Anh || "";
  const danhSachAnh = anhGoc ? anhGoc.split(",").map((a: string) => a.trim()).filter((a: string) => a !== "" && a.startsWith("http")) : [];
  // Thay thế link ảnh mặc định nếu sản phẩm không có ảnh
  const imageSeo = danhSachAnh.length > 0 ? layUrlAnhChuan(danhSachAnh[0]) : "https://tranhuyland.vn/logo.png";

  return {
    title: `${titleText} - Giá tốt: ${priceText} | Trần Huy Land`,
    description: `Bán bất động sản chính chủ tại ${locationText}. Diện tích thực tế: ${areaText}, giá bán công khai: ${priceText}. Sổ hồng chính chủ, hỗ trợ tư vấn pháp lý nhanh chóng.`,
    openGraph: {
      title: titleText,
      description: `Diện tích ${areaText} - Giá công khai ${priceText} tại khu vực ${locationText}.`,
      url: `https://tranhuyland.vn/nha-dat/${slug}`,
      siteName: "Trần Huy Land",
      images: [
        {
          url: imageSeo,
          width: 1200,
          height: 630,
          alt: titleText,
        }
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: titleText,
      description: `Diện tích ${areaText} - Giá công khai ${priceText} tại khu vực ${locationText}.`,
      images: [imageSeo],
    },
  };
}

// 🏢 2. KHUNG TRANG RENDER THỜI GIAN THỰC TỪ SERVER
export default async function NhaDatDetail({ params }: Props) {
  const { slug } = await params;
  const data = await getBdsData(); 
  
  // Lớp bảo vệ chống crash cho trang chi tiết
  const safeData = Array.isArray(data) ? data : [];
  const item = safeData.find((p) => p.slug === slug) as any; 

  if (!item) notFound();

  const titleText = item.tieude || item.Tieude || "";
  const rawPrice = item.gia || item.Gia || "0";
  const priceNumber = parseFloat(rawPrice.replace(/[^0-9]/g, "")) || 0; 
  const locationText = item.khuVucFull || item.khuvucFull || "Đà Nẵng";
  const imageSeo = layUrlAnhChuan(item.anh || item.Anh);

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
      "@type": "Residence",
      "name": titleText,
      "description": `Bất động sản diện tích ${item.dienTich || item.DienTich || "Chưa rõ"}`,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": locationText,
        "addressLocality": "Đà Nẵng", 
        "addressRegion": "Đà Nẵng",
        "addressCountry": "VN"
      }
    }
  };

  return (
    <>
      <Script
        id="bds-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />
      
      {/* Bao bọc Main chống tràn chiều ngang trên di động */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-10 flex-1 w-full max-w-full overflow-hidden">
        
        {/* Component xử lý Client (Tab Video, Map, Images) */}
        <PropertyClient item={item} />

        {/* 🔥 GẮN KHU VỰC TIN LIÊN QUAN */}
        <div className="mt-8 sm:mt-12">
          <RelatedProducts currentItem={item} allItems={safeData} />
        </div>
      </main>
      
      {/* 🌟 Đặt BackButton ở đây: Nút nổi "Quay về" chuẩn UX */}
      <BackButton />
      
      <Footer />
      <FloatingWidgets />
    </>
  );
}
