export interface RealEstateItem {
  id: number;
  tieude: string;
  slug: string;
  moTa: string;
  gia: string;
  soGia: number;
  dienTich: string;
  khuVuc: string;
  khuVucFull: string;
  loaiHinh: string;
  huong: string;
  phongNgu: string;
  phapLy: string;
  tag: string;
  tagColor: string;
  anh: string;
  anhSoDo: string;
  linkMap: string;
  videoUrl: string;
  ngayDang: string;
  isMatTien: boolean;
}

export function convertToSlug(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/á|à|ả|ã|ạ|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a')
    .replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e')
    .replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i')
    .replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o')
    .replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u')
    .replace(/ý|ỳ|ỷ|ỹ|ị/gi, 'y')
    .replace(/đ/gi, 'd')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function getBdsData(): Promise<RealEstateItem[]> {
  const sheetUrl = "https://docs.google.com/spreadsheets/d/1-LupBV6uNuUitz4vF6pFv6MupuVDMujafqhjQBNNPTA/export?format=csv";
  try {
    const response = await fetch(sheetUrl, { next: { revalidate: 0 } });
    const csvText = await response.text();
    
    // Thuật toán bóc tách dữ liệu cao cấp: Duyệt từng ký tự để giữ nguyên dấu phẩy và dấu Enter trong dấu ngoặc kép ""
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < csvText.length; i++) {
      const char = csvText[i];
      const nextChar = csvText[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Xử lý dấu ngoặc kép kép bên trong văn bản (escaped quote "")
          currentField += '"';
          i++;
        } else {
          // Đảo trạng thái ngoặc kép
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // Gặp dấu phẩy phân tách cột ngoài ngoặc kép
        currentRow.push(currentField.trim());
        currentField = '';
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        // Gặp dấu xuống hàng kết thúc bản ghi ngoài ngoặc kép
        if (char === '\r' && nextChar === '\n') {
          i++; // Bỏ qua ký tự \n đi kèm của Windows
        }
        currentRow.push(currentField.trim());
        if (currentRow.length > 0 && currentRow.some(field => field !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      } else {
        // Gom ký tự thường vào ô dữ liệu hiện tại
        currentField += char;
      }
    }
    
    // Gom ô dữ liệu cuối cùng của file nếu không có dấu xuống hàng ở cuối file
    if (currentField || currentRow.length > 0) {
      currentRow.push(currentField.trim());
      if (currentRow.length > 0 && currentRow.some(field => field !== '')) {
        rows.push(currentRow);
      }
    }

    if (rows.length < 2) return [];

    // Lấy tiêu đề cột và chuẩn hóa về dạng chữ thường không khoảng cách
    const headers = rows[0].map(h => h.trim().replace(/['"]+/g, '').toLowerCase());
    const items: RealEstateItem[] = [];

    for (let i = 1; i < rows.length; i++) {
      const rowData = rows[i];
      const obj: any = {};
      
      headers.forEach((headerName, idx) => {
        // Loại bỏ dấu ngoặc kép dư thừa ở đầu và cuối chuỗi dữ liệu thô
        let value = rowData[idx] || "";
        obj[headerName] = value.replace(/^"|"$/g, '').trim();
      });

      // Tạo các trường aliases hỗ trợ linh hoạt chữ hoa chữ thường tránh lỗi map dữ liệu
      const tieuDeBds = obj.tieude || obj.title || "Chưa có tiêu đề";
      const moTaBds = obj.mota || obj.mota || obj.description || "";

      const item: RealEstateItem = {
        id: parseInt(obj.id) || i,
        tieude: tieuDeBds,
        slug: convertToSlug(tieuDeBds),
        moTa: moTaBds,
        gia: obj.gia || "",
        soGia: parseFloat(obj.sogia) || 0,
        dienTich: obj.dientich || obj.dien_tich || "",
        khuVuc: obj.khuvuc || "Hải Châu",
        khuVucFull: obj.khuvucfull || obj.diachi || obj.dia_chi || "Đà Nẵng",
        loaiHinh: obj.loaihinh || "Nhà phố",
        huong: obj.huong || "",
        phongNgu: obj.phongngu || "",
        phapLy: obj.phaply || "Sổ hồng",
        tag: obj.tag || "Chính Chủ",
        tagColor: obj.tagcolor || "bg-emerald-500",
        anh: obj.anh || obj.image || "",
        anhSoDo: obj.anhsodo || obj.sodo || "",
        linkMap: obj.linkmap || "",
        videoUrl: obj.videourl || "",
        ngayDang: obj.ngaydang || "Tin mới",
        isMatTien: ((obj.tag?.toLowerCase().includes("mặt tiền")) || obj.ismattien === "TRUE")
      };
      
      if (item.slug) {
        items.push(item);
      }
    }
    return items;
  } catch (e) { 
    console.error("Lỗi parse file Google Sheet CSV:", e);
    return []; 
  }
}
