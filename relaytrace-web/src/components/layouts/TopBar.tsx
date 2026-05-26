'use client';

import { Bell, HelpCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';

interface TopBarProps { title: string }

export function TopBar({ title }: TopBarProps) {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b"
      style={{ background: 'var(--bg-sidebar)', borderColor: 'var(--border)' }}>
      <h1 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h1>
      <div className="flex items-center gap-3">
        <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-all"
          style={{ color: 'var(--text-muted)' }}>
          <HelpCircle size={17} />
        </button>
        <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-all relative"
          style={{ color: 'var(--text-muted)' }}>
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
        </button>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
          style={{ background: 'linear-gradient(135deg, #22d3ee, #2563eb)' }}>
          {user?.name?.charAt(0).toUpperCase() ?? 'U'}
        </div>
      </div>
    </header>
  );
}