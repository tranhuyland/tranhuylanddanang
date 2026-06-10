'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Lỗi hệ thống hiển thị:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h2 className="text-xl font-bold text-red-600 mb-2">Hệ thống đang quá tải dữ liệu</h2>
      <p className="text-slate-500 mb-6 max-w-sm text-sm">
        Kết nối đến kho hàng Google Sheets đang gặp gián đoạn nhỏ. Xin vui lòng bấm nút tải lại trang.
      </p>
      <button
        onClick={() => reset()}
        className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
      >
        TẢI LẠI TRANG
      </button>
    </div>
  );
}
