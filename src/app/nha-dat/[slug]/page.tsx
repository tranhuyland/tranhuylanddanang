import { getBdsData } from "@/lib/googleSheets";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, MapPin, Calendar, ShieldCheck, Square, Bed, Layers, Map, FileText, Phone } from "lucide-react";

interface Props { params: Promise<{ slug: string }>; }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const data = await getBdsData();
  const item: any = data.find(p => p.slug === slug);
  if (!item) return { title: "Không tìm thấy sản phẩm" };
  return {
    title: `${item.tieude || item.title} | Trần Huy Land`,
    description: `Giá bán: ${item.gia}. Diện tích: ${item.dienTich}. Vị trí: ${item.khuVucFull}. ${item.moTa?.substring(0, 150)}...`,
  };
}

export default async function NhaDatDetail({ params }: Props) {
  const { slug } = await params;
  const data = await getBdsData();
  const item: any = data.find(p => p.slug === slug);
  if (!item) notFound();
  
  const danhSachAnh = item.anh ? item.anh.split(",").map((a: string) => a.trim()) : [];

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-10 flex-1">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 mb-6">
          <ChevronLeft className="w-4 h-4" /> QUAY LẠI TRANG CHỦ
        </Link>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          <div className="relative aspect-[16/10] bg-slate-100 w-full">
            <div className="w-full h-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar">
              {danhSachAnh.map((url: string, idx: number) => (
                <div key={idx} className="w-full h-full flex-shrink-0 snap-start relative">
                  <Image src={url} alt={item.tieude || "Hình ảnh bất động sản"} fill className="object-cover" priority={idx === 0} />
                </div>
              ))}
            </div>
            <div className="bg-slate-900/60 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-md absolute top-4 left-4 z-10 flex items-center gap-1">
              <Layers className="w-3 h-3 text-amber-400" /> Tổng số: {danhSachAnh.length} Ảnh
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <span className="bg-amber-500 text-slate-900 font-extrabold text-base px-3 py-1 rounded-xl shadow-sm">{item.gia}</span>
              <span className="text-xs text-slate-400 font-bold uppercase bg-slate-50 px-2.5 py-1 rounded-lg border flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-emerald-500" /> {item.phapLy || 'Sổ hồng chính chủ'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-4 leading-snug">{item.tieude || item.title}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-400 text-xs mt-2 border-b border-slate-100 pb-4 font-semibold">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-amber-500" />{item.khuVucFull}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Ngày đăng: {item.ngayDang}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 my-6 p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-600 text-center font-semibold">
              <div><div className="text-slate-400 text-[11px] font-bold uppercase mb-0.5">Diện tích</div><strong className="text-slate-900 text-sm">{item.dienTich}</strong></div>
              <div><div className="text-slate-400 text-[11px] font-bold uppercase mb-0.5">Cấu trúc</div><strong className="text-slate-900 text-sm">{item.phongNgu || 'Đất ở'}</strong></div>
              <div><div className="text-slate-400 text-[11px] font-bold uppercase mb-0.5">Hướng</div><strong className="text-slate-900 text-sm">{item.huong || 'Chưa rõ'}</strong></div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {item.linkMap && <a href={item.linkMap} target="_blank" rel="noopener noreferrer" className="bg-emerald-50 text-emerald-700 font-bold border rounded-xl py-2.5 px-3 text-center text-xs flex items-center justify-center gap-1.5"><Map className="w-4 h-4" /> Vị Trí Bản Đồ</a>}
              {item.anhSoDo && <a href={item.anhSoDo} target="_blank" rel="noopener noreferrer" className="bg-indigo-50 text-indigo-700 font-bold border rounded-xl py-2.5 px-3 text-center text-xs flex items-center justify-center gap-1.5"><FileText className="w-4 h-4" /> Sổ Hồng Bản Vẽ</a>}
            </div>
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-2">Mô tả chi tiết:</h4>
            <p className="text-slate-700 text-sm leading-relaxed text-justify whitespace-pre-line mb-8">{item.moTa}</p>
            <div className="flex gap-3 border-t border-slate-100 pt-6">
              <a href="tel:0931555551" className="flex-1 bg-slate-900 text-white font-extrabold rounded-xl py-3 px-4 flex items-center justify-center gap-2 text-sm shadow-md"><Phone className="w-4 h-4 text-amber-400 fill-amber-400" /> Gọi Thương Lượng</a>
              <a href="https://zalo.me/0931555551" target="_blank" rel="noopener noreferrer" className="flex-1 bg-[#0068ff] text-white font-extrabold rounded-xl py-3 px-4 flex items-center justify-center text-sm shadow-md">Kết Nối Zalo</a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <FloatingWidgets />
    </>
  );
}
