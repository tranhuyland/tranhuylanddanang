'use client';
import React, { useState, ChangeEvent, FormEvent } from 'react';

// 🚨 CẤU HÌNH THÔNG SỐ: Giữ nguyên thông số hệ thống của anh Huy
const GOOGLE_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbzrb1ocMD9pZYe8JN14hSxhYG1KOHPb_ruX3hJtpUzKYn270qsKbjisU0Ea40DaGh3vww/exec';
const CLOUDINARY_CLOUD_NAME = 'ds6k0kfbz'; 
const CLOUDINARY_UPLOAD_PRESET = 'tranhuyland';

const INITIAL_FORM_STATE = {
  id: '',
  tieude: '',
  gia: '',
  dienTich: '',
  khuVuc: '', 
  huong: '',
  anh: '', 
  anhSoDo: '', 
  linkMap: '', 
  moTa: '', 
  isMatTien: false,
  ngayDang: ''
};

export default function DangTinPage() {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedImagesPreview, setSelectedImagesPreview] = useState<string[]>([]);
  const [uploadingSoDo, setUploadingSoDo] = useState(false);
  const [uploadProgressSoDo, setUploadProgressSoDo] = useState(0);
  const [soDoImagesPreview, setSoDoImagesPreview] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  const uploadImagesToCloudinary = async (
    files: FileList | null,
    setUploadStatus: (status: boolean) => void,
    setProgress: (progress: number) => void,
    setPreviews: (urls: string[]) => void,
    formField: 'anh' | 'anhSoDo',
    successMsg: string,
    errorMsg: string
  ) => {
    if (!files || files.length === 0) return;
    setUploadStatus(true);
    setProgress(0);
    const uploadedUrls: string[] = [];
    const previewUrls: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        previewUrls.push(URL.createObjectURL(file));
        const data = new FormData();
        data.append('file', file);
        data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: data
        });
        if (res.ok) {
          const fileData = await res.json();
          uploadedUrls.push(fileData.secure_url);
        }
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }
      setPreviews(previewUrls);
      setFormData(prev => ({ ...prev, [formField]: uploadedUrls.join(', ') }));
      setMessage({ type: 'success', content: successMsg });
    } catch {
      setMessage({ type: 'error', content: errorMsg });
    } finally {
      setUploadStatus(false);
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    selectedImagesPreview.forEach(url => URL.revokeObjectURL(url));
    uploadImagesToCloudinary(e.target.files, setUploading, setUploadProgress, setSelectedImagesPreview, 'anh', '📸 Đã tải ảnh xong!', '❌ Lỗi tải ảnh thực tế.');
  };

  const handleSoDoChange = (e: ChangeEvent<HTMLInputElement>) => {
    soDoImagesPreview.forEach(url => URL.revokeObjectURL(url));
    uploadImagesToCloudinary(e.target.files, setUploadingSoDo, setUploadProgressSoDo, setSoDoImagesPreview, 'anhSoDo', '📑 Đã tải ảnh sổ đỏ xong!', '❌ Lỗi tải ảnh sổ đỏ.');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (uploading || uploadingSoDo) {
      setMessage({ type: 'error', content: '⏳ Vui lòng đợi ảnh tải lên hoàn tất!' });
      return;
    }
    setLoading(true);
    const payload = { ...formData, id: Date.now().toString(), ngayDang: new Date().toLocaleDateString('vi-VN'), isMatTien: formData.isMatTien || formData.tieude.toLowerCase().includes('mặt tiền') };

    try {
      await fetch(GOOGLE_WEBAPP_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      setMessage({ type: 'success', content: '🎉 Đăng tin thành công!' });
      setFormData(INITIAL_FORM_STATE);
      setSelectedImagesPreview([]);
      setSoDoImagesPreview([]);
    } catch {
      setMessage({ type: 'error', content: '❌ Lỗi đồng bộ!' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-xl p-6 sm:p-8">
        <div className="text-center mb-8">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">Úp Tin Bất Động Sản</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Tiêu đề tin đăng</label>
            <input required type="text" value={formData.tieude} onChange={(e) => setFormData({ ...formData, tieude: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-amber-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Giá bán hiển thị</label>
              <input required type="text" value={formData.gia} onChange={(e) => setFormData({ ...formData, gia: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Diện tích (m2)</label>
              <input required type="text" value={formData.dienTich} onChange={(e) => setFormData({ ...formData, dienTich: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-amber-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Phường / Xã</label>
              <select required value={formData.khuVuc} onChange={(e) => setFormData({ ...formData, khuVuc: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold focus:outline-none focus:border-amber-500">
                <option value="">-- Chọn Vị Trí --</option>
                <option value="Hải Châu">Hải Châu</option><option value="Hòa Cường">Hòa Cường</option><option value="Thanh Khê">Thanh Khê</option>
                <option value="Liên Chiểu">Liên Chiểu</option><option value="Cẩm Lệ">Cẩm Lệ</option><option value="Hòa Xuân">Hòa Xuân</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Hướng (Không bắt buộc)</label>
              <select value={formData.huong} onChange={(e) => setFormData({ ...formData, huong: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold focus:outline-none focus:border-amber-500">
                <option value="">-- Chọn hướng --</option>
                <option value="Đông">Đông</option><option value="Tây">Tây</option><option value="Nam">Nam</option><option value="Bắc">Bắc</option>
              </select>
            </div>
          </div>
          {/* ... (Các phần upload và mô tả giữ nguyên) ... */}
          <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl">
            {loading ? 'Đang gửi...' : '🚀 Xác Nhận Đăng Tin'}
          </button>
        </form>
      </div>
    </div>
  );
}
