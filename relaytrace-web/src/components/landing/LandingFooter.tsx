import Link from "next/link";
import { API_DOCS_URL, ROUTES } from "@/config/constants";
import { ExternalLink } from "lucide-react";

// ─── Navigation groups ────────────────────────────────────────────────────────

const LINKS = {
  Product: [
    { label: "Features",     href: "#features",  external: false },
    { label: "How it works", href: "#workflow",  external: false },
    { label: "Pricing",      href: "#pricing",   external: false },
  ],
  Platform: [
    { label: "Driver PWA",       href: "#features",  external: false },
    { label: "Admin Dashboard",  href: ROUTES.AUTH.LOGIN, external: false },
    { label: "API Docs",         href: API_DOCS_URL, external: true  },
  ],
  Company: [
    { label: "Sign In",         href: ROUTES.AUTH.LOGIN, external: false },
    { label: "Privacy Policy",  href: "#",               external: false },
    { label: "Terms of Service",href: "#",               external: false },
  ],
};

// ─── Component ────────────────────────────────────────────────────────────────

export function LandingFooter() {
  return (
    <footer
      className="border-t"
      style={{ background: "#0f172a", borderColor: "rgba(255,255,255,0.08)" }}
    >
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="space-y-4">
            {/* Text logo — no broken image */}
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg,#22d3ee,#2563eb)" }}
              >
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="text-white font-semibold text-lg">
                Relay<span style={{ color: "#22d3ee" }}>Trace</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
              Operational traceability platform for carriers using Amazon Relay.
            </p>
            <p className="text-xs" style={{ color: "#334155" }}>
              © {new Date().getFullYear()} RelayTrace OS. All rights reserved.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([group, items]) => (
            <div key={group}>
              <h4
                className="text-xs font-bold uppercase tracking-widest mb-4"
                style={{ color: "#475569" }}
              >
                {group}
              </h4>
              <ul className="space-y-2.5">
                {items.map(({ label, href, external }) => (
                  <li key={label}>
                    {external ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm transition-colors hover:text-slate-300"
                        style={{ color: "#64748b" }}
                      >
                        {label}
                        <ExternalLink size={10} className="opacity-60" />
                      </a>
                    ) : (
                      <Link
                        href={href}
                        className="text-sm transition-colors hover:text-slate-300"
                        style={{ color: "#64748b" }}
                      >
                        {label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-6 border-t flex flex-wrap items-center justify-between gap-3"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <p className="text-xs" style={{ color: "#334155" }}>
            RelayTrace OS is not affiliated with Amazon or Amazon Relay.
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs" style={{ color: "#475569" }}>
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
