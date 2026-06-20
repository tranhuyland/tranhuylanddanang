import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import dynamic from "next/dynamic"; // 🔥 B1: Import thư viện tải động của Next.js

// 🚀 B1: Lazy Load các component nổi (Chỉ tải khi trình duyệt đã render xong giao diện chính)
// Điều này giúp tiết kiệm tài nguyên Server và tăng điểm tốc độ Google cực mạnh
const AIChatbot = dynamic(() => import("@/components/AIChatbot"), { ssr: false });
const ScrollToTop = dynamic(() => import("@/components/ScrollToTop"), { ssr: false });

// 🌟 Khởi tạo Font chữ - Tối ưu bằng display: swap
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-plus-jakarta",
  preload: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://tranhuyland.vn"),
  title: "Trần Huy Land | Kho Nhà Đất Chính Chủ Hải Châu Cẩm Lệ Đà Nẵng",
  description: "Mua bán, ký gửi nhà đất chính chủ uy tín tại Hải Châu, Cẩm Lệ, Đà Nẵng. Cập nhật giỏ hàng thực tế mỗi ngày: Nhà mặt tiền Cẩm Bá Thước, nhà kiệt ô tô Cách Mạng Tháng 8. Pháp lý minh bạch, có sẵn sổ đỏ bản vẽ xem ngay.",
  keywords: ["nhà đất đà nẵng", "nhà đất chính chủ hải châu", "ký gửi nhà đất cẩm lệ", "nhà đất trần huy", "mua nhà đà nẵng", "bán đất cẩm lệ"],
  robots: "index, follow, max-image-preview:large",
  alternates: { canonical: "https://tranhuyland.vn" }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={plusJakartaSans.variable} suppressHydrationWarning>
      {/* 🚀 XÓA THẺ <head> THỦ CÔNG: Next.js tự động xử lý <link rel="preload"> tốt hơn anh tự viết. 
         Việc ép preload thủ công đôi khi gây lỗi "Render-blocking" nếu đường dẫn tĩnh thay đổi sau mỗi lần build.
      */}
      
      <body className={`${plusJakartaSans.className} antialiased min-h-screen flex flex-col pb-20 md:pb-0 bg-slate-50`} suppressHydrationWarning>
        {children}
        <AIChatbot /> 
        <ScrollToTop />
      </body>
    </html>
  );
}
