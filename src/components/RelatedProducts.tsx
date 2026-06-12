import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ChevronRight } from 'lucide-react';
import { layUrlAnhChuan } from '@/lib/utils';

interface RelatedProductsProps {
  currentItem: any;
  allItems: any[];
}

export default function RelatedProducts({ currentItem, allItems }: RelatedProductsProps) {
  // Thuật toán tìm sản phẩm liên quan: Cùng Phường hoặc Cùng Loại hình (trừ căn hiện tại)
  const relatedItems = allItems.filter((item) => {
    if (!item || !currentItem) return false;
    if (item.slug === currentItem.slug) return false; // Bỏ qua căn đang xem
    
    const isCungPhuong = item.khuVuc === currentItem.khuVuc && item.khuVuc !== undefined;
    const isCungLoaiHinh = item.loaiHinh === currentItem.loaiHinh && item.loaiHinh !== undefined;
    
    return isCungPhuong || isCungLoaiHinh;
  }).slice(0, 3); // Lấy tối đa 3 căn hiển thị cho đẹp

  // Nếu không tìm thấy căn nào liên quan thì ẩn khu vực này đi
  if (relatedItems.length === 0) return null;

  return (
    <section className="mt-16 mb-8 border-t border-slate-100 pt-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-extrabold text-slate-800">
          Có thể bạn sẽ thích
        </h2>
        <Link href="/" className="text-orange-600 text-sm font-bold flex items-center gap-1 hover:text-orange-700 transition-colors">
          Xem tất cả <ChevronRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {relatedItems.map((item, index) => {
          const thumbnail = layUrlAnhChuan(item.anh);
          return (
            <Link 
              href={`/nha-dat/${item.slug}`} 
              key={index}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-orange-500/10 border border-slate-100 hover:border-orange-200 transition-all duration-300 transform hover:-translate-y-1 block"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                <Image 
                  src={thumbnail} 
                  alt={item.tieude || "Bất động sản Trần Huy Land"} 
                  fill 
                  className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-xs px-2.5 py-1 rounded-lg shadow-md z-10">
                  {item.gia}
                </div>
              </div>
              
              <div className="p-4">
                <div className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1 group-hover:text-orange-500 transition-colors">
                  <MapPin size={12} className="text-orange-500" />
                  <span className="truncate">{item.khuVuc || item.diaChi || "Đà Nẵng"}</span>
                </div>
                <h3 className="text-slate-800 font-bold text-sm line-clamp-2 group-hover:text-orange-600 transition-colors leading-snug">
                  {item.tieude}
                </h3>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
