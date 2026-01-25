# Performance Budgets

**Owner:** Platform Engineering
**Scope:** Frontend (web), Backend APIs, Images/CDN
**Review cadence:** Quarterly

## Goals
Establish measurable performance targets for the LaraibCreative platform. Budgets are set for mobile-first experiences on mid-tier devices and typical Pakistani network conditions.

## Web Vitals Targets (P75)
**Device profile:** Mid-tier Android, 4G

| Metric | Target | Warning | Failure |
| --- | --- | --- | --- |
| LCP | ≤ 2.5s | 2.5s–3.0s | > 3.0s |
| INP | ≤ 200ms | 200–300ms | > 300ms |
| CLS | ≤ 0.1 | 0.1–0.15 | > 0.15 |
| TTFB (SSR) | ≤ 500ms | 500–800ms | > 800ms |

## Page Weight Budgets
| Page Type | HTML (gz) | JS (gz) | CSS (gz) | Images (avg) |
| --- | --- | --- | --- | --- |
| Home | ≤ 30KB | ≤ 170KB | ≤ 25KB | ≤ 900KB |
| Product Listing | ≤ 30KB | ≤ 190KB | ≤ 25KB | ≤ 900KB |
| Product Detail | ≤ 35KB | ≤ 220KB | ≤ 30KB | ≤ 1.2MB |
| Cart/Checkout | ≤ 30KB | ≤ 200KB | ≤ 25KB | ≤ 600KB |
| Admin Dashboard | ≤ 35KB | ≤ 240KB | ≤ 30KB | ≤ 600KB |

## API Latency Budgets (P95)
| Endpoint Category | Target | Warning | Failure |
| --- | --- | --- | --- |
| Auth (login, refresh) | ≤ 350ms | 350–600ms | > 600ms |
| Products (listing) | ≤ 450ms | 450–800ms | > 800ms |
| Orders (create) | ≤ 600ms | 600–900ms | > 900ms |
| Admin (dashboard) | ≤ 700ms | 700–1200ms | > 1200ms |

## Error Rate Budgets
- **Frontend JS errors:** < 0.1% of sessions (P75)
- **API 5xx rate:** < 0.2% of requests (P95)
- **Checkout failures:** < 0.5% of checkout attempts

## Cache Targets
- **CDN cache hit rate:** ≥ 80% for static assets
- **API cache hit rate (public endpoints):** ≥ 50%

## Monitoring Guidance
- Lighthouse CI for web vitals on key routes
- API timing via APM (Sentry/Datadog/OpenTelemetry)
- Error tracking via Sentry

## Notes
- Budgets are enforced in CI once instrumentation exists.
- Use per-route budgets for known heavy pages (PDP, admin dashboard).
