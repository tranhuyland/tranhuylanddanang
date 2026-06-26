import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import dynamic from "next/dynamic";
import "./globals.css";

// 🚀 BÙA CHÚ TỐI ƯU HIỆU NĂNG: Khóa cứng chế độ tải muộn phía Client (ssr: false)
// Việc này giúp bẻ gãy hoàn toàn chuỗi chặn kết xuất, giải phóng băng thông cho file CSS toàn cục nạp trước
const AIChatbot = dynamic(() => import("@/components/AIChatbot"), { ssr: false });
const ScrollToTop = dynamic(() => import("@/components/ScrollToTop"), { ssr: false });

// 🌟 Khởi tạo Font chữ - Tối ưu bằng display: swap để không chặn hiển thị chữ
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
        
        {/* ⚡ LUỒNG 1: Ưu tiên tối đa hiển thị nội dung trang chủ, hình ảnh nhà đất & ảnh Hero */}
        {children}
        
        {/* ⚡ LUỒNG 2: Tiện ích phụ chỉ được kích hoạt sau khi giao diện chính đã vẽ xong mượt mà */}
        <AIChatbot /> 
        <ScrollToTop />
        
      </body>
    </html>
  );
}
