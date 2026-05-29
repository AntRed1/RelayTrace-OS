"use client";

import Image from "next/image";
import Link from "next/link";
import { API_DOCS_URL, ROUTES } from "@/config/constants";
import { ExternalLink } from "lucide-react";

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ─── Navigation groups ────────────────────────────────────────────────────────

type FooterLink =
  | { label: string; sectionId: string; external?: false; href?: never }
  | { label: string; href: string; external?: boolean; sectionId?: never };

const LINKS: Record<string, FooterLink[]> = {
  Product: [
    { label: "Features",     sectionId: "features" },
    { label: "How it works", sectionId: "workflow"  },
    { label: "Pricing",      sectionId: "pricing"   },
  ],
  Platform: [
    { label: "Driver PWA",      sectionId: "features"         },
    { label: "Admin Dashboard", href: ROUTES.AUTH.LOGIN        },
    { label: "API Docs",        href: API_DOCS_URL, external: true },
  ],
  Company: [
    { label: "Sign In",          href: ROUTES.AUTH.LOGIN },
    { label: "Privacy Policy",   href: "#"               },
    { label: "Terms of Service", href: "#"               },
  ],
};

/** Smooth-scroll to a section with navbar offset */
function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 80;
  window.scrollTo({ top, behavior: "smooth" });
}

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
            <button
              onClick={scrollToTop}
              className="inline-block hover:opacity-80 transition-opacity duration-300"
              aria-label="Scroll to top"
            >
              <Image
                src="/images/logo-main.png"
                alt="RelayTrace OS"
                width={150}
                height={150}
                style={{ width: "auto", height: "80px" }}
              />
            </button>
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
                {items.map((item) => (
                  <li key={item.label}>
                    {item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm transition-all duration-200 hover:text-slate-300 hover:translate-x-0.5"
                        style={{ color: "#64748b" }}
                      >
                        {item.label}
                        <ExternalLink size={10} className="opacity-60" />
                      </a>
                    ) : item.sectionId ? (
                      /* Smooth-scroll anchor */
                      <button
                        type="button"
                        onClick={() => scrollToSection(item.sectionId!)}
                        className="text-sm transition-all duration-200 hover:text-slate-300 hover:translate-x-0.5 text-left"
                        style={{ color: "#64748b" }}
                      >
                        {item.label}
                      </button>
                    ) : (
                      <Link
                        href={item.href!}
                        className="text-sm transition-all duration-200 hover:text-slate-300 hover:translate-x-0.5"
                        style={{ color: "#64748b" }}
                      >
                        {item.label}
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
