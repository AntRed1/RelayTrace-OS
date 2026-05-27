# ─────────────────────────────────────────────────────────────────────────────
# RelayTrace — Dev environment launcher
# Starts API + Frontend + Stripe webhook listener in separate windows
#
# Usage:  .\dev-start.ps1
# ─────────────────────────────────────────────────────────────────────────────

$root    = $PSScriptRoot
$api     = Join-Path $root "relaytrace-api"
$web     = Join-Path $root "relaytrace-web"
$stripe  = "B:\Stripe\stripe.exe"

Write-Host ""
Write-Host "  RelayTrace Dev Launcher" -ForegroundColor Cyan
Write-Host "  ────────────────────────────────────" -ForegroundColor DarkCyan
Write-Host ""

# ── 1. API (NestJS on :3000) ──────────────────────────────────────────────────
Write-Host "  [1/3] Starting API (localhost:3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$api'; Write-Host '[API] Starting...' -ForegroundColor Cyan; npm run start:dev"
) -WindowStyle Normal

Start-Sleep -Seconds 2

# ── 2. Frontend (Next.js on :3001) ───────────────────────────────────────────
Write-Host "  [2/3] Starting Frontend (localhost:3001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$web'; Write-Host '[WEB] Starting...' -ForegroundColor Cyan; npm run dev"
) -WindowStyle Normal

Start-Sleep -Seconds 2

# ── 3. Stripe webhook listener ────────────────────────────────────────────────
Write-Host "  [3/3] Starting Stripe webhook listener..." -ForegroundColor Yellow
Write-Host "        Forwarding: Stripe → localhost:3000/billing/webhook" -ForegroundColor DarkGray
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Write-Host '[STRIPE] Webhook listener starting...' -ForegroundColor Magenta; & '$stripe' listen --forward-to localhost:3000/billing/webhook"
) -WindowStyle Normal

Write-Host ""
Write-Host "  ✓ All processes launched in separate windows." -ForegroundColor Green
Write-Host ""
Write-Host "  URLs:" -ForegroundColor White
Write-Host "    API         →  http://localhost:3000" -ForegroundColor DarkGray
Write-Host "    API Docs    →  http://localhost:3000/api" -ForegroundColor DarkGray
Write-Host "    Frontend    →  http://localhost:3001" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  Stripe test cards:" -ForegroundColor White
Write-Host "    Success     →  4242 4242 4242 4242  (any future date, any CVC)" -ForegroundColor DarkGray
Write-Host "    Declined    →  4000 0000 0000 0002" -ForegroundColor DarkGray
Write-Host "    Auth req.   →  4000 0025 0000 3155" -ForegroundColor DarkGray
Write-Host ""
