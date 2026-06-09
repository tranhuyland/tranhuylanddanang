import { getBdsData } from "@/lib/googleSheets";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";
import PropertyGallery from "@/components/PropertyGallery"; // Import component slide phóng to mới
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, MapPin, Calendar, ShieldCheck, Layers, Map, FileText, Phone } from "lucide-react";

interface Props { params: Promise<{ slug: string }>; }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const data = await getBdsData();
  const item = data.find(p => p.slug === slug);
  if (!item) return { title: "Không tìm thấy sản phẩm" };
  return {
    title: `${item.tieude} | Trần Huy Land`,
    description: `Giá bán: ${item.gia}. Diện tích: ${item.dienTich}. Vị trí: ${item.khuVucFull}.`,
  };
}

export default async function NhaDatDetail({ params }: Props) {
  const { slug } = await params;
  const data = await getBdsData();
  const item = data.find(p => p.slug === slug);
  if (!item) notFound();
  
  // Thu thập danh sách ảnh chính từ cột 'anh' trong Google Sheet
  const danhSachAnh = item.anh ? item.anh.split(",").map((a: string) => a.trim()).filter(a => a !== "" && a.startsWith("http")) : [];

  // Gom thêm ảnh sổ đỏ/bản vẽ vào chung danh sách slide nếu có để khách tiện vuốt xem một lượt
  const tatCaAnhGallery = [...danhSachAnh];
  if (item.anhSoDo && item.anhSoDo.startsWith("http") && !tatCaAnhGallery.includes(item.anhSoDo)) {
    tatCaAnhGallery.push(item.anhSoDo);
  }

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-10 flex-1">
        <Link href="/" scroll={false} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> QUAY LẠI TRANG CHỦ
        </Link>
        
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          
          {/* KHU VỰC CẬP NHẬT: THAY THẾ SLIDE CŨ BẰNG PROPERTY GALLERY THÔNG MINH */}
          <div className="relative aspect-[16/10] bg-slate-100 w-full group-gallery">
            {item.videoUrl ? (
              // Nếu nhà đất có video, hiển thị cấu trúc chia đôi hoặc tab media, 
              // Tuy nhiên để tối ưu trải nghiệm, em giữ nguyên iframe video hoặc ưu tiên chạy Slide ảnh vuốt phóng to
              <div className="w-full h-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar">
                <div className="w-full h-full flex-shrink-0 snap-start relative">
                  <iframe className="w-full h-full" src={item.videoUrl} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                </div>
                <div className="w-full h-full flex-shrink-0 snap-start relative">
                  <PropertyGallery images={tatCaAnhGallery} alt={item.tieude} />
                </div>
              </div>
            ) : (
              // Nếu không có video, hiển thị full tràn khung Slider vuốt tay + chạm phóng to bự
              <PropertyGallery images={tatCaAnhGallery} alt={item.tieude} />
            )}

            {/* Badge thông báo tổng số lượng hình ảnh */}
            <div className="bg-slate-900/70 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-md absolute top-4 left-4 z-10 flex items-center gap-1 uppercase tracking-wider shadow pointer-events-none">
              <Layers className="w-3 h-3 text-amber-400" /> Media: {item.videoUrl ? '1 Video & ' : ''}{tatCaAnhGallery.length} Hình Ảnh
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <span className="bg-amber-500 text-slate-900 font-extrabold text-base px-3 py-1 rounded-xl shadow-sm">{item.gia}</span>
              <span className="text-xs text-slate-400 font-bold uppercase bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> {item.phapLy || 'Sổ hồng riêng'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-4 leading-snug">{item.tieude}</h1>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-400 text-xs mt-2 border-b border-slate-100 pb-4 font-semibold">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-amber-500" />{item.khuVucFull}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Ngày đăng: {item.ngayDang}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 my-6 p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-600 text-center font-semibold">
              <div>
                <div className="text-slate-400 text-[11px] font-bold uppercase mb-0.5 tracking-wider">Diện tích</div>
                <strong className="text-slate-900 text-sm sm:text-base">{item.dienTich || '---'}</strong>
              </div>
              <div>
                <div className="text-slate-400 text-[11px] font-bold uppercase mb-0.5 tracking-wider">Cấu trúc</div>
                <strong className="text-slate-900 text-sm sm:text-base">{item.phongNgu || 'Đất ở'}</strong>
              </div>
              <div>
                <div className="text-slate-400 text-[11px] font-bold uppercase mb-0.5 tracking-wider">Hướng</div>
                <strong className="text-slate-900 text-sm sm:text-base">{item.huong || 'Chưa rõ'}</strong>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {item.linkMap && <a href={item.linkMap} target="_blank" rel="noopener noreferrer" className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 rounded-xl py-2.5 px-3 text-center text-xs flex items-center justify-center gap-1.5 transition-colors"><Map className="w-4 h-4" /> Vị Trí Bản Đồ</a>}
              {item.anhSoDo && <a href={item.anhSoDo} target="_blank" rel="noopener noreferrer" className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 rounded-xl py-2.5 px-3 text-center text-xs flex items-center justify-center gap-1.5 transition-colors"><FileText className="w-4 h-4" /> Sổ Hồng Bản Vẽ</a>}
            </div>

            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-2">Mô tả chi tiết:</h4>
            <p className="text-slate-700 text-sm leading-relaxed text-justify whitespace-pre-line mb-8">{item.moTa}</p>

            <div className="flex gap-3 border-t border-slate-100 pt-6">
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
