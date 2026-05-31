"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Tooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { RoutePoint } from "./RelayPointsMap";
import { MapPoint } from "@/types";

// ─── Demo fallback (Houston — typical Amazon Relay hub) ───────────────────────

const DEMO_ROUTES: RoutePoint[][] = [
  [
    { lat: 29.785, lng: -95.393, label: "IAH Sort Center" },
    { lat: 29.762, lng: -95.367, label: "Relay Hub A" },
    { lat: 29.733, lng: -95.346, label: "Delivery Zone 1" },
    { lat: 29.710, lng: -95.358, label: "Stop A" },
    { lat: 29.685, lng: -95.420, label: "Delivery Zone 2" },
  ],
  [
    { lat: 29.772, lng: -95.402, label: "Hub North" },
    { lat: 29.748, lng: -95.428, label: "Checkpoint 1" },
    { lat: 29.701, lng: -95.490, label: "Delivery Zone 3" },
  ],
];

const ROUTE_COLORS = ["#2563eb", "#22d3ee", "#818cf8"];

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  routes?: RoutePoint[][];
  points?: MapPoint[];
  isDemo?: boolean;
}

export default function RelayPointsMapInner({ routes, points, isDemo }: Props) {
  // Fix Leaflet's default icon broken path in Next.js
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require("leaflet") as typeof import("leaflet");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  // ── Real GPS points mode ───────────────────────────────────────────────────
  if (points && points.length > 0) {
    const centerLat = points.reduce((s, p) => s + p.latitude,  0) / points.length;
    const centerLng = points.reduce((s, p) => s + p.longitude, 0) / points.length;

    return (
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={11}
        className="w-full h-full rounded-2xl"
        style={{ minHeight: "100%", zIndex: 0 }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.map((pt) => (
          <CircleMarker
            key={pt.id}
            center={[pt.latitude, pt.longitude]}
            radius={7}
            pathOptions={{
              color:       "#fff",
              fillColor:   "#2563eb",
              fillOpacity: 1,
              weight:      2,
            }}
          >
            <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
              <div className="text-xs">
                <p className="font-semibold">{pt.tripId}</p>
                <p className="text-slate-500">{pt.driver.name}</p>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    );
  }

  // ── Demo routes fallback ───────────────────────────────────────────────────
  const data = (routes && routes.length > 0) ? routes : DEMO_ROUTES;
  const allPoints = data.flat();
  const centerLat = allPoints.reduce((s, p) => s + p.lat, 0) / allPoints.length;
  const centerLng = allPoints.reduce((s, p) => s + p.lng, 0) / allPoints.length;

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={11}
        className="w-full h-full rounded-2xl"
        style={{ minHeight: "100%", zIndex: 0 }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {data.map((route, ri) => {
          const color     = ROUTE_COLORS[ri % ROUTE_COLORS.length];
          const positions = route.map((p) => [p.lat, p.lng] as [number, number]);
          return (
            <div key={ri}>
              <Polyline positions={positions} pathOptions={{ color, weight: 3, opacity: 0.85 }} />
              {route.map((point, pi) => {
                const isFirst = pi === 0;
                const isLast  = pi === route.length - 1;
                return (
                  <CircleMarker
                    key={`${ri}-${pi}`}
                    center={[point.lat, point.lng]}
                    radius={isFirst || isLast ? 7 : 5}
                    pathOptions={{
                      color:       "#fff",
                      fillColor:   isFirst ? "#22c55e" : isLast ? "#ef4444" : color,
                      fillOpacity: 1,
                      weight:      2,
                    }}
                  >
                    {point.label && (
                      <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
                        <span className="text-xs font-medium">{point.label}</span>
                      </Tooltip>
                    )}
                  </CircleMarker>
                );
              })}
            </div>
          );
        })}
      </MapContainer>

      {/* Demo data badge */}
      {isDemo && (
        <div className="absolute bottom-3 left-3 z-[400] flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 bg-white/90 border border-slate-200 backdrop-blur-sm shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          Demo data — no trips with GPS yet
        </div>
      )}
    </div>
  );
}
