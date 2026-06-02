'use client';
import React, { useState } from "react";
import Image from "next/image";
import { RealEstateItem } from "@/lib/googleSheets";
import { X, Layers, ShieldCheck, MapPin, Calendar, Square, Bed, Map, FileText, Phone } from "lucide-react";

interface ModalsProps { type: "detail" | "kygui"; isOpen: boolean; item?: RealEstateItem; onClose: () => void; }

export function Modals({ type, isOpen, item, onClose }: ModalsProps) {
  const [soDoUrl, setSoDoUrl] = useState<string | null>(null);
  const [kgTen, setKgTen] = useState("");
  const [kgDiaChi, setKgDiaChi] = useState("");
  const [kgGia, setKgGia] = useState("");

  if (!isOpen) return null;

  const handleKyGuiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `Chào anh Huy, tôi muốn ký gửi nhà đất với thông tin:\n- Liên hệ: ${kgTen}\n- Địa chỉ: ${kgDiaChi}\n- Giá mong muốn: ${kgGia || "Thương lượng"}`;
    navigator.clipboard.writeText(msg).then(() => {
      alert("📋 Đã soạn và tự động sao chép thông tin ký gửi! Hệ thống sẽ mở Zalo anh Huy, bạn chỉ cần bấm chọn 'DÁN' (Paste) và gửi đi là xong.");
      window.open("https://zalo.me/0931555551", "_blank");
      onClose();
    }).catch(() => { window.open("https://zalo.me/0931555551", "_blank"); onClose(); });
  };

  if (type === "kygui") {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl p-6 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400"><X className="w-4 h-4" /></button>
          <h3 className="font-extrabold text-slate-900 text-base mb-1">Ký Gửi Nhanh Trong 10s</h3>
          <p className="text-xs text-slate-400 mb-4">Thông tin đăng ký sẽ tự động chuyển tiếp sang ứng dụng Zalo anh Trần Huy.</p>
          <form onSubmit={handleKyGuiSubmit} className="space-y-3 text-sm">
            <div><label className="block font-bold text-slate-600 mb-1">Tên & SĐT Liên Hệ *</label><input type="text" required value={kgTen} onChange={(e) => setKgTen(e.target.value)} placeholder="Ví dụ: Anh Nam - 0905..." className="w-full bg-slate-50 border rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500" /></div>
            <div><label className="block font-bold text-slate-600 mb-1">Địa Chỉ Ký Gửi *</label><input type="text" required value={kgDiaChi} onChange={(e) => setKgDiaChi(e.target.value)} placeholder="Số nhà, tên đường, quận..." className="w-full bg-slate-50 border rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500" /></div>
            <div><label className="block font-bold text-slate-600 mb-1">Giá Bán Mong Muốn</label><input type="text" value={kgGia} onChange={(e) => setKgGia(e.target.value)} placeholder="Để trống nếu thương lượng" className="w-full bg-slate-50 border rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500" /></div>
            <button type="submit" className="w-full bg-slate-900 text-white font-bold rounded-xl py-3 text-sm mt-3 shadow-md">Xác Nhận Ký Gửi</button>
          </form>
        </div>
      </div>
    );
  }

  if (type === "detail" && item) {
    const listAnh = item.anh ? item.anh.split(",").map(a => a.trim()) : [];
    return (
      <div className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl relative max-h-[92vh] sm:max-h-[88vh] flex flex-col">
          <button onClick={onClose} className="absolute top-4 right-4 z-50 w-8 h-8 bg-slate-900/50 text-white rounded-full flex items-center justify-center"><X className="w-4 h-4" /></button>
          <div className="overflow-y-auto flex-1 no-scrollbar">
            <div className="relative aspect-[16/10] bg-slate-100 w-full">
              <div className="w-full h-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar">
                {listAnh.map((url, idx) => (<div key={idx} className="w-full h-full flex-shrink-0 snap-start relative"><Image src={url} alt={item.tieude || "Hình ảnh sản phẩm"} fill className="object-cover" /></div>))}
              </div>
              <div className="bg-slate-900/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-md absolute top-4 left-4 z-10 flex items-center gap-1"><Layers className="w-3 h-3 text-amber-400" /> Giỏ hàng: {listAnh.length} Ảnh</div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <span className="bg-amber-100 text-amber-900 font-extrabold text-base px-3 py-1 rounded-xl shadow-sm">{item.gia}</span>
                <span className="text-xs text-slate-400 font-bold uppercase bg-slate-50 px-2.5 py-1 rounded-lg border flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-emerald-500" /> {item.phapLy || 'Sổ hồng sẵn sàng'}</span>
              </div>
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 mt-4 leading-snug">{item.tieude}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-400 text-xs mt-2 border-b pb-4 font-semibold">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-amber-500" />{item.khuVucFull}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Đăng: {item.ngayDang}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 my-5 p-3.5 bg-slate-50 border rounded-xl text-sm text-slate-600 text-center font-semibold">
                <div><div className="text-slate-400 text-[11px] font-bold uppercase mb-0.5">Diện tích</div><strong className="text-slate-900 text-sm">{item.dienTich}</strong></div>
                <div><div className="text-slate-400 text-[11px] font-bold uppercase mb-0.5">Cấu trúc</div><strong className="text-slate-900 text-sm">{item.phongNgu || 'Đất ở'}</strong></div>
                <div><div className="text-slate-400 text-[11px] font-bold uppercase mb-0.5">Hướng</div><strong className="text-slate-900 text-sm">{item.huong || 'Chưa rõ'}</strong></div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {item.linkMap && <a href={item.linkMap} target="_blank" rel="noopener noreferrer" className="bg-emerald-50 text-emerald-700 font-bold border rounded-xl py-2.5 px-3 text-center text-xs flex items-center justify-center gap-1.5"><Map className="w-4 h-4" /> Bản Đồ Vị Trí</a>}
                {item.anhSoDo && <button onClick={() => setSoDoUrl(item.anhSoDo)} className="bg-indigo-50 text-indigo-700 font-bold border rounded-xl py-2.5 px-3 text-center text-xs flex items-center justify-center gap-1.5"><FileText className="w-4 h-4" /> Sổ Đỏ Bản Vẽ</button>}
              </div>
              <p className="text-slate-700 text-xs sm:text-sm leading-relaxed text-justify whitespace-pre-line mb-6">{item.moTa}</p>
              <div className="flex gap-3 mt-4 border-t pt-4">
                <a href="tel:0931555551" className="flex-1 bg-slate-900 text-white font-extrabold rounded-xl py-3 px-4 flex items-center justify-center gap-2 text-sm shadow-md"><Phone className="w-4 h-4 text-amber-400 fill-amber-400" /> Gọi Thỏa Thuận</a>
                <a href="https://zalo.me/0931555551" target="_blank" rel="noopener noreferrer" className="flex-1 bg-[#0068ff] text-white font-extrabold rounded-xl py-3 px-4 flex items-center justify-center text-sm shadow-md text-center">Liên Hệ Zalo</a>
              </div>
            </div>
          </div>
        </div>
        {soDoUrl && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
            <button onClick={() => setSoDoUrl(null)} className="absolute top-4 right-4 text-white"><X className="w-6 h-6" /></button>
            <div className="max-w-3xl w-full max-h-[85vh] relative aspect-square"><Image src={soDoUrl} alt="Sơ đồ sổ đỏ" fill className="object-contain" /></div>
          </div>
        )}
      </div>
    );
  }
  return null;
}
