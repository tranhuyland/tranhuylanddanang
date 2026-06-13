'use client';
import React, { useState } from "react";
import { X, PenTool, Copy } from "lucide-react";

interface ModalsProps {
  type: "kygui";
  isOpen: boolean;
  onClose: () => void;
}

export function Modals({ type, isOpen, onClose }: ModalsProps) {
  const [kgTen, setKgTen] = useState("");
  const [kgDiaChi, setKgDiaChi] = useState("");
  const [kgGia, setKgGia] = useState("");

  if (!isOpen || type !== "kygui") return null;

  const handleKyGuiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Nội dung mẫu chuyên nghiệp
    const msg = `--- 📋 KÝ GỬI NHÀ ĐẤT ---\n- Liên hệ: ${kgTen}\n- Địa chỉ: ${kgDiaChi}\n- Giá mong muốn: ${kgGia || "Thương lượng"}\n-------------------------\nNhờ anh Huy xem giúp ạ!`;
    
    // Sao chép tự động vào bộ nhớ tạm
    navigator.clipboard.writeText(msg).then(() => {
      // Thông báo cho khách biết đã copy thành công
      alert("✅ Đã sao chép nội dung! \n\nBây giờ Zalo anh Huy sẽ mở ra, bạn chỉ cần chọn khung chat và bấm DÁN (Paste) để gửi nhé.");
      
      // Mở Zalo
      window.open("https://zalo.me/0905778852", "_blank");
      onClose();
    }).catch(() => {
      // Nếu copy lỗi, vẫn mở Zalo để khách tự gõ
      window.open("https://zalo.me/0905778852", "_blank");
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-5 h-5" />
        </button>
        
        <h3 className="font-black text-slate-900 text-lg mb-1 flex items-center gap-2">
          <PenTool className="text-orange-500 w-5 h-5" /> Ký Gửi Nhanh
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          Điền thông tin, hệ thống sẽ tự soạn tin nhắn gửi qua Zalo cho anh Huy.
        </p>

        <form onSubmit={handleKyGuiSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Tên & SĐT Liên Hệ *</label>
            <input 
              type="text" 
              required 
              value={kgTen} 
              onChange={(e) => setKgTen(e.target.value)} 
              placeholder="Ví dụ: Anh Nam - 0905..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all" 
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Địa Chỉ Ký Gửi *</label>
            <input 
              type="text" 
              required 
              value={kgDiaChi} 
              onChange={(e) => setKgDiaChi(e.target.value)} 
              placeholder="Số nhà, đường, phường..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all" 
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Giá Bán Mong Muốn</label>
            <input 
              type="text" 
              value={kgGia} 
              onChange={(e) => setKgGia(e.target.value)} 
              placeholder="Để trống nếu thương lượng" 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all" 
            />
          </div>

          <button 
            type="submit" 
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-black rounded-xl py-4 text-sm mt-2 shadow-lg shadow-orange-500/30 transition-all hover:shadow-orange-500/50 active:scale-95"
          >
            <Copy className="w-4 h-4" /> Sao Chép & Gửi Zalo
          </button>
        </form>
      </div>
    </div>
  );
}
