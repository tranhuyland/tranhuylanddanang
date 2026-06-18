import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // 1. Cấu hình cho tất cả các công cụ tìm kiếm chính thống (Google, Bing, Yahoo...)
        userAgent: '*',
        allow: [
          '/',
          '/_next/static/', // Cho phép bọ quét các file giao diện tĩnh (CSS, JS) để hiển thị đúng cấu trúc web
          '/_next/image',  // 🔥 QUAN TRỌNG: Mở cửa cho Googlebot vào cào và tối ưu chỉ mục hình ảnh BĐS
        ],
        disallow: [
          '/api/',       // Chặn quét các route API nội bộ để bảo mật dữ liệu hệ thống
          '/*?*',        // Chặn các URL lọc/tìm kiếm có query string để tránh Duplicate Content (nhưng không ảnh hưởng đến ảnh nhờ lệnh allow ở trên)
        ],
      },
      {
        // 2. Chặn hoàn toàn các AI Bot thu thập dữ liệu bất động sản của anh trái phép
        userAgent: ['GPTBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-Web', 'CCBot'],
        disallow: '/',
      }
    ],
    sitemap: 'https://tranhuyland.vn/sitemap.xml',
  };
}
