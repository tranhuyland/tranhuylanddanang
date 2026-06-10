import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Loading() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4">
          {/* Skeleton cho phần Tiêu đề */}
          <div className="h-10 bg-slate-200 rounded-lg w-1/3 mb-4 animate-pulse"></div>
          <div className="h-4 bg-slate-200 rounded animate-pulse w-1/4 mb-10"></div>

          {/* Skeleton cho Lưới Sản phẩm (Hiển thị tạm 6 khung hình) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                {/* Khung ảnh */}
                <div className="w-full h-48 bg-slate-200 rounded-xl mb-4 animate-pulse"></div>
                {/* Khung Text */}
                <div className="h-5 bg-slate-200 rounded w-3/4 mb-3 animate-pulse"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-4 animate-pulse"></div>
                {/* Khung Giá & Nút */}
                <div className="flex justify-between items-center mt-4">
                  <div className="h-6 bg-slate-200 rounded w-1/3 animate-pulse"></div>
                  <div className="h-8 bg-slate-200 rounded w-1/4 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
