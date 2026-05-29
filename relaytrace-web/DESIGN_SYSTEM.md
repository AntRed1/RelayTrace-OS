# RelayTrace OS — Design System

**Estilo**: Fluid & Modern | Glassmorphism + Gradientes Suaves | Premium SaaS

---

## 🎨 Paleta de Colores

### Primarios
- **Cyan**: `#22d3ee` (luminoso, forward)
- **Blue**: `#2563eb` (profundo, trust)
- **Gradiente principal**: `linear-gradient(135deg, #22d3ee, #2563eb)` ← usado en toda la app

### Neutrales
- **Slate 50**: `#f8fafc` (fondo claro)
- **Slate 900**: `#0f172a` (fondo oscuro)
- **Slate 600**: `#475569` (texto secundario)

### Semánticos
- **Success**: `#10b981` (emerald)
- **Warning**: `#f59e0b` (amber)
- **Danger**: `#ef4444` (red)

---

## 🔤 Tipografía

### Fuente base
- **Plus Jakarta Sans** (Google Fonts, variable)
- Pesos: 300, 400, 500, 600, 700, 800
- Uso: Todos los textos

### Monoespaciada
- **JetBrains Mono** (código, debug)

### Escalas

| Tamaño | Peso | Uso |
|--------|------|-----|
| `text-xs` (12px) | 500-600 | Labels, badges, helpers |
| `text-sm` (14px) | 400-500 | Body secundario |
| `text-base` (16px) | 400-600 | Body principal, inputs |
| `text-lg` (18px) | 600 | Subheadings, accents |
| `text-2xl` (24px) | 700 | Card titles, section headers |
| `text-4xl` (36px) | 800 | Page headings |
| `text-5xl` (48px) | 800 | Hero titles |

---

## 💎 Componentes base

### Buttons

#### `.btn-primary`
```tsx
<button className="btn-primary">Get Started</button>
```
- **Fondo**: Gradiente cyan→blue
- **Efecto hover**: Scale 1.02 + glow shadow
- **Shimmer**: Sweep animation al hover
- **Tamaño**: 11px padding Y, 22px padding X

#### `.btn-secondary`
```tsx
<button className="btn-secondary">Sign In</button>
```
- **Fondo**: Slate 50 semi-transparent
- **Border**: Slate 200
- **Efecto hover**: Fondo blanco, lift translateY(-1px)

#### `.btn-glass`
```tsx
<button className="btn-glass">Learn More</button>
```
- **Fondo**: Glassmorphism (rgba blanco 0.06 + backdrop-filter blur)
- **Border**: Blanco semi-transparent
- **Para**: Fondos oscuros

### Inputs

#### `.input`
```tsx
<input className="input" placeholder="you@company.com" />
```
- **Fondo**: Slate 50 transparente
- **Border**: Slate 200
- **Focus**: Ring azul suave, escala el border
- **Placeholder**: Slate 400

### Cards

#### `.glass-dark`
Tarjeta semi-transparente para fondos oscuros:
```tsx
<div className="glass-dark rounded-2xl p-6">
  Contenido
</div>
```
- **Fondo**: `rgba(255,255,255,0.05)` + blur 20px
- **Border**: Blanco 0.09
- **Sombra**: Interna sutil

#### `.glass-light`
Tarjeta para fondos claros (con hover):
```tsx
<div className="glass-light rounded-2xl p-6">
  Contenido
</div>
```
- **Fondo**: `rgba(255,255,255,0.72)` + blur 16px
- **Hover**: Fondo más opaco, lift, glow

#### `.gradient-border-card`
Borde gradiente animado:
```tsx
<div className="gradient-border-card p-8">
  Contenido
</div>
```
- **Borde**: Gradiente cyan→blue (1px)
- **Hover**: Gradiente más opaco
- **Raio**: 20px

### Badges y Pills

#### `.eyebrow`
Etiquetas de sección:
```tsx
<span className="eyebrow eyebrow-blue">Platform Features</span>
```
- **Variantes**: `eyebrow-blue`, `eyebrow-cyan`, `eyebrow-purple`, `eyebrow-emerald`, `eyebrow-red`
- **Tamaño**: 11px font, 5px padding Y
- **Animación**: Pulse dot opcional

#### `.badge`
Badges compactas:
```tsx
<span className="badge badge-success">Active</span>
```
- **Variantes**: `badge-success`, `badge-warning`, `badge-danger`, `badge-blue`

---

## ✨ Efectos y Animaciones

### Transiciones suave

#### Scroll suave a sección
```tsx
import { useScrollTo } from '@/hooks/useScrollTo';
// O usar la función scrollToSection(id) directamente
window.scrollTo({ top: 0, behavior: 'smooth' });
```

#### Smooth scroll links
```tsx
import { SmoothScrollLink } from '@/components/ui/smooth-scroll-link';

<SmoothScrollLink href="features">Go to Features</SmoothScrollLink>
```

### Glows

| Clase | Efecto |
|-------|--------|
| `.icon-glow-blue` | Drop shadow azul (37,99,235) |
| `.icon-glow-cyan` | Drop shadow cyan (34,211,238) |

### Animaciones globales

Definidas en `src/app/globals.css`:

- `@keyframes fadeUp` — Fade + slide up (0-8px)
- `@keyframes shimmer` — Sweep horizontal para shine effects
- `@keyframes float` — Flotación suave vertical (0→-8px)
- `@keyframes pulse-glow` — Glow que late

Clases helper:
- `.animate-float` — Aplica float
- `.animate-pulse-glow` — Aplica pulse-glow
- `.animate-spin-slow` — Rotate lento (12s)

---

## 🏗️ Backgrounds especiales

### Mesh gradient claro
```tsx
<div className="mesh-light">Contenido</div>
```
Radiales suaves de cyan/blue sobre fondo claro.

### Mesh gradient oscuro
```tsx
<div className="mesh-dark">Contenido</div>
```
Radiales suaves sobre degradado navy oscuro.

### Gradient divider
```tsx
<div className="gradient-divider"></div>
```
Línea horizontal con gradiente cyan→blue (1px, altura).

---

## 🎯 Íconos profesionales

Dos sets SVG personalizados en `src/components/ui/`:

### Landing Icons (`landing-icons.tsx`)
Para secciones Problem/Features de landing:
- `WhatsAppScreenshotIcon` (naranja)
- `ManualSpreadsheetsIcon` (rojo)
- `NoDriverLinkIcon` (púrpura)
- `FraudUndetectedIcon` (amarillo)
- `DriverAcceptsLoadIcon` (cyan)
- `QuickRegisterIcon` (cyan)
- `CaptureEmailIcon` (cyan)
- `AutoReconciliationIcon` (cyan)
- `RealTimeAlertsIcon` (cyan)
- `OperationalVisibilityIcon` (cyan)

### Relay Icons (`relay-icons.tsx`)
Para dashboard y app:
- `DashboardIcon`
- `TripsIcon`
- `PeopleIcon`
- `OCRProcessingIcon`
- `ReconciliationIcon`
- `OnboardingIcon`
- `PlansIcon`
- `AuditLogIcon`

Todos con gradiente cyan→blue y escalables vía `size` prop.

---

## 📐 Espaciado y dimensiones

### Tamaños de logo

| Ubicación | Tamaño |
|-----------|--------|
| **Landing Navbar** | 56px |
| **Landing Footer** | 80px |
| **Login Page** | 100px |
| **Dashboard** | 40px (TBD) |

### Border radius

| Componente | Radio |
|-----------|-------|
| Buttons | 12px |
| Cards | 20px |
| Inputs | 12px |
| Icons bg | 12px |
| Pills/badges | 99px |

### Shadows

| Uso | Shadow |
|-----|--------|
| `--rt-shadow-sm` | Sutil (1-3px) |
| `--rt-shadow` | Normal (4-6px) |
| `--rt-shadow-md` | Mediano (10-15px) |
| `--rt-shadow-lg` | Grande (24-48px) |
| `--rt-glow-blue` | Glow azul (28px) |
| `--rt-glow-cyan` | Glow cyan (28px) |

---

## 🔌 Uso en componentes

### Importar el design system
```tsx
// Globals ya está inyectado en layout.tsx
// Solo usa las clases base:

<div className="glass-light rounded-2xl p-6">
  <button className="btn-primary">Start</button>
</div>
```

### Personalizar colores
```tsx
// Usa CSS variables:
<div style={{ background: "var(--rt-gradient)" }}>
  Premium gradient
</div>

// O inline con colores del design:
<div style={{ color: "#22d3ee" }}>Cyan text</div>
```

### Animaciones en componentes
```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
>
  Animated content
</motion.div>
```

---

## 📱 Responsive

El design system usa Tailwind responsive prefixes:
- `sm:` (640px+)
- `md:` (768px+)
- `lg:` (1024px+)
- `xl:` (1280px+)

Ejemplo:
```tsx
<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
  {/* 1 col mobile, 2 sm, 4 lg */}
</div>
```

---

## ✅ Checklist para nuevos componentes

- [ ] Usa `.glass-light` o `.glass-dark` en lugar de border seco
- [ ] Colores: gradiente cyan→blue preferido (no colores planos)
- [ ] Buttons: siempre `.btn-*` (primary/secondary/glass)
- [ ] Inputs: siempre `.input`
- [ ] Hover effects: incluir transición suave
- [ ] Sombras: usa `--rt-shadow-*` o glows
- [ ] Animations: fade/slide con Framer Motion o CSS keyframes
- [ ] Icons: SVG profesional con gradientes, no lucide-react
- [ ] Responsive: test sm/md/lg breakpoints

---

**Última actualización**: Mayo 2026 — Redesign Fluid & Modern completo
