import { getBdsData } from "@/lib/googleSheets";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";
import { notFound } from "next/navigation";
import BackButton from "@/components/BackButton"; // 🌟 Vẫn giữ import để nút nổi hoạt động
import PropertyClient from "./PropertyClient";
import Script from "next/script";
import { layUrlAnhChuan } from "@/lib/utils";
import RelatedProducts from "@/components/RelatedProducts"; // 🔥 Import component Tin Liên Quan
import Link from "next/link"; // 🚀 Thêm thư viện chuyển trang tối ưu của Next.js
import { Home, ChevronRight } from "lucide-react"; // 🚀 Thêm các icon điều hướng trực quan

// Bật cơ chế tải động liên tục để website tự cập nhật nhà đất mới từ Google Sheet ngay lập tức
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

// 🛠️ HÀM HỖ TRỢ CHUYỂN TÊN PHƯỜNG SANG SLUG ĐỒNG BỘ VỚI LOCATION_MAP (Ví dụ: "Hòa Cường" -> "hoa-cuong")
function convertToSlug(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
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

  // 🚀 Lấy tên Phường/Vị trí để tạo cấp điều hướng giữa
  const locationName = item.khuVuc || item.KhuVuc || "";
  const locationSlug = convertToSlug(locationName);

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
      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-10 flex-1 w-full max-w-full overflow-hidden">
        
        {/* 🗺️ THANH ĐIỀU HƯỚNG BREADCRUMB: Trang chủ > [slug vị trí phường] > Chi tiết sản phẩm */}
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 mb-5 sm:mb-6 flex-wrap border-b border-slate-100 pb-3">
          {/* Cấp 1: Trang chủ */}
          <Link 
            href="/" 
            className="flex items-center gap-1 text-slate-700 hover:text-orange-600 transition-colors font-bold"
          >
            <Home className="w-3.5 h-3.5 text-slate-600" />
            Trang chủ
          </Link>
          
          {/* Cấp 2: Đã khớp chuẩn link dẫn về trang động Phường/Vị trí (/vi-tri/[slug]) */}
          {locationName && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <Link 
                href={`/vi-tri/${locationSlug}`}
                className="text-slate-700 hover:text-orange-600 transition-colors font-bold"
              >
                {locationName}
              </Link>
            </>
          )}

          {/* Cấp 3: Tên sản phẩm hiện tại */}
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-400 font-medium truncate max-w-[180px] sm:max-w-md">
            {titleText}
          </span>
        </div>

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
