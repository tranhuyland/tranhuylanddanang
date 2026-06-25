"use client";

import React, { useMemo, useState } from "react";
import BdsCard from "./BdsCard";

export default function ListingSection({ allBdsItems = [] }: any) {
  const safeItems = Array.isArray(allBdsItems) ? allBdsItems : [];

  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");

  const data = useMemo(() => {
    return [...safeItems].sort((a, b) => b.id - a.id);
  }, [safeItems]);

  const filtered = useMemo(() => {
    let result = data;

    if (type !== "all") {
      result = result.filter((i) => i.loaiHinh === type);
    }

    if (search) {
      const s = search.toLowerCase();
      result = result.filter((i) =>
        `${i.tieude || ""} ${i.moTa || ""}`
          .toLowerCase()
          .includes(s)
      );
    }

    return result;
  }, [data, search, type]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <input
        className="border p-2 w-full rounded mb-4"
        placeholder="Tìm bất động sản..."
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="flex gap-2 mb-6 flex-wrap">
        {["all", "Nhà phố", "Đất", "Căn hộ"].map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`px-3 py-1 rounded border ${
              type === t ? "bg-orange-500 text-white" : ""
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map((item: any) => (
          <BdsCard key={item.id} item={item} />
        ))}
      </div>
    </main>
  );
}
