import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import FloatingWidgets from '@/components/FloatingWidgets';
import { getBdsData } from '@/lib/googleSheets';

// Định nghĩa kiểu dữ liệu Props theo chuẩn Next.js 15 App Router
interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// 1. Cấu hình SEO tự động (Dynamic Metadata API) - Đã ép kiểu an toàn
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const allData = await getBdsData();
  
  // Ép kiểu sang (any) để bỏ qua bước kiểm tra chữ hoa/chữ thường nghiêm ngặt của hệ thống
  const item = allData.find((p: any) => p.slug === slug) as any;

  if (!item) {
    return {
      title: 'Không tìm thấy sản phẩm | Trần Huy Land',
    };
  }

  const pageTitle = item.title || item.Title || 'Chi tiết nhà đất';
  const pageDesc = item.description || item.Description || item.address || item.Address || '';
  const pageDate = item.date || item.Date || '';

  return {
    title: `${pageTitle} - Đà Nẵng | Trần Huy Land`,
    description: `${pageDesc} - Cập nhật ngày ${pageDate}. Liên hệ Trần Huy chính chủ.`,
    alternates: {
      canonical: `https://tranhuyland.vn/nha-dat/${slug}`,
    },
  };
}

// 2. Nội dung hiển thị chi tiết bất động sản động độc lập
export default async function PropertyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const allData = await getBdsData();
  
  // Ép kiểu sang (any) tại đây để phân cấp dữ liệu bên dưới không bị chặn lỗi Linting
  const item = allData.find((p: any) => p.slug === slug) as any;

  // Nếu không tồn tại sản phẩm, tự động trả về trang lỗi 404 chỉn chu
  if (!item) {
    notFound();
  }

  // Chuẩn hóa dữ liệu động linh hoạt từ các cột Google Sheet
  const title = item.title || item.Title || '';
  const date = item.date || item.Date || '';
  const timeAgo = item.timeAgo || item.TimeAgo || '';
  const district = item.district || item.District || '';
  const description = item.description || item.Description || '';
  const price = item.price || item.Price || 'Liên hệ';
  const area = item.area || item.Area || 'Chưa cập nhật';
  const direction = item.direction || item.Direction || 'Chưa cập nhật';
  const type = item.type || item.Type || 'Đất nền/Nhà phố';
  const features = item.features || item.Features || '';
  const image = item.image || item.Image || '';

  return (
    <>
      {/* Thanh giao diện Header */}
      <Header />

      {/* Nội dung chi tiết bài đăng nhà đất */}
      <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm overflow-hidden p-6 sm:p-8">
          
          {/* Nút quay lại danh sách trang chủ */}
          <div className="mb-6">
            <a 
              href="/" 
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              ← QUAY LẠI DANH SÁCH
            </a>
          </div>

          {/* Tiêu đề bất động sản */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            {title}
          </h1>

          {/* Thanh thông tin lịch trình & vị trí quận huyện */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 pb-6 border-b border-gray-100 mb-6">
            <span>📅 Ngày đăng: {date}</span>
            {timeAgo && <span>⏱️ Đăng cách đây: {timeAgo}</span>}
            <span>📍 Khu vực: {district}</span>
          </div>

          {/* Bố cục chia hai cột: Mô tả chi tiết & Thông số kỹ thuật */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Cột trái: Văn bản mô tả chi tiết bất động sản */}
            <div className="md:col-span-2 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Thông tin mô tả</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {description || 'Chưa có thông tin mô tả chi tiết cho bất động sản này.'}
              </p>
            </div>

            {/* Cột phải: Hộp thông số tổng quan giá cả, hướng nhà */}
            <div className="bg-gray-50 rounded-xl p-5 space-y-4 h-fit border border-gray-100">
              <h2 className="text-base font-bold text-gray-900 border-b border-gray-200 pb-2">
                Thông số bất động sản
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Mức giá:</span>
                  <span className="font-semibold text-red-600 text-base">{price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Diện tích:</span>
                  <span className="font-semibold text-gray-900">{area}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Hướng nhà:</span>
                  <span className="font-semibold text-gray-900">{direction}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Loại hình:</span>
                  <span className="font-semibold text-gray-900">{type}</span>
                </div>
                {features && (
                  <div className="pt-2 border-t border-gray-200">
                    <span className="inline-block bg-red-50 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                      🔥 {features}
                    </span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Khối hiển thị hình ảnh thực tế / Sổ đỏ */}
          {image && (
            <div className="mt-8 pt-8 border-t border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Hình ảnh thực tế & Sổ hồng</h2>
              <div className="rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex justify-center items-center max-h-[600px]">
                <img 
                  src={image} 
                  alt={`Hình ảnh của ${title}`}
                  className="w-full h-auto object-contain"
                  loading="lazy"
                />
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Tiện ích liên hệ nhanh (Gọi điện + Zalo) cố định bên góc màn hình */}
      <FloatingWidgets />
    </>
  );
}
