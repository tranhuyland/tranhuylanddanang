let cache: any[] = [];
let lastFetch = 0;

export async function getBdsData() {
  const now = Date.now();

  if (cache.length && now - lastFetch < 60000) {
    return cache;
  }

  const spreadsheetId =
    "1-LupBV6uNuUitz4vF6pFv6MupuVDMujafqhjQBNNPTA";

  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=BDS`;

  const res = await fetch(url, { next: { revalidate: 60 } });
  const text = await res.text();

  const rows = text.split("\n").map((r) => r.split(","));

  const headers = rows[0].map((h) =>
    (h || "").replace(/"/g, "").toLowerCase().trim()
  );

  const data = rows.slice(1).map((row, i) => {
    const obj: any = {};

    headers.forEach((h, idx) => {
      obj[h] = (row[idx] || "").replace(/"/g, "").trim();
    });

    return {
      id: Number(obj.id || i),
      tieude: obj.tieude || "Không tiêu đề",
      slug:
        (obj.tieude || "")
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]/g, "") || `item-${i}`,

      moTa: obj.mota || "",
      gia: obj.gia || "",
      soGia: Number(obj.sogia || 0),

      dienTich: obj.dientich || "",
      khuVuc: obj.khuvuc || "",
      khuVucFull: obj.khuvucfull || "",
      loaiHinh: obj.loaihinh || "",
      huong: obj.huong || "",
      phongNgu: obj.phongngu || "",
      phapLy: obj.phaply || "",
      tag: obj.tag || "",
      tagColor: obj.tagcolor || "",

      anh: obj.anh || "",
      anhSoDo: obj.anhsodo || "",
      linkMap: obj.linkmap || "",
      toaDo: obj.toado || "",
      videoUrl: obj.videourl || "",
      ngayDang: obj.ngaydang || "",
      isMatTien: obj.ismattien === "TRUE",
    };
  });

  cache = data;
  lastFetch = now;

  return data;
}
