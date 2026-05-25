# RelayTrace OS — Arquitectura, Roadmap y Fases de Desarrollo

# Visión General

RelayTrace OS es un SaaS multi-tenant construido como una capa operacional por encima de Amazon Relay, enfocado en resolver problemas de:

- trazabilidad,
- auditoría,
- control operacional,
- fraude interno,
- historial de viajes,
- y gestión de conductores.

El sistema NO reemplaza Amazon Relay.

RelayTrace OS complementa Relay proporcionando:
- identificación del conductor que tomó un viaje,
- registro operacional,
- validación,
- reconciliación,
- y monitoreo administrativo.

---

# Problema Principal

Muchas empresas/carriers utilizan:
- una sola cuenta de Amazon Relay,
- compartida entre múltiples conductores.

Problemas:
- no se sabe qué conductor tomó qué viaje,
- no existe historial organizado,
- existe fraude interno,
- se depende de screenshots por WhatsApp,
- no hay auditoría ni trazabilidad.

---

# Solución

RelayTrace OS permitirá:

```text
Conductor toma viaje en Amazon Relay
        ↓
Conductor registra el Trip ID
        ↓
Sistema asocia:
    - conductor
    - viaje
    - timestamp
    - evidencia
        ↓
Empresa obtiene trazabilidad completa
```

---

# Arquitectura General

```text
[Amazon Relay]
        ↓
[Emails de Confirmación]
        ↓
[Parser / OCR / Reconciliación]
        ↓
[RelayTrace Backend]
        ↓
[PWA Drivers + Dashboard Admin]
```

---

# Stack Tecnológico Oficial

| Capa | Tecnología |
|---|---|
| Frontend | React + Next.js 15 |
| UI | TailwindCSS + shadcn/ui |
| PWA | next-pwa |
| Backend API | NestJS |
| Lenguaje | TypeScript |
| ORM | Prisma |
| Base de Datos | MySQL |
| Auth | Clerk/Auth.js + JWT |
| Storage | Azure Blob Storage |
| OCR | Azure AI Document Intelligence |
| Emails | Microsoft Graph API |
| Queue Jobs | BullMQ |
| Cache | Redis |
| Billing | Stripe |
| Infraestructura | Azure |
| Deploy | Azure Container Apps |
| CI/CD | Azure DevOps |
| Monitoring | Azure Monitor + App Insights |

---

# Arquitectura SaaS Multi-Tenant

## Modelo

```text
Empresa
    ├── Conductores
    ├── Dispatchers
    ├── Viajes
    ├── Alertas
    └── Facturación
```

---

# Regla Crítica

Todas las entidades deben contener:

```sql
company_id
```

Esto garantiza:
- aislamiento entre empresas,
- seguridad multi-tenant,
- escalabilidad SaaS.

---

# Roles del Sistema

| Rol | Función |
|---|---|
| SUPER_ADMIN | Control total del SaaS |
| COMPANY_ADMIN | Administra empresa |
| DISPATCHER | Monitoreo operacional |
| DRIVER | Registrar viajes |

---

# Arquitectura de Repositorios

```text
relaytrace-os/
│
├── relaytrace-web/
├── relaytrace-api/
├── relaytrace-workers/
├── relaytrace-infra/
└── relaytrace-docs/
```

---

# Arquitectura Frontend

# Tecnología

- Next.js 15
- TypeScript
- App Router
- TailwindCSS
- shadcn/ui
- next-pwa

---

# Estructura Frontend

```text
app/
├── (auth)/
├── admin/
├── dispatcher/
├── driver/
├── api/
└── layouts/
```

---

# Interfaces Principales

## Driver Portal

Objetivo:
- ultra rápido,
- mínimo clics,
- mobile-first.

Funciones:
- registrar Trip ID,
- subir screenshot,
- historial propio.

---

## Admin Portal

Funciones:
- dashboard,
- historial,
- filtros,
- conductores,
- alertas,
- auditoría,
- métricas.

---

# Arquitectura Backend

# Tecnología

- NestJS
- TypeScript
- Prisma ORM

---

# Estructura Backend

```text
src/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── companies/
│   ├── roles/
│   ├── drivers/
│   ├── trips/
│   ├── uploads/
│   ├── billing/
│   ├── dashboard/
│   ├── audit/
│   ├── alerts/
│   ├── ocr/
│   ├── relay-emails/
│   ├── reconciliation/
│   └── notifications/
│
├── common/
├── config/
├── prisma/
├── queues/
└── main.ts
```

---

# Base de Datos

# Motor

- MySQL
- Azure Database for MySQL Flexible Server

---

# ORM

- Prisma

---

# Entidades Principales

## Company

```text
- id
- name
- email
- subscription_status
- created_at
```

---

## User

```text
- id
- company_id
- role_id
- name
- email
- password_hash
- status
```

---

## Role

```text
- id
- name
- permissions
```

---

## Trip

```text
- id
- company_id
- driver_id
- trip_id
- status
- source_type
- screenshot_url
- registered_at
```

---

## Alert

```text
- id
- company_id
- trip_id
- alert_type
- resolved
```

---

## AuditLog

```text
- id
- company_id
- user_id
- action
- metadata
```

---

# Infraestructura Azure

# Servicios Iniciales

| Servicio Azure | Uso |
|---|---|
| Azure Container Apps | Deploy aplicaciones |
| Azure Database for MySQL | Base de datos |
| Azure Blob Storage | Screenshots |
| Azure Key Vault | Secrets |
| Azure Monitor | Logs |
| Application Insights | Observabilidad |
| Azure Container Registry | Docker images |

---

# Arquitectura Infraestructura

```text
Internet
    ↓
Azure Front Door
    ↓
Next.js Frontend
    ↓
NestJS API
    ↓
MySQL + Redis + Blob Storage
```

---

# Seguridad

# Backend

Implementar:

- JWT access tokens
- Refresh tokens
- RBAC
- Guards
- DTO validation
- Rate limiting
- Helmet
- CORS
- Tenant isolation

---

# Secrets

Usar:
- Azure Key Vault

NO guardar:
- secretos,
- API keys,
- connection strings,
en código.

---

# Storage

# Azure Blob Storage

Uso:
- screenshots,
- uploads,
- evidencias.

---

# OCR

# Azure AI Document Intelligence

Uso:
- extraer Trip ID automáticamente,
- parsing screenshots Relay.

---

# Emails

# Microsoft Graph API

Uso:
- monitorear emails Relay,
- parsear confirmaciones,
- reconciliación automática.

---

# Queue System

# Redis + BullMQ

Uso:
- OCR async,
- emails async,
- reconciliación,
- alertas,
- webhooks Stripe.

---

# Workers

```text
relaytrace-workers
```

Jobs:

```text
- process-ocr
- process-relay-email
- reconcile-trip
- generate-alert
- send-notification
- stripe-webhook
```

---

# Billing

# Stripe

Modelo:
- SaaS subscriptions.

Facturación:
- mensual por empresa.

---

# CI/CD

# Azure DevOps

Pipelines:

## Frontend

```text
- install
- lint
- build
- docker build
- deploy
```

---

## Backend

```text
- install
- test
- prisma migrate
- docker build
- deploy
```

---

# Monitoring

# Azure Monitor
# Application Insights

Monitorear:
- performance,
- errores,
- OCR,
- workers,
- APIs,
- métricas.

---

# Docker

# Obligatorio desde día 1

## Archivos

```text
Dockerfile
docker-compose.yml
```

---

# Ambientes

| Ambiente | Uso |
|---|---|
| local | desarrollo |
| staging | pruebas |
| production | producción |

---

# Roadmap Oficial de Desarrollo

# FASE 1 — Core MVP

# Objetivo

Construir:
- trazabilidad básica,
- multiempresa,
- dashboard,
- auth,
- billing inicial.

---

# Funcionalidades

## Drivers

- Login
- Registrar Trip ID manual
- Historial propio

---

## Admin

- Dashboard
- Historial viajes
- Filtros
- Gestión conductores

---

## Backend

- Auth
- RBAC
- Multi-tenant
- CRUD trips
- Auditoría

---

# Tecnologías Fase 1

| Área | Tecnología |
|---|---|
| Frontend | Next.js |
| Backend | NestJS |
| DB | MySQL |
| ORM | Prisma |
| Auth | Clerk/Auth.js |
| Deploy | Azure Container Apps |

---

# NO incluir aún

❌ OCR  
❌ Redis  
❌ BullMQ  
❌ AI  
❌ Reconciliación automática  
❌ WebSockets  
❌ Microservicios  

---

# Objetivo UX

Registrar viaje en:
- menos de 5 segundos.

---

# Resultado esperado

```text
Empresa crea conductores
        ↓
Conductores registran viajes
        ↓
Admins obtienen trazabilidad
```

---

# FASE 2 — Billing + Producción SaaS

# Objetivo

Convertir el MVP en:
- SaaS comercial real.

---

# Funcionalidades

- Stripe subscriptions
- límites por plan
- onboarding empresas
- company settings
- billing dashboard

---

# Infraestructura

Agregar:
- Azure Front Door
- App Insights
- Key Vault

---

# Resultado esperado

Sistema:
- multiempresa,
- monetizable,
- producción real.

---

# FASE 3 — OCR Automation

# Objetivo

Reducir fricción conductores.

---

# Funcionalidades

- screenshot upload
- OCR automático
- extracción Trip ID

---

# Tecnologías

| Área | Tecnología |
|---|---|
| OCR | Azure AI Document Intelligence |
| Storage | Azure Blob Storage |

---

# Flujo

```text
Screenshot
    ↓
OCR
    ↓
Trip ID detectado
```

---

# Resultado esperado

Registro:
- más rápido,
- menos errores,
- mejor adopción.

---

# FASE 4 — Reconciliación Automática

# Objetivo

Construir:
- motor anti-fraude,
- validación automática.

---

# Funcionalidades

- lectura emails Relay
- parser automático
- comparación registros
- alertas

---

# Tecnologías

| Área | Tecnología |
|---|---|
| Email | Microsoft Graph API |
| Queue | BullMQ |
| Cache | Redis |

---

# Flujo

```text
Relay email
        ↓
Parser
        ↓
Comparación
        ↓
¿Existe registro?
        ↓
SI = OK
NO = ALERTA
```

---

# Resultado esperado

Fuente de verdad independiente del conductor.

---

# FASE 5 — Inteligencia Operacional

# Objetivo

Transformar RelayTrace OS en:
- plataforma operacional avanzada.

---

# Funcionalidades

- métricas
- analytics
- score conductor
- productividad
- alertas inteligentes
- tendencias

---

# Dashboard Avanzado

## KPIs

- viajes por conductor
- discrepancias
- cumplimiento
- actividad diaria
- rendimiento

---

# FASE 6 — Escalado Enterprise

# Objetivo

Escalar arquitectura.

---

# Posibles mejoras

- AKS
- microservicios
- event-driven
- CQRS
- Kafka
- multi-región

---

# IMPORTANTE

NO implementar esto antes de validar:
- producto,
- adopción,
- crecimiento real.

---

# Objetivo Final

Convertir RelayTrace OS en:

```text
La plataforma operacional de trazabilidad
para empresas que utilizan Amazon Relay.
```

---

# Diferenciador Principal

RelayTrace OS NO compite contra Amazon Relay.

RelayTrace OS resuelve:

```text
La falta de trazabilidad,
auditoría y control operacional
en cuentas Relay compartidas.
```