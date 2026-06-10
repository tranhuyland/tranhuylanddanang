'use client';
import React, { useState } from "react";
import { Modals } from "./Modals";

export default function ContactCTA() {
  const [isOpenKyGui, setIsOpenKyGui] = useState(false);
  return (
    <>
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="bg-gradient-to-r from-amber-500 to-yellow-400 rounded-[2.5rem] p-10 lg:p-14 text-slate-900 shadow-md">
          <div className="max-w-3xl">
            <p className="uppercase tracking-widest text-xs font-bold mb-3 text-slate-900/80">KÝ GỬI CHÍNH CHỦ</p>
            <h2 className="text-3xl lg:text-5xl font-extrabold mb-5">Cần Bán Nhanh Nhà Đất Tại Đà Nẵng?</h2>
            <p className="text-base leading-relaxed mb-8 font-medium">Gửi thông tin sơ bộ qua hệ thống để được anh Huy hỗ trợ kiểm tra pháp lý, trích lục bản vẽ quy hoạch và kết nối khách hàng thực tế nhanh nhất.</p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setIsOpenKyGui(true)} className="bg-slate-900 hover:bg-slate-800 text-white px-7 py-4 rounded-2xl font-extrabold text-sm shadow-xl transition-all">Ký Gửi Trực Tuyến</button>
              <a href="tel:0905778852" className="border border-slate-900 hover:bg-slate-900/10 px-7 py-4 rounded-2xl font-extrabold text-sm transition-all">Hotline: 0931 555 551</a>
            </div>
          </div>
        </div>
      </section>
      <Modals type="kygui" isOpen={isOpenKyGui} onClose={() => setIsOpenKyGui(false)} />
    </>
  );
}
