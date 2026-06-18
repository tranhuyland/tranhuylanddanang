import { MetadataRoute } from 'next';
import { getBdsData } from '@/lib/googleSheets';

// Tự động làm mới Sitemap mỗi 1 tiếng (3600s) giúp giảm tải tuyệt đối cho Google Sheet API.
export const revalidate = 3600; 

// Chuyển đổi chuỗi ngày DD/MM/YYYY chuẩn Việt Nam sang Date an toàn
function parseVnDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  
  const cleanStr = dateStr.trim();
  const parts = cleanStr.split(/[-/]/);
  
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    let year = parseInt(parts[2], 10);
    
    // Xử lý thông minh nếu người dùng chỉ nhập năm 2 số (vd: 24 -> 2024)
    if (year < 100) year += 2000;
    
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return new Date(year, month - 1, day);
    }
  }
  return new Date();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://tranhuyland.vn';
  
  try {
    const data = await getBdsData();

    // Lọc sạch dữ liệu, loại bỏ sản phẩm không có slug
    const safeData = Array.isArray(data) 
      ? data.filter((item: any) => item && item.slug && item.slug.trim() !== '') 
      : [];

    // 1. URL Sản phẩm Nhà Đất
    const bdsUrls: MetadataRoute.Sitemap = safeData.map((item: any) => {
      const rawDate = item.ngayDang || item.NgayDang || item.ngay || '';
      const parsedDate = parseVnDate(rawDate);
      const finalDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

      return {
        // Mã hóa URI để an toàn tuyệt đối với mọi ký tự lạ
        url: `${baseUrl}/nha-dat/${encodeURIComponent(item.slug.trim())}`,
        lastModified: finalDate,
        changeFrequency: 'daily' as const, // Thêm as const để chống lỗi TypeScript
        priority: 0.8,
      };
    });

    // Tìm ngày đăng của căn nhà MỚI NHẤT để gán cho Trang chủ và Danh mục
    const latestPostDate = bdsUrls.length > 0 
      ? new Date(Math.max(...bdsUrls.map(item => (item.lastModified as Date).getTime()))) 
      : new Date();

    // 2. URL Danh mục Vị trí (Phường/Quận trọng điểm)
    const locations = ['hai-chau', 'cam-le', 'thanh-khe', 'lien-chieu', 'son-tra', 'ngu-hanh-son'];
    const locationUrls: MetadataRoute.Sitemap = locations.map((slug) => ({
      url: `${baseUrl}/vi-tri/${slug}`,
      lastModified: latestPostDate, // Dùng ngày thực tế có bài mới
      changeFrequency: 'weekly' as const, // Thêm as const
      priority: 0.7,
    }));

    // 3. Kết hợp với Trang chủ
    return [
      { 
        url: baseUrl, 
        lastModified: latestPostDate, // Dùng ngày thực tế có bài mới
        changeFrequency: 'daily' as const, // Thêm as const
        priority: 1.0 
      },
      ...bdsUrls,
      ...locationUrls,
    ];
  } catch (error) {
    console.error('Lỗi sitemap:', error);
    return [
      { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1.0 }
    ];
  }
}
