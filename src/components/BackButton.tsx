// src/components/BackButton.tsx
'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      // Đã giảm px-4 py-2.5 thành px-3 py-1.5 và thêm text-xs
      className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors"
    >
      <ArrowLeft size={16} />
      <span>Quay về</span>
    </button>
  );
}
