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

// ⛳ HÀM 1: LẤY DỮ LIỆU NHÀ ĐẤT (Đã chuẩn hóa)
export async function getBdsData(): Promise<RealEstateItem[]> {
  const sheetUrl = "https://docs.google.com/spreadsheets/d/1-LupBV6uNuUitz4vF6pFv6MupuVDMujafqhjQBNNPTA/export?format=csv&sheet=BDS";
  try {
    const response = await fetch(sheetUrl, { next: { revalidate: 60 } });
    const csvText = await response.text();
    
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < csvText.length; i++) {
      const char = csvText[i];
      const nextChar = csvText[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentField += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        currentRow.push(currentField.trim());
        if (currentRow.length > 0 && currentRow.some(field => field !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
    
    if (currentField || currentRow.length > 0) {
      currentRow.push(currentField.trim());
      if (currentRow.length > 0 && currentRow.some(field => field !== '')) {
        rows.push(currentRow);
      }
    }

    if (rows.length < 2) return [];

    const headers = rows[0].map(h => h.trim().replace(/['"]+/g, '').toLowerCase());
    const items: RealEstateItem[] = [];

    for (let i = 1; i < rows.length; i++) {
      const rowData = rows[i];
      const obj: any = {};
      
      headers.forEach((headerName, idx) => {
        let value = rowData[idx] || "";
        obj[headerName] = value.replace(/^"|"$/g, '').trim();
      });

      const finalTitle = obj.tieude || obj.title || "Chưa có tiêu đề";
      const moTaBds = obj.mota || obj.description || "";

      const item: RealEstateItem = {
        id: parseInt(obj.id) || i,
        tieude: finalTitle,
        slug: convertToSlug(finalTitle),
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

// 📰 HÀM 2: LẤY DỮ LIỆU TAB BLOG (🔥 ĐÃ VÁ 100% CÁC BẪY NHẬP LIỆU)
export async function getBlogData(): Promise<any[]> {
  const spreadsheetId = "1-LupBV6uNuUitz4vF6pFv6MupuVDMujafqhjQBNNPTA";
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&sheet=Blog`;

  try {
    const response = await fetch(url, { next: { revalidate: 60 } });
    if (!response.ok) return [];
    const csvText = await response.text();

    // 🚀 VÁ LỖI 1: Tránh trường hợp Google Sheet trả về trang HTML báo lỗi
    if (csvText.trim().startsWith("<!DOCTYPE") || csvText.trim().startsWith("<html")) {
      console.error("🚨 Lỗi: Google Sheet trả về trang HTML. Hãy kiểm tra tên Tab dưới Sheet phải gõ đúng chữ 'Blog'");
      return [];
    }
    
    // Thuật toán đọc từng ký tự bảo vệ ký tự xuống dòng
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < csvText.length; i++) {
      const char = csvText[i];
      const nextChar = csvText[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentField += '"';
          i++; 
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        currentRow.push(currentField.trim());
        if (currentRow.length > 0 && currentRow.some(field => field !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
    
    if (currentField || currentRow.length > 0) {
      currentRow.push(currentField.trim());
      if (currentRow.length > 0 && currentRow.some(field => field !== '')) {
        rows.push(currentRow);
      }
    }

    if (rows.length < 2) return [];

    const headers = rows[0].map(h => h.trim().replace(/['"]+/g, '').toLowerCase());
    const blogItems: any[] = [];

    for (let i = 1; i < rows.length; i++) {
      const rowData = rows[i];
      const obj: any = {};
      
      headers.forEach((headerName, idx) => {
        let value = rowData[idx] || "";
        obj[headerName] = value.replace(/^"|"$/g, '').trim();
      });

      // 🚀 VÁ LỖI 2: Quét lấy Tiêu đề (Hỗ trợ người nhập gõ cột tên là 'title' hoặc 'tieude')
      const rawTitle = obj.title || obj.tieude || "";

      // 🚀 VÁ LỖI 3: Nếu trên Sheet để trống cột slug -> Tự động băm Tiêu đề ra làm slug!
      const safeSlug = obj.slug ? convertToSlug(obj.slug) : convertToSlug(rawTitle);

      const finalItem = {
        slug: safeSlug,
        title: rawTitle || "Bài viết chưa có tiêu đề",
        excerpt: obj.excerpt || obj.mota || obj.mo_ta || "",
        image: obj.image || obj.anh || "",
        content: obj.content || obj.noidung || obj.noi_dung || "",
        date: obj.date || obj.ngay || obj.ngaydang || '24/06/2026'
      };

      // 🚀 VÁ LỖI 4: Tiêu chuẩn đẩy bài cực thoáng, có title và slug là cho lên web!
      if (finalItem.title !== "" && finalItem.slug !== "") {
        blogItems.push(finalItem);
      }
    }
    return blogItems;
  } catch (error) {
    console.error("Lỗi fetch dữ liệu Blog từ Google Sheet:", error);
    return [];
  }
}
