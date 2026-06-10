import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // 1. Cấu hình cho tất cả các công cụ tìm kiếm chính thống (Google, Bing, Yahoo...)
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',       // Chặn quét các route API nội bộ để bảo mật dữ liệu
          '/*?*',        // Tùy chọn: Chặn quét các URL có query string (ví dụ: ?search=, ?filter=) giúp tránh trùng lặp nội dung (Duplicate Content)
        ],
      },
      {
        // 2. Chặn các AI Bot thu thập dữ liệu bất động sản của bạn trái phép
        userAgent: ['GPTBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-Web', 'CCBot'],
        disallow: '/',
      }
    ],
    sitemap: 'https://tranhuyland.vn/sitemap.xml',
  };
}
