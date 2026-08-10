# Project Audit — Snake Cloud

Trạng thái cuối sau khi hoàn thiện (đã scan toàn bộ source).

## Đã có gì

### Frontend (root — React + TypeScript + Vite)
- Game Snake giữ nguyên gameplay gốc (`src/utils/gameEngine.ts`, `src/hooks/useSnake.ts`).
- Routing: `/`, `/login`, `/register`, `/leaderboard`, `/scores/history`, `/achievements`, `/admin`.
- `AuthContext.tsx` quản lý `currentUser`, `isAuthenticated`, `loading`, `login/register/logout/refreshToken/loadCurrentUser`.
- Axios client tự gắn `Authorization: Bearer <accessToken>` và tự refresh + retry khi nhận `401`.
- Trang: Home, LoginPage, RegisterPage, Leaderboard, ScoreHistory, Achievements, AdminDashboard.
- Score được gửi dạng `{ score, level }` — backend lấy `userId` từ JWT. Không còn `VITE_DEMO_USER_ID`.
- `VITE_API_BASE_URL` dùng cho local (`/api` + Vite proxy) và production (Azure URL qua env).

### Backend (`backend/` — Node + Express + TypeScript)
- Config đọc `PORT || APP_PORT || 4000`; bind `0.0.0.0` (Azure App Service ready).
- CORS theo env `FRONTEND_URL` + localhost dev origins, `credentials: true`.
- Auth: `POST /auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `GET /auth/me`.
- JWT access (15m) + refresh (7d) rotate; refresh token HttpOnly cookie + lưu DB; bcrypt hash.
- Middleware: `requireAuth`, `requireRole(...)`, `errorHandler`, `notFoundHandler`, `scoreValidation`, `requestLogger`, `authRateLimiter`.
- Score/GameSession/Achievement lấy `userId` từ JWT. Admin API được bảo vệ `requireRole('ADMIN')`.
- Health: `GET /api/health` (`{ status, service, uptime }`), `GET /api/health/db` (503 nếu DB lỗi).
- Audit log: REGISTER, LOGIN, CREATE_SCORE, CREATE_GAME_SESSION, END_GAME_SESSION, DELETE_SCORE, ADMIN_UPDATE_USER, SEED_DATABASE.
- Admin API: `GET /admin/users`, `PATCH /admin/users/:id`, `GET /admin/scores`, `GET /admin/achievements`, `GET /admin/audit-logs`.

### Database (Prisma 5, provider `sqlserver`)
- Models: `User`, `Score`, `GameSession`, `Achievement`, `UserAchievement`, `RefreshToken`, `AuditLog`.
- Seed dùng bcrypt cho demo accounts, tạo users/achievements/scores/sessions/userAchievements/audit logs.

### Khác
- `.github/workflows/ci.yml` (checkout, node setup, npm ci, prisma generate, build backend + frontend).
- `backend/.env.example`, `frontend/.env.example`, root `.env.example`.
- `.gitignore` chặn `.env`, `node_modules`, `dist`, `build`, `coverage`, `*.tsbuildinfo`.
- README cập nhật cloud-ready.
- Build backend `npm run build` → `dist/server.js`, start `npm start`.

## Thiếu gì / Cần làm khi deploy

- **Migration**: chưa có thư mục `prisma/migrations` (cần DB SQL Server thật để chạy `npx prisma migrate dev --name init`). Production dùng `npx prisma migrate deploy`.
- **Test tự động**: chưa có test suite (`npm test` chưa tồn tại) — xác nhận thủ công trong FINAL_CHECKLIST.
- **Auto-unlock achievement**: backend chưa tự mở achievement khi đạt điều kiện (seed tạo sẵn vài UserAchievement). Có thể bổ sung sau.
- **Application Insights**: chưa cài package — chỉ chuẩn bị env `APPLICATIONINSIGHTS_CONNECTION_STRING` + structured logging.
- **CI/CD deploy Azure**: workflow deploy chưa tạo (cần App Service thật + GitHub Secrets).
- **Rate limit** chỉ áp dụng cho login/register (auth) — chưa áp dụng global.

## File đã sửa
- `backend/package.json` (bỏ `@prisma/cli` không tồn tại; thêm `express-rate-limit`)
- `backend/src/controllers/authController.ts` (cookie typing, `/auth/me` trả user đầy đủ)
- `backend/src/controllers/healthController.ts` (503 khi DB lỗi)
- `backend/src/services/authService.ts` (fix TS jwt types)
- `backend/src/services/healthService.ts`, `backend/src/services/userService.ts`, `backend/src/services/scoreService.ts`, `backend/src/services/achievementService.ts`
- `backend/src/middlewares/authMiddleware.ts` (bỏ unused)
- `backend/src/server.ts` (bind `0.0.0.0`)
- `backend/src/app.ts` (request logger)
- `backend/src/routes/authRoutes.ts`, `backend/src/routes/adminRoutes.ts`
- `backend/src/controllers/adminController.ts` (thêm endpoints admin)
- `backend/prisma/seed.ts` (bcrypt demo accounts)
- `src/services/api.ts` (refresh interceptor + friendly error)
- `src/services/authService.ts` (register trả đúng shape + lưu token)
- `src/context/AuthContext.tsx` (register set đúng user)
- `src/hooks/useSnake.ts` (bỏ DEMO_USER_ID, gửi `{score, level}`)
- `src/App.tsx` (routing + AuthProvider + ProtectedRoute)
- `src/pages/LoginPage.tsx`, `RegisterPage.tsx` (hiện lỗi server), `AdminDashboard.tsx`
- `src/styles.css` (nav/auth/admin styles)
- `.env.example`, `.gitignore`, `README.md`, `PROJECT_AUDIT.md`

## File đã tạo
- `backend/src/middlewares/requestLogger.ts`
- `backend/src/middlewares/authRateLimiter.ts`
- `src/components/Navbar.tsx`, `src/components/Layout.tsx`, `src/components/ProtectedRoute.tsx`
- `src/services/achievementsService.ts`
- `src/pages/Leaderboard.tsx`, `src/pages/ScoreHistory.tsx`, `src/pages/Achievements.tsx`
- `frontend/.env.example`
- `.github/workflows/ci.yml`
- `FINAL_CHECKLIST.md`

## Thay đổi ảnh hưởng database
- Không đổi schema/provider (vẫn `sqlserver`).
- Seed mới: bcrypt hash cho demo accounts, email `admin@example.com`, `player1@example.com`, `player2@example.com`, userAchievements mẫu.

## Thay đổi cho Azure
- Backend bind `0.0.0.0`, ưu tiên `PORT`.
- CORS theo `FRONTEND_URL`.
- Frontend dùng `VITE_API_BASE_URL`.
- `/api/health` + `/api/health/db` cho Azure Monitor probes.
- CI workflow `.github/workflows/ci.yml`.
- Application Insights qua env (chưa cài package).
