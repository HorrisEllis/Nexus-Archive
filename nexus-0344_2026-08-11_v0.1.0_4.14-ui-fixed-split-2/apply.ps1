# apply.ps1 — nexus-patch-2026-08-12
# Run FROM your nexus/ root (same directory as nexus.js). Copies each
# patched file over the matching real path, backing up whatever's there
# first — nothing is silently overwritten (§0.3 — information must never
# be lost). Idempotent: safe to re-run.

$ErrorActionPreference = "Stop"

if (-not (Test-Path ".\nexus.js")) {
    Write-Host "Run this from your nexus/ root — nexus.js not found here." -ForegroundColor Red
    exit 1
}

$patchRoot = $PSScriptRoot
$backupDir = ".\_patch-backups\2026-08-12_$(Get-Date -Format 'HHmmss')"
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

$files = @(
    "engines\registrar.js",
    "engines\dns.js",
    "engines\firewall.js",
    "engines\components\upnp.js"
)

foreach ($f in $files) {
    $src = Join-Path $patchRoot $f
    $dst = Join-Path (Get-Location) $f
    if (Test-Path $dst) {
        $backupPath = Join-Path $backupDir $f
        New-Item -ItemType Directory -Force -Path (Split-Path $backupPath) | Out-Null
        Copy-Item $dst $backupPath
        Write-Host "backed up  $f  ->  $backupPath"
    } else {
        Write-Host "no existing $f — nothing to back up" -ForegroundColor Yellow
    }
    Copy-Item $src $dst -Force
    Write-Host "applied    $f" -ForegroundColor Green
}

Write-Host ""
Write-Host "Done. Restart with: node nexus.js up" -ForegroundColor Cyan
Write-Host "Originals saved under: $backupDir"
Write-Host ""
Write-Host "Then fix the domain data (typo add, missing real add) — see README.md in this patch folder."
