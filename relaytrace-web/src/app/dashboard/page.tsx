'use client'

import { TrendingUp, Truck, Users, ScanLine, AlertTriangle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AnimatedPage, AnimatedCard, AnimatedSection, AnimatedButton } from '@/components/ui/animated'

// ─── Mock data (replace with API) ──────────────────────────────────────────
const STATS = [
  {
    label: 'Active Trips',
    value: '233',
    badge: 'Active',
    badgeClass: 'badge-success',
    icon: Truck,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    label: 'OCR Accuracy',
    value: '90%',
    badge: 'Current',
    badgeClass: 'badge-success',
    icon: ScanLine,
    iconBg: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
  },
  {
    label: 'Driver Status',
    value: '30',
    badge: 'Started',
    badgeClass: 'badge-warning',
    icon: Users,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
]

const RECENT_TRIPS = [
  { id: 'Trip 5301-2003', range: '5:00 AM – 7:30 PM', duration: '8:00 PM', status: 'now', dot: 'bg-amber-500' },
  { id: 'Trip 5301-2003', range: '5:30 AM – 7:30 PM', duration: '7:30 PM', status: 'now', dot: 'bg-emerald-500' },
  { id: 'Trip 5301-2004', range: '5:30 AM – 7:00 PM', duration: '7:45 PM', status: 'now', dot: 'bg-emerald-500' },
  { id: 'Trip 5301-2004', range: '5:30 AM – 7:00 PM', duration: '7:00 PM', status: 'now', dot: 'bg-amber-500' },
  { id: 'Trip 5301-2003', range: '5:30 AM – 7:00 PM', duration: '7:50 PM', status: 'now', dot: 'bg-emerald-500' },
]

// ─── Sub-components ─────────────────────────────────────────────────────────
function StatCard({ label, value, badge, badgeClass, icon: Icon, iconBg, iconColor }: typeof STATS[0]) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
        <div className={cn('p-2 rounded-[8px]', iconBg)}>
          <Icon size={16} className={iconColor} strokeWidth={2} />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-bold text-slate-900">{value}</span>
        <span className={cn('badge', badgeClass)}>
          <TrendingUp size={10} />
          {badge}
        </span>
      </div>
    </div>
  )
}

function MapPlaceholder() {
  return (
    <div className="relative w-full h-full bg-slate-100 rounded-xl overflow-hidden">
      {/* Simplified SVG map representation */}
      <svg viewBox="0 0 600 360" className="w-full h-full opacity-30" preserveAspectRatio="xMidYMid slice">
        <rect width="600" height="360" fill="#e2e8f0"/>
        {/* Grid lines */}
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="360" stroke="#cbd5e1" strokeWidth="0.5"/>
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 50} x2="600" y2={i * 50} stroke="#cbd5e1" strokeWidth="0.5"/>
        ))}
      </svg>
      {/* Route overlay */}
      <svg viewBox="0 0 600 360" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="route-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1d4ed8"/>
            <stop offset="100%" stopColor="#22d3ee"/>
          </linearGradient>
        </defs>
        {/* Route path */}
        <path
          d="M150 280 L120 200 L180 160 L160 100 L260 80 L340 120 L420 100 L480 160 L460 220 L400 260 L380 320 L300 340 L220 320 Z"
          fill="none"
          stroke="url(#route-grad)"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Relay points */}
        {[
          [150,280],[120,200],[180,160],[160,100],[260,80],
          [340,120],[420,100],[480,160],[460,220],[400,260],[300,340],[220,320]
        ].map(([x,y], i) => (
          <circle key={i} cx={x} cy={y} r="5" fill="white" stroke="#2563eb" strokeWidth="2.5"/>
        ))}
      </svg>
      {/* Label */}
      <div className="absolute bottom-3 right-3 text-[10px] text-slate-400">Map data preview</div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  return (
    <AnimatedPage className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-slate-400" />
          <span className="text-xs text-slate-400">
            {new Date().toLocaleDateString('es-DO', { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Stat cards with stagger effect */}
      <AnimatedSection>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STATS.map((s, idx) => (
            <AnimatedCard key={s.label} delay={idx * 0.1}>
              <StatCard {...s} />
            </AnimatedCard>
          ))}
        </div>
      </AnimatedSection>

      {/* Map + Recent Trips */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4">
        {/* Map */}
        <AnimatedCard delay={0.3} className="bg-white rounded-[14px] border border-slate-100 overflow-hidden" style={{ height: 420 }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <span className="text-sm font-semibold text-slate-800">Relay Points</span>
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-[8px] px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-slate-600">Real time</span>
            </div>
          </div>
          <div className="p-3 h-[calc(100%-57px)]">
            <MapPlaceholder />
          </div>
        </AnimatedCard>

        {/* Recent Trips */}
        <AnimatedCard delay={0.4} className="bg-white rounded-[14px] border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <span className="text-sm font-semibold text-slate-800">Recent Trips</span>
            <AnimatedButton className="btn-secondary text-xs py-1.5 px-3">
              Recent trips
            </AnimatedButton>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[1fr_auto_auto] px-5 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-50">
            <span>Trip</span>
            <span className="pr-6">Duration</span>
            <span>Status</span>
          </div>

          {/* Rows */}
          <div className="flex-1 overflow-y-auto">
            {RECENT_TRIPS.map((t, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_auto_auto] items-center px-5 py-3.5 border-b border-slate-50 hover:bg-slate-50/60 transition-all duration-200 ease-out cursor-pointer"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-800">{t.id}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{t.range}</div>
                </div>
                <div className="text-sm text-slate-600 pr-6">{t.duration}</div>
                <div className="flex items-center gap-1.5">
                  <span className={cn('w-2 h-2 rounded-full', t.dot)} />
                  <span className="text-xs font-medium text-slate-500">Now</span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-1 px-5 py-3 border-t border-slate-100">
            {['‹', '‹', '1', '2', '›'].map((p, i) => (
              <AnimatedButton
                key={i}
                className={cn(
                  'w-7 h-7 rounded-[6px] text-xs font-medium',
                  p === '1' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'
                )}
              >
                {p}
              </AnimatedButton>
            ))}
          </div>
        </AnimatedCard>
      </div>
    </AnimatedPage>
  )
}
