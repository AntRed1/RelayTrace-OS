"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { ROUTES } from "@/config/constants";

interface Props {
  onRequestAccess: () => void;
}

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#workflow" },
  { label: "Pricing", href: "#pricing" },
];

export function LandingNav({ onRequestAccess }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? "rgba(255,255,255,0.95)"
          : "rgba(15,23,42,0.0)",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid #e2e8f0" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src={scrolled
              ? "/images/logo-horizontal.png"
              : "/images/logo-dark-full.png"
            }
            alt="RelayTrace OS"
            width={160}
            height={40}
            style={{ width: "auto", height: "36px" }}
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="text-sm font-medium transition-colors hover:text-blue-400"
              style={{ color: scrolled ? "#475569" : "#cbd5e1" }}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href={ROUTES.AUTH.LOGIN}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] hover:bg-white/10"
            style={{
              color: scrolled ? "#2563eb" : "#e2e8f0",
              border: scrolled ? "1px solid #dbeafe" : "1px solid rgba(255,255,255,0.2)",
            }}
          >
            Sign In
          </Link>
          {/* Nav CTA — shimmer + scale on hover */}
          <button
            onClick={onRequestAccess}
            className="group relative px-4 py-2 rounded-xl text-sm font-bold text-white overflow-hidden transition-all duration-200 hover:scale-[1.04] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] active:scale-[0.97]"
            style={{
              background: "linear-gradient(135deg,#22d3ee,#2563eb)",
              boxShadow: "0 0 14px rgba(37,99,235,0.3)",
            }}
          >
            {/* Shimmer sweep */}
            <span
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{
                background:
                  "linear-gradient(120deg,transparent 30%,rgba(255,255,255,0.2) 50%,transparent 70%)",
                backgroundSize: "200% 100%",
                animation: "nav-shimmer 1.5s infinite",
              }}
            />
            <span className="relative">Get Started</span>
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-lg"
          style={{ color: scrolled ? "#0f172a" : "#f8fafc" }}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-6 py-4 space-y-3">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="block text-sm font-medium text-slate-600 py-1.5"
            >
              {label}
            </a>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href={ROUTES.AUTH.LOGIN}
              className="w-full text-center py-2.5 rounded-xl text-sm font-semibold text-blue-600 border border-blue-200 transition-all hover:bg-blue-50"
            >
              Sign In
            </Link>
            <button
              onClick={() => { onRequestAccess(); setMobileOpen(false); }}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg,#22d3ee,#2563eb)" }}
            >
              Get Started Free
            </button>
          </div>
        </div>
      )}

      {/* Shimmer keyframe */}
      <style>{`
        @keyframes nav-shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>
    </header>
  );
}
