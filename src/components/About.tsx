import React from "react";

export default function About() {
  return (
    <section id="about-section" className="bg-white border-t border-b border-slate-100 py-20">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-slate-900 rounded-[2.5rem] p-8 sm:p-12 text-white flex flex-col justify-center">
          <p className="text-amber-400 uppercase tracking-widest text-xs font-bold mb-3">VÌ SAO CHỌN TRẦN HUY LAND</p>
          <h3 className="text-3xl font-extrabold mb-6">Chuyên Nhà Đất Thực Tế Tại Đà Nẵng</h3>
          <div className="space-y-6 text-slate-300 text-sm">
            <p><strong>Hình Ảnh & Vị Trí Thật:</strong> Cam kết 100% dữ liệu giỏ hàng chính chủ được anh Huy trực tiếp đi khảo sát.</p>
            <p><strong>Hỗ Trợ Pháp Lý Minh Bạch:</strong> Kiểm tra quy hoạch đô thị, hỗ trợ xem trực tiếp bản vẽ gốc.</p>
          </div>
        </div>
        <div className="bg-slate-50 border p-8 sm:p-12 rounded-[2.5rem] flex flex-col justify-center">
          <p className="text-amber-500 uppercase tracking-widest text-xs font-bold mb-2">THỊ TRƯỜNG ĐÀ NẴNG</p>
          <h3 className="text-3xl font-extrabold text-slate-900 mb-5">Phân Tích Địa Bàn Nổi Bật</h3>
          <p className="text-slate-600 text-sm leading-relaxed text-justify">Dòng tiền lớn đổ mạnh về khu vực quận Hải Châu và Cẩm Lệ nhờ hạ tầng đồng bộ, mật độ cư dân sầm uất và tính thanh khoản bất động sản thổ cư vượt trội.</p>
        </div>
      </div>
    </section>
  );
}
