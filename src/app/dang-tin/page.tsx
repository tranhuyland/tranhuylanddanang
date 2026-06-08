'use client';

import React, { useState } from 'react';

export default function DangTinPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    area: '',
    location: 'Hải Châu',
    direction: 'Đông',
    type: 'Đất nền',
    description: '',
    img1: '',
    img2: '',
    img3: '',
    img4: '',
    img5: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Gọi lên API Route nội bộ của Next.js để xử lý trung gian an toàn
      const response = await fetch('/api/dang-tin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage({ type: 'success', text: '🎉 Đăng sản phẩm thành công! Dữ liệu đã đồng bộ lên Google Sheet.' });
        // Reset form về trống
        setFormData({
          title: '', price: '', area: '', location: 'Hải Châu', direction: 'Đông', type: 'Đất nền',
          description: '', img1: '', img2: '', img3: '', img4: '', img5: ''
        });
      } else {
        setMessage({ type: 'error', text: result.error || 'Có lỗi xảy ra khi đồng bộ dữ liệu.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '❌ Không thể kết nối đồng bộ dữ liệu, vui lòng kiểm tra lại hệ thống.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6 sm:p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-blue-600">TRẦN HUY LAND</h1>
          <p className="text-gray-500 mt-2 font-medium">Hệ Thống Nhập Liệu Sản Phẩm Nội Bộ</p>
        </div>

        {message.text && (
          <div className={`p-4 rounded-lg mb-6 text-sm font-semibold ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Tiêu đề bất động sản (*)</label>
            <input type="text" name="title" required value={formData.title} onChange={handleChange} placeholder="Ví dụ: Bán đất mặt tiền Nguyễn Sinh Sắc siêu đẹp..." className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Giá cả (Tỷ hoặc Triệu) (*)</label>
              <input type="text" name="price" required value={formData.price} onChange={handleChange} placeholder="Ví dụ: 5.2 Tỷ" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Diện tích (m²) (*)</label>
              <input type="text" name="area" required value={formData.area} onChange={handleChange} placeholder="Ví dụ: 100" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Quận/Huyện</label>
              <select name="location" value={formData.location} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white">
                <option value="Hải Châu">Hải Châu</option>
                <option value="Thanh Khê">Thanh Khê</option>
                <option value="Liên Chiểu">Liên Chiểu</option>
                <option value="Cẩm Lệ">Cẩm Lệ</option>
                <option value="Sơn Trà">Sơn Trà</option>
                <option value="Ngũ Hành Sơn">Ngũ Hành Sơn</option>
                <option value="Hòa Vang">Hòa Vang</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Hướng nhà đất</label>
              <select name="direction" value={formData.direction} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white">
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
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Loại hình</label>
              <select name="type" value={formData.type} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white">
                <option value="Đất nền">Đất nền</option>
                <option value="Nhà phố">Nhà phố</option>
                <option value="Căn hộ">Căn hộ</option>
                <option value="Biệt thự">Biệt thự</option>
                <option value="Kho xưởng">Kho xưởng</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Mô tả chi tiết (Hỗ trợ xuống dòng)</label>
            <textarea name="description" rows={5} value={formData.description} onChange={handleChange} placeholder="Nhập thông tin mô tả chi tiết bất động sản tại đây..." className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900" />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-700 -mb-1">Danh sách link hình ảnh (Tối đa 5 ảnh)</label>
            <input type="text" name="img1" value={formData.img1} onChange={handleChange} placeholder="Đường dẫn hình ảnh 1 (Ảnh bìa bắt buộc)" className="w-full px-4 py-2 border rounded-lg text-sm text-gray-900" />
            <input type="text" name="img2" value={formData.img2} onChange={handleChange} placeholder="Đường dẫn hình ảnh 2" className="w-full px-4 py-2 border rounded-lg text-sm text-gray-900" />
            <input type="text" name="img3" value={formData.img3} onChange={handleChange} placeholder="Đường dẫn hình ảnh 3" className="w-full px-4 py-2 border rounded-lg text-sm text-gray-900" />
            <input type="text" name="img4" value={formData.img4} onChange={handleChange} placeholder="Đường dẫn hình ảnh 4" className="w-full px-4 py-2 border rounded-lg text-sm text-gray-900" />
            <input type="text" name="img5" value={formData.img5} onChange={handleChange} placeholder="Đường dẫn hình ảnh 5" className="w-full px-4 py-2 border rounded-lg text-sm text-gray-900" />
          </div>

          <button type="submit" disabled={loading} className={`w-full py-3 px-4 rounded-lg text-white font-bold transition duration-200 ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}>
            {loading ? '⏳ ĐANG ĐỒNG BỘ DỮ LIỆU...' : '🚀 XÁC NHẬN ĐĂNG TIN'}
          </button>
        </form>
      </div>
    </div>
  );
}
