"use client";
import React, { useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

const DA_NANG_CENTER: [number, number] = [16.0544, 108.2022];

function LocationMarker({ position, setPosition }: { position: [number, number] | null, setPosition: (pos: [number, number]) => void }) {
  const markerRef = useRef<any>(null);

  // Bắt sự kiện Click lên bản đồ để thả ghim
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  // Bắt sự kiện Kéo thả ghim để tinh chỉnh vị trí
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latLng = marker.getLatLng();
          setPosition([latLng.lat, latLng.lng]);
        }
      },
    }),
    [setPosition]
  );

  return position ? (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    ></Marker>
  ) : null;
}

export default function LocationPickerMap({ 
  toaDo, 
  onLocationSelect 
}: { 
  toaDo: string; 
  onLocationSelect: (pos: [number, number]) => void 
}) {
  // Chuyển đổi chuỗi "lat, lng" thành mảng tọa độ để vẽ lên bản đồ
  const currentPosition: [number, number] | null = useMemo(() => {
    if (!toaDo) return null;
    const parts = toaDo.split(',');
    if (parts.length === 2) {
      const lat = parseFloat(parts[0].trim());
      const lng = parseFloat(parts[1].trim());
      if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
    }
    return null;
  }, [toaDo]);

  return (
    <MapContainer 
      center={currentPosition || DA_NANG_CENTER} 
      zoom={currentPosition ? 16 : 12} 
      scrollWheelZoom={true} 
      style={{ height: "100%", width: "100%", zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker position={currentPosition} setPosition={onLocationSelect} />
    </MapContainer>
  );
}
