import React from "react";
import { notFound } from "next/navigation";
import { getBdsData } from "@/lib/googleSheets"; // Hàm fetch data từ Google Sheet của anh
import ListingSection from "@/components/ListingSection";

// 🌟 Bật cơ chế tải động liên tục để website tự cập nhật nhà đất mới từ Google Sheet ngay lập tức
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// 1. Bản đồ giải mã slug không dấu sang từ khóa có dấu khớp dữ liệu Google Sheet của anh
const LOCATION_MAP: Record<string, string> = {
  "hai-chau": "Hải Châu",
  "hoa-cuong": "Hòa Cường",
  "thanh-khe": "Thanh Khê",
  "an-khe": "An Khê",
  "an-hai": "An Hải",
  "son-tra": "Sơn Trà",
  "ngu-hanh-son": "Ngũ Hành Sơn",
  "hoa-khanh": "Hòa Khánh",
  "hai-van": "Hải Vân",
  "lien-chieu": "Liên Chiểu",
  "cam-le": "Cẩm Lệ",
  "hoa-xuan": "Hòa Xuân",
  "hoa-vang": "Hòa Vang",
  "ba-na": "Bà Nà",
  "hoa-tien": "Hòa Tiến",
  "hoa-phuoc": "Hòa Phước",
  "hoa-bac": "Hòa Bắc",
  "hoa-lien": "Hòa Liên",
  "hoa-ninh": "Hòa Ninh"
};

// 2. Cấu hình tiêu đề SEO Metadata động chuẩn thuật toán Google cho từng Phường / Xã
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const locationName = LOCATION_MAP[slug];
  
  if (!locationName) return { title: "Vị trí không tồn tại | Trần Huy Land" };

  return {
    title: `Mua Bán Nhà Đất Khu Vực ${locationName} - Đà Nẵng | Trần Huy Land`,
    description: `Danh sách các bất động sản chính chủ, giá tốt, mặt tiền kinh doanh, nhà kiệt thông thoáng vị trí cực đẹp tại khu vực ${locationName}, thành phố Đà Nẵng.`,
    alternates: {
      canonical: `https://tranhuyland.vn/vi-tri/${slug}`
    }
  };
}

// 3. Hàm render giao diện trang lọc theo vị trí Phường / Xã cụ thể
export default async function PhuongLocationPage({ params }: PageProps) {
  const { slug } = await params;
  
  // Kiểm tra tính hợp lệ của đường dẫn slug
  const matchedLocationName = LOCATION_MAP[slug];
  if (!matchedLocationName) {
    notFound();
  }

  // Nạp toàn bộ kho dữ liệu nhà đất từ Google Sheet
  const allRawItems = await getBdsData();
  const safeItems = Array.isArray(allRawItems) ? allRawItems : [];

  // Lọc lấy danh sách bất động sản khớp với Phường / Xã đang xem
  const itemsByLocation = safeItems.filter((item: any) => {
    const checkDiaChi = item.diaChi || item.diChi || item.dia_chi || "";
    const checkKhuVuc = item.khuVucFull || item.khuVuc || "";
    return (
      checkDiaChi.toLowerCase().includes(matchedLocationName.toLowerCase()) ||
      checkKhuVuc.toLowerCase().includes(matchedLocationName.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 pt-28">
      {/* Khung tiêu đề trang */}
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-lg">
          <span className="text-xs font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-3 py-1.5 rounded-lg">Danh mục khu vực</span>
          <h1 className="text-2xl sm:text-4xl font-black mt-3 uppercase tracking-tight">
            Nhà đất tại {matchedLocationName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 font-medium">
            Phát hiện tìm thấy <span className="text-amber-400 font-extrabold">{itemsByLocation.length}</span> bất động sản đang có tin đăng hiển thị tại đây.
          </p>
        </div>
      </div>

      {/* Truyền dữ liệu sang component ListingSection để hiển thị bộ lọc và các thẻ BDS */}
      <ListingSection allBdsItems={itemsByLocation} forceDistrict={matchedLocationName} />
    </div>
  );
}
