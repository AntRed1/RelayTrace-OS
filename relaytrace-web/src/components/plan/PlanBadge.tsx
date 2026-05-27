import { PlanName, PLAN_CONFIG } from "@/config/plan.config";

interface Props {
  plan: PlanName | string;
  size?: "sm" | "md";
}

export function PlanBadge({ plan, size = "sm" }: Props) {
  const config = PLAN_CONFIG[plan as PlanName];
  if (!config) return null;

  return (
    <span
      className={
        size === "sm"
          ? "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
          : "text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
      }
      style={{
        background: config.color + "18",
        color: config.color,
        border: `1px solid ${config.color}33`,
      }}
    >
      {config.displayName}
    </span>
  );
}
