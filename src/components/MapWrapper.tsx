"use client";
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

// Tọa độ trung tâm Đà Nẵng
const DA_NANG_CENTER: [number, number] = [16.0544, 108.2022];

// Từ điển tọa độ giả lập trung tâm các Phường/Xã
const PHUONG_COORDS: Record<string, [number, number]> = {
  "Hòa Cường": [16.0350, 108.2180],
  "Hải Châu": [16.0680, 108.2200],
  "Thanh Khê": [16.0630, 108.1880],
  "Sơn Trà": [16.0820, 108.2380],
  "Ngũ Hành Sơn": [16.0120, 108.2520],
  "Hòa Xuân": [16.0020, 108.2160],
  "Cẩm Lệ": [16.0150, 108.2000],
  "Liên Chiểu": [16.0830, 108.1460],
  "Hòa Quý": [15.9850, 108.2500],
  "Hòa Hải": [15.9920, 108.2600]
};

export default function MapWrapper({ bdsList }: { bdsList: any[] }) {
  return (
    <MapContainer
      center={DA_NANG_CENTER}
      zoom={12}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%", zIndex: 0 }}
    >
      {/* Lớp nền Bản đồ mã nguồn mở (Giống Google Maps) */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Vòng lặp hiển thị Ghim (Marker) cho từng căn nhà */}
      {bdsList?.map((item, index) => {
        // Lấy tọa độ theo Phường, nếu chưa có Phường trong từ điển thì lấy trung tâm Đà Nẵng
        const baseCoord = PHUONG_COORDS[item.khuVuc] || DA_NANG_CENTER;
        
        // Thuật toán tản mác: Cộng trừ ngẫu nhiên một chút xíu kinh/vĩ độ 
        // để nếu có 10 căn ở Hòa Cường thì các ghim không đè trùng khít lên nhau 100%
        const lat = baseCoord[0] + (Math.random() - 0.5) * 0.015;
        const lng = baseCoord[1] + (Math.random() - 0.5) * 0.015;

        return (
          <Marker key={index} position={[lat, lng]}>
            <Popup>
              <div className="text-sm font-sans min-w-[150px]">
                <strong className="text-orange-500 block text-base mb-1">{item.gia}</strong>
                <p className="text-slate-700 leading-tight mb-2 line-clamp-2">{item.tieude}</p>
                <p className="text-xs text-slate-500 mb-2">📍 {item.khuVuc}</p>
                <a href={`/nha-dat/${item.slug}`} className="text-blue-600 font-bold text-xs hover:underline">
                  Xem chi tiết &rarr;
                </a>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
