import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.postimg.cc" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" }, // Đã tích hợp domain Cloudinary để load ảnh mượt mà
      { protocol: "https", hostname: "lh3.googleusercontent.com" }, // Load ảnh từ Google Photos/Avatar
      { protocol: "https", hostname: "drive.google.com" } // Load ảnh trực tiếp từ Google Drive
    ],
  },
};

export default nextConfig;
