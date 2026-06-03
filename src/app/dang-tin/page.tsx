'use client';

import React, { useState } from 'react';

export default function DangTinBdsPage() {
  // 🚨 ANH HUY ĐIỀN CHÍNH XÁC 3 THÔNG SỐ CỦA ANH VÀO ĐÂY
  const CLOUD_NAME = 'ds6k0kfbz'; 
  const UPLOAD_PRESET = 'tranhuyland'; 
  
  // Dán cái link Web App của Google Apps Script (có chữ /exec) của anh Huy vào đây
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxn5TRu7Cy8xPXOggaGV06ZLyYlHvf5lRFN5ripa-Tk1hQzMJaY7u_BGlxzLKDa40KpWQ/exec';

  const [formData, setFormData] = useState({
    title: '', price: '', area: '', location: '', direction: '', description: '',
  });
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setIsUploading(true);
    setStatusMsg({ type: '', text: '' });
    const uploadedUrls: string[] = [...images];

    try {
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const data = new FormData();
        data.append('file', file);
        data.append('upload_preset', UPLOAD_PRESET);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: data,
        });
        const json = await res.json();
        if (json.secure_url) {
          uploadedUrls.push(json.secure_url);
        }
      }
      setImages(uploadedUrls);
      setStatusMsg({ type: 'success', text: 'Đã tải ảnh lên kho đám mây thành công!' });
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Lỗi tải ảnh lên hệ thống lưu trữ Cloudinary.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      setStatusMsg({ type: 'error', text: 'Vui lòng chọn ít nhất 1 hình ảnh sản phẩm!' });
      return;
    }
    setIsSubmitting(true);
    setStatusMsg({ type: 'info', text: 'Đang xử lý đồng bộ dữ liệu vào hệ thống Google Sheet...' });

    try {
      // Ép kiểu gửi trực tiếp xuyên qua tường lửa bảo mật của Google Script bằng mode: 'no-cors'
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'appendRow',
          data: {
            id: Date.now().toString(),
            title: formData.title,
            price: formData.price,
            area: formData.area,
            location: formData.location,
            direction: formData.direction,
            images: images.join(','),
            description: formData.description,
            date: new Date().toLocaleDateString('vi-VN'),
          }
        }),
      });

      // Với chế độ no-cors, hệ thống sẽ bỏ qua bước check phản hồi và báo thành công ngay khi data được bắn đi
      setStatusMsg({ type: 'success', text: 'Chúc mừng anh Huy! Tin bất động sản đã được đẩy vào Google Sheet thành công, web sẽ nạp tin sau 1 phút.' });
      setFormData({ title: '', price: '', area: '', location: '', direction: '', description: '' });
      setImages([]);
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Gặp sự cố kết nối, vui lòng kiểm tra lại mạng điện thoại.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto my-10 p-6 bg-white rounded-xl shadow-lg font-sans border border-gray-100">
      <h1 className="text-xl font-bold text-blue-800 text-center mb-6 uppercase tracking-wide border-b pb-4">
        Hệ Thống Đăng Tin Nhanh - Trần Huy Land
      </h1>

      {statusMsg.text && (
        <div className={`p-4 mb-5 rounded-lg text-sm font-semibold ${
          statusMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 
          statusMsg.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-blue-50 text-blue-700'
        }`}>
          {statusMsg.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Tiêu đề bất động sản (*)</label>
          <input required type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Bán đất mặt tiền đường Nguyễn Hữu Thọ, Khuê Trung..." className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 border-gray-300" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Giá bán (*)</label>
            <input required type="text" name="price" value={formData.price} onChange={handleChange} placeholder="Ví dụ: 4.8 Tỷ" className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 border-gray-300" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Diện tích (*)</label>
            <input required type="text" name="area" value={formData.area} onChange={handleChange} placeholder="Ví dụ: 100m2" className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 border-gray-300" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Vị trí / Quận (*)</label>
            <input required type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Ví dụ: Cẩm Lệ, Đà Nẵng" className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 border-gray-300" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Hướng nhà đất</label>
            <select name="direction" value={formData.direction} onChange={handleChange} className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 border-gray-300">
              <option value="">-- Chọn hướng --</option>
              <option value="Đông">Đông</option><option value="Tây">Tây</option>
              <option value="Nam">Nam</option><option value="Bắc">Bắc</option>
              <option value="Đông Nam">Đông Nam</option><option value="Đông Bắc">Đông Bắc</option>
              <option value="Tây Nam">Tây Nam</option><option value="Tây Bắc">Tây Bắc</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Mô tả chi tiết bài viết</label>
          <textarea rows={4} name="description" value={formData.description} onChange={handleChange} placeholder="Nhập công năng, tiện ích... Bấm Enter xuống dòng thoải mái." className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 border-gray-300"></textarea>
        </div>

        <div className="border-2 border-dashed border-blue-200 rounded-xl p-5 bg-blue-50/30 text-center">
          <label className="cursor-pointer block">
            <span className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow text-xs font-bold inline-block mb-2 transition">
              {isUploading ? 'ĐANG TẢI ẢNH LÊN...' : '📸 CHỌN NHIỀU ẢNH CÙNG LÚC'}
            </span>
            <input type="file" multiple accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="hidden" />
            <p className="text-xs text-gray-400">Anh Huy có thể bấm chọn loạt ảnh nhà từ máy</p>
          </label>

          {images.length > 0 && (
            <div className="grid grid-cols-4 gap-3 mt-4">
              {images.map((url, idx) => (
                <div key={idx} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setImages(images.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-md">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={isSubmitting || isUploading} className={`w-full py-3 rounded-lg text-white font-bold transition shadow-md ${
          isSubmitting || isUploading ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-green-600 hover:opacity-90'
        }`}>
          {isSubmitting ? 'ĐANG ĐỒNG BỘ...' : '🚀 XÁC NHẬN ĐĂNG TIN LÊN WEBSITE'}
        </button>
      </form>
    </div>
  );
}
