import type { Metadata } from 'next'; 
import ReactDOM from 'react-dom'; // 🌟 Vũ khí kích hoạt nạp trước LCP
import { getBdsData } from "@/lib/googleSheets";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ListingSection from "@/components/ListingSection";
import About from "@/components/About";
import Blog from "@/components/Blog";
import ContactCTA from "@/components/ContactCTA";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";


export const revalidate = 60; 

export const metadata: Metadata = {
  title: 'Trần Huy Land - Kênh thông tin bất động sản uy tín',
  description: 'Trần Huy Land - Chuyên cung cấp thông tin mua bán, cho thuê nhà đất, căn hộ uy tín và minh bạch tại Đà Nẵng.',
  openGraph: {
    title: 'Trần Huy Land - Kênh thông tin bất động sản',
    description: 'Chuyên cung cấp thông tin mua bán, cho thuê nhà đất, căn hộ uy tín và nhanh chóng.',
    url: 'https://tranhuyland.vn',
    siteName: 'Trần Huy Land',
    images: [
      {
        url: 'https://tranhuyland.vn/logo.png?v=1', 
        width: 1200,
        height: 630,
        alt: 'Trần Huy Land - Bất Động Sản',
      }
    ],
    locale: 'vi_VN',
    type: 'website',
  },
};

export default async function Home() {
  // 🚀 BÙA CHÚ CHÍ MẠNG TRIỆT TIÊU 360ms ĐỢI TẢI:
  // Ra lệnh trình duyệt lập tức kéo tấm ảnh Hero ngay ở mili-giây thứ 10
  ReactDOM.preload('/hero-bg.jpg', { as: 'image', fetchPriority: 'high' });

  const initialData = await getBdsData();

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
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
      ],
      "opens": "07:30", 
      "closes": "21:30" 
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />
      <Hero />
      <ListingSection allBdsItems={initialData} />
      <About />
      <Blog />
      <ContactCTA />
      <Footer />
      <FloatingWidgets />
      
    </>
  );
}
