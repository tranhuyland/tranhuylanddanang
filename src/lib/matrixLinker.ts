// src/lib/matrixLinker.ts

interface MatrixRule {
  keywords: string[]; // Các từ khóa/từ đồng nghĩa muốn bẫy
  targetUrl: string;  // Đích đến trỏ vào Dynamic Route của bộ lọc
}

// 🗺️ TỪ ĐIỂN MA TRẬN PHƯỜNG/XÁ ĐÀ NẴNG (Chuẩn 100% rổ hàng Trần Huy Land)
const MATRIX_RULES: MatrixRule[] = [
  // ==========================================
  // 1. KHU VỰC TRUNG TÂM (HẢI CHÂU - THANH KHÊ)
  // ==========================================
  {
    keywords: ['Hải Châu', 'phường Hải Châu', 'quận Hải Châu', 'trung tâm Hải Châu', 'Hải Châu 1', 'Hải Châu 2', 'Thạch Thang', 'Thuận Phước', 'Bạch Đằng'],
    targetUrl: '/vi-tri/hai-chau'
  },
  {
    keywords: ['Hòa Cường', 'Hòa Cường Bắc', 'Hòa Cường Nam', 'phường Hòa Cường', 'khu Hòa Cường', 'chợ Đầu Mối', 'Núi Thành'],
    targetUrl: '/vi-tri/hoa-cuong'
  },
  {
    keywords: ['Thanh Khê', 'quận Thanh Khê', 'phường Thanh Khê', 'Thanh Khê Tây', 'Thanh Khê Đông', 'Xuân Hà', 'Tam Thuận', 'Vĩnh Trung', 'Tân Chính'],
    targetUrl: '/vi-tri/thanh-khe'
  },
  {
    keywords: ['An Khê', 'phường An Khê', 'khu An Khê', 'ngã tư An Khê', 'khu vực An Khê'],
    targetUrl: '/vi-tri/an-khe'
  },

  // ==========================================
  // 2. KHU VỰC VEN BIỂN (SƠN TRÀ - NGŨ HÀNH SƠN)
  // ==========================================
  {
    keywords: ['Sơn Trà', 'quận Sơn Trà', 'phường Sơn Trà', 'bán đảo Sơn Trà', 'Mân Thái', 'Thọ Quang', 'Nại Hiên Đông', 'Phạm Văn Đồng'],
    targetUrl: '/vi-tri/son-tra'
  },
  {
    keywords: ['An Hải', 'An Hải Bắc', 'An Hải Tây', 'An Hải Đông', 'phường An Hải', 'khu An Hải'],
    targetUrl: '/vi-tri/an-hai'
  },
  {
    keywords: ['Ngũ Hành Sơn', 'quận Ngũ Hành Sơn', 'Khuê Mỹ', 'Mỹ An', 'Hòa Hải', 'Hòa Quý', 'Non Nước', 'biển Mỹ Khê'],
    targetUrl: '/vi-tri/ngu-hanh-son'
  },

  // ==========================================
  // 3. KHU VỰC PHÍA TÂY & TÂY BẮC (LIÊN CHIỂU)
  // ==========================================
  {
    keywords: ['Liên Chiểu', 'quận Liên Chiểu', 'Hòa Minh', 'Hòa Hiệp Nam', 'Hòa Hiệp Bắc', 'bến xe trung tâm'],
    targetUrl: '/vi-tri/lien-chieu'
  },
  {
    keywords: ['Hòa Khánh', 'Hòa Khánh Bắc', 'Hòa Khánh Nam', 'phường Hòa Khánh', 'chợ Hòa Khánh', 'Khu công nghiệp Hòa Khánh'],
    targetUrl: '/vi-tri/hoa-khanh'
  },
  {
    keywords: ['Hải Vân', 'phường Hải Vân', 'chân đèo Hải Vân', 'Suối Lương', 'hầm Hải Vân'],
    targetUrl: '/vi-tri/hai-van'
  },

  // ==========================================
  // 4. KHU VỰC PHÍA NAM (CẨM LỆ - HÒA XUÂN)
  // ==========================================
  {
    keywords: ['Cẩm Lệ', 'quận Cẩm Lệ', 'Khuê Trung', 'Hòa Thọ Đông', 'Hòa Thọ Tây', 'Hòa Phát', 'Hòa An', 'Cách Mạng Tháng 8'],
    targetUrl: '/vi-tri/cam-le'
  },
  {
    keywords: ['Hòa Xuân', 'phường Hòa Xuân', 'Đảo VIP Hòa Xuân', 'Khu đô thị Hòa Xuân', 'Nam Hòa Xuân', 'cầu Hòa Xuân', 'KĐT Hòa Xuân'],
    targetUrl: '/vi-tri/hoa-xuan'
  },

  // ==========================================
  // 5. CÁC XÃ VÙNG VEN & ĐIỂM NÓNG (HÒA VANG)
  // ==========================================
  {
    keywords: ['Hòa Vang', 'huyện Hòa Vang', 'Hòa Phong', 'Hòa Khương', 'Hòa Nhơn', 'trung tâm Hòa Vang'],
    targetUrl: '/vi-tri/hoa-vang'
  },
  {
    keywords: ['Hòa Tiến', 'xã Hòa Tiến', 'Lệ Trạch', 'chợ Lệ Trạch', 'khu vực Hòa Tiến'],
    targetUrl: '/vi-tri/hoa-tien'
  },
  {
    keywords: ['Hòa Phước', 'xã Hòa Phước', 'Miếu Bông', 'ngã ba Miếu Bông', 'khu vực Hòa Phước'],
    targetUrl: '/vi-tri/hoa-phuoc'
  },
  {
    keywords: ['Hòa Bắc', 'xã Hòa Bắc', 'Phò Nam', 'thung lũng Hòa Bắc', 'Lộc Mỹ', 'khu du lịch Hòa Bắc'],
    targetUrl: '/vi-tri/hoa-bac'
  },
  {
    keywords: ['Hòa Liên', 'xã Hòa Liên', 'Vân Dương', 'Quan Nam', 'Khu công nghệ cao Đà Nẵng'],
    targetUrl: '/vi-tri/hoa-lien'
  },
  {
    keywords: ['Hòa Ninh', 'xã Hòa Ninh', 'An Sơn', 'Khu tái định cư Hòa Ninh'],
    targetUrl: '/vi-tri/hoa-ninh'
  },
  {
    keywords: ['Bà Nà', 'chân núi Bà Nà', 'Bà Nà Hills', 'khu Bà Nà Suối Mơ', 'đường lên Bà Nà'],
    targetUrl: '/vi-tri/ba-na'
  }
];

// 🚀 ĐỘNG CƠ GÀI LINK MA TRẬN THÔNG MINH
export function tuDongGaiLinkMaTran(rawText?: string): string {
  if (!rawText) return '';

  let processedText = rawText;

  // 1. Băm phẳng từ điển & Sắp xếp theo độ dài GIẢM DẦN (Cụm dài như 'Hòa Cường Bắc' phải gài trước cụm 'Hòa Cường')
  const flattenedKeywords: { phrase: string; url: string }[] = [];
  MATRIX_RULES.forEach(rule => {
    rule.keywords.forEach(phrase => {
      flattenedKeywords.push({ phrase: phrase.trim(), url: rule.targetUrl });
    });
  });

  flattenedKeywords.sort((a, b) => b.phrase.length - a.phrase.length);

  // 2. Bộ nhớ đệm: Đảm bảo 1 Target URL chỉ được xuất hiện TỐI ĐA 1 LẦN trong bài
  const ghimTargetDaDung = new Set<string>();

  flattenedKeywords.forEach(({ phrase, url }) => {
    if (ghimTargetDaDung.has(url)) return;

    const safePhrase = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Bùa Regex nhìn trước ngó sau: Cấm gài dính vào link đã bọc ngoặc vuông đằng trước
    const regex = new RegExp(
      `(?<!\\[)(^|[\\s\\.,\\(\\)“‘"'])(${safePhrase})($|[\\s\\.,\\)\\)”’”'])(?!\\])`,
      'i'
    );

    if (regex.test(processedText)) {
      processedText = processedText.replace(regex, `$1[$2](${url})$3`);
      ghimTargetDaDung.add(url);
    }
  });

  return processedText;
}
