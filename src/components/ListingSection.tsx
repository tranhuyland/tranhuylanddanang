"use client";

import React, { useMemo, useState } from "react";
import BdsCard from "./BdsCard";

export default function ListingSection({ allBdsItems = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeLoaiHinh, setActiveLoaiHinh] = useState("all");

  // 🔥 chỉ sort 1 lần
  const processed = useMemo(() => {
    return [...allBdsItems].sort((a, b) => b.id - a.id);
  }, [allBdsItems]);

  // 🔥 filter nhẹ
  const filtered = useMemo(() => {
    let result = processed;

    if (searchTerm) {
      result = result.filter((i) =>
        (i.tieude + i.moTa)
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    if (activeLoaiHinh !== "all") {
      result = result.filter(
        (i) => i.loaiHinh === activeLoaiHinh
      );
    }

    return result;
  }, [processed, searchTerm, activeLoaiHinh]);

  return (
    <main className="max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <BdsCard key={item.id} item={item} />
        ))}
      </div>
    </main>
  );
}
