"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function BdsCard({ item }: any) {
  const daysOld = (() => {
    const d = new Date(item.ngayDang);
    return isNaN(d.getTime())
      ? 999
      : Math.floor((Date.now() - d.getTime()) / 86400000);
  })();

  const isNew = daysOld <= 2;

  return (
    <Link
      href={`/nha-dat/${item.slug}`}
      className="block bg-white rounded-xl overflow-hidden border hover:shadow"
    >
      <div className="relative h-48">
        <Image
          src={item.anh || "/no-image.jpg"}
          alt={item.tieude}
          fill
          className="object-cover"
        />
        {isNew && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1">
            Mới
          </span>
        )}
      </div>

      <div className="p-3">
        <h2 className="font-bold text-sm line-clamp-2">
          {item.tieude}
        </h2>

        <p className="text-red-500 font-bold mt-1">
          {item.gia}
        </p>

        <p className="text-xs text-gray-500 mt-1">
          {item.khuVuc}
        </p>
      </div>
    </Link>
  );
}
