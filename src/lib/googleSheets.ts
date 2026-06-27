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
  toaDo: string;
  videoUrl: string;
  ngayDang: string;
  isMatTien: boolean;
}

export function convertToSlug(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// 🚀 CHỐT CHẶN BẬC THẦY: Khai báo bộ đệm RAM Singleton toàn cục (Memory Cache)
type CacheStore<T> = { data: T | null; lastFetched: number };
const GLOBAL_RAM_CACHE: {
  bds: CacheStore<RealEstateItem[]>;
  blog: CacheStore<any[]>;
} = {
  bds: { data: null, lastFetched: 0 },
  blog: { data: null, lastFetched: 0 }
};
const CACHE_TTL_MS = 60 * 1000; // Khóa chết 60 giây không nạp lại Sheet

// ⛳ HÀM 1: LẤY DỮ LIỆU NHÀ ĐẤT SIÊU TỐC
export async function getBdsData(): Promise<RealEstateItem[]> {
  const now = Date.now();
  // Nếu RAM có sẵn dữ liệu và chưa quá 60s -> Trả về tức thì 0ms
  if (GLOBAL_RAM_CACHE.bds.data && (now - GLOBAL_RAM_CACHE.bds.lastFetched < CACHE_TTL_MS)) {
    return GLOBAL_RAM_CACHE.bds.data;
  }

  const spreadsheetId = "1-LupBV6uNuUitz4vF6pFv6MupuVDMujafqhjQBNNPTA";
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=BDS`;
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
        if (char === '\r' && nextChar === '\n') { i++; }
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
        toaDo: obj.toado || obj.toa_do || "",
        videoUrl: obj.videourl || "",
        ngayDang: obj.ngaydang || "Tin mới",
        isMatTien: ((obj.tag?.toLowerCase().includes("mặt tiền")) || obj.ismattien === "TRUE")
      };
      
      if (item.slug) items.push(item);
    }

    // Ghi đè vào RAM Cache
    GLOBAL_RAM_CACHE.bds = { data: items, lastFetched: now };
    return items;
  } catch (e) { 
    console.error("Lỗi parse Google Sheet CSV BDS:", e);
    return GLOBAL_RAM_CACHE.bds.data || []; 
  }
}

// 📰 HÀM 2: LẤY DỮ LIỆU TAB BLOG (Đã tích hợp RAM Cache)
export async function getBlogData(): Promise<any[]> {
  const now = Date.now();
  if (GLOBAL_RAM_CACHE.blog.data && (now - GLOBAL_RAM_CACHE.blog.lastFetched < CACHE_TTL_MS)) {
    return GLOBAL_RAM_CACHE.blog.data;
  }

  const spreadsheetId = "1-LupBV6uNuUitz4vF6pFv6MupuVDMujafqhjQBNNPTA";
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=Blog`;

  try {
    const response = await fetch(url, { next: { revalidate: 60 } });
    if (!response.ok) return [];
    const csvText = await response.text();

    if (csvText.trim().startsWith("<!DOCTYPE") || csvText.trim().startsWith("<html")) return [];
    
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < csvText.length; i++) {
      const char = csvText[i];
      const nextChar = csvText[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') { currentField += '"'; i++; } 
        else { inQuotes = !inQuotes; }
      } else if (char === ',' && !inQuotes) {
        currentRow.push(currentField.trim()); currentField = '';
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') i++;
        currentRow.push(currentField.trim());
        if (currentRow.length > 0 && currentRow.some(field => field !== '')) rows.push(currentRow);
        currentRow = []; currentField = '';
      } else { currentField += char; }
    }
    
    if (currentField || currentRow.length > 0) {
      currentRow.push(currentField.trim());
      if (currentRow.length > 0 && currentRow.some(field => field !== '')) rows.push(currentRow);
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

      const rawTitle = obj.title || obj.tieude || "";
      const safeSlug = obj.slug ? convertToSlug(obj.slug) : convertToSlug(rawTitle);
      const finalItem = {
        slug: safeSlug,
        title: rawTitle || "Bài viết chưa có tiêu đề",
        excerpt: obj.excerpt || obj.mota || obj.mo_ta || "",
        image: obj.image || obj.anh || "",
        content: obj.content || obj.noidung || obj.noi_dung || "",
        date: obj.date || obj.ngay || obj.ngaydang || '24/06/2026'
      };

      if (finalItem.title !== "" && finalItem.slug !== "") blogItems.push(finalItem);
    }

    GLOBAL_RAM_CACHE.blog = { data: blogItems, lastFetched: now };
    return blogItems;
  } catch (error) {
    return GLOBAL_RAM_CACHE.blog.data || [];
  }
}
