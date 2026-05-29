# relaytrace-infra

Infraestructura de RelayTrace OS definida como código con **Terraform** (AzureRM ~3.100). Despliega la plataforma completa en Azure desde cero con un solo `terraform apply`.

Ver el [README raíz](../README.md) para la documentación completa del proyecto.

---

## Región

Todos los recursos se despliegan en **West US 2** (`westus2`) — región elegida por disponibilidad del SKU MySQL Flexible Server B1ms.

---

## Estructura

```
relaytrace-infra/
├── providers.tf             # AzureRM ~3.100 + backend azurerm (remote state)
├── main.tf                  # Resource group + llamadas a los 8 módulos
├── variables.tf             # Variables raíz (todas con default o descripción clara)
├── outputs.tf               # Outputs de todos los módulos
├── environments/
│   ├── dev.tfvars           # Valores para desarrollo
│   └── prod.tfvars          # Valores para producción
└── modules/
    ├── 01-networking/       # VNet + subnets + NSGs
    ├── 02-keyvault/         # Key Vault + secretos generados + PE
    ├── 03-data/             # MySQL + Redis + connection strings → KV
    ├── 04-storage/          # Storage Account + contenedores + lifecycle
    ├── 05-appservice/       # App Service Plan + API + Web + MSI + RBAC
    ├── 06-communication/    # ACS Email + dominio personalizado
    ├── 07-frontdoor/        # Front Door Standard + WAF + SSL + dominios
    └── 08-observability/    # Log Analytics + AppInsights + diagnósticos
```

---

## Módulos

### 01-networking

Crea la base de red del proyecto.

| Recurso | Nombre | CIDR / Nota |
|---------|--------|-------------|
| Virtual Network | `vnet-relaytrace-{env}` | 10.0.0.0/16 |
| snet-appservice | `snet-appservice-...` | 10.0.1.0/24 · delegación `Microsoft.Web/serverFarms` |
| snet-data | `snet-data-...` | 10.0.2.0/24 · PE policies disabled (Redis PE) |
| snet-mysql | `snet-mysql-...` | 10.0.3.0/24 · delegación `Microsoft.DBforMySQL/flexibleServers` |
| snet-private | `snet-private-...` | 10.0.4.0/24 · PE policies disabled (KV, Storage, ACS) |
| NSG appservice | — | Outbound: Redis, MySQL, PEs, Internet HTTPS, AzureMonitor |
| NSG data | — | Inbound: Redis ports desde appservice; deny Internet |
| NSG mysql | — | Inbound: 3306 desde appservice; deny Internet |
| NSG private | — | Inbound: 443 desde appservice + AzureDNS; deny Internet |

### 02-keyvault

Centraliza todos los secretos de la aplicación.

Secretos **generados** (random):
- `mysql-admin-password` — contraseña del admin de MySQL (20 chars)
- `jwt-access-secret` — clave de firma JWT access (64 chars)
- `jwt-refresh-secret` — clave de firma JWT refresh (64 chars)

Secretos **pasados como variables sensibles** (nunca en `.tfvars`):
- `stripe-secret-key` → `TF_VAR_stripe_secret_key`
- `stripe-webhook-secret` → `TF_VAR_stripe_webhook_secret`

Secretos **escritos por módulos posteriores**:
- `mysql-connection-string` (módulo 03)
- `redis-connection-string` (módulo 03)
- `storage-account-name` (módulo 04)
- `acs-connection-string` (módulo 06)
- `appinsights-connection-string` (módulo 08)

### 03-data

| Recurso | SKU dev | SKU prod |
|---------|---------|----------|
| MySQL Flexible Server | B_Standard_B1ms | B_Standard_B1ms |
| Backup retention | 1 día | 7 días |
| Redis Cache | Basic C0 (250 MB) | Standard C1 (1 GB) |

- MySQL usa VNet Integration en `snet-mysql` — sin endpoint público
- Redis usa Private Endpoint en `snet-data`
- Ambos connection strings → Key Vault

### 04-storage

Storage Account con 3 contenedores y política de lifecycle:

| Contenedor | Cool | Archive | Delete |
|------------|------|---------|--------|
| `screenshots` | +30 d | +90 d | +365 d |
| `ocr-documents` | +7 d | +30 d | +365 d |
| `exports` | +14 d | — | +90 d |

- dev: LRS, soft-delete 3 días
- prod: ZRS, soft-delete 14 días
- Acceso via Managed Identity (`Storage Blob Data Contributor` asignado en módulo 05)

### 05-appservice

| Recurso | Valor |
|---------|-------|
| Plan | Linux P1v3 (compartido por API y Web) |
| API | `app-api-relaytrace-{env}` |
| Web | `app-web-relaytrace-{env}` |
| Imágenes | Docker Hub público (`dockerhub_username/image:tag`) |
| VNet Integration | `snet-appservice` |
| Identity | System-Assigned Managed Identity |

RBAC asignado:
- API MSI → `Key Vault Secrets User` (en Key Vault)
- API MSI → `Storage Blob Data Contributor` (en Storage Account)

App Settings de la API incluyen referencias KV para: `DATABASE_URL`, `REDIS_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `AZURE_STORAGE_ACCOUNT_NAME`, `ACS_CONNECTION_STRING`, `APPLICATIONINSIGHTS_CONNECTION_STRING`.

### 06-communication

Azure Communication Services Email con dominio personalizado (`mail.relaytrace.com` por defecto). El connection string se escribe en Key Vault.

**Pasos post-apply obligatorios:**
```bash
terraform output acs_dns_verification_records
# Añadir al registrar: TXT (domain proof), TXT (SPF), CNAME×2 (DKIM)
# Portal → Email Comm. Service → Verify domain
# Portal → Communication Service → Link domain
# Portal → Email domain → Add sender username "noreply"
```

### 07-frontdoor

| Recurso | Valor |
|---------|-------|
| SKU | Standard_AzureFrontDoor |
| WAF | DefaultRuleSet 1.0 + BotManager 1.0 |
| WAF mode | Detection (dev) / Prevention (prod) |
| Dominios | `www.relaytrace.com` → Web, `api.relaytrace.com` → API |
| TLS | Certificados administrados por Azure |
| HTTP | Redirige permanentemente a HTTPS (regla en rule set) |

**Pasos post-apply obligatorios:**
```bash
terraform output frontdoor_dns_records
# Para cada dominio:
#   CNAME  www              → fd-relaytrace-{env}.azurefd.net
#   TXT    _dnsauth.www     → {validation_token}
#   CNAME  api              → fd-relaytrace-{env}.azurefd.net
#   TXT    _dnsauth.api     → {validation_token}

# Bloquear App Service después de validar dominios:
terraform output frontdoor_profile_id
# Portal → App Service → Networking → Access Restrictions
# Allow: AzureFrontDoor.Backend + header X-Azure-FDID = {profile_id}
# Deny:  0.0.0.0/0
```

### 08-observability

| Recurso | Configuración |
|---------|--------------|
| Log Analytics Workspace | PerGB2018 · 30 d (dev) / 90 d (prod) · 1 GB/día cap (dev) / 5 GB/día (prod) |
| Application Insights | Workspace-based, tipo `web` |
| Diagnósticos | API App Service, Web App Service, Key Vault, MySQL, Redis, Storage blob |

`appinsights-connection-string` → Key Vault → App Service settings → `APPLICATIONINSIGHTS_CONNECTION_STRING`.

Para activar en NestJS:
```ts
// main.ts — primer import antes de cualquier otro
import 'applicationinsights';
```

---

## Prerrequisitos

- Terraform >= 1.5
- Azure CLI autenticado (`az login`)
- Permisos: `Contributor` + `User Access Administrator` en la suscripción
- Resource group para el estado remoto creado manualmente (bootstrap)

---

## Despliegue

### Bootstrap del estado remoto (una sola vez)

```bash
# Crear el resource group y storage account para el estado
az group create --name rg-relaytrace-tfstate --location westus2
az storage account create \
  --name relaytracestate \
  --resource-group rg-relaytrace-tfstate \
  --location westus2 \
  --sku Standard_LRS
az storage container create \
  --name tfstate \
  --account-name relaytracestate
```

### Aplicar

```bash
cd relaytrace-infra

# Secretos sensibles — nunca en .tfvars
export TF_VAR_stripe_secret_key="sk_live_..."
export TF_VAR_stripe_webhook_secret="whsec_..."

terraform init

# Dev
terraform plan  -var-file=environments/dev.tfvars
terraform apply -var-file=environments/dev.tfvars

# Prod
terraform plan  -var-file=environments/prod.tfvars
terraform apply -var-file=environments/prod.tfvars
```

### Outputs útiles post-apply

```bash
terraform output frontdoor_dns_records        # DNS para dominios Front Door
terraform output acs_dns_verification_records # DNS para dominio email ACS
terraform output frontdoor_profile_id         # Para lockdown de App Service
terraform output key_vault_uri                # URI del Key Vault
terraform output mysql_server_fqdn            # FQDN del MySQL (privado)
terraform output api_url                      # URL pública de la API
terraform output web_url                      # URL pública del frontend
```

---

## Variables principales

| Variable | Defecto | Descripción |
|----------|---------|-------------|
| `location` | `westus2` | Región Azure |
| `dockerhub_username` | — | **Requerida** — usuario/org de Docker Hub |
| `api_image_name` | `relaytrace-api` | Nombre de imagen Docker de la API |
| `web_image_name` | `relaytrace-web` | Nombre de imagen Docker del Web |
| `api_image_tag` | `latest` | Tag de imagen de la API |
| `web_image_tag` | `latest` | Tag de imagen del Web |
| `email_domain` | `mail.relaytrace.com` | Dominio para envío de emails |
| `web_custom_domain` | `www.relaytrace.com` | Dominio web en Front Door |
| `api_custom_domain` | `api.relaytrace.com` | Dominio API en Front Door |
| `waf_mode` | `Detection` | `Detection` (dev) o `Prevention` (prod) |
| `stripe_secret_key` | — | **Sensible** — via `TF_VAR_stripe_secret_key` |
| `stripe_webhook_secret` | — | **Sensible** — via `TF_VAR_stripe_webhook_secret` |
| `keyvault_purge_protection` | `false` dev / `true` prod | Protección de purga del KV |
| `redis_sku_name` | `Basic` dev / `Standard` prod | SKU de Redis |
| `mysql_backup_retention_days` | `1` dev / `7` prod | Días de retención de backup |
| `log_retention_days` | `30` dev / `90` prod | Retención de logs en Log Analytics |

---

## Seguridad

- **Secretos**: nunca en `.tfvars` — solo via variables de entorno `TF_VAR_*`
- **Key Vault RBAC**: `enable_rbac_authorization = true` — sin legacy access policies
- **Managed Identity**: App Service no usa credenciales almacenadas
- **Red**: MySQL y Redis inaccesibles desde Internet — solo dentro del VNet
- **Front Door**: WAF previene ataques comunes y bots
- **Storage**: `allow_nested_items_to_be_public = false` — sin acceso público anónimo
- **TLS**: mínimo 1.2 en todos los recursos
- **App Service lock-down**: después de activar Front Door, restringir acceso al service tag `AzureFrontDoor.Backend` + header `X-Azure-FDID`
