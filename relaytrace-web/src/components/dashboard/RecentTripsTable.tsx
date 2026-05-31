import Link from "next/link";
import { Trip } from "@/types";
import { safeFormat } from "@/lib/utils";
import { ROUTES } from "@/config/constants";
import { Clock, ArrowUpRight } from "lucide-react";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { dot: string; label: string; bg: string; text: string }> = {
  confirmed: { dot: "#22c55e", label: "Confirmed", bg: "#f0fdf4", text: "#16a34a" },
  pending:   { dot: "#f59e0b", label: "In Transit", bg: "#fffbeb", text: "#d97706" },
  flagged:   { dot: "#ef4444", label: "Flagged",   bg: "#fef2f2", text: "#dc2626" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function displayRegisteredAt(trip: Trip): string {
  return safeFormat(trip.registeredAt, "h:mm a") ?? "—";
}

// ─── Row component ────────────────────────────────────────────────────────────

function TripRow({ trip, idx, total, isSuperAdmin }: {
  trip: Trip;
  idx: number;
  total: number;
  isSuperAdmin: boolean;
}) {
  const s = STATUS_CONFIG[trip.status] ?? STATUS_CONFIG.pending;

  return (
    <tr
      className="group hover:bg-slate-50/60 transition-colors"
      style={{ borderBottom: idx < total - 1 ? "1px solid #f1f5f9" : "none" }}
    >
      {/* Trip info */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold text-white"
            style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)" }}
          >
            {trip.tripId?.slice(-2) ?? "—"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate max-w-[120px]">
              {trip.tripId}
            </p>
            <p className="text-xs text-slate-400">
              {safeFormat(trip.registeredAt, "MMM d, h:mm a")}
            </p>
          </div>
        </div>
      </td>

      {/* Driver */}
      <td className="px-3 py-3.5">
        <p className="text-sm text-slate-700 font-medium truncate max-w-[100px]">
          {trip.driver?.name ?? "—"}
        </p>
        <p className="text-xs text-slate-400 truncate max-w-[100px]">
          {trip.driver?.email ?? ""}
        </p>
      </td>

      {/* Company — SUPER_ADMIN only */}
      {isSuperAdmin && (
        <td className="px-3 py-3.5">
          {trip.company ? (
            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
              {trip.company.name}
            </span>
          ) : (
            <span className="font-mono text-xs text-slate-300">
              {trip.companyId?.slice(0, 8)}…
            </span>
          )}
        </td>
      )}

      {/* Duration / time */}
      <td className="px-3 py-3.5">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock size={11} className="shrink-0" />
          {displayRegisteredAt(trip)}
        </div>
      </td>

      {/* Status */}
      <td className="px-3 py-3.5">
        <span
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ background: s.bg, color: s.text }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: s.dot }}
          />
          {s.label}
        </span>
      </td>
    </tr>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  trips: Trip[];
  isSuperAdmin?: boolean;
}

export function RecentTripsTable({ trips, isSuperAdmin = false }: Props) {
  const colCount = isSuperAdmin ? 5 : 4;

  return (
    <div
      className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col"
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
    >
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-slate-50">
        <div>
          <h2 className="text-sm font-bold text-slate-800">Recent Trips</h2>
          <p className="text-xs text-slate-400 mt-0.5">{trips.length} latest entries</p>
        </div>
        <Link
          href={ROUTES.ADMIN.TRIPS}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50"
        >
          View all <ArrowUpRight size={12} />
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-auto flex-1">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid #f8fafc" }}>
              {[
                "Trip",
                "Driver",
                ...(isSuperAdmin ? ["Company"] : []),
                "Registered",
                "Status",
              ].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {trips.length === 0 ? (
              <tr>
                <td
                  colSpan={colCount}
                  className="px-5 py-10 text-center text-sm text-slate-400"
                >
                  No trips recorded yet
                </td>
              </tr>
            ) : (
              trips.map((trip, i) => (
                <TripRow
                  key={trip.id}
                  trip={trip}
                  idx={i}
                  total={trips.length}
                  isSuperAdmin={isSuperAdmin}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
