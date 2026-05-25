'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Truck, Users, ScanLine,
  GitCompare, ChevronDown, Bell, HelpCircle,
  Flag, Menu, X, LogOut, Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/dashboard',        label: 'Dashboard',       icon: LayoutDashboard },
  { href: '/dashboard/trips',  label: 'Trips',           icon: Truck },
  { href: '/dashboard/drivers',label: 'Drivers',         icon: Users },
  { href: '/dashboard/ocr',    label: 'OCR Processing',  icon: ScanLine },
  { href: '/dashboard/reconciliation', label: 'Reconciliation', icon: GitCompare },
]

function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5 px-1">
      {/* Simplified R icon */}
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#22d3ee"/>
            <stop offset="100%" stopColor="#2563eb"/>
          </linearGradient>
        </defs>
        <path d="M6 4h12a8 8 0 0 1 0 16H6V4Z" stroke="url(#lg)" strokeWidth="2.5" fill="none" strokeLinejoin="round"/>
        <path d="M14 20l8 8" stroke="url(#lg)" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="13" cy="14" r="2" fill="#2563eb"/>
        <circle cx="6" cy="20" r="1.5" fill="#22d3ee"/>
      </svg>
      <span className="font-bold text-base tracking-tight">
        <span className="text-slate-800">Relay</span>
        <span className="text-blue-600">Trace</span>
      </span>
    </Link>
  )
}

function NavItem({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) {
  const pathname = usePathname()
  const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
  return (
    <Link href={href} className={cn('nav-item', active && 'active')}>
      <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
      {label}
    </Link>
  )
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sideOpen, setSideOpen] = useState(false)

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex flex-col bg-white border-r border-slate-100 transition-transform duration-200 lg:translate-x-0 lg:static lg:flex',
          sideOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        style={{ width: 'var(--sidebar-width)' }}
      >
        {/* Logo */}
        <div className="flex items-center h-14 px-4 border-b border-slate-100 shrink-0">
          <Logo />
          <button className="ml-auto lg:hidden btn-ghost p-1.5" onClick={() => setSideOpen(false)}>
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
          {NAV.map(n => <NavItem key={n.href} {...n} />)}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-slate-100 flex flex-col gap-1">
          <button className="nav-item w-full text-left">
            <Settings size={17} strokeWidth={1.8} /> Settings
          </button>
          <button className="nav-item w-full text-left text-red-500 hover:bg-red-50 hover:text-red-600">
            <LogOut size={17} strokeWidth={1.8} /> Sign out
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sideOpen && (
        <div className="fixed inset-0 z-20 bg-slate-900/30 lg:hidden" onClick={() => setSideOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header
          className="shrink-0 bg-white border-b border-slate-100 flex items-center px-4 gap-3"
          style={{ height: 'var(--header-height)' }}
        >
          <button className="btn-ghost lg:hidden p-1.5" onClick={() => setSideOpen(true)}>
            <Menu size={18} />
          </button>

          <div className="flex-1" />

          <button className="btn-ghost p-1.5 text-slate-400"><Flag size={17} /></button>
          <button className="btn-ghost p-1.5 text-slate-400"><HelpCircle size={17} /></button>

          {/* Notif */}
          <button className="relative btn-ghost p-1.5 text-slate-400">
            <Bell size={17} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
          </button>

          {/* User */}
          <button className="flex items-center gap-2 pl-2 btn-ghost rounded-[10px]">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
              A
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="page-enter">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}