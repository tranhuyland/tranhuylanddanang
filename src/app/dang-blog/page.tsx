'use client';

import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { Lock, FileText, Upload, Loader2, CheckCircle, AlertCircle, RefreshCw, Eye, Sparkles } from 'lucide-react';

// ==========================================
// 🚨 CẤU HÌNH THÔNG SỐ TRẦN HUY LAND (Giữ nguyên hệ thống cũ của anh)
// ==========================================
const GOOGLE_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbzrb1ocMD9pZYe8JN14hSxhYG1KOHPb_ruX3hJtpUzKYn270qsKbjisU0Ea40DaGh3vww/exec';
const CLOUDINARY_CLOUD_NAME = 'ds6k0kfbz'; 
const CLOUDINARY_UPLOAD_PRESET = 'tranhuyland'; 
const ADMIN_PASSWORD = '123'; // Mật khẩu truy cập trang nội bộ công việc

// Hàm tiện ích băm Tiêu đề sang Slug không dấu để làm đường dẫn bài viết
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

// ========================================================
// 🛠️ BỘ LỌC KÉP THÔNG MINH: CHUYỂN ĐỔI VĂN BẢN/HTML THÀNH MARKDOWN
// ========================================================
function autoFormatToMarkdown(htmlContent: string, fallbackText: string): string {
  // TRƯỜNG HỢP 1: Copy từ Web, Google Docs, Word (Có chứa mã HTML ẩn trong Clipboard)
  if (htmlContent && htmlContent.includes('<')) {
    let md = htmlContent;

    // 1. Xử lý ngắt đoạn, xuống hàng
    md = md.replace(/<br\s*[\/]?>/gi, '\n');
    md = md.replace(/<\/p>/gi, '\n\n');
    md = md.replace(/<\/div>/gi, '\n');

    // 2. Xử lý Headings -> Biến thành ## Tiêu đề cam
    md = md.replace(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/gi, '\n\n## $1\n\n');
    md = md.replace(/<h[4-6][^>]*>(.*?)<\/h[4-6]>/gi, '\n\n### $1\n\n');

    // 3. Xử lý In đậm -> **chữ**
    md = md.replace(/<(?:b|strong)[^>]*>(.*?)<\/(?:b|strong)>/gi, '**$1**');

    // 4. Xử lý In nghiêng -> *chữ*
    md = md.replace(/<(?:i|em)[^>]*>(.*?)<\/(?:i|em)>/gi, '*$1*');

    // 5. Xử lý danh sách Bullet -> - dòng
    md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');

    // 6. Xử lý Link siêu liên kết -> [Tên](URL)
    md = md.replace(/<a[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');

    // 7. Dọn sạch toàn bộ các thẻ HTML rác còn sót lại
    md = md.replace(/<[^>]+>/g, '');

    // 8. Giải mã các ký tự đặc biệt của HTML (&nbsp; thành dấu cách...)
    md = md
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"');

    return md.replace(/\n{3,}/g, '\n\n').trim();
  }

  // TRƯỜNG HỢP 2: Copy Text thuần (Từ Zalo, Notepad, Facebook thô)
  let text = fallbackText || '';

  // A. Nhận diện các dòng VIẾT HOA TOÀN BỘ (từ 6-60 ký tự) biến thành Heading ##
  // Ví dụ: "TIỀM NĂNG TĂNG GIÁ" -> "## TIỀM NĂNG TĂNG GIÁ"
  const uppercaseLineRegex = /^[ \t]*([A-ZĐÁÀẢÃẠÂẤẦẨẪẬĂẮẰẲẴẶÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỗỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỊ0-9 \-\:\,\.]{6,60})$/gm;
  text = text.replace(uppercaseLineRegex, (match) => {
    const clean = match.trim();
    if (clean.startsWith('#')) return clean; // Đã có dấu thăng thì giữ nguyên
    return `\n## ${clean}\n`;
  });

  // B. Tự động bôi đậm các thông số BĐS quan trọng (m2, tỷ, triệu) nếu chưa bôi đậm
  const specRegex = /\b(\d+(?:[\.,]\d+)?\s*(?:m2|m²|tỷ|triệu|tr|vnđ|vnd|ha|hécta))\b/gi;
  text = text.replace(specRegex, (match, p1, offset, fullStr) => {
    const trc = fullStr.slice(Math.max(0, offset - 2), offset);
    const sau = fullStr.slice(offset + match.length, offset + match.length + 2);
    if (trc === '**' || sau === '**') return match; // Đã bọc ** rồi thì bỏ qua
    return `**${match.trim()}**`;
  });

  // C. Chuẩn hóa các gạch đầu dòng thô sơ (+, *, •) thành chuẩn Markdown (-)
  text = text.replace(/^[ \t]*[•\+\*][ \t]+/gm, '- ');

  return text.replace(/\n{3,}/g, '\n\n').trim();
}

export default function DangBlogPage() {
  // 🔒 STATE BẢO MẬT TRANG NỘI BỘ
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // 📝 STATE QUẢN LÝ FORM BLOG
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    image: '',
    content: '',
    date: ''
  });

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  // Tự động gán ngày hôm nay chuẩn định dạng Việt Nam (dd/mm/yyyy) khi mở trang
  useEffect(() => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    setFormData(prev => ({ ...prev, date: `${dd}/${mm}/${yyyy}` }));
  }, [isAuthenticated]);

  // Kiểm tra mật khẩu nội bộ
  const handleVerifyPassword = (e: FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('❌ Mật khẩu không chính xác! Vui lòng kiểm tra lại.');
    }
  };

  // Xử lý khi thay đổi nội dung các ô nhập liệu chữ
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Logic đặc biệt: Nếu gõ Tiêu đề thì tự động sinh luôn Slug ở ô dưới cho tiện
    if (name === 'title') {
      setFormData(prev => ({
        ...prev,
        title: value,
        slug: localConvertToSlug(value)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // 🚀 HÀM CAN THIỆP TỨC THÌ KHI KHÁCH DÁN (CTRL+V) VÀO Ô NỘI DUNG
  const handleContentPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const htmlClipboard = e.clipboardData.getData('text/html');
    const plainTextClipboard = e.clipboardData.getData('text/plain');

    if (!htmlClipboard && !plainTextClipboard) return;

    e.preventDefault(); // Khóa hành vi dán thô kệch mặc định của trình duyệt

    const markdownOutput = autoFormatToMarkdown(htmlClipboard, plainTextClipboard);

    // Sửa nội dung state, chèn chính xác vào vị trí con trỏ chuột đang đứng
    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = formData.content;

    const newText = currentText.substring(0, start) + markdownOutput + currentText.substring(end);

    setFormData(prev => ({ ...prev, content: newText }));

    // Đẩy con trỏ chuột nhảy ra ngay sau đoạn văn vừa dán
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + markdownOutput.length;
    }, 0);
  };

  // 🚀 HÀM NÚT BẤM CHỦ ĐỘNG: LÀM ĐẸP VĂN BẢN ĐANG CÓ SẴN TRONG KHUNG
  const handleFormatExistingContent = () => {
    if (!formData.content) return;
    const beautified = autoFormatToMarkdown('', formData.content);
    setFormData(prev => ({ ...prev, content: beautified }));
    setMessage({ type: 'success', content: '✨ Đã tự động bôi đậm thông số & dọn dẹp chuẩn Markdown!' });
  };

  // 📸 HÀM TẢI ẢNH BÌA BÀI VIẾT LÊN CLOUDINARY
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setMessage({ type: '', content: '' });

    try {
      const file = files[0];
      const data = new FormData();
      data.append('file', file);
      data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: data,
      });

      if (!res.ok) throw new Error('Không thể tải ảnh lên Cloudinary');

      const uploadedImageData = await res.json();
      
      let optimizedUrl = uploadedImageData.secure_url;
      if (optimizedUrl.includes("/image/upload/")) {
        optimizedUrl = optimizedUrl.replace("/image/upload/", "/image/upload/f_auto,q_auto/");
      }

      setFormData(prev => ({ ...prev, image: optimizedUrl }));
      setMessage({ type: 'success', content: '📸 Tải ảnh bìa Blog lên Cloudinary thành công!' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', content: '❌ Gặp lỗi trong quá trình tải ảnh bìa lên Cloudinary.' });
    } finally {
      setUploading(false);
    }
  };

  // 🚀 HÀM GỬI BÀI VIẾT ĐỒNG BỘ SANG GOOGLE SHEET
  const handleSubmitBlog = async (e: FormEvent) => {
    e.preventDefault();
    if (uploading) {
      setMessage({ type: 'error', content: '⏳ Vui lòng đợi ảnh bìa tải xong trước khi lưu bài viết!' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', content: '' });

    try {
      const payload = {
        sheet: 'Blog',
        slug: formData.slug.trim(),
        title: formData.title.trim(),
        excerpt: formData.excerpt.trim(),
        image: formData.image.trim(),
        content: formData.content,
        date: formData.date.trim()
      };

      await fetch(GOOGLE_WEBAPP_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      setMessage({ type: 'success', content: '🎉 Bài viết đã được đồng bộ lên Google Sheet và sẽ hiển thị trên web sau 60 giây!' });
      
      setFormData({
        title: '',
        slug: '',
        excerpt: '',
        image: '',
        content: '',
        date: formData.date
      });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', content: '❌ Không thể kết nối đồng bộ dữ liệu. Hãy kiểm tra lại mạng internet.' });
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------
  // 🔒 1. GIAO DIỆN KHÓA BẢO VỆ (MẬT KHẨU: 123)
  // --------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 font-sans selection:bg-orange-500 selection:text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.08),transparent_50%)]" />
        
        <div className="max-w-md w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-8 rounded-3xl shadow-2xl relative z-10 text-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/20">
            <Lock className="text-white" size={28} />
          </div>
          
          <h1 className="text-xl font-black tracking-tight text-white mb-2 uppercase">Trần Huy Land Nội Bộ</h1>
          <p className="text-slate-400 text-sm mb-6">Vui lòng nhập mật khẩu xác thực để mở giao diện soạn thảo và đăng bài viết lên Blog.</p>
          
          <form onSubmit={handleVerifyPassword} className="space-y-4">
            <input
              type="password"
              placeholder="Nhập mã pin bảo mật..."
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full px-5 py-4 bg-slate-950/80 border border-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-white rounded-2xl text-center font-bold tracking-widest transition-all outline-none"
              autoFocus
            />
            
            {authError && (
              <p className="text-red-400 text-xs font-semibold flex items-center justify-center gap-1 bg-red-500/10 py-2.5 rounded-xl border border-red-500/20">
                <AlertCircle size={14} /> {authError}
              </p>
            )}
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-extrabold text-sm uppercase tracking-wider py-4 rounded-2xl transition-all shadow-lg hover:shadow-orange-500/10 active:scale-[0.98]"
            >
              Xác thực truy cập
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------
  // 📝 2. GIAO DIỆN SOẠN THẢO BÀI VIẾT BLOG CHÍNH THỨC
  // --------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-orange-500 selection:text-white">
      
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-50 px-4 py-4 border-b border-slate-800">
        <div className="max-w-5xl w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-500 rounded-xl text-white">
              <FileText size={18} />
            </div>
            <div>
              <h2 className="font-black text-sm md:text-base tracking-tight uppercase">Hệ thống Đăng Blog</h2>
              <p className="text-[10px] text-orange-400 font-bold tracking-wider uppercase">Hệ thống Trần Huy Land CMS</p>
            </div>
          </div>
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="text-xs font-bold text-slate-400 hover:text-red-400 bg-slate-800 hover:bg-red-500/10 px-4 py-2 rounded-xl border border-slate-700/60 transition-all"
          >
            Khóa trang
          </button>
        </div>
      </header>

      <main className="flex-1 py-10 px-4 max-w-3xl w-full mx-auto">
        
        {message.content && (
          <div className={`mb-6 p-4 rounded-2xl border flex items-start gap-3 shadow-sm transition-all duration-300 ${
            message.type === 'success' 
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
              : 'bg-red-50 text-red-900 border-red-200'
          }`}>
            {message.type === 'success' ? <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={18} /> : <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />}
            <p className="text-sm font-semibold leading-normal">{message.content}</p>
          </div>
        )}

        <form onSubmit={handleSubmitBlog} className="space-y-6 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
          
          <div className="border-b border-slate-100 pb-4 mb-2">
            <h3 className="text-lg font-black text-slate-900">Biên tập nội dung Blog mới</h3>
            <p className="text-xs text-slate-400">Điền đầy đủ thông tin bên dưới để bọ tìm kiếm Googlebot lập chỉ mục tốt nhất.</p>
          </div>

          {/* Ô 1: TIÊU ĐỀ */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <span>Tiêu đề bài viết</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Ví dụ: Có nên đầu tư mua đất nền Hòa Xuân thời điểm này?"
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 font-bold text-slate-900 rounded-xl transition-all outline-none text-sm"
            />
          </div>

          {/* Ô 2: SLUG */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <span>Đường dẫn bài viết (Slug tự động)</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md border border-slate-200 pointer-events-none select-none">
                /blog/
              </span>
              <input
                type="text"
                name="slug"
                readOnly
                value={formData.slug}
                className="w-full pl-20 pr-4 py-3.5 bg-slate-100 border border-slate-200 font-mono text-xs text-slate-500 rounded-xl cursor-not-allowed outline-none"
              />
            </div>
          </div>

          {/* Ô 3: ẢNH BÌA */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <span>Ảnh bìa đại diện bài viết</span>
              <span className="text-red-500">*</span>
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-300 hover:border-orange-500 bg-white p-5 rounded-xl cursor-pointer transition-all group">
                {uploading ? (
                  <Loader2 className="text-orange-500 animate-spin" size={24} />
                ) : (
                  <Upload className="text-slate-400 group-hover:text-orange-500 transition-colors" size={24} />
                )}
                <span className="text-xs font-extrabold text-slate-600 group-hover:text-orange-600">
                  {uploading ? 'Đang tải ảnh bìa lên...' : 'Chọn file từ điện thoại'}
                </span>
                <input 
                  type="file" 
                  accept="image/*" 
                  disabled={uploading} 
                  onChange={handleImageUpload} 
                  className="hidden" 
                />
              </label>

              <div className="w-full">
                {formData.image ? (
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-slate-200 bg-white">
                    {/* eslint-disable-next-html/next-image-component-missing-attribute */}
                    <img 
                      src={formData.image} 
                      alt="Xem trước ảnh bìa" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-full py-8 text-center text-slate-400 text-xs italic flex flex-col items-center justify-center gap-1 bg-white rounded-lg border border-slate-200 border-dashed">
                    <Eye size={16} />
                    <span>Chưa có ảnh bìa bài viết</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Ô 4: TÓM TẮT */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <span>Tóm tắt bài viết (Excerpt)</span>
              <span className="text-red-500">*</span>
            </label>
            <textarea
              name="excerpt"
              required
              rows={2}
              value={formData.excerpt}
              onChange={handleInputChange}
              placeholder="Gõ 1-2 câu tóm tắt bài viết để hiện ngoài trang danh sách. Giúp kích thích người dùng click..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 font-semibold text-slate-800 rounded-xl transition-all outline-none text-sm leading-relaxed"
            />
          </div>

          {/* Ô 5: NỘI DUNG CHÍNH (TÍCH HỢP BỘ LỌC MARKDOWN KÉP) */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <span>Nội dung chi tiết bài viết</span>
                <span className="text-red-500">*</span>
              </label>

              <button
                type="button"
                onClick={handleFormatExistingContent}
                className="text-[11px] bg-orange-50 hover:bg-orange-100 text-orange-600 font-black px-3 py-1 rounded-lg border border-orange-200 flex items-center gap-1 transition-all active:scale-95 self-start sm:self-auto shadow-2xs"
              >
                <Sparkles size={13} />
                <span>✨ Tự động bôi đậm & làm đẹp Markdown</span>
              </button>
            </div>

            <textarea
              name="content"
              required
              rows={14}
              value={formData.content}
              onChange={handleInputChange}
              onPaste={handleContentPaste}
              placeholder="Soạn thảo hoặc DÁN (Ctrl+V) nội dung bài viết từ Web / Word / Zalo vào đây...&#10;&#10;✨ KHI ANH DÁN, HỆ THỐNG SẼ:&#10;1. Giữ nguyên 100% chữ in đậm, heading, link nếu copy từ Website hoặc Word.&#10;2. Tự động nhận diện dòng viết hoa thành ## và bôi đậm **100m2**, **4.5 tỷ**."
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 font-medium text-slate-800 rounded-xl transition-all outline-none text-sm leading-relaxed whitespace-pre-wrap font-sans"
            />
          </div>

          {/* Ô 6: NGÀY ĐĂNG */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <span>Ngày đăng tin bài viết</span>
            </label>
            <input
              type="text"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              placeholder="Định dạng: dd/mm/yyyy"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 text-slate-800 font-bold rounded-xl transition-all outline-none text-sm"
            />
          </div>

          {/* NÚT SUBMIT */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || uploading || !formData.title || !formData.image}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:from-slate-300 disabled:to-slate-400 text-white font-extrabold text-sm uppercase tracking-wider py-4.5 rounded-2xl transition-all shadow-lg hover:shadow-orange-500/10 disabled:shadow-none active:scale-[0.98] disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin" size={16} />
                  <span>Đang xử lý dữ liệu sang Sheet...</span>
                </>
              ) : (
                <span>Xác nhận Đăng bài viết lên Blog</span>
              )}
            </button>
          </div>
          
        </form>
      </main>
    </div>
  );
}
