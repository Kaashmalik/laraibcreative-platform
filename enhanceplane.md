# LaraibCreative Enhancement Plan (enhanceplane.md)

**Repo:** `laraibcreative-platform` (monorepo)  
**Generated:** 2026-01-25  

## 1) Why this document exists
This file is the **single practical plan** to stabilize, simplify, and scale the codebase.

Primary goals:
- **Stability:** remove runtime inconsistencies (auth, API client contract, i18n routing)
- **Clarity:** one clear entrypoint per app, one clear source of truth per concern
- **Scalability:** a clean path to hybrid data (MongoDB / TiDB / Supabase) without breaking MVP

---

## 2) Current codebase map (what lives where)

### 2.1 Frontend (Next.js)
- **Root:** `frontend/`
- **Framework:** Next.js `14.x` (App Router)
- **Entry layout:** `frontend/src/app/layout.tsx`
- **Routes:** `frontend/src/app/**`

Key modules:
- **API client:**
  - `frontend/src/lib/axios.js` (axios instance + interceptors)
  - `frontend/src/lib/api.js` (endpoint wrapper object)
  - `frontend/src/lib/constants.js` (`API_BASE_URL` builder)
- **Auth (current):**
  - `frontend/src/store/authStore.ts`
  - `frontend/src/hooks/useAuth.ts`
  - `frontend/src/components/shared/ProtectedRoute.jsx`
- **i18n (next-intl):**
  - `frontend/middleware.ts`
  - `frontend/src/i18n/routing.ts`
  - `frontend/src/i18n/request.ts`
  - `frontend/src/i18n/config.ts`
  - `frontend/messages/en.json`, `frontend/messages/ur.json`
- **State management:** `frontend/src/store/*` (Zustand)
- **Server-side / “full-stack” pieces:**
  - `frontend/src/app/actions/*` (Server Actions)
  - `frontend/src/lib/tidb/*` + `frontend/src/lib/tidb/connection.ts`
  - `frontend/src/server/*` (tRPC)

### 2.2 Backend (Express)
- **Root:** `backend/`
- **Primary entrypoint used by scripts:** `backend/server.js` (used by `npm run dev`)
- **Alternative entrypoint present:** `backend/src/server.js` (not currently wired as main)

Key modules:
- **Routes index:** `backend/src/routes/index.js` (mounted at `/api`, version prefix `/v1`)
- **Auth + cookies:**
  - `backend/src/controllers/authController.js`
  - `backend/src/middleware/auth.middleware.js` (httpOnly cookies: `accessToken`, `refreshToken`)
- **Database:**
  - MongoDB: `backend/src/config/db.js`
  - DB wrapper: `backend/src/config/database.js` (currently Mongo-only)
  - TiDB config (partial): `backend/src/config/tidb.js`
- **Core domains:** `backend/src/controllers/*`, `backend/src/models/*`, `backend/src/routes/*`

### 2.3 Infrastructure / docs
- **CI/CD:** `.github/workflows/*`
- **Nginx:** `nginx.conf`
- **Docker:** `docker-compose.yml`, `frontend/Dockerfile`, `backend/Dockerfile`
- **Hybrid roadmap docs:** `docs/ROADMAP_OVERVIEW.md` (+ phase docs)

---

## 3) Key findings (high-impact issues to fix)

### 3.1 API client contract mismatch (front-end)
`frontend/src/lib/axios.js` **returns `response.data` directly** in its response interceptor.

But several call-sites still use axios-style `response.data.*`, for example:
- `frontend/src/store/authStore.ts`
- `frontend/src/lib/loyalty/index.ts`
- `frontend/src/store/wishlist-store.ts`

**Impact:** login, loyalty, wishlist, and other calls can silently break (undefined reads).

### 3.2 Auth surfaces are duplicated
Multiple “auth paths” exist:
- **Backend REST auth** (real): `/api/v1/auth/*` + httpOnly cookies
- **Frontend Next route**: `frontend/src/app/api/auth/me/route.ts` currently returns a **mock user**
- **Frontend tRPC router**: `frontend/src/server/routers/auth.ts` (incomplete / inconsistent)

**Impact:** different parts of the UI can disagree about whether the user is logged in.

### 3.3 i18n middleware enabled but App Router not structured for locales
- `frontend/middleware.ts` enables next-intl middleware.
- `frontend/next.config.js` notes next-intl plugin is disabled and `[locale]` routing is disabled.
- There is **no** `frontend/src/app/[locale]/...` route segment.

**Impact:** locale-prefixed routes like `/ur/...` can 404 or behave inconsistently.

### 3.4 Backend has two server entrypoints
- `backend/server.js` and `backend/src/server.js` both exist and both look “real”.

**Impact:** fixes may get applied to the wrong entrypoint; production vs dev can diverge.

### 3.5 TiDB migration is incomplete / inconsistent
- Backend contains TiDB services (`backend/src/services/productService.js`, `categoryService.js`) but controllers still use Mongo models.
- `backend/src/services/*Service.js` imports helpers from `backend/src/config/tidb.js` using names that do not exist (export mismatch).

**Impact:** TiDB path is likely broken if enabled; confusing “half-migrated” state.

### 3.6 Node version mismatch in tooling
- `frontend/package.json` requires Node `22.x`
- GitHub workflows use Node `18`

**Impact:** CI/CD may pass locally but fail in pipelines (or vice versa).

### 3.7 Cookie-based auth depends on domain strategy
Backend cookies are `SameSite: 'lax'`.

**Good:** works well when API is on same “site” (e.g., `api.laraibcreative.com` and `laraibcreative.com`).

**Risk:** if frontend is on `laraibcreative.com` but API stays on `*.onrender.com`, cookies may not behave as expected.

---

## 4) Decisions to make (to avoid future rewrites)
You should pick these explicitly.

### 4.1 One API approach
Choose one:
- **Option A (recommended for now):** REST via `frontend/src/lib/axios.js` + backend Express `/api/v1/*`
- **Option B:** tRPC (then remove/stop using REST wrappers)

### 4.2 One auth approach
Choose one:
- **Option A (current reality):** Backend JWT + httpOnly cookies (recommended to finish)
- **Option B:** Supabase Auth (requires adding supabase clients + session handling)

### 4.3 One “data backbone” for Products/Orders
Choose one:
- **Option A (MVP):** MongoDB for everything (ship fast)
- **Option B (Hybrid):** MongoDB for users/auth + TiDB for catalog/orders/analytics (align with `docs/ROADMAP_OVERVIEW.md`)
- **Option C (Next.js full-stack):** Next.js Server Actions/Route Handlers as primary API; Express becomes optional

### 4.4 i18n routing strategy
Choose one:
- **Option A:** Fully implement `next-intl` with `[locale]` routes
- **Option B:** Disable next-intl middleware for now and run English-only until Phase 2

---

## 5) Enhancement roadmap (prioritized)

### 5.1 Phase 0 (0-2 days) — Stabilize correctness
- **[Fix API client contract]**
  - Decide whether `axiosInstance` should return full axios response or `response.data`.
  - Then update all call-sites to match.
  - Focus files:
    - `frontend/src/lib/axios.js`
    - `frontend/src/store/authStore.ts`
    - `frontend/src/lib/loyalty/index.ts`
    - `frontend/src/store/wishlist-store.ts`
- **[Remove mock auth]**
  - Replace or remove `frontend/src/app/api/auth/me/route.ts` (mock user).
  - Ensure the whole app uses `/api/v1/auth/me` as the source of truth.
- **[tRPC decision]**
  - If you keep tRPC: fix `frontend/src/server/routers/auth.ts` (imports + error variables) and ensure it proxies cookies correctly.
  - If you don’t: remove/disable server router usage to avoid “two auth systems”.
- **[Smoke tests]**
  - Verify:
    - login/register/logout
    - refresh token flow
    - wishlist sync
    - protected route navigation

**Acceptance criteria:** No `undefined` reads from API responses; auth status is consistent across UI.

### 5.2 Phase 1 (3-10 days) — Architecture cleanup
- **[Backend entrypoint consolidation]**
  - Pick **one** of:
    - `backend/server.js` (current scripts use this)
    - `backend/src/server.js` (more modular)
  - Delete/retire the other entrypoint after verifying parity.
- **[Standard response schema]**
  - Ensure backend responds consistently:
    - `{ success: boolean, data?: any, message?: string, errors?: string[] }`
- **[i18n alignment]**
  - Either:
    - Implement `[locale]` routes + provider + RTL handling, or
    - Disable i18n middleware until ready.

**Acceptance criteria:** One backend entrypoint; i18n is either fully working or explicitly disabled.

### 5.3 Phase 2 (2-6 weeks) — Data layer direction (Mongo-only or Hybrid)

Pick one track.

#### Track A: MongoDB-first (MVP)
- **[Remove/feature-flag TiDB code paths]**
  - Keep TiDB code in a folder/feature flag if you want it later.
  - Update docs to reflect MongoDB as source of truth.

#### Track B: Hybrid (TiDB for catalog/orders)
- **[Fix TiDB backend integration]**
  - Fix `backend/src/config/tidb.js` exports vs imports in `backend/src/services/*Service.js`.
  - Route controllers to use service layer (not Mongo models) for catalog endpoints.
- **[Migration strategy]**
  - Define table schema, seeding, and backward compatibility.

**Acceptance criteria:** Only one authoritative store per domain (products/orders/etc), and the API reflects it.

### 5.4 Phase 3 (1-3 months) — Quality, performance, and product scale
- **[TypeScript migration]**
  - Convert remaining `.jsx` to `.tsx` where appropriate (example: `frontend/src/context/ThemeContext.jsx`).
- **[Testing hardening]**
  - Ensure CI runs:
    - frontend type-check + unit tests
    - backend tests
    - Playwright E2E for critical flows
- **[Performance & SEO]**
  - Confirm image pipeline (Cloudinary loader) + caching headers match actual route behavior.
  - Add bundle analysis targets, reduce admin bundle weight via dynamic imports.

---

## 6) Practical guidance (how to implement without breaking production)

### 6.1 Golden rules for this repo
- **[One source of truth]**
  - Auth: one provider.
  - API: one client contract.
  - Backend: one entry file.
  - Data: one authoritative DB per domain.
- **[Make changes in small slices]**
  - Prefer fixing contracts (types/response shape) before refactors.

### 6.2 Recommended “contract” for frontend API calls
Pick one and enforce everywhere:
- **Option A:** `axiosInstance` returns `{ success, data, message }` (data-only)
- **Option B:** `axiosInstance` returns axios response object

Then:
- Update store/actions/hooks to match.
- Add a short “API contract” section to your main README later.

### 6.3 Cookie auth deployment guidance
- **If frontend and API are same-site** (recommended):
  - Use `api.laraibcreative.com` + `laraibcreative.com`.
  - `SameSite=Lax` is usually OK.
- **If API is on a different site** (e.g., `onrender.com`):
  - You likely need `SameSite=None; Secure` for cookies.
  - Ensure CORS allows credentials and origin is not `*`.

---

## 7) Quick reference: “Where do I change X?”
- **Auth cookies + JWT:** `backend/src/middleware/auth.middleware.js`
- **Auth endpoints:** `backend/src/controllers/authController.js`
- **Frontend auth state:** `frontend/src/store/authStore.ts` + `frontend/src/hooks/useAuth.ts`
- **API client:** `frontend/src/lib/axios.js` + `frontend/src/lib/constants.js`
- **i18n routing config:** `frontend/src/i18n/routing.ts` + `frontend/middleware.ts`
- **Backend API routes list:** `backend/src/routes/index.js`

---

## 8) Suggested next action (if you want me to implement)
If you want, tell me which direction you prefer and I will implement it safely:
- **Option 1:** Fix the axios contract mismatch + remove mock auth route (fastest stability win)
- **Option 2:** Implement proper `next-intl` `[locale]` routing (bigger refactor)
- **Option 3:** Consolidate backend entrypoint and remove duplication

