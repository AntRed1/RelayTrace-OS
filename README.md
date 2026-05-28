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

```
┌─────────────────────────────────────────────────────────────┐
│                        Internet                              │
└─────────────────────────┬───────────────────────────────────┘
                          │
         ┌────────────────┴────────────────┐
         │                                 │
┌────────▼────────┐               ┌────────▼────────┐
│  Next.js 15     │               │   NestJS API    │
│  Frontend PWA   │◄──────────────│  relaytrace-api │
│  relaytrace-web │    REST/JSON  │   :3000         │
│  :3001          │               └────────┬────────┘
└─────────────────┘                        │
                          ┌────────────────┼────────────────┐
                          │                │                 │
               ┌──────────▼──────┐  ┌──────▼──────┐  ┌────▼────────────┐
               │  MySQL 8        │  │  Azure Blob  │  │  Redis + BullMQ │
               │  (Prisma ORM)   │  │  Storage     │  │  (Queue Jobs)   │
               └─────────────────┘  └─────────────┘  └─────────────────┘
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
| **Base de Datos** | MySQL 8 | — |
| **Auth** | JWT + Passport (access + refresh tokens) | — |
| **File Upload** | Multer (diskStorage) | built-in |
| **Queue** | BullMQ + Redis | — |
| **Storage** | Azure Blob Storage (OCR, plan Growth+) | — |
| **OCR** | Azure AI Document Intelligence | plan Growth+ |
| **Email Parsing** | Microsoft Graph API | — |
| **Billing** | Stripe Checkout + Webhooks | — |
| **Documentación** | Swagger / OpenAPI 3 | — |
| **Rate Limiting** | `@nestjs/throttler` (10/seg, 100/min) | — |

### Frontend (`relaytrace-web`)

| Capa | Tecnología |
|------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **UI** | Tailwind CSS v4 + Lucide Icons |
| **Estado servidor** | TanStack Query (React Query) |
| **Estado global** | Zustand (auth store) |
| **Formularios** | React Hook Form + Zod |
| **Mapas** | React Leaflet (OpenStreetMap) |
| **Animaciones** | CSS keyframes + Tailwind transitions |
| **PWA** | `site.webmanifest` + favicons multi-tamaño |

---

## 📁 Estructura del Repositorio

```
RelayTrace-OS/
├── relaytrace-api/          # Backend NestJS
├── relaytrace-web/          # Frontend Next.js 15 (PWA)
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
├── audit/             # Log de acciones sensibles
├── dashboard/         # KPIs: viajes hoy, conductores activos, alertas
├── billing/           # Stripe Checkout Sessions + Webhook idempotente
├── queue/             # BullMQ producers + processors
├── ocr/               # Azure AI Document Intelligence (Growth+)
├── relay-emails/      # Microsoft Graph API — parser emails Relay
├── reconciliation/    # Motor anti-fraude
├── notifications/     # Alertas y emails
└── health/            # Health checks DB + Redis
```

### Frontend (`relaytrace-web/src/`)

```
app/
├── page.tsx                  # Landing page pública
├── auth/login/               # Login
├── admin/
│   ├── layout.tsx            # SidebarProvider + AdminShell
│   ├── dashboard/            # Dashboard con mapa + KPIs + tabla
│   ├── trips/                # Gestión de viajes
│   ├── drivers/              # People — CRUD completo de usuarios
│   ├── reconciliation/       # Motor anti-fraude
│   ├── onboarding/           # Solicitudes de empresa (SUPER_ADMIN)
│   └── settings/             # Configuración de empresa
├── dispatcher/dashboard/     # Vista dispatcher
└── driver/
    ├── dashboard/            # Dashboard conductor (mis viajes)
    └── register-trip/        # Registro de viaje con foto

components/
├── landing/                  # LandingNav, HeroSection, PricingSection,
│                             #   FeaturesSection, WorkflowSection,
│                             #   CtaSection, LandingFooter
├── layouts/                  # Sidebar, TopBar, AdminShell
├── dashboard/                # StatCard, RecentTripsTable, RelayPointsMap
└── people/                   # UserFormModal, ChangePasswordModal,
                              #   DeleteUserModal

contexts/
└── sidebar.context.tsx       # Estado del sidebar (collapsed + mobile)
                              #   persistido en localStorage

services/
├── trips.service.ts
├── users.service.ts
└── uploads.service.ts        # Upload screenshot → /uploads/screenshot
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

### 📊 Dashboard Administrativo
- 4 KPI cards: Trips Today, Active Drivers, Total Trips, Pending Alerts
- Mapa interactivo (React Leaflet + OpenStreetMap) con rutas y marcadores
- Tabla de viajes recientes con status badges
- Columna 2/3 mapa + 1/3 tabla en pantallas grandes

### 👥 Gestión de Personas (`/admin/drivers`)
- **Tabs por rol**: All / Drivers / Dispatchers / Admins
- **Filtro por empresa** (solo SUPER_ADMIN)
- **Crear usuario**: nombre, email, contraseña (auto-generada + barra de fortaleza), rol, empresa
- **Editar**: nombre, rol, estado (active/inactive)
- **Cambiar contraseña**: nueva + confirmación + mostrar/ocultar + barra de fortaleza + registro de auditoría
- **Revocar / Restaurar** acceso (ShieldOff / ShieldCheck)
- **Eliminar** con modal de confirmación
- Todas las acciones dejan log en `AuditLog`

### 📝 Registro de Viaje (Driver PWA)
- Formulario mobile-first: Trip ID + upload de foto
- Botón de cámara: abre cámara nativa en móvil (`capture="environment"`)
- Preview de la imagen seleccionada con barra de progreso
- Upload a `POST /uploads/screenshot` → imagen guardada en `public/screenshots/`
- URL guardada junto al viaje para auditoría posterior

### 🪗 Sidebar Colapsable
- Acordeón lateral: expandido (w-64) / colapsado (w-16)
- Estado persistido en `localStorage` (`rt_sidebar_collapsed`)
- Mobile: overlay + slide desde la izquierda (hamburger en TopBar)
- Tooltips en modo colapsado
- Badge con contador de solicitudes pendientes (SUPER_ADMIN, Onboarding)
- Toggle flotante en el borde derecho (desktop)

### 💳 Billing — Stripe
- Checkout Session para planes Starter / Growth / Fleet
- Webhook `POST /api/v1/billing/webhook` con verificación HMAC
- Idempotencia via `ProcessedWebhookEvent` (evita doble procesamiento)
- Al pago exitoso: crea Company + User admin automáticamente
- `PlanGuard` + `@RequireFeature('ocr')` para funciones Growth+

### 🏢 Onboarding (SUPER_ADMIN)
- Lista de solicitudes de empresa pendientes / aprobadas / rechazadas
- Badge en sidebar con contador de pendientes en tiempo real
- Aprobación crea empresa + envía credenciales al admin

### 📸 Upload de Screenshots
- `POST /uploads/screenshot` — disponible en todos los planes (JWT only)
- Multer diskStorage → `public/screenshots/<uuid>.<ext>`
- ServeStaticModule sirve los archivos en `/screenshots/`
- `POST /uploads/presigned-url` — solo Growth+ (Azure Blob, para OCR)

### 🔒 Seguridad y Auditoría
- Cambios de contraseña dejan `AuditLog` con `isSelfChange`, email del objetivo y quien lo cambió
- `PATCH /users/:id/password` solo disponible a COMPANY_ADMIN y SUPER_ADMIN
- Aislamiento multi-tenant: COMPANY_ADMIN no puede operar sobre usuarios de otra empresa

---

## 👮 Roles y Permisos

| Rol | Descripción | Acceso principal |
|-----|-------------|-----------------|
| `SUPER_ADMIN` | Control total del SaaS | Todo — bypass de guards de empresa |
| `COMPANY_ADMIN` | Administra su empresa | Usuarios, viajes, settings |
| `DISPATCHER` | Monitoreo operacional | Ver viajes, conductores, dashboard |
| `DRIVER` | Conductor | Registrar y ver sus propios viajes |

```typescript
// RolesGuard — SUPER_ADMIN bypasses everything
if (user.role === 'SUPER_ADMIN') return true;

// Multi-tenant — companyId viene SIEMPRE del JWT, nunca del body
if (user.role !== 'SUPER_ADMIN') {
  where.companyId = user.companyId;
}
```

---

## 🌐 API Endpoints

**Base URL:** `http://localhost:3000/api/v1`  
**Swagger UI:** `http://localhost:3000/api/docs`

Todos los endpoints protegidos requieren `Authorization: Bearer <token>`.

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
| `GET` | `/users` | COMPANY_ADMIN | Listar usuarios (filtros: companyId, rol) |
| `GET` | `/users/:id` | COMPANY_ADMIN | Obtener usuario |
| `PATCH` | `/users/:id` | COMPANY_ADMIN | Actualizar nombre/rol/estado |
| `PATCH` | `/users/:id/password` | COMPANY_ADMIN | Cambiar contraseña + audit log |
| `DELETE` | `/users/:id` | COMPANY_ADMIN | Eliminar usuario |

### Roles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/roles` | Listar todos los roles disponibles |

### Viajes

| Método | Endpoint | Rol mínimo | Descripción |
|--------|----------|-----------|-------------|
| `POST` | `/trips` | DRIVER | Registrar viaje (+ screenshotUrl opcional) |
| `GET` | `/trips/me` | DRIVER | Mis viajes paginados |
| `GET` | `/trips` | DISPATCHER | Todos los viajes (filtros: status, driverId) |
| `GET` | `/trips/:id` | DISPATCHER | Detalle de viaje |
| `PATCH` | `/trips/:id` | DISPATCHER | Actualizar estado |
| `DELETE` | `/trips/:id` | COMPANY_ADMIN | Eliminar viaje |

### Dashboard

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/dashboard/summary` | KPIs: viajes hoy, conductores activos, alertas |
| `GET` | `/dashboard/activity` | Viajes recientes |

### Empresas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/companies/me` | Obtener empresa propia |
| `PATCH` | `/companies/me` | Actualizar empresa |
| `GET` | `/companies/requests` | Solicitudes de onboarding (SUPER_ADMIN) |
| `PATCH` | `/companies/requests/:id` | Aprobar/rechazar solicitud |

### Uploads

| Método | Endpoint | Rol / Plan | Descripción |
|--------|----------|-----------|-------------|
| `POST` | `/uploads/screenshot` | Autenticado (todos) | Subir foto de viaje (multipart, ≤10 MB) → `/screenshots/<uuid>.jpg` |
| `POST` | `/uploads/presigned-url` | Growth+ | URL pre-firmada para Azure Blob (OCR) |

### Billing

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/billing/create-checkout` | Crear sesión de pago Stripe |
| `POST` | `/billing/webhook` | Webhook Stripe (HMAC verificado, idempotente) |

### Reconciliación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/reconciliation` | Lista de reconciliaciones |
| `GET` | `/reconciliation/summary` | Resumen: matched/unmatched/match rate |

---

## 🚀 Instalación y Configuración

### Prerequisitos

- Node.js 20+
- MySQL 8+
- Redis 7+ (para BullMQ)
- Stripe CLI (para desarrollo con webhooks)

### 1. Clonar

```bash
git clone https://github.com/AntRed1/RelayTrace-OS.git
cd RelayTrace-OS
```

### 2. Backend (`relaytrace-api`)

```bash
cd relaytrace-api
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus valores

# Crear base de datos y correr migraciones
npx prisma migrate dev
npx prisma db seed      # Crea roles y SUPER_ADMIN inicial

# Redis (Docker)
docker run -d --name redis -p 6379:6379 redis:7-alpine

# Iniciar en watch mode
npm run start:dev
```

> **API disponible en:** `http://localhost:3000/api/v1`  
> **Swagger:** `http://localhost:3000/api/docs`

### 3. Frontend (`relaytrace-web`)

```bash
cd relaytrace-web
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Establecer NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1

# Iniciar
npm run dev
```

> **Frontend en:** `http://localhost:3001`

### 4. Webhooks Stripe (desarrollo)

```bash
# Instalar Stripe CLI y redirigir webhooks al endpoint local
stripe listen --forward-to localhost:3000/api/v1/billing/webhook
```

---

## ⚙️ Variables de Entorno

### `relaytrace-api/.env.local`

```env
# Server
NODE_ENV=development
PORT=3000
ALLOWED_ORIGINS=http://localhost:3001

# Database
DATABASE_URL="mysql://relaytrace:password@localhost:3306/relaytrace"

# JWT
JWT_SECRET=min_32_chars_secret
JWT_REFRESH_SECRET=min_32_chars_refresh_secret
JWT_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Azure Storage (OCR — Growth+)
AZURE_STORAGE_ACCOUNT_NAME=
AZURE_STORAGE_ACCOUNT_KEY=
AZURE_STORAGE_CONTAINER=relaytrace

# Azure Document Intelligence (OCR — Growth+)
AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=
AZURE_DOCUMENT_INTELLIGENCE_KEY=

# Microsoft Graph (email parsing)
AZURE_AD_CLIENT_ID=
AZURE_AD_CLIENT_SECRET=
AZURE_AD_TENANT_ID=

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_GROWTH_PRICE_ID=price_...
STRIPE_FLEET_PRICE_ID=price_...
```

### `relaytrace-web/.env.local`

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
└── screenshotUrl (URL pública de la foto subida)

AuditLog         → historial de acciones sensibles
├── action: create_user | change_password | delete_user | revoke_access | ...
└── metadata (JSON) — quién, sobre quién, timestamp

ProcessedWebhookEvent  → idempotencia webhooks Stripe
Reconciliation   → resultado del motor anti-fraude
RelayEmailLog    → emails de Amazon Relay parseados
```

### Comandos Prisma

```bash
npx prisma migrate dev --name nombre     # nueva migración
npx prisma migrate deploy                # producción
npx prisma generate                      # regenerar cliente
npx prisma studio                        # UI explorador de datos
npx prisma db seed                       # seed inicial (roles + SUPER_ADMIN)
```

---

## 🔒 Seguridad

| Medida | Implementación |
|--------|---------------|
| **Auth** | JWT access (1h) + refresh (7d); companyId en payload |
| **RBAC** | `RolesGuard` — SUPER_ADMIN bypass; roles granulares |
| **Multi-tenant** | `companyId` obligatorio en todos los servicios |
| **Plan Guard** | `PlanGuard` + `@RequireFeature` para funciones premium |
| **Rate Limiting** | 10 req/seg + 100 req/min por IP (`ThrottlerGuard`) |
| **Helmet** | Headers de seguridad HTTP |
| **CORS** | `ALLOWED_ORIGINS` configurable |
| **Validación** | `ValidationPipe` global con whitelist estricta |
| **Sanitización** | `SanitizeInterceptor` elimina campos sensibles |
| **Contraseñas** | bcrypt hash; cambios registrados en `AuditLog` |
| **Webhooks** | HMAC-SHA256 con `stripe.webhooks.constructEvent` |

---

## 💳 Planes y Billing

| Plan | Precio | Conductores | OCR | Reconciliación |
|------|--------|------------|-----|----------------|
| **Starter** | $49/mes | Hasta 10 | ❌ | Manual |
| **Growth** | $99/mes | Hasta 30 | ✅ Azure AI | Automática |
| **Fleet** | $199/mes | Ilimitados | ✅ Prioritario | Automática + alertas |

El flow de onboarding:
```
Landing → "Get Started" → Solicitud de empresa → SUPER_ADMIN aprueba
→ Link de pago Stripe → Checkout → Webhook → Company + Admin creados automáticamente
```

---

## 📊 Roadmap

### ✅ Fase 1 — Core MVP (Completado)

- [x] Auth + JWT con access/refresh tokens
- [x] Arquitectura multi-tenant con aislamiento por `companyId`
- [x] CRUD de viajes (core del negocio)
- [x] Dashboard con KPIs
- [x] Auditoría interna (`AuditLog`)
- [x] Rate limiting + Helmet + CORS
- [x] Swagger / OpenAPI documentado

### ✅ Fase 2A — SaaS Foundation (Completado)

- [x] Stripe Checkout Sessions + Webhook idempotente
- [x] `PlanGuard` + límites por plan (`@RequireFeature`)
- [x] Onboarding de empresas (solicitud → aprobación → pago → activación)
- [x] Roles endpoint (`GET /roles`)
- [x] SUPER_ADMIN puede gestionar cualquier empresa

### ✅ Fase 2B — Frontend PWA (Completado)

- [x] Next.js 15 App Router con layout por rol
- [x] Landing page con animaciones (shimmer, glow, scale)
- [x] Logos reales + favicon + PWA manifest (`site.webmanifest`)
- [x] Login con JWT e interceptor de refresh automático
- [x] Dashboard administrativo: mapa Leaflet + KPIs + tabla de viajes recientes
- [x] Sidebar colapsable (acordeón lateral) con estado persistido en localStorage
- [x] Responsive: hamburger en móvil, sidebar estático en desktop
- [x] People management completo: crear / editar / cambiar contraseña / revocar / restaurar / eliminar
- [x] Cambio de contraseña con barra de fortaleza + confirmación + audit log
- [x] Driver PWA: dashboard de mis viajes + registro de viaje
- [x] Upload de screenshot: botón de cámara → preview → barra de progreso → guardado en disco
- [x] `safeFormat()` — protección contra fechas null en conductores

### 🔄 Fase 3 — OCR Automation (Pendiente)

- [ ] Azure AI Document Intelligence en producción
- [ ] Screenshot → Trip ID extraído automáticamente (BullMQ async)
- [ ] `OcrResult` vinculado al viaje + confianza de extracción

### 📅 Fase 4 — Reconciliación Completa (Pendiente)

- [ ] Parser de emails Amazon Relay via Microsoft Graph API
- [ ] Motor anti-fraude automático (match/no-match)
- [ ] Alertas en tiempo real con notificaciones push

### 📅 Fase 5 — Inteligencia Operacional

- [ ] Score de conductor basado en historial
- [ ] Analytics avanzado por empresa
- [ ] Predicción de discrepancias con ML

---

## 🤝 Contribución

1. Crea una rama: `git checkout -b feature/nombre-feature`
2. Commit: `git commit -m 'feat: descripción del cambio'`
3. Push y abre un Pull Request

**Convención de commits:**

```
feat:     Nueva funcionalidad
fix:      Corrección de bug
docs:     Documentación
refactor: Sin cambio funcional
chore:    Mantenimiento
```

---

## 📄 Licencia

Propietario — Todos los derechos reservados © 2026 RelayTrace OS

---

<div align="center">

**Construido con ❤️ para resolver un problema real en la industria del transporte**

[⬆ Volver arriba](#relaytrace-os)

</div>
