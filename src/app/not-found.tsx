import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex flex-col items-center justify-center flex-1 text-center px-4 py-20">
        <h2 className="text-4xl font-extrabold text-slate-900 mb-2">Căn nhà này không còn tồn tại</h2>
        <p className="text-slate-500 mb-6 max-w-md">
          Có thể bất động sản này đã được bán hoặc chủ nhà đã dừng ký gửi. Hãy quay lại trang chủ để xem giỏ hàng mới nhất mỗi ngày.
        </p>
        <Link 
          href="/" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
        >
          QUAY LẠI TRANG CHỦ
        </Link>
      </main>
      <Footer />
    </>
  );
}
