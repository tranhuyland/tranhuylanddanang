import { getBdsData } from "@/lib/googleSheets";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, MapPin, Calendar, ShieldCheck, Square, Bed, Layers, Map, FileText, Phone } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function NhaDatDetail({ params }: Props) {
  const { slug } = await params;
  const data = await getBdsData();
  const item = data.find((p) => p.slug === slug);

  if (!item) {
    notFound();
  }

  const danhSachAnh = item.anh
    ? item.anh.split(",").map((a: string) => a.trim()).filter((a: string) => a.startsWith("http"))
    : ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80"];

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-10 flex-1">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> QUAY LẠI TRANG CHỦ
        </Link>
        
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          <div className="relative aspect-[16/10] bg-slate-100 w-full overflow-hidden">
            <div className="w-full h-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth">
              {danhSachAnh.map((url: string, idx: number) => (
                <div key={idx} className="w-full h-full flex-shrink-0 snap-start relative">
                  <Image src={url} alt={item.tieude} fill className="object-cover" priority={idx === 0} sizes="(max-w-4xl) 100vw" />
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-4">{item.tieude}</h1>
            <p className="mt-4 text-slate-700 text-sm leading-relaxed whitespace-pre-line">{item.moTa}</p>
          </div>
        </div>
      </main>
      <Footer />
      <FloatingWidgets />
    </>
  );
}
