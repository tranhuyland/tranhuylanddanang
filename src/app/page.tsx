import type { Metadata } from "next";
import { getBdsData } from "@/lib/googleSheets";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ListingSection from "@/components/ListingSection";
import About from "@/components/About";
import Blog from "@/components/Blog";
import ContactCTA from "@/components/ContactCTA";
import Footer from "@/components/Footer";
import dynamic from "next/dynamic";
import Script from "next/script";

// 🚀 ISR
export const revalidate = 60;

/* =========================
   ⚡ DYNAMIC (GIẢM JS LOAD)
========================= */
const FloatingWidgets = dynamic(
  () => import("@/components/FloatingWidgets"),
  { ssr: false }
);

const AIChatbot = dynamic(
  () => import("@/components/AIChatbot"),
  { ssr: false }
);

/* =========================
   🌐 METADATA SEO
========================= */
export const metadata: Metadata = {
  title: "Trần Huy Land - Bất động sản Đà Nẵng chính chủ",
  description:
    "Nhà đất Đà Nẵng chính chủ - mua bán ký gửi uy tín, cập nhật mỗi ngày.",
  openGraph: {
    title: "Trần Huy Land - Bất động sản Đà Nẵng",
    description: "Nhà đất Đà Nẵng chính chủ - cập nhật mỗi ngày.",
    url: "https://tranhuyland.vn",
    siteName: "Trần Huy Land",
    images: [
      {
        url: "https://tranhuyland.vn/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Trần Huy Land",
      },
    ],
    type: "website",
  },
};

/* =========================
   🏠 PAGE (SERVER COMPONENT)
========================= */
export default async function Home() {
  // ⚡ KHÔNG BLOCK CRITICAL RENDER
  const dataPromise = getBdsData();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "Trần Huy Land",
    url: "https://tranhuyland.vn",
    image: "https://tranhuyland.vn/logo.png",
    telephone: "0905778852",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Hải Châu",
      addressLocality: "Đà Nẵng",
      addressCountry: "VN",
    },
  };

  return (
    <>
      {/* SEO STRUCTURED DATA (tách script riêng cho sạch render) */}
      <Script
        id="jsonld-home"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      {/* HEADER */}
      <Header />

      {/* HERO (LCP PRIORITY - giữ render sync) */}
      <Hero />

      {/* LISTING (STREAMING + NON-BLOCKING) */}
      <ListingAsync dataPromise={dataPromise} />

      {/* STATIC SECTIONS */}
      <About />
      <Blog />
      <ContactCTA />
      <Footer />

      {/* HEAVY JS - LOAD LAST */}
      <FloatingWidgets />
      <AIChatbot />
    </>
  );
}

/* =========================
   ⚡ STREAMING LISTING
========================= */
async function ListingAsync({
  dataPromise,
}: {
  dataPromise: Promise<any>;
}) {
  const data = await dataPromise;

  return <ListingSection allBdsItems={data} />;
}
