# LaraibCreative Platform — Master Plan & Remediation Roadmap

_Authoritative engineering plan. Supersedes the ~100 historical `*_SUMMARY.md` / `PHASE_*.md`
docs in this repo (those are aspirational and should be archived — see Phase 5)._

Last updated: 2026-10-07

---

## 1. Executive summary

LaraibCreative is a custom ladies-suits e-commerce platform. The product is feature-rich
(70+ pages, admin dashboard, custom-order wizard, loyalty, reviews, blog) but has accumulated
**architectural debt from three unfinished database migrations** (MongoDB → TiDB → Supabase).
The result is a **split-brain data layer**: live code paths point at different, partially-wired
backends, which is the root cause of most of the reported "it doesn't work" symptoms
(sign-in, orders, admin upload, reviews).

This plan (a) names the canonical architecture, (b) maps each reported bug to a root cause,
(c) records the fixes already applied in this pass, and (d) lays out a phased roadmap to a
genuinely production-grade ("industry level") state.

---

## 2. Canonical architecture (the one true path)

Confirmed from `vercel.json`, `backend/server.js`, and the live env config:

| Layer        | Technology                         | Host                                   |
|--------------|------------------------------------|----------------------------------------|
| Frontend     | Next.js 14 (App Router), Zustand   | Vercel — `laraibcreative.studio`       |
| Backend API  | Express + Mongoose                 | Render — `laraibcreative-backend.onrender.com` |
| Database     | **MongoDB** (primary)              | MongoDB Atlas                          |
| Images       | Cloudinary                         | `res.cloudinary.com`                   |
| Auth         | JWT in httpOnly cookies            | issued by Express backend              |

Frontend talks to the backend via **axios** (`src/lib/axios.js`), base URL
`NEXT_PUBLIC_API_URL` → `.../api/v1`. All backend routes are mounted under `/api/v1/*`.

### Dead weight to remove (NOT part of the canonical path)
- `frontend/src/lib/tidb/*` — TiDB serverless client (abandoned migration). **Still wired into
  `src/app/api/reviews/route.ts`** → reviews are written to a DB nobody reads. Bug.
- `supabase/migrations/*` and `env.example`'s Supabase vars — abandoned migration.
- `backend` `mysql2` / `src/config/tidb.js` — unused alongside Mongoose.
- Git branches `feature/supabase-migration`, `integrate-tidb`, `mongodb-legacy` — stale.
- Mock Next.js API routes that shadow real backend endpoints (removed this pass — see §4).

---

## 3. Reported issues → root causes

| # | Reported symptom | Root cause | Status |
|---|------------------|-----------|--------|
| 1 | **Sign-in fails / nothing happens** | `authStore.login()` returned a `User` object and **threw** on failure, but `login/page.tsx` and the unit test expect `{ success, user?, error? }`. A successful login therefore fell into the "failed" branch. | **FIXED** (§4) |
| 2 | **"Remember me" ignored** | `useAuth` login wrapper dropped the 3rd `rememberMe` argument. | **FIXED** (§4) |
| 3 | **Admin can't upload products / images** | FormData posts manually set `Content-Type: multipart/form-data` (no boundary); combined with the axios instance's default `application/json`, axios serialized the upload to JSON. Multer on the backend received no file. | **FIXED** (§4) |
| 4 | **Orders don't load / save** | Mock Next route `src/app/api/orders/route.js` returned an empty list / fake id and shadowed the real backend route. | **FIXED** (removed, §4) — _verify runtime once backend reachable_ |
| 5 | **Reviews don't appear** | `src/app/api/reviews/route.ts` writes to **TiDB**, not the MongoDB backend. | Planned — Phase 1 |
| 6 | **Filters / search "don't work"** | Backend filter logic (`productController.js`) is actually implemented (regex on title/sku/keywords; fabric/price/occasion/availability). Most likely a **data-shape or empty-DB** symptom, or the `$or` (search) colliding with `orConditions` (fabric/occasion). Needs runtime verification against a seeded DB. | Needs verification — Phase 1 |
| 7 | **Gaps between UI/UX across pages** | Two design languages coexist: a refined `bone/ink/champagne` + `font-display` system (e.g. login) vs. a legacy `rose/gold` + `font-playfair` system (e.g. register). Inconsistent spacing, buttons, shadows. | Planned — Phase 3 |

---

## 4. Fixes applied in this pass

All in `frontend/`, verified against `tsc --noEmit` (0 errors) and `next build`:

1. **`src/store/authStore.ts`** — `login()` now returns
   `{ success: boolean; user?: User; error?: string }` and never throws; interface updated to
   match. Aligns with `login/page.tsx` and `__tests__/hooks/useAuth.test.tsx`.
2. **`src/hooks/useAuth.ts`** — login wrapper forwards `rememberMe`.
3. **`src/lib/axios.js`** — request interceptor now strips `Content-Type` for any `FormData`
   body so the browser sets `multipart/form-data` **with boundary**. Fixes all file uploads
   (products, banners, images) centrally.
4. **Removed mock landmine routes** that shadowed the real backend:
   `api/auth/login`, `api/auth/register`, `api/auth/logout`, `api/orders`, `api/orders/[id]`.

---

## 5. Phased roadmap to "industry level"

### Phase 1 — Correctness & data-layer unification (highest priority)
- Repoint `api/reviews/route.ts` to the backend `/api/v1/reviews` (or have `ReviewForm` call
  axios directly), then delete `src/lib/tidb/*`.
- Delete remaining TiDB/Supabase/mysql2 dead code and stale git branches.
- Seed a staging MongoDB and **verify end-to-end at runtime**: sign-up, sign-in, product list,
  search, each filter, cart, checkout, order creation, order history, admin product CRUD + image
  upload, admin order status updates.
- Standardise the frontend↔backend response contract (`{ success, data, pagination, message }`)
  and centralise response parsing (today pages defensively read `data.products || data.data`).

### Phase 2 — Reliability & security hardening
- Add a shared API response type + Zod validation on the frontend boundary.
- Verify JWT refresh-token rotation and admin route guards (`protect` / role checks) on every
  `/admin/*` backend route.
- Rate-limit + input-sanitise all mutating endpoints (several already present — audit coverage).
- Wire Sentry (already a dependency) on both apps; add health-check alerting.

### Phase 3 — UI/UX unification
- Adopt a single design system (recommend the `bone/ink/champagne` + `font-display` tokens).
  Migrate legacy `rose/gold/playfair` pages (register, many `(customer)` `.js` pages).
- Standardise shared primitives: Button, Input, Card, Toast, form field + error states.
- Accessibility pass (labels, focus states, colour contrast, alt text) and responsive audit.
- Consistent loading / empty / error states for every data view.

### Phase 4 — Performance & SEO
- Convert client-only pages that can be server-rendered; verify ISR where used.
- Image optimisation via Cloudinary transforms + `next/image` everywhere.
- Lighthouse budget in CI; fix CLS/LCP regressions.

### Phase 5 — Repo hygiene & CI
- Archive the ~100 historical `*_SUMMARY.md` / `PHASE_*.md` docs into `docs/archive/`; keep
  `README`, `ARCHITECTURE`, `DEPLOYMENT`, this plan, and the API docs.
- Delete helper scripts that were one-off fixes (`fix-*.js`, `fix-*.ps1`, `cleanup-*.js`).
- CI pipeline: `type-check` + `lint` + unit tests + `build` on every PR; block merge on failure.
- Re-enable ESLint during builds (currently disabled) after fixing violations.

---

## 6. Verification notes / open risks

- The fixes above are verified at **code level** (type-check + production build). **Runtime
  end-to-end verification requires a reachable backend + seeded MongoDB**, which this
  environment does not have. Phase 1 must re-test the full flows against staging.
- `next.config.js` disables ESLint during builds — real lint issues are currently hidden.
- Secrets: confirm no live credentials are committed (there are `CREDENTIALS_UPDATED.txt`,
  `.env.render` files to review and, if needed, rotate).
