const statusMap: Record<string, { bg: string; color: string; label: string }> =
  {
    confirmed: { bg: "#f0fdf4", color: "#16a34a", label: "Confirmed" },
    pending: { bg: "#fffbeb", color: "#d97706", label: "Pending" },
    flagged: { bg: "#fef2f2", color: "#dc2626", label: "Flagged" },
  };

export function TripStatusBadge({ status }: { status: string }) {
  const s = statusMap[status] ?? statusMap.pending;
  return (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-lg"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}
