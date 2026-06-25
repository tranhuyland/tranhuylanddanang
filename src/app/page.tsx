import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { getBdsData } from "@/lib/googleSheets";

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ListingSection from "@/components/ListingSection";
import About from "@/components/About";
import Blog from "@/components/Blog";
import ContactCTA from "@/components/ContactCTA";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";

const AIChatbot = dynamic(() => import("@/components/AIChatbot"), {
  ssr: false,
  loading: () => null,
});

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Trần Huy Land | Bất động sản Đà Nẵng chính chủ",
  description:
    "Nhà đất Đà Nẵng chính chủ, giá tốt, pháp lý rõ ràng.",
  openGraph: {
    title: "Trần Huy Land",
    description: "Nhà đất Đà Nẵng",
    url: "https://tranhuyland.vn",
    siteName: "Trần Huy Land",
    images: [
      {
        url: "https://tranhuyland.vn/logo.png?v=1",
        width: 1200,
        height: 630,
        alt: "Trần Huy Land",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
};

export default async function Home() {
  const initialData = await getBdsData();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "Trần Huy Land",
    url: "https://tranhuyland.vn",
    telephone: "0905778852",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />
      <Hero />

      {/* SSR listing => giảm JS cực mạnh */}
      <ListingSection allBdsItems={initialData} />

      <About />
      <Blog />
      <ContactCTA />
      <Footer />
      <FloatingWidgets />

      <AIChatbot />
    </>
  );
}
