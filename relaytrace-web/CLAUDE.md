# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Comandos frecuentes

```bash
npm run dev          # frontend en :3001 (el API corre en :3000)
npm run build        # build de producción — úsalo para validar antes de commitear
npx tsc --noEmit     # type-check rápido sin compilar
npm run lint         # ESLint

# Backend (relaytrace-api, directorio hermano)
npm run start:dev    # NestJS en modo watch
npx prisma migrate dev --name <nombre>   # nueva migración
npx prisma studio    # GUI de base de datos
```

---

## Arquitectura de capas

### Frontend (`relaytrace-web`)

```
src/
  app/           → Rutas Next.js App Router. Cada layout tiene su guard de auth.
  components/
    landing/     → Secciones de la landing page (un archivo por sección)
    layouts/     → Sidebar, TopBar, AppShell
    dashboard/   → RecentTripsTable, StatCard
    trips/       → TripStatusBadge
  services/      → Llamadas axios al API (sin estado, puras)
  hooks/         → useQuery / useMutation sobre los servicios
  stores/        → Zustand: solo auth.store (user, tokens, logout)
  types/index.ts → Todas las interfaces del dominio (fuente de verdad de tipos)
  config/        → ROUTES, TOKEN_KEY, API_BASE_URL
  lib/
    api-client.ts → axios con interceptor Bearer + refresh automático
    utils.ts      → cn(), safeFormat()
```

**Regla de datos**: `services` → `hooks` → `pages/components`. Las páginas nunca llaman a `apiClient` directamente.

### Backend (`relaytrace-api`)

NestJS modular. Cada módulo tiene: `controller`, `service`, `module`, `dto/`.

Módulos: `auth`, `companies`, `trips`, `users`, `drivers`, `dashboard`, `reconciliation`, `relay-emails`, `ocr`, `billing`, `queue`, `audit`, `uploads`, `health`.

Infraestructura común en `src/common/`: guards (`JwtAuthGuard`, `RolesGuard`, `CompanyGuard`), decoradores (`@CurrentUser`, `@Roles`), filtros de excepción, interceptores (`ResponseInterceptor` → envelope `{ success, data, timestamp }`).

---

## Multi-tenancy y RBAC

**Patrón central** — en cualquier endpoint autenticado:

```typescript
// Backend: companyId null = SUPER_ADMIN ve todo
const companyId = user.role === 'SUPER_ADMIN'
  ? (filters?.companyId ?? null)
  : user.companyId;

// En Prisma: where vacío devuelve todo
const where = companyId ? { companyId } : {};
```

**Frontend** — nunca disparar queries de SUPER_ADMIN para otros roles:

```typescript
const isSuperAdmin = user?.role === 'SUPER_ADMIN';
const { data: companies } = useAllCompanies(isSuperAdmin); // enabled=false para otros
const { data: requests }  = useCompanyRequests('pending', isSuperAdmin);
```

Los hooks `useAllCompanies`, `useCompanyRequests` reciben un segundo parámetro `enabled`.

---

## Flujo de onboarding de empresas

```
Landing RequestAccessModal
  → POST /companies/request (público, sin auth)
  → CompanyRequest { status: 'pending' }

/admin/onboarding (SUPER_ADMIN)
  → GET /companies/requests?status=pending
  → POST /companies/requests/:id/onboard { adminEmail, adminName, temporaryPassword }
  → Transacción atómica: Company + User(COMPANY_ADMIN) + CompanyRequest.status='approved'
  ó PATCH /companies/requests/:id/status { status: 'rejected' }
```

---

## Tipos del dominio (`src/types/index.ts`)

Siempre agregar o extender tipos aquí. Interfaces clave:

- `User`, `AuthTokens`, `LoginResponse`
- `Company`, `CompanyRequest`, `CompanyRequestStatus`
- `Trip`, `TripStatus`, `TripSourceType`, `CompanySummary`
- `Driver`, `DriverSummary`, `DriverStats`
- `DashboardSummary`, `DashboardActivity`
- `Reconciliation`, `RelayEmailLog`
- `ApiResponse<T>`, `PaginatedResponse<T>`

---

## Patrones de formularios

Para campos numéricos en react-hook-form + zod, **no usar `z.coerce.number()`** (rompe la inferencia del resolver). Usar:

```typescript
// En el schema
driverCount: z.number().int().min(1).optional(),

// En el register
{...register("driverCount", {
  valueAsNumber: true,
  setValueAs: (v) => v === "" ? undefined : parseInt(v, 10)
})}
```

---

## Sidebar y navegación

`src/components/layouts/Sidebar.tsx` — el ítem "Onboarding" solo se renderiza para `SUPER_ADMIN` y muestra un badge naranja/rojo con el conteo de solicitudes `pending` en tiempo real (vía `useCompanyRequests`).

Agregar una nueva ruta:
1. Añadir la constante en `src/config/constants.ts` → `ROUTES.ADMIN.*`
2. Agregar el ítem en `BASE_NAV` (o condicionalmente como el de Onboarding)
3. Crear `src/app/admin/<ruta>/page.tsx`

---

## Imágenes de marca

En `public/images/`. Cambiar logos → reemplazar los archivos PNG manteniendo los mismos nombres. El LandingNav alterna entre `logo-horizontal.png` (scroll blanco) y la versión dark según el estado de scroll.

---

## Validación del backend

`ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })` está activo globalmente. **Todo** parámetro de query que llegue al controller debe estar declarado en el DTO con `@IsOptional()`. Si no está declarado, devuelve 400.

Para params numéricos de paginación:

```typescript
@IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
@IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit?: number;
```

---

## Convenciones de respuesta del API

Todas las respuestas pasan por `ResponseInterceptor`:

```json
{ "success": true, "data": <payload>, "timestamp": "...", "message": "..." }
```

Los servicios del frontend acceden a `response.data.data` para extraer el payload.

La paginación devuelve `{ data: T[], meta: { page, pageSize, total, totalPages } }`.
