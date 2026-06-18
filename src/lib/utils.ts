// src/lib/utils.ts

/**
 * Hàm chuẩn hóa URL ảnh từ Cloudinary để tối ưu tốc độ (WebP)
 * Giữ nguyên Watermark và tự động nén chất lượng
 */
export const layUrlAnhChuan = (chuoiAnh: string) => {
  const ANH_MAC_DINH = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80';
  if (!chuoiAnh) return ANH_MAC_DINH;
  
  // Tách chuỗi và lấy ảnh đầu tiên an toàn
  const danhSach = chuoiAnh.split(",").map(a => a.trim()).filter(a => a.startsWith("http"));
  let url = danhSach.length > 0 ? danhSach[0] : ANH_MAC_DINH;
  
  // 🔥 BÙA CHÚ WEBP AN TOÀN TUYỆT ĐỐI
  // Dùng '/image/upload/' thay vì '/upload/' để tránh dán nhầm vào tên file
  if (url.includes("res.cloudinary.com") && !url.includes("f_auto")) {
    url = url.replace("/image/upload/", "/image/upload/f_auto,q_auto/");
  }
  
  return url;
};

/**
 * Hàm xóa dấu tiếng Việt để lọc dữ liệu
 * (Giữ nguyên thuật toán khử dấu siêu mạnh của anh)
 */
export const cleanVietnameseText = (str: string) => {
  if (!str) return "";
  return str.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").trim();
};
