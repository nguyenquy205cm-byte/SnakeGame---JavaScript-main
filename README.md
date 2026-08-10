# Snake Cloud — Snake Game with Authentication & Cloud-ready Backend

A complete Snake Game web application built with a modern cloud-ready architecture:

```
React (Frontend)
    ↓
Node.js + Express (Backend)
    ↓
Prisma (ORM)
    ↓
SQL Server / Azure SQL
```

Deployment target: **Microsoft Azure**

```
GitHub
  ↓
GitHub Actions (CI)
  ↓
Azure App Service (Backend + Static Frontend)
  ↓
Azure SQL Database
```

Observability:

```
Application Insights → telemetry
Azure Monitor       → metrics, logs, alerts
```

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Frontend](#frontend)
4. [Backend](#backend)
5. [Prisma & Database](#prisma--database)
6. [Authentication](#authentication)
7. [Roles: USER / ADMIN](#roles-user--admin)
8. [Environment Variables](#environment-variables)
9. [Local Setup](#local-setup)
10. [Database Migration](#database-migration)
11. [Seed Data](#seed-data)
12. [Build](#build)
13. [Tests](#tests)
14. [GitHub](#github)
15. [Azure Deployment Preparation](#azure-deployment-preparation)

---

## Project Overview

- **Snake Game** gameplay preserved from the original implementation (React + TypeScript).
- **Authentication**: register, login, logout, refresh token, current user.
- **Roles**: `USER` and `ADMIN` with role-based API authorization.
- **Leaderboard**, **Score History**, **Achievements**, and an **Admin Dashboard**.
- Scores are always attributed to the authenticated user from the JWT — never from a client-supplied `userId`.

## Architecture

- **Frontend**: React 19 + TypeScript + Vite + Axios + React Router.
- **Backend**: Node.js + Express 4 + TypeScript.
- **Database**: Prisma 5 ORM over **SQL Server / Azure SQL** (`provider = "sqlserver"`).
- **Auth**: JWT access token (short-lived) + rotating refresh token stored in an **HttpOnly** cookie.

## Frontend

Directory: project root (`package.json`), source in `src/`.

| Page | Route | Access |
| --- | --- | --- |
| Snake Game | `/` | Public |
| Leaderboard | `/leaderboard` | Public |
| Login | `/login` | Public |
| Register | `/register` | Public |
| Achievements | `/achievements` | Public (locked state if not logged in) |
| Score History | `/scores/history` | `USER` / `ADMIN` |
| Admin Dashboard | `/admin` | `ADMIN` only |

Key files:

- `src/context/AuthContext.tsx` — auth state (`currentUser`, `isAuthenticated`, `loading`, `login`, `register`, `logout`, `refreshToken`).
- `src/services/api.ts` — Axios client with `VITE_API_BASE_URL`, Bearer token injection, and automatic refresh-on-401.
- `src/services/authService.ts`, `scoreService.ts`, `achievementsService.ts`, `userService.ts`.
- `src/pages/*` — Home, Login, Register, Leaderboard, Score History, Achievements, Admin Dashboard.

## Backend

Directory: `backend/`.

Endpoints:

| Method | Path | Auth |
| --- | --- | --- |
| POST | `/api/auth/register` | Public (rate limited) |
| POST | `/api/auth/login` | Public (rate limited) |
| POST | `/api/auth/refresh` | Public (cookie) |
| POST | `/api/auth/logout` | Public (cookie) |
| GET | `/api/auth/me` | JWT |
| GET | `/api/health` | Public |
| GET | `/api/health/db` | Public (503 if database down) |
| GET | `/api/scores/top` | Public |
| GET | `/api/scores/history` | JWT (own scores) |
| GET | `/api/scores/:id` | JWT (owner or ADMIN) |
| POST | `/api/scores` | JWT (userId from token) |
| DELETE | `/api/scores/:id` | ADMIN |
| POST | `/api/game/sessions` | JWT |
| GET | `/api/game/sessions` | JWT (own sessions) |
| POST | `/api/game/sessions/:id/end` | JWT (owner or ADMIN) |
| GET | `/api/achievements` | Public |
| GET | `/api/achievements/me` | JWT |
| GET | `/api/admin/users` | ADMIN |
| PATCH | `/api/admin/users/:id` | ADMIN |
| GET | `/api/admin/scores` | ADMIN |
| GET | `/api/admin/achievements` | ADMIN |
| GET | `/api/admin/audit-logs` | ADMIN |

Error responses are JSON with `{ success: false, message, code }`. Stack traces are hidden in production.

## Prisma & Database

Schema: `backend/prisma/schema.prisma` with `provider = "sqlserver"` (Azure SQL compatible).

Models:

- `User`
- `Score`
- `GameSession`
- `Achievement`
- `UserAchievement`
- `RefreshToken`
- `AuditLog`

## Authentication

- Password hashing: **bcryptjs** (never store plaintext).
- Access token: short-lived JWT (`JWT_EXPIRES_IN`, default `15m`).
- Refresh token: longer-lived JWT (`JWT_REFRESH_EXPIRES_IN`, default `7d`) stored in an **HttpOnly** cookie and in the `RefreshToken` table. Refresh rotates the token (old token is replaced).
- The frontend stores only the access token in `localStorage` and automatically refreshes it on `401`.
- CORS allows credentials only for configured origins (`FRONTEND_URL` + local dev origins). `origin: "*"` is not used.

## Roles: USER / ADMIN

- `USER` — play, save scores, view own score history, view leaderboard, view own achievements.
- `ADMIN` — manage users (activate/deactivate), view all scores and achievements, view audit logs.
- Backend enforces this with `requireAuth` + `requireRole(...)` middlewares. The client cannot choose its own `userId`.

## Environment Variables

### Frontend

`.env` / `frontend/.env.example`:

```ini
VITE_API_BASE_URL=/api
```

Production:

```ini
VITE_API_BASE_URL=https://<your-app>.azurewebsites.net/api
```

### Backend

`backend/.env.example`:

```ini
PORT=4000
NODE_ENV=development
DATABASE_URL=sqlserver://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
APPLICATIONINSIGHTS_CONNECTION_STRING=   # optional
```

### Using DATABASE_URL

`DATABASE_URL` is a SQL Server connection string, e.g.:

```ini
DATABASE_URL="sqlserver://<host>:1433;database=<dbname>;user=<user>;password=<password>;encrypt=true;trustServerCertificate=true"
```

| Setting | Purpose |
| --- | --- |
| `host:1433` | Server address + port. Azure SQL: `<your-db>.database.windows.net:1433` |
| `database` | Database name |
| `user` / `password` | SQL login credentials |
| `encrypt=true` | Required by Azure SQL |
| `trustServerCertificate=true` | Accept self-signed certificates (local dev only) |

Local development can point `DATABASE_URL` at a local SQL Server (or Docker `mcr.microsoft.com/mssql/server`); swap it for the Azure SQL string in production. Prisma reads `DATABASE_URL` from `backend/.env`, but a variable set in the shell takes precedence over the `.env` file — handy for temporarily pointing Prisma at a different database without editing the file.

### WARNING: never commit secrets

- `.env` files (including `backend/.env` and `frontend/.env`) are excluded by `.gitignore`. Only `.env.example` templates are committed.
- **Never commit** a real `DATABASE_URL`, connection string, password, or JWT secret to GitHub.
- On Azure App Service, set the same values via **App Settings** (Application Settings) instead of a committed `.env` file.

## Local Setup

Prerequisites: Node.js 18+, SQL Server (local or Azure SQL) reachable.

> Note: Prisma connects over **TCP**. If you use a local SQL Server instance (e.g. `SQLEXPRESS`), make sure TCP/IP is enabled on it (or use Docker SQL Server) — Prisma cannot connect through Shared Memory / Named Pipes only.

```bash
# 1) Backend
cd backend
npm install
cp .env.example .env           # then fill DATABASE_URL, JWT secrets
npx prisma generate
npm run dev                    # http://localhost:4000

# 2) Frontend (from project root)
npm install
cp .env.example .env           # VITE_API_BASE_URL=/api
npm run dev                    # http://localhost:5173 (proxies /api to :4000)
```

## Database Migration

### Migration history (committed)

The initial migration is already created and stored at:

```
backend/prisma/migrations/20260810095512_init/migration.sql
```

It creates all 7 tables (`User`, `Score`, `GameSession`, `Achievement`, `UserAchievement`, `RefreshToken`, `AuditLog`) plus their indexes and foreign keys.

> **About `migration_lock.toml`:** the file contains `provider = "mssql"`. This is intentional. Prisma's schema engine identifies the SQL Server datasource internally as `mssql`, so the lock file must use `mssql` — writing `provider = "sqlserver"` there causes **error P3019** ("datasource provider `mssql` … does not match … `sqlserver`"). The `schema.prisma` datasource stays `provider = "sqlserver"` (never change it).

### How migrations are created

`prisma migrate dev` requires a **shadow database**. Azure SQL does not allow Prisma to create one automatically (error `P3020`), so **never run `prisma migrate dev` with `DATABASE_URL` pointing at Azure SQL**. Use one of these safe workflows instead:

> **Always run Prisma from `backend/`.** The repo root has no Prisma dependency, so `npx prisma …` from the root auto-downloads **Prisma 7**, which is incompatible with this project (error `P1012`: `url` is no longer allowed in `schema.prisma`, and `P3019`). From `backend/`, `npx prisma` resolves to the pinned **5.22.0**.

**Option A — Local SQL Server (recommended for daily work)**

Run a local SQL Server (or Docker SQL Server) and point `DATABASE_URL` at it. Prisma creates the shadow database locally and generates the migration there; the resulting `migration.sql` is deployed to Azure later with `migrate deploy`.

```bash
cd backend
# DATABASE_URL must point to LOCAL SQL Server (not Azure)
npx prisma migrate dev --name <migration_name>
```

**Option B — Generate SQL offline (no database needed)**

For the initial/baseline migration, or to produce a migration without any reachable database, use `prisma migrate diff` (this is how the initial migration was generated):

```bash
cd backend
mkdir -p prisma/migrations/<timestamp>_<name>

# Initial migration (from an empty database)
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/migrations/<timestamp>_<name>/migration.sql

# Next incremental change (from a saved copy of the old schema)
npx prisma migrate diff --from-schema-datamodel prisma/old_schema.prisma --to-schema-datamodel prisma/schema.prisma --script > prisma/migrations/<timestamp>_<name>/migration.sql
```

Always sanity-check the generated SQL by applying it to a throwaway local SQL Server database before committing.

### Deploying migrations to Azure SQL

```bash
cd backend
npx prisma generate
npx prisma migrate deploy
```

- `migrate deploy` applies only the **pending** migrations under `prisma/migrations/` in order and records them in the `_prisma_migrations` table.
- It does **not** use a shadow database, so it works fine on Azure SQL.
- Never run `prisma migrate dev`, `prisma migrate reset`, or `prisma db push` against the production Azure database.

## Seed Data

```bash
cd backend
npm run db:seed
```

Demo accounts (development only — do not use real passwords in production):

| Role | Email | Password |
| --- | --- | --- |
| ADMIN | `admin@example.com` | `Admin123!` |
| USER | `player1@example.com` | `Demo123!` |
| USER | `player2@example.com` | `Demo123!` |

The seed also creates sample scores, game sessions, achievements, and unlocks a few achievements for demo users.

## Build

```bash
# Backend
cd backend
npm run build          # tsc -> dist/server.js
npm start              # node dist/server.js

# Frontend
npm run build          # tsc -b && vite build -> dist/
```

## Tests

No automated test suite is included yet. Manual verification:

1. Register a new user.
2. Login (access token stored; refresh cookie set).
3. Play a game — the score is saved to the logged-in user.
4. Open `/admin` as `admin@example.com` (ADMIN) vs a regular user (redirected).

## GitHub

- `.gitignore` excludes `.env`, `node_modules`, `dist`, `build`, `coverage`, and TypeScript build info.
- CI workflow: `.github/workflows/ci.yml` — checkout → Node setup → install deps → `prisma generate` → build backend → build frontend. No secrets are embedded in the YAML.

## Azure Deployment Preparation

1. **Azure SQL Database** — provision, then set `DATABASE_URL` (SQL Server connection string) on the App Service.
2. **Azure App Service** — deploy the backend. `server.ts` binds `0.0.0.0` and honors `PORT`/`APP_PORT`.
3. **Static frontend** — either serve the Vite build via App Service / Storage Account + CDN, with `VITE_API_BASE_URL` pointing at the backend URL.
4. **CORS** — set `FRONTEND_URL` to the deployed frontend origin.
5. **Application Insights** — set `APPLICATIONINSIGHTS_CONNECTION_STRING` on the App Service. The backend uses structured logging ready for ingestion.
6. **Azure Monitor** — use the `/api/health` and `/api/health/db` endpoints for availability probes, plus request/error logs.
7. **CI/CD** — extend `.github/workflows/ci.yml` with an Azure deploy job once the App Service exists (use GitHub Secrets for connection strings, never commit them).

### Architecture diagram

```
React (Vite SPA)
  ↓  HTTPS / JSON + Bearer JWT
Express API (Azure App Service)
  ↓  Prisma
Azure SQL Database

GitHub → GitHub Actions → Azure App Service → Azure SQL
                              ↓
                    Application Insights → Azure Monitor
```
