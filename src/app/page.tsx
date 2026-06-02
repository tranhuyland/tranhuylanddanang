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

export default async function Home() {
  // Đổ dữ liệu an toàn phía Server (SSR) tối ưu cấu trúc SEO cho Bot tìm kiếm thu thập
  const initialData = await getBdsData();

  return (
    <>
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
