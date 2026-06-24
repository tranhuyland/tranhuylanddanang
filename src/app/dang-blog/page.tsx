'use client';

import React, { useState, ChangeEvent, FormEvent, useEffect, useRef } from 'react';
import { Lock, FileText, Upload, Loader2, CheckCircle, AlertCircle, RefreshCw, Eye, Sparkles, ImageIcon, Quote, Heading2, Bold, ChevronDown } from 'lucide-react';

// ==========================================
// 🚨 CẤU HÌNH THÔNG SỐ TRẦN HUY LAND
// ==========================================
const GOOGLE_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbzb-Rp5U5_DJymTK0PRCvxDMRIyGaMRZPpQrbCxU-zu4nMlXy8x6YS8Z2Dswfx88Jaeug/exec';
const CLOUDINARY_CLOUD_NAME = 'ds6k0kfbz'; 
const CLOUDINARY_UPLOAD_PRESET = 'tranhuyland'; 
const ADMIN_PASSWORD = '123'; 

// 📁 DANH SÁCH DANH MỤC CỐ ĐỊNH
const BLOG_CATEGORIES = [
  "Chia sẻ kinh nghiệm",
  "Kiến thức",
  "Luật nhà đất",
  "Nhà đẹp",
  "Phong thuỷ",
  "Tin bất động sản"
];

function localConvertToSlug(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/á|à|ả|ã|ạ|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a')
    .replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e')
    .replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i')
    .replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o')
    .replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u')
    .replace(/ý|ỳ|ỷ|ỹ|ị/gi, 'y')
    .replace(/đ/gi, 'd')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function autoFormatToMarkdown(htmlContent: string, fallbackText: string): string {
  if (htmlContent && htmlContent.includes('<')) {
    let md = htmlContent;
    md = md.replace(/<br\s*[\/]?>/gi, '\n');
    md = md.replace(/<\/p>/gi, '\n\n');
    md = md.replace(/<\/div>/gi, '\n');
    md = md.replace(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/gi, '\n\n## $1\n\n');
    md = md.replace(/<h[4-6][^>]*>(.*?)<\/h[4-6]>/gi, '\n\n### $1\n\n');
    md = md.replace(/<(?:b|strong)[^>]*>(.*?)<\/(?:b|strong)>/gi, '**$1**');
    md = md.replace(/<(?:i|em)[^>]*>(.*?)<\/(?:i|em)>/gi, '*$1*');
    md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
    md = md.replace(/<a[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
    md = md.replace(/<[^>]+>/g, '');
    md = md.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
    return md.replace(/\n{3,}/g, '\n\n').trim();
  }

  let text = fallbackText || '';
  const uppercaseLineRegex = /^[ \t]*([A-ZĐÁÀẢÃẠÂẤẦẨẪẬĂẮẰẲẴẶÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỗỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỊ0-9 \-\:\,\.]{6,60})$/gm;
  text = text.replace(uppercaseLineRegex, (match) => {
    const clean = match.trim();
    if (clean.startsWith('#')) return clean; 
    return `\n## ${clean}\n`;
  });

  const specRegex = /\b(\d+(?:[\.,]\d+)?\s*(?:m2|m²|tỷ|triệu|tr|vnđ|vnd|ha|hécta))\b/gi;
  text = text.replace(specRegex, (match) => {
    return `**${match.trim()}**`;
  });

  text = text.replace(/^[ \t]*[•\+\*][ \t]+/gm, '- ');
  return text.replace(/\n{3,}/g, '\n\n').trim();
}

export default function DangBlogPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    category: '', // 🚀 THÊM STATE DANH MỤC
    slug: '',
    excerpt: '',
    image: '',
    content: '',
    date: ''
  });

  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false); 
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingInlineImg, setUploadingInlineImg] = useState(false); 
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  const textareaRef = useRef<HTMLTextAreaElement>(null); 

  useEffect(() => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    setFormData(prev => ({ ...prev, date: `${dd}/${mm}/${yyyy}` }));
  }, [isAuthenticated]);

  // Tự lưu bản thảo
  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = setTimeout(() => {
      if (formData.title.trim() || formData.content.trim()) {
        localStorage.setItem('tranhuyland_blog_draft_v1', JSON.stringify(formData));
      }
    }, 1200); 
    return () => clearTimeout(timer);
  }, [formData, isAuthenticated]);

  const handleVerifyPassword = (e: FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setAuthError('');

      const savedDraft = localStorage.getItem('tranhuyland_blog_draft_v1');
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          if (parsed.title || parsed.content) {
            if (window.confirm('🚨 HỆ THỐNG PHÁT HIỆN BẢN THẢO CŨ:\n\nAnh Huy có 1 bài viết đang soạn dở. Anh có muốn khôi phục lại nội dung này không?')) {
              setFormData(parsed);
              setMessage({ type: 'success', content: '✨ Đã khôi phục thành công bản thảo viết dở!' });
            }
          }
        } catch(err) {}
      }
    } else { setAuthError('❌ Mật khẩu không chính xác!'); }
  };

  // 🚀 ĐÃ BỌC KIỂU HTMLSelectElement ĐỂ VERCEL KHÔNG BÁO LỖI TYPE
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'title') {
      setFormData(prev => ({
        ...prev,
        title: value,
        slug: isSlugManuallyEdited ? prev.slug : localConvertToSlug(value)
      }));
    } else if (name === 'slug') {
      setIsSlugManuallyEdited(true); 
      setFormData(prev => ({ ...prev, slug: localConvertToSlug(value) })); 
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleResetSlugToAuto = () => {
    setIsSlugManuallyEdited(false);
    setFormData(prev => ({ ...prev, slug: localConvertToSlug(prev.title) }));
    setMessage({ type: 'success', content: '🔄 Đã đặt lại đường dẫn Slug chạy tự động theo Tiêu đề!' });
  };

  const handleContentPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const htmlClipboard = e.clipboardData.getData('text/html');
    const plainTextClipboard = e.clipboardData.getData('text/plain');
    if (!htmlClipboard && !plainTextClipboard) return;
    e.preventDefault(); 

    const markdownOutput = autoFormatToMarkdown(htmlClipboard, plainTextClipboard);
    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = formData.content;

    const newText = currentText.substring(0, start) + markdownOutput + currentText.substring(end);
    setFormData(prev => ({ ...prev, content: newText }));
    setTimeout(() => { textarea.selectionStart = textarea.selectionEnd = start + markdownOutput.length; }, 0);
  };

  const handleFormatExistingContent = () => {
    if (!formData.content) return;
    const beautified = autoFormatToMarkdown('', formData.content);
    setFormData(prev => ({ ...prev, content: beautified }));
    setMessage({ type: 'success', content: '✨ Đã tự động bôi đậm thông số & dọn dẹp chuẩn Markdown!' });
  };

  const insertMarkdownTagAtCursor = (wrapperStart: string, wrapperEnd: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.content;
    const selectedText = text.slice(start, end);
    const replacement = wrapperStart + (selectedText || 'nội_dung') + wrapperEnd;
    const newText = text.slice(0, start) + replacement + text.slice(end);
    setFormData(prev => ({ ...prev, content: newText }));
    setTimeout(() => { textarea.focus(); textarea.selectionStart = textarea.selectionEnd = start + wrapperStart.length + (selectedText ? selectedText.length : 8); }, 0);
  };

  const handleCoverUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingCover(true); setMessage({ type: '', content: '' });
    try {
      const data = new FormData(); data.append('file', files[0]); data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: data });
      const uploaded = await res.json();
      let optimized = uploaded.secure_url;
      if (optimized.includes("/image/upload/")) optimized = optimized.replace("/image/upload/", "/image/upload/f_auto,q_auto,w_1200/");
      setFormData(prev => ({ ...prev, image: optimized }));
      setMessage({ type: 'success', content: '📸 Tải ảnh bìa Blog thành công!' });
    } catch (err) { setMessage({ type: 'error', content: '❌ Lỗi tải ảnh bìa.' }); } finally { setUploadingCover(false); }
  };

  const handleInlineImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingInlineImg(true); setMessage({ type: '', content: '' });

    try {
      const data = new FormData(); 
      data.append('file', files[0]); 
      data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: data });
      const uploaded = await res.json();
      
      let optimized = uploaded.secure_url;
      if (optimized.includes("/image/upload/")) {
        optimized = optimized.replace("/image/upload/", "/image/upload/f_auto,q_auto,w_800/");
      }

      const textarea = textareaRef.current;
      const currentContent = formData.content;
      const cursorPos = textarea ? textarea.selectionStart : currentContent.length;

      const markdownImgSnippet = `\n\n![Ảnh minh họa bài viết](${optimized})\n\n`;
      const newContent = currentContent.slice(0, cursorPos) + markdownImgSnippet + currentContent.slice(cursorPos);

      setFormData(prev => ({ ...prev, content: newContent }));
      setMessage({ type: 'success', content: '🎉 Đã bắn ảnh trực tiếp vào vị trí con trỏ trong bài viết!' });
      
      setTimeout(() => { if (textarea) textarea.selectionStart = textarea.selectionEnd = cursorPos + markdownImgSnippet.length; textarea?.focus(); }, 0);

    } catch (err) { 
      setMessage({ type: 'error', content: '❌ Gặp lỗi khi tải ảnh chèn nội dung.' }); 
    } finally { 
      setUploadingInlineImg(false); 
    }
  };

  const handleSubmitBlog = async (e: FormEvent) => {
    e.preventDefault();
    if (uploadingCover || uploadingInlineImg) return setMessage({ type: 'error', content: '⏳ Vui lòng đợi ảnh tải xong!' });

    setLoading(true); setMessage({ type: '', content: '' });
    try {
      const payload = {
        sheet: 'Blog',
        category: formData.category.trim(), // 🚀 GỬI DANH MỤC SANG SHEET
        slug: formData.slug.trim(),
        title: formData.title.trim(),
        excerpt: formData.excerpt.trim(),
        image: formData.image.trim(),
        content: formData.content,
        date: formData.date.trim()
      };
      await fetch(GOOGLE_WEBAPP_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      setMessage({ type: 'success', content: '🎉 Bài viết đã đồng bộ lên Google Sheet! Sẽ hiển thị trên web sau 60s.' });
      localStorage.removeItem('tranhuyland_blog_draft_v1');
      setFormData({ title: '', category: '', slug: '', excerpt: '', image: '', content: '', date: formData.date });
      setIsSlugManuallyEdited(false);
    } catch (err) { setMessage({ type: 'error', content: '❌ Lỗi kết nối mạng.' }); } finally { setLoading(false); }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[100dvh] bg-slate-950 flex items-center justify-center px-4 font-sans selection:bg-orange-500 selection:text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.08),transparent_50%)]" />
        <div className="max-w-md w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-8 rounded-3xl shadow-2xl relative z-10 text-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/20">
            <Lock className="text-white" size={28} />
          </div>
          <h1 className="text-xl font-black tracking-tight text-white mb-2 uppercase">Trần Huy Land Nội Bộ</h1>
          <p className="text-slate-400 text-sm mb-6">Nhập mật khẩu xác thực để mở giao diện soạn Blog.</p>
          <form onSubmit={handleVerifyPassword} className="space-y-4">
            <input type="password" placeholder="Mã pin..." value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full px-5 py-4 bg-slate-950/80 border border-slate-800 focus:border-orange-500 text-white rounded-2xl text-center text-[16px] font-bold tracking-widest outline-none" autoFocus />
            {authError && <p className="text-red-400 text-xs font-semibold">{authError}</p>}
            <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 text-white font-extrabold text-sm uppercase py-4 rounded-2xl shadow-lg">Xác thực truy cập</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-orange-500 selection:text-white">
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-50 px-4 py-4 border-b border-slate-800">
        <div className="max-w-5xl w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-500 rounded-xl text-white"><FileText size={18} /></div>
            <div>
              <h2 className="font-black text-sm md:text-base tracking-tight uppercase">Hệ thống Đăng Blog</h2>
              <p className="text-[10px] text-orange-400 font-bold tracking-wider uppercase">Hệ thống Trần Huy Land CMS</p>
            </div>
          </div>
          <button onClick={() => setIsAuthenticated(false)} className="text-xs font-bold text-slate-400 hover:text-red-400 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">Khóa trang</button>
        </div>
      </header>

      <main className="flex-1 py-10 px-4 max-w-3xl w-full mx-auto pb-24">
        {message.content && (
          <div className={`mb-6 p-4 rounded-2xl border flex items-start gap-3 shadow-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-red-50 text-red-900 border-red-200'}`}>
            {message.type === 'success' ? <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={18} /> : <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />}
            <p className="text-sm font-semibold leading-normal">{message.content}</p>
          </div>
        )}

        <form onSubmit={handleSubmitBlog} className="space-y-6 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="border-b border-slate-100 pb-4 mb-2">
            <h3 className="text-lg font-black text-slate-900">Biên tập nội dung Blog mới</h3>
            <p className="text-xs text-slate-400">Điền chuẩn thông tin bên dưới để bọ Google lập chỉ mục tốt nhất.</p>
          </div>

          {/* Ô 1: TIÊU ĐỀ */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <span>Tiêu đề bài viết</span><span className="text-red-500">*</span>
            </label>
            <input type="text" name="title" required value={formData.title} onChange={handleInputChange} placeholder="Ví dụ: Có nên đầu tư mua đất nền Hòa Xuân thời điểm này?" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 font-bold text-slate-900 rounded-xl text-[16px] md:text-sm outline-none" />
          </div>

          {/* Ô 2: CHỌN DANH MỤC (MỚI BỔ SUNG) */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <span>Danh mục bài viết</span><span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleInputChange}
                className="w-full pl-4 pr-10 py-3.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 font-bold text-slate-900 rounded-xl text-[16px] md:text-sm outline-none appearance-none cursor-pointer transition-all"
              >
                <option value="" disabled>-- Chọn danh mục bài viết --</option>
                {BLOG_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
            </div>
          </div>

          {/* Ô 3: SLUG */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <span>Đường dẫn Slug</span> <span className="text-[10px] normal-case text-orange-600 font-bold">(Có thể bấm vào để sửa ngắn lại)</span>
              </label>
              {isSlugManuallyEdited && (
                <button type="button" onClick={handleResetSlugToAuto} className="text-[11px] font-extrabold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-md transition-all active:scale-95">
                  🔄 Trả về băm tự động
                </button>
              )}
            </div>
            
            <div className="relative flex items-center">
              <span className="absolute left-4 text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md border border-slate-200 select-none pointer-events-none">
                /blog/
              </span>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="gõ-duong-dan-ngan-tai-day..."
                className={`w-full pl-20 pr-4 py-3.5 border font-mono text-[16px] md:text-xs rounded-xl outline-none transition-all ${isSlugManuallyEdited ? 'bg-amber-50/40 border-amber-400 text-amber-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
              />
            </div>
          </div>

          {/* Ô 4: ẢNH BÌA */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <span>Ảnh bìa đại diện bài viết</span><span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-300 hover:border-orange-500 bg-white p-5 rounded-xl cursor-pointer transition-all group">
                {uploadingCover ? <Loader2 className="text-orange-500 animate-spin" size={24} /> : <Upload className="text-slate-400 group-hover:text-orange-500" size={24} />}
                <span className="text-xs font-extrabold text-slate-600 group-hover:text-orange-600">{uploadingCover ? 'Đang tải...' : 'Chọn file ảnh bìa'}</span>
                <input type="file" accept="image/*" disabled={uploadingCover} onChange={handleCoverUpload} className="hidden" />
              </label>
              <div className="w-full">
                {formData.image ? (
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden border bg-white"><img src={formData.image} alt="cover preview" className="w-full h-full object-cover" /></div>
                ) : (<div className="h-full py-8 text-center text-slate-400 text-xs italic flex flex-col items-center justify-center gap-1 bg-white rounded-lg border border-dashed"><Eye size={16} /><span>Chưa có ảnh bìa</span></div>)}
              </div>
            </div>
          </div>

          {/* Ô 5: TÓM TẮT */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <span>Tóm tắt bài viết (Excerpt)</span><span className="text-red-500">*</span>
            </label>
            <textarea name="excerpt" required rows={2} value={formData.excerpt} onChange={handleInputChange} placeholder="Gõ 1-2 câu tóm tắt kích thích người click..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 font-semibold text-slate-800 rounded-xl text-[16px] md:text-sm outline-none leading-relaxed" />
            
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[11px] font-bold text-slate-400">Công thức tít sát thủ:</span>
              {[
                "🔥 Sập hầm chủ cần tiền gấp...", 
                "💰 Phân tích dòng tiền thực tế...", 
                "📍 Lô góc độc quyền hiếm có...",
                "⚠️ Cảnh báo rủi ro pháp lý khi mua..."
              ].map((hook, i) => (
                <button 
                  key={i} type="button" 
                  onClick={() => setFormData(p => ({ ...p, excerpt: hook }))}
                  className="text-[11px] bg-slate-100 hover:bg-orange-100 text-slate-600 hover:text-orange-700 px-2 py-0.5 rounded-md font-semibold transition-all active:scale-95"
                >
                  {hook}
                </button>
              ))}
            </div>
            <div className="text-right text-[11px] text-slate-400 font-medium">Độ dài chuẩn: <span className={formData.excerpt.length > 160 ? 'text-red-500 font-bold' : ''}>{formData.excerpt.length}/160</span></div>
          </div>

          {/* Ô 6: NỘI DUNG CHÍNH */}
          <div className="space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <span>Nội dung chi tiết</span><span className="text-red-500">*</span>
              </label>
              <button type="button" onClick={handleFormatExistingContent} className="text-[11px] bg-orange-50 hover:bg-orange-100 text-orange-600 font-black px-3 py-1 rounded-lg border border-orange-200 flex items-center gap-1 transition-all active:scale-95 self-start sm:self-auto shadow-2xs">
                <Sparkles size={13} /><span>✨ Tự động bôi đậm thông số</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-200/60 p-2 rounded-t-xl border-t border-x border-slate-300">
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={() => insertMarkdownTagAtCursor('**', '**')} className="px-2.5 py-1 bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-600 font-extrabold rounded text-xs border border-slate-300 flex items-center gap-1 shadow-xs active:scale-95"><Bold size={13}/><span>Bôi đậm</span></button>
                <button type="button" onClick={() => insertMarkdownTagAtCursor('\n## ', '\n\n')} className="px-2.5 py-1 bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-600 font-extrabold rounded text-xs border border-slate-300 flex items-center gap-1 shadow-xs active:scale-95"><Heading2 size={13}/><span>Tiêu đề H2</span></button>
                <button type="button" onClick={() => insertMarkdownTagAtCursor('\n> **💡 Lời khuyên chuyên gia:** ', '\n\n')} className="px-2.5 py-1 bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-600 font-extrabold rounded text-xs border border-slate-300 flex items-center gap-1 shadow-xs active:scale-95"><Quote size={13}/><span>Hộp Highlight</span></button>
              </div>

              <div>
                <label className="text-xs bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1.5 transition-all shadow-md active:scale-95">
                  {uploadingInlineImg ? <Loader2 className="animate-spin" size={14}/> : <ImageIcon size={14}/>}
                  <span>{uploadingInlineImg ? 'Đang nén ảnh chèn...' : '📸 Chèn ảnh vào con trỏ'}</span>
                  <input type="file" accept="image/*" disabled={uploadingInlineImg} onChange={handleInlineImageUpload} className="hidden"/>
                </label>
              </div>
            </div>

            <textarea
              ref={textareaRef}
              name="content"
              required
              rows={15}
              value={formData.content}
              onChange={handleInputChange}
              onPaste={handleContentPaste}
              placeholder="Soạn thảo tại đây...&#10;&#10;💡 MẸO CHÈN ẢNH:&#10;1. Nhấp con trỏ chuột vào sau bất kỳ đoạn văn nào anh muốn ảnh xuất hiện.&#10;2. Bấm nút [📸 Chèn ảnh vào con trỏ] màu cam ở thanh công cụ ngay phía trên.&#10;3. Máy sẽ tự úp và chèn đoạn mã: ![Ảnh minh họa](link-anh) vào đúng vị trí đó!"
              className="w-full px-4 py-3.5 bg-slate-50 border-x border-b border-slate-300 focus:bg-white focus:border-orange-500 font-medium text-slate-800 rounded-b-xl text-[16px] md:text-sm outline-none leading-relaxed whitespace-pre-wrap font-sans shadow-inner"
            />
          </div>

          {/* Ô 7: NGÀY ĐĂNG */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1"><span>Ngày đăng tin</span></label>
            <input type="text" name="date" value={formData.date} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[16px] md:text-sm font-bold" />
          </div>

          <button type="submit" disabled={loading || uploadingCover || uploadingInlineImg || !formData.title || !formData.category} className="w-full bg-slate-900 hover:bg-orange-600 text-white font-extrabold text-sm uppercase py-4.5 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 active:scale-[0.99]">
            {loading ? (<><RefreshCw className="animate-spin" size={16} /><span>Đang lưu sang Sheet...</span></>) : (<span>🚀 Đăng bài viết lên Blog</span>)}
          </button>
        </form>
      </main>
    </div>
  );
}
