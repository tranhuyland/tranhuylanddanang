import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import dynamic from "next/dynamic";
import "./globals.css";

// Lazy load non-critical UI
const AIChatbot = dynamic(() => import("@/components/AIChatbot"), {
  ssr: false,
});

const ScrollToTop = dynamic(() => import("@/components/ScrollToTop"), {
  ssr: false,
});

// Font tối ưu LCP
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  preload: true,
  variable: "--font-plus-jakarta",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://tranhuyland.vn"),
  title: "Trần Huy Land | Nhà đất chính chủ Đà Nẵng",
  description:
    "Mua bán, ký gửi nhà đất chính chủ tại Đà Nẵng. Giỏ hàng thực tế cập nhật mỗi ngày.",
  keywords: [
    "nhà đất đà nẵng",
    "nhà đất hải châu",
    "nhà đất cẩm lệ",
    "ký gửi nhà đất đà nẵng",
  ],
  robots: "index, follow, max-image-preview:large",
  alternates: { canonical: "https://tranhuyland.vn" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={plusJakartaSans.variable}>
      <body
        className={`${plusJakartaSans.className} antialiased min-h-screen flex flex-col bg-slate-50`}
      >
        {children}

        {/* Lazy UI (không ảnh hưởng LCP) */}
        <AIChatbot />
        <ScrollToTop />
      </body>
    </html>
  );
}
