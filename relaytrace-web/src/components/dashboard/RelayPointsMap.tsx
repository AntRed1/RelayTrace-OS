"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { MapPoint } from "@/types";

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
  routes?: RoutePoint[][];
  points?: MapPoint[];
}

export function RelayPointsMap({ routes, points }: Props) {
  const hasRealPoints = points && points.length > 0;
  return <MapInner routes={routes} points={points} isDemo={!hasRealPoints} />;
}
