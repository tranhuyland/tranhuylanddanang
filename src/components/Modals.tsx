'use client';
import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight, PenTool } from "lucide-react";

interface ModalsProps { 
  type: "product" | "kygui"; 
  isOpen: boolean; 
  onClose: () => void; 
  data?: any; 
}

export function Modals({ type, isOpen, onClose, data }: ModalsProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [kgTen, setKgTen] = useState("");
  const [kgDiaChi, setKgDiaChi] = useState("");
  const [kgGia, setKgGia] = useState("");

  if (!isOpen) return null;

  // Xử lý Popup Sản phẩm
  if (type === "product" && data) {
    const images = data.anh.split(",").map((a: string) => a.trim()).filter((a: string) => a.startsWith("http"));
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden relative shadow-2xl">
          <button onClick={onClose} className="absolute top-4 right-4 z-20 bg-black/50 text-white p-1 rounded-full"><X className="w-5 h-5" /></button>
          
          <div className="relative aspect-[4/3] flex items-center justify-center bg-slate-100">
            <img src={images[currentIdx] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6'} alt={data.tieude} className="w-full h-full object-cover" />
            {images.length > 1 && (
              <>
                <button onClick={() => setCurrentIdx((p) => (p - 1 + images.length) % images.length)} className="absolute left-2 z-10 bg-white/80 p-2 rounded-full"><ChevronLeft /></button>
                <button onClick={() => setCurrentIdx((p) => (p + 1) % images.length)} className="absolute right-2 z-10 bg-white/80 p-2 rounded-full"><ChevronRight /></button>
              </>
            )}
          </div>
          <div className="p-5"><h3 className="font-bold text-lg">{data.tieude}</h3><p className="text-amber-600 font-bold">{data.gia}</p></div>
        </div>
      </div>
    );
  }

  // Xử lý Popup Ký Gửi
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400"><X className="w-4 h-4" /></button>
        <h3 className="font-extrabold text-base mb-4 flex items-center gap-2"><PenTool className="text-amber-500" /> Ký Gửi Nhanh</h3>
        <form onSubmit={(e) => { e.preventDefault(); window.open(`https://zalo.me/0931555551`, "_blank"); onClose(); }} className="space-y-3">
          <input type="text" required placeholder="Tên & SĐT..." className="w-full border rounded-xl px-3 py-2" onChange={(e) => setKgTen(e.target.value)} />
          <input type="text" required placeholder="Địa chỉ..." className="w-full border rounded-xl px-3 py-2" onChange={(e) => setKgDiaChi(e.target.value)} />
          <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl">Xác Nhận Ký Gửi</button>
        </form>
      </div>
    </div>
  );
}
