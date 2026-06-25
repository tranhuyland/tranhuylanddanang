import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import dynamic from "next/dynamic";
import "./globals.css";

const AIChatbot = dynamic(() => import("@/components/AIChatbot"));
const ScrollToTop = dynamic(() => import("@/components/ScrollToTop"));

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
  description: "Mua bán, ký gửi nhà đất chính chủ uy tín tại Hải Châu, Cẩm Lệ, Đà Nẵng.",
  keywords: ["nhà đất đà nẵng", "nhà đất chính chủ hải châu", "ký gửi nhà đất cẩm lệ"],
  robots: "index, follow, max-image-preview:large",
  alternates: { canonical: "https://tranhuyland.vn" }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={plusJakartaSans.variable} suppressHydrationWarning>
      <head>
        {/* 🚀 BÙA CHÚ TỐI ƯU LCP: Ép trình duyệt tải tệp CSS ngay lập tức */}
        <link 
          rel="preload" 
          href="/_next/static/css/9b1ad65f20a34091.css" 
          as="style" 
        />
      </head>
      <body className={`${plusJakartaSans.className} antialiased min-h-screen flex flex-col pb-20 md:pb-0 bg-slate-50`} suppressHydrationWarning>
        {children}
        <AIChatbot /> 
        <ScrollToTop />
      </body>
    </html>
  );
}
