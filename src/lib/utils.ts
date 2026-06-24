// src/lib/utils.ts

/**
 * Hàm chuẩn hóa URL ảnh từ Cloudinary
 * @param url - Link ảnh gốc
 * @param width - Độ rộng muốn hiển thị (mặc định 700px là vừa đẹp cho mobile/tablet)
 */
export const layUrlAnhChuan = (url: string, width: number = 700) => {
  const ANH_MAC_DINH = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80';
  
  if (!url || typeof url !== 'string') return ANH_MAC_DINH;
  
  // Tách chuỗi nếu có nhiều ảnh
  const danhSach = url.split(",").map(a => a.trim()).filter(a => a.startsWith("http"));
  let finalUrl = danhSach.length > 0 ? danhSach[0] : ANH_MAC_DINH;
  
  // 🔥 BÙA CHÚ WEBP & RESIZE THÔNG MINH
  // Chỉ áp dụng cho ảnh Cloudinary
  if (finalUrl.includes("res.cloudinary.com")) {
    // Nếu link đã có tham số resize/format thì không đè nữa
    if (!finalUrl.includes("f_auto")) {
      // Thay /upload/ thành /upload/f_auto,q_auto,w_{width}/
      return finalUrl.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
    }
  }
  
  return finalUrl;
};

export const cleanVietnameseText = (str: string) => {
  if (!str) return "";
  return str.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").trim();
};
