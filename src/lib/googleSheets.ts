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
  let slug = text.toLowerCase();
  slug = slug.replace(/á|à|ả|ã|ạ|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a');
  slug = slug.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e');
  slug = slug.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i');
  slug = slug.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o');
  slug = slug.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u');
  slug = slug.replace(/ý|ỳ|ỷ|ỹ|ị/gi, 'y');
  slug = slug.replace(/đ/gi, 'd');
  return slug.replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
}

export async function getBdsData(): Promise<RealEstateItem[]> {
  const sheetUrl = "https://docs.google.com/spreadsheets/d/1-LupBV6uNuUitz4vF6pFv6MupuVDMujafqhjQBNNPTA/export?format=csv";
  try {
    const response = await fetch(sheetUrl, { next: { revalidate: 60 } });
    if (!response.ok) throw new Error("Fetch failed");
    const csvText = await response.text();
    
    // Tách dòng an toàn cho các ô có chứa xuống dòng
    const lines = [];
    let insideQuote = false;
    let currentLine = "";
    for (let char of csvText) {
      if (char === '"') insideQuote = !insideQuote;
      if ((char === '\n' || char === '\r') && !insideQuote) {
        if (currentLine.trim()) lines.push(currentLine);
        currentLine = "";
      } else {
        currentLine += char;
      }
    }
    if (currentLine.trim()) lines.push(currentLine);

    const headers = lines[0].split(',').map(h => h.trim().replace(/['"]+/g, ''));
    const items: RealEstateItem[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      // Phân tách cột an toàn bằng Regex
      let matches = lines[i].match(/(".*?"|[^",]+|(?<=,)(?=,)|(?<=,)$)/g);
      if (!matches) continue;
      const row = matches.map(val => val.trim().replace(/^"|"$/g, '').trim());
      
      const obj: any = {};
      headers.forEach((h, idx) => { obj[h] = row[idx] || ""; });
      
      if (obj.tieude) {
        items.push({
          id: parseInt(obj.id) || i,
          tieude: obj.tieude,
          slug: convertToSlug(obj.tieude),
          moTa: obj.moTa || "",
          gia: obj.gia || "",
          soGia: parseFloat(obj.soGia) || 0,
          dienTich: obj.dienTich || "",
          khuVuc: obj.khuVuc || "Hải Châu",
          khuVucFull: obj.khuVucFull || "Đà Nẵng",
          loaiHinh: obj.loaiHinh || "Nhà phố",
          huong: obj.huong || "",
          phongNgu: obj.phongNgu || "",
          phapLy: obj.phapLy || "Sổ hồng",
          tag: obj.tag || "Chính Chủ",
          tagColor: obj.tagColor || "bg-emerald-500",
          anh: obj.anh || "",
          anhSoDo: obj.anhSoDo || "",
          linkMap: obj.linkMap || "",
          videoUrl: obj.videoUrl || "",
          ngayDang: obj.ngayDang || "Tin mới",
          isMatTien: obj.tag?.includes("Mặt tiền") || false
        });
      }
    }
    return items;
  } catch (error) {
    console.error("Lỗi getBdsData:", error);
    return [];
  }
}
