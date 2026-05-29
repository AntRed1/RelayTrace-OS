# RelayTrace OS — Web Frontend

Plataforma SaaS de trazabilidad operativa para carriers que usan **Amazon Relay**. Elimina la dependencia de capturas de pantalla por WhatsApp, hojas de Excel y procesos manuales de registro de viajes, reemplazándolos con un flujo digital completo: registro PWA del conductor → validación OCR → conciliación automática con correos de Relay → alertas de fraude en tiempo real.

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) |
| Lenguaje | TypeScript 5 |
| Estilos | Tailwind CSS v4 + CSS variables + Custom Design System |
| Estado servidor | TanStack Query (React Query v5) |
| Estado cliente | Zustand |
| Formularios | react-hook-form + zod |
| Fuente | Plus Jakarta Sans (variable) |
| Íconos | Custom SVG (Figma-generated) + lucide-react |
| HTTP | axios (`api-client.ts` con interceptor JWT) |
| Animaciones | Framer Motion (transiciones suaves) |

---

## Requisitos

- Node.js 20+
- Backend `relaytrace-api` corriendo en `http://localhost:3000`

```bash
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

---

## Comandos

```bash
npm install          # instalar dependencias
npm run dev          # desarrollo en :3001
npm run build        # build de producción
npm run start        # servidor de producción
npm run lint         # ESLint
npx tsc --noEmit     # type-check sin emitir
```

---

## Arquitectura de rutas

```
/                        → Landing page pública (Server Component, ISR 60 s)
/auth/login              → Login
/admin/dashboard         → Dashboard (SUPER_ADMIN / COMPANY_ADMIN / DISPATCHER)
/admin/trips             → Gestión de viajes
/admin/drivers           → People (empleados: Drivers / Dispatchers / Admins)
/admin/onboarding        → Solicitudes de acceso y onboarding (SUPER_ADMIN)
/admin/plans             → Gestión de planes de suscripción (SUPER_ADMIN)
/admin/audit             → Audit log paginado (SUPER_ADMIN + COMPANY_ADMIN)
/admin/reconciliation    → Conciliación email ↔ viaje
/admin/settings          → Configuración de empresa + cambio de contraseña
/dispatcher/dashboard    → Dashboard del despachador
/driver/dashboard        → Dashboard PWA del conductor
/driver/register-trip    → Registro de viaje (PWA)
```

Cada grupo tiene su propio `layout.tsx` con guard de autenticación. El middleware (`src/proxy.ts`) redirige a `/auth/login` si no hay token.

---

## Estructura de capas de datos

```
src/services/      ← llamadas axios al API (una función por endpoint)
src/hooks/         ← useQuery / useMutation sobre los servicios
src/app/**/page    ← páginas: consumen hooks, renderizan UI
                     (excepción: src/app/page.tsx es Server Component con ISR)
src/components/    ← componentes reutilizables y de sección
src/stores/        ← Zustand (auth.store: user, tokens, logout)
src/types/index.ts ← todas las interfaces TypeScript del dominio
src/config/        ← ROUTES, constantes de la app
```

### Patrón de data-fetching

```ts
// 1. Servicio (llamada pura al API)
export const tripsService = {
  getAll: (filters) => apiClient.get('/trips', { params: filters })
};

// 2. Hook (React Query sobre el servicio)
export function useTrips(filters) {
  return useQuery({ queryKey: ['trips', filters], queryFn: () => tripsService.getAll(filters) });
}

// 3. Página (consume el hook)
const { data, isLoading } = useTrips({ page, companyId });
```

---

## Roles y multi-tenancy

| Rol | Acceso |
|---|---|
| `SUPER_ADMIN` | Ve datos de **todas** las empresas. Sin `companyId` propio. |
| `COMPANY_ADMIN` | Solo su empresa. Gestiona empleados, viajes, conciliación, audit. |
| `DISPATCHER` | Solo su empresa. Sin acceso a settings. |
| `DRIVER` | Solo su PWA de registro y su historial. |

**Patrón SUPER_ADMIN en hooks**: pasar `enabled: isSuperAdmin` en queries exclusivas de ese rol para evitar 403 en otros roles.

---

## Landing page (`/`)

`src/app/page.tsx` es un **Server Component** con ISR (revalidación cada 60 s). Obtiene los planes activos desde la API y los pasa como props estáticas a `LandingPageClient`.

### Design System: Fluid & Modern

- **Glassmorphism**: Tarjetas semi-transparentes con blur backdrop
- **Gradientes**: Cyan (#22d3ee) → Blue (#2563eb) en toda la app
- **Sombras**: Glows suaves y sombreados en profundidad
- **Animaciones**: Transiciones smooth en scroll (smooth-scroll-link), hover effects, y observador de secciones
- **Tipografía**: Plus Jakarta Sans (variable), con pesos 300-800

### Componentes

| Componente | Contenido |
|---|---|
| `LandingNav` | Barra sticky con logo (56px), nav links con smooth scroll, CTA Sign In |
| `HeroSection` | Hero oscuro con mesh gradient y CTA prominente |
| `ProblemSection` | 4 tarjetas glass oscuras con iconos profesionales |
| `WorkflowSection` | Flujo de 6 pasos con conector visual |
| `FeaturesSection` | Layout asimétrico: 1 featured card grande + 5 pequeñas, iconos SVG |
| `PricingSection` | Planes glassmorphism con popular highlight y shimmer effect |
| `CtaSection` | Stats en glass cards + CTA final con orbs ambient |
| `LandingFooter` | Logo grande (80px), links con smooth scroll al top |
| `RequestAccessModal` | Multi-step dinámico con glassmorphism y transiciones suaves |

---

## Plans — componentes DB-driven

| Componente | Comportamiento |
|---|---|
| `PlanBadge` | Acepta cualquier slug string. Color fallback `#0891b2` para slugs desconocidos. Prop opcional `displayName`. |
| `PlanSelector` | Usa `usePlans()` → `GET /plans/admin`. Renderiza cards dinámicas desde BD. |
| `PricingSection` | Recibe `PublicPlan[]` del Server Component. Sin hardcoding de slugs ni precios. |
| `RequestAccessModal` | Idem — opciones de plan desde BD. |

---

## Settings (`/admin/settings`)

- **Plan actual**: usa `planInfo.displayName/price/period` del `useCurrentCompany()` hook
- **Cambiar plan**: `PlanSelector` DB-driven con `useUpdateCompanyPlan()`
- **Cambiar contraseña**: `ChangePasswordModal` conectado a `useChangePassword()` — apunta a `user.id` del JWT
- **Sección de Notificaciones**: eliminada (UI muerta)

---

## Onboarding de empresas (SUPER_ADMIN)

1. `RequestAccessModal` → `CompanyRequest` con `status: pending`
2. Badge de conteo en sidebar
3. **Onboardar**: abre modal → crea `Company` + `COMPANY_ADMIN` en transacción atómica
4. **Rechazar**: `PATCH /companies/requests/:id/status`

---

## Consideraciones de producción

### NEXT_PUBLIC_* y App Service
Next.js inlinea las variables `NEXT_PUBLIC_*` en el bundle del cliente **en tiempo de build**. Para que la URL del API llegue al browser bundle, la imagen Docker debe construirse con el valor correcto baked in.

En App Service se configuran:
- `NEXTJS_API_URL` → disponible en Server Components y API routes (runtime)
- `NEXT_PUBLIC_API_URL` → solo útil si se reconstruye la imagen con ese valor

En producción ambas apuntan a la URL de **Front Door** (`https://api.relaytrace.com`), gestionadas automáticamente por Terraform (`relaytrace-infra/modules/05-appservice/web.tf`).

### Application Insights
El App Service recibe `APPLICATIONINSIGHTS_CONNECTION_STRING` como referencia Key Vault. Para activar la instrumentación:
```ts
// main.ts — primer import, antes de cualquier otro
import 'applicationinsights';
```

---

## Imágenes de marca

Todas en `public/images/` y `public/`:

### Logos

| Archivo | Tamaño | Uso |
|---|---|---|
| `logo-main.png` | 100px (login), 56px (navbar), 80px (footer) | Logo principal sin fondo |
| `logo-icon.png` | Icono R | Símbolo de la marca |
| `logo-horizontal-pro.png` | Horizontal | Variante horizontal |
| `logo-dark-pro.png` | Oscuro | Variante fondo oscuro |
| `logo-vertical-pro.png` | Vertical | Variante vertical |

### Favicon

| Archivo | Uso |
|---|---|
| `favicon.ico` | Icono navegador + Apps |
| `favicon.svg` | Vector scalable |
| `favicon-96x96.png` | 96x96 raster |
| `apple-touch-icon.png` | iOS home screen |

### Otras

| Archivo | Uso |
|---|---|
| `app-mockup.png` | HeroSection mockup |

## Sistema de Íconos

Disponibles en `src/components/ui/`:

- **`landing-icons.tsx`**: Íconos profesionales para secciones Problem/Features (WhatsApp, Spreadsheets, Driver Link, Fraud, etc.)
- **`relay-icons.tsx`**: Íconos de aplicación con gradiente cyan→blue (Dashboard, Trips, People, OCR, Reconciliation, etc.)

Todos son SVG con gradientes personalizados, 48px de base, escalables vía prop `size`.

```tsx
import { DashboardIcon, TripsIcon } from "@/components/ui/relay-icons";

<DashboardIcon size={44} />  // renderiza 44px
```

---

## Fases del roadmap

| Fase | Estado | Descripción |
|---|---|---|
| **Fase 1** | ✅ | Core multi-tenant: viajes, RBAC, dashboard, people, onboarding |
| **Fase 2A** | ✅ | Stripe Checkout, PlanGuard, límites por plan |
| **Fase 2B** | ✅ | Frontend PWA completo: dashboard, people, driver PWA, sidebar |
| **Fase 2C** | ✅ | Plans DB-driven, ISR landing, audit trail con 14 eventos, settings completo |
| **Fase 2D** | ✅ | Infraestructura IaC en `relaytrace-infra/` (Terraform, 8 módulos Azure) |
| **Fase 3** | 🔜 | OCR real: imagen → Azure Blob → BullMQ → Trip ID |
| **Fase 4** | 🔜 | Emails Relay (IMAP/webhook), auto-conciliación, notificaciones ACS |
| **Fase 5** | 🔜 | Notificaciones push PWA, alertas proactivas, score de conductor |
