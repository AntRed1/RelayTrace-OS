interface StatCardProps {
  label: string;
  value: number | string;
  badge?: string;
  badgeColor?: "green" | "blue" | "amber" | "red";
}

const colors = {
  green: { bg: "#f0fdf4", text: "#16a34a" },
  blue: { bg: "#eff6ff", text: "#2563eb" },
  amber: { bg: "#fffbeb", text: "#d97706" },
  red: { bg: "#fef2f2", text: "#dc2626" },
};

export function StatCard({
  label,
  value,
  badge,
  badgeColor = "green",
}: StatCardProps) {
  const c = colors[badgeColor];
  return (
    <div
      className="bg-white rounded-2xl p-5 border border-slate-200"
      style={{ boxShadow: "var(--rt-shadow-sm)" }}
    >
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
        {label}
      </p>
      <div className="flex items-end justify-between gap-2">
        <span className="text-3xl font-bold text-slate-900">{value}</span>
        {badge && (
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-lg"
            style={{ background: c.bg, color: c.text }}
          >
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
