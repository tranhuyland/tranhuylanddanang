'use client';

import { FileText } from 'lucide-react';

export default function KyGuiButton() {
  const handleOpenKyGui = () => {
    window.dispatchEvent(
      new CustomEvent('open-ky-goi-modal')
    );
  };

  return (
    <button
      onClick={handleOpenKyGui}
      className="w-full sm:w-auto flex justify-center items-center gap-2 bg-orange-500 text-white font-bold py-3.5 px-8 rounded-full hover:bg-orange-600 transition-colors"
    >
      <FileText className="w-4 h-4" />
      Ký Gửi Nhanh
    </button>
  );
}
