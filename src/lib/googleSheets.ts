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
    if (!response.ok) throw new Error("Không thể kết nối dữ liệu Google Sheet");
    const csvText = await response.text();
    
    // Tách dòng phòng thủ ký tự xuống dòng chèn trong ô mô tả
    const lines = csvText.split(/\r?\n/);
    if (lines.length < 2) return [];
    
    // Đọc chính xác hàng tiêu đề 1 trên Google Sheet
    const headers = lines[0].split(',').map(h => h.trim().replace(/['"]+/g, ''));
    const items: RealEstateItem[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // THUẬT TOÁN ĐỈNH CAO: Tách ô dựa trên cặp ngoặc kép bọc chuỗi nội dung để bảo vệ dấu phẩy
      let matches = line.match(/(".*?"|[^",]+|(?<=,)(?=,)|(?<=,)$)/g);
      if (!matches) continue;
      const currentLine = matches.map(val => val.trim().replace(/^"|"$/g, '').trim());
      
      const obj: any = {};
      headers.forEach((header, index) => {
        if (header) {
          obj[header] = currentLine[index] || "";
        }
      });
      
      const tieudeChuan = obj.tieude || obj.title || "";
      const moTaChuan = obj.moTa || obj.description || "";
      
      if (tieudeChuan) {
        const itemObj: RealEstateItem = {
          id: parseInt(obj.id) || i,
          tieude: tieudeChuan,
          slug: "",
          moTa: moTaChuan,
          gia: obj.gia || "",
          soGia: parseFloat(obj.soGia) || 0,
          dienTich: obj.dienTich || "",
          khuVuc: obj.khuVuc || "Hải Châu",
          khuVucFull: obj.khuVucFull || "Đà Nẵng",
          loaiHinh: obj.loaiHinh || "Nhà phố",
          huong: obj.huong || "",
          phongNgu: obj.phongNgu || "",
          phapLy: obj.phapLy || "Sổ hồng riêng",
          tag: obj.tag || "",
          tagColor: obj.tagColor || "bg-slate-900",
          anh: obj.anh || "",
          anhSoDo: obj.anhSoDo || "",
          linkMap: obj.linkMap || "",
          videoUrl: formatYoutubeEmbed(obj.videoUrl || ""),
          ngayDang: obj.ngayDang || "Tin mới",
          isMatTien: false
        };
        
        itemObj.slug = `${convertToSlug(itemObj.tieude)}-${itemObj.id}`;
        itemObj.isMatTien = itemObj.tag?.toLowerCase().includes("mặt tiền") || itemObj.tieude?.toLowerCase().includes("mặt tiền");
        items.push(itemObj);
      }
    }
    return items;
  } catch (error) {
    console.error("Lỗi đồng bộ hóa dữ liệu Google Sheet:", error);
    return [];
  }
}
