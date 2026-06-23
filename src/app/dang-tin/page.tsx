'use client';
import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import dynamic from 'next/dynamic';

// 🗺️ Tải Bản đồ động để tránh lỗi SSR của Next.js
const LocationPickerMap = dynamic(() => import('@/components/LocationPickerMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-500 rounded-xl animate-pulse">Đang tải bản đồ định vị...</div>
});

// 🚨 CẤU HÌNH THÔNG SỐ
const GOOGLE_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbxmcQMTv4d5OHnbfYFDBvJM6OOYmGsAnZxaSGg97XDPmqQ5HniqanL7YK7VPeVsaZabWw/exec';
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
  maNhungMap: '', 
  toaDo: '',
  moTa: '', 
  tag: 'all', 
  isMatTien: false,
  ngayDang: ''
};

export default function DangTinPage() {
  // 🚨 STATE XÁC THỰC
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

  // 📡 Trạng thái Bản đồ
  const [isSearchingLoc, setIsSearchingLoc] = useState(false);
  const [mapMountKey, setMapMountKey] = useState(Date.now());

  // TỰ ĐỘNG LƯU BẢN THẢO
  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = setTimeout(() => {
      if (formData.tieude.trim() || formData.moTa.trim()) {
        localStorage.setItem('thl_bds_draft_v2', JSON.stringify(formData));
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData, isAuthenticated]);

  useEffect(() => {
    const auth = localStorage.getItem('thl_admin_auth');
    if (auth === 'true') setIsAuthenticated(true);
    setIsCheckingAuth(false);
  }, []);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      localStorage.setItem('thl_admin_auth', 'true');
      setIsAuthenticated(true);
      setAuthError('');

      const savedDraft = localStorage.getItem('thl_bds_draft_v2');
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          if (parsed.tieude || parsed.moTa) {
            if (window.confirm('🚨 HỆ THỐNG PHÁT HIỆN BẢN THẢO NHÀ ĐẤT:\n\nAnh Huy có 1 tin nhà đất đang nhập dở trước đó chưa gửi. Anh có muốn khôi phục lại không?')) {
              setFormData(parsed);
            }
          }
        } catch(err) {}
      }
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

  // 📸 HÀM ÚP ẢNH CLOUDINARY
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
          let optimizedUrl = fileData.secure_url;
          
          if (optimizedUrl.includes("/image/upload/")) {
            if (formField === 'anhSoDo') {
              optimizedUrl = optimizedUrl.replace("/image/upload/", "/image/upload/f_auto,q_auto:best,w_1600/");
            } else {
              optimizedUrl = optimizedUrl.replace("/image/upload/", "/image/upload/f_auto,q_auto,w_1200/");
            }
          }
          uploadedUrls.push(optimizedUrl);
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
      'anh', `📸 Đã tải thành công ${e.target.files?.length} ảnh thực tế!`, '❌ Gặp lỗi khi úp ảnh thực tế.'
    );
  };

  const handleSoDoChange = (e: ChangeEvent<HTMLInputElement>) => {
    soDoImagesPreview.forEach(url => URL.revokeObjectURL(url)); 
    uploadImagesToCloudinary(
      e.target.files, setUploadingSoDo, setUploadProgressSoDo, setSoDoImagesPreview,
      'anhSoDo', `📑 Đã tải nét chuẩn ${e.target.files?.length} ảnh Sổ đỏ!`, '❌ Gặp lỗi khi úp ảnh sổ đỏ.'
    );
  };

  const updateMapLink = (soNha: string, duong: string, phuong: string, currentLink: string) => {
    if (currentLink && !currentLink.includes('maps.google.com/?q=')) return currentLink;
    if (duong && phuong) {
      const query = soNha ? `${soNha} ${duong}, ${phuong}, Đà Nẵng` : `${duong}, ${phuong}, Đà Nẵng`;
      return `https://maps.google.com/?q=$${encodeURIComponent(query)}`;
    }
    return currentLink;
  };

  const updateMapEmbed = (soNha: string, duong: string, phuong: string, currentEmbed: string) => {
    if (currentEmbed && !currentEmbed.includes('output=embed')) return currentEmbed;
    if (duong && phuong) {
      const query = soNha ? `${soNha} ${duong}, ${phuong}, Đà Nẵng` : `${duong}, ${phuong}, Đà Nẵng`;
      const safeEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
      return `<iframe src="${safeEmbedUrl}" width="100%" height="350" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
    }
    return currentEmbed;
  };

  // 💡 ĐÃ KHÔI PHỤC HÀM XỬ LÝ SỐ NHÀ CHUẨN ĐÉT
  const handleSoNhaChange = (e: ChangeEvent<HTMLInputElement>) => {
    const soNha = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      soNha, 
      linkMap: updateMapLink(soNha, prev.duong, prev.khuVuc, prev.linkMap),
      maNhungMap: updateMapEmbed(soNha, prev.duong, prev.khuVuc, prev.maNhungMap)
    }));
  };

  // 💡 ĐÃ KHÔI PHỤC HÀM XỬ LÝ TÊN ĐƯỜNG CHUẨN ĐÉT
  const handleDuongChange = (e: ChangeEvent<HTMLInputElement>) => {
    const duong = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      duong, 
      linkMap: updateMapLink(prev.soNha, duong, prev.khuVuc, prev.linkMap),
      maNhungMap: updateMapEmbed(prev.soNha, duong, prev.khuVuc, prev.maNhungMap)
    }));
  };

  // 🤖 HÀM QUÉT MÔ TẢ TỔNG LỰC
  const handleAutoScanDescription = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    let newFormData = { ...formData, moTa: text };

    const priceMatch2 = text.match(/(\d+)\s*tỷ\s*(\d+)/i);
    const priceMatch1 = text.match(/(\d+)(?:\s*[.,]\s*([\dxX]+))?\s*(tỷ|triệu)/i); 
    if (priceMatch2) {
      newFormData.gia = `${priceMatch2[1]},${priceMatch2[2]} tỷ`;
    } else if (priceMatch1) {
      newFormData.gia = priceMatch1[2] ? `${priceMatch1[1]},${priceMatch1[2].toLowerCase()} ${priceMatch1[3].toLowerCase()}` : `${priceMatch1[1]} ${priceMatch1[3].toLowerCase()}`;
    }

    const areaMatch = text.match(/(\d+)(?:\s*[.,]\s*(\d+))?\s*(?:m2|m²)/i);
    if (areaMatch) {
      newFormData.dienTich = areaMatch[2] ? `${areaMatch[1]},${areaMatch[2]} m2` : `${areaMatch[1]} m2`;
    }

    const wards = ['Hải Châu', 'Hòa Cường', 'Thanh Khê', 'An Khê', 'An Hải', 'Sơn Trà', 'Ngũ Hành Sơn', 'Hòa Khánh', 'Hải Vân', 'Liên Chiểu', 'Cẩm Lệ', 'Hòa Xuân', 'Hòa Vang', 'Bà Nà', 'Hòa Tiến', 'Hòa Phước', 'Hòa Bắc', 'Hòa Liên', 'Hòa Ninh'];
    const normalizeVN = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const foundWard = wards.find(w => normalizeVN(text).includes(normalizeVN(w)));
    if (foundWard) newFormData.khuVuc = foundWard;

    const streetMatch = text.match(/(k|kiệt|mt|mặt tiền|đường)\s*(\d+[\d\/a-zA-Z]*)?\s+([^,\.\;\:\(\)\[\]\{\}\+\*\_\-\–\—\n]+?)(?=\s+phường|\s+quận|[,;\:\.\(\)\[\]\{\}\+\*\_\-\–\—]|\n|$)/i);
    if (streetMatch) {
      const prefix = streetMatch[1].toLowerCase(); 
      newFormData.duong = streetMatch[3].replace(/^(?:đường|duong)\s+/i, '').replace(/^[,;\:\.\*\-\–\—\s]+/, '').split(/[,;\:\.\(\)\[\]\{\}\+\*\_\-\–\—\|]/)[0].trim();
      newFormData.soNha = streetMatch[2] ? streetMatch[2].trim() : '';
      if (prefix === 'mt' || prefix === 'mặt tiền') newFormData.isMatTien = true; 
    }

    const directions = ['Đông Nam', 'Đông Bắc', 'Tây Nam', 'Tây Bắc', 'Đông', 'Tây', 'Nam', 'Bắc'];
    const cleanTextForDir = text.replace(/[*_()]/g, ' '); 
    const directionMatch = cleanTextForDir.match(/hướng.*?(đông\s*nam|đông\s*bắc|tây\s*nam|tây\s*bắc|đông|tây|nam|bắc)/i);
    if (directionMatch) {
      const dir = directions.find(d => d.toLowerCase() === directionMatch[1].replace(/\s+/g, ' ').trim().toLowerCase());
      if (dir) newFormData.huong = dir;
    }

    const txtLower = text.toLowerCase();
    if (txtLower.includes('chính chủ') || txtLower.includes('chinh chu')) {
      newFormData.tag = 'Hàng Chính Chủ';
    } else if (txtLower.includes('kinh doanh') || txtLower.includes('mặt tiền') || txtLower.includes('dòng tiền')) {
      newFormData.tag = 'Mặt Tiền Kinh Doanh';
    } else if (txtLower.includes('cho thuê') || txtLower.includes('thuê')) {
      newFormData.tag = 'Nhà Cho Thuê';
    }

    newFormData.linkMap = updateMapLink(newFormData.soNha, newFormData.duong, newFormData.khuVuc, newFormData.linkMap);
    newFormData.maNhungMap = updateMapEmbed(newFormData.soNha, newFormData.duong, newFormData.khuVuc, newFormData.maNhungMap);
    setFormData(newFormData);
  };

  const handleFormatNumberBlur = (field: 'gia' | 'dienTich', suffix: string) => {
    let val = formData[field].trim();
    if (!val) return;
    if (/^\d+(?:[.,]\d+)?$/.test(val)) {
      val = val.replace('.', ',') + ' ' + suffix;
      setFormData(prev => ({ ...prev, [field]: val }));
    }
  };

  const handleKhuVucChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const khuVuc = e.target.value;
    setFormData(prev => ({ 
      ...prev, khuVuc, 
      linkMap: updateMapLink(prev.soNha, prev.duong, khuVuc, prev.linkMap),
      maNhungMap: updateMapEmbed(prev.soNha, prev.duong, khuVuc, prev.maNhungMap)
    }));
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
      } else alert("❌ Vệ tinh không tự dò ra hẻm/đường này. Anh/chị kéo ghim thủ công nhé!");
    } catch (err) {} finally { setIsSearchingLoc(false); }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const showError = (msg: string) => { setMessage({ type: 'error', content: msg }); window.scrollTo({ top: 0, behavior: 'smooth' }); };

    if (uploading || uploadingSoDo) return showError('⏳ Vui lòng đợi toàn bộ hình ảnh tải lên hoàn tất trước khi đăng tin!');
    const now = Date.now();
    const lastSubmit = localStorage.getItem('lastSubmitTimeTranHuyLand');
    if (lastSubmit && now - parseInt(lastSubmit) < 15000) return showError('🚨 Thao tác quá nhanh! Vui lòng đợi 15 giây.');

    const tieudeClean = formData.tieude.trim();
    const moTaClean = formData.moTa.trim();
    if (moTaClean.length < 20) return showError('❌ Mô tả quá ngắn (ít nhất 20 ký tự).');
    if (tieudeClean.length < 10) return showError('❌ Tiêu đề tin đăng phải có ít nhất 10 ký tự.');
    if (!formData.gia.trim() || !formData.dienTich.trim() || !formData.khuVuc) return showError('❌ Vui lòng điền đủ Giá, Diện tích, Phường/Xã.');

    const spamPattern = /([a-zA-Z0-9])\1{6,}/; 
    if (spamPattern.test(tieudeClean) || spamPattern.test(moTaClean)) return showError('🤖 Phát hiện Spam trùng ký tự liên tục!');

    setLoading(true);
    setMessage({ type: '', content: '' });

    const today = new Date();
    const payload = {
      ...formData,
      tieude: tieudeClean, moTa: moTaClean,
      id: Date.now().toString(),
      ngayDang: `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`,
      isMatTien: formData.isMatTien || tieudeClean.toLowerCase().includes('mặt tiền')
    };

    try {
      await fetch(GOOGLE_WEBAPP_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      localStorage.setItem('lastSubmitTimeTranHuyLand', Date.now().toString());
      localStorage.removeItem('thl_bds_draft_v2'); 

      setMessage({ type: 'success', content: '🎉 Đăng sản phẩm BĐS lên Google Sheet thành công!' });
      window.scrollTo({ top: 0, behavior: 'smooth' }); 
      setFormData(INITIAL_FORM_STATE); setSelectedImagesPreview([]); setSoDoImagesPreview([]); setMapMountKey(Date.now()); 
    } catch (error) { showError('❌ Lỗi kết nối Web App.'); } finally { setLoading(false); }
  };

  if (isCheckingAuth) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 font-bold">Đang kiểm tra quyền...</div>;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-100 shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🔒</div>
          <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase">Khu vực bảo mật</h2>
          <p className="text-sm font-bold text-slate-500 mb-8">Nhập mã pin để mở trang Đăng tin BĐS.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Mã bảo mật..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center text-[16px] font-bold focus:outline-none focus:border-amber-500 text-slate-700" autoFocus />
            {authError && <p className="text-rose-500 text-xs font-bold">{authError}</p>}
            <button type="submit" className="w-full bg-amber-500 text-slate-900 font-bold text-[16px] uppercase py-4 rounded-xl shadow-md hover:bg-amber-400">Mở khóa hệ thống</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-xl p-6 sm:p-8 relative">
        
        <button onClick={handleLogout} className="absolute right-6 top-6 text-[10px] font-bold bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-100 uppercase border border-rose-100">
          🔒 Đăng xuất
        </button>

        <div className="text-center mb-8">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">Úp Tin Bất Động Sản</h1>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Hệ thống Trần Huy Land CMS</p>
        </div>

        {message.content && <div className={`p-4 rounded-xl mb-6 text-sm font-bold text-center ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>{message.content}</div>}

        <form id="dang-tin-form" onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 text-amber-600">Mô tả chi tiết (Dán vào đây để máy tự bóc tách)</label>
            <textarea required rows={5} value={formData.moTa} onChange={handleAutoScanDescription} placeholder="Dán nội dung từ Zalo/FB vào đây..." className="w-full bg-amber-50/50 border border-amber-200 rounded-xl px-4 py-3 text-[16px] font-semibold focus:outline-none focus:border-amber-500 text-slate-700 whitespace-pre-line shadow-inner" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Tiêu đề tin đăng</label>
            <input required type="text" value={formData.tieude} onChange={(e) => setFormData({ ...formData, tieude: e.target.value })} placeholder="Ví dụ: Bán nhà mặt tiền Nguyễn Sinh Sắc..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[16px] font-semibold focus:outline-none focus:border-amber-500 text-slate-700" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Giá bán <span className="text-[10px] text-slate-400 normal-case">(Gõ 4.5 tự ra tỷ)</span></label>
              <input required type="text" value={formData.gia} onBlur={() => handleFormatNumberBlur('gia', 'tỷ')} onChange={(e) => setFormData({ ...formData, gia: e.target.value })} placeholder="Ví dụ: 4,35 tỷ" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[16px] font-semibold focus:outline-none focus:border-amber-500 text-slate-700" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Diện tích <span className="text-[10px] text-slate-400 normal-case">(Gõ 100 tự ra m2)</span></label>
              <input required type="text" value={formData.dienTich} onBlur={() => handleFormatNumberBlur('dienTich', 'm2')} onChange={(e) => setFormData({ ...formData, dienTich: e.target.value })} placeholder="Ví dụ: 100 m2" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[16px] font-semibold focus:outline-none focus:border-amber-500 text-slate-700" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Phường / Xã</label>
              <select required value={formData.khuVuc} onChange={handleKhuVucChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-[16px] font-semibold focus:outline-none focus:border-amber-500 text-slate-700">
                <option value="">-- Chọn Phường --</option>
                <option value="Hải Châu">Hải Châu</option><option value="Hòa Cường">Hòa Cường</option><option value="Thanh Khê">Thanh Khê</option><option value="An Khê">An Khê</option><option value="An Hải">An Hải</option><option value="Sơn Trà">Sơn Trà</option><option value="Ngũ Hành Sơn">Ngũ Hành Sơn</option><option value="Hòa Khánh">Hòa Khánh</option><option value="Hải Vân">Hải Vân</option><option value="Liên Chiểu">Liên Chiểu</option><option value="Cẩm Lệ">Cẩm Lệ</option><option value="Hòa Xuân">Hòa Xuân</option><option value="Hòa Vang">Hòa Vang</option><option value="Bà Nà">Bà Nà</option><option value="Hòa Tiến">Hòa Tiến</option><option value="Hòa Phước">Hòa Phước</option><option value="Hòa Bắc">Hòa Bắc</option><option value="Hòa Liên">Hòa Liên</option><option value="Hòa Ninh">Hòa Ninh</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Hướng nhà</label>
              <select value={formData.huong} onChange={(e) => setFormData({ ...formData, huong: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-[16px] font-semibold focus:outline-none focus:border-amber-500 text-slate-700">
                <option value="">-- Chọn Hướng --</option>
                <option value="Đông">Đông</option><option value="Tây">Tây</option><option value="Nam">Nam</option><option value="Bắc">Bắc</option><option value="Đông Nam">Đông Nam</option><option value="Đông Bắc">Đông Bắc</option><option value="Tây Nam">Tây Nam</option><option value="Tây Bắc">Tây Bắc</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-amber-600 uppercase mb-2 ml-1">Nhãn Đặc Quyền</label>
              <select value={formData.tag} onChange={(e) => setFormData({ ...formData, tag: e.target.value })} className="w-full bg-amber-50 border border-amber-300 rounded-xl px-3 py-3 text-[16px] font-bold focus:outline-none focus:border-amber-500 text-amber-900">
                <option value="all">Tất cả phân nhóm</option>
                <option value="Mặt Tiền Kinh Doanh">🏢 Mặt Tiền Kinh Doanh</option>
                <option value="Hàng Chính Chủ">✓ Hàng Chính Chủ</option>
                <option value="Nhà Cho Thuê">🔑 Nhà Cho Thuê</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Số Nhà</label>
              <input type="text" value={formData.soNha} onChange={handleSoNhaChange} placeholder="Ví dụ: K54/2" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[16px] font-semibold focus:outline-none focus:border-amber-500 text-slate-700" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Tên Đường</label>
              <input type="text" value={formData.duong} onChange={handleDuongChange} placeholder="Ví dụ: Ông Ích Khiêm" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[16px] font-semibold focus:outline-none focus:border-amber-500 text-slate-700" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Đường dẫn Google Maps</label>
            <input type="text" value={formData.linkMap} onChange={(e) => setFormData({ ...formData, linkMap: e.target.value })} placeholder="Tự tạo link khi gõ Tên Đường + Phường..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[16px] font-semibold focus:outline-none focus:border-amber-500 text-blue-600" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Mã nhúng Google Maps (Iframe)</label>
            <textarea rows={2} value={formData.maNhungMap} onChange={(e) => setFormData({ ...formData, maNhungMap: e.target.value })} placeholder="<iframe src='...' > Tự tạo mã khi gõ Tên Đường + Phường..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-mono focus:outline-none focus:border-amber-500 text-slate-600" />
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <div className="flex justify-between items-end mb-3">
              <label className="block text-xs font-bold text-slate-700 uppercase ml-1">📍 Định vị Tọa độ <span className="text-orange-500">(Kéo thả ghim)</span></label>
              <button type="button" onClick={handleSearchLocation} disabled={isSearchingLoc} className="text-[11px] bg-blue-100 text-blue-700 hover:bg-blue-200 font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm active:scale-95">
                {isSearchingLoc ? '⏳ Đang dò...' : '🔍 Dò tìm Vệ tinh'}
              </button>
            </div>
            
            <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-slate-300 shadow-inner mb-3 relative z-0">
              <LocationPickerMap key={mapMountKey} toaDo={formData.toaDo} onLocationSelect={(pos) => setFormData({ ...formData, toaDo: `${pos[0].toFixed(6)}, ${pos[1].toFixed(6)}` })} />
            </div>
            <input type="text" value={formData.toaDo} onChange={(e) => setFormData({ ...formData, toaDo: e.target.value })} placeholder="Tọa độ tự điền khi kéo ghim" className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-[16px] font-semibold text-emerald-700 text-center" />
          </div>

          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-5 text-center">
            <label className="block text-xs font-black text-slate-700 uppercase mb-2 cursor-pointer">
              {uploading ? `📸 Đang tải ảnh thực tế: ${uploadProgress}%` : '📸 Bấm chọn loạt ảnh thực tế (Tự nén WebP)'}
              <input type="file" multiple accept="image/*" disabled={uploading} onChange={handleImageChange} className="hidden" />
            </label>
            {uploading && <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2"><div className="bg-amber-500 h-full transition-all" style={{ width: `${uploadProgress}%` }}></div></div>}
            {selectedImagesPreview.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-4">
                {selectedImagesPreview.map((url, i) => (<div key={i} className="aspect-square rounded-lg overflow-hidden border bg-white"><img src={url} alt="preview" className="w-full h-full object-cover" /></div>))}
              </div>
            )}
          </div>

          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-5 text-center">
            <label className="block text-xs font-black text-slate-700 uppercase mb-2 cursor-pointer">
              {uploadingSoDo ? `📑 Đang tải Sổ đỏ: ${uploadProgressSoDo}%` : '📑 Bấm chọn hình Sổ đỏ / Sơ đồ (Giữ nguyên độ nét)'}
              <input type="file" multiple accept="image/*" disabled={uploadingSoDo} onChange={handleSoDoChange} className="hidden" />
            </label>
            {uploadingSoDo && <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2"><div className="bg-amber-600 h-full transition-all" style={{ width: `${uploadProgressSoDo}%` }}></div></div>}
            {soDoImagesPreview.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-4">
                {soDoImagesPreview.map((url, i) => (<div key={i} className="aspect-square rounded-lg overflow-hidden border bg-white"><img src={url} alt="sodo" className="w-full h-full object-cover" /></div>))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" id="isMatTien" checked={formData.isMatTien} onChange={(e) => setFormData({ ...formData, isMatTien: e.target.checked })} className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500" />
            <label htmlFor="isMatTien" className="text-xs font-bold text-slate-600 uppercase cursor-pointer select-none">Bất động sản này là mặt tiền kinh doanh</label>
          </div>

          <button type="submit" disabled={loading || uploading || uploadingSoDo} className="w-full bg-slate-900 text-white font-bold text-[16px] uppercase py-4 rounded-xl shadow-md hover:bg-slate-800 transition-colors disabled:bg-slate-400 mt-4">
            {loading ? 'Đang gửi sang Sheet...' : (uploading || uploadingSoDo) ? '⏳ Đang xử lý ảnh...' : '🚀 Xác Nhận Đăng Tin BĐS'}
          </button>
        </form>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 p-3 px-4 sm:hidden flex items-center justify-between z-50 shadow-2xl">
        <div className="text-xs font-bold text-slate-700 truncate pr-2">
          {formData.tieude ? `🏠 ${formData.tieude}` : '✍️ Đang soạn tin...'}
        </div>
        <button 
          form="dang-tin-form"
          type="submit"
          disabled={loading || uploading || uploadingSoDo}
          className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-extrabold text-xs px-5 py-2.5 rounded-xl uppercase tracking-wider shadow-md shrink-0 disabled:bg-slate-300"
        >
          {loading ? 'Gửi...' : '🚀 Đăng Ngay'}
        </button>
      </div>

    </div>
  );
}
