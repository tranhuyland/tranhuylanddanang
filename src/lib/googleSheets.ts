let cache: any = null;
let lastFetch = 0;

export async function getBdsData() {
  const now = Date.now();

  // cache 60s
  if (cache && now - lastFetch < 60000) {
    return cache;
  }

  const spreadsheetId =
    "1-LupBV6uNuUitz4vF6pFv6MupuVDMujafqhjQBNNPTA";

  const sheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=BDS`;

  const res = await fetch(sheetUrl, {
    next: { revalidate: 60 },
  });

  const text = await res.text();

  const rows = text.split("\n").map((r) => r.split(","));

  const headers = rows[0];

  const data = rows.slice(1).map((row, i) => {
    const obj: any = {};

    headers.forEach((h, idx) => {
      obj[h?.toLowerCase()?.trim()] = row[idx]?.replace(/"/g, "") || "";
    });

    return {
      id: Number(obj.id || i),
      tieude: obj.tieude || "No title",
      slug: obj.tieude
        ? obj.tieude
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]+/g, "")
        : `item-${i}`,
      gia: obj.gia || "",
      dienTich: obj.dientich || "",
      khuVuc: obj.khuvuc || "",
      khuVucFull: obj.khuvucfull || "",
      loaiHinh: obj.loaihinh || "",
      huong: obj.huong || "",
      anh: obj.anh || "",
      ngayDang: obj.ngaydang || "",
      moTa: obj.mota || "",
      soGia: Number(obj.sogia || 0),
    };
  });

  cache = data;
  lastFetch = now;

  return data;
}
