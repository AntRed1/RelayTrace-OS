"use client";

import { useState }             from "react";
import Link                     from "next/link";
import { useAuth }              from "@/hooks/use-auth";
import { useMyCompany }         from "@/hooks/use-companies";
import { useChangePassword }    from "@/hooks/use-users";
import { ChangePasswordModal }  from "@/components/people/ChangePasswordModal";
import { ROUTES }               from "@/config/constants";
import {
  ArrowLeft,
  User,
  Building2,
  Shield,
  ChevronRight,
  Loader2,
} from "lucide-react";

// ─── Shared UI ────────────────────────────────────────────────────────────────

function Section({
  title,
  icon: Icon,
  children,
}: {
  title:    string;
  icon:     React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
        <Icon size={15} className="text-slate-400" />
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
      </div>
      <div className="p-5 space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1.5">{label}</label>
      <div className="w-full px-3.5 py-2.5 rounded-xl text-sm text-slate-700 bg-slate-50 border border-slate-200">
        {value}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DriverSettingsPage() {
  const { user }                 = useAuth();
  const { data: company, isLoading: companyLoading } = useMyCompany();

  const [changePwOpen, setChangePwOpen] = useState(false);
  const {
    mutateAsync: changePw,
    isPending:   changePwPending,
    error:       changePwRawError,
    reset:       resetPwMutation,
  } = useChangePassword();

  const changePwError =
    (changePwRawError as { response?: { data?: { message?: string } } })
      ?.response?.data?.message ?? null;

  async function handleChangePassword(newPassword: string) {
    if (!user?.id) return;
    await changePw({ id: user.id, newPassword });
    setChangePwOpen(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="w-full max-w-md mx-auto space-y-5">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 pt-2 pb-1">
          <Link
            href={ROUTES.DRIVER.DASHBOARD}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-white border border-slate-200 transition-all"
          >
            <ArrowLeft size={16} />
          </Link>
          <h1 className="text-lg font-bold text-slate-900">Settings</h1>
        </div>

        {/* ── Profile ──────────────────────────────────────────────────── */}
        <Section title="My Profile" icon={User}>
          {/* Avatar + name summary */}
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-lg shrink-0"
              style={{ background: "linear-gradient(135deg,#22d3ee,#2563eb)" }}
            >
              {user?.name?.charAt(0).toUpperCase() ?? "D"}
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">{user?.name ?? "—"}</p>
              <p className="text-xs text-slate-400 mt-0.5">{user?.email ?? "—"}</p>
            </div>
          </div>

          <Field label="Full Name" value={user?.name  ?? "—"} />
          <Field label="Email"     value={user?.email ?? "—"} />
          <Field label="Role"      value="Driver" />
        </Section>

        {/* ── Company ──────────────────────────────────────────────────── */}
        <Section title="My Company" icon={Building2}>
          {companyLoading ? (
            <div className="flex items-center gap-2 text-sm text-slate-400 py-2">
              <Loader2 size={14} className="animate-spin" /> Loading…
            </div>
          ) : company ? (
            <>
              {/* Company badge */}
              <div
                className="flex items-center gap-3 p-3 rounded-xl border"
                style={{ background: "#f8fafc", borderColor: "#e2e8f0" }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ background: "linear-gradient(135deg,#22d3ee,#2563eb)" }}
                >
                  {company.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{company.name}</p>
                  <p className="text-xs text-slate-400">{company.email}</p>
                </div>
              </div>

              <Field label="Company Name"  value={company.name} />
              <Field label="Contact Email" value={company.email} />
              <Field label="Plan"          value={company.plan?.charAt(0).toUpperCase() + (company.plan?.slice(1) ?? "")} />
              <Field label="Status"        value={company.subscriptionStatus === "active" ? "Active" : company.subscriptionStatus} />
            </>
          ) : (
            <p className="text-sm text-slate-400">Company info unavailable.</p>
          )}
        </Section>

        {/* ── Security ─────────────────────────────────────────────────── */}
        <Section title="Security" icon={Shield}>
          <button
            onClick={() => setChangePwOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <div className="text-left">
              <p className="text-sm font-medium text-slate-800">Password</p>
              <p className="text-xs text-slate-400 mt-0.5">Update your account password</p>
            </div>
            <ChevronRight size={16} className="text-slate-300 shrink-0" />
          </button>
        </Section>

        <p className="text-center text-xs text-slate-400 pb-4">
          RelayTrace OS · Driver Portal
        </p>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        open={changePwOpen}
        userName={user?.name  ?? ""}
        userEmail={user?.email ?? ""}
        isSubmitting={changePwPending}
        error={changePwError}
        onSubmit={handleChangePassword}
        onClose={() => { setChangePwOpen(false); resetPwMutation(); }}
      />
    </div>
  );
}
