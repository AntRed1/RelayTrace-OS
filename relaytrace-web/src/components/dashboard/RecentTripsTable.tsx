import { Trip } from "@/types";
import { safeFormat } from "@/lib/utils";

const statusStyles: Record<
  string,
  { bg: string; color: string; label: string }
> = {
  confirmed: { bg: "#f0fdf4", color: "#16a34a", label: "Confirmed" },
  pending: { bg: "#fffbeb", color: "#d97706", label: "Pending" },
  flagged: { bg: "#fef2f2", color: "#dc2626", label: "Flagged" },
};

export function RecentTripsTable({ trips }: { trips: Trip[] }) {
  return (
    <div
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
      style={{ boxShadow: "var(--rt-shadow-sm)" }}
    >
      <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-800">Recent Trips</h2>
        <button className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
          View all →
        </button>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            {["Trip ID", "Driver", "Registered", "Status"].map((h) => (
              <th
                key={h}
                className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {trips.map((trip, i) => {
            const s = statusStyles[trip.status] ?? statusStyles.pending;
            return (
              <tr
                key={trip.id}
                className="hover:bg-slate-50/70 transition-colors"
                style={{
                  borderBottom:
                    i < trips.length - 1 ? "1px solid #f8fafc" : "none",
                }}
              >
                <td className="px-5 py-3.5 font-medium text-slate-800">
                  {trip.tripId}
                </td>
                <td className="px-5 py-3.5">
                  <p className="font-medium text-slate-800">
                    {trip.driver?.name ?? "—"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {trip.driver?.email ?? ""}
                  </p>
                </td>
                <td className="px-5 py-3.5 text-xs text-slate-500">
                  {safeFormat(trip.registeredAt, "MMM d, h:mm a")}
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                    style={{ background: s.bg, color: s.color }}
                  >
                    {s.label}
                  </span>
                </td>
              </tr>
            );
          })}
          {trips.length === 0 && (
            <tr>
              <td
                colSpan={4}
                className="px-5 py-10 text-center text-sm text-slate-400"
              >
                No trips yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
