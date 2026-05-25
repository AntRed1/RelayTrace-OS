<div align="center">

<img src="public/logos/logo-dark.png" alt="RelayTrace OS Logo" width="280" />

<br />

# RelayTrace OS

### Plataforma Operacional de Trazabilidad para Amazon Relay

<p>
  <img src="https://img.shields.io/badge/NestJS-11.x-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-7.x-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/MySQL-8.x-4479A1?style=for-the-badge&logo=mysql&logoColor=white" />
  <img src="https://img.shields.io/badge/Azure-Cloud-0078D4?style=for-the-badge&logo=microsoftazure&logoColor=white" />
</p>

<p>
  <img src="https://img.shields.io/badge/Redis-BullMQ-DC382D?style=for-the-badge&logo=redis&logoColor=white" />
  <img src="https://img.shields.io/badge/Stripe-Billing-635BFF?style=for-the-badge&logo=stripe&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/Swagger-OpenAPI-85EA2D?style=for-the-badge&logo=swagger&logoColor=black" />
</p>

<br />

> **RelayTrace OS** es un SaaS multi-tenant construido sobre Amazon Relay que resuelve el problema crítico de trazabilidad, auditoría y control operacional en flotas de transporte que comparten una sola cuenta de Relay entre múltiples conductores.

<br />

[📖 Documentación API](http://localhost:3000/api/docs) · [🐛 Reportar Bug](https://github.com/AntRed1/RelayTrace-OS/issues) · [💡 Feature Request](https://github.com/AntRed1/RelayTrace-OS/issues)

</div>

---

## 📋 Tabla de Contenidos

- [El Problema](#-el-problema)
- [La Solución](#-la-solución)
- [Arquitectura](#-arquitectura)
- [Stack Tecnológico](#-stack-tecnológico)
- [Estructura del Repositorio](#-estructura-del-repositorio)
- [Módulos del Backend](#-módulos-del-backend)
- [Roles y Permisos](#-roles-y-permisos)
- [API Endpoints](#-api-endpoints)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Variables de Entorno](#-variables-de-entorno)
- [Base de Datos](#-base-de-datos)
- [Seguridad](#-seguridad)
- [Roadmap](#-roadmap)
- [Contribución](#-contribución)

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
Conductor registra el Trip ID en RelayTrace OS
           ↓
Sistema asocia: conductor + viaje + timestamp + evidencia
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
┌─────────────────────────▼───────────────────────────────────┐
│                   Azure Front Door                           │
└─────────────────────────┬───────────────────────────────────┘
                          │
         ┌────────────────┴────────────────┐
         │                                 │
┌────────▼────────┐               ┌────────▼────────┐
│  Next.js 15     │               │   NestJS API    │
│  Frontend PWA   │◄──────────────│   relaytrace-   │
│  relaytrace-web │               │      api        │
└─────────────────┘               └────────┬────────┘
                                           │
              ┌────────────────────────────┼────────────────────┐
              │                            │                     │
    ┌─────────▼──────┐          ┌──────────▼──────┐   ┌────────▼───────┐
    │  Azure MySQL   │          │  Azure Blob     │   │  Redis +       │
    │  Flexible      │          │  Storage        │   │  BullMQ        │
    │  Server        │          │  (Screenshots)  │   │  (Queue Jobs)  │
    └────────────────┘          └─────────────────┘   └────────────────┘
```

### Arquitectura Multi-Tenant

```
SaaS Platform (RelayTrace OS)
└── Company A
│   ├── COMPANY_ADMIN
│   ├── DISPATCHER
│   └── DRIVERs → Trips → Alerts → AuditLogs
└── Company B
    ├── COMPANY_ADMIN
    └── DRIVERs → Trips → Alerts → AuditLogs
```

**Regla crítica:** Todas las entidades contienen `company_id` — garantizando aislamiento total entre empresas.

---

## 🛠 Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| **Framework** | NestJS | 11.x |
| **Lenguaje** | TypeScript | 5.x |
| **ORM** | Prisma | 7.x |
| **Base de Datos** | MySQL | 8.x |
| **Auth** | JWT + Passport | — |
| **Queue** | BullMQ + Redis | — |
| **Storage** | Azure Blob Storage | — |
| **OCR** | Azure AI Document Intelligence | — |
| **Email Parsing** | Microsoft Graph API | — |
| **Billing** | Stripe | — |
| **Documentación** | Swagger / OpenAPI | — |
| **Infraestructura** | Azure Container Apps | — |
| **CI/CD** | Azure DevOps | — |
| **Monitoreo** | Azure Monitor + App Insights | — |

---

## 📁 Estructura del Repositorio

```
relaytrace-os/
│
├── relaytrace-api/          # Backend NestJS (este repositorio)
├── relaytrace-web/          # Frontend Next.js 15 (PWA)
├── relaytrace-workers/      # Workers BullMQ separados
├── relaytrace-infra/        # Terraform / Azure Infrastructure
└── relaytrace-docs/         # Documentación adicional
```

### Estructura del Backend (`relaytrace-api`)

```
src/
├── common/
│   ├── decorators/          # @CurrentUser, @Roles
│   ├── filters/             # HttpExceptionFilter, PrismaExceptionFilter
│   ├── guards/              # JwtAuthGuard, RolesGuard, CompanyGuard
│   ├── interceptors/        # ResponseInterceptor, LoggingInterceptor, SanitizeInterceptor
│   ├── exceptions/          # Custom exceptions
│   └── types/               # UserRole, JwtPayload, RequestUser
│
├── config/
│   ├── app.config.ts        # Configuración centralizada
│   └── validation.ts        # Validación de variables de entorno
│
├── prisma/
│   ├── prisma.service.ts    # PrismaService global
│   └── prisma.module.ts     # PrismaModule (@Global)
│
└── modules/
    ├── auth/                # JWT, login, refresh, estrategia
    ├── users/               # CRUD usuarios por empresa
    ├── companies/           # Gestión empresas SaaS
    ├── roles/               # RBAC + seed de roles
    ├── drivers/             # Abstracción conductores
    ├── trips/               # ⭐ Core — registro y trazabilidad
    ├── uploads/             # Azure Blob Storage presigned URLs
    ├── audit/               # Trazabilidad interna de acciones
    ├── dashboard/           # KPIs y métricas
    ├── billing/             # Stripe subscriptions + webhooks
    ├── queue/               # BullMQ producers + processors
    ├── ocr/                 # Azure AI Document Intelligence
    ├── relay-emails/        # Microsoft Graph API parser
    ├── reconciliation/      # Motor anti-fraude
    ├── notifications/       # Sistema de alertas
    └── health/              # Health checks
```

---

## 📦 Módulos del Backend

### 🔐 Auth Module

Maneja autenticación JWT con access tokens y refresh tokens. El `companyId` viene **siempre del JWT**, nunca del frontend.

```typescript
POST /api/v1/auth/login        → Login + JWT
POST /api/v1/auth/refresh      → Renovar access token
GET  /api/v1/auth/me           → Perfil del usuario autenticado
```

### 🏢 Companies Module

Gestión de empresas SaaS. Cada empresa es un tenant aislado.

```typescript
POST  /api/v1/companies        → Crear empresa
GET   /api/v1/companies/me     → Obtener empresa propia
PATCH /api/v1/companies/me     → Actualizar empresa propia
```

### 👥 Users Module

Gestión de usuarios con aislamiento multi-tenant estricto.

```typescript
POST   /api/v1/users           → Crear usuario
GET    /api/v1/users           → Listar usuarios de la empresa
GET    /api/v1/users/:id       → Obtener usuario
PATCH  /api/v1/users/:id       → Actualizar usuario
DELETE /api/v1/users/:id       → Eliminar usuario
```

### 🚚 Drivers Module

Abstracción específica para conductores con estadísticas operacionales.

```typescript
GET /api/v1/drivers            → Listar conductores
GET /api/v1/drivers/:id/stats  → Estadísticas del conductor
```

### ✈️ Trips Module ⭐ Core

**El núcleo del sistema.** Registro y trazabilidad completa de viajes de Amazon Relay.

```typescript
POST   /api/v1/trips           → Registrar viaje (DRIVER)
GET    /api/v1/trips/me        → Mis viajes (DRIVER)
GET    /api/v1/trips           → Todos los viajes (ADMIN/DISPATCHER)
GET    /api/v1/trips/:id       → Detalle de viaje
PATCH  /api/v1/trips/:id       → Actualizar estado
DELETE /api/v1/trips/:id       → Eliminar viaje
```

**Estados de un viaje:**

| Estado | Descripción |
|--------|-------------|
| `pending` | Recién registrado por el conductor |
| `confirmed` | Validado por sistema o admin |
| `flagged` | Sospechoso, requiere revisión |

### 📊 Dashboard Module

KPIs y métricas operacionales en tiempo real.

```typescript
GET /api/v1/dashboard/summary   → Resumen: viajes hoy, conductores activos, alertas
GET /api/v1/dashboard/activity  → Actividad reciente
```

### 🔍 Reconciliation Module

Motor anti-fraude que compara registros de conductores contra emails de Amazon Relay.

```
Email Relay (fuente de verdad)
        ↓
Parser (Microsoft Graph API)
        ↓
Comparación con registros conductores
        ↓
✅ Match → OK
❌ No Match → ALERTA (missing_trip / duplicate_trip)
```

### 💳 Billing Module

Subscripciones SaaS via Stripe.

```typescript
POST /api/v1/billing/create-checkout  → Generar sesión de pago
POST /api/v1/billing/webhook          → Webhook Stripe (HMAC verificado)
```

---

## 👮 Roles y Permisos

| Rol | Descripción | Permisos principales |
|-----|-------------|---------------------|
| `SUPER_ADMIN` | Control total del SaaS | Todo — bypass global de guards |
| `COMPANY_ADMIN` | Administra su empresa | Gestionar usuarios, ver todos los viajes |
| `DISPATCHER` | Monitoreo operacional | Ver viajes, conductores, dashboard |
| `DRIVER` | Conductor | Registrar y ver sus propios viajes |

### SUPER_ADMIN Bypass

`RolesGuard` implementa bypass automático para `SUPER_ADMIN`:

```typescript
if (user.role === 'SUPER_ADMIN') return true;
```

### Aislamiento Multi-Tenant

Servicios como `TripsService` aplican filtros automáticos por `companyId`:

```typescript
if (user.role !== 'SUPER_ADMIN') {
  where.companyId = user.companyId;
}
```

---

## 🌐 API Endpoints

Base URL: `http://localhost:3000/api/v1`

Documentación interactiva: `http://localhost:3000/api/docs`

### Autenticación

Todos los endpoints protegidos requieren:

```
Authorization: Bearer <access_token>
```

### Resumen de endpoints

| Método | Endpoint | Rol mínimo | Descripción |
|--------|----------|-----------|-------------|
| `GET` | `/health` | Público | Estado de la API |
| `GET` | `/health/db` | Público | Estado de MySQL |
| `POST` | `/auth/login` | Público | Iniciar sesión |
| `POST` | `/auth/refresh` | Público | Renovar token |
| `GET` | `/auth/me` | Autenticado | Perfil propio |
| `POST` | `/companies` | Autenticado | Crear empresa |
| `GET` | `/companies/me` | COMPANY_ADMIN | Mi empresa |
| `POST` | `/users` | COMPANY_ADMIN | Crear usuario |
| `GET` | `/users` | COMPANY_ADMIN | Listar usuarios |
| `GET` | `/drivers` | DISPATCHER | Listar conductores |
| `GET` | `/drivers/:id/stats` | DISPATCHER | Stats conductor |
| `POST` | `/trips` | DRIVER | Registrar viaje |
| `GET` | `/trips/me` | DRIVER | Mis viajes |
| `GET` | `/trips` | DISPATCHER | Todos los viajes |
| `GET` | `/dashboard/summary` | DISPATCHER | KPIs |
| `GET` | `/reconciliation` | COMPANY_ADMIN | Reconciliaciones |
| `GET` | `/reconciliation/summary` | COMPANY_ADMIN | Resumen fraude |
| `POST` | `/uploads/presigned-url` | Autenticado | URL subida |
| `POST` | `/billing/create-checkout` | COMPANY_ADMIN | Checkout Stripe |

---

## 🚀 Instalación y Configuración

### Prerequisitos

- Node.js 20+
- MySQL 8+
- Redis 7+
- Docker (opcional)

### 1. Clonar el repositorio

```bash
git clone https://github.com/AntRed1/RelayTrace-OS.git
cd RelayTrace-OS/relaytrace-api
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con tus valores
```

### 4. Configurar base de datos

```bash
# Crear usuario y base de datos en MySQL
mysql -u root -p

CREATE USER 'relaytrace'@'localhost' IDENTIFIED BY 'tu_password';
CREATE DATABASE relaytrace CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON relaytrace.* TO 'relaytrace'@'localhost';
FLUSH PRIVILEGES;
```

### 5. Correr migraciones y seed

```bash
npx prisma migrate dev
npx prisma db seed
```

### 6. Levantar Redis (Docker)

```bash
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

### 7. Iniciar en desarrollo

```bash
npm run start:dev
```

La API estará disponible en:

- **API:** `http://localhost:3000/api/v1`
- **Swagger:** `http://localhost:3000/api/docs`
- **Health:** `http://localhost:3000/api/v1/health`

---

## ⚙️ Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto. Ver `.env.example` para referencia:

```env
# =============================================
# Server
# =============================================
NODE_ENV=development
PORT=3000
API_PREFIX=api
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# =============================================
# Database
# =============================================
DATABASE_URL="mysql://relaytrace:password@localhost:3306/relaytrace"

# =============================================
# JWT
# =============================================
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_key_min_32_chars
JWT_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d

# =============================================
# Redis
# =============================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# =============================================
# Azure Storage
# =============================================
AZURE_STORAGE_ACCOUNT_NAME=
AZURE_STORAGE_ACCOUNT_KEY=
AZURE_STORAGE_CONTAINER=relaytrace

# =============================================
# Azure Document Intelligence (OCR)
# =============================================
AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=
AZURE_DOCUMENT_INTELLIGENCE_KEY=

# =============================================
# Azure AD (Microsoft Graph API)
# =============================================
AZURE_AD_CLIENT_ID=
AZURE_AD_CLIENT_SECRET=
AZURE_AD_TENANT_ID=

# =============================================
# Stripe
# =============================================
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 🗄 Base de Datos

### Diagrama de Entidades

```
Company
├── id (cuid)
├── name
├── email (unique)
├── subscriptionStatus
└── Relations:
    ├── users[]
    ├── trips[]
    ├── alerts[]
    ├── auditLogs[]
    └── relayEmailLogs[]

User
├── id (cuid)
├── companyId → Company
├── roleId → Role
├── name
├── email (unique)
├── passwordHash
├── status (active/inactive)
└── Relations:
    └── trips[]

Role
├── id (cuid)
├── name (unique)
└── permissions (JSON)

Trip ⭐
├── id (cuid)
├── companyId → Company
├── driverId → User
├── tripId (Amazon Relay ID)
├── status (pending/confirmed/flagged)
├── sourceType (manual/ocr/relay_email)
├── screenshotUrl
└── Relations:
    ├── alerts[]
    ├── ocrResults[]
    └── reconciliations[]

Alert
├── id (cuid)
├── companyId → Company
├── tripId → Trip
├── alertType (duplicate/missing/fraud)
└── resolved

AuditLog
├── id (cuid)
├── companyId → Company
├── userId → User
├── action
└── metadata (JSON)

Reconciliation
├── id (cuid)
├── companyId
├── tripId → Trip
├── relayEmailLogId → RelayEmailLog
├── matched (boolean)
└── discrepancyReason

RelayEmailLog
├── id (cuid)
├── companyId → Company
├── relayTripId
├── emailTimestamp
├── parsedData (JSON)
└── reconciliationStatus
```

### Comandos Prisma

```bash
# Generar migrations
npx prisma migrate dev --name nombre_migration

# Aplicar migrations en producción
npx prisma migrate deploy

# Regenerar cliente Prisma
npx prisma generate

# Ver datos en Prisma Studio
npx prisma studio

# Seed inicial
npx prisma db seed
```

---

## 🔒 Seguridad

### Medidas implementadas

| Medida | Implementación |
|--------|---------------|
| **Autenticación** | JWT con access + refresh tokens |
| **Autorización** | RBAC con roles granulares |
| **Multi-tenant** | `companyId` en todas las entidades + guards |
| **Rate Limiting** | 10 req/seg, 100 req/min por IP |
| **Helmet** | Headers de seguridad HTTP |
| **CORS** | Orígenes permitidos configurables |
| **Sanitización** | `SanitizeInterceptor` elimina campos sensibles |
| **Validación** | `ValidationPipe` con whitelist estricta |
| **Errores Prisma** | `PrismaExceptionFilter` manejo centralizado |
| **Secrets** | Azure Key Vault en producción |

### Flujo de autenticación

```
Client → POST /auth/login → JWT (1h) + Refresh (7d)
                    ↓
Client → Request + Bearer Token
                    ↓
JwtAuthGuard → Valida token → Attach user al request
                    ↓
RolesGuard → Verifica rol (SUPER_ADMIN bypass)
                    ↓
CompanyGuard → Valida aislamiento tenant
                    ↓
Controller → Service (companyId desde JWT, nunca del body)
```

---

## 🐳 Docker

### Construir imagen

```bash
docker build -t relaytrace-api .
```

### Correr con Docker Compose

```bash
# Desde la raíz del monorepo
docker-compose up -d
```

### Variables de entorno en Docker

```bash
docker run -d \
  --name relaytrace-api \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL=mysql://... \
  -e JWT_SECRET=... \
  relaytrace-api
```

---

## 📊 Roadmap

### ✅ Fase 1 — Core MVP (Completado)

- [x] Auth + JWT + RBAC
- [x] Multi-tenant (company isolation)
- [x] Trips Core (registro manual)
- [x] Dashboard básico
- [x] Auditoría interna
- [x] Rate limiting + seguridad
- [x] Swagger / OpenAPI

### 🔄 Fase 2 — SaaS Comercial (En progreso)

- [ ] Stripe subscriptions completas
- [ ] Límites por plan
- [ ] Onboarding empresas
- [ ] Azure Blob Storage real
- [ ] Frontend PWA (Next.js 15)

### 📅 Fase 3 — OCR Automation

- [ ] Azure AI Document Intelligence
- [ ] Screenshot → Trip ID automático
- [ ] Queue async (BullMQ)

### 📅 Fase 4 — Reconciliación Automática

- [ ] Microsoft Graph API (emails Relay)
- [ ] Parser automático
- [ ] Motor anti-fraude completo
- [ ] Alertas en tiempo real

### 📅 Fase 5 — Inteligencia Operacional

- [ ] Analytics avanzado
- [ ] Score de conductor
- [ ] Predicción de discrepancias
- [ ] Alertas inteligentes

### 📅 Fase 6 — Enterprise Scaling

- [ ] AKS / Microservicios
- [ ] Event-driven architecture
- [ ] Multi-región
- [ ] CQRS + Event Sourcing

---

## 🤝 Contribución

Este es un repositorio privado. Para contribuir:

1. Clona el repositorio
2. Crea una rama: `git checkout -b feature/nombre-feature`
3. Commit: `git commit -m 'feat: descripción del cambio'`
4. Push: `git push origin feature/nombre-feature`
5. Abre un Pull Request

### Convención de commits

```
feat:     Nueva funcionalidad
fix:      Corrección de bug
docs:     Documentación
refactor: Refactorización sin cambio funcional
test:     Tests
chore:    Tareas de mantenimiento
```

---

## 📄 Licencia

Propietario — Todos los derechos reservados © 2026 RelayTrace OS

---

<div align="center">

**Construido con ❤️ para resolver un problema real en la industria del transporte**

[⬆ Volver arriba](#relaytrace-os)

</div>
