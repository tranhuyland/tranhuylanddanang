// src/lib/utils.ts

/**
 * Hàm chuẩn hóa URL ảnh từ Cloudinary để tối ưu tốc độ (WebP)
 * Giữ nguyên Watermark và tự động nén chất lượng
 */
export const layUrlAnhChuan = (chuoiAnh: string) => {
  if (!chuoiAnh) return 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80';
  
  const danhSach = chuoiAnh.split(",").map(a => a.trim()).filter(a => a.startsWith("http"));
  if (danhSach.length === 0) return 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80';
  
  let url = danhSach[0];
  
  // Tự động chèn f_auto,q_auto cho Cloudinary
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    if (!url.includes("f_auto") && !url.includes("q_auto")) {
      url = url.replace("/upload/", "/upload/f_auto,q_auto/");
    }
  }
  
  return url;
};

/**
 * Hàm xóa dấu tiếng Việt để lọc dữ liệu
 */
export const cleanVietnameseText = (str: string) => {
  if (!str) return "";
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").trim();
};
