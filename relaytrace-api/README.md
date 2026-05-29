# relaytrace-api

Backend NestJS de RelayTrace OS. Ver el [README raíz](../README.md) para la documentación completa del proyecto.

---

## Comandos rápidos

```bash
# Desarrollo con watch
npm run start:dev

# Build producción
npm run build
npm run start:prod

# Tests
npm run test
npm run test:e2e
npm run test:cov

# Lint
npm run lint
```

## Prisma

```bash
npx prisma migrate dev --name <nombre>   # nueva migración
npx prisma migrate deploy                 # aplicar en producción
npx prisma generate                       # regenerar cliente
npx prisma studio                         # explorador visual
npx prisma db seed                        # seed inicial (roles + SUPER_ADMIN)
```

---

## Endpoints principales

- **API base:** `http://localhost:3000/api/v1`
- **Swagger UI:** `http://localhost:3000/api/docs`
- **Health:** `http://localhost:3000/api/v1/health`

| Módulo | Prefijo | Roles |
|--------|---------|-------|
| Auth | `/auth` | Público / Autenticado |
| Users | `/users` | COMPANY_ADMIN+ |
| Trips | `/trips` | DRIVER+ |
| Dashboard | `/dashboard` | DISPATCHER+ |
| Companies | `/companies` | COMPANY_ADMIN+ |
| Plans (público) | `GET /plans` | Público |
| Plans (admin) | `/plans` POST/PATCH/DELETE | SUPER_ADMIN |
| Audit | `/audit` | COMPANY_ADMIN+ |
| Billing | `/billing` | Autenticado / Webhook público |
| Uploads | `/uploads` | Autenticado |
| Reconciliation | `/reconciliation` | COMPANY_ADMIN+ |
| Health | `/health` | Público |

---

## Variables de entorno

Copiar `.env.example` a `.env.local`.

```env
# Server
NODE_ENV=development
PORT=3000
ALLOWED_ORIGINS=http://localhost:3001

# Database
DATABASE_URL="mysql://relaytrace:password@localhost:3306/relaytrace"

# JWT
JWT_ACCESS_SECRET=min_32_chars_secret
JWT_REFRESH_SECRET=min_32_chars_refresh_secret
JWT_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Azure Storage (screenshots + OCR)
AZURE_STORAGE_ACCOUNT_NAME=
AZURE_STORAGE_CONTAINER_SCREENSHOTS=screenshots
AZURE_STORAGE_CONTAINER_OCR=ocr-documents
AZURE_STORAGE_CONTAINER_EXPORTS=exports

# Azure Document Intelligence (OCR — Growth+)
AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=
AZURE_DOCUMENT_INTELLIGENCE_KEY=

# ACS Email
ACS_CONNECTION_STRING=
ACS_FROM_ADDRESS=noreply@mail.relaytrace.com

# Microsoft Graph (email parsing)
AZURE_AD_CLIENT_ID=
AZURE_AD_CLIENT_SECRET=
AZURE_AD_TENANT_ID=

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Application Insights (producción)
APPLICATIONINSIGHTS_CONNECTION_STRING=
```

> **Producción (Azure App Service):** Todos los valores sensibles son referencias Key Vault resueltas por Managed Identity. El valor real de cada variable nunca aparece en la configuración del App Service — es inyectado en runtime por la plataforma.

---

## Módulos clave

### `AuditModule` (`@Global`)
Inyectable en cualquier módulo sin imports adicionales. `auditService.log()` es fire-and-forget — nunca interrumpe el flujo principal. Cubre 14 tipos de evento.

### `CacheModule` (`@Global`)
`RedisCacheService` con `getOrSet()` y `del()`. Usado en `PlansModule` (invalidación automática en mutaciones) y en `JwtAuthGuard` (cache de `subscriptionStatus` 5 min, invalidado por `BillingService` en webhooks Stripe).

### `JwtAuthGuard`
Extiende `AuthGuard('jwt')`. Tras validar el token, verifica `subscriptionStatus` desde Redis (clave `company:sub:{companyId}`, TTL 5 min). Lanza `ForbiddenException` si la suscripción está cancelada. SUPER_ADMIN bypass.

### `PlansModule`
CRUD completo de planes con cache Redis. `GET /plans` público (para landing page con ISR). `stripePriceId` se almacena en BD — no requiere variables de entorno por plan.

### `BillingService`
Resuelve `stripePriceId` desde `Plan.stripePriceId` en BD. En webhooks exitosos invalida el cache de `subscriptionStatus` del company afectado.

### `EmailService` (notifications)
Usa `@azure/communication-email` con la variable `ACS_CONNECTION_STRING`. `ACS_FROM_ADDRESS` define el remitente.
