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
import Image from "next/image"; // 🚀 Nạp logo mượt mà chuẩn Next.js

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

  // Lấy tên Phường/Vị trí để tạo cấp điều hướng giữa
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
      
      {/* 🪟 THANH BREADCRUMB CỐ ĐỊNH (STICKY) - ĐÃ KHÓA CHẾT 1 DÒNG */}
      <div className="sticky top-[56px] md:top-[64px] z-30 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-xs transition-all">
        {/* Đã gỡ bỏ flex-wrap, thay bằng: overflow-hidden */}
        <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-slate-500 overflow-hidden">
          
          {/* Cấp 1: LOGO (Cố định không bao giờ bị bóp) */}
          <Link 
            href="/" 
            className="hover:opacity-85 transition-opacity shrink-0 flex items-center"
            aria-label="Quay về trang chủ Trần Huy Land"
          >
            <Image 
              src="/logo.png" 
              alt="Trần Huy Land Logo" 
              width={82} // Tinh chỉnh mốc vàng 82px cực đẹp cho lề Mobile
              height={24} 
              priority={true} 
              className="object-contain h-5 sm:h-6 w-auto shrink-0"
            />
          </Link>
          
          {/* Cấp 2: VỊ TRÍ PHƯỜNG (Cố định shrink-0 không bị bóp) */}
          {locationName && (
            <>
              <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 shrink-0" />
              <Link 
                href={`/vi-tri/${locationSlug}`}
                className="text-slate-700 hover:text-orange-600 transition-colors font-bold shrink-0 truncate max-w-[110px] sm:max-w-none"
              >
                {locationName}
              </Link>
            </>
          )}

          {/* Cấp 3: TÊN SẢN PHẨM (Bùa chú tối thượng: min-w-0 flex-1 truncate) */}
          <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-400 font-medium min-w-0 flex-1 truncate">
            {titleText}
          </span>

        </div>
      </div>

      {/* Thân Main chính */}
      <main className="max-w-4xl mx-auto px-4 pt-4 pb-8 sm:pt-6 sm:pb-10 flex-1 w-full max-w-full overflow-hidden">
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
