export const removeAccents = (str: string) => {
  if (!str) return "";
  return str.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").trim();
};

export const parseDateInfo = (dateStr: string) => {
  if (!dateStr) return { fullDate: "Hôm nay", time: "", relative: "hôm nay" };
  try {
    const [datePart, timePart = ""] = dateStr.trim().split(/\s+/);
    const parts = datePart.split(/[-/]/);
    if (parts.length < 3) return { fullDate: dateStr, time: timePart, relative: "" };
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const yearRaw = parts[2];
    const year = yearRaw.length === 2 ? 2000 + parseInt(yearRaw) : parseInt(yearRaw, 10);
    const shortYear = year.toString().slice(-2);
    const formattedDate = `${day < 10 ? '0'+day : day}/${month < 9 ? '0'+(month+1) : month+1}/${shortYear}`;
    const diffDays = Math.floor((new Date().setHours(0, 0, 0, 0) - new Date(year, month, day).setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24));
    let relative = "hôm nay";
    if (diffDays === 1) relative = "hôm qua";
    else if (diffDays > 1) relative = `${diffDays} ngày trước`;
    return { fullDate: formattedDate, time: timePart ? timePart.split(":").slice(0, 2).join(":") : "", relative };
  } catch(e) {
    return { fullDate: dateStr, time: "", relative: "" };
  }
};

export const parsePropertyTags = (item: any) => {
  const rawTitleTag = `${item.tieude || ""} ${item.tag || ""} ${item.loaiHinh || item.phân_loại || ""}`.toLowerCase();
  const fullText = ` ${removeAccents(rawTitleTag).replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ')} `;
  const moTaText = ` ${removeAccents(`${item.mota || item.moTa || ""}`).replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ')} `;
  const isChinhChu = fullText.includes(" chinh chu ") || moTaText.includes(" chinh chu ");
  const isSapHam = fullText.includes(" sap ham ") || fullText.includes(" gia re ") || moTaText.includes(" sap ham ");
  let isChoThue = fullText.includes(" cho thue ");
  let isCanHo = fullText.includes(" can ho ") || fullText.includes(" chung cu ") || fullText.includes(" apartment ");
  const isMatTienFake = fullText.includes(" cach mat tien ") || fullText.includes(" sau lung ") || fullText.includes(" gan mat tien ") || fullText.includes(" cach mt ") || fullText.includes(" gan mt ");
  const hasDat = rawTitleTag.includes("đất") || fullText.includes(" dat ") || fullText.includes(" lo dat ") || fullText.includes(" ban dat ");
  const isMatTienReal = (fullText.includes(" mat tien ") || fullText.includes(" mt ")) && !isMatTienFake;

  let isDatMatTien = false, isDatKiet = false, isDatNen = false, isNhaMatTien = false, isNhaKiet = false;
  if (hasDat) {
    isCanHo = false; isChoThue = false; isNhaMatTien = false; isNhaKiet = false;
    const hasNenStrict = rawTitleTag.includes("nền") || fullText.includes(" dat nen ") || fullText.includes(" lo nen ");
    if (isMatTienReal) isDatMatTien = true;
    else if (hasNenStrict) isDatNen = true;
    else isDatKiet = true;
  } else if (!isCanHo) {
    if (isMatTienReal) isNhaMatTien = true;
    else isNhaKiet = true;
  }
  let primaryTab = "Nhà phố"; 
  if (hasDat) primaryTab = "Đất";
  else if (isCanHo) primaryTab = "Căn hộ";
  else if (isChoThue) primaryTab = "Cho thuê";

  return { isChinhChu, isSapHam, isChoThue, isNhaKiet, isNhaMatTien, isDatKiet, isDatMatTien, isDatNen, isCanHo, primaryTab };
};

export const countImages = (item: any) => {
  if (item.soLuongAnh) return item.soLuongAnh; 
  if (typeof item.anh === 'string') {
    return Math.max(item.anh.split(/[\n,]/).filter((link: string) => link.trim() !== '').length, 1);
  }
  return Array.isArray(item.anh) ? item.anh.length : 1;
};

export const calculateGiaM2 = (item: any) => {
  if (item.giaM2) return item.giaM2; 
  try {
    let giaTriTrieu = 0;
    if (item.soGia && !isNaN(Number(item.soGia))) {
      giaTriTrieu = Number(item.soGia) < 1000 ? Number(item.soGia) * 1000 : Number(item.soGia);
    } else {
      const giaStr = (item.gia || "").toLowerCase().replace(/x/g, '0');
      const tyMatch = giaStr.match(/([\d,.]+)\s*(?:tỷ|ty)\s*([\d]+)?/);
      if (tyMatch) {
        const ty = parseFloat(tyMatch[1].replace(/,/g, '.'));
        const trieuStr = tyMatch[2] || "";
        const trieu = trieuStr.length === 1 ? parseInt(trieuStr) * 100 : (trieuStr.length === 2 ? parseInt(trieuStr) * 10 : parseInt(trieuStr.substring(0, 3) || "0"));
        giaTriTrieu = ty * 1000 + trieu;
      } else {
        const trieuMatch = giaStr.match(/([\d,.]+)\s*(?:triệu|trieu)/);
        if (trieuMatch) giaTriTrieu = parseFloat(trieuMatch[1].replace(/,/g, '.'));
      }
    }
    const dtMatch = (item.dienTich || "").match(/([\d,.]+)/); 
    const dtNum = dtMatch ? parseFloat(dtMatch[1].replace(/[.,]+$/, '').replace(/,/g, '.')) : 0;
    if (giaTriTrieu > 0 && dtNum > 0) return `${parseFloat((giaTriTrieu / dtNum).toFixed(2)).toLocaleString('vi-VN')} tr/m²`;
  } catch(e) {}
  return null;
};

export const extractPriceInBillion = (giaRaw: any, soGiaRaw: any) => {
  if (soGiaRaw && !isNaN(Number(soGiaRaw))) {
    const so = Number(soGiaRaw);
    return so >= 100 ? so / 1000 : so; 
  }
  if (!giaRaw || typeof giaRaw !== 'string') return 0;
  let giaStr = giaRaw.toLowerCase().replace(/x/g, '0').replace(/,/g, '.'); 
  const tyMatch = giaStr.match(/([\d.]+)\s*(?:tỷ|ty)\s*([\d]+)?/);
  if (tyMatch) {
    let ty = parseFloat(tyMatch[1]);
    let trieuStr = tyMatch[2];
    if (trieuStr) {
       let trieuNum = trieuStr.length === 1 ? parseInt(trieuStr) * 100 : (trieuStr.length === 2 ? parseInt(trieuStr) * 10 : parseInt(trieuStr.substring(0,3)));
       ty += trieuNum / 1000;
    }
    return ty;
  }
  const trieuMatch = giaStr.match(/([\d.]+)\s*(?:triệu|trieu)/);
  if (trieuMatch) return parseFloat(trieuMatch[1]) / 1000;
  const numMatch = giaStr.match(/([\d.]+)/);
  if (numMatch) return parseFloat(numMatch[1]) >= 100 ? parseFloat(numMatch[1]) / 1000 : parseFloat(numMatch[1]);
  return 0;
};

export const removeHtmlAndAccents = (item: any) => {
  const allStringValues = Object.values(item).filter(val => typeof val === 'string').join(" ");
  return removeAccents(allStringValues.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/[\u200B-\u200D\uFEFF\n\r]/g, ' ')).toLowerCase();
};

export const extractRooms = (item: any) => {
  let pn = item.phongNgu || item.phongngu || item.pn || item.soPhongNgu || null;
  let wc = item.wc || item.phongTam || item.phongtam || item.soWc || item.soWC || null;
  if (!pn || !wc) {
    const fullText = removeHtmlAndAccents(item);
    if (!pn) {
      const match1 = fullText.match(/(\d+)\s*(?:pn|phong ngu|p ngu|ngu|p\.ngu|phong)(?![a-z])/i);
      const match2 = fullText.match(/\b(?:pn|phong ngu|p ngu|ngu|p\.ngu|phong)[\s:-]*(\d+)/i);
      pn = match1 && parseInt(match1[1]) > 0 ? match1[1] : (match2 && parseInt(match2[1]) > 0 ? match2[1] : null);
    }
    if (!wc) {
      const match1 = fullText.match(/(\d+)\s*(?:wc|phong tam|nha ve sinh|phong ve sinh|toilet|nvs)(?![a-z])/i);
      const match2 = fullText.match(/\b(?:wc|phong tam|nha ve sinh|phong ve sinh|toilet|nvs)[\s:-]*(\d+)/i);
      wc = match1 && parseInt(match1[1]) > 0 ? match1[1] : (match2 && parseInt(match2[1]) > 0 ? match2[1] : null);
    }
  }
  return { pn, wc };
};

export const generatePagination = (currentPage: number, totalPages: number) => {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
  if (currentPage <= 3) return [1, 2, 3, 4, '...', totalPages];
  if (currentPage >= totalPages - 2) return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
};
