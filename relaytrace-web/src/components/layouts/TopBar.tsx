'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Menu, AlertTriangle, ExternalLink } from 'lucide-react';
import { useAuthStore }        from '@/stores/auth.store';
import { useSidebar }          from '@/contexts/sidebar.context';
import { useDashboardSummary, useDashboardAlerts } from '@/hooks/use-dashboard';
import { useRouter }           from 'next/navigation';
import { safeFormat }          from '@/lib/utils';

const ALERT_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  missing_trip:        { label: "Missing trip",    color: "#dc2626", bg: "#fef2f2" },
  duplicate_trip:      { label: "Duplicate trip",  color: "#d97706", bg: "#fffbeb" },
  suspicious_activity: { label: "Suspicious",      color: "#7c3aed", bg: "#f5f3ff" },
};

interface TopBarProps {
  title: string;
  children?: React.ReactNode;
}

export function TopBar({ title, children }: TopBarProps) {
  const user             = useAuthStore((s) => s.user);
  const { openMobile }   = useSidebar();
  const router           = useRouter();

  const { data: summary }             = useDashboardSummary();
  const { data: alerts = [] }         = useDashboardAlerts(20);
  const pendingAlerts                 = summary?.pendingAlerts ?? 0;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef                     = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  return (
    <header
      className="h-14 flex items-center gap-3 px-4 border-b shrink-0"
      style={{ background: 'var(--bg-sidebar, #fff)', borderColor: 'var(--border, #f1f5f9)' }}
    >
      {/* Mobile hamburger */}
      <button
        onClick={openMobile}
        className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-all"
        style={{ color: 'var(--text-muted, #94a3b8)' }}
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      <div className="flex items-center gap-2 flex-1">
        <h1
          className="text-base font-semibold truncate"
          style={{ color: 'var(--text-primary, #0f172a)' }}
        >
          {title}
        </h1>
        {children}
      </div>

      {/* Bell + dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-all relative"
          style={{ color: pendingAlerts > 0 ? '#ef4444' : 'var(--text-muted, #94a3b8)' }}
          aria-label={pendingAlerts > 0 ? `${pendingAlerts} pending alerts` : 'No alerts'}
        >
          <Bell size={17} />
          {pendingAlerts > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {pendingAlerts > 99 ? '99+' : pendingAlerts}
            </span>
          )}
        </button>

        {/* Dropdown panel */}
        {dropdownOpen && (
          <div
            className="absolute right-0 top-10 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden"
            style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="text-amber-500" />
                <span className="text-sm font-semibold text-slate-800">Unresolved Alerts</span>
                {pendingAlerts > 0 && (
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">
                    {pendingAlerts}
                  </span>
                )}
              </div>
              <button
                onClick={() => { router.push('/admin/reconciliation'); setDropdownOpen(false); }}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                View all <ExternalLink size={11} />
              </button>
            </div>

            {/* Alert list */}
            <div className="max-h-72 overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-2">
                    <Bell size={16} className="text-emerald-500" />
                  </div>
                  <p className="text-sm text-slate-400">All clear — no pending alerts</p>
                </div>
              ) : (
                alerts.map((alert) => {
                  const cfg = ALERT_LABELS[alert.alertType] ?? ALERT_LABELS.suspicious_activity;
                  return (
                    <div
                      key={alert.id}
                      className="px-4 py-3 border-b border-slate-50 hover:bg-slate-50/60 transition-colors cursor-pointer"
                      onClick={() => { router.push('/admin/reconciliation'); setDropdownOpen(false); }}
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: cfg.bg }}
                        >
                          <AlertTriangle size={13} style={{ color: cfg.color }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className="text-xs font-semibold px-1.5 py-0.5 rounded-md"
                              style={{ background: cfg.bg, color: cfg.color }}
                            >
                              {cfg.label}
                            </span>
                            <span className="text-[11px] text-slate-400 shrink-0">
                              {safeFormat(alert.createdAt, "MMM d · h:mm a")}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 font-mono">
                            {alert.trip?.tripId ?? alert.tripId}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {alerts.length > 0 && (
              <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50">
                <button
                  onClick={() => { router.push('/admin/reconciliation'); setDropdownOpen(false); }}
                  className="w-full text-center text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors py-1"
                >
                  Go to Reconciliation →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* User avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
        style={{ background: 'linear-gradient(135deg,#22d3ee,#2563eb)' }}
      >
        {user?.name?.charAt(0).toUpperCase() ?? 'U'}
      </div>
    </header>
  );
}
