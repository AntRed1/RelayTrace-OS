import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/config/constants";

const LINKS = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#workflow" },
    { label: "Pricing", href: "#pricing" },
  ],
  Platform: [
    { label: "Driver PWA", href: "#" },
    { label: "Admin Dashboard", href: "#" },
    { label: "API Docs", href: "http://localhost:3000/api/docs" },
  ],
  Company: [
    { label: "Sign In", href: ROUTES.AUTH.LOGIN },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
};

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
            <Image
              src="/images/logo-dark-full.png"
              alt="RelayTrace OS"
              width={150}
              height={34}
              className="h-8 w-auto object-contain"
            />
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
                {items.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm transition-colors hover:text-slate-300"
                      style={{ color: "#64748b" }}
                    >
                      {label}
                    </Link>
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
