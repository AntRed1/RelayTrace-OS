"use client";

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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { ROUTES } from "@/config/constants";

const navItems = [
  { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD, icon: LayoutDashboard },
  { label: "Trips", href: ROUTES.ADMIN.TRIPS, icon: Truck },
  { label: "Drivers", href: ROUTES.ADMIN.DRIVERS, icon: Users },
  { label: "OCR Processing", href: "/admin/ocr", icon: ScanLine },
  {
    label: "Reconciliation",
    href: ROUTES.ADMIN.RECONCILIATION,
    icon: GitMerge,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-64 flex flex-col border-r z-30"
      style={{ background: "var(--bg-sidebar)", borderColor: "var(--border)" }}
    >
      {/* Logo */}
      <div
        className="px-6 py-5 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #22d3ee, #2563eb)" }}
          >
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <span
            className="font-semibold text-base"
            style={{ color: "var(--text-primary)" }}
          >
            Relay<span style={{ color: "var(--accent)" }}>Trace</span>
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active ? "text-white" : "hover:bg-slate-100",
              )}
              style={
                active
                  ? {
                      background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                      color: "#fff",
                    }
                  : { color: "var(--text-secondary)" }
              }
            >
              <Icon size={17} className="shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div
        className="px-3 py-4 border-t space-y-1"
        style={{ borderColor: "var(--border)" }}
      >
        <Link
          href={ROUTES.ADMIN.SETTINGS}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-slate-100"
          style={{ color: "var(--text-secondary)" }}
        >
          <Settings size={17} />
          Settings
        </Link>

        <div
          className="px-3 py-3 rounded-xl mt-1"
          style={{ background: "var(--rt-slate-50)" }}
        >
          <p
            className="text-xs font-medium truncate"
            style={{ color: "var(--text-primary)" }}
          >
            {user?.name ?? "—"}
          </p>
          <p
            className="text-xs truncate mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            {user?.email ?? "—"}
          </p>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-red-50"
          style={{ color: "var(--rt-red-500)" }}
        >
          <LogOut size={17} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
