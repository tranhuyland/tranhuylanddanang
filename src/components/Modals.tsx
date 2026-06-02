'use client';
import React, { useState } from "react";
import { X, PenTool, ChevronLeft, ChevronRight, MapPin, Compass, Square, DollarSign } from "lucide-react";

interface ModalsProps {
  type: "kygui" | "bds";
  isOpen: boolean;
  onClose: () => void;
  item?: any;
}

export function Modals({ type, isOpen, onClose, item }: ModalsProps) {
  const [kgTen, setKgTen] = useState("");
  const [kgDiaChi, setKgDiaChi] = useState("");
  const [kgGia, setKgGia] = useState("");
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  if (!isOpen) return null;

  // CHỨC NĂNG 1: FORM XỬ LÝ KÝ GỬI NHÀ ĐẤT QUA ZALO ANH HUY
  const handleKyGuiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `Chào anh Huy, tôi muốn ký gửi nhà đất với thông tin:\n- Liên hệ: ${kgTen}\n- Địa chỉ: ${kgDiaChi}\n- Giá mong muốn: ${kgGia || "Thương lượng"}`;
    navigator.clipboard.writeText(msg).then(() => {
      alert("📋 Đã soạn và tự động sao chép thông tin ký gửi! Hệ thống tự động mở Zalo anh Huy, bạn chỉ cần bấm chọn 'DÁN' (Paste) và gửi đi là xong.");
      window.open("https://zalo.me/0931555551", "_blank");
      onClose();
    }).catch(() => { 
      window.open("https://zalo.me/0931555551", "_blank"); 
      onClose(); 
    });
  };

  // Tách mảng hình ảnh từ chuỗi ngăn cách bằng dấu phẩy Google Sheet
  const images = item?.anh ? item.anh.split(',').map((img: string) => img.trim()).filter(Boolean) : [];

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length > 0) {
      setCurrentImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length > 0) {
      setCurrentImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      
      {/* TRƯỜNG HỢP 1: HIỂN THỊ POPUP FORM KÝ GỬI NHÀ ĐẤT */}
      {type === "kygui" && (
        <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl p-6 relative" onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
          <h3 className="font-extrabold text-slate-900 text-base mb-1 flex items-center gap-2"><PenTool className="text-amber-500 w-4 h-4" /> Ký Gửi Nhanh Trong 10s</h3>
          <p className="text-xs text-slate-400 mb-4">Thông tin đăng ký sẽ tự động chuyển tiếp sang ứng dụng Zalo anh Trần Huy.</p>
          <form onSubmit={handleKyGuiSubmit} className="space-y-3 text-sm">
            <div><label className="block font-bold text-slate-600 mb-1">Tên & SĐT Liên Hệ *</label><input type="text" required value={kgTen} onChange={(e) => setKgTen(e.target.value)} placeholder="Ví dụ: Anh Nam - 0905..." className="w-full bg-slate-50 border rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500" /></div>
            <div><label className="block font-bold text-slate-600 mb-1">Địa Chỉ Ký Gửi *</label><input type="text" required value={kgDiaChi} onChange={(e) => setKgDiaChi(e.target.value)} placeholder="Số nhà, tên đường, quận..." className="w-full bg-slate-50 border rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500" /></div>
            <div><label className="block font-bold text-slate-600 mb-1">Giá Bán Mong Muốn</label><input type="text" value={kgGia} onChange={(e) => setKgGia(e.target.value)} placeholder="Để trống nếu thương lượng" className="w-full bg-slate-50 border rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500" /></div>
            <button type="submit" className="w-full bg-slate-900 text-white font-bold rounded-xl py-3 text-sm mt-3 shadow-md transition-all active:scale-95">Xác Nhận Ký Gửi</button>
          </form>
        </div>
      )}

      {/* TRƯỜNG HỢP 2: HIỂN THỊ POPUP CHI TIẾT SẢN PHẨM & SLIDER CHUYỂN ẢNH CÓ MŨI TÊN */}
      {type === "bds" && item && (
        <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-slate-100 text-slate-800 rounded-full z-10 shadow-md transition-colors"><X size={20} /></button>

          {/* Khung Trình Chiếu Ảnh Slider */}
          <div className="relative aspect-video w-full bg-slate-900 rounded-2xl overflow-hidden">
            {images.length > 0 ? (
              <>
                <img src={images[currentImgIndex]} className="w-full h-full object-contain" alt={`${item.tieude || 'BDS'} - Ảnh ${currentImgIndex + 1}`} />
                {images.length > 1 && (
                  <>
                    <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors z-10"><ChevronLeft size={24} /></button>
                    <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors z-10"><ChevronRight size={24} /></button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/30 px-3 py-1.5 rounded-full z-10">
                      {/* Thêm kiểu dữ liệu string cho biến chạy ẩn để vượt qua bộ kiểm tra TypeScript */}
                      {images.map((_img: string, idx: number) => (
                        <button key={idx} onClick={() => setCurrentImgIndex(idx)} className={`w-2 h-2 rounded-full transition-all ${currentImgIndex === idx ? "bg-amber-500 scale-125" : "bg-white/60"}`} />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">Không tìm thấy hình ảnh</div>
            )}
          </div>

          {/* Nội dung tin đăng */}
          <div className="mt-5">
            <span className="inline-block bg-amber-50 text-amber-700 font-bold px-3 py-1 rounded-lg text-sm mb-2">{item.phân_loại || "Nhà Đất Đà Nẵng"}</span>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-snug">{item.tieude}</h2>
            <div className="flex items-center gap-1 text-2xl font-black text-amber-600 mt-2"><DollarSign className="w-6 h-6 stroke-[2.5]" /><span>{item.gia}</span></div>

            <div className="grid grid-cols-2 gap-4 mt-5 p-4 bg-slate-50 rounded-2xl text-sm text-slate-700">
              <div className="flex items-center gap-2"><Square className="w-4 h-4 text-slate-400" /><span>Diện tích: <strong>{item.dienTich}</strong></span></div>
              {item.huong && <div className="flex items-center gap-2"><Compass className="w-4 h-4 text-slate-400" /><span>Hướng: <strong>{item.huong}</strong></span></div>}
              {item.diaChi && <div className="flex items-center gap-2 col-span-2 border-t pt-2 mt-1"><MapPin className="w-4 h-4 text-slate-400 shrink-0" /><span className="line-clamp-1">Vị trí: <strong>{item.diaChi}</strong></span></div>}
            </div>

            {item.mota && (
              <div className="mt-5">
                <h4 className="font-bold text-slate-900 mb-2">Thông tin mô tả thêm</h4>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-2xl border border-slate-100">{item.mota}</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
