'use client';
import React, { useState } from "react";
import { Modals } from "./Modals";

export default function ContactCTA() {
  const [isOpenKyGui, setIsOpenKyGui] = useState(false);

  return (
    <>
      <section class="max-w-7xl mx-auto px-4 pb-20">
        <div class="bg-gradient-to-r from-amber-500 to-yellow-400 rounded-[2.5rem] p-10 lg:p-14 text-slate-900 shadow-md">
          <div class="max-w-3xl">
            <p class="uppercase tracking-widest text-xs font-bold mb-3 tracking-wider text-slate-900/80">KÝ GỬI CHÍNH CHỦ</p>
            <h2 class="text-3xl lg:text-5xl font-extrabold leading-tight mb-5">Cần Bán Nhanh Nhà Đất Tại Đà Nẵng?</h2>
            <p class="text-base lg:text-lg leading-relaxed mb-8 font-medium text-slate-800">
              Anh/Chị chủ nhà chỉ cần gửi thông tin sơ bộ qua hệ thống ký gửi trực tuyến hoặc liên hệ trực tiếp Zalo để được hỗ trợ kiểm tra pháp lý, khảo sát quay dựng hình ảnh bài bản và tiếp cận khách hàng thực tế nhanh nhất.
            </p>
            <div class="flex flex-wrap gap-3">
              <button onClick={() => setIsOpenKyGui(true)} class="bg-slate-900 hover:bg-slate-800 text-white px-7 py-4 rounded-2xl font-extrabold transition-all shadow-xl active:scale-95 text-sm">
                Ký Gửi Trực Tuyến
              </button>
              <a href="tel:0931555551" class="border border-slate-900 hover:bg-slate-900/10 px-7 py-4 rounded-2xl font-extrabold transition-all text-sm flex items-center gap-2">
                Hotline hỗ trợ: 0931 555 551
              </a>
            </div>
          </div>
        </div>
      </section>
      <Modals type="kygui" isOpen={isOpenKyGui} onClose={() => setIsOpenKyGui(false)} />
    </>
  );
}
