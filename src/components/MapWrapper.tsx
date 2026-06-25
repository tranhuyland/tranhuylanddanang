"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

const DA_NANG_CENTER: [number, number] = [16.0544, 108.2022];

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
  "Hòa Minh": [16.0670, 108.1580],
};

const parseCoordinates = (coordStr: any): [number, number] | null => {
  if (!coordStr || typeof coordStr !== "string") return null;

  const parts = coordStr.split(",");

  if (parts.length !== 2) return null;

  const lat = parseFloat(parts[0].trim());
  const lng = parseFloat(parts[1].trim());

  if (isNaN(lat) || isNaN(lng)) return null;

  return [lat, lng];
};

// tạo offset cố định theo id
const generateStableOffset = (seed: string) => {
  let hash = 0;

  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  const latOffset = ((hash % 100) - 50) * 0.0001;
  const lngOffset = (((hash >> 3) % 100) - 50) * 0.0001;

  return {
    latOffset,
    lngOffset,
  };
};

export default function MapWrapper({
  bdsList,
}: {
  bdsList: any[];
}) {
  const markers = useMemo(() => {
    return bdsList.map((item) => {
      const rawToaDo =
        item.toaDo ||
        item.toado ||
        item.ToaDo ||
        item["ToaDo"] ||
        item["Tọa độ"];

      const exactCoord = parseCoordinates(rawToaDo);

      let lat: number;
      let lng: number;

      if (exactCoord) {
        lat = exactCoord[0];
        lng = exactCoord[1];
      } else {
        const base =
          PHUONG_COORDS[item.khuVuc] || DA_NANG_CENTER;

        const offset = generateStableOffset(
          item.id?.toString() ||
            item.slug ||
            item.tieude ||
            ""
        );

        lat = base[0] + offset.latOffset;
        lng = base[1] + offset.lngOffset;
      }

      return {
        item,
        lat,
        lng,
        exactCoord,
      };
    });
  }, [bdsList]);

  return (
    <MapContainer
      center={DA_NANG_CENTER}
      zoom={12}
      scrollWheelZoom={true}
      style={{
        height: "100%",
        width: "100%",
      }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {markers.map(({ item, lat, lng, exactCoord }) => (
        <Marker
          key={item.id || item.slug}
          position={[lat, lng]}
        >
          <Popup>
            <div className="min-w-[180px]">
              <div className="font-bold text-orange-600 mb-1">
                {item.gia || "Thỏa thuận"}
              </div>

              <div className="text-sm line-clamp-2 mb-2">
                {item.tieude}
              </div>

              <div className="text-xs text-slate-500 mb-2">
                📍 {item.diaChi || item.khuVuc}
              </div>

              {exactCoord && (
                <div className="inline-block text-[11px] px-2 py-1 rounded bg-emerald-50 text-emerald-700 mb-2">
                  ✓ Vị trí chính xác
                </div>
              )}

              <Link
                href={`/nha-dat/${item.slug}`}
                className="block text-blue-600 font-semibold text-xs"
              >
                Xem chi tiết →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
