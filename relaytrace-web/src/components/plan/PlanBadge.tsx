// ─── Seed-plan accent colours ────────────────────────────────────────────────
// Known slugs get branded colours; any slug created in /admin/plans gets a
// deterministic teal fallback so the badge never silently disappears.

const SLUG_COLORS: Record<string, string> = {
  starter: "#64748b",
  growth:  "#2563eb",
  fleet:   "#7c3aed",
};

function planColor(slug: string): string {
  return SLUG_COLORS[slug] ?? "#0891b2";
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  /** Plan slug — accepts any string, not just the seed plan names. */
  plan:          string;
  /** Override display text. Falls back to capitalised slug. */
  displayName?:  string;
  size?:         "sm" | "md";
}

export function PlanBadge({ plan, displayName, size = "sm" }: Props) {
  const color = planColor(plan);
  const label = displayName ?? (plan.charAt(0).toUpperCase() + plan.slice(1));

  return (
    <span
      className={
        size === "sm"
          ? "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
          : "text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
      }
      style={{
        background: color + "18",
        color,
        border: `1px solid ${color}33`,
      }}
    >
      {label}
    </span>
  );
}
