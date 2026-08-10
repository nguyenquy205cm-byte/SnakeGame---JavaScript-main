# Final Checklist — Snake Cloud

Legend:
- `[x]` — verified in this session (build / lint / prisma / smoke test).
- `[ ]` — code is implemented, but requires a reachable SQL Server + running app to verify (no DB was available locally).

## Build & Tooling

- [x] Frontend build (`npm run build`) — passes
- [x] Backend build (`npm run build` in `backend/`) — passes
- [x] Prisma validate (`npx prisma validate`) — passes
- [x] Prisma generate (`npx prisma generate`) — passes
- [x] Lint (`npm run lint`) — passes
- [ ] Frontend test (`npm test`) — no test suite exists yet
- [ ] Backend test (`npm test`) — no test suite exists yet

## API smoke test (backend started, no DB)

- [x] `GET /api/health` → `{"status":"ok","service":"snake-cloud-api",...}` (HTTP 200)
- [x] `GET /api/health/db` → HTTP 503 when database is unreachable
- [x] Unknown route → HTTP 404 JSON
- [x] Server binds `0.0.0.0` and honors `PORT` / `APP_PORT`

## Authentication (requires running app + SQL Server)

- [ ] Register (`POST /api/auth/register`) — validation, bcrypt hash, USER role default, no passwordHash returned
- [ ] Login (`POST /api/auth/login`) — verifies credentials + isActive, issues access + refresh tokens
- [ ] Logout (`POST /api/auth/logout`) — revokes refresh token
- [ ] Refresh (`POST /api/auth/refresh`) — rotates refresh token
- [ ] `/auth/me` (`GET`) — returns current user without passwordHash
- [ ] Duplicate email/username rejected (409)
- [ ] Weak password / invalid email rejected (400)

## Authorization

- [ ] USER can create score (`POST /api/scores`) with `userId` taken from JWT
- [ ] Score belongs to the logged-in user (no client-supplied `userId`)
- [ ] USER can only view their own score history
- [ ] USER cannot access admin APIs (403)
- [ ] ADMIN can access admin APIs
- [ ] `GET /api/admin/users`, `PATCH /api/admin/users/:id`, `GET /api/admin/scores`, `GET /api/admin/achievements`, `GET /api/admin/audit-logs`
- [ ] Admin actions are written to audit log

## Game & Data

- [ ] Leaderboard (`GET /api/scores/top`)
- [ ] Game sessions (`POST /api/game/sessions`, `GET /api/game/sessions`, `POST /api/game/sessions/:id/end`)
- [ ] Achievements (`GET /api/achievements`, `GET /api/achievements/me`)
- [ ] Score submission from the game only when authenticated (no `DEMO_USER_ID` in source)

## Frontend

- [x] Snake Game gameplay preserved
- [x] Routing: `/`, `/login`, `/register`, `/leaderboard`, `/scores/history`, `/achievements`, `/admin`
- [x] Navbar: Login/Register when logged out; username + Play/Leaderboard/Score History/Achievements/Logout when logged in; Admin Dashboard for ADMIN
- [x] Access token auto-refresh on 401 + request retry
- [x] Friendly server error messages on login/register
- [ ] End-to-end login → play → score saved to logged-in user (needs DB + running app)

## Cloud / Ops

- [x] Backend uses `process.env.PORT || process.env.APP_PORT || 4000`
- [x] CORS driven by `FRONTEND_URL` + local dev origins (credentials allowed, no `origin: "*"`)
- [x] Frontend API base from `VITE_API_BASE_URL`
- [x] Backend `.env.example` (DATABASE_URL, JWT secrets, FRONTEND_URL, PORT, ...)
- [x] Frontend `.env.example` (`VITE_API_BASE_URL`)
- [x] `.gitignore` excludes `.env`, `node_modules`, `dist`, `build`, `coverage`, `*.tsbuildinfo`
- [x] GitHub Actions CI (`.github/workflows/ci.yml`) — install → prisma generate → build backend + frontend
- [x] Application Insights ready via `APPLICATIONINSIGHTS_CONNECTION_STRING` env (structured logging; package not installed yet)
- [x] Azure Monitor ready (health endpoints, request logging, error logging)
- [x] README documents architecture, setup, seed accounts, Azure steps

## Database

- [ ] Initial migration created (`npx prisma migrate dev --name init`) — requires a reachable SQL Server; production uses `npx prisma migrate deploy`
- [ ] Seed run (`npm run db:seed`) — creates admin + player demo accounts with bcrypt passwords

## Demo accounts (local development only)

| Role | Email | Password |
| --- | --- | --- |
| ADMIN | `admin@example.com` | `Admin123!` |
| USER | `player1@example.com` | `Demo123!` |
| USER | `player2@example.com` | `Demo123!` |
