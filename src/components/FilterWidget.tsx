'use client';
import React from 'react';
import { SlidersHorizontal, X, Check } from "lucide-react";

const PHUONG_XA = {
  phuong: ["Hải Châu", "Hòa Cường", "Thanh Khê", "An Khê", "An Hải", "Sơn Trà", "Ngũ Hành Sơn", "Hòa Khánh", "Hải Vân", "Liên Chiểu", "Cẩm Lệ", "Hòa Xuân", "Hòa Vang", "Bà Nà", "Hòa Tiến", "Hòa Phước"],
  xa: ["Hòa Bắc", "Hòa Liên", "Hòa Ninh"]
};

export default function FilterWidget({
  tempFilters,
  handleFilterChange,
  forceDistrict,
  isDrawerOpen,
  closeDrawer,
  handleResetFilters,
  handleApplyFilters
}: any) {

  const Fields = () => (
    <>
      <div className="space-y-2">
        <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest pl-1">Phường / Xã</label>
        <select disabled={!!forceDistrict} value={tempFilters.khuVuc} onChange={(e) => handleFilterChange('khuVuc', e.target.value)} className="w-full bg-slate-50 border border-slate-200 hover:border-orange-300 focus:border-orange-500 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-700 outline-none transition-all cursor-pointer appearance-none">
          <option value="all">Tất cả Vị trí</option>
          <option disabled className="font-bold text-slate-400 bg-slate-100">-- Danh sách Phường --</option>
          {PHUONG_XA.phuong.map(p => <option key={p} value={p}>{p}</option>)}
          <option disabled className="font-bold text-slate-400 bg-slate-100">-- Danh sách Xã --</option>
          {PHUONG_XA.xa.map(x => <option key={x} value={x}>{x}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest pl-1">Khoảng Giá</label>
        <select value={tempFilters.khoangGia} onChange={(e) => handleFilterChange('khoangGia', e.target.value)} className="w-full bg-slate-50 border border-slate-200 hover:border-orange-300 focus:border-orange-500 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-700 outline-none transition-all cursor-pointer appearance-none">
          <option value="all">Tất cả mức giá</option>
          <option value="duoi3">Dưới 3 Tỷ</option>
          <option value="3to5">Từ 3 - 5 Tỷ</option>
          <option value="tren5">Trên 5 Tỷ</option>
        </select>
      </div>
      <div className="space-y-2">
        <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest pl-1">Hướng Nhà</label>
        <select value={tempFilters.huong} onChange={(e) => handleFilterChange('huong', e.target.value)} className="w-full bg-slate-50 border border-slate-200 hover:border-orange-300 focus:border-orange-500 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-700 outline-none transition-all cursor-pointer appearance-none">
          <option value="all">Tất cả các hướng</option>
          {["Đông", "Tây", "Nam", "Bắc"].map(h => <option key={h} value={h}>Hướng {h}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest pl-1">Nhóm Đặc Quyền</label>
        <select value={tempFilters.tag} onChange={(e) => handleFilterChange('tag', e.target.value)} className="w-full bg-slate-50 border border-slate-200 hover:border-orange-300 focus:border-orange-500 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-700 outline-none transition-all cursor-pointer appearance-none">
          <option value="all">Tất cả phân nhóm</option>
          <option value="mattien">🏢 Mặt Tiền Kinh Doanh</option>
          <option value="chinhchu">✓ Hàng Chính Chủ</option>
          <option value="chothue">🔑 Nhà Cho Thuê</option>
        </select>
      </div>
    </>
  );

  return (
    <>
      {/* 1. GIAO DIỆN HIỂN THỊ TRÊN MÁY TÍNH (Nằm ngang cực đẹp) */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Fields />
      </div>

      {/* 2. GIAO DIỆN DRAWER TRƯỢT LÊN TRÊN ĐIỆN THOẠI */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[60] md:hidden flex flex-col justify-end">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeDrawer} />
          <div className="relative bg-white rounded-t-[2rem] shadow-2xl h-[80vh] flex flex-col z-10 overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 p-5 shrink-0">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-orange-500" />
                <h4 className="font-extrabold text-slate-800 text-base">Bộ lọc nâng cao</h4>
              </div>
              <button onClick={closeDrawer} className="text-slate-400 p-2"><X size={22} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-6 pb-48">
              <Fields />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-white via-white/90 to-transparent pt-12 pb-28 z-20 pointer-events-none">
              <div className="flex gap-3 bg-white p-2 rounded-[1.5rem] shadow-xl border border-slate-100 pointer-events-auto">
                <button onClick={handleResetFilters} className="w-1/3 text-slate-600 font-bold text-sm py-3.5 rounded-xl bg-slate-50">Đặt lại</button>
                <button onClick={handleApplyFilters} className="w-2/3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-extrabold text-sm py-3.5 rounded-xl flex items-center justify-center gap-2"><Check size={18} />Áp dụng ngay</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
