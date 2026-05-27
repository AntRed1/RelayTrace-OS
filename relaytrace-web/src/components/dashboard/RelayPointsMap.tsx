"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// ─── Lazy-load the actual map to avoid SSR issues with Leaflet ────────────────

const MapInner = dynamic(() => import("./RelayPointsMapInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-2xl">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={22} className="animate-spin text-blue-400" />
        <p className="text-xs text-slate-400">Loading map…</p>
      </div>
    </div>
  ),
});

export interface RoutePoint {
  lat: number;
  lng: number;
  label?: string;
}

interface Props {
  /** Optional list of waypoints to display. Falls back to demo data. */
  routes?: RoutePoint[][];
}

export function RelayPointsMap({ routes }: Props) {
  return <MapInner routes={routes} />;
}
