# ============================================================
# Momen Tasks — Vercel Environment Setup (PowerShell)
# Run this script to set environment variables in Vercel
# ============================================================

$ErrorActionPreference = "Stop"

Write-Host "🚀 Setting up Vercel environment variables for Momen Tasks..." -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
try {
    $vercelVersion = vercel --version 2>$null
    if ($LASTEXITCODE -ne 0) { throw "Not found" }
    Write-Host "✅ Vercel CLI ready: $vercelVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Vercel CLI not found. Install it with: npm i -g vercel" -ForegroundColor Red
    exit 1
}

# Check if logged in
try {
    vercel whoami 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "Not logged in" }
    Write-Host "✅ Logged in to Vercel" -ForegroundColor Green
}
catch {
    Write-Host "❌ Not logged in to Vercel. Run: vercel login" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📝 Setting environment variables..." -ForegroundColor Yellow
Write-Host ""

# Function to set env var
function Set-VercelEnv {
    param(
        [string]$Key,
        [string]$Value,
        [string]$Environment = "production"
    )
    
    Write-Host "Setting $Key..."
    try {
        $Value | vercel env add $Key $Environment --force 2>$null
        Write-Host "  ✅ $Key set" -ForegroundColor Green
    }
    catch {
        Write-Host "  ⚠️  Could not set $Key. Set it manually in Vercel dashboard." -ForegroundColor Yellow
    }
}

# Generate random secrets if not provided
function New-RandomSecret {
    param([int]$Length = 32)
    $bytes = New-Object System.Byte[] $Length
    [System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
    return ($bytes | ForEach-Object { $_.ToString("x2") }) -join ""
}

# Read from .env file if it exists
if (Test-Path .env) {
    Write-Host "📖 Reading from .env file..." -ForegroundColor Cyan
    Get-Content .env | Where-Object { $_ -notmatch "^#" -and $_ -match "=" } | ForEach-Object {
        $parts = $_ -split "=", 2
        $name = $parts[0].Trim()
        $value = $parts[1].Trim()
        Set-Item -Path "env:$name" -Value $value -ErrorAction SilentlyContinue
    }
}

# Core variables
$databaseUrl = if ($env:DATABASE_URL) { $env:DATABASE_URL } else { "postgresql://user:pass@host:5432/db" }
$redisUrl = if ($env:REDIS_URL) { $env:REDIS_URL } else { "redis://localhost:6379" }
$jwtAccessSecret = if ($env:JWT_ACCESS_SECRET) { $env:JWT_ACCESS_SECRET } else { New-RandomSecret }
$jwtRefreshSecret = if ($env:JWT_REFRESH_SECRET) { $env:JWT_REFRESH_SECRET } else { New-RandomSecret }
$encryptionKey = if ($env:ENCRYPTION_KEY) { $env:ENCRYPTION_KEY } else { New-RandomSecret }
$googleClientId = if ($env:GOOGLE_CLIENT_ID) { $env:GOOGLE_CLIENT_ID } else { "your-google-client-id" }
$googleClientSecret = if ($env:GOOGLE_CLIENT_SECRET) { $env:GOOGLE_CLIENT_SECRET } else { "your-google-client-secret" }

# Set environment variables
Set-VercelEnv -Key "DATABASE_URL" -Value $databaseUrl
Set-VercelEnv -Key "REDIS_URL" -Value $redisUrl
Set-VercelEnv -Key "JWT_ACCESS_SECRET" -Value $jwtAccessSecret
Set-VercelEnv -Key "JWT_REFRESH_SECRET" -Value $jwtRefreshSecret
Set-VercelEnv -Key "ENCRYPTION_KEY" -Value $encryptionKey
Set-VercelEnv -Key "FRONTEND_URL" -Value "https://momen-tasks.vercel.app"
Set-VercelEnv -Key "NODE_ENV" -Value "production"
Set-VercelEnv -Key "GOOGLE_CLIENT_ID" -Value $googleClientId
Set-VercelEnv -Key "GOOGLE_CLIENT_SECRET" -Value $googleClientSecret

Write-Host ""
Write-Host "✅ Environment variables configured!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  Manual steps required:" -ForegroundColor Yellow
Write-Host "   1. Go to https://vercel.com/dashboard"
Write-Host "   2. Select your project"
Write-Host "   3. Go to Settings → Environment Variables"
Write-Host "   4. Update these with your actual values:"
Write-Host "      - DATABASE_URL (your PostgreSQL connection string)"
Write-Host "      - REDIS_URL (your Redis connection string)"
Write-Host "      - GOOGLE_CLIENT_ID"
Write-Host "      - GOOGLE_CLIENT_SECRET"
Write-Host ""
Write-Host "5. Redeploy your project to apply changes" -ForegroundColor Cyan
