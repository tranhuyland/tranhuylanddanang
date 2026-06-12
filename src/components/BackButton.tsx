"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors font-medium mb-4"
    >
      <ChevronLeft size={20} />
      <span>Quay về</span>
    </button>
  );
}
