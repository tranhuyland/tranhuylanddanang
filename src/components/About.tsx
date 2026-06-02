import React from "react";

export default function About() {
  return (
    <section id="about-section" class="bg-white border-t border-b border-slate-100 py-20">
      <div class="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div class="bg-slate-900 rounded-[2.5rem] p-8 sm:p-12 text-white flex flex-col justify-center">
          <p class="text-amber-400 uppercase tracking-widest text-xs font-bold mb-3">VÌ SAO CHỌN TRẦN HUY LAND</p>
          <h3 class="text-3xl font-extrabold mb-6">Chuyên Nhà Đất Thực Tế Tại Đà Nẵng</h3>
          <div class="space-y-6 text-slate-300 text-sm">
            <p><strong>Hình Ảnh & Vị Trí Thật:</strong> Cam kết hạn chế tối đa tin ảo, hình minh họa sai lệch thực tế.</p>
            <p><strong>Hỗ Trợ Pháp Lý Minh Bạch:</strong> Kiểm tra quy hoạch đô thị, xem trực tiếp bản vẽ gốc.</p>
          </div>
        </div>
        <div class="bg-slate-50 border p-8 sm:p-12 rounded-[2.5rem] flex flex-col justify-center">
          <p class="text-amber-500 uppercase tracking-widest text-xs font-bold mb-2">THỊ TRƯỜNG ĐÀ NẴNG</p>
          <h3 class="text-3xl font-extrabold text-slate-900 mb-5">Phân Tích Địa Bàn Nổi Bật</h3>
          <p class="text-slate-600 text-sm leading-relaxed text-justify">Dòng tiền lớn đổ mạnh về khu vực Hải Châu và Cẩm Lệ nhờ hạ tầng kết nối vượt trội và tính thanh khoản bất động sản thổ cư cực cao.</p>
        </div>
      </div>
    </section>
  );}