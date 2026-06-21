'use client';

import { FileText } from 'lucide-react';

export default function KyGuiButton() {
  const handleOpenKyGui = () => {
    window.dispatchEvent(new CustomEvent('open-ky-goi-modal'));
  };

  return (
    <button
      onClick={handleOpenKyGui}
      className="w-full sm:w-auto flex justify-center items-center gap-2 bg-white text-slate-800 border border-white hover:bg-white font-bold py-3 px-6 rounded-2xl text-sm shadow-md active:scale-95 transition-all"
    >
      <FileText className="w-4 h-4 text-blue-600" />
      Ký Gởi Nhà Đất
    </button>
  );
}
