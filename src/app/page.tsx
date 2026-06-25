import type { Metadata } from 'next';
import { getBdsData } from "@/lib/googleSheets";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ListingSection from "@/components/ListingSection";
import About from "@/components/About";
import Blog from "@/components/Blog";
import ContactCTA from "@/components/ContactCTA";
import Footer from "@/components/Footer";
import dynamic from "next/dynamic";

// 🚀 ISR cache (OK cho BĐS)
export const revalidate = 60;

// ⚡ Lazy load JS-heavy components (giảm INP + TBT)
const FloatingWidgets = dynamic(
  () => import("@/components/FloatingWidgets"),
  { ssr: false }
);

const AIChatbot = dynamic(
  () => import("@/components/AIChatbot"),
  { ssr: false }
);

// 🌐 SEO Metadata (giữ nguyên nhưng tối ưu nhẹ)
export const metadata: Metadata = {
  title: 'Trần Huy Land - Bất động sản Đà Nẵng chính chủ',
  description:
    'Nhà đất chính chủ Đà Nẵng - mua bán ký gửi uy tín, cập nhật mỗi ngày.',
  openGraph: {
    title: 'Trần Huy Land - Bất động sản Đà Nẵng',
    description:
      'Nhà đất chính chủ Đà Nẵng - cập nhật giỏ hàng thực tế mỗi ngày.',
    url: 'https://tranhuyland.vn',
    siteName: 'Trần Huy Land',
    images: [
      {
        url: 'https://tranhuyland.vn/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Trần Huy Land Bất Động Sản Đà Nẵng',
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
};

export default async function Home() {
  // 🚨 KHÔNG BLOCK RENDER CRITICAL PATH
  const dataPromise = getBdsData();

  // Schema JSON-LD (giữ nguyên)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "Trần Huy Land",
    "image": "https://tranhuyland.vn/logo.png",
    "@id": "https://tranhuyland.vn",
    "url": "https://tranhuyland.vn",
    "telephone": "0905778852",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Hải Châu",
      "addressLocality": "Đà Nẵng",
      "addressRegion": "Đà Nẵng",
      "postalCode": "550000",
      "addressCountry": "VN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 16.0544,
      "longitude": 108.2022
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday", "Tuesday", "Wednesday",
        "Thursday", "Friday", "Saturday", "Sunday"
      ],
      "opens": "07:30",
      "closes": "21:30"
    }
  };

  return (
    <>
      {/* SEO STRUCTURED DATA */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      {/* HEADER (critical) */}
      <Header />

      {/* HERO (LCP PRIORITY - render ngay lập tức) */}
      <Hero />

      {/* LISTING (non-blocking render) */}
      <ListingAsync dataPromise={dataPromise} />

      {/* STATIC CONTENT */}
      <About />
      <Blog />
      <ContactCTA />
      <Footer />

      {/* JS HEAVY - LOAD LAST */}
      <FloatingWidgets />
      <AIChatbot />
    </>
  );
}

/* ================================
   ⚡ ASYNC LISTING COMPONENT
   ================================ */
async function ListingAsync({
  dataPromise,
}: {
  dataPromise: Promise<any>;
}) {
  const initialData = await dataPromise;

  return <ListingSection allBdsItems={initialData} />;
}
