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

export function formatYoutubeEmbed(url: string): string {
  if (!url) return "";
  let videoId = "";
  if (url.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1]?.split(/[?#]/)[0];
  } else if (url.includes("youtube.com/watch")) {
    videoId = url.split("v=")[1]?.split(/[&?#]/)[0];
  } else if (url.includes("youtube.com/shorts/")) {
    videoId = url.split("shorts/")[1]?.split(/[?#]/)[0];
  } else if (url.includes("youtube.com/embed/")) {
    return url;
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
}

export async function getBdsData(): Promise<RealEstateItem[]> {
  const sheetUrl = "https://docs.google.com/spreadsheets/d/1-LupBV6uNuUitz4vF6pFv6MupuVDMujafqhjQBNNPTA/export?format=csv";
  try {
    const response = await fetch(sheetUrl, { next: { revalidate: 60 } });
    if (!response.ok) throw new Error("Fetch failed");
    const csvText = await response.text();
    const lines = csvText.split(/\r?\n/);
    if (lines.length < 2) return [];
    
    // Tách lấy dòng tiêu đề và làm sạch khoảng trắng, ký tự ẩn
    const headers = lines[0].split(',').map(h => h.trim().replace(/['"]+/g, ''));
    const items: RealEstateItem[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Thuật toán tách mảng dữ liệu giữ an toàn cho dấu phẩy nội bộ
      let matches = line.match(/(".*?"|[^",]+|(?<=,)(?=,)|(?<=,)$)/g);
      if (!matches) continue;
      const currentLine = matches.map(val => val.trim().replace(/^"|"$/g, '').trim());
      
      const obj: any = {};
      
      // CƠ CHẾ DYNAMIC KEY MAPPING: Map chính xác thuộc tính theo từ khóa cột trên Sheet của anh Huy
      headers.forEach((header, index) => {
        let value = currentLine[index] || "";
        obj[header] = value;
      });
      
      // Kiểm tra ép kiểu các trường dữ liệu đặc thù
      const finalObj: any = {
        id: parseInt(obj.id) || i,
        tieude: obj.tieude || obj.title || "",
        moTa: obj.moTa || obj.description || "",
        gia: obj.gia || "",
        soGia: parseFloat(obj.soGia) || 0,
        dienTich: obj.dienTich || "",
        khuVuc: obj.khuVuc || "",
        khuVucFull: obj.khuVucFull || "",
        loaiHinh: obj.loaiHinh || "",
        huong: obj.huong || "",
        phongNgu: obj.phongNgu || "",
        phapLy: obj.phapLy || "",
        tag: obj.tag || "",
        tagColor: obj.tagColor || "",
        anh: obj.anh || "",
        anhSoDo: obj.anhSoDo || "",
        linkMap: obj.linkMap || "",
        videoUrl: formatYoutubeEmbed(obj.videoUrl || ""),
        ngayDang: obj.ngayDang || ""
      };
      
      if (finalObj.tieude) {
        finalObj.slug = `${convertToSlug(finalObj.tieude)}-${finalObj.id}`;
        finalObj.isMatTien = finalObj.tag?.toLowerCase().includes("mặt tiền") || finalObj.tieude?.toLowerCase().includes("mặt tiền");
        items.push(finalObj as RealEstateItem);
      }
    }
    return items;
  } catch (error) {
    console.error("Lỗi getBdsData:", error);
    return [];
  }
}
