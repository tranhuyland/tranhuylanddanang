import { MetadataRoute } from 'next';
import { getBdsData } from '@/lib/googleSheets';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://tranhuyland.vn';
  const data = await getBdsData();

  // 1. Tạo danh sách URL cho từng sản phẩm nhà đất từ Google Sheets
  const bdsUrls = data.map((item) => ({
    url: `${baseUrl}/nha-dat/${item.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // 2. Tạo danh sách URL cho các danh mục khu vực/vị trí (Đã đổi từ 'quan' thành 'vi-tri')
  const locations = ['hai-chau', 'cam-le', 'thanh-khe', 'lien-chieu', 'son-tra', 'ngu-hanh-son'];
  const locationUrls = locations.map((slug) => ({
    url: `${baseUrl}/vi-tri/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // 3. Trả về toàn bộ cấu trúc sơ đồ trang web
  return [
    { 
      url: baseUrl, 
      lastModified: new Date(), 
      changeFrequency: 'daily', 
      priority: 1.0 
    },
    ...bdsUrls,
    ...locationUrls,
  ];
}
