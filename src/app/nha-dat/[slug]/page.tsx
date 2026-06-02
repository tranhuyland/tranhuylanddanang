import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import FloatingWidgets from '@/components/FloatingWidgets';
import { getBdsData } from '@/lib/googleSheets';

// Định nghĩa kiểu dữ liệu (TypeScript Type) để tránh lỗi Linting trên Vercel
interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// 1. Cấu hình SEO tự động (Dynamic Metadata API) cho từng tin nhà đất
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const allData = await getBdsData();
  const item = allData.find((p: any) => p.slug === slug);

  if (!item) {
    return {
      title: 'Không tìm thấy sản phẩm | Trần Huy Land',
    };
  }

  return {
    title: `${item.title} - Đà Nẵng | Trần Huy Land`,
    description: `${item.description || item.address} - Cập nhật ngày ${item.date}. Liên hệ Trần Huy chính chủ.`,
    alternates: {
      canonical: `https://tranhuyland.vn/nha-dat/${slug}`,
    },
  };
}

// 2. Nội dung hiển thị chi tiết bất động sản động
export default async function PropertyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const allData = await getBdsData();
  
  // Tìm kiếm sản phẩm bất động sản dựa theo slug trên đường dẫn URL
  const item = allData.find((p: any) => p.slug === slug);

  // Nếu không tìm thấy dữ liệu phù hợp, tự động chuyển sang trang 404
  if (!item) {
    notFound();
  }

  return (
    <>
      {/* Giao diện Thanh Header */}
      <Header />

      {/* Khu vực nội dung chi tiết bất động sản */}
      <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm overflow-hidden p-6 sm:p-8">
          
          {/* Nút quay lại danh sách */}
          <div className="mb-6">
            <a 
              href="/" 
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              ← QUAY LẠI DANH SÁCH
            </a>
          </div>

          {/* Tiêu đề sản phẩm */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            {item.title}
          </h1>

          {/* Thông tin cơ bản & Ngày đăng */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 pb-6 border-b border-gray-100 mb-6">
            <span>📅 Ngày đăng: {item.date}</span>
            {item.timeAgo && <span>⏱️ Đăng cách đây: {item.timeAgo}</span>}
            <span>📍 Khu vực: {item.district}</span>
          </div>

          {/* Nội dung chi tiết & Thông số kỹ thuật */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Cột trái: Thông tin mô tả */}
            <div className="md:col-span-2 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Thông tin mô tả</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {item.description || 'Chưa có thông tin mô tả chi tiết cho bất động sản này.'}
              </p>
            </div>

            {/* Cột phải: Bảng thông số tổng quan */}
            <div className="bg-gray-50 rounded-xl p-5 space-y-4 h-fit border border-gray-100">
              <h2 className="text-base font-bold text-gray-900 border-b border-gray-200 pb-2">
                Thông số bất động sản
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Mức giá:</span>
                  <span className="font-semibold text-red-600 text-base">{item.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Diện tích:</span>
                  <span className="font-semibold text-gray-900">{item.area}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Hướng nhà:</span>
                  <span className="font-semibold text-gray-900">{item.direction || 'Chưa cập nhật'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Loại hình:</span>
                  <span className="font-semibold text-gray-900">{item.type || 'Đất nền/Nhà phố'}</span>
                </div>
                {item.features && (
                  <div className="pt-2 border-t border-gray-200">
                    <span className="inline-block bg-red-50 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                      🔥 {item.features}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hiển thị hình ảnh sổ đỏ hoặc hình ảnh thực tế nếu có */}
          {item.image && (
            <div className="mt-8 pt-8 border-t border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Hình ảnh thực tế & Sổ hồng</h2>
              <div className="rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex justify-center items-center max-h-[500px]">
                <img 
                  src={item.image} 
                  alt={`Hình ảnh của ${item.title}`}
                  className="w-full h-auto object-contain"
                  loading="lazy"
                />
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Tiện ích các nút bấm nổi liên hệ (Call + Zalo) */}
      <FloatingWidgets />
    </>
  );
}
