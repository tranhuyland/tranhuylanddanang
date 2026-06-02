'use client';
import React, { useState, useEffect } from "react";
import { MapPin, Compass, Clock, Square, Bed, ChevronRight } from "lucide-react";
import { Modals } from "./Modals";

export default function ListingSection({ allBdsItems, forceDistrict }: { allBdsItems: any[]; forceDistrict?: string }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const itemsPerPage = 6;

  const currentItems = allBdsItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(allBdsItems.length / itemsPerPage);

  return (
    <main className="max-w-7xl mx-auto w-full px-4 mt-16 mb-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
        {currentItems.map((item) => (
          <div 
            key={item.id} 
            onClick={() => setSelectedProduct(item)}
            className="cursor-pointer bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
              <img src={item.anh.split(',')[0]} alt={item.tieude} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <span className="absolute bottom-3 right-3 bg-slate-900/90 text-white font-extrabold text-sm px-3 py-1 rounded-xl">{item.gia}</span>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-slate-900 line-clamp-2">{item.tieude}</h3>
              <div className="mt-4 pt-4 border-t flex justify-between text-xs text-slate-400">
                <span>{item.dienTich}</span>
                <span className="text-amber-500 font-bold flex items-center">Chi tiết <ChevronRight className="w-3 h-3" /></span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10">
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-9 h-9 rounded-xl font-bold ${currentPage === i + 1 ? "bg-amber-500 text-slate-900" : "bg-white border"}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {selectedProduct && (
        <Modals type="product" isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} data={selectedProduct} />
      )}
    </main>
  );
}
