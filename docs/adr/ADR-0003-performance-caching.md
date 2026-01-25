# ADR-0003: Performance & Caching Strategy

**Status:** Accepted
**Date:** January 2026
**Decision:** Adopt defined performance budgets and implement caching baseline.

## Context
Performance budgets have been defined in `docs/PERFORMANCE_BUDGETS.md`. Current runtime lacks a documented caching strategy and explicit performance targets.

## Decision
**Adopt the defined performance budgets as a baseline and implement caching for public endpoints and static assets.**

**Rationale:**
- Performance budgets defined in `docs/PERFORMANCE_BUDGETS.md` provide measurable targets
- Next.js config already includes cache headers for static assets, images, fonts
- CDN (Vercel) provides edge caching for frontend
- Backend should implement API response caching where appropriate
- CI enforcement will be added once instrumentation is in place

## Consequences
- CI should enforce budgets once instrumentation is in place.
- API and frontend performance must be monitored with APM + Lighthouse CI.

## Actions
- [x] Document performance budgets in PERFORMANCE_BUDGETS.md
- [x] Configure Next.js cache headers for static assets, images, fonts
- [x] Enable ESLint enforcement for code quality
- [x] Enforce lint/test gates in CI/CD workflows
- [ ] Add APM instrumentation (future)
- [ ] Implement API response caching (future)
- [ ] Add Lighthouse CI for performance monitoring (future)
