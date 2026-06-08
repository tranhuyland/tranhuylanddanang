'use client';
import React, { useState } from 'react';
import { FormEvent } from 'react';

// 🚨 THAO TÁC BẮT BUỘC: Anh điền link Web App chuẩn (/exec) lấy từ Apps Script của Google Sheet vào đây
const GOOGLE_WEBAPP_URL = 'LINK_WEB_APP_EXEC_CỦA_ANH_VÀO_ĐÂY';

export default function DangTinPage() {
  const [formData, setFormData] = useState({
    id: '',
    tieude: '',
    gia: '',
    dienTich: '',
    khuVuc: '', // Biến này dùng để lưu Phường / Xã chuẩn của anh
    huong: '',
    loaiHinh: 'Nhà phố',
    anh: '',
    mota: '',
    tag: 'all',
    isMatTien: false,
    ngayDang: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', content: '' });

    // Tự động cập nhật ngày đăng theo định dạng VN DD/MM/YYYY
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    const currentId = Date.now().toString();
    const payload = {
      ...formData,
      id: currentId,
      ngayDang: formattedDate,
      isMatTien: formData.isMatTien || formData.tieude.toLowerCase().includes('mặt tiền') || formData.tag === 'mattien'
    };

    try {
      // Phương thức no-cors giúp đẩy data chạy ngầm siêu tốc thẳng lên Google Sheet không lo chặn bảo mật
      await fetch(GOOGLE_WEBAPP_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      setMessage({ type: 'success', content: '🎉 Úp sản phẩm bất động sản lên Google Sheet thành công!' });
      setFormData({
        id: '',
        tieude: '',
        gia: '',
        dienTich: '',
        khuVuc: '',
        huong: '',
        loaiHinh: 'Nhà phố',
        anh: '',
        mota: '',
        tag: 'all',
        isMatTien: false,
        ngayDang: ''
      });
    } catch (error) {
      setMessage({ type: 'error', content: '❌ Lỗi kết nối. Vui lòng kiểm tra lại hệ thống tệp Apps Script.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-xl p-6 sm:p-8">
        <div className="text-center mb-8">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">Trang Úp Sản Phẩm Nội Bộ</h1>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Hệ thống đồng bộ dữ liệu Trần Huy Land</p>
        </div>

        {message.content && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-bold text-center ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
            {message.content}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Tiêu đề tin đăng</label>
            <input required type="text" value={formData.tieude} onChange={(e) => setFormData({ ...formData, tieude: e.target.value })} placeholder="Ví dụ: Bán nhà mặt tiền Nguyễn Sinh Sắc vị trí đắc địa..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-amber-500 text-slate-700" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Giá bán hiển thị</label>
              <input required type="text" value={formData.gia} onChange={(e) => setFormData({ ...formData, gia: e.target.value })} placeholder="Ví dụ: 4.5 Tỷ, 35 Tr/m2" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-amber-500 text-slate-700" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Diện tích (m2)</label>
              <input required type="text" value={formData.dienTich} onChange={(e) => setFormData({ ...formData, dienTich: e.target.value })} placeholder="Ví dụ: 100m2, 85m2" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-amber-500 text-slate-700" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Phường / Xã vị trí</label>
              <select required value={formData.khuVuc} onChange={(e) => setFormData({ ...formData, khuVuc: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold focus:outline-none focus:border-amber-500 text-slate-700">
                <option value="">-- Chọn Vị Trí --</option>
                
                {/* 16 PHƯỜNG CHUẨN CỦA ANH */}
                <option disabled className="font-bold text-slate-400 bg-slate-100">-- Danh sách Phường --</option>
                <option value="Hải Châu">Hải Châu</option>
                <option value="Hòa Cường">Hòa Cường</option>
                <option value="Thanh Khê">Thanh Khê</option>
                <option value="An Khê">An Khê</option>
                <option value="An Hải">An Hải</option>
                <option value="Sơn Trà">Sơn Trà</option>
                <option value="Ngũ Hành Sơn">Ngũ Hành Sơn</option>
                <option value="Hòa Khánh">Hòa Khánh</option>
                <option value="Hải Vân">Hải Vân</option>
                <option value="Liên Chiểu">Liên Chiểu</option>
                <option value="Cẩm Lệ">Cẩm Lệ</option>
                <option value="Hòa Xuân">Hòa Xuân</option>
                <option value="Hòa Vang">Hòa Vang</option>
                <option value="Bà Nà">Bà Nà</option>
                <option value="Hòa Tiến">Hòa Tiến</option>
                <option value="Hòa Phước">Hòa Phước</option>

                {/* 3 XÃ CHUẨN CỦA ANH */}
                <option disabled className="font-bold text-slate-400 bg-slate-100">-- Danh sách Xã --</option>
                <option value="Hòa Bắc">Hòa Bắc</option>
                <option value="Hòa Liên">Hòa Liên</option>
                <option value="Hòa Ninh">Hòa Ninh</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Hướng bất động sản</label>
              <select required value={formData.huong} onChange={(e) => setFormData({ ...formData, huong: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold focus:outline-none focus:border-amber-500 text-slate-700">
                <option value="">-- Chọn Hướng --</option>
                <option value="Đông">Đông</option>
                <option value="Tây">Tây</option>
                <option value="Nam">Nam</option>
                <option value="Bắc">Bắc</option>
                <option value="Đông Nam">Đông Nam</option>
                <option value="Đông Bắc">Đông Bắc</option>
                <option value="Tây Nam">Tây Nam</option>
                <option value="Tây Bắc">Tây Bắc</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Phân Phân Loại</label>
              <select value={formData.loaiHinh} onChange={(e) => setFormData({ ...formData, loaiHinh: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold focus:outline-none focus:border-amber-500 text-slate-700">
                <option value="Nhà phố">Nhà phố / Kiệt</option>
                <option value="Đất nền">Đất nền / Đất ở</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Nhãn Tag lọc nhanh</label>
              <select value={formData.tag} onChange={(e) => setFormData({ ...formData, tag: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold focus:outline-none focus:border-amber-500 text-slate-700">
                <option value="all">Mặc định (Không có tag đặc biệt)</option>
                <option value="mattien">Mặt Tiền Kinh Doanh</option>
                <option value="chinhchu">Hàng Chính Chủ</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Danh sách chuỗi liên kết ảnh (Cách nhau bằng dấu phẩy)</label>
            <textarea required rows={2} value={formData.anh} onChange={(e) => setFormData({ ...formData, anh: e.target.value })} placeholder="https://anh1.jpg, https://anh2.jpg" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-amber-500 text-slate-700" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Mô tả chi tiết bất động sản (Hỗ trợ xuống dòng tự do)</label>
            <textarea required rows={5} value={formData.mota} onChange={(e) => setFormData({ ...formData, mota: e.target.value })} placeholder="Nhập mô tả thông tin đất/nhà, kết cấu, tiện ích xung quanh..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-amber-500 text-slate-700 whitespace-pre-line" />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" id="isMatTien" checked={formData.isMatTien} onChange={(e) => setFormData({ ...formData, isMatTien: e.target.checked })} className="w-4 4 text-amber-500 border-slate-300 rounded focus:ring-amber-500" />
            <label htmlFor="isMatTien" className="text-xs font-bold text-slate-600 uppercase tracking-wide cursor-pointer select-none">Bất động sản này là nhà/đất mặt tiền kinh doanh</label>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white font-bold text-sm uppercase py-4 rounded-xl shadow-md hover:bg-slate-800 transition-colors disabled:bg-slate-400 mt-4">
            {loading ? 'Đang gửi dữ liệu đồng bộ...' : '🚀 Xác Nhận Đăng Tin Lên Hệ Thống'}
          </button>
        </form>
      </div>
    </div>
  );
}
