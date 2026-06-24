'use client';
import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import dynamic from 'next/dynamic';
// 🚀 KẾT NỐI VỚI NÃO BỘ THUẬT TOÁN VỪA TẠO
import { formatCleanPrice, generateMapLink, autoParseRealEstateText, uploadImagesCloudinary } from '@/lib/dangTinHelpers';

const LocationPickerMap = dynamic(() => import('@/components/LocationPickerMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-500 rounded-xl animate-pulse">Đang tải bản đồ định vị...</div>
});

const GOOGLE_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbzb-Rp5U5_DJymTK0PRCvxDMRIyGaMRZPpQrbCxU-zu4nMlXy8x6YS8Z2Dswfx88Jaeug/exec';
const CLOUDINARY_CLOUD_NAME = 'ds6k0kfbz'; 
const CLOUDINARY_UPLOAD_PRESET = 'tranhuyland';
const ADMIN_PASSWORD = '123';

const INITIAL_FORM_STATE = {
  id: '',
  tieude: '',
  gia: '',
  dienTich: '',
  soNha: '',
  duong: '', 
  khuVuc: '', 
  huong: '',
  loaiHinh: 'Nhà phố',
  anh: '', 
  anhSoDo: '', 
  linkMap: '', 
  toaDo: '',
  moTa: '', 
  tag: 'all',
  isMatTien: false,
  ngayDang: ''
};

export default function DangTinPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedImagesPreview, setSelectedImagesPreview] = useState<string[]>([]);
  
  const [uploadingSoDo, setUploadingSoDo] = useState(false);
  const [uploadProgressSoDo, setUploadProgressSoDo] = useState(0);
  const [soDoImagesPreview, setSoDoImagesPreview] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  const [isSearchingLoc, setIsSearchingLoc] = useState(false);
  const [mapMountKey, setMapMountKey] = useState(Date.now());

  useEffect(() => {
    if (localStorage.getItem('thl_admin_auth') === 'true') {
      setIsAuthenticated(true);
    }
    setIsCheckingAuth(false);
  }, []);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      localStorage.setItem('thl_admin_auth', 'true');
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Mật khẩu không chính xác!');
    }
  };

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn khóa trang đăng tin?")) {
      localStorage.removeItem('thl_admin_auth');
      setIsAuthenticated(false);
      setPasswordInput('');
    }
  };

  // 📸 CÁC HÀM ÚP ẢNH ĐÃ RÚT GỌN CHỈ CÒN VÀI DÒNG
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    selectedImagesPreview.forEach(url => URL.revokeObjectURL(url)); 
    uploadImagesCloudinary({
      files: e.target.files,
      cloudName: CLOUDINARY_CLOUD_NAME,
      uploadPreset: CLOUDINARY_UPLOAD_PRESET,
      onStart: () => { setUploading(true); setUploadProgress(0); setMessage({type:'', content:''}); },
      onProgress: (p) => setUploadProgress(p),
      onSuccess: (secureUrls, previewUrls) => {
        setSelectedImagesPreview(previewUrls);
        setFormData(prev => ({ ...prev, anh: secureUrls.join(', ') }));
        setMessage({ type: 'success', content: `📸 Đã tải thành công ${secureUrls.length} ảnh thực tế!` });
        setUploading(false);
      },
      onError: (err) => { setMessage({ type: 'error', content: err }); setUploading(false); }
    });
  };

  const handleSoDoChange = (e: ChangeEvent<HTMLInputElement>) => {
    soDoImagesPreview.forEach(url => URL.revokeObjectURL(url)); 
    uploadImagesCloudinary({
      files: e.target.files,
      cloudName: CLOUDINARY_CLOUD_NAME,
      uploadPreset: CLOUDINARY_UPLOAD_PRESET,
      onStart: () => { setUploadingSoDo(true); setUploadProgressSoDo(0); setMessage({type:'', content:''}); },
      onProgress: (p) => setUploadProgressSoDo(p),
      onSuccess: (secureUrls, previewUrls) => {
        setSoDoImagesPreview(previewUrls);
        setFormData(prev => ({ ...prev, anhSoDo: secureUrls.join(', ') }));
        setMessage({ type: 'success', content: `📑 Đã tải thành công ${secureUrls.length} ảnh sổ đỏ!` });
        setUploadingSoDo(false);
      },
      onError: (err) => { setMessage({ type: 'error', content: err }); setUploadingSoDo(false); }
    });
  };

  // 🤖 XỬ LÝ QUÉT VĂN BẢN (Gọi 1 dòng duy nhất từ Helper)
  const handleAutoScanDescription = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const scanResult = autoParseRealEstateText(e.target.value, formData.linkMap);
    setFormData(prev => ({ ...prev, ...scanResult }));
  };

  // 🔥 TỰ ĐỘNG GỌT GIÁ KHI GÕ TAY XONG (Click chuột ra ngoài)
  const handlePriceBlur = () => {
    setFormData(prev => ({ ...prev, gia: formatCleanPrice(prev.gia) }));
  };

  const handleSoNhaChange = (e: ChangeEvent<HTMLInputElement>) => {
    const soNha = e.target.value;
    setFormData(prev => ({ ...prev, soNha, linkMap: generateMapLink(soNha, prev.duong, prev.khuVuc, prev.linkMap) }));
  };

  const handleDuongChange = (e: ChangeEvent<HTMLInputElement>) => {
    const duong = e.target.value;
    setFormData(prev => ({ ...prev, duong, linkMap: generateMapLink(prev.soNha, duong, prev.khuVuc, prev.linkMap) }));
  };

  const handleKhuVucChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const khuVuc = e.target.value;
    setFormData(prev => ({ ...prev, khuVuc, linkMap: generateMapLink(prev.soNha, prev.duong, khuVuc, prev.linkMap) }));

    if (!khuVuc) return;
    setIsSearchingLoc(true);
    try {
      const query = formData.duong ? `${formData.duong}, ${khuVuc}, Đà Nẵng` : `${khuVuc}, Đà Nẵng`;
      let res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
      let data = await res.json();
      
      if (!data || data.length === 0) {
        res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(khuVuc + ', Đà Nẵng')}&limit=1`);
        data = await res.json();
      }

      if (data && data.length > 0) {
        setFormData(prev => ({ ...prev, toaDo: `${parseFloat(data[0].lat).toFixed(6)}, ${parseFloat(data[0].lon).toFixed(6)}` }));
        setMapMountKey(Date.now());
      }
    } catch (err) {} finally { setIsSearchingLoc(false); }
  };

  const handleSearchLocation = async () => {
    if (!formData.duong) return alert("⚠️ Vui lòng nhập Tên Đường trước khi bấm dò tìm!");
    setIsSearchingLoc(true);
    try {
      const query = `${formData.soNha ? formData.soNha + ' ' : ''}${formData.duong}, ${formData.khuVuc ? formData.khuVuc + ', ' : ''}Đà Nẵng`;
      let res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
      let data = await res.json();
      
      if (!data || data.length === 0) {
        res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.duong + ', Đà Nẵng')}&limit=1`);
        data = await res.json();
      }

      if (data && data.length > 0) {
        setFormData(prev => ({ ...prev, toaDo: `${parseFloat(data[0].lat).toFixed(6)}, ${parseFloat(data[0].lon).toFixed(6)}` }));
        setMapMountKey(Date.now()); 
      } else alert("❌ Vệ tinh không tự dò ra đường này. Anh/chị vui lòng kéo ghim thủ công nhé!");
    } catch (err) {} finally { setIsSearchingLoc(false); }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const showError = (msg: string) => { setMessage({ type: 'error', content: msg }); window.scrollTo({ top: 0, behavior: 'smooth' }); };

    if (uploading || uploadingSoDo) return showError('⏳ Vui lòng đợi hình ảnh tải lên hoàn tất trước khi đăng tin!');

    const now = Date.now();
    const lastSubmit = localStorage.getItem('lastSubmitTHL');
    if (lastSubmit && now - parseInt(lastSubmit) < 15000) return showError('🚨 Vui lòng đợi 15 giây giữa 2 lần đăng tin.');

    const tieudeClean = formData.tieude.trim();
    const moTaClean = formData.moTa.trim();
    const giaClean = formData.gia.trim();
    const dienTichClean = formData.dienTich.trim();

    if (moTaClean.length < 20) return showError('❌ Mô tả quá ngắn (ít nhất 20 ký tự).');
    if (tieudeClean.length < 10) return showError('❌ Tiêu đề phải có ít nhất 10 ký tự.');
    if (!giaClean || !dienTichClean || !formData.khuVuc) return showError('❌ Vui lòng điền đủ Giá, Diện tích và Phường.');

    setLoading(true);
    setMessage({ type: '', content: '' });

    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

    // 🛡️ Bọc gọt giá lần cuối trước khi đẩy lên Google Sheet
    const payload = {
      ...formData,
      tieude: tieudeClean, 
      moTa: moTaClean,
      gia: formatCleanPrice(giaClean), 
      dienTich: dienTichClean,
      id: Date.now().toString(),
      ngayDang: formattedDate,
      isMatTien: formData.isMatTien || tieudeClean.toLowerCase().includes('mặt tiền')
    };

    try {
      await fetch(GOOGLE_WEBAPP_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      localStorage.setItem('lastSubmitTHL', Date.now().toString());
      setMessage({ type: 'success', content: '🎉 Đăng tin lên Google Sheet thành công!' });
      window.scrollTo({ top: 0, behavior: 'smooth' }); 
      
      setFormData(INITIAL_FORM_STATE);
      setSelectedImagesPreview([]);
      setSoDoImagesPreview([]);
      setMapMountKey(Date.now()); 
    } catch (error) { showError('❌ Lỗi kết nối đồng bộ Web App.'); } finally { setLoading(false); }
  };

  if (isCheckingAuth) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 font-bold">Đang kiểm tra quyền...</div>;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-100 shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🔒</div>
          <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase">Khu vực bảo mật</h2>
          <p className="text-sm font-bold text-slate-500 mb-8">Vui lòng nhập mật khẩu nội bộ.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Nhập mật khẩu..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center text-[16px] font-bold focus:outline-none focus:border-amber-500 text-slate-700" />
            {authError && <p className="text-rose-500 text-xs font-bold">{authError}</p>}
            <button type="submit" className="w-full bg-amber-500 text-slate-900 font-bold text-[16px] uppercase py-4 rounded-xl shadow-md hover:bg-amber-400 transition-colors">Mở khóa</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-xl p-6 sm:p-8">
        <div className="text-center mb-8 relative">
          <button onClick={handleLogout} className="absolute right-0 top-0 text-[10px] font-bold bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-100 uppercase border border-rose-100">🔒 Đăng xuất</button>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">Úp Tin Bất Động Sản Hệ Thống</h1>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Trần Huy Land CMS</p>
        </div>

        {message.content && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-bold text-center ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>{message.content}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-amber-600 uppercase mb-2 ml-1">Mô tả chi tiết (Dán vào đây để tự động quét)</label>
            <textarea required rows={5} value={formData.moTa} onChange={handleAutoScanDescription} placeholder="Dán thông tin tại đây..." className="w-full bg-amber-50/50 border border-amber-200 rounded-xl px-4 py-3 text-[16px] font-semibold focus:outline-none focus:border-amber-500 text-slate-700 whitespace-pre-line shadow-inner" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Tiêu đề tin</label>
            <input required type="text" value={formData.tieude} onChange={(e) => setFormData({ ...formData, tieude: e.target.value })} placeholder="Ví dụ: Bán nhà mặt tiền..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[16px] font-semibold focus:outline-none focus:border-amber-500 text-slate-700" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Giá bán (Tự gọt số 0 thừa)</label>
              {/* 🔥 Gắn onBlur để gõ tay "5,900 tỷ" xong bấm chuột ra ngoài tự nhảy thành "5,9 tỷ" */}
              <input required type="text" value={formData.gia} onBlur={handlePriceBlur} onChange={(e) => setFormData({ ...formData, gia: e.target.value })} placeholder="Ví dụ: 4,35 tỷ" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[16px] font-semibold focus:outline-none focus:border-amber-500 text-slate-700 font-mono text-amber-700" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Diện tích</label>
              <input required type="text" value={formData.dienTich} onChange={(e) => setFormData({ ...formData, dienTich: e.target.value })} placeholder="Ví dụ: 100 m2" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[16px] font-semibold focus:outline-none focus:border-amber-500 text-slate-700" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Phường / Xã</label>
              <select required value={formData.khuVuc} onChange={handleKhuVucChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-[16px] font-semibold focus:outline-none focus:border-amber-500 text-slate-700">
                <option value="">-- Chọn Vị Trí --</option>
                <option disabled className="font-bold text-slate-400 bg-slate-100">-- Phường --</option>
                <option value="Hải Châu">Hải Châu</option><option value="Hòa Cường">Hòa Cường</option><option value="Thanh Khê">Thanh Khê</option><option value="An Khê">An Khê</option><option value="An Hải">An Hải</option><option value="Sơn Trà">Sơn Trà</option><option value="Ngũ Hành Sơn">Ngũ Hành Sơn</option><option value="Hòa Khánh">Hòa Khánh</option><option value="Hải Vân">Hải Vân</option><option value="Liên Chiểu">Liên Chiểu</option><option value="Cẩm Lệ">Cẩm Lệ</option><option value="Hòa Xuân">Hòa Xuân</option><option value="Hòa Vang">Hòa Vang</option><option value="Bà Nà">Bà Nà</option><option value="Hòa Tiến">Hòa Tiến</option><option value="Hòa Phước">Hòa Phước</option>
                <option disabled className="font-bold text-slate-400 bg-slate-100">-- Xã --</option>
                <option value="Hòa Bắc">Hòa Bắc</option><option value="Hòa Liên">Hòa Liên</option><option value="Hòa Ninh">Hòa Ninh</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Hướng</label>
              <select value={formData.huong} onChange={(e) => setFormData({ ...formData, huong: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-[16px] font-semibold focus:outline-none focus:border-amber-500 text-slate-700">
                <option value="">-- Để trống hoặc Chọn --</option>
                <option value="Đông">Đông</option><option value="Tây">Tây</option><option value="Nam">Nam</option><option value="Bắc">Bắc</option><option value="Đông Nam">Đông Nam</option><option value="Đông Bắc">Đông Bắc</option><option value="Tây Nam">Tây Nam</option><option value="Tây Bắc">Tây Bắc</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Số Nhà</label><input type="text" value={formData.soNha} onChange={handleSoNhaChange} placeholder="Ví dụ: K54/2" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[16px] font-semibold focus:outline-none focus:border-amber-500 text-slate-700" /></div>
            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Tên Đường</label><input type="text" value={formData.duong} onChange={handleDuongChange} placeholder="Ví dụ: Ông Ích Khiêm" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[16px] font-semibold focus:outline-none focus:border-amber-500 text-slate-700" /></div>
          </div>

          <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Link Google Maps</label><input type="text" value={formData.linkMap} onChange={(e) => setFormData({ ...formData, linkMap: e.target.value })} placeholder="Tự tạo link khi có Tên Đường..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[16px] font-semibold text-blue-600" /></div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <div className="flex justify-between items-end mb-3">
              <label className="block text-xs font-bold text-slate-700 uppercase ml-1">📍 Định vị Tọa độ</label>
              <button type="button" onClick={handleSearchLocation} disabled={isSearchingLoc} className="text-[11px] bg-blue-100 text-blue-700 hover:bg-blue-200 font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm">{isSearchingLoc ? '⏳ Đang dò...' : '🔍 Dò Tên Đường'}</button>
            </div>
            <div className="h-[350px] w-full rounded-2xl overflow-hidden border border-slate-300 shadow-inner mb-3 relative z-0">
              <LocationPickerMap key={mapMountKey} toaDo={formData.toaDo} onLocationSelect={(pos) => setFormData({ ...formData, toaDo: `${pos[0].toFixed(6)}, ${pos[1].toFixed(6)}` })} />
            </div>
            <input type="text" value={formData.toaDo} onChange={(e) => setFormData({ ...formData, toaDo: e.target.value })} placeholder="Tọa độ ghim..." className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-[16px] font-semibold text-emerald-700 text-center" />
          </div>

          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-5 text-center">
            <label className="block text-xs font-black text-slate-700 uppercase mb-2 cursor-pointer">{uploading ? `📸 Đang tải: ${uploadProgress}%` : '📸 Bấm chọn loạt ảnh thực tế'}<input type="file" multiple accept="image/*" disabled={uploading} onChange={handleImageChange} className="hidden" /></label>
            {uploading && <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2"><div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div></div>}
            {selectedImagesPreview.length > 0 && <div className="grid grid-cols-4 gap-2 mt-4">{selectedImagesPreview.map((url, idx) => (<div key={idx} className="relative aspect-square rounded-lg overflow-hidden border bg-white"><img src={url} alt="preview" className="w-full h-full object-cover" /></div>))}</div>}
          </div>

          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-5 text-center">
            <label className="block text-xs font-black text-slate-700 uppercase mb-2 cursor-pointer">{uploadingSoDo ? `📑 Đang tải: ${uploadProgressSoDo}%` : '📑 Bấm chọn ảnh Sổ đỏ (Tùy chọn)'}<input type="file" multiple accept="image/*" disabled={uploadingSoDo} onChange={handleSoDoChange} className="hidden" /></label>
            {uploadingSoDo && <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2"><div className="bg-amber-600 h-full transition-all duration-300" style={{ width: `${uploadProgressSoDo}%` }}></div></div>}
            {soDoImagesPreview.length > 0 && <div className="grid grid-cols-4 gap-2 mt-4">{soDoImagesPreview.map((url, idx) => (<div key={idx} className="relative aspect-square rounded-lg overflow-hidden border bg-white"><img src={url} alt="sodo" className="w-full h-full object-cover" /></div>))}</div>}
          </div>

          <div className="flex items-center gap-2 pt-2"><input type="checkbox" id="isMatTien" checked={formData.isMatTien} onChange={(e) => setFormData({ ...formData, isMatTien: e.target.checked })} className="w-4 h-4 text-amber-500 border-slate-300 rounded" /><label htmlFor="isMatTien" className="text-xs font-bold text-slate-600 uppercase cursor-pointer select-none">Là mặt tiền kinh doanh</label></div>

          <button type="submit" disabled={loading || uploading || uploadingSoDo} className="w-full bg-slate-900 text-white font-bold text-[16px] uppercase py-4 rounded-xl shadow-md hover:bg-slate-800 transition-colors disabled:bg-slate-400 mt-4">
            {loading ? 'Đang đẩy lên Google Sheet...' : (uploading || uploadingSoDo) ? '⏳ Đang tải ảnh lên Cloudinary...' : '🚀 Xác Nhận Đăng Tin Lên Hệ Thống'}
          </button>
        </form>
      </div>
    </div>
  );
}
