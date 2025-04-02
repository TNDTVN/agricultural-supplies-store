"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

// Fix icon issue in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "/leaflet/marker-icon-2x.png",
    iconUrl: "/leaflet/marker-icon.png",
    shadowUrl: "/leaflet/marker-shadow.png",
});

export default function Map() {
    const position: [number, number] = [10.4222600, 105.6408932];

    return (
        <MapContainer
        center={position}
        zoom={13}
        style={{ height: "400px", width: "100%" }}
        className="rounded-lg z-0" // Thêm z-0 để tránh chồng lên nav
        >
        <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position}>
            <Popup>Phạm Hữu Lầu, Phường 6, Cao Lãnh, Đồng Tháp</Popup>
        </Marker>
        </MapContainer>
    );
}