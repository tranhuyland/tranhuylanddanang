import { MetadataRoute } from 'next';
import { getBdsData } from '@/lib/googleSheets';

// Ép buộc Next.js luôn chạy hàm này từ server để lấy data Google Sheets mới nhất, giúp render đúng cấu trúc XML
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://tranhuyland.vn';
  
  try {
    const data = await getBdsData();

    // 1. URL Sản phẩm Nhà Đất
    const bdsUrls = data.map((item: any) => {
      // Thử lấy ngày đăng thực tế từ Google Sheet, nếu không có mới dùng ngày hôm nay làm mặc định
      const rawDate = item.ngayDang || item.NgayDang;
      const parsedDate = rawDate ? new Date(rawDate) : new Date();
      // Đảm bảo nếu ngày lỗi/không hợp lệ thì vẫn fallback về thời gian hiện tại
      const finalDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

      return {
        url: `${baseUrl}/nha-dat/${item.slug}`,
        lastModified: finalDate,
        changeFrequency: 'daily' as const, // Thêm as const để ép kiểu dữ liệu chuẩn cho Next.js
        priority: 0.8,
      };
    });

    // 2. URL Danh mục Vị trí
    const locations = ['hai-chau', 'cam-le', 'thanh-khe', 'lien-chieu', 'son-tra', 'ngu-hanh-son'];
    const locationUrls = locations.map((slug) => ({
      url: `${baseUrl}/vi-tri/${slug}`,
      lastModified: new Date(), // Các trang bộ lọc vị trí giữ ngày hiện tại vì dữ liệu thay đổi liên tục
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    // 3. Kết hợp với Trang chủ
    return [
      { 
        url: baseUrl, 
        lastModified: new Date(), 
        changeFrequency: 'daily' as const, // 🌟 Sửa lỗi thiếu 'as const' ở đây
        priority: 1.0 
      },
      ...bdsUrls,
      ...locationUrls,
    ];
  } catch (error) {
    console.error('Lỗi sitemap:', error);
    // Trả về mặc định trang chủ nếu Google Sheets lỗi để web không bị sập
    return [
      { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1.0 }
    ];
  }
}
