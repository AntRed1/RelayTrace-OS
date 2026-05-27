"use client";

import { Sidebar }      from "./Sidebar";
import { useSidebar }   from "@/contexts/sidebar.context";

interface Props {
  children: React.ReactNode;
}

export function AdminShell({ children }: Props) {
  const { collapsed } = useSidebar();

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg-base, #f8fafc)" }}>
      <Sidebar />

      {/* Content area — margin transitions with sidebar width */}
      <div
        className="flex-1 flex flex-col min-h-screen overflow-hidden transition-all duration-300 ease-in-out"
        style={{ marginLeft: 0 }}   // handled by static position on lg
      >
        {/* On desktop, sidebar is static (takes space), so no ML needed.
            On mobile, sidebar is fixed, so the content fills full width. */}
        {children}
      </div>
    </div>
  );
}
