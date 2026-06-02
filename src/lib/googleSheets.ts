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

// Helper tạo slug tự động từ tiếng Việt có dấu tốt cho SEO
export function convertToSlug(text: string): string {
  let slug = text.toLowerCase();
  slug = slug.replace(/á|à|ả|ã|ạ|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a');
  slug = slug.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e');
  slug = slug.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i');
  slug = slug.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o');
  slug = slug.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u');
  slug = slug.replace(/ý|ỳ|ỷ|ỹ|ị/gi, 'y');
  slug = slug.replace(/đ/gi, 'db');
  slug = slug.replace(/\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\_|\/|\\/gi, '');
  slug = slug.replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
  return slug;
}

export async function getBdsData(): Promise<RealEstateItem[]> {
  const sheetUrl = "https://docs.google.com/spreadsheets/d/1-LupBV6uNuUitz4vF6pFv6MupuVDMujafqhjQBNNPTA/export?format=csv";
  
  try {
    // Tích hợp Incremental Static Regeneration (ISR) cache làm mới sau mỗi 60 giây
    const response = await fetch(sheetUrl, { next: { revalidate: 60 } });
    if (!response.ok) throw new Error("Không thể kết nối danh sách dữ liệu Google Sheet");
    const csvText = await response.text();
    
    const lines = csvText.split(/\r?\n/);
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/['"]+/g, ''));
    const items: RealEstateItem[] = [];
    
    // Thuật toán bóc tách dữ liệu CSV nâng cao bằng Regex, giữ an toàn dấu phẩy (,) trong text
    const csvRegex = /(".*?"|[^",\s]+)(?=\s*,|\s*$)/g;
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      let matches = line.match(/(".*?"|[^",]+|(?<=,)(?=,)|(?<=,)$)/g);
      if (!matches) continue;
      
      const currentLine = matches.map(val => val.trim().replace(/^"|"$/g, '').trim());
      
      const obj: any = {};
      headers.forEach((header, index) => {
        let value = currentLine[index] || "";
        if (header === "id") {
          obj[header] = parseInt(value) || i;
        } else if (header === "soGia") {
          obj[header] = parseFloat(value) || 0;
        } else {
          obj[header] = value;
        }
      });
      
      if (obj.tieude) {
        obj.slug = `${convertToSlug(obj.tieude)}-${obj.id}`;
        obj.isMatTien = obj.tag?.toLowerCase().includes("mặt tiền") || obj.tieude?.toLowerCase().includes("mặt tiền");
        items.push(obj as RealEstateItem);
      }
    }
    
    return items;
  } catch (error) {
    console.error("Lỗi getBdsData:", error);
    return [];
  }
}
