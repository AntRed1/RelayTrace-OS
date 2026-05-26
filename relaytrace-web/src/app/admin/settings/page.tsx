"use client";

import { TopBar } from "@/components/layouts/TopBar";
import { useAuthStore } from "@/stores/auth.store";
import { Building2, User, Shield, Bell } from "lucide-react";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
      style={{ boxShadow: "var(--rt-shadow-sm)" }}
    >
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1.5">
        {label}
      </label>
      <div className="w-full px-3.5 py-2.5 rounded-xl text-sm text-slate-700 bg-slate-50 border border-slate-200">
        {value}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <>
      <TopBar title="Settings" />
      <main className="flex-1 p-6 space-y-5 page-enter max-w-2xl">
        {/* Profile */}
        <Section title="Profile">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shrink-0"
              style={{ background: "var(--rt-gradient)" }}
            >
              {user?.name?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <div>
              <p className="font-semibold text-slate-900">
                {user?.name ?? "—"}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {user?.email ?? "—"}
              </p>
            </div>
          </div>
          <Field label="Full Name" value={user?.name ?? "—"} />
          <Field label="Email" value={user?.email ?? "—"} />
          <Field label="Role" value={user?.role ?? "—"} />
        </Section>

        {/* Company */}
        <Section title="Company">
          <Field label="Company ID" value={user?.companyId ?? "—"} />
          <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl bg-blue-50 border border-blue-100">
            <Building2 size={15} className="text-blue-500 shrink-0" />
            <p className="text-xs text-blue-700 font-medium">
              Contact your administrator to update company information.
            </p>
          </div>
        </Section>

        {/* Security */}
        <Section title="Security">
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3">
              <Shield size={16} className="text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-800">Password</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Last changed: unknown
                </p>
              </div>
            </div>
            <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50">
              Change
            </button>
          </div>
        </Section>

        {/* Notifications */}
        <Section title="Notifications">
          {[
            { label: "Trip alerts", sub: "Get notified on unmatched trips" },
            {
              label: "Duplicate warnings",
              sub: "Alert on duplicate trip detection",
            },
            {
              label: "Weekly summary",
              sub: "Receive weekly reconciliation report",
            },
          ].map(({ label, sub }) => (
            <div key={label} className="flex items-center justify-between py-1">
              <div className="flex items-center gap-3">
                <Bell size={16} className="text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-800">{label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
                </div>
              </div>
              <div className="w-9 h-5 rounded-full bg-blue-600 relative cursor-pointer shrink-0">
                <div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" />
              </div>
            </div>
          ))}
        </Section>
      </main>
    </>
  );
}
