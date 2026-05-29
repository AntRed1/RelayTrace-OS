<div align="center">

<img src="relaytrace-web/public/images/logo-horizontal.png" alt="RelayTrace OS" width="320" />

<br />

# RelayTrace OS

### Plataforma Operacional de Trazabilidad para Amazon Relay

<p>
  <img src="https://img.shields.io/badge/NestJS-11.x-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Next.js-15.x-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-7.x-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
</p>

<p>
  <img src="https://img.shields.io/badge/MySQL-8.x-4479A1?style=for-the-badge&logo=mysql&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis-BullMQ-DC382D?style=for-the-badge&logo=redis&logoColor=white" />
  <img src="https://img.shields.io/badge/Stripe-Billing-635BFF?style=for-the-badge&logo=stripe&logoColor=white" />
  <img src="https://img.shields.io/badge/Azure-Cloud-0078D4?style=for-the-badge&logo=microsoftazure&logoColor=white" />
  <img src="https://img.shields.io/badge/Terraform-IaC-7B42BC?style=for-the-badge&logo=terraform&logoColor=white" />
</p>

<br />

> **RelayTrace OS** es un SaaS multi-tenant que resuelve el problema crítico de trazabilidad, auditoría y control operacional en flotas de transporte que utilizan Amazon Relay, permitiendo a las empresas saber exactamente qué conductor tomó qué viaje, cuándo, y con evidencia fotográfica.

<br />

[📖 API Docs](http://localhost:3000/api/docs) · [🐛 Issues](https://github.com/AntRed1/RelayTrace-OS/issues)

</div>

---

## 📋 Tabla de Contenidos

- [El Problema](#-el-problema)
- [La Solución](#-la-solución)
- [Arquitectura](#-arquitectura)
- [Stack Tecnológico](#-stack-tecnológico)
- [Estructura del Repositorio](#-estructura-del-repositorio)
- [Funcionalidades Implementadas](#-funcionalidades-implementadas)
- [Roles y Permisos](#-roles-y-permisos)
- [API Endpoints](#-api-endpoints)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Variables de Entorno](#-variables-de-entorno)
- [Base de Datos](#-base-de-datos)
- [Seguridad](#-seguridad)
- [Planes y Billing](#-planes-y-billing)
- [Infraestructura Cloud](#-infraestructura-cloud)
- [Roadmap](#-roadmap)

---

## 🚨 El Problema

Muchas empresas de transporte que operan con Amazon Relay utilizan **una sola cuenta compartida** entre múltiples conductores. Esto genera:

```
❌ No se sabe qué conductor tomó qué viaje
❌ No existe historial organizado ni trazabilidad
❌ Fraude interno difícil de detectar
❌ Dependencia de screenshots por WhatsApp
❌ Sin auditoría ni reconciliación automática
```

---

## ✅ La Solución

RelayTrace OS actúa como **capa operacional** por encima de Amazon Relay:

```
Conductor toma viaje en Amazon Relay
           ↓
Conductor registra el Trip ID + foto desde su celular
           ↓
Sistema asocia: conductor + viaje + timestamp + evidencia fotográfica
           ↓
Empresa obtiene trazabilidad completa, auditoría y detección de fraude
```

**RelayTrace OS NO reemplaza Amazon Relay — lo complementa.**

---

## 🏗 Arquitectura

### Arquitectura de Producción (Azure)

```
                     relaytrace.com / api.relaytrace.com
                                    │
                    ┌───────────────▼──────────────────┐
                    │      Azure Front Door Standard    │
                    │   WAF · SSL administrado · CDN    │
                    └──────────┬────────────┬───────────┘
                               │            │
                ┌──────────────▼──┐   ┌─────▼───────────┐
                │  Next.js 15     │   │   NestJS API    │
                │  App Service    │   │   App Service   │
                │  (Linux P1v3)   │   │   (Linux P1v3)  │
                └────────────┬───┘   └──────┬───────────┘
                             └──────┬────────┘
                              VNet Integration (snet-appservice)
                    ┌──────────────┼──────────────────┐
                    │              │                   │
           ┌────────▼──────┐ ┌────▼──────┐  ┌─────────▼──────────┐
           │ MySQL Flex.   │ │  Redis    │  │    Azure Key Vault  │
           │ B1ms · westus2│ │  Cache    │  │ RBAC + Private Endpoint│
           │ (snet-mysql)  │ │ (PE data) │  └────────────────────┘
           └───────────────┘ └───────────┘
                    │
     ┌──────────────┼──────────────────────┐
     │              │                      │
┌────▼──────┐ ┌─────▼────────┐  ┌──────────▼────────────┐
│  Azure    │ │   ACS Email  │  │   Application Insights  │
│  Storage  │ │  (custom     │  │ + Log Analytics (LAW)   │
│  (3 blobs)│ │   domain)    │  └─────────────────────────┘
└───────────┘ └──────────────┘
```

### Arquitectura Multi-Tenant

```
SaaS Platform (RelayTrace OS)
└── SUPER_ADMIN (sin empresa — acceso global)
└── Company A (tenant)
│   ├── COMPANY_ADMIN  → gestiona usuarios, ve todos los viajes
│   ├── DISPATCHER     → monitoreo en tiempo real
│   └── DRIVERs        → registran viajes con foto desde el celular
└── Company B (tenant)
    └── ...aislamiento total por companyId
```

---

## 🛠 Stack Tecnológico

### Backend (`relaytrace-api`)

| Capa | Tecnología | Versión |
|------|-----------|---------|
| **Framework** | NestJS | 11.x |
| **Lenguaje** | TypeScript | 5.x |
| **ORM** | Prisma | 7.x |
| **Base de Datos** | MySQL 8 (Flexible Server) | — |
| **Auth** | JWT + Passport (access + refresh tokens) | — |
| **File Upload** | Multer (diskStorage) | built-in |
| **Queue** | BullMQ + Redis | — |
| **Storage** | Azure Blob Storage (OCR, plan Growth+) | — |
| **OCR** | Azure AI Document Intelligence | plan Growth+ |
| **Email** | Azure Communication Services (ACS) | — |
| **Email Parsing** | Microsoft Graph API | — |
| **Billing** | Stripe Checkout + Webhooks | — |
| **Documentación** | Swagger / OpenAPI 3 | — |
| **Rate Limiting** | `@nestjs/throttler` (10/seg, 100/min) | — |
| **Observabilidad** | Application Insights SDK | — |

### Frontend (`relaytrace-web`)

| Capa | Tecnología |
|------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **UI** | Tailwind CSS v4 + Custom Design System |
| **Diseño** | Glassmorphism + Gradientes Cyan→Blue |
| **Íconos** | SVG profesionales (Figma) + Lucide Icons |
| **Estado servidor** | TanStack Query (React Query) |
| **Estado global** | Zustand (auth store) |
| **Formularios** | React Hook Form + Zod |
| **Mapas** | React Leaflet (OpenStreetMap) |
| **Animaciones** | Framer Motion + CSS keyframes + Tailwind transitions |
| **PWA** | `site.webmanifest` + favicon.ico + apple-touch-icon |

### Infraestructura (`relaytrace-infra`)

| Componente | Tecnología |
|------------|-----------|
| **IaC** | Terraform (AzureRM ~3.100) |
| **Estado remoto** | Azure Blob Storage |
| **Región** | West US 2 |
| **Cómputo** | App Service Plan Linux P1v3 (compartido) |
| **Base de Datos** | Azure MySQL Flexible Server B1ms |
| **Caché** | Azure Cache for Redis (Basic C0 / Standard C1) |
| **Secretos** | Azure Key Vault (RBAC + Private Endpoint) |
| **Storage** | Azure Storage Account (LRS/ZRS) |
| **Email** | Azure Communication Services + dominio personalizado |
| **CDN / WAF** | Azure Front Door Standard |
| **Observabilidad** | Application Insights + Log Analytics Workspace |

---

## 📁 Estructura del Repositorio

```
RelayTrace-OS/
├── relaytrace-api/          # Backend NestJS
├── relaytrace-web/          # Frontend Next.js 15 (PWA)
├── relaytrace-infra/        # Infraestructura Terraform (Azure)
├── relaytrace-images/       # Assets de marca (logos, imágenes)
└── README.md
```

### Backend (`relaytrace-api/src/`)

```
common/
├── decorators/        # @CurrentUser, @Roles, @RequireFeature
├── filters/           # HttpExceptionFilter, PrismaExceptionFilter
├── guards/            # JwtAuthGuard, RolesGuard, CompanyGuard, PlanGuard
└── interceptors/      # ResponseInterceptor, LoggingInterceptor

modules/
├── auth/              # Login, refresh, JWT strategy
├── users/             # CRUD + cambio de contraseña + audit
├── companies/         # Multi-tenant: empresas SaaS
├── roles/             # RBAC — lista de roles disponibles
├── drivers/           # Abstracción conductores + stats
├── trips/             # ⭐ Core — registro y trazabilidad de viajes
├── uploads/           # Multer (screenshots) + Azure Blob (OCR Growth+)
├── audit/             # Trail de auditoría global (@Global, fire-and-forget)
├── plans/             # CRUD de planes de suscripción + cache Redis (SUPER_ADMIN)
├── dashboard/         # KPIs: viajes hoy, conductores activos, alertas
├── billing/           # Stripe Checkout Sessions + Webhook idempotente
├── queue/             # BullMQ producers + processors
├── ocr/               # Azure AI Document Intelligence (Growth+)
├── relay-emails/      # Microsoft Graph API — parser emails Relay
├── reconciliation/    # Motor anti-fraude
├── notifications/     # ACS Email — transaccionales y alertas
└── health/            # Health checks DB + Redis
```

### Frontend (`relaytrace-web/src/`)

```
app/
├── page.tsx                  # Landing page pública (Server Component, ISR 60 s)
├── auth/login/               # Login
├── admin/
│   ├── layout.tsx            # SidebarProvider + AdminShell
│   ├── dashboard/            # Dashboard con mapa + KPIs + tabla
│   ├── trips/                # Gestión de viajes
│   ├── drivers/              # People — CRUD completo de usuarios
│   ├── reconciliation/       # Motor anti-fraude
│   ├── onboarding/           # Solicitudes de empresa (SUPER_ADMIN)
│   ├── plans/                # Gestión de planes de suscripción (SUPER_ADMIN)
│   ├── audit/                # Audit log (SUPER_ADMIN + COMPANY_ADMIN)
│   └── settings/             # Configuración de empresa
├── dispatcher/dashboard/     # Vista dispatcher
└── driver/
    ├── dashboard/            # Dashboard conductor (mis viajes)
    └── register-trip/        # Registro de viaje con foto

components/
├── landing/                  # LandingNav, HeroSection, PricingSection,
│                             #   FeaturesSection, WorkflowSection,
│                             #   CtaSection, LandingFooter, RequestAccessModal
├── layouts/                  # Sidebar, TopBar, AdminShell
├── dashboard/                # StatCard, RecentTripsTable, RelayPointsMap
├── people/                   # UserFormModal, ChangePasswordModal,
│                             #   DeleteUserModal
└── plans/                    # PlanFormModal (crear/editar + Stripe IDs)
```

### Infraestructura (`relaytrace-infra/`)

```
modules/
├── 01-networking/     # VNet + 4 subnets + NSGs
├── 02-keyvault/       # Key Vault + RBAC + PE + secretos generados
├── 03-data/           # MySQL Flexible Server + Redis + connection strings → KV
├── 04-storage/        # Storage Account + 3 contenedores + lifecycle policy
├── 05-appservice/     # App Service Plan + API + Web + MSI + RBAC
├── 06-communication/  # ACS Email + dominio personalizado
├── 07-frontdoor/      # Front Door Standard + WAF + SSL + dominios
└── 08-observability/  # Log Analytics + Application Insights + diagnósticos

environments/
├── dev.tfvars
└── prod.tfvars
```

---

## ✨ Funcionalidades Implementadas

### 🏠 Landing Page
- Navegación con scroll: logo/colores adaptativos al hacer scroll
- Hero animado con shimmer + glow en CTA
- Sección Features, Workflow, Pricing con animaciones hover
- Footer con links al API Docs (Swagger), navegación y marca
- Botón "Get Started" abre modal de solicitud de acceso
- Totalmente responsive — hamburger menu en móvil

### 🔐 Autenticación
- Login con JWT (access token 1h + refresh 7d)
- Renovación automática de token via interceptor en axios
- Redirect por rol al login exitoso (`ROLE_ROUTES`)
- Guards multi-nivel: JWT → Roles → Company → Plan
- `JwtAuthGuard` verifica `subscriptionStatus` en Redis (caché 5 min) — bloquea acceso si suscripción cancelada

### 📊 Dashboard Administrativo
- 4 KPI cards: Trips Today, Active Drivers, Total Trips, Pending Alerts
- Mapa interactivo (React Leaflet + OpenStreetMap) con rutas y marcadores
- Tabla de viajes recientes con status badges

### 👥 Gestión de Personas (`/admin/drivers`)
- **Tabs por rol**: All / Drivers / Dispatchers / Admins
- **Filtro por empresa** (solo SUPER_ADMIN)
- **Crear / editar / cambiar contraseña / revocar / restaurar / eliminar**
- Todas las acciones dejan log en `AuditLog`

### 📝 Registro de Viaje (Driver PWA)
- Formulario mobile-first: Trip ID + upload de foto
- Botón de cámara: abre cámara nativa en móvil (`capture="environment"`)
- Upload a `POST /uploads/screenshot`

### 🪗 Sidebar Colapsable
- Estado persistido en `localStorage` (`rt_sidebar_collapsed`)
- Mobile: overlay + slide desde la izquierda
- Badge con contador de solicitudes pendientes (SUPER_ADMIN)

### 💳 Billing — Stripe
- Checkout Session para planes desde BD
- Webhook `POST /api/v1/billing/webhook` con verificación HMAC e idempotencia
- Al pago exitoso: crea Company + User admin automáticamente
- Caché de `subscriptionStatus` en Redis — invalidado instantáneamente en cambios de Stripe

### 🏢 Onboarding (SUPER_ADMIN)
- Lista de solicitudes con badge en tiempo real
- Aprobación crea empresa + envía credenciales al admin

### 📋 Gestión de Planes (SUPER_ADMIN)
- Tabla de planes con estado, precio, límites, Stripe IDs
- Crear / editar / desactivar planes (soft-delete)
- Planes **DB-driven**: landing page con ISR 60 s, nunca hardcodeados
- `PlanSelector` en Settings usa `usePlans()` desde BD
- `PlanBadge` agnóstico al slug: color fallback para planes desconocidos

### 📸 Uploads
- `POST /uploads/screenshot` — todos los planes
- `POST /uploads/presigned-url` — solo Growth+ (Azure Blob)

### 🔒 Auditoría y Seguridad
- `AuditModule` global (`@Global`) — 14 tipos de evento
- `/admin/audit` — tabla paginada con filtros, accesible a COMPANY_ADMIN
- Multi-tenant: `companyId` siempre del JWT, nunca del body

---

## 👮 Roles y Permisos

| Rol | Descripción | Acceso principal |
|-----|-------------|-----------------|
| `SUPER_ADMIN` | Control total del SaaS | Todo — bypass de guards de empresa |
| `COMPANY_ADMIN` | Administra su empresa | Usuarios, viajes, settings, audit |
| `DISPATCHER` | Monitoreo operacional | Ver viajes, conductores, dashboard |
| `DRIVER` | Conductor | Registrar y ver sus propios viajes |

---

## 🌐 API Endpoints

**Base URL:** `http://localhost:3000/api/v1`  
**Swagger UI:** `http://localhost:3000/api/docs`

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/auth/login` | Login → JWT access + refresh |
| `POST` | `/auth/refresh` | Renovar access token |
| `GET` | `/auth/me` | Perfil del usuario autenticado |

### Usuarios

| Método | Endpoint | Rol mínimo | Descripción |
|--------|----------|-----------|-------------|
| `POST` | `/users` | COMPANY_ADMIN | Crear usuario |
| `GET` | `/users` | COMPANY_ADMIN | Listar (filtros: companyId, rol) |
| `PATCH` | `/users/:id` | COMPANY_ADMIN | Actualizar |
| `PATCH` | `/users/:id/password` | COMPANY_ADMIN | Cambiar contraseña |
| `DELETE` | `/users/:id` | COMPANY_ADMIN | Eliminar |

### Viajes

| Método | Endpoint | Rol mínimo | Descripción |
|--------|----------|-----------|-------------|
| `POST` | `/trips` | DRIVER | Registrar viaje |
| `GET` | `/trips/me` | DRIVER | Mis viajes paginados |
| `GET` | `/trips` | DISPATCHER | Todos los viajes |
| `PATCH` | `/trips/:id` | DISPATCHER | Actualizar estado |
| `DELETE` | `/trips/:id` | COMPANY_ADMIN | Eliminar |

### Planes

| Método | Endpoint | Rol | Descripción |
|--------|----------|-----|-------------|
| `GET` | `/plans` | Público | Planes activos (landing page, ISR) |
| `GET` | `/plans/admin` | SUPER_ADMIN | Todos los planes |
| `POST` | `/plans` | SUPER_ADMIN | Crear plan |
| `PATCH` | `/plans/:id` | SUPER_ADMIN | Actualizar |
| `DELETE` | `/plans/:id` | SUPER_ADMIN | Desactivar (soft-delete) |

### Auditoría

| Método | Endpoint | Rol mínimo | Descripción |
|--------|----------|-----------|-------------|
| `GET` | `/audit` | COMPANY_ADMIN | Logs paginados con filtros |

### Otros

| Prefijo | Roles | Descripción |
|---------|-------|-------------|
| `/dashboard` | DISPATCHER+ | KPIs + actividad reciente |
| `/companies` | COMPANY_ADMIN+ | Empresa propia + onboarding |
| `/billing` | Auth / Webhook público | Stripe Checkout + Webhook |
| `/uploads` | Auth | Screenshots + presigned URLs |
| `/reconciliation` | COMPANY_ADMIN+ | Motor anti-fraude |
| `/health` | Público | Estado de DB y Redis |

---

## 🚀 Instalación y Configuración

### Prerequisitos

- Node.js 20+
- MySQL 8+
- Redis 7+
- Stripe CLI (webhooks en desarrollo)

### 1. Clonar

```bash
git clone https://github.com/AntRed1/RelayTrace-OS.git
cd RelayTrace-OS
```

### 2. Backend (`relaytrace-api`)

```bash
cd relaytrace-api
npm install
cp .env.example .env.local   # editar con tus valores

npx prisma migrate dev
npx prisma db seed            # roles + SUPER_ADMIN inicial

docker run -d --name redis -p 6379:6379 redis:7-alpine

npm run start:dev
# API: http://localhost:3000/api/v1
# Swagger: http://localhost:3000/api/docs
```

### 3. Frontend (`relaytrace-web`)

```bash
cd relaytrace-web
npm install
cp .env.example .env.local    # NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1

npm run dev
# Frontend: http://localhost:3001
```

### 4. Webhooks Stripe

```bash
stripe listen --forward-to localhost:3000/api/v1/billing/webhook
```

### 5. Infraestructura (producción)

```bash
cd relaytrace-infra
export TF_VAR_stripe_secret_key="sk_live_..."
export TF_VAR_stripe_webhook_secret="whsec_..."

terraform init
terraform plan  -var-file=environments/prod.tfvars
terraform apply -var-file=environments/prod.tfvars
```

Ver [`relaytrace-infra/README.md`](relaytrace-infra/README.md) para documentación completa de IaC.

---

## ⚙️ Variables de Entorno

### `relaytrace-api/.env.local` (desarrollo)

```env
NODE_ENV=development
PORT=3000
ALLOWED_ORIGINS=http://localhost:3001
DATABASE_URL="mysql://relaytrace:password@localhost:3306/relaytrace"
JWT_ACCESS_SECRET=min_32_chars_secret
JWT_REFRESH_SECRET=min_32_chars_refresh_secret
JWT_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d
REDIS_HOST=localhost
REDIS_PORT=6379

# Azure Storage (OCR — Growth+)
AZURE_STORAGE_ACCOUNT_NAME=
AZURE_STORAGE_CONTAINER_SCREENSHOTS=screenshots
AZURE_STORAGE_CONTAINER_OCR=ocr-documents
AZURE_STORAGE_CONTAINER_EXPORTS=exports

# ACS Email
ACS_CONNECTION_STRING=
ACS_FROM_ADDRESS=noreply@mail.relaytrace.com

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
# stripePriceId se almacena en la tabla Plan — gestionar en /admin/plans
```

> **Producción:** Todos los valores sensibles se almacenan en Azure Key Vault y son resueltos automáticamente por la Managed Identity del App Service. Las variables de entorno contienen referencias KV (`@Microsoft.KeyVault(VaultName=...;SecretName=...)`), nunca valores en claro.

### `relaytrace-web/.env.local` (desarrollo)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

---

## 🗄 Base de Datos

### Entidades principales

```
Company          → tenant raíz
├── id, name, email, subscriptionStatus, plan
└── users[], trips[], alerts[], auditLogs[]

User             → empleado de una empresa
├── id, companyId, roleId, name, email, passwordHash, status
└── trips[]

Role             → SUPER_ADMIN / COMPANY_ADMIN / DISPATCHER / DRIVER

Trip ⭐          → registro de viaje
├── id, companyId, driverId, tripId (Relay), status
├── sourceType (manual | ocr | relay_email)
└── screenshotUrl

Plan             → planes de suscripción (fuente de verdad única)
├── id, slug, displayName, priceMonthly, currency, maxDrivers
├── featureLabels[], featureFlags[], isActive, isPopular
├── stripePriceId, stripeProductId
└── cache en Redis — invalidado en cada mutación

AuditLog         → trail inmutable
├── companyId, userId, action, metadata (JSON)
└── acciones: login | create/delete_trip | CRUD usuarios/planes
             change_password | revoke/restore | approve/reject_company

ProcessedWebhookEvent  → idempotencia Stripe
Reconciliation   → resultado del motor anti-fraude
```

### Comandos Prisma

```bash
npx prisma migrate dev --name nombre     # nueva migración
npx prisma migrate deploy                # producción
npx prisma generate                      # regenerar cliente
npx prisma studio                        # UI explorador
npx prisma db seed                       # seed inicial
```

---

## 🔒 Seguridad

| Medida | Implementación |
|--------|---------------|
| **Auth** | JWT access (1h) + refresh (7d); `companyId` en payload |
| **RBAC** | `RolesGuard` — SUPER_ADMIN bypass; roles granulares |
| **Subscription** | `JwtAuthGuard` verifica `subscriptionStatus` (Redis, 5 min TTL) |
| **Multi-tenant** | `companyId` obligatorio — nunca del body, siempre del JWT |
| **Plan Guard** | `PlanGuard` + `@RequireFeature` para funciones premium |
| **Rate Limiting** | 10 req/seg + 100 req/min por IP |
| **Helmet** | Headers HTTP de seguridad |
| **CORS** | `ALLOWED_ORIGINS` configurable |
| **Validación** | `ValidationPipe` global con whitelist estricta |
| **Webhooks** | HMAC-SHA256 con `stripe.webhooks.constructEvent` |
| **Secretos prod** | Azure Key Vault — Managed Identity resuelve referencias en runtime |
| **Red prod** | VNet Integration + Private Endpoints — tráfico de datos nunca sale a internet |
| **WAF prod** | Azure Front Door + DefaultRuleSet 1.0 + BotManager 1.0 |

---

## 💳 Planes y Billing

Los planes se gestionan desde `/admin/plans` (SUPER_ADMIN). Valores iniciales del seed:

| Plan | Precio | Conductores | OCR | Reconciliación |
|------|--------|------------|-----|----------------|
| **Starter** | $49/mes | Hasta 10 | ❌ | Manual |
| **Growth** | $99/mes | Hasta 30 | ✅ Azure AI | Automática |
| **Fleet** | $199/mes | Ilimitados | ✅ Prioritario | Automática + alertas |

> Precios y features se leen de la tabla `Plan`. La landing page usa ISR (60 s). `stripePriceId` se asocia en la UI de admin.

---

## ☁️ Infraestructura Cloud

La infraestructura completa de producción está definida como código en `relaytrace-infra/`. Ver [relaytrace-infra/README.md](relaytrace-infra/README.md) para detalles de despliegue.

**Módulos Terraform:**

| Módulo | Recursos |
|--------|---------|
| `01-networking` | VNet · 4 subnets · NSGs (snet-appservice, data, mysql, private) |
| `02-keyvault` | Key Vault (RBAC) · PE · DNS zone · secretos generados (MySQL pwd, JWT keys) |
| `03-data` | MySQL Flexible Server B1ms · Redis Cache · PEs · connection strings → KV |
| `04-storage` | Storage Account · 3 contenedores · lifecycle policy · PE |
| `05-appservice` | App Service Plan P1v3 · API + Web · MSI · RBAC · KV references |
| `06-communication` | ACS Email · dominio personalizado · connection string → KV |
| `07-frontdoor` | Front Door Standard · WAF · SSL · custom domains · HTTPS redirect |
| `08-observability` | Log Analytics · Application Insights · diagnostic settings |

**Flujo de secretos en producción:**
```
Key Vault (todos los secretos)
      ↓ KV reference (resuelto por MSI al arrancar)
App Service app settings
      ↓ inyectado como variable de entorno
NestJS / Next.js
```

---

## 📊 Roadmap

### ✅ Fase 1 — Core MVP (Completado)
- [x] Auth + JWT, multi-tenant, CRUD de viajes, dashboard, auditoría, Swagger

### ✅ Fase 2A — SaaS Foundation (Completado)
- [x] Stripe Checkout + Webhook idempotente, PlanGuard, onboarding de empresas

### ✅ Fase 2B — Frontend PWA (Completado)
- [x] Next.js 15, landing page, dashboard Leaflet, sidebar colapsable, People + Driver PWA

### ✅ Fase 2C — Plans & Audit Trail (Completado)
- [x] Planes DB-driven, ISR landing, RequestAccessModal dinámico, 14 eventos de auditoría
- [x] `RedisCacheService` global, `PlanBadge` agnóstico al slug, `PlanSelector` DB-driven
- [x] Cambio de contraseña conectado, enforcement de suscripción en `JwtAuthGuard`

### ✅ Fase 2D — Infraestructura IaC (Completado)
- [x] Terraform modular en `relaytrace-infra/` (AzureRM ~3.100, West US 2)
- [x] Estado remoto en Azure Blob Storage
- [x] 8 módulos: Networking → Key Vault → Data → Storage → App Service → ACS → Front Door → Observability
- [x] MySQL Flexible Server B1ms + VNet Integration (delegated subnet)
- [x] Azure Cache for Redis con Private Endpoint (Basic C0 dev / Standard C1 prod)
- [x] Key Vault con RBAC + PE — secretos por KV reference, Managed Identity
- [x] Front Door Standard + WAF (DefaultRuleSet + BotManager) + SSL administrado
- [x] Application Insights + Log Analytics — diagnósticos en 6 recursos

### 🔄 Fase 3 — OCR Automation (Pendiente)
- [ ] Azure AI Document Intelligence en producción
- [ ] Screenshot → Trip ID extraído automáticamente (BullMQ async)

### 📅 Fase 4 — Reconciliación Completa (Pendiente)
- [ ] Parser de emails Amazon Relay via Microsoft Graph API
- [ ] Motor anti-fraude automático + notificaciones ACS Email

### 📅 Fase 5 — Inteligencia Operacional
- [ ] Score de conductor, analytics avanzado, predicción ML

---

## 🤝 Contribución

```
feat:     Nueva funcionalidad
fix:      Corrección de bug
docs:     Documentación
refactor: Sin cambio funcional
chore:    Mantenimiento
```

---

## 📄 Licencia

Este software está protegido bajo la **Anthony R Software License (ARSL) v1.0**.

© 2026 Anthony R. Todos los derechos reservados.

Se permite únicamente la **visualización** del código con fines de evaluación personal.
Queda estrictamente prohibido: uso comercial, distribución, modificación, ingeniería
inversa o el uso del software para competir con los productos del Licenciante.

Consulta el archivo [`LICENSE`](./LICENSE) para los términos completos.
Ley aplicable: República Dominicana — Ley No. 20-00, Ley No. 65-00, Convenio de Berna y TRIPS.

---

<div align="center">

**Construido con ❤️ para resolver un problema real en la industria del transporte**

[⬆ Volver arriba](#relaytrace-os)

</div>
