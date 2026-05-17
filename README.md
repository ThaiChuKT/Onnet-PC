# OnnetPC

OnnetPC is a full-stack remote gaming PC rental platform. Customers can register, verify email, top up a wallet, buy PC rental packages, start and end Moonlight/Sunshine sessions, and review their rental history. Admins can manage packages, machines, Sunshine host assignments, users, orders, invoices, sessions, revenue, reviews, and FAQ content.

The current production shape is a single Spring Boot service that serves the built React app, uses Aiven MySQL, and runs on Render.

## Features

- Public catalog for PC rental packages and machine configurations.
- Email verification and password reset.
- Wallet top-up through PayPal.
- Wallet checkout for subscription-style PC rental packages.
- Optional receipt email on checkout.
- Account area with My PCs, profile, password, top-up bills, and rental history.
- Admin dashboard for accounts, machines, packages, bookings, sessions, invoices, revenue, FAQ, and Sunshine host management.
- Moonlight/Sunshine launch flow through a local Windows launcher using the `onnetpc://` protocol.
- Chatbot Builder webchat integration for the AI assistant page.

## Tech Stack

- Backend: Java 21, Spring Boot 4, Spring Security, Spring Data JPA, Maven.
- Frontend: React 19, TypeScript, Vite, Tailwind CSS, Radix UI, Lucide icons.
- Database: MySQL 8.4, currently hosted on Aiven.
- Payments: PayPal SDK/API.
- Email: Resend over HTTPS for cloud deploys, SMTP fallback for local/dev.
- Streaming: Sunshine hosts plus Moonlight client launched locally.
- Deploy: Docker image on Render.

## Repository Layout

```text
.
|-- src/main/java/com/onnet/onnetpc   Spring Boot backend
|-- src/main/resources                application properties and static output target
|-- frontend                          React/Vite frontend
|-- database/sql                      schema dumps and one-time Aiven repair scripts
|-- tools/onnetpc-launcher            Windows Moonlight launcher protocol helper
|-- Dockerfile                        production build image
|-- compose.yaml                      local MySQL/app compose setup
`-- .env.railway.example              backend env example, also useful for Render variables
```

Important backend modules:

- `auth`: registration, login, email verification, password reset, JWT.
- `users`: profile and password management.
- `pcs`: public machine/package catalog.
- `booking`: package ordering, wallet payment, history, reviews.
- `session`: start/end session lifecycle and queueing when no matching PC is available.
- `moonlight`: Sunshine host lookup, admin host management, command logging.
- `wallet`: wallet balance, transactions, PayPal top-up.
- `admin`: dashboard APIs.
- `email`: transactional email provider abstraction.

## Local Development

Requirements:

- Java 21
- Node.js 22+
- MySQL 8.4 or Docker

Backend only:

```powershell
.\mvnw.cmd spring-boot:run
```

Frontend dev server:

```powershell
cd frontend
npm install
npm run dev
```

Docker Compose with MySQL:

```powershell
docker compose up --build
```

The production Dockerfile builds the frontend first, copies `frontend/dist` into Spring Boot static resources, then packages a single runnable jar.

## Configuration

Backend config is in `src/main/resources/application.properties` and should be overridden with environment variables in production.

Minimum production variables:

```env
PORT=8080
SPRING_DATASOURCE_URL=jdbc:mysql://<aiven-host>:<port>/<database>?ssl-mode=REQUIRED&zeroDateTimeBehavior=CONVERT_TO_NULL
SPRING_DATASOURCE_USERNAME=avnadmin
SPRING_DATASOURCE_PASSWORD=...
SPRING_JPA_HIBERNATE_DDL_AUTO=validate
SPRING_FLYWAY_ENABLED=false

APP_JWT_SECRET=replace-with-a-long-random-secret
APP_FRONTEND_BASE_URL=https://onnet-pc.onrender.com
APP_CORS_ALLOWED_ORIGINS=https://onnet-pc.onrender.com
```

PayPal:

```env
APP_PAYPAL_CLIENT_ID=...
APP_PAYPAL_CLIENT_SECRET=...
APP_PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
APP_PAYPAL_WEBHOOK_ID=...
```

Email through Resend:

```env
APP_EMAIL_PROVIDER=resend
APP_EMAIL_RESEND_API_KEY=...
APP_EMAIL_RESEND_FROM=OnnetPC <onboarding@resend.dev>
APP_EMAIL_RESEND_BASE_URL=https://api.resend.com
```

`onboarding@resend.dev` is suitable only for testing and usually sends only to the email address on the Resend account. For public users, verify a real domain in Resend and switch `APP_EMAIL_RESEND_FROM` to an address on that domain.

Frontend config:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_CHATBOT_BUILDER_ACCOUNT_ID=...
VITE_CHATBOT_BUILDER_WEBCHAT_ID=...
VITE_CHATBOT_BUILDER_COLOR=#ff4d1d
```

In the production Docker build, the frontend is served by Spring Boot from the same origin, so `VITE_API_BASE_URL` can be omitted unless deploying the frontend separately.

## Database

The app uses Aiven MySQL in production. Hibernate should run with:

```env
SPRING_JPA_HIBERNATE_DDL_AUTO=validate
```

Use the scripts in `database/sql` for one-time repair or cleanup work:

- `aiven_zero_date_cleanup.sql`: removes legacy `0000-00-00 00:00:00` timestamp values and fixes nullable timestamp columns.
- `aiven_drop_unused_tables.sql`: drops unused legacy tables.
- `aiven_remove_memberships.sql`: removes old membership/subscription-user tables and columns if present.
- `aiven_registration_repair.sql`: older focused repair for registration-related timestamp problems.

Current active tables include users, wallets, wallet transactions, pc specs, pcs, subscription plans, bookings, sessions, session queue, payments, reviews, FAQs, Sunshine hosts, Moonlight command logs, and verification/reset tokens.

Do not enable automatic schema updates in production unless you are intentionally testing a migration. Use SQL scripts and backups for production schema changes.

## Deployment On Render

Use the root `Dockerfile`.

Typical Render settings:

- Environment: Docker
- Dockerfile path: `Dockerfile`
- Health check path: `/actuator/health`
- Port: Render injects `PORT`; the Docker entrypoint passes it to Spring Boot.

Required production notes:

- Keep all secrets in Render environment variables, not in source.
- Use Aiven's JDBC URL with SSL required.
- Use Resend or another HTTPS email provider on Render because SMTP port 587 can time out.
- Keep `SPRING_JPA_HIBERNATE_DDL_AUTO=validate`.

## Moonlight And Sunshine

OnnetPC does not stream from the backend. The browser starts the user's local Moonlight client through a Windows helper app.

Flow:

1. Admin creates or edits Sunshine host records in `/dashboard/sunshine`.
2. Each Sunshine host can be assigned to a specific `pc_id`.
3. User pays for a package and opens My PCs.
4. Start Session returns an `onnetpc://stream?...` URL.
5. The local Windows launcher opens Moonlight.
6. End Session opens `onnetpc://stop?...` to close the local Moonlight process.

Install the launcher from:

```text
tools/onnetpc-launcher
```

See `tools/onnetpc-launcher/README.md` for install/uninstall instructions.

Default Moonlight path:

```text
C:\Program Files\Moonlight Game Streaming\Moonlight.exe
```

## Admin Notes

- Deleting an account is a soft delete. The row remains in `users`, but `is_active` becomes false and `deleted_at` is set.
- If a deleted user registers again with the same email, the same account is restored, marked unverified, and a new verification code is sent.
- Admin accounts cannot be deleted from the dashboard.
- `session_queue` is still active and should not be dropped; it supports queued starts when no matching PC is immediately available.

## Build And Verification

Backend package:

```powershell
.\mvnw.cmd clean package -DskipTests
```

Frontend build:

```powershell
cd frontend
npm run build
```

Production Docker build:

```powershell
docker build -t onnetpc .
```

## Security Checklist

- Rotate any secret that has appeared in chat, screenshots, or committed files.
- Keep PayPal, Resend, database, and JWT secrets in Render environment variables.
- Use a long random `APP_JWT_SECRET`.
- Verify a real email domain before opening registration to public users.
- Back up Aiven before running cleanup scripts.
