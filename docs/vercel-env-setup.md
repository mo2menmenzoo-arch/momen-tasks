# Momen Tasks — Vercel Environment Setup Guide

## Quick Reference

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `JWT_ACCESS_SECRET` | Secret for JWT access tokens | `c812cdc3ed334103...` |
| `JWT_REFRESH_SECRET` | Secret for JWT refresh tokens | `75dd52a7a30d317e...` |
| `ENCRYPTION_KEY` | 32-byte hex key for AES-256-GCM | `3322f6e8e9418a38...` |
| `FRONTEND_URL` | Frontend URL (CORS origin) | `https://momen-tasks.vercel.app` |
| `NODE_ENV` | Environment mode | `production` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | From Google Cloud Console |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REDIS_TOKEN` | Redis authentication token | (none) |
| `JWT_ACCESS_EXPIRES_IN` | Access token expiry | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `30d` |
| `RESEND_API_KEY` | Email service API key | (none) |
| `VAPID_PUBLIC_KEY` | Web push public key | (none) |
| `VAPID_PRIVATE_KEY` | Web push private key | (none) |

## Setup Methods

### Method 1: Automated Script (Recommended)

**Windows (PowerShell):**
```powershell
.\scripts\setup-vercel-env.ps1
```

**Linux/macOS:**
```bash
chmod +x scripts/setup-vercel-env.sh
./scripts/setup-vercel-env.sh
```

### Method 2: Manual Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings → Environment Variables**
4. Add each variable with the production value
5. Click **Save** and redeploy

### Method 3: Vercel CLI

```bash
# Add environment variable
echo "your-value" | vercel env add DATABASE_URL production

# List all environment variables
vercel env ls

# Remove environment variable
vercel env rm DATABASE_URL production
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Go to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth client ID**
5. Select **Web application**
6. Add authorized redirect URIs:
   - `https://momen-tasks.vercel.app/auth/google/callback`
   - `http://localhost:3000/api/v1/auth/google/callback` (for development)
7. Copy the Client ID and Client Secret to Vercel environment variables

## Database Setup (PostgreSQL)

### Option A: Vercel Postgres
1. Go to your project in Vercel
2. Click **Storage** tab
3. Create a new **Postgres** database
4. Copy the connection string to `DATABASE_URL`

### Option B: External Provider
1. Use [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app)
2. Create a database and get the connection string
3. Update `DATABASE_URL` in Vercel environment variables
4. Run migrations: `npx prisma migrate deploy`

## Redis Setup

### Option A: Upstash (Recommended for Serverless)
1. Create account at [Upstash](https://upstash.com)
2. Create a new Redis database
3. Copy the connection string to `REDIS_URL`
4. Copy the token to `REDIS_TOKEN` (if authentication is enabled)

### Option B: Railway Redis
1. Add Redis service in your Railway project
2. Copy the connection string to `REDIS_URL`

## Post-Setup Steps

1. **Run Prisma migrations:**
   ```bash
   npx prisma migrate deploy
   ```

2. **Redeploy your Vercel project:**
   ```bash
   vercel --prod
   ```

3. **Verify environment:**
   ```bash
   vercel env ls
   ```

## Troubleshooting

### "DATABASE_URL not set"
- Ensure the environment variable is set in Vercel dashboard
- Redeploy after adding environment variables

### "JWT verification failed"
- Ensure `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are set
- Use the same secrets across deployments

### CORS errors
- Ensure `FRONTEND_URL` matches your actual frontend URL
- Check that the frontend is calling the correct API URL

### Redis connection errors
- Ensure `REDIS_URL` is correct
- For Upstash, ensure you're using the rediss:// protocol for TLS
