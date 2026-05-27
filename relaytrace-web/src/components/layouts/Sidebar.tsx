"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Truck,
  Users,
  ScanLine,
  GitMerge,
  Settings,
  LogOut,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth.store";
import { ROUTES } from "@/config/constants";
import { useCompanyRequests } from "@/hooks/use-companies";
import { useSidebar } from "@/contexts/sidebar.context";

// ─── Nav definition ───────────────────────────────────────────────────────────

const BASE_NAV = [
  { label: "Dashboard",      href: ROUTES.ADMIN.DASHBOARD,     icon: LayoutDashboard },
  { label: "Trips",          href: ROUTES.ADMIN.TRIPS,          icon: Truck           },
  { label: "People",         href: ROUTES.ADMIN.DRIVERS,        icon: Users           },
  { label: "OCR Processing", href: "/admin/ocr",                icon: ScanLine        },
  { label: "Reconciliation", href: ROUTES.ADMIN.RECONCILIATION, icon: GitMerge        },
];

// ─── Badge ────────────────────────────────────────────────────────────────────

function PendingBadge({ count, collapsed }: { count: number; collapsed: boolean }) {
  if (count === 0) return null;
  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-full text-[10px] font-bold text-white px-1",
        collapsed ? "w-4 h-4 absolute -top-0.5 -right-0.5" : "ml-auto min-w-[18px] h-[18px]",
      )}
      style={{ background: "linear-gradient(135deg,#f97316,#ef4444)" }}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

// ─── Nav item ─────────────────────────────────────────────────────────────────

function NavItem({
  href,
  label,
  icon: Icon,
  collapsed,
  badge,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  collapsed: boolean;
  badge?: number;
}) {
  const pathname = usePathname();
  const active   = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        "relative flex items-center rounded-xl text-sm font-medium transition-all duration-200",
        collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
        active ? "text-white" : "hover:bg-slate-100",
      )}
      style={
        active
          ? { background: "linear-gradient(135deg,#2563eb,#1d4ed8)", color: "#fff" }
          : { color: "var(--text-secondary, #64748b)" }
      }
    >
      <Icon size={17} className="shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
      {badge !== undefined && <PendingBadge count={badge} collapsed={collapsed} />}
    </Link>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Sidebar() {
  const { user, logout }    = useAuth();
  const authUser             = useAuthStore((s) => s.user);
  const isSuperAdmin         = authUser?.role === "SUPER_ADMIN";
  const { collapsed, mobileOpen, toggle, closeMobile } = useSidebar();

  // Badge: pending requests count (SUPER_ADMIN only)
  const { data: pendingRequests } = useCompanyRequests("pending", isSuperAdmin);
  const pendingCount = pendingRequests?.length ?? 0;

  const w = collapsed ? "w-16" : "w-64";

  return (
    <>
      {/* ── Mobile overlay ─────────────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-slate-900/40 lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* ── Sidebar panel ──────────────────────────────────────────────────── */}
      <aside
        className={cn(
          // Base — always fixed on mobile, static on desktop
          "fixed lg:static inset-y-0 left-0 z-30 flex flex-col border-r",
          "transition-all duration-300 ease-in-out",
          // Desktop width
          w,
          // Mobile: translate when closed
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
        style={{
          background:   "var(--bg-sidebar, #fff)",
          borderColor:  "var(--border, #f1f5f9)",
        }}
      >
        {/* ── Logo ─────────────────────────────────────────────────────────── */}
        <div
          className="flex items-center border-b shrink-0 overflow-hidden"
          style={{
            borderColor: "var(--border, #f1f5f9)",
            height: 56,
            padding: collapsed ? "0 12px" : "0 20px",
            justifyContent: collapsed ? "center" : "flex-start",
          }}
        >
          {collapsed ? (
            <Link href="/" title="RelayTrace OS">
              <Image
                src="/images/logo.png"
                alt="RelayTrace"
                width={32}
                height={32}
                style={{ width: "32px", height: "32px" }}
              />
            </Link>
          ) : (
            <Link href="/" className="shrink-0">
              <Image
                src="/images/logo-horizontal.png"
                alt="RelayTrace OS"
                width={160}
                height={40}
                style={{ width: "auto", height: "36px" }}
                priority
              />
            </Link>
          )}
        </div>

        {/* ── Nav ──────────────────────────────────────────────────────────── */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {BASE_NAV.map(({ label, href, icon }) => (
            <NavItem
              key={href}
              href={href}
              label={label}
              icon={icon}
              collapsed={collapsed}
            />
          ))}

          {/* Onboarding — SUPER_ADMIN only */}
          {isSuperAdmin && (
            <NavItem
              href={ROUTES.ADMIN.ONBOARDING}
              label="Onboarding"
              icon={ClipboardList}
              collapsed={collapsed}
              badge={pendingCount}
            />
          )}
        </nav>

        {/* ── User + Logout ─────────────────────────────────────────────────── */}
        <div
          className="px-2 py-3 border-t space-y-0.5"
          style={{ borderColor: "var(--border, #f1f5f9)" }}
        >
          {/* Settings */}
          <Link
            href={ROUTES.ADMIN.SETTINGS}
            title={collapsed ? "Settings" : undefined}
            className={cn(
              "flex items-center rounded-xl text-sm font-medium transition-all hover:bg-slate-100",
              collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
            )}
            style={{ color: "var(--text-secondary, #64748b)" }}
          >
            <Settings size={17} className="shrink-0" />
            {!collapsed && <span>Settings</span>}
          </Link>

          {/* User card */}
          {!collapsed && (
            <div className="px-3 py-3 rounded-xl mt-1" style={{ background: "var(--rt-slate-50, #f8fafc)" }}>
              <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary, #0f172a)" }}>
                {user?.name ?? "—"}
              </p>
              <p className="text-[11px] truncate mt-0.5" style={{ color: "var(--text-muted, #94a3b8)" }}>
                {user?.email ?? "—"}
              </p>
            </div>
          )}

          {/* Sign out */}
          <button
            onClick={logout}
            title={collapsed ? "Sign out" : undefined}
            className={cn(
              "w-full flex items-center rounded-xl text-sm font-medium transition-all hover:bg-red-50",
              collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
            )}
            style={{ color: "var(--rt-red-500, #ef4444)" }}
          >
            <LogOut size={17} className="shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>

        {/* ── Collapse toggle (floating button at right edge) ───────────────── */}
        <button
          onClick={toggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "absolute -right-3 top-14 w-6 h-6 rounded-full bg-white border border-slate-200",
            "flex items-center justify-center shadow-sm",
            "hover:shadow-md hover:scale-110 transition-all duration-200",
            "hidden lg:flex", // desktop only — mobile uses hamburger in TopBar
          )}
          style={{ zIndex: 40 }}
        >
          {collapsed
            ? <ChevronRight size={11} className="text-slate-500" />
            : <ChevronLeft  size={11} className="text-slate-500" />
          }
        </button>
      </aside>
    </>
  );
}
