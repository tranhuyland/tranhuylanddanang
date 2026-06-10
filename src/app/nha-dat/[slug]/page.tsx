import { getBdsData } from "@/lib/googleSheets"; 
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";
import PropertyGallery from "@/components/SlideBds"; 
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, MapPin, Calendar, ShieldCheck, Layers, Map, FileText, Phone } from "lucide-react";

interface Props { params: Promise<{ slug: string }>; }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const data = await getBdsData();
  const item = data.find(p => p.slug === slug) as any;
  if (!item) return { title: "Không tìm thấy sản phẩm" };
  
  const titleText = item.tieude || item.Tieude || item.title || "Chi tiết bất động sản";
  const priceText = item.gia || item.Gia || "Liên hệ";
  const areaText = item.dienTich || item.DienTich || item.dientich || "Chưa rõ";
  const locationText = item.khuVucFull || item.khuvucFull || item.diachi || "";

  return {
    title: `${titleText} | Trần Huy Land`,
    description: `Giá bán: ${priceText}. Diện tích: ${areaText}. V vị trí: ${locationText}.`,
  };
}

export default async function NhaDatDetail({ params }: Props) {
  const { slug } = await params;
  const data = await getBdsData();
  const item = data.find(p => p.slug === slug) as any;
  if (!item) notFound();
  
  // Thu thập danh sách ảnh chính từ cột 'anh' trong Google Sheet
  const anhGoc = item.anh || item.Anh || "";
  const danhSachAnh = anhGoc ? anhGoc.split(",").map((a: string) => a.trim()).filter((a: string) => a !== "" && a.startsWith("http")) : [];

  // Gom thêm ảnh sổ đỏ/bản vẽ vào chung danh sách slide nếu có để khách tiện vuốt xem một lượt
  const anhSoDoGoc = item.anhSoDo || item.AnhSoDo || "";
  const tatCaAnhGallery = [...danhSachAnh];
  if (anhSoDoGoc && anhSoDoGoc.startsWith("http") && !tatCaAnhGallery.includes(anhSoDoGoc)) {
    tatCaAnhGallery.push(anhSoDoGoc);
  }

  // Khắc phục lỗi lệch chữ hoa/thường để bảo đảm luôn lấy được văn bản mô tả từ Google Sheet
  const noiDungMoTa = item.mota || item.moTa || item.Mota || item.description || item.Description || "Thông tin đang được cập nhật...";

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-10 flex-1 w-full max-w-full overflow-hidden">
        <Link href="/" scroll={false} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> QUAY LẠI TRANG CHỦ
        </Link>
        
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden w-full max-w-full">
          
          {/* KHU VỰC TRÌNH CHIẾU MEDIA */}
          <div className="relative aspect-[16/10] bg-slate-100 w-full max-w-full overflow-hidden group-gallery">
            {item.videoUrl ? (
              <div className="w-full h-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar max-w-full">
                <div className="w-full h-full flex-shrink-0 snap-start relative max-w-full">
                  <iframe className="w-full h-full" src={item.videoUrl} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                </div>
                <div className="w-full h-full flex-shrink-0 snap-start relative max-w-full">
                  <PropertyGallery images={tatCaAnhGallery} alt={item.tieude || item.Title} />
                </div>
              </div>
            ) : (
              <PropertyGallery images={tatCaAnhGallery} alt={item.tieude || item.Title} />
            )}

            <div className="bg-slate-900/70 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-md absolute top-4 left-4 z-10 flex items-center gap-1 uppercase tracking-wider shadow pointer-events-none">
              <Layers className="w-3 h-3 text-amber-400" /> Media: {item.videoUrl ? '1 Video & ' : ''}{tatCaAnhGallery.length} Hình Ảnh
            </div>
          </div>

          <div className="p-6 sm:p-8 w-full max-w-full">
            <div className="flex items-center justify-between">
              <span className="bg-amber-500 text-slate-900 font-extrabold text-base px-3 py-1 rounded-xl shadow-sm">{item.gia || item.Gia}</span>
              <span className="text-xs text-slate-400 font-bold uppercase bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> {item.phapLy || item.PhapLy || 'Sổ hồng riêng'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-4 leading-snug">{item.tieude || item.Tieude}</h1>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-400 text-xs mt-2 border-b border-slate-100 pb-4 font-semibold w-full">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-amber-500" />{item.khuVucFull || item.khuvucFull}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Ngày đăng: {item.ngayDang || item.NgayDang}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 my-6 p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-600 text-center font-semibold w-full">
              <div>
                <div className="text-slate-400 text-[11px] font-bold uppercase mb-0.5 tracking-wider">Diện tích</div>
                <strong className="text-slate-900 text-sm sm:text-base">{item.dienTich || item.DienTich || '---'}</strong>
              </div>
              <div>
                <div className="text-slate-400 text-[11px] font-bold uppercase mb-0.5 tracking-wider">Cấu trúc</div>
                <strong className="text-slate-900 text-sm sm:text-base">{item.phongNgu || item.PhongNgu || 'Đất ở'}</strong>
              </div>
              <div>
                <div className="text-slate-400 text-[11px] font-bold uppercase mb-0.5 tracking-wider">Hướng</div>
                <strong className="text-slate-900 text-sm sm:text-base">{item.huong || item.Huong || 'Chưa rõ'}</strong>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6 w-full">
              {(item.linkMap || item.LinkMap) && <a href={item.linkMap || item.LinkMap} target="_blank" rel="noopener noreferrer" className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 rounded-xl py-2.5 px-3 text-center text-xs flex items-center justify-center gap-1.5 transition-colors"><Map className="w-4 h-4" /> Vị Trí Bản Đồ</a>}
              {anhSoDoGoc && <a href={anhSoDoGoc} target="_blank" rel="noopener noreferrer" className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 rounded-xl py-2.5 px-3 text-center text-xs flex items-center justify-center gap-1.5 transition-colors"><FileText className="w-4 h-4" /> Sổ Hồng Bản Vẽ</a>}
            </div>

            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-2">Mô tả chi tiết:</h4>
            
            {/* BẢN SỬA ĐỔI HOÀN HẢO: Sử dụng trực tiếp dữ liệu chuỗi kết hợp CSS wrap khoảng trắng cao cấp */}
            <p className="text-slate-700 text-sm leading-relaxed text-justify whitespace-pre-wrap mb-8 w-full">
              {noiDungMoTa}
            </p>

            <div className="flex gap-3 border-t border-slate-100 pt-6 w-full">
              <a href="tel:0931555551" className="flex-1 bg-slate-900 text-white font-extrabold rounded-xl py-3 px-4 flex items-center justify-center gap-2 text-sm shadow-md transition-transform active:scale-95"><Phone className="w-4 h-4 text-amber-400 fill-amber-400" /> Gọi Thương Lượng</a>
              <a href="https://zalo.me/0931555551" target="_blank" rel="noopener noreferrer" className="flex-1 bg-[#0068ff] text-white font-extrabold rounded-xl py-3 px-4 flex items-center justify-center text-sm shadow-md text-center transition-transform active:scale-95">Kết Nối Zalo</a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <FloatingWidgets /> 
    </>
  );
}
