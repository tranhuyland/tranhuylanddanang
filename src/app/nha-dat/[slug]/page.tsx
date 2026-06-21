import { getBdsData } from "@/lib/googleSheets";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";
import { notFound } from "next/navigation";
import BackButton from "@/components/BackButton";
import PropertyClient from "./PropertyClient";
import Script from "next/script";
import { layUrlAnhChuan } from "@/lib/utils";
import RelatedProducts from "@/components/RelatedProducts";
import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";
import { cache } from "react";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

function convertToSlug(text: string): string {
  if (!text) return "";
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// 🌟 BẢN VÁ LỖI VERCEL: Ép foundItem về kiểu "any" an toàn.
// Triệt tiêu hoàn toàn sự khắt khe của TypeScript đối với các cột Sheet viết hoa.
const getPropertyBySlug = cache(async (slug: string) => {
  const data = await getBdsData();
  const safeData = Array.isArray(data) ? data : [];
  const foundItem = safeData.find((p: any) => p?.slug === slug);
  return {
    item: foundItem ? (foundItem as any) : null,
    allItems: safeData,
  };
});

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const { item } = await getPropertyBySlug(slug);

  if (!item) {
    return { title: "Không tìm thấy sản phẩm - Trần Huy Land" };
  }

  const titleText = item.tieude || item.Tieude || item.title || "Chi tiết bất động sản";
  const priceText = item.gia || item.Gia || item.price || "Liên hệ";
  const areaText = item.dienTich || item.DienTich || item.dientich || "Chưa rõ";
  const locationText = item.khuVucFull || item.khuvucFull || item.diachi || "Đà Nẵng";
  
  const imageSeo = layUrlAnhChuan(item.anh || item.Anh) || "https://tranhuyland.vn/logo.png";

  return {
    title: `${titleText} - Giá tốt: ${priceText} | Trần Huy Land`,
    description: `Bán bất động sản chính chủ tại ${locationText}. Diện tích thực tế: ${areaText}, giá bán công khai: ${priceText}. Sổ hồng chính chủ, hỗ trợ tư vấn pháp lý nhanh chóng.`,
    openGraph: {
      title: titleText,
      description: `Diện tích ${areaText} - Giá công khai ${priceText} tại ${locationText}.`,
      url: `https://tranhuyland.vn/nha-dat/${slug}`,
      siteName: "Trần Huy Land",
      images: [{ url: imageSeo, width: 1200, height: 630, alt: titleText }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: titleText,
      description: `Diện tích ${areaText} - Giá công khai ${priceText} tại ${locationText}.`,
      images: [imageSeo],
    },
  };
}

export default async function NhaDatDetail({ params }: Props) {
  const { slug } = await params;
  const { item, allItems } = await getPropertyBySlug(slug);

  if (!item) notFound();

  const titleText = item.tieude || item.Tieude || item.title || "";
  
  const rawPrice = String(item.gia || item.Gia || "0");
  const cleanPrice = rawPrice.replace(/[^0-9]/g, "");
  const priceNumber = cleanPrice ? parseFloat(cleanPrice) : 0;

  const locationText = item.khuVucFull || item.khuvucFull || "Đà Nẵng";
  const locationName = item.khuVuc || item.KhuVuc || "";
  const locationSlug = convertToSlug(locationName);
  const imageSeo = layUrlAnhChuan(item.anh || item.Anh) || "https://tranhuyland.vn/logo.png";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": titleText,
    "description": `${titleText} tại khu vực ${locationText}.`,
    "datePosted": item.ngayDang || item.NgayDang || new Date().toISOString().split("T")[0],
    "image": imageSeo,
    "priceCurrency": "VND",
    "price": priceNumber > 0 ? priceNumber : 0, 
    "about": {
      "@type": "Residence",
      "name": titleText,
      "description": `Bất động sản diện tích ${item.dienTich || item.DienTich || "Chưa rõ"}`,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": locationText,
        "addressLocality": "Đà Nẵng",
        "addressRegion": "Đà Nẵng",
        "addressCountry": "VN",
      },
    },
  };

  return (
    <>
      <Script
        id="bds-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />

      <div className="sticky top-[56px] md:top-[64px] z-30 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-xs transition-all">
        <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-slate-500 flex-nowrap overflow-hidden">
          
          <Link
            href="/"
            className="flex items-center gap-1 text-slate-700 hover:text-orange-600 transition-colors font-bold shrink-0"
          >
            <Home className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            Trang chủ
          </Link>

          {locationName && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <Link
                href={`/vi-tri/${locationSlug}`}
                className="text-slate-700 hover:text-orange-600 transition-colors font-bold shrink-0 truncate max-w-[120px] sm:max-w-none"
              >
                {locationName}
              </Link>
            </>
          )}

          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-400 font-medium min-w-0 flex-1 truncate">
            {titleText}
          </span>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-10 flex-1 w-full overflow-hidden">
        <PropertyClient item={item} />

        <div className="mt-8 sm:mt-12">
          <RelatedProducts currentItem={item} allItems={allItems} />
        </div>
      </main>

      <BackButton />
      <Footer />
      <FloatingWidgets />
    </>
  );
}
