"use client";
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

// 📍 Tọa độ trung tâm Đà Nẵng
const DA_NANG_CENTER: [number, number] = [16.0544, 108.2022];

// 🗺️ Từ điển tọa độ giả lập trung tâm các Phường/Xã (Dùng làm cơ chế dự phòng)
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
  "Hòa Hải": [15.9920, 108.2600],
  "An Hải": [16.0650, 108.2350],
  "An Khê": [16.0610, 108.1750],
  "Hòa Minh": [16.0670, 108.1580]
};

// ⚙️ Thuật toán bóc tách tọa độ từ chữ (VD: "16.035, 108.218")
const parseCoordinates = (coordStr: any): [number, number] | null => {
  if (!coordStr || typeof coordStr !== 'string') return null;
  const parts = coordStr.split(',');
  if (parts.length === 2) {
    const lat = parseFloat(parts[0].trim());
    const lng = parseFloat(parts[1].trim());
    if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
  }
  return null;
};

export default function MapWrapper({ bdsList }: { bdsList: any[] }) {
  return (
    <MapContainer
      center={DA_NANG_CENTER}
      zoom={13}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%", zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {bdsList?.map((item, index) => {
        // 1. Quét tìm cột Tọa độ trong Google Sheet (Bao quát các cách viết hoa/thường)
        const rawToaDo = item.toaDo || item.toado || item.ToaDo || item['ToaDo'] || item['Tọa độ'];
        const exactCoord = parseCoordinates(rawToaDo);

        let lat: number, lng: number;

        if (exactCoord) {
          // 🎯 TRƯỜNG HỢP 1: Có tọa độ chính xác -> Bắn tỉa đúng vị trí
          lat = exactCoord[0];
          lng = exactCoord[1];
        } else {
          // 🎲 TRƯỜNG HỢP 2: Không có tọa độ -> Dùng thuật toán tản mác quanh Phường
          const baseCoord = PHUONG_COORDS[item.khuVuc] || DA_NANG_CENTER;
          lat = baseCoord[0] + (Math.random() - 0.5) * 0.015;
          lng = baseCoord[1] + (Math.random() - 0.5) * 0.015;
        }

        return (
          <Marker key={index} position={[lat, lng]}>
            <Popup>
              <div className="text-sm font-sans min-w-[150px]">
                <strong className="text-orange-500 block text-base mb-1">{item.gia || "Thỏa thuận"}</strong>
                <p className="text-slate-700 font-medium leading-tight mb-2 line-clamp-2">{item.tieude}</p>
                <div className="text-xs text-slate-500 mb-2 flex flex-col gap-1">
                  <span>📍 {item.diaChi || item.khuVuc}</span>
                  {exactCoord && <span className="text-emerald-600 bg-emerald-50 inline-block px-1.5 py-0.5 rounded w-fit">✓ Tọa độ chính xác</span>}
                </div>
                <a href={`/nha-dat/${item.slug}`} className="text-blue-600 font-bold text-xs hover:underline flex items-center gap-1" target="_blank" rel="noopener noreferrer">
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
