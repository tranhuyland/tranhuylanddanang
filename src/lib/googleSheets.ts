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
  return text.toLowerCase().replace(/á|à|ả|ã|ạ|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a').replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e').replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i').replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o').replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u').replace(/ý|ỳ|ỷ|ỹ|ị/gi, 'y').replace(/đ/gi, 'd').replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
}

export async function getBdsData(): Promise<RealEstateItem[]> {
  const sheetUrl = "https://docs.google.com/spreadsheets/d/1-LupBV6uNuUitz4vF6pFv6MupuVDMujafqhjQBNNPTA/export?format=csv";
  try {
    const response = await fetch(sheetUrl, { next: { revalidate: 0 } });
    const csvText = await response.text();
    const lines = csvText.split(/\r?\n/);
    if (lines.length < 2) return [];
    
    // TỰ ĐỘNG LẤY TÊN CỘT TỪ HÀNG 1 CỦA SHEET
    const headers = lines[0].split(',').map(h => h.trim().replace(/['"]+/g, ''));
    const items: RealEstateItem[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      // Dùng Regex để tách cột chính xác kể cả khi ô có chứa dấu phẩy
      const matches = lines[i].match(/(".*?"|[^",]+|(?<=,)(?=,)|(?<=,)$)/g);
      if (!matches) continue;
      const row = matches.map(val => val.trim().replace(/^"|"$/g, '').trim());
      
      const obj: any = {};
      headers.forEach((h, idx) => { obj[h] = row[idx] || ""; });
      
      // ÁNH XẠ DỮ LIỆU ĐỘNG (Dù anh đổi tên cột trong Sheet, code vẫn chạy đúng)
      const item: RealEstateItem = {
        id: parseInt(obj.id) || i,
        tieude: obj.tieude || obj.title || "Chưa có tiêu đề",
        slug: convertToSlug(obj.tieude || obj.title || ""),
        moTa: obj.moTa || obj.description || "",
        gia: obj.gia || "",
        soGia: parseFloat(obj.soGia) || 0,
        dienTich: obj.dienTich || "",
        khuVuc: obj.khuVuc || "Hải Châu",
        khuVucFull: obj.khuVucFull || obj.diaChi || "Đà Nẵng",
        loaiHinh: obj.loaiHinh || "Nhà phố",
        huong: obj.huong || "",
        phongNgu: obj.phongNgu || "",
        phapLy: obj.phapLy || "Sổ hồng",
        tag: obj.tag || "Chính Chủ",
        tagColor: obj.tagColor || "bg-emerald-500",
        anh: obj.anh || obj.image || "",
        anhSoDo: obj.anhSoDo || obj.soDo || "",
        linkMap: obj.linkMap || "",
        videoUrl: obj.videoUrl || "",
        ngayDang: obj.ngayDang || "Tin mới",
        isMatTien: (obj.tag?.toLowerCase().includes("mặt tiền") || obj.isMatTien === "TRUE")
      };
      items.push(item);
    }
    return items;
  } catch (e) { return []; }
}
