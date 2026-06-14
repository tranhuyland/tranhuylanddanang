// ==========================================
// THẺ SẢN PHẨM BĐS - GIAO DIỆN CHUẨN BATDONGSAN.COM.VN
// Đã fix: Tự động hiểu 8,xx tỷ là 8 tỷ để chia Giá/m2 chuẩn xác
// ==========================================
function BdsCard({ item, rank }: { item: any, rank?: number }) {
  const thumbnail = layUrlAnhChuan(item.anh);
  const displayLocation = item.khuVuc || item.diaChi || item.diaChiFull || item.khuVucFull || "Đà Nẵng";
  const displayTime = item.ngayDang || item.ngay || "";

  // 🔥 1. ĐẾM ẢNH TỪ GOOGLE SHEETS
  const soLuongAnhChinhXac = useMemo(() => {
    if (item.soLuongAnh) return item.soLuongAnh; 
    if (typeof item.anh === 'string') {
      const links = item.anh.split(/[\n,]/).filter((link: string) => link.trim() !== '');
      return links.length > 0 ? links.length : 1;
    }
    if (Array.isArray(item.anh)) return item.anh.length;
    return 1;
  }, [item]);

  // 🔥 2. THUẬT TOÁN TOÁN HỌC CHIA GIÁ/M2 CỰC KỲ CHÍNH XÁC (Hỗ trợ 8,xx tỷ)
  const giaM2 = useMemo(() => {
    if (item.giaM2) return item.giaM2; 
    try {
      // Mẹo: Biến toàn bộ ẩn số "x" thành "0" để máy tự tính phần gốc.
      // VD: "8,xx tỷ" -> "8,00 tỷ" (Tương đương 8 tỷ)
      const giaStr = (item.gia || "").toLowerCase().replace(/x/g, '0');
      const dtStr = (item.dienTich || "").toLowerCase();
      let giaTriTrieu = 0;
      
      // Xử lý logic bóc tách số cho Giá bán
      if (giaStr.includes('tỷ') || giaStr.includes('ty')) {
        const match = giaStr.match(/([\d,.]+)\s*(?:tỷ|ty)\s*([\d]+)?/);
        if (match) {
          const ty = parseFloat(match[1].replace(/,/g, '.'));
          let trieu = 0;
          if (match[2]) {
            const trieuStr = match[2];
            // Khách gõ "8 tỷ 5" -> 500 triệu | "8 tỷ 50" -> 500 triệu | "3 tỷ 750" -> 750 triệu
            if (trieuStr.length === 1) trieu = parseInt(trieuStr) * 100;
            else if (trieuStr.length === 2) trieu = parseInt(trieuStr) * 10;
            else trieu = parseInt(trieuStr); 
          }
          giaTriTrieu = ty * 1000 + trieu;
        }
      } else if (giaStr.includes('triệu') || giaStr.includes('trieu')) {
        const match = giaStr.match(/([\d,.]+)/);
        if (match) {
          giaTriTrieu = parseFloat(match[1].replace(/,/g, '.'));
        }
      }
      
      // Xử lý bóc tách số cho Diện tích
      const dtNum = parseFloat(dtStr.replace(/[^0-9,.]/g, '').replace(/,/g, '.'));
      
      // Chia toán học và ép 2 số lẻ thập phân
      if (giaTriTrieu > 0 && dtNum > 0) {
        const calc = giaTriTrieu / dtNum;
        // toFixed(2) lấy 2 số đuôi -> parseFloat xóa số 0 thừa -> toLocaleString đổi dấu chấm sang phẩy chuẩn VN
        const result = parseFloat(calc.toFixed(2)).toLocaleString('vi-VN');
        return `${result} tr/m²`;
      }
    } catch(e) {}
    return null;
  }, [item]);

  // 🔥 3. TÁCH PHÒNG NGỦ VÀ WC
  const cauTrucPhong = useMemo(() => {
    const currentLoaiHinh = item.phân_loại || item.loaiHinh || '';
    if (removeAccents(currentLoaiHinh).includes("dat")) return { pn: null, wc: null }; 
    
    const combinedText = `${item.tieude || ""} ${item.mota || item.moTa || ""}`.toLowerCase();
    const matchPhong = combinedText.match(/(\d+)\s*(pn|phòng ngủ|phong ngu)/i);
    const matchWC = combinedText.match(/(\d+)\s*(wc|phòng tắm|phong tam|nha ve sinh)/i);
    
    return {
      pn: matchPhong ? matchPhong[1] : null,
      wc: matchWC ? matchWC[1] : null
    };
  }, [item]);

  // 🔥 4. NHẬN DIỆN NHÃN QUYỀN LỰC
  const textLower = removeAccents(`${item.tieude || ""} ${item.mota || item.moTa || ""} ${item.tag || ""} ${item.loaiHinh || ""}`);
  const isChinhChu = textLower.includes("chinh chu");
  const isSapHam = textLower.includes("sap ham") || textLower.includes("gia re");
  const strictTextChoThue = removeAccents(`${item.tieude || ""} ${item.tag || ""} ${item.loaiHinh || item.phân_loại || ""}`);
  const isChoThue = strictTextChoThue.includes("cho thue");
  const strictTextViTri = removeAccents(`${item.tieude || ""} ${item.tag || ""} ${item.loaiHinh || item.phân_loại || ""}`);
  const isMatTienFake = strictTextViTri.includes("cach mat tien") || strictTextViTri.includes("sau lung can mat tien") || strictTextViTri.includes("sau lung mat tien") || strictTextViTri.includes("sau mat tien") || strictTextViTri.includes("gan mat tien");
  const isKietHem = strictTextViTri.includes("kiet") || strictTextViTri.includes("hem") || isMatTienFake;
  const isMatTien = strictTextViTri.includes("mat tien") && !isKietHem;

  return (
    <a 
      href={`/nha-dat/${item.slug}`} 
      className="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-orange-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col h-full block transform hover:-translate-y-1 active:translate-y-0 active:scale-[0.98]"
    >
      {/* 🖼️ KHỐI HÌNH ẢNH */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <Image 
          src={thumbnail} 
          alt={item.tieude || "Trần Huy Land"} 
          fill 
          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
          sizes="(max-width: 1280px) 100vw" 
          priority={false} 
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Nhãn dán */}
        <div className="absolute top-2 left-0 flex flex-col items-start gap-1.5 z-10">
          {rank && <span className="bg-[#E03C31] text-white text-[11px] font-bold px-2.5 py-1 rounded-r shadow-sm tracking-wider uppercase">VIP {rank}</span>}
          {isSapHam && <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 ml-2 rounded shadow-sm uppercase tracking-wider animate-pulse">🔥 Sập Hầm</span>}
          {isChoThue && <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 ml-2 rounded shadow-sm uppercase tracking-wider">🔑 Cho Thuê</span>}
          {isChinhChu && <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 ml-2 rounded shadow-sm uppercase tracking-wider">✓ Chính Chủ</span>}
          {isMatTien && <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 ml-2 rounded shadow-sm uppercase tracking-wider">🏢 Mặt Tiền</span>}
          {isKietHem && <span className="bg-cyan-600 text-white text-[10px] font-bold px-2 py-0.5 ml-2 rounded shadow-sm uppercase tracking-wider">🛣️ Kiệt/Hẻm</span>}
        </div>

        {/* Cụm đếm ảnh góc phải dưới */}
        <div className="absolute bottom-2 right-2 bg-slate-900/70 text-white text-[11px] font-medium px-2 py-1 rounded flex items-center gap-1.5 z-10 backdrop-blur-sm">
          <ImageIcon size={12} />
          <span>{soLuongAnhChinhXac}</span>
        </div>
      </div>

      {/* 📝 KHỐI NỘI DUNG */}
      <div className="p-4 flex flex-col flex-grow justify-between">
        <div>
          <h3 className="text-[#2C2C2C] font-bold text-[14px] sm:text-[15px] uppercase line-clamp-2 leading-snug mb-3 group-hover:text-orange-600 transition-colors duration-300 h-[2.6rem] sm:h-[2.8rem]">
            {item.tieude}
          </h3>

          {/* 🔥 Dòng Thông số: Giá đỏ, M2 Đỏ, Giá/M2, Phòng Ngủ, WC */}
          <div className="flex flex-wrap items-center text-[14px] text-[#505050] mb-3 gap-x-2 gap-y-1">
            <span className="text-[#E03C31] font-bold text-[16px] whitespace-nowrap">
              {item.gia || "Thỏa thuận"}
            </span>

            {item.dienTich && (
              <>
                <span className="text-slate-300 text-[10px]">●</span>
                <span className="whitespace-nowrap font-bold text-[#E03C31]">{item.dienTich}</span>
              </>
            )}
            
            {giaM2 && (
              <>
                <span className="text-slate-300 text-[10px]">●</span>
                <span className="whitespace-nowrap font-medium text-[#777] text-[13px]">{giaM2}</span>
              </>
            )}

            {cauTrucPhong.pn && (
              <>
                <span className="text-slate-300 text-[10px]">●</span>
                <span className="flex items-center gap-1 whitespace-nowrap font-medium">
                  {cauTrucPhong.pn} <BedDouble size={14} className="text-slate-400" />
                </span>
              </>
            )}

            {cauTrucPhong.wc && (
              <>
                <span className="text-slate-300 text-[10px]">●</span>
                <span className="flex items-center gap-1 whitespace-nowrap font-medium">
                  {cauTrucPhong.wc} <Bath size={14} className="text-slate-400" />
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[13px] text-[#666] mb-4">
            <MapPin size={14} className="text-slate-400 shrink-0" />
            <span className="truncate">{displayLocation}</span>
          </div>
        </div>

        {/* 👤 KHỐI FOOTER CHUYÊN NGHIỆP */}
        <div className="mt-auto border-t border-slate-100 pt-3 flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-[50%]">
            {/* Ảnh đại diện <img> */}
            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center shrink-0 border border-slate-200">
              <img 
                src="https://tranhuyland.vn/logo.png" 
                alt="Trần Huy Land"
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=TH&background=random&color=fff&bold=true'; }}
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[12px] font-bold text-[#2C2C2C] truncate">Trần Huy Land</span>
              <span className="text-[11px] text-[#999] truncate">{formatTimeAgo(displayTime)}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 pl-1">
            <button 
              className="bg-[#009177] text-white text-[12px] sm:text-[13px] font-bold px-2.5 py-1.5 rounded flex items-center gap-1.5 hover:bg-[#007a64] active:scale-95 transition-all shadow-sm"
              onClick={(e) => { 
                e.preventDefault(); 
                window.location.href = 'tel:0900000000'; // 🚨 Thay số điện thoại của anh
              }}
            >
              <Phone size={13} className="fill-current" />
              <span className="hidden min-[380px]:inline">0900 000 ***</span>
              <span className="min-[380px]:hidden">Gọi</span>
            </button>
            
            <button 
              className="p-1.5 border border-slate-200 rounded text-slate-400 hover:text-red-500 hover:border-red-500 hover:bg-red-50 active:scale-95 transition-all"
              onClick={(e) => {
                e.preventDefault();
                alert("Đã lưu tin vào danh sách yêu thích!");
              }}
            >
              <Heart size={15} />
            </button>
          </div>
        </div>
      </div>
    </a>
  );
}
