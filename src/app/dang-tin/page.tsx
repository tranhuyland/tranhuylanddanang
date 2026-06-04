'use client';

import { useState, ChangeEvent, FormEvent } from 'react';

// === ANH HUY ĐIỀN THÔNG SỐ CLOUDINARY CỦA ANH VÀO ĐÂY ===
const CLOUD_NAME = 'ds6k0kfbz'; 
const UPLOAD_PRESET = 'tranhuyland'; 

interface FormDataState {
  title: string;
  price: string;
  area: string;
  district: string;
  direction: string;
  description: string;
}

export default function DangTinPage() {
  const [formData, setFormData] = useState<FormDataState>({
    title: '',
    price: '',
    area: '',
    district: '',
    direction: '',
    description: '',
  });
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Xử lý thay đổi ô nhập liệu
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Xử lý Upload nhiều ảnh lên Cloudinary cùng lúc
  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    setUploading(true);
    setMessage(null);
    const uploadedUrls: string[] = [];

    try {
      for (const file of files) {
        const data = new FormData();
        data.append('file', file);
        data.append('upload_preset', UPLOAD_PRESET);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: data,
        });

        if (res.ok) {
          const fileData = await res.json();
          uploadedUrls.push(fileData.secure_url);
        }
      }
      setImages((prev) => [...prev, ...uploadedUrls]);
      setMessage({ type: 'success', text: `Đã tải lên thành công ${uploadedUrls.length} hình ảnh.` });
    } catch (err) {
      setMessage({ type: 'error', text: 'Lỗi tải ảnh lên kho đám mây. Vui lòng kiểm tra lại cấu hình Cloudinary.' });
    } finally {
      setUploading(false);
    }
  };

  // Xử lý Gửi toàn bộ dữ liệu về Google Sheet
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      setMessage({ type: 'error', text: 'Vui lòng chọn và tải lên ít nhất 1 hình ảnh nhà đất!' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      // Gom loạt ảnh thành chuỗi cách nhau bằng dấu phẩy để ném vào 1 ô trên Sheet
      const imageUrlsString = images.join(',');

      const payload = {
        ...formData,
        images: imageUrlsString,
        date: new Date().toLocaleDateString('vi-VN'),
      };

      const response = await fetch('/api/dang-tin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage({ type: 'success', text: '🎉 Đăng tin thành công! Dữ liệu đã được nạp thẳng vào Google Sheet.' });
        setFormData({ title: '', price: '', area: '', district: '', direction: '', description: '' });
        setImages([]);
      } else {
        setMessage({ type: 'error', text: result.message || 'Có lỗi xảy ra khi đồng bộ với Google Sheet.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Không thể kết nối đồng bộ dữ liệu, vui lòng kiểm tra lại hệ thống.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'center', color: '#1d4ed8', marginBottom: '24px' }}>TRANG ÚP SẢN PHẨM NỘI BỘ</h2>
      
      {message && (
        <div style={{
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '16px',
          backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: message.type === 'success' ? '#15803d' : '#b91c1c',
          fontWeight: 'bold'
        }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Tiêu đề bài đăng *</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} placeholder="Ví dụ: Bán nhà mặt tiền Quận 1..." />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Giá tiền *</label>
            <input type="text" name="price" value={formData.price} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} placeholder="Ví dụ: 5.2 Tỷ" />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Diện tích (m²) *</label>
            <input type="text" name="area" value={formData.area} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} placeholder="Ví dụ: 75" />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Quận / Huyện *</label>
            <input type="text" name="district" value={formData.district} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} placeholder="Ví dụ: Hải Châu" />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Hướng nhà</label>
            <input type="text" name="direction" value={formData.direction} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} placeholder="Ví dụ: Đông Nam" />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Nội dung mô tả chi tiết</label>
          <textarea name="description" value={formData.description} onChange={handleChange} rows={4} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} placeholder="Nhập mô tả thông tin chi tiết bất động sản..." />
        </div>

        <div style={{ background: '#f3f4f6', padding: '16px', borderRadius: '6px', border: '1px dashed #9ca3af' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#374151' }}>Hình ảnh sản phẩm (Chọn nhiều ảnh) *</label>
          <input type="file" multiple accept="image/*" onChange={handleImageChange} disabled={uploading} style={{ marginBottom: '12px' }} />
          {uploading && <p style={{ color: '#2563eb', margin: 0 }}>⏳ Đang tải ảnh lên đám mây, anh chờ tí nhé...</p>}
          
          {images.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
              {images.map((url, idx) => (
                <img key={idx} src={url} alt="preview" style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }} />
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={submitting || uploading} style={{
          backgroundColor: submitting || uploading ? '#9ca3af' : '#2563eb',
          color: 'white',
          padding: '14px',
          border: 'none',
          borderRadius: '6px',
          cursor: submitting || uploading ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
          fontSize: '16px',
          marginTop: '10px'
        }}>
          {submitting ? '⏳ ĐANG ĐỒNG BỘ SANG GOOGLE SHEET...' : '🚀 XÁC NHẬN ĐĂNG TIN'}
        </button>
      </form>
    </div>
  );
}
