import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import dynamic from "next/dynamic";
import "./globals.css";

// 🚀 BÙA CHÚ TỐI ƯU: Tải chậm (Lazy-load / Dynamic Import) các tính năng phụ
// Tắt ssr (Server-Side Rendering) cho Chatbot và Nút cuộn để giải phóng luồng chính tuyệt đối
const AIChatbot = dynamic(() => import("@/components/AIChatbot"), { ssr: false });
const ScrollToTop = dynamic(() => import("@/components/ScrollToTop"), { ssr: false });

// 🌟 Khởi tạo Font chữ - Tối ưu bằng display: swap để không chặn hiển thị
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["vietnamese"],
  display: "swap",
  variable: "--font-plus-jakarta",
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
      <body className={`${plusJakartaSans.className} antialiased min-h-screen flex flex-col pb-20 md:pb-0 bg-slate-50`} suppressHydrationWarning>
        {/* 1. Ưu tiên tải toàn bộ nội dung chính (Trang chủ, Nhà đất, Hình ảnh) trước */}
        {children}
        
        {/* 2. Chatbot và Nút cuộn sẽ được lẳng lặng nạp vào sau khi web đã mượt mà */}
        <AIChatbot /> 
        <ScrollToTop />
      </body>
    </html>
  );
}
