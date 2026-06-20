'use client';
import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import dynamic from 'next/dynamic';

// 🗺️ Tải Bản đồ động để tránh lỗi SSR của Next.js
const LocationPickerMap = dynamic(() => import('@/components/LocationPickerMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-500 rounded-xl animate-pulse">Đang tải bản đồ định vị...</div>
});

// 🚨 CẤU HÌNH THÔNG SỐ
const GOOGLE_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbzrb1ocMD9pZYe8JN14hSxhYG1KOHPb_ruX3hJtpUzKYn270qsKbjisU0Ea40DaGh3vww/exec';
const CLOUDINARY_CLOUD_NAME = 'ds6k0kfbz'; 
const CLOUDINARY_UPLOAD_PRESET = 'tranhuyland';

// 🔒 MẬT KHẨU TRUY CẬP TRANG ĐĂNG TIN
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
  // 🚨 STATE XÁC THỰC BẢO MẬT
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

  // 📡 Trạng thái cho tính năng Dò tìm Tên Đường
  const [isSearchingLoc, setIsSearchingLoc] = useState(false);
  const [mapMountKey, setMapMountKey] = useState(Date.now());

  // KIỂM TRA MẬT KHẨU ĐÃ LƯU KHI MỞ TRANG
  useEffect(() => {
    const auth = localStorage.getItem('thl_admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
    setIsCheckingAuth(false);
  }, []);

  // HÀM XỬ LÝ ĐĂNG NHẬP
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

  // HÀM XỬ LÝ ĐĂNG XUẤT
  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn khóa trang đăng tin?")) {
      localStorage.removeItem('thl_admin_auth');
      setIsAuthenticated(false);
      setPasswordInput('');
    }
  };

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

  const updateMapLink = (soNha: string, duong: string, phuong: string, currentLink: string) => {
    if (currentLink && !currentLink.includes('maps.google.com/?q=')) {
      return currentLink;
    }
    if (duong && phuong) {
      const query = soNha ? `${soNha} ${duong}, ${phuong}, Đà Nẵng` : `${duong}, ${phuong}, Đà Nẵng`;
      return `https://maps.google.com/?q=$${encodeURIComponent(query)}`;
    }
    return currentLink;
  };

  const handleAutoScanDescription = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    let newFormData = { ...formData, moTa: text };

    const priceMatch2 = text.match(/(\d+)\s*tỷ\s*(\d+)/i);
    const priceMatch1 = text.match(/(\d+)(?:\s*[.,]\s*([\dxX]+))?\s*(tỷ|triệu)/i); 
    
    if (priceMatch2) {
      newFormData.gia = `${priceMatch2[1]},${priceMatch2[2]} tỷ`;
    } else if (priceMatch1) {
      let num1 = priceMatch1[1];
      let num2 = priceMatch1[2];
      let unit = priceMatch1[3].toLowerCase();
      newFormData.gia = num2 ? `${num1},${num2.toLowerCase()} ${unit}` : `${num1} ${unit}`;
    }

    const areaMatch = text.match(/(\d+)(?:\s*[.,]\s*(\d+))?\s*(?:m2|m²)/i);
    if (areaMatch) {
      let num1 = areaMatch[1];
      let num2 = areaMatch[2];
      newFormData.dienTich = num2 ? `${num1},${num2} m2` : `${num1} m2`;
    }

    const wards = ['Hải Châu', 'Hòa Cường', 'Thanh Khê', 'An Khê', 'An Hải', 'Sơn Trà', 'Ngũ Hành Sơn', 'Hòa Khánh', 'Hải Vân', 'Liên Chiểu', 'Cẩm Lệ', 'Hòa Xuân', 'Hòa Vang', 'Bà Nà', 'Hòa Tiến', 'Hòa Phước', 'Hòa Bắc', 'Hòa Liên', 'Hòa Ninh'];
    const normalizeVN = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const normalizedText = normalizeVN(text);

    const foundWard = wards.find(w => normalizedText.includes(normalizeVN(w)));
    if (foundWard) {
      newFormData.khuVuc = foundWard;
    }

    const streetMatch = text.match(/(k|kiệt|mt|mặt tiền|đường)\s*(\d+[\d\/a-zA-Z]*)?\s+([^,\n\-]+?)(?=\s+phường|\s+quận|,|-|\n|$)/i);
    if (streetMatch) {
      const prefix = streetMatch[1].toLowerCase(); 
      const num = streetMatch[2]; 
      const streetName = streetMatch[3].trim(); 

      newFormData.duong = streetName;
      newFormData.soNha = num ? num.trim() : '';
      if (prefix === 'mt' || prefix === 'mặt tiền') {
        newFormData.isMatTien = true; 
      }
    }

    const directions = ['Đông Nam', 'Đông Bắc', 'Tây Nam', 'Tây Bắc', 'Đông', 'Tây', 'Nam', 'Bắc'];
    const cleanTextForDir = text.replace(/[*_()]/g, ' '); 
    const directionMatch = cleanTextForDir.match(/hướng.*?(đông\s*nam|đông\s*bắc|tây\s*nam|tây\s*bắc|đông|tây|nam|bắc)/i);
    
    if (directionMatch) {
      const cleanMatchedDir = directionMatch[1].replace(/\s+/g, ' ').trim().toLowerCase();
      const dir = directions.find(d => d.toLowerCase() === cleanMatchedDir);
      if (dir) newFormData.huong = dir;
    }

    newFormData.linkMap = updateMapLink(newFormData.soNha, newFormData.duong, newFormData.khuVuc, newFormData.linkMap);
    setFormData(newFormData);
  };

  const handleSoNhaChange = (e: ChangeEvent<HTMLInputElement>) => {
    const soNha = e.target.value;
    setFormData(prev => ({ ...prev, soNha, linkMap: updateMapLink(soNha, prev.duong, prev.khuVuc, prev.linkMap) }));
  };

  const handleDuongChange = (e: ChangeEvent<HTMLInputElement>) => {
    const duong = e.target.value;
    setFormData(prev => ({ ...prev, duong, linkMap: updateMapLink(prev.soNha, duong, prev.khuVuc, prev.linkMap) }));
  };

  const handleKhuVucChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const khuVuc = e.target.value;
    setFormData(prev => ({ ...prev, khuVuc, linkMap: updateMapLink(prev.soNha, prev.duong, khuVuc, prev.linkMap) }));

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
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setFormData(prev => ({ ...prev, toaDo: `${lat.toFixed(6)}, ${lon.toFixed(6)}` }));
        setMapMountKey(Date.now());
      }
    } catch (err) {
      console.error("Lỗi tự động dò phường:", err);
    } finally {
      setIsSearchingLoc(false);
    }
  };

  const handleSearchLocation = async () => {
    if (!formData.duong) {
      alert("⚠️ Vui lòng nhập Tên Đường trước khi bấm dò tìm!");
      return;
    }
    setIsSearchingLoc(true);
    try {
      const query = `${formData.soNha ? formData.soNha + ' ' : ''}${formData.duong}, ${formData.khuVuc ? formData.khuVuc + ', ' : ''}Đà Nẵng`;
      let res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
      let data = await res.json();
      
      if (!data || data.length === 0) {
        const fallbackQuery = `${formData.duong}, ${formData.khuVuc ? formData.khuVuc + ', ' : ''}Đà Nẵng`;
        res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fallbackQuery)}&limit=1`);
        data = await res.json();
      }

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setFormData(prev => ({ ...prev, toaDo: `${lat.toFixed(6)}, ${lon.toFixed(6)}` }));
        setMapMountKey(Date.now()); 
      } else {
        alert("❌ Bản đồ vệ tinh không tự dò ra đường này. Nó đã bay về trung tâm Phường, anh/chị vui lòng kéo ghim thủ công nhé!");
      }
    } catch (err) {
      alert("❌ Lỗi kết nối đến máy chủ bản đồ.");
    } finally {
      setIsSearchingLoc(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const showError = (msg: string) => {
      setMessage({ type: 'error', content: msg });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (uploading || uploadingSoDo) {
      showError('⏳ Vui lòng đợi toàn bộ hình ảnh tải lên hoàn tất trước khi đăng tin!');
      return;
    }

    const now = Date.now();
    const lastSubmit = localStorage.getItem('lastSubmitTimeTranHuyLand');
    if (lastSubmit && now - parseInt(lastSubmit) < 15000) {
      showError('🚨 Thao tác quá nhanh! Vui lòng đợi 15 giây trước khi đăng tin tiếp theo.');
      return;
    }

    const tieudeClean = formData.tieude.trim();
    const moTaClean = formData.moTa.trim();
    const giaClean = formData.gia.trim();
    const dienTichClean = formData.dienTich.trim();
    const khuVucClean = formData.khuVuc.trim();

    if (moTaClean.length < 20) {
      showError('❌ Mô tả quá ngắn. Vui lòng nhập chi tiết hơn (ít nhất 20 ký tự).');
      return;
    }
    if (tieudeClean.length < 10) {
      showError('❌ Tiêu đề tin đăng phải có ít nhất 10 ký tự.');
      return;
    }
    if (!giaClean || !dienTichClean || !khuVucClean) {
      showError('❌ Vui lòng điền đầy đủ các trường bắt buộc (Giá, Diện tích, Phường/Xã).');
      return;
    }

    const spamPattern = /([a-zA-Z0-9])\1{6,}/; 
    if (spamPattern.test(tieudeClean) || spamPattern.test(moTaClean)) {
      showError('🤖 Hệ thống phát hiện nội dung Spam (nhập trùng ký tự liên tục). Vui lòng nhập tiếng Việt hợp lệ!');
      return;
    }

    setLoading(true);
    setMessage({ type: '', content: '' });

    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

    const payload = {
      ...formData,
      tieude: tieudeClean, 
      moTa: moTaClean,
      gia: giaClean,
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

      localStorage.setItem('lastSubmitTimeTranHuyLand', Date.now().toString());

      setMessage({ type: 'success', content: '🎉 Thêm sản phẩm bất động sản đồng bộ lên Google Sheet thành công!' });
      window.scrollTo({ top: 0, behavior: 'smooth' }); 
      
      setFormData(INITIAL_FORM_STATE);
      setSelectedImagesPreview([]);
      setSoDoImagesPreview([]);
      setMapMountKey(Date.now()); 
    } catch (error) {
      showError('❌ Lỗi kết nối đồng bộ. Vui lòng kiểm tra lại link Web App.');
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingAuth) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 font-bold">Đang kiểm tra quyền truy cập...</div>;
  }

  // 🔒 GIAO DIỆN KHÓA BẢO VỆ NẾU CHƯA NHẬP MẬT KHẨU
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-100 shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
            🔒
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase">Khu vực bảo mật</h2>
          <p className="text-sm font-bold text-slate-500 mb-8">Vui lòng nhập mật khẩu để truy cập trang Đăng tin nội bộ.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Nhập mật khẩu..." 
              // Đã đổi text-sm thành text-[16px] để chống zoom trên iPhone
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center text-[16px] font-bold focus:outline-none focus:border-amber-500 text-slate-700"
            />
            {authError && <p className="text-rose-500 text-xs font-bold">{authError}</p>}
            
            <button type="submit" className="w-full bg-amber-500 text-slate-900 font-bold text-[16px] uppercase py-4 rounded-xl shadow-md hover:bg-amber-400 transition-colors">
              Mở khóa hệ thống
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 🔓 GIAO DIỆN CHÍNH SAU KHI ĐÃ ĐĂNG NHẬP THÀNH CÔNG
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-xl p-6 sm:p-8">
        
        <div className="text-center mb-8 relative">
          <button 
            onClick={handleLogout}
            className="absolute right-0 top-0 text-[10px] font-bold bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-100 transition-colors uppercase border border-rose-100"
          >
            🔒 Đăng xuất
          </button>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">Úp Tin Bất Động Sản Hệ Thống</h1>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Hệ thống tự động hóa Trần Huy Land</p>
        </div>

        {message.content && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-bold text-center ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
            {message.content}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 text-amber-600">Mô tả chi tiết (Dán vào đây để tự động quét thông tin)</label>
            <textarea required rows={5} value={formData.moTa} onChange={handleAutoScanDescription} placeholder="Dán thông tin mô tả chi tiết tại đây. Hệ thống sẽ tự động tìm Giá, Diện tích, Số Nhà, Tên Đường, Vị trí..." className="w-full bg-amber-50/50 border border-amber-200 rounded-xl px-4 py-3 text-[16px] font-semibold focus:outline-none focus:border-amber-500 text-slate-700 whitespace-pre-line shadow-inner" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Tiêu đề tin đăng</label>
            <input required type="text" value={formData.tieude} onChange={(e) => setFormData({ ...formData, tieude: e.target.value })} placeholder="Ví dụ: Bán nhà mặt tiền Nguyễn Sinh Sắc..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[16px] font-semibold focus:outline-none focus:border-amber-500 text-slate-700" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Giá bán hiển thị</label>
              <input required type="text" value={formData.gia} onChange={(e) => setFormData({ ...formData, gia: e.target.value })} placeholder="Ví dụ: 4,35 tỷ" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[16px] font-semibold focus:outline-none focus:border-amber-500 text-slate-700" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Diện tích</label>
              <input required type="text" value={formData.dienTich} onChange={(e) => setFormData({ ...formData, dienTich: e.target.value })} placeholder="Ví dụ: 100 m2" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[16px] font-semibold focus:outline-none focus:border-amber-500 text-slate-700" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Phường / Xã vị trí</label>
              <select required value={formData.khuVuc} onChange={handleKhuVucChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-[16px] font-semibold focus:outline-none focus:border-amber-500 text-slate-700">
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
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Hướng bất động sản</label>
              <select value={formData.huong} onChange={(e) => setFormData({ ...formData, huong: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-[16px] font-semibold focus:outline-none focus:border-amber-500 text-slate-700">
                <option value="">-- Để trống hoặc Chọn --</option>
                <option value="Đông">Đông</option><option value="Tây">Tây</option><option value="Nam">Nam</option><option value="Bắc">Bắc</option>
                <option value="Đông Nam">Đông Nam</option><option value="Đông Bắc">Đông Bắc</option><option value="Tây Nam">Tây Nam</option><option value="Tây Bắc">Tây Bắc</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Số Nhà</label>
              <input type="text" value={formData.soNha} onChange={handleSoNhaChange} placeholder="Ví dụ: K54/2 hoặc 54" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[16px] font-semibold focus:outline-none focus:border-amber-500 text-slate-700" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Tên Đường</label>
              <input type="text" value={formData.duong} onChange={handleDuongChange} placeholder="Ví dụ: Ông Ích Khiêm" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[16px] font-semibold focus:outline-none focus:border-amber-500 text-slate-700" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Đường dẫn Google Maps</label>
            <input type="text" value={formData.linkMap} onChange={(e) => setFormData({ ...formData, linkMap: e.target.value })} placeholder="Hệ thống sẽ tự tạo link nếu có Tên Đường và Phường..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[16px] font-semibold focus:outline-none focus:border-amber-500 text-slate-700 text-blue-600" />
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <div className="flex justify-between items-end mb-3">
              <label className="block text-xs font-bold text-slate-700 uppercase ml-1">
                📍 Định vị Tọa độ <span className="text-orange-500">(Kéo thả ghim)</span>
              </label>
              <button 
                type="button" 
                onClick={handleSearchLocation} 
                disabled={isSearchingLoc}
                className="text-[11px] bg-blue-100 text-blue-700 hover:bg-blue-200 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all shadow-sm active:scale-95"
              >
                {isSearchingLoc ? '⏳ Đang dò...' : '🔍 Dò tìm Tên Đường'}
              </button>
            </div>
            
            <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-slate-300 shadow-inner mb-3 relative z-0">
              <LocationPickerMap 
                key={mapMountKey}
                toaDo={formData.toaDo} 
                onLocationSelect={(pos) => setFormData({ ...formData, toaDo: `${pos[0].toFixed(6)}, ${pos[1].toFixed(6)}` })} 
              />
            </div>

            <input 
              type="text" 
              value={formData.toaDo} 
              onChange={(e) => setFormData({ ...formData, toaDo: e.target.value })} 
              placeholder="16.054400, 108.202200 (Tự động điền khi ghim)" 
              className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-[16px] font-semibold focus:outline-none focus:border-emerald-500 text-emerald-700 text-center" 
            />
          </div>

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

          <button type="submit" disabled={loading || uploading || uploadingSoDo} className="w-full bg-slate-900 text-white font-bold text-[16px] uppercase py-4 rounded-xl shadow-md hover:bg-slate-800 transition-colors disabled:bg-slate-400 mt-4">
            {loading ? 'Đang gửi dữ liệu đồng bộ...' : (uploading || uploadingSoDo) ? '⏳ Đang tải ảnh lên Cloudinary...' : '🚀 Xác Nhận Đăng Tin Lên Hệ Thống'}
          </button>
        </form>
      </div>
    </div>
  );
}
