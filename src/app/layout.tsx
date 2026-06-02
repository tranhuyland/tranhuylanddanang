import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trần Huy Land | Kho Nhà Đất Chính Chủ Hải Châu Cẩm Lệ Đà Nẵng",
  description: "Mua bán, ký gửi nhà đất chính chủ uy tín tại Hải Châu, Cẩm Lệ, Đà Nẵng. Cập nhật giỏ hàng thực tế mỗi ngày: Nhà mặt tiền Cẩm Bá Thước, nhà kiệt ô tô Cách Mạng Tháng 8. Pháp lý minh bạch, có sẵn sổ đỏ bản vẽ xem ngay.",
  keywords: ["nhà đất đà nẵng", "nhà đất chính chủ hải châu", "ký gửi nhà đất cẩm lệ", "nhà đất trần huy", "mua nhà đà nẵng", "bán đất cẩm lệ"],
  robots: "index, follow, max-image-preview:large",
  alternates: { canonical: "https://tranhuyland.vn" }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen flex flex-col pb-20 md:pb-0">
        {children}
      </body>
    </html>
  );
}
