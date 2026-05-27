import { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  badge?: string;
  badgeColor?: "green" | "blue" | "amber" | "red" | "purple";
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

const BADGE_STYLES = {
  green:  { bg: "#f0fdf4", text: "#16a34a", dot: "#22c55e" },
  blue:   { bg: "#eff6ff", text: "#2563eb", dot: "#3b82f6" },
  amber:  { bg: "#fffbeb", text: "#d97706", dot: "#f59e0b" },
  red:    { bg: "#fef2f2", text: "#dc2626", dot: "#ef4444" },
  purple: { bg: "#f5f3ff", text: "#7c3aed", dot: "#8b5cf6" },
};

export function StatCard({
  label,
  value,
  badge,
  badgeColor = "green",
  icon: Icon,
  trend,
  trendValue,
}: StatCardProps) {
  const c = BADGE_STYLES[badgeColor];

  return (
    <div
      className="bg-white rounded-2xl p-5 border border-slate-100 flex flex-col gap-3 hover:shadow-md transition-shadow"
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
    >
      {/* Top row: label + icon */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          {label}
        </p>
        {Icon && (
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: c.bg }}
          >
            <Icon size={15} style={{ color: c.text }} />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="flex items-end justify-between gap-2">
        <span className="text-3xl font-extrabold text-slate-900 leading-none">
          {value}
        </span>

        {badge && (
          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg"
            style={{ background: c.bg, color: c.text }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: c.dot }}
            />
            {badge}
          </span>
        )}
      </div>

      {/* Trend */}
      {trend && trendValue && (
        <div className="flex items-center gap-1 text-xs">
          {trend === "up" ? (
            <TrendingUp size={12} className="text-emerald-500" />
          ) : trend === "down" ? (
            <TrendingDown size={12} className="text-red-400" />
          ) : null}
          <span
            className="font-medium"
            style={{ color: trend === "up" ? "#16a34a" : trend === "down" ? "#dc2626" : "#94a3b8" }}
          >
            {trendValue}
          </span>
        </div>
      )}
    </div>
  );
}
