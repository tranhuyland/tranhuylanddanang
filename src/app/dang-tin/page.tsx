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
  duong: '', // 💡 ĐÃ THÊM TRƯỜNG TÊN ĐƯỜNG
  khuVuc: '', 
  huong: '',
  loaiHinh: 'Nhà phố',
  anh: '', 
  anhSoDo: '', 
  linkMap: '', 
  moTa: '', 
  tag: 'all',
  isMatTien: false,
  ngayDang: ''
};

export default function DangTinPage() {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  // Trạng thái tải ảnh thực tế
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedImagesPreview, setSelectedImagesPreview] = useState<string[]>([]);
  
  // Trạng thái tải ảnh sổ đỏ
  const [uploadingSoDo, setUploadingSoDo] = useState(false);
  const [uploadProgressSoDo, setUploadProgressSoDo] = useState(0);
  const [soDoImagesPreview, setSoDoImagesPreview] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  // 🛠️ HÀM TỐI ƯU DÙNG CHUNG: Tải loạt ảnh lên Cloudinary & Giải phóng bộ nhớ RAM
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
    setMessage({ type: '', content: '' });

    const uploadedUrls: string[] = [];
    const previewUrls: string[] = [];
    const totalFiles = files.length;

    try {
      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        const blobUrl = URL.createObjectURL(file);
        previewUrls.push(blobUrl);

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
        setProgress(Math.round(((i + 1) / totalFiles) * 100));
      }

      setPreviews(previewUrls);
      setFormData(prev => ({ ...prev, [formField]: uploadedUrls.join(', ') }));
      setMessage({ type: 'success', content: successMsg });
    } catch (error) {
      setMessage({ type: 'error', content: errorMsg });
    } finally {
      setUploadStatus(false);
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    selectedImagesPreview.forEach(url => URL.revokeObjectURL(url)); 
    uploadImagesToCloudinary(
      e.target.files, setUploading, setUploadProgress, setSelectedImagesPreview,
      'anh', `📸 Đã tải thành công ${e.target.files?.length} ảnh thực tế lên Cloudinary!`, '❌ Gặp lỗi khi úp ảnh thực tế lên Cloudinary.'
    );
  };

  const handleSoDoChange = (e: ChangeEvent<HTMLInputElement>) => {
    soDoImagesPreview.forEach(url => URL.revokeObjectURL(url)); 
    uploadImagesToCloudinary(
      e.target.files, setUploadingSoDo, setUploadProgressSoDo, setSoDoImagesPreview,
      'anhSoDo', `📑 Đã tải thành công ${e.target.files?.length} ảnh sơ đồ/sổ đỏ lên Cloudinary!`, '❌ Gặp lỗi khi úp ảnh sổ đỏ lên Cloudinary.'
    );
  };

  // 🗺️ HÀM TỰ TẠO LINK GOOGLE MAPS
  const updateMapLink = (duong: string, phuong: string, currentLink: string) => {
    // Nếu user đã dán 1 link map thủ công (không chứa chuỗi do app tự tạo), thì giữ nguyên không ghi đè
    if (currentLink && !currentLink.includes('google.com/maps/search/?api=1&query=')) {
      return currentLink;
    }
    // Nếu có đủ Tên Đường và Phường Xã, tự tổ hợp URL
    if (duong && phuong) {
      const query = `${duong}, ${phuong}, Đà Nẵng`;
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    }
    return currentLink;
  };

  // 🤖 HÀM TỰ ĐỘNG QUÉT VÀ ĐIỀN DỮ LIỆU
  const handleAutoScanDescription = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    let newFormData = { ...formData, moTa: text };

    // 1. Quét Giá
    const priceMatch2 = text.match(/(\d+)\s*tỷ\s*(\d+)/i);
    const priceMatch1 = text.match(/(\d+)(?:\s*[.,]\s*([\dxX]+))?\s*(tỷ|triệu)/i); 
    
    if (priceMatch2) {
      newFormData.gia = `${priceMatch2[1]},${priceMatch2[2]} tỷ`;
    } else if (priceMatch1) {
      let num1 = priceMatch1[1];
      let num2 = priceMatch1[2];
      let unit = priceMatch1[3].toLowerCase();
      
      if (num2) {
        newFormData.gia = `${num1},${num2.toLowerCase()} ${unit}`;
      } else {
        newFormData.gia = `${num1} ${unit}`;
      }
    }

    // 2. Quét Diện Tích
    const areaMatch = text.match(/(\d+)(?:\s*[.,]\s*(\d+))?\s*(?:m2|m²)/i);
    if (areaMatch) {
      let num1 = areaMatch[1];
      let num2 = areaMatch[2];
      if (num2) {
        newFormData.dienTich = `${num1},${num2} m2`;
      } else {
        newFormData.dienTich = `${num1} m2`;
      }
    }

    // 3. Quét Phường / Xã 
    const wards = ['Hải Châu', 'Hòa Cường', 'Thanh Khê', 'An Khê', 'An Hải', 'Sơn Trà', 'Ngũ Hành Sơn', 'Hòa Khánh', 'Hải Vân', 'Liên Chiểu', 'Cẩm Lệ', 'Hòa Xuân', 'Hòa Vang', 'Bà Nà', 'Hòa Tiến', 'Hòa Phước', 'Hòa Bắc', 'Hòa Liên', 'Hòa Ninh'];
    const normalizeVN = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const normalizedText = normalizeVN(text);

    const foundWard = wards.find(w => normalizedText.includes(normalizeVN(w)));
    if (foundWard) {
      newFormData.khuVuc = foundWard;
    }

    // 4. Quét Tên Đường (Bắt nội dung sau chữ "đường" hoặc "mặt tiền", dừng lại khi gặp phường/quận/dấu phẩy/gạch ngang)
    const streetMatch = text.match(/(?:đường|mặt tiền)\s+([^,\n\-]+?)(?=\s+phường|\s+quận|,|-|\n|$)/i);
    if (streetMatch) {
      newFormData.duong = streetMatch[1].trim();
    }

    // 5. Quét Hướng
    const directions = ['Đông Nam', 'Đông Bắc', 'Tây Nam', 'Tây Bắc', 'Đông', 'Tây', 'Nam', 'Bắc'];
    const directionMatch = text.match(/hướng[\s\:\-\*\.\,]*\s*(đông nam|đông bắc|tây nam|tây bắc|đông|tây|nam|bắc)/i);
    if (directionMatch) {
      const dir = directions.find(d => d.toLowerCase() === directionMatch[1].toLowerCase());
      if (dir) newFormData.huong = dir;
    }

    // 6. Tự động sinh Link Google Maps nếu có đủ Phường + Đường
    newFormData.linkMap = updateMapLink(newFormData.duong, newFormData.khuVuc, newFormData.linkMap);

    setFormData(newFormData);
  };

  // Cập nhật Link Map ngay lập tức khi người dùng tự gõ Tên đường
  const handleDuongChange = (e: ChangeEvent<HTMLInputElement>) => {
    const duong = e.target.value;
    setFormData(prev => ({ ...prev, duong, linkMap: updateMapLink(duong, prev.khuVuc, prev.linkMap) }));
  };

  // Cập nhật Link Map ngay lập tức khi người dùng tự chọn Phường
  const handleKhuVucChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const khuVuc = e.target.value;
    setFormData(prev => ({ ...prev, khuVuc, linkMap: updateMapLink(prev.duong, khuVuc, prev.linkMap) }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (uploading || uploadingSoDo) {
      setMessage({ type: 'error', content: '⏳ Vui lòng đợi toàn bộ hình ảnh tải lên hoàn tất trước khi đăng tin!' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', content: '' });

    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

    const payload = {
      ...formData,
      id: Date.now().toString(),
      ngayDang: formattedDate,
      isMatTien: formData.isMatTien || formData.tieude.toLowerCase().includes('mặt tiền')
    };

    try {
      await fetch(GOOGLE_WEBAPP_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      setMessage({ type: 'success', content: '🎉 Thêm sản phẩm bất động sản đồng bộ lên Google Sheet thành công!' });
      setFormData(INITIAL_FORM_STATE);
      setSelectedImagesPreview([]);
      setSoDoImagesPreview([]);
    } catch (error) {
      setMessage({ type: 'error', content: '❌ Lỗi kết nối đồng bộ. Vui lòng kiểm tra lại link Web App.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-xl p-6 sm:p-8">
        <div className="text-center mb-8">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">Úp Tin Bất Động Sản Hệ Thống</h1>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Hệ thống tự động hóa Trần Huy Land</p>
        </div>

        {message.content && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-bold text-center ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
            {message.content}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Ô MÔ TẢ ĐƯA LÊN TRÊN ĐỂ DÁN VÀO QUÉT TRƯỚC */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 text-amber-600">Mô tả chi tiết (Dán vào đây để tự động quét thông tin)</label>
            <textarea required rows={5} value={formData.moTa} onChange={handleAutoScanDescription} placeholder="Dán thông tin mô tả chi tiết tại đây. Hệ thống sẽ tự động tìm Giá, Diện tích, Đường, Vị trí..." className="w-full bg-amber-50/50 border border-amber-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-amber-500 text-slate-700 whitespace-pre-line shadow-inner" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Tiêu đề tin đăng</label>
            <input required type="text" value={formData.tieude} onChange={(e) => setFormData({ ...formData, tieude: e.target.value })} placeholder="Ví dụ: Bán nhà mặt tiền Nguyễn Sinh Sắc..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-amber-500 text-slate-700" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Giá bán hiển thị</label>
              <input required type="text" value={formData.gia} onChange={(e) => setFormData({ ...formData, gia: e.target.value })} placeholder="Ví dụ: 4,35 tỷ" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-amber-500 text-slate-700" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Diện tích</label>
              <input required type="text" value={formData.dienTich} onChange={(e) => setFormData({ ...formData, dienTich: e.target.value })} placeholder="Ví dụ: 100 m2" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-amber-500 text-slate-700" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Phường / Xã vị trí</label>
              <select required value={formData.khuVuc} onChange={handleKhuVucChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold focus:outline-none focus:border-amber-500 text-slate-700">
                <option value="">-- Chọn Vị Trí --</option>
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
                <option disabled className="font-bold text-slate-400 bg-slate-100">-- Danh sách Xã --</option>
                <option value="Hòa Bắc">Hòa Bắc</option>
                <option value="Hòa Liên">Hòa Liên</option>
                <option value="Hòa Ninh">Hòa Ninh</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Tên Đường</label>
              <input type="text" value={formData.duong} onChange={handleDuongChange} placeholder="Ví dụ: Hoàng Diệu" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-amber-500 text-slate-700" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Hướng bất động sản</label>
              <select value={formData.huong} onChange={(e) => setFormData({ ...formData, huong: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold focus:outline-none focus:border-amber-500 text-slate-700">
                <option value="">-- Để trống hoặc Chọn --</option>
                <option value="Đông">Đông</option><option value="Tây">Tây</option><option value="Nam">Nam</option><option value="Bắc">Bắc</option>
                <option value="Đông Nam">Đông Nam</option><option value="Đông Bắc">Đông Bắc</option><option value="Tây Nam">Tây Nam</option><option value="Tây Bắc">Tây Bắc</option>
              </select>
            </div>
            {/* Cột này để trống hoặc bạn có thể chèn nội dung khác nếu muốn cho cân đối */}
          </div>

          {/* ĐƯỜNG DẪN GOOGLE MAPS (SẼ ĐƯỢC TỰ ĐỘNG ĐIỀN) */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Đường dẫn Google Maps</label>
            <input type="text" value={formData.linkMap} onChange={(e) => setFormData({ ...formData, linkMap: e.target.value })} placeholder="Hệ thống sẽ tự tạo link nếu có Tên Đường và Phường..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-amber-500 text-slate-700 text-blue-600" />
          </div>

          {/* KHU VỰC CHỌN VÀ ÚP LOẠT ẢNH THỰC TẾ */}
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-5 text-center">
            <label className="block text-xs font-black text-slate-700 uppercase mb-2 tracking-wide cursor-pointer">
              {uploading ? `📸 Đang tải ảnh thực tế: ${uploadProgress}%` : '📸 Bấm vào đây để chọn loạt ảnh thực tế'}
              <input type="file" multiple accept="image/*" disabled={uploading} onChange={handleImageChange} className="hidden" />
            </label>
            {uploading && (
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            )}
            {selectedImagesPreview.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-4">
                {selectedImagesPreview.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border bg-white">
                    <img src={url} alt="preview" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* KHU VỰC ÚP HÌNH SỔ ĐỎ / SỔ HỒNG */}
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-5 text-center">
            <label className="block text-xs font-black text-slate-700 uppercase mb-2 tracking-wide cursor-pointer">
              {uploadingSoDo ? `📑 Đang tải ảnh sơ đồ: ${uploadProgressSoDo}%` : '📑 Bấm vào đây để úp hình Sổ đỏ / Sơ đồ (Không bắt buộc)'}
              <input type="file" multiple accept="image/*" disabled={uploadingSoDo} onChange={handleSoDoChange} className="hidden" />
            </label>
            {uploadingSoDo && (
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                <div className="bg-amber-600 h-full transition-all duration-300" style={{ width: `${uploadProgressSoDo}%` }}></div>
              </div>
            )}
            {soDoImagesPreview.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-4">
                {soDoImagesPreview.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border bg-white">
                    <img src={url} alt="so do preview" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" id="isMatTien" checked={formData.isMatTien} onChange={(e) => setFormData({ ...formData, isMatTien: e.target.checked })} className="w-4 h-4 text-amber-500 border-slate-300 rounded focus:ring-amber-500" />
            <label htmlFor="isMatTien" className="text-xs font-bold text-slate-600 uppercase tracking-wide cursor-pointer select-none">Bất động sản này là mặt tiền kinh doanh</label>
          </div>

          <button type="submit" disabled={loading || uploading || uploadingSoDo} className="w-full bg-slate-900 text-white font-bold text-sm uppercase py-4 rounded-xl shadow-md hover:bg-slate-800 transition-colors disabled:bg-slate-400 mt-4">
            {loading ? 'Đang gửi dữ liệu đồng bộ...' : (uploading || uploadingSoDo) ? '⏳ Đang tải ảnh lên Cloudinary...' : '🚀 Xác Nhận Đăng Tin Lên Hệ Thống'}
          </button>
        </form>
      </div>
    </div>
  );
}
