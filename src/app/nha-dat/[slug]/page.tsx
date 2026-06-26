import { getBdsData } from "@/lib/googleSheets";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";
import { notFound } from "next/navigation";
import BackButton from "@/components/BackButton";
import PropertyClient from "./PropertyClient";
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

  if (!item) return { title: "Không tìm thấy sản phẩm - Trần Huy Land" };

  const titleText = item.tieude || item.Tieude || item.title || "Chi tiết bất động sản";
  const priceText = item.gia || item.Gia || item.price || "Liên hệ";
  const areaText = item.dienTich || item.DienTich || item.dientich || "Chưa rõ";
  const locationText = item.khuVucFull || item.khuvucFull || item.diachi || "Đà Nẵng";
  const imageSeo = layUrlAnhChuan(item.anh || item.Anh) || "https://tranhuyland.vn/logo.png";

  return {
    title: `${titleText} - Giá: ${priceText} | Trần Huy Land`,
    description: `Bán nhà đất chính chủ tại ${locationText}. Diện tích: ${areaText}, giá công khai: ${priceText}. Sổ hồng chính chủ, hỗ trợ thương lượng giá trực tiếp.`,
    openGraph: {
      title: titleText,
      description: `Diện tích ${areaText} - Giá ${priceText} tại ${locationText}.`,
      url: `https://tranhuyland.vn/nha-dat/${slug}`,
      siteName: "Trần Huy Land",
      images: [{ url: imageSeo, width: 1200, height: 630, alt: titleText }],
      type: "website",
    },
  };
}

export default async function NhaDatDetail({ params }: Props) {
  const { slug } = await params;
  const { item, allItems } = await getPropertyBySlug(slug);

  if (!item) notFound();

  const titleText = item.tieude || item.Tieude || item.title || "";
  const locationText = item.khuVucFull || item.khuvucFull || "Đà Nẵng";
  const locationName = item.khuVuc || item.KhuVuc || "";
  const locationSlug = convertToSlug(locationName);

  const imageSeo = layUrlAnhChuan(item.anh || item.Anh) || "";

  const enrichedItem = {
    ...item,
    linkMap: item.linkMap || item.toado || item.toaDo || "",
    maNhungMap: item.maNhungMap || item.manhungmap || ""
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-[#222222] selection:bg-orange-500 selection:text-white">
      <Header />

      <nav className="sticky top-[56px] md:top-[64px] z-30 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-1.5 text-xs md:text-sm text-slate-500 overflow-hidden font-medium">
          <Link href="/" className="flex items-center gap-1 hover:text-orange-600 font-semibold shrink-0">
            <Home className="w-3.5 h-3.5" /> Trang chủ
          </Link>
          {locationName && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <Link href={`/vi-tri/${locationSlug}`} className="hover:text-orange-600 font-semibold shrink-0">
                {locationName}
              </Link>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-orange-600 font-bold truncate tracking-tight">
            {titleText}
          </span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full">
        {/* 🚀 ĐÃ BƠM ẢNH TĨNH LCP TRỰC TIẾP TỪ SERVER XUỐNG */}
        <PropertyClient item={enrichedItem} initialCoverImage={imageSeo} />

        <div className="mt-16">
          <RelatedProducts currentItem={enrichedItem} allItems={allItems} />
        </div>
      </main>

      <BackButton />
      <Footer />
      <FloatingWidgets />
    </div>
  );
}
