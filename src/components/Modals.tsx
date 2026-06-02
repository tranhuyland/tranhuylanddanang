'use client';
import React, { useState } from "react";
import { X, PenTool } from "lucide-react";

interface ModalsProps { type: "kygui"; isOpen: boolean; onClose: () => void; }

export function Modals({ type, isOpen, onClose }: ModalsProps) {
  const [kgTen, setKgTen] = useState("");
  const [kgDiaChi, setKgDiaChi] = useState("");
  const [kgGia, setKgGia] = useState("");

  if (!isOpen || type !== "kygui") return null;

  const handleKyGuiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `Chào anh Huy, tôi muốn ký gửi nhà đất với thông tin:\n- Liên hệ: ${kgTen}\n- Địa chỉ: ${kgDiaChi}\n- Giá mong muốn: ${kgGia || "Thương lượng"}`;
    navigator.clipboard.writeText(msg).then(() => {
      alert("📋 Đã soạn và tự động sao chép thông tin ký gửi! Hệ thống tự động mở Zalo anh Huy, bạn chỉ cần bấm chọn 'DÁN' (Paste) và gửi đi là xong.");
      window.open("https://zalo.me/0931555551", "_blank");
      onClose();
    }).catch(() => { window.open("https://zalo.me/0931555551", "_blank"); onClose(); });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl p-6 relative">
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
    </div>
  );
}
