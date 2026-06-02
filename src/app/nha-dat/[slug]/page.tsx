// Trong file src/app/nha-dat/[slug]/page.tsx, tìm phần <div className="relative aspect-[16/10] bg-slate-100 w-full">...</div>
// Và thay bằng đoạn mã dưới đây:

<div className="relative aspect-[16/10] bg-slate-100 w-full group">
  {/* Thanh cuộn chứa ảnh */}
  <div id="image-scroll-container" className="w-full h-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth">
    {danhSachAnh.map((url: string, idx: number) => (
      <div key={idx} className="w-full h-full flex-shrink-0 snap-start relative">
        <Image src={url} alt={`${item.tieude} - Ảnh ${idx + 1}`} fill className="object-cover" priority={idx === 0} sizes="(max-w-4xl) 100vw" />
      </div>
    ))}
  </div>

  {/* NÚT MŨI TÊN TRÁI PHẢI */}
  {danhSachAnh.length > 1 && (
    <>
      <button 
        onClick={() => document.getElementById('image-scroll-container')?.scrollBy({ left: -300, behavior: 'smooth' })}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-all z-10"
      >
        <ChevronLeft className="w-5 h-5 text-slate-900" />
      </button>
      <button 
        onClick={() => document.getElementById('image-scroll-container')?.scrollBy({ left: 300, behavior: 'smooth' })}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-all z-10"
      >
        <ChevronLeft className="w-5 h-5 text-slate-900 rotate-180" />
      </button>
    </>
  )}

  <div className="bg-slate-900/70 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-md absolute top-4 left-4 z-10 flex items-center gap-1 uppercase tracking-wider shadow">
    <Layers className="w-3 h-3 text-amber-400" /> {danhSachAnh.length} Ảnh
  </div>
</div>
