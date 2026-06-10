import { getBdsData } from "@/lib/googleSheets";
import Script from "next/script"; // 🌟 Import component Script của Next.js
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ListingSection from "@/components/ListingSection";
import About from "@/components/About";
import Blog from "@/components/Blog";
import ContactCTA from "@/components/ContactCTA";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";
import AIChatbot from "@/components/AIChatbot";

// 🚀 Bạn có thể thêm revalidate ở đây nếu muốn trang chủ tự động tải lại dữ liệu mới sau X giây
// export const revalidate = 60; 

export default async function Home() {
  const initialData = await getBdsData();

  // 🏢 KHAI BÁO SCHEMA DOANH NGHIỆP: Định danh "Trần Huy Land" trên Google Search & Maps
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "Trần Huy Land",
    "image": "https://tranhuyland.vn/logo.png", // Thay bằng link logo thật của bạn
    "@id": "https://tranhuyland.vn",
    "url": "https://tranhuyland.vn",
    "telephone": "0900000000", // Cập nhật số điện thoại hotline
    "priceRange": "$$", // Bắt buộc phải có với Local Business
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Hải Châu", // Cập nhật địa chỉ văn phòng cụ thể nếu có
      "addressLocality": "Đà Nẵng",
      "addressRegion": "Đà Nẵng",
      "postalCode": "550000", // Mã bưu chính của Đà Nẵng
      "addressCountry": "VN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 16.0544, // Tọa độ trung tâm Đà Nẵng (Có thể lấy tọa độ văn phòng trên Google Maps để thay vào)
      "longitude": 108.2022
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
      ],
      "opens": "07:30", // Giờ mở cửa
      "closes": "21:30" // Giờ đóng cửa
    }
  };

  return (
    <>
      {/* ⚡ Chèn Script SEO Doanh nghiệp ẩn vào cấu trúc trang */}
      <Script
        id="real-estate-agent-schema"
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
      <AIChatbot />
    </>
  );
}
