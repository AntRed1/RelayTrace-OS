import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: "var(--rt-gradient)" }}
        >
          <span className="text-white font-bold text-xl">R</span>
        </div>
        <h1 className="text-6xl font-bold text-slate-900 mb-2">404</h1>
        <p className="text-slate-500 text-sm mb-6">Page not found</p>
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: "var(--rt-gradient)" }}
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
