# Railway deployment guide for Onnet-PC

This repository should be deployed as two Railway services and one database.

## 1) Create services

- Service A: `onnetpc-api` (root folder `Onnet-PC/`, uses `Dockerfile`)
- Service B: `onnetpc-web` (folder `Onnet-PC/frontend`, Node/Vite app)
- Service C: MySQL plugin

## 2) Configure API service

Use variables from `.env.railway.example`.

Minimum required:

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `APP_JWT_SECRET`
- `APP_FRONTEND_BASE_URL=https://onnetpc.com`
- `APP_CORS_ALLOWED_ORIGINS=https://onnetpc.com,https://www.onnetpc.com`

## 3) Configure web service

Use variables from `frontend/.env.railway.example`.

- Build command: `npm ci ; npm run build`
- Start command: `npm run start:railway`

## 4) Domains

- Attach `onnetpc.com` and `www.onnetpc.com` to web service.
- Attach `api.onnetpc.com` to API service.

## 5) DNS records

Create DNS records exactly as Railway custom domain UI instructs.

Typical setup:

- `onnetpc.com` -> CNAME flattening/ALIAS to Railway-provided host (provider dependent)
- `www` -> CNAME to Railway-provided host for web service
- `api` -> CNAME to Railway-provided host for API service

## 6) Post-deploy checks

- Open `https://onnetpc.com`
- Confirm frontend calls `https://api.onnetpc.com/api/v1`
- Check API health endpoint: `https://api.onnetpc.com/actuator/health`
- Validate login/register and at least one authenticated request

## 7) Security checklist

- Rotate any credentials that were previously stored in source control.
- Keep all secrets only in Railway Variables.
- Prefer production PayPal endpoint and webhook ID in production.
