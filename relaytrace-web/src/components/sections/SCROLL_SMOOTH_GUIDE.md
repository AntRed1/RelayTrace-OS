# Scroll Suave y Animaciones de Secciones

Guía para implementar scroll suave profesional en tu página principal.

## Componentes Disponibles

### 1. `SmoothScrollLink` — Enlaces con scroll suave

```tsx
import { SmoothScrollLink } from '@/components/ui/smooth-scroll-link';

// En el navbar:
<nav>
  <SmoothScrollLink href="features">Características</SmoothScrollLink>
  <SmoothScrollLink href="pricing">Pricing</SmoothScrollLink>
  <SmoothScrollLink href="contact">Contacto</SmoothScrollLink>
</nav>
```

### 2. `SmoothScrollButton` — Botón con scroll suave

```tsx
import { SmoothScrollButton } from '@/components/ui/smooth-scroll-link';

// En el hero:
<SmoothScrollButton href="features" className="btn-primary">
  Ver características
</SmoothScrollButton>
```

### 3. `AnimatedSectionObserver` — Animar secciones al scrollear

```tsx
import { AnimatedSectionObserver } from '@/components/sections/animated-section-observer';

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <h1>Bienvenido</h1>
      </section>

      {/* Features — se anima al hacer scroll */}
      <AnimatedSectionObserver id="features" className="py-20 px-6">
        <h2>Características</h2>
        <div className="grid grid-cols-3 gap-6">
          <div>Feature 1</div>
          <div>Feature 2</div>
          <div>Feature 3</div>
        </div>
      </AnimatedSectionObserver>

      {/* Pricing — se anima al hacer scroll */}
      <AnimatedSectionObserver id="pricing" className="py-20 px-6 bg-slate-50">
        <h2>Pricing</h2>
        <div className="grid grid-cols-3 gap-6">
          <div>Plan Starter</div>
          <div>Plan Growth</div>
          <div>Plan Fleet</div>
        </div>
      </AnimatedSectionObserver>

      {/* Contact — se anima al hacer scroll */}
      <AnimatedSectionObserver id="contact" className="py-20 px-6">
        <h2>Contacto</h2>
        <form>...</form>
      </AnimatedSectionObserver>
    </>
  );
}
```

## Ejemplo Completo

```tsx
'use client';

import { SmoothScrollLink, SmoothScrollButton } from '@/components/ui/smooth-scroll-link';
import { AnimatedSectionObserver } from '@/components/sections/animated-section-observer';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* ────────────────────────────────────────── */}
      {/* NAVBAR */}
      {/* ────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full bg-white border-b border-slate-200 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">RelayTrace</h1>
          <ul className="flex gap-8">
            <li>
              <SmoothScrollLink href="features">Características</SmoothScrollLink>
            </li>
            <li>
              <SmoothScrollLink href="pricing">Pricing</SmoothScrollLink>
            </li>
            <li>
              <SmoothScrollLink href="faq">FAQ</SmoothScrollLink>
            </li>
            <li>
              <SmoothScrollLink href="contact">Contacto</SmoothScrollLink>
            </li>
          </ul>
        </div>
      </nav>

      {/* ────────────────────────────────────────── */}
      {/* HERO */}
      {/* ────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">
            Traceabilidad Estructurada para Amazon Relay
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Reemplaza WhatsApp y spreadsheets con reconciliación automatizada
          </p>
          <SmoothScrollButton href="features" className="btn-primary">
            Explorar características
          </SmoothScrollButton>
        </div>
      </section>

      {/* ────────────────────────────────────────── */}
      {/* FEATURES */}
      {/* ────────────────────────────────────────── */}
      <AnimatedSectionObserver id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Características Principales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg border border-slate-200">
              <h3 className="text-lg font-bold mb-2">OCR Automático</h3>
              <p>Escanea screenshots y extrae Trip IDs automáticamente</p>
            </div>
            <div className="bg-white p-8 rounded-lg border border-slate-200">
              <h3 className="text-lg font-bold mb-2">Reconciliación</h3>
              <p>Detecta discrepancias entre Relay y tu sistema</p>
            </div>
            <div className="bg-white p-8 rounded-lg border border-slate-200">
              <h3 className="text-lg font-bold mb-2">Detección de Fraude</h3>
              <p>Alertas en tiempo real para actividades sospechosas</p>
            </div>
          </div>
        </div>
      </AnimatedSectionObserver>

      {/* ────────────────────────────────────────── */}
      {/* PRICING */}
      {/* ────────────────────────────────────────── */}
      <AnimatedSectionObserver 
        id="pricing" 
        className="py-20 px-6 bg-slate-50"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Planes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg border border-slate-200">
              <h3 className="text-lg font-bold mb-4">Starter</h3>
              <p className="text-3xl font-bold mb-4">$49<span className="text-lg">/mes</span></p>
              <ul className="space-y-2 text-sm">
                <li>✓ Hasta 5 conductores</li>
                <li>✓ 100 trips/mes</li>
                <li>✓ Soporte email</li>
              </ul>
              <button className="btn-secondary mt-6 w-full">
                Empezar
              </button>
            </div>
            {/* Más planes... */}
          </div>
        </div>
      </AnimatedSectionObserver>

      {/* ────────────────────────────────────────── */}
      {/* FOOTER */}
      {/* ────────────────────────────────────────── */}
      <footer className="bg-slate-900 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <p>&copy; 2026 RelayTrace OS. Todos los derechos reservados.</p>
          <ul className="flex gap-6">
            <li>
              <SmoothScrollLink href="features" className="hover:text-blue-400">
                Características
              </SmoothScrollLink>
            </li>
            <li>
              <SmoothScrollLink href="pricing" className="hover:text-blue-400">
                Pricing
              </SmoothScrollLink>
            </li>
            <li>
              <SmoothScrollLink href="contact" className="hover:text-blue-400">
                Contacto
              </SmoothScrollLink>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  );
}
```

## Características

### SmoothScrollLink
- ✅ Scroll suave a cualquier elemento con `id`
- ✅ Offset automático para navbar fixed
- ✅ Accesibilidad (focus management)
- ✅ Previene scroll jump

```tsx
<SmoothScrollLink 
  href="contact"
  className="text-blue-600"
  onClick={() => console.log('Scrolling...')}
>
  Ir a contacto
</SmoothScrollLink>
```

### AnimatedSectionObserver
- ✅ Anima secciones al scrollear hacia ellas
- ✅ Slide up + fade in (600ms)
- ✅ Se anima solo una vez
- ✅ Triggersum al 10% visible
- ✅ Intersection Observer optimizado

```tsx
<AnimatedSectionObserver 
  id="my-section"
  className="py-20"
>
  <h2>Mi Sección</h2>
</AnimatedSectionObserver>
```

## Cómo Implementar en tu Página Actual

### 1. Encuentra dónde están tus enlaces de navegación

Busca tu navbar/footer y reemplaza los `<a>` normales:

```tsx
// ❌ Antes
<a href="#features">Características</a>

// ✅ Después
<SmoothScrollLink href="features">Características</SmoothScrollLink>
```

### 2. Envuelve tus secciones principales

```tsx
// ❌ Antes
<section id="features">
  <h2>Características</h2>
</section>

// ✅ Después
<AnimatedSectionObserver id="features">
  <h2>Características</h2>
</AnimatedSectionObserver>
```

### 3. Usa SmoothScrollButton para CTAs

```tsx
// ❌ Antes
<button onClick={() => window.location.href = '#contact'}>
  Contactar
</button>

// ✅ Después
<SmoothScrollButton href="contact">
  Contactar
</SmoothScrollButton>
```

## Performance

- **Scroll**: Usa native `window.scrollTo` (optimizado por el navegador)
- **Animations**: Framer Motion + GPU acceleration
- **Observer**: Intersection Observer (nativo, muy eficiente)
- **No jQuery, no bloat**: Solo React + Framer Motion

## Browser Support

- ✅ Chrome/Edge 51+
- ✅ Firefox 55+
- ✅ Safari 12.1+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
