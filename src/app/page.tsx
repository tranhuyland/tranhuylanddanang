import type { Metadata } from 'next'; // 🌟 Import kiểu dữ liệu Metadata của Next.js
import { getBdsData } from "@/lib/googleSheets";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ListingSection from "@/components/ListingSection";
import About from "@/components/About";
import Blog from "@/components/Blog";
import ContactCTA from "@/components/ContactCTA";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";
import AIChatbot from "@/components/AIChatbot";

// 🚀 BẬT TÍNH NĂNG TỰ ĐỘNG CẬP NHẬT: Tải lại dữ liệu mới từ Google Sheet sau mỗi 60 giây
export const revalidate = 60; 

// 🌐 BỔ SUNG METADATA: Khắc phục lỗi không hiện ảnh khi chia sẻ trang chủ lên Zalo, Facebook
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
        // 💡 Mẹo: Thêm ?v=1 để ép Zalo/Facebook xóa cache cũ và nhận diện ảnh mới ngay lập tức
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
  const initialData = await getBdsData();

  // 🏢 KHAI BÁO SCHEMA DOANH NGHIỆP: Định danh "Trần Huy Land" trên Google Search & Maps
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "Trần Huy Land",
    "image": "https://tranhuyland.vn/logo.png", // Thay bằng link logo thật của bạn
    "@id": "https://tranhuyland.vn",
    "url": "https://tranhuyland.vn",
    "telephone": "0905778852", // Cập nhật số điện thoại hotline
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
      "latitude": 16.0544, // Tọa độ trung tâm Đà Nẵng
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
      {/* ⚡ Chèn Script SEO Doanh nghiệp bằng thẻ HTML thường (Tối ưu nhất cho JSON-LD) */}
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
      <AIChatbot />
    </>
  );
}
