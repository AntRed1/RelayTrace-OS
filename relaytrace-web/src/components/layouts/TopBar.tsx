'use client';

import { Bell, HelpCircle, Menu } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useSidebar }   from '@/contexts/sidebar.context';

interface TopBarProps { title: string }

export function TopBar({ title }: TopBarProps) {
  const user       = useAuthStore((s) => s.user);
  const { openMobile } = useSidebar();

  return (
    <header
      className="h-14 flex items-center gap-3 px-4 border-b shrink-0"
      style={{ background: 'var(--bg-sidebar, #fff)', borderColor: 'var(--border, #f1f5f9)' }}
    >
      {/* Mobile hamburger — only visible on small screens */}
      <button
        onClick={openMobile}
        className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-all"
        style={{ color: 'var(--text-muted, #94a3b8)' }}
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      <h1
        className="flex-1 text-base font-semibold truncate"
        style={{ color: 'var(--text-primary, #0f172a)' }}
      >
        {title}
      </h1>

      <div className="flex items-center gap-2">
        <button
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-all"
          style={{ color: 'var(--text-muted, #94a3b8)' }}
        >
          <HelpCircle size={17} />
        </button>
        <button
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-all relative"
          style={{ color: 'var(--text-muted, #94a3b8)' }}
        >
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
        </button>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
          style={{ background: 'linear-gradient(135deg,#22d3ee,#2563eb)' }}
        >
          {user?.name?.charAt(0).toUpperCase() ?? 'U'}
        </div>
      </div>
    </header>
  );
}
