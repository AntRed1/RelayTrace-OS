import type { Metadata, Viewport } from 'next'
import './global.css'

export const metadata: Metadata = {
  title: { default: 'RelayTrace', template: '%s · RelayTrace' },
  description: 'Plataforma de trazabilidad operacional para Amazon Relay',
  manifest: '/manifest.json',
  icons: { icon: '/favicon.ico', apple: '/icons/apple-touch-icon.png' },
}

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}