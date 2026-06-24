// ============================================================================
// TỆP 1: NÃO BỘ THUẬT TOÁN & TIỆN ÍCH (src/lib/dangTinHelpers.ts)
// ============================================================================

// 1. THUẬT TOÁN GỌT GIÁ TIỀN (5,900 tỷ -> 5,9 tỷ | 4.000 tỷ -> 4 tỷ)
export function formatCleanPrice(raw: string): string {
  if (!raw) return '';
  let str = raw.trim().toLowerCase();

  // Kịch bản A: Nhập dạng "5,900 tỷ", "5.900 tỷ", "5,900"
  const floatMatch = str.match(/(\d+)[.,](\d+)\s*(tỷ|ty|triệu|trieu)?/i);
  if (floatMatch) {
    const intPart = floatMatch[1];
    // Xóa sạch toàn bộ các số 0 nằm tận cùng bên phải của phần thập phân
    const decPart = floatMatch[2].replace(/0+$/, ''); 
    const unit = floatMatch[3] ? ` ${floatMatch[3]}` : (str.includes('triệu') ? ' triệu' : ' tỷ');

    return decPart ? `${intPart},${decPart}${unit}` : `${intPart}${unit}`;
  }

  // Kịch bản B: Nhập dạng "5 tỷ 900", "5 tỷ 9"
  const splitMatch = str.match(/(\d+)\s*tỷ\s*(\d+)/i);
  if (splitMatch) {
    const intPart = splitMatch[1];
    const decPart = splitMatch[2].replace(/0+$/, '');
    return decPart ? `${intPart},${decPart} tỷ` : `${intPart} tỷ`;
  }

  return raw;
}

// 2. TẠO LINK GOOGLE MAPS TỰ ĐỘNG
export function generateMapLink(soNha: string, duong: string, phuong: string, currentLink: string): string {
  if (currentLink && !currentLink.includes('maps.google.com/?q=')) {
    return currentLink;
  }
  if (duong && phuong) {
    const query = soNha ? `${soNha} ${duong}, ${phuong}, Đà Nẵng` : `${duong}, ${phuong}, Đà Nẵng`;
    return `https://maps.google.com/?q=$${encodeURIComponent(query)}`;
  }
  return currentLink;
}

// 3. SIÊU THUẬT TOÁN QUÉT MÔ TẢ TỰ ĐỘNG (Đã gỡ bỏ Iframe Map)
export function autoParseRealEstateText(text: string, currentMapLink: string) {
  let parsed = {
    moTa: text,
    gia: '',
    dienTich: '',
    khuVuc: '',
    duong: '',
    soNha: '',
    isMatTien: false,
    huong: '',
    linkMap: currentMapLink
  };

  // Quét & Gọt giá
  const priceMatch2 = text.match(/(\d+)\s*tỷ\s*(\d+)/i);
  const priceMatch1 = text.match(/(\d+)(?:\s*[.,]\s*([\dxX]+))?\s*(tỷ|triệu)/i); 
  
  if (priceMatch2) {
    parsed.gia = formatCleanPrice(`${priceMatch2[1]},${priceMatch2[2]} tỷ`);
  } else if (priceMatch1) {
    let num1 = priceMatch1[1];
    let num2 = priceMatch1[2];
    let unit = priceMatch1[3].toLowerCase();
    let rawPrice = num2 ? `${num1},${num2} ${unit}` : `${num1} ${unit}`;
    parsed.gia = formatCleanPrice(rawPrice);
  }

  // Quét diện tích
  const areaMatch = text.match(/(\d+)(?:\s*[.,]\s*(\d+))?\s*(?:m2|m²)/i);
  if (areaMatch) {
    let num1 = areaMatch[1];
    let num2 = areaMatch[2];
    parsed.dienTich = num2 ? `${num1},${num2} m2` : `${num1} m2`;
  }

  // Quét Phường
  const wards = ['Hải Châu', 'Hòa Cường', 'Thanh Khê', 'An Khê', 'An Hải', 'Sơn Trà', 'Ngũ Hành Sơn', 'Hòa Khánh', 'Hải Vân', 'Liên Chiểu', 'Cẩm Lệ', 'Hòa Xuân', 'Hòa Vang', 'Bà Nà', 'Hòa Tiến', 'Hòa Phước', 'Hòa Bắc', 'Hòa Liên', 'Hòa Ninh'];
  const normalizeVN = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const normalizedText = normalizeVN(text);

  const foundWard = wards.find(w => normalizedText.includes(normalizeVN(w)));
  if (foundWard) parsed.khuVuc = foundWard;

  // Quét Tên đường & Số nhà (Siêu phanh ranh giới)
  const streetMatch = text.match(/(k|kiệt|mt|mặt tiền|đường)\s*(\d+[\d\/a-zA-Z]*)?\s+([^,\.\;\:\(\)\[\]\{\}\+\*\_\-\–\—\n]+?)(?=\s+phường|\s+quận|[,;\:\.\(\)\[\]\{\}\+\*\_\-\–\—]|\n|$)/i);
  if (streetMatch) {
    const prefix = streetMatch[1].toLowerCase(); 
    const num = streetMatch[2]; 
    const rawStreet = streetMatch[3].trim(); 

    parsed.duong = rawStreet
      .replace(/^(?:đường|duong)\s+/i, '')
      .replace(/^[,;\:\.\*\-\–\—\s]+/, '') 
      .split(/[,;\:\.\(\)\[\]\{\}\+\*\_\-\–\—\|]/)[0]
      .trim();

    parsed.soNha = num ? num.trim() : '';
    if (prefix === 'mt' || prefix === 'mặt tiền') parsed.isMatTien = true; 
  }

  // Quét Hướng
  const directions = ['Đông Nam', 'Đông Bắc', 'Tây Nam', 'Tây Bắc', 'Đông', 'Tây', 'Nam', 'Bắc'];
  const cleanTextForDir = text.replace(/[*_()]/g, ' '); 
  const directionMatch = cleanTextForDir.match(/hướng.*?(đông\s*nam|đông\s*bắc|tây\s*nam|tây\s*bắc|đông|tây|nam|bắc)/i);
  if (directionMatch) {
    const cleanMatchedDir = directionMatch[1].replace(/\s+/g, ' ').trim().toLowerCase();
    const dir = directions.find(d => d.toLowerCase() === cleanMatchedDir);
    if (dir) parsed.huong = dir;
  }

  parsed.linkMap = generateMapLink(parsed.soNha, parsed.duong, parsed.khuVuc, currentMapLink);
  return parsed;
}

// 4. HÀM ĐẨY ẢNH CLOUDINARY DÙNG CHUNG (Tối ưu hóa bộ nhớ)
export async function uploadImagesCloudinary({
  files,
  cloudName,
  uploadPreset,
  onStart,
  onProgress,
  onSuccess,
  onError
}: {
  files: FileList | null;
  cloudName: string;
  uploadPreset: string;
  onStart: () => void;
  onProgress: (progress: number) => void;
  onSuccess: (secureUrls: string[], previewUrls: string[]) => void;
  onError: (errMsg: string) => void;
}) {
  if (!files || files.length === 0) return;

  onStart();
  const uploadedUrls: string[] = [];
  const previewUrls: string[] = [];
  const total = files.length;

  try {
    for (let i = 0; i < total; i++) {
      const file = files[i];
      previewUrls.push(URL.createObjectURL(file));

      const data = new FormData();
      data.append('file', file);
      data.append('upload_preset', uploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: data
      });

      if (res.ok) {
        const fileData = await res.json();
        uploadedUrls.push(fileData.secure_url);
      }
      onProgress(Math.round(((i + 1) / total) * 100));
    }
    onSuccess(uploadedUrls, previewUrls);
  } catch (err) {
    onError('❌ Gặp lỗi mạng khi tải ảnh lên Cloudinary.');
  }
}
