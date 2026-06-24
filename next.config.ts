import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 🚀 BÙA CHÚ CHÍ MẠNG: Tắt bộ nén trung gian của Vercel. 
    // Trả thẳng link WebP gốc của Cloudinary ra ngoài -> Miễn nhiễm 100% lỗi sập hạn mức 1000 ảnh/tháng
    unoptimized: true, 
    remotePatterns: [
      { protocol: "https", hostname: "i.postimg.cc" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" }, // 👈 Mở khóa toàn bộ trạm chứa ảnh gốc sau lưng Google Drive/Photos
      { protocol: "https", hostname: "tranhuyland.vn" },
      { protocol: "https", hostname: "www.tranhuyland.vn" },
    ],
  },

  // 🚀 TỐI ƯU BỘ NHỚ ĐỆM: Ra lệnh cho trình duyệt khách lưu cứng Phông chữ (.woff2) trong 1 năm
  // Bọ Googlebot quay lại kiểm tra sẽ không bao giờ văng lỗi 404 hụt font nữa
  async headers() {
    return [
      {
        source: "/_next/static/media/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
