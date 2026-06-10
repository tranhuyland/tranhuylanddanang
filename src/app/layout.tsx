import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google"; // 🌟 Import font chuẩn Next.js
import "./globals.css";

// Khởi tạo cấu hình Font chữ hệ thống
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-plus-jakarta", // Tạo biến CSS nếu cần dùng trong Tailwind
});

export const metadata: Metadata = {
  // 🌟 BẮT BUỘC: Giúp Next.js tự động phân giải các đường dẫn ảnh SEO tuyệt đối ở trang chi tiết
  metadataBase: new URL("https://tranhuyland.vn"), 
  title: "Trần Huy Land | Kho Nhà Đất Chính Chủ Hải Châu Cẩm Lệ Đà Nẵng",
  description: "Mua bán, ký gửi nhà đất chính chủ uy tín tại Hải Châu, Cẩm Lệ, Đà Nẵng. Cập nhật giỏ hàng thực tế mỗi ngày: Nhà mặt tiền Cẩm Bá Thước, nhà kiệt ô tô Cách Mạng Tháng 8. Pháp lý minh bạch, có sẵn sổ đỏ bản vẽ xem ngay.",
  keywords: ["nhà đất đà nẵng", "nhà đất chính chủ hải châu", "ký gửi nhà đất cẩm lệ", "nhà đất trần huy", "mua nhà đà nẵng", "bán đất cẩm lệ"],
  robots: "index, follow, max-image-preview:large",
  alternates: { canonical: "https://tranhuyland.vn" }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={plusJakartaSans.variable}>
      {/* 💡 Không cần thẻ <head> chứa <link> font thủ công nữa, Next.js tự xử lý ngầm cực sạch */}
      <body className={`${plusJakartaSans.className} antialiased min-h-screen flex flex-col pb-20 md:pb-0`}>
        {children}
      </body>
    </html>
  );
}
