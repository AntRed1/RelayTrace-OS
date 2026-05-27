"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SidebarContextValue {
  collapsed:   boolean;
  mobileOpen:  boolean;
  toggle:      () => void;
  openMobile:  () => void;
  closeMobile: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const SidebarContext = createContext<SidebarContextValue>({
  collapsed:   false,
  mobileOpen:  false,
  toggle:      () => {},
  openMobile:  () => {},
  closeMobile: () => {},
});

const STORAGE_KEY = "rt_sidebar_collapsed";

// ─── Provider ─────────────────────────────────────────────────────────────────

export function SidebarProvider({ children }: { children: ReactNode }) {
  // Initialise from localStorage (persists across refreshes)
  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hydrated,   setHydrated]   = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "1") setCollapsed(true);
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  const toggle = useCallback(() => {
    setCollapsed((v) => {
      const next = !v;
      try { localStorage.setItem(STORAGE_KEY, next ? "1" : "0"); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const openMobile  = useCallback(() => setMobileOpen(true),  []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  // Prevent layout shift during hydration
  if (!hydrated) return <>{children}</>;

  return (
    <SidebarContext.Provider value={{ collapsed, mobileOpen, toggle, openMobile, closeMobile }}>
      {children}
    </SidebarContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSidebar() {
  return useContext(SidebarContext);
}
