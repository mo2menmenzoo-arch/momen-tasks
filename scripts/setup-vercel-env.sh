#!/usr/bin/env bash
# ============================================================
# Momen Tasks — Vercel Environment Setup
# Run this script to set environment variables in Vercel
# ============================================================

set -euo pipefail

echo "🚀 Setting up Vercel environment variables for Momen Tasks..."
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Install it with: npm i -g vercel"
    exit 1
fi

# Check if logged in
if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel. Run: vercel login"
    exit 1
fi

echo "✅ Vercel CLI ready"
echo ""

# Function to set env var
set_env() {
    local key=$1
    local value=$2
    local env=${3:-production}
    
    echo "Setting $key..."
    echo "$value" | vercel env add "$key" "$env" --force 2>/dev/null || {
        echo "  ⚠️  Could not set $key automatically. Set it manually in Vercel dashboard."
    }
}

# Read from .env file if it exists
if [ -f .env ]; then
    echo "📖 Reading from .env file..."
    source .env
fi

echo ""
echo "📝 Setting environment variables..."
echo ""

# Core variables (required)
set_env "DATABASE_URL" "${DATABASE_URL:-postgresql://user:pass@host:5432/db}"
set_env "REDIS_URL" "${REDIS_URL:-redis://localhost:6379}"
set_env "JWT_ACCESS_SECRET" "${JWT_ACCESS_SECRET:-$(openssl rand -hex 32)}"
set_env "JWT_REFRESH_SECRET" "${JWT_REFRESH_SECRET:-$(openssl rand -hex 32)}"
set_env "ENCRYPTION_KEY" "${ENCRYPTION_KEY:-$(openssl rand -hex 32)}"
set_env "FRONTEND_URL" "https://momen-tasks.vercel.app"
set_env "NODE_ENV" "production"

# Google OAuth (fill in your values)
set_env "GOOGLE_CLIENT_ID" "${GOOGLE_CLIENT_ID:-your-google-client-id}"
set_env "GOOGLE_CLIENT_SECRET" "${GOOGLE_CLIENT_SECRET:-your-google-client-secret}"

echo ""
echo "✅ Environment variables configured!"
echo ""
echo "⚠️  Manual steps required:"
echo "   1. Go to https://vercel.com/dashboard"
echo "   2. Select your project"
echo "   3. Go to Settings → Environment Variables"
echo "   4. Update these with your actual values:"
echo "      - DATABASE_URL (your PostgreSQL connection string)"
echo "      - REDIS_URL (your Redis connection string)"
echo "      - GOOGLE_CLIENT_ID"
echo "      - GOOGLE_CLIENT_SECRET"
echo ""
echo "5. Redeploy your project to apply changes"
