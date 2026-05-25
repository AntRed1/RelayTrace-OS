'use client'

import { useState } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    // TODO: wire to auth service
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--rt-gradient-soft)' }}>
      {/* Left — Brand panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-[440px] shrink-0 p-10 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%)' }}
      >
        {/* Subtle circles decoration */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #22d3ee, transparent)' }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
            <defs>
              <linearGradient id="lg2" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#22d3ee"/>
                <stop offset="100%" stopColor="#2563eb"/>
              </linearGradient>
            </defs>
            <path d="M6 4h12a8 8 0 0 1 0 16H6V4Z" stroke="url(#lg2)" strokeWidth="2.5" fill="none" strokeLinejoin="round"/>
            <path d="M14 20l8 8" stroke="url(#lg2)" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="13" cy="14" r="2" fill="#22d3ee"/>
            <circle cx="6" cy="20" r="1.5" fill="#2563eb"/>
          </svg>
          <span className="text-xl font-bold tracking-tight">
            <span className="text-white">Relay</span>
            <span className="text-cyan-400">Trace</span>
          </span>
        </div>

        {/* Middle copy */}
        <div className="relative z-10 space-y-6">
          <h1 className="text-3xl font-bold text-white leading-tight">
            Trazabilidad total<br/>para tu flota Relay
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Registra, audita y reconcilia cada viaje de Amazon Relay con precisión operacional completa.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            {[
              { v: '99.9%', l: 'Uptime' },
              { v: '<1s',   l: 'Response time' },
              { v: 'OCR',   l: 'Auto-processing' },
              { v: 'RBAC',  l: 'Multi-tenant' },
            ].map(s => (
              <div key={s.l} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-xl font-bold text-cyan-400">{s.v}</div>
                <div className="text-xs text-slate-400 mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-slate-600 relative z-10">
          © 2026 RelayTrace OS · Todos los derechos reservados
        </p>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <defs>
                <linearGradient id="lg3" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#22d3ee"/><stop offset="100%" stopColor="#2563eb"/>
                </linearGradient>
              </defs>
              <path d="M6 4h12a8 8 0 0 1 0 16H6V4Z" stroke="url(#lg3)" strokeWidth="2.5" fill="none" strokeLinejoin="round"/>
              <path d="M14 20l8 8" stroke="url(#lg3)" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="13" cy="14" r="2" fill="#22d3ee"/>
            </svg>
            <span className="text-lg font-bold"><span className="text-slate-800">Relay</span><span className="text-blue-600">Trace</span></span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-1">Iniciar sesión</h2>
          <p className="text-sm text-slate-500 mb-8">Ingresa tus credenciales para continuar</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                className="rt-input"
                placeholder="admin@empresa.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Contraseña
                </label>
                <a href="#" className="text-xs text-blue-600 hover:underline">¿Olvidaste tu contraseña?</a>
              </div>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  className="rt-input pr-10"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={cn('btn-primary w-full mt-2', loading && 'opacity-70 cursor-not-allowed')}
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : null}
              {loading ? 'Autenticando...' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            ¿No tienes cuenta?{' '}
            <a href="/auth/register" className="text-blue-600 font-semibold hover:underline">
              Registrar empresa
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}