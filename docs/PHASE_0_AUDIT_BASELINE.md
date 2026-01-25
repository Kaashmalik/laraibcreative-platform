# Phase 0 Audit & Baseline (Week 1)

**Date:** January 2026

## Purpose
Establish the current-state baseline for architecture, dependencies, authentication, data ownership, and performance targets. This document does **not** change code; it records the decisions and gaps that must be resolved before refactoring work begins.

## Scope
- Dependency & runtime audit (Node, Next.js, backend runtime)
- Authentication strategy confirmation
- Database source-of-truth documentation
- Performance budgets
- ADRs for architecture decisions

## Existing Audit Artifacts
These reports already exist and should be treated as historical context for Phase 0:
- `COMPREHENSIVE_AUDIT_REPORT.md`
- `SECURITY_AUDIT_REPORT.md`
- `FINAL_AUDIT_SUMMARY.md`
- `AUDIT_FIXES_SUMMARY.md`
- `PHASE_1_AUDIT_REPORT.md`

## Current Baseline (Observed)
### Frontend
- Next.js 14.x (App Router)
- Node engine: `22.x` (frontend `package.json`)
- Axios configured for `withCredentials: true` (httpOnly cookie auth)
- Local token utilities still exist (`frontend/src/lib/auth.js`, `STORAGE_KEYS.AUTH_TOKEN`)

### Backend
- Express.js (Node `>=18.20.0`)
- JWT auth with httpOnly cookies in `backend/src/middleware/auth.middleware.js`
- MongoDB as primary DB in production runtime today

### Documentation & Roadmap
- `docs/ROADMAP_OVERVIEW.md` proposes a **hybrid Supabase + TiDB** future architecture
- `docs/PHASE_0_1_INFRASTRUCTURE.md` outlines TiDB setup and Supabase schema work

## Open Decisions (Must Confirm)
1. **Auth Strategy**: Backend JWT vs Supabase Auth (see ADR-0001)
2. **Data Ownership**: MongoDB-only now vs hybrid (see ADR-0002)
3. **Caching & Performance Targets**: Budgets + caching plan (see ADR-0003, performance budgets doc)

## Dependency & Runtime Audit (Phase 0 Summary)
- **Frontend Node**: `22.x`
- **Backend Node**: `>=18.20.0`
- **Next.js**: 14.x (target upgrade to 15 in roadmap)

**Action:** Align runtime targets (Node 20/22 LTS) across frontend + backend and document the chosen baseline.

## Performance Budgets
See `docs/PERFORMANCE_BUDGETS.md` for target Core Web Vitals, API latency, and asset size budgets.

## Deliverables Produced in Phase 0
- ADRs (architecture decision records)
- Performance budgets
- README updates for full-stack overview and docs

## Next Steps
- Confirm auth strategy decision (ADR-0001)
- Confirm database source-of-truth (ADR-0002)
- Confirm caching/performance strategy and budgets (ADR-0003)
- Update README and docs index to reference these decisions
