import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import dynamic from "next/dynamic";
import "./globals.css";

// 🚀 BÙA CHÚ TỐI ƯU: Tải chậm (Lazy-load / Code-splitting)
const AIChatbot = dynamic(() => import("@/components/AIChatbot"));
const ScrollToTop = dynamic(() => import("@/components/ScrollToTop"));

// 🌟 Khởi tạo Font chữ - Thêm preload: true để chặn độ trễ LCP 150ms
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["vietnamese"],
  display: "swap",
  preload: true,
  variable: "--font-plus-jakarta",
});

// 🔥 ĐÃ SỬA LỖI: Khóa Zoom hoàn toàn trên iPhone/Safari khi bấm vào ô Tìm Kiếm
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
      <body className={`${plusJakartaSans.className} antialiased min-h-screen flex flex-col pb-20 md:pb-0 bg-slate-50`} suppressHydrationWarning>
        {/* Ưu tiên tải toàn bộ nội dung chính (Trang chủ, Nhà đất, Hình ảnh) trước */}
        {children}
        
        {/* Chatbot và Nút cuộn được tách luồng tải riêng */}
        <AIChatbot /> 
        <ScrollToTop />
      </body>
    </html>
  );
}
