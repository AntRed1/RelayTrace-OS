# RelayTrace OS — Web Frontend

Plataforma SaaS de trazabilidad operativa para carriers que usan **Amazon Relay**. Elimina la dependencia de capturas de pantalla por WhatsApp, hojas de Excel y procesos manuales de registro de viajes, reemplazándolos con un flujo digital completo: registro PWA del conductor → validación OCR → conciliación automática con correos de Relay → alertas de fraude en tiempo real.

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) |
| Lenguaje | TypeScript 5 |
| Estilos | Tailwind CSS v4 + CSS variables |
| Estado servidor | TanStack Query (React Query v5) |
| Estado cliente | Zustand |
| Formularios | react-hook-form + zod |
| Fuente | Plus Jakarta Sans (variable) |
| Íconos | lucide-react |
| HTTP | axios (`api-client.ts` con interceptor JWT) |

---

## Requisitos

- Node.js 20+
- Backend `relaytrace-api` corriendo en `http://localhost:3000`

Copia las variables de entorno:
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
/                        → Landing page pública
/auth/login              → Login
/admin/dashboard         → Dashboard (SUPER_ADMIN / COMPANY_ADMIN / DISPATCHER)
/admin/trips             → Gestión de viajes
/admin/drivers           → People (empleados: Drivers / Dispatchers / Admins)
/admin/onboarding        → Solicitudes de acceso y onboarding (solo SUPER_ADMIN)
/admin/reconciliation    → Conciliación email↔viaje
/admin/settings          → Configuración de empresa
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
src/components/    ← componentes reutilizables y de sección
src/stores/        ← Zustand (auth.store: user, tokens, logout)
src/types/index.ts ← todas las interfaces TypeScript del dominio
src/config/        ← ROUTES, constantes de la app
```

### Patrón de data-fetching

```ts
// 1. Servicio (llamada pura al API)
export const tripsService = { getAll: (filters) => apiClient.get('/trips', { params: filters }) };

// 2. Hook (React Query sobre el servicio)
export function useTrips(filters) { return useQuery({ queryKey: ['trips', filters], queryFn: () => tripsService.getAll(filters) }); }

// 3. Página (consume el hook)
const { data, isLoading } = useTrips({ page, companyId });
```

---

## Roles y multi-tenancy

| Rol | Acceso |
|---|---|
| `SUPER_ADMIN` | Ve datos de **todas** las empresas. Sin `companyId` propio. |
| `COMPANY_ADMIN` | Solo su empresa. Gestiona empleados, viajes, conciliación. |
| `DISPATCHER` | Solo su empresa. No accede a settings. |
| `DRIVER` | Solo su PWA de registro y su historial. |

**Patrón SUPER_ADMIN en hooks**: siempre pasar `enabled: isSuperAdmin` para queries que solo aplican a ese rol (ej. `useAllCompanies`, `useCompanyRequests`), evitando 403 para otros roles.

---

## Landing page (`/`)

Compuesta en `src/app/page.tsx` con secciones independientes bajo `src/components/landing/`:

| Componente | Contenido |
|---|---|
| `LandingNav` | Barra sticky con scroll-transition, logo dual (dark/light), CTA Sign In |
| `HeroSection` | Hero oscuro, titular con gradiente, mockup de la app |
| `ProblemSection` | 4 tarjetas de problemas que ResuelveTrace OS |
| `WorkflowSection` | Flujo de 6 pasos con iconos numerados |
| `FeaturesSection` | 6 características clave |
| `PricingSection` | 3 planes: Starter $49, Growth $149 (destacado), Fleet (custom) |
| `CtaSection` | Strip de estadísticas + sección CTA final oscura |
| `LandingFooter` | Pie de página con columnas de links y estado del sistema |
| `RequestAccessModal` | Formulario de solicitud → `POST /api/v1/companies/request` |

---

## Onboarding de empresas (SUPER_ADMIN)

Flujo completo accesible en `/admin/onboarding`:

1. Empresa llena `RequestAccessModal` en la landing → se crea un `CompanyRequest` con `status: pending`
2. SUPER_ADMIN ve la solicitud en la página de Onboarding con badge de conteo en el sidebar
3. Puede **Onboardar**: abre modal → ingresa `adminEmail`, `adminName`, `temporaryPassword` → llama `POST /companies/requests/:id/onboard` → se crean `Company` + usuario `COMPANY_ADMIN` en una transacción atómica
4. O puede **Rechazar**: `PATCH /companies/requests/:id/status` con `{ status: "rejected" }`

---

## Imágenes de marca

Todas en `public/images/`:

| Archivo | Uso |
|---|---|
| `logo-dark-full.png` | Footer (fondo oscuro) |
| `logo-horizontal.png` | LandingNav (scroll con fondo blanco) |
| `logo.png` / `logo-dark.png` | Variantes de logo |
| `app-mockup.png` | HeroSection — ilustración del producto |
| `favicon.svg` | Icono del sitio |

---

## Backend

El API (`relaytrace-api`) corre en `http://localhost:3000` con prefijo `/api/v1`.
Todas las respuestas siguen el envelope: `{ success, data, timestamp, message? }`.

Módulos principales: `auth`, `companies`, `trips`, `users`, `drivers`, `dashboard`, `reconciliation`, `relay-emails`, `ocr`, `billing`, `queue`.

Swagger disponible en `http://localhost:3000/api/docs`.

---

## Fases del roadmap

| Fase | Estado | Descripción |
|---|---|---|
| **Fase 1** | ✅ Completo | Core multi-tenant: registro de viajes, RBAC, dashboard, people, conciliación, landing page, onboarding SUPER_ADMIN |
| **Fase 2** | 🔜 Próxima | Stripe subscriptions, enforcement de límites por plan |
| **Fase 3** | 🔜 Próxima | OCR real (upload de imagen → Azure Blob → BullMQ), pipeline de procesamiento |
| **Fase 4** | 🔜 Futura | Integración de correos Relay (IMAP/webhook), auto-conciliación |
| **Fase 5** | 🔜 Futura | Notificaciones push PWA, alertas de fraude proactivas |
