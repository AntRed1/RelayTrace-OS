# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**RelayTrace OS** is a multi-tenant SaaS that acts as an operational traceability layer on top of Amazon Relay. Companies share one Relay account across multiple drivers; this platform associates driver → trip → timestamp → evidence to prevent fraud and provide full auditability.

The repo is a monorepo with two deployable apps:

| App | Tech | Port |
|-----|------|------|
| `relaytrace-api/` | NestJS 11 + TypeScript 5 + Prisma 7 + MySQL 8 | 3000 |
| `relaytrace-web/` | **Next.js 16.2.6** + React 19 + Tailwind 4 | 3000 (Docker: 3001 for API) |

---

## Commands

### Backend (`relaytrace-api/`)

```bash
npm run start:dev      # Development with hot reload (watch mode)
npm run build          # Compile to dist/
npm run start:prod     # Run compiled build
npm run lint           # ESLint auto-fix
npm run test           # Jest unit tests (rootDir: src, pattern: *.spec.ts)
npm run test:watch     # Jest in watch mode
npm run test:cov       # Coverage report
npm run test:e2e       # E2E tests (./test/jest-e2e.json)
```

Prisma:
```bash
npx prisma migrate dev --name <name>   # Create and apply migration
npx prisma migrate deploy              # Apply migrations (production)
npx prisma generate                    # Regenerate Prisma client
npx prisma db seed                     # Seed roles and initial data
npx prisma studio                      # Browse data in UI
```

### Frontend (`relaytrace-web/`)

```bash
npm run dev     # Development server (Turbopack)
npm run build   # Production build
npm run lint    # ESLint
```

### Docker (root)

```bash
docker-compose up -d    # Start mysql + api + web containers
```

---

## Architecture

### Multi-Tenant Isolation

**Critical rule:** Every database entity has a `companyId` field. All service queries filter by `companyId` taken from the JWT payload — never from the request body. `SUPER_ADMIN` bypasses these filters.

```typescript
// Pattern used everywhere in services
if (user.role !== 'SUPER_ADMIN') {
  where.companyId = user.companyId;
}
```

### Backend Request Pipeline

Every request goes through this chain:
1. **ThrottlerGuard** (global — 10 req/s, 100 req/min)
2. **JwtAuthGuard** → attaches `user` to `request`
3. **RolesGuard** → checks `@Roles()` decorator; SUPER_ADMIN always passes
4. **CompanyGuard** → attaches `request.companyId = user.companyId`
5. **ValidationPipe** → `whitelist: true`, `forbidNonWhitelisted: true`, transforms types
6. **SanitizeInterceptor** → strips sensitive fields from responses
7. **ResponseInterceptor** → wraps all responses in `{ data, meta?, timestamp }` envelope
8. **LoggingInterceptor** → logs request/response timing
9. **HttpExceptionFilter** + **PrismaExceptionFilter** → centralized error handling

### Global NestJS Modules

- `PrismaModule` — `@Global()`, provides `PrismaService` everywhere
- `QueueModule` — `@Global()`, provides `QueueProducerService` + BullMQ queues

### BullMQ Queues

Four queues are registered: `QUEUE_OCR`, `QUEUE_EMAIL`, `QUEUE_RECONCILE`, `QUEUE_ALERT`. Processors are in `src/modules/queue/processors/`. When a trip is created with a `screenshotUrl`, OCR is automatically enqueued.

### Trip Flow (Core Domain)

```
Driver registers trip (tripId = Amazon Relay ID)
  → If screenshotUrl present: OCR job enqueued
  → sourceType: 'manual' | 'ocr' | 'relay_email'
  → status: 'pending' → 'confirmed' | 'flagged'
  → Reconciliation: compare against RelayEmailLog (parsed from MS Graph API)
  → Alert generated if missing_trip / duplicate_trip
```

### Roles

| Role | Key capabilities |
|------|-----------------|
| `SUPER_ADMIN` | Bypasses all guards; crosses tenant boundaries |
| `COMPANY_ADMIN` | Full control within own company |
| `DISPATCHER` | Read-only: trips, drivers, dashboard, reconciliation |
| `DRIVER` | Register trips, view own trips only |

---

## Backend Code Conventions

- **DTOs** live in `modules/<name>/dto/` and use `class-validator` decorators; `@ApiProperty()` for Swagger
- **Custom exceptions** are in `src/common/exceptions/custom.exceptions.ts` — use `ResourceNotFoundException`, `ConflictException`, etc. instead of raw NestJS exceptions
- **`@CurrentUser()`** decorator extracts the JWT user from the request; **`@Roles(...)`** sets required roles
- All modules inject `AuditService` to log sensitive actions (login, create_trip, delete_trip…)
- Config is centralized in `src/config/app.config.ts`; env vars are validated in `src/config/validation.ts`
- Swagger docs are only enabled when `NODE_ENV !== 'production'`, accessible at `GET /api/docs`

---

## Frontend Code Conventions

> ⚠️ **Next.js 16.2.6 has breaking changes from Next.js 15.** Before writing any Next.js-specific code (routing, server components, data fetching), read the guide in `node_modules/next/dist/docs/`. Do not rely on training-data knowledge of Next.js 14/15 APIs.

- **State management:** Zustand for auth/session state (`src/stores/`), TanStack Query (`@tanstack/react-query`) for all server data with `staleTime: 60_000` and `retry: 1`
- **HTTP client:** `src/lib/api-client.ts` — Axios instance with interceptors that auto-attach `Bearer` token and transparently refresh on 401 using the refresh token
- **Token storage:** `localStorage` keys: `rt_access_token`, `rt_refresh_token`, `rt_user`
- **Role-based redirects:** `ROLE_ROUTES` in `src/config/constants.ts` maps each role to its default route after login
- **Forms:** `react-hook-form` + `zod` schemas + `@hookform/resolvers`
- **UI:** Tailwind CSS 4, `lucide-react` icons, `recharts` for charts, `clsx`/`tailwind-merge` for class merging
- **Clerk** is installed (`@clerk/nextjs`) but manual JWT auth via `api-client.ts` is the primary auth mechanism

---

## Environment Variables

Required in `relaytrace-api/.env`:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="mysql://relaytrace:password@localhost:3306/relaytrace"
JWT_SECRET=<min 32 chars>
JWT_REFRESH_SECRET=<min 32 chars>
JWT_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d
REDIS_HOST=localhost
REDIS_PORT=6379
AZURE_STORAGE_ACCOUNT_NAME=
AZURE_STORAGE_ACCOUNT_KEY=
AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=
AZURE_DOCUMENT_INTELLIGENCE_KEY=
AZURE_AD_CLIENT_ID=
AZURE_AD_CLIENT_SECRET=
AZURE_AD_TENANT_ID=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

Required in `relaytrace-web/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

---

## Local Development Prerequisites

- Node.js 20+, MySQL 8+, Redis 7+
- Start Redis: `docker run -d --name redis -p 6379:6379 redis:7-alpine`
- Or use Docker Compose from repo root to spin up MySQL + API + Web together

API is available at `http://localhost:3000/api/v1` · Swagger at `http://localhost:3000/api/docs`
