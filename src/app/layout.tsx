import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import ScrollToTop from "@/components/ScrollToTop"; 
import AIChatbot from "@/components/AIChatbot";

// 🌟 Khởi tạo Font chữ siêu tốc độ
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap", // Bắt buộc để font không bị chặn hiển thị
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
      {/* 🚀 BỔ SUNG THẺ HEAD: Ép tải trước CSS và cấu trúc cơ bản để chống lỗi Render-blocking */}
      <head>
        <link rel="preload" href="/_next/static/css/app/layout.css" as="style" />
      </head>
      
      <body className={`${plusJakartaSans.className} antialiased min-h-screen flex flex-col pb-20 md:pb-0 bg-slate-50`} suppressHydrationWarning>
        {children}
        <AIChatbot /> 
        <ScrollToTop />
      </body>
    </html>
  );
}
