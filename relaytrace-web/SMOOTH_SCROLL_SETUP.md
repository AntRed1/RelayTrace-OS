# 🎯 Setup de Scroll Suave + Transiciones Animadas

## 📋 Archivos Creados

### Para Scroll Suave

| Archivo | Propósito |
|---------|-----------|
| `src/hooks/useScrollTo.ts` | Hook para scroll suave programático |
| `src/components/ui/smooth-scroll-link.tsx` | Enlaces y botones con scroll suave |
| `src/components/sections/animated-section-observer.tsx` | Animar secciones al scrollear |
| `src/components/sections/SCROLL_SMOOTH_GUIDE.md` | Documentación completa |

### Transiciones (ya hecho)

| Archivo | Propósito |
|---------|-----------|
| `src/lib/animations.ts` | Presets de animaciones |
| `src/components/ui/animated.tsx` | Componentes animados |
| `src/providers/animations-provider.tsx` | Provider global |

---

## 🚀 Implementación Rápida

### Paso 1: Reemplaza tus enlaces de navegación

```tsx
// ❌ ANTES
<nav>
  <a href="#features">Características</a>
  <a href="#pricing">Pricing</a>
</nav>

// ✅ DESPUÉS
import { SmoothScrollLink } from '@/components/ui/smooth-scroll-link';

<nav>
  <SmoothScrollLink href="features">Características</SmoothScrollLink>
  <SmoothScrollLink href="pricing">Pricing</SmoothScrollLink>
</nav>
```

### Paso 2: Envuelve tus secciones

```tsx
// ❌ ANTES
<section id="features">
  <h2>Características</h2>
</section>

// ✅ DESPUÉS
import { AnimatedSectionObserver } from '@/components/sections/animated-section-observer';

<AnimatedSectionObserver id="features">
  <h2>Características</h2>
</AnimatedSectionObserver>
```

### Paso 3: Botones de CTA

```tsx
// ❌ ANTES
<button onClick={() => scroll...}>Explorar</button>

// ✅ DESPUÉS
import { SmoothScrollButton } from '@/components/ui/smooth-scroll-link';

<SmoothScrollButton href="pricing">
  Explorar planes
</SmoothScrollButton>
```

---

## 🎬 Flujo Completo Ejemplo

```tsx
'use client';

import { SmoothScrollLink, SmoothScrollButton } from '@/components/ui/smooth-scroll-link';
import { AnimatedSectionObserver } from '@/components/sections/animated-section-observer';

export default function HomePage() {
  return (
    <>
      {/* NAVBAR con scroll suave */}
      <nav className="fixed top-0 w-full bg-white z-50 border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1>RelayTrace</h1>
          <ul className="flex gap-8">
            <li>
              <SmoothScrollLink href="features">Características</SmoothScrollLink>
            </li>
            <li>
              <SmoothScrollLink href="pricing">Pricing</SmoothScrollLink>
            </li>
            <li>
              <SmoothScrollLink href="contact">Contacto</SmoothScrollLink>
            </li>
          </ul>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-blue-50">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">
            Traceabilidad para Amazon Relay
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            OCR automático, reconciliación y detección de fraude
          </p>
          {/* BOTÓN con scroll suave */}
          <SmoothScrollButton href="features" className="btn-primary">
            Ver características
          </SmoothScrollButton>
        </div>
      </section>

      {/* FEATURES - Anima al scrollear */}
      <AnimatedSectionObserver id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12">Características</h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-lg border">
              <h3>OCR Automático</h3>
              <p>Escanea y extrae datos de screenshots</p>
            </div>
            <div className="p-6 bg-white rounded-lg border">
              <h3>Reconciliación</h3>
              <p>Detecta discrepancias automáticamente</p>
            </div>
            <div className="p-6 bg-white rounded-lg border">
              <h3>Detección de Fraude</h3>
              <p>Alertas en tiempo real</p>
            </div>
          </div>
        </div>
      </AnimatedSectionObserver>

      {/* PRICING - Anima al scrollear */}
      <AnimatedSectionObserver id="pricing" className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12">Planes</h2>
          <div className="grid grid-cols-3 gap-6">
            {/* Tus tarjetas de planes aquí */}
          </div>
        </div>
      </AnimatedSectionObserver>

      {/* CONTACT - Anima al scrollear */}
      <AnimatedSectionObserver id="contact" className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Contacto</h2>
          <form className="space-y-4">
            {/* Tu formulario aquí */}
          </form>
        </div>
      </AnimatedSectionObserver>

      {/* FOOTER con scroll suave */}
      <footer className="bg-slate-900 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <p>&copy; 2026 RelayTrace OS</p>
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
    </>
  );
}
```

---

## ✨ Resultado Final

| Antes | Después |
|-------|---------|
| ❌ Click → salto instantáneo | ✅ Click → scroll suave (300-600ms) |
| ❌ Secciones sin animación | ✅ Secciones fade in al scrollear |
| ❌ Velocidad violenta | ✅ Transición profesional |
| ❌ Sin feedback visual | ✅ Animaciones guían atención |

---

## 🎯 Qué se Anima

### Scroll Suave (300ms)
- Click en navbar/footer
- Scroll a sección con offset para navbar fixed
- Comportamiento nativo del navegador (GPU acelerado)

### Secciones (600ms)
- Fade in al entrar en viewport
- Slide up + opacity
- Se anima solo una vez
- Triggered al 10% visible

### Botones (interactivos)
- Hover: scale 1.05x
- Tap: scale 0.95x
- Spring physics suave

---

## 📚 Documentación

Para ejemplos más detallados:
- `src/components/sections/SCROLL_SMOOTH_GUIDE.md` — Guía completa de scroll suave
- `src/components/ui/ANIMATIONS.md` — Guía de componentes animados

---

## 🔧 Personalización

### Cambiar velocidad de scroll
Edit `src/hooks/useScrollTo.ts`:
```ts
window.scrollTo({
  top: offsetPosition,
  behavior: 'smooth', // o 'auto' para instantáneo
});
```

### Cambiar offset del navbar
```ts
scrollTo(href, 100); // offset de 100px en lugar de 80px
```

### Cambiar animación de sección
Edit `src/components/sections/animated-section-observer.tsx`:
```tsx
initial={{ opacity: 0, y: 40 }}        // Cambiar valores
transition={{ duration: 0.6 }}         // Cambiar duración
```

---

## ✅ Checklist de Implementación

- [ ] Importa `SmoothScrollLink` en tu navbar
- [ ] Importa `SmoothScrollButton` para CTAs
- [ ] Envuelve secciones con `AnimatedSectionObserver`
- [ ] Prueba scroll en navegador
- [ ] Prueba en mobile
- [ ] Verifica offset del navbar fixed
- [ ] Done! 🎉
