// src/lib/utils.ts

/**
 * Hàm chuẩn hóa URL ảnh từ Cloudinary và Google
 * Tự động nén WebP, nén chất lượng và BÓP CHIỀU NGANG ảnh để đạt 100 điểm PageSpeed
 * * @param chuoiAnh - Link ảnh gốc từ Google Sheet
 * @param width - Độ rộng muốn hiển thị (Mặc định 700px. Dùng 400px cho thẻ card nhỏ)
 */
export const layUrlAnhChuan = (chuoiAnh: string, width: number = 700) => {
  const ANH_MAC_DINH = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80';
  
  if (!chuoiAnh || typeof chuoiAnh !== 'string') return ANH_MAC_DINH;
  
  // Tách chuỗi và lấy ảnh đầu tiên an toàn
  const danhSach = chuoiAnh.split(",").map(a => a.trim()).filter(a => a.startsWith("http"));
  let url = danhSach.length > 0 ? danhSach[0] : ANH_MAC_DINH;
  
  // 🔥 BÙA CHÚ 1: CLOUDINARY (Ép WebP, tự tinh chỉnh chất lượng & Bóp chiều ngang)
  if (url.includes("res.cloudinary.com")) {
    // Trường hợp 1: Link đã có sẵn f_auto từ trước -> Ta ghi đè thêm kích thước w_ vào
    if (url.includes("f_auto")) {
      return url.replace(/f_auto(,[^/]+)?/, `f_auto,q_auto,w_${width}`);
    }
    // Trường hợp 2: Link gốc thuần túy -> Chèn bùa chú vào ngay sau /image/upload/
    return url.replace("/image/upload/", `/image/upload/f_auto,q_auto,w_${width}/`);
  }

  // 🔥 BÙA CHÚ 2: GOOGLE DRIVE / GOOGLE PHOTOS (Tự động nén kích thước trả về)
  if (url.includes("googleusercontent.com") || url.includes("ggpht.com")) {
    if (url.includes("?")) {
      return `${url}&w=${width}`;
    }
    return `${url}?w=${width}`;
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
