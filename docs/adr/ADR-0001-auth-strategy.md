# ADR-0001: Authentication Strategy

**Status:** Accepted
**Date:** January 2026
**Decision:** Backend JWT with httpOnly cookies is the single source of truth for authentication.

## Context
The codebase currently shows a mix of authentication approaches:
- Backend JWT with httpOnly cookies
- Frontend localStorage token utilities
- Supabase types and historical auth contexts in documentation

This creates risk of inconsistent session handling and unclear ownership.

## Decision
**Backend JWT with httpOnly cookies is the single source of truth for authentication.**

**Rationale:**
- Aligns with current backend implementation (`backend/src/middleware/auth.middleware.js`)
- Fits existing Axios `withCredentials: true` usage
- More secure than localStorage-based token storage
- No Supabase auth integration needed (Supabase only used for storage in current architecture)

## Consequences
- All UI, middleware, and API clients must follow the chosen auth system.
- Remove or deprecate the unused auth code paths.

## Actions
- [x] Remove tokens from backend auth responses (login, register, refresh)
- [x] Update frontend AuthResponse type to remove token fields
- [x] Deprecate localStorage token utilities in frontend
- [x] Remove localStorage token cleanup from admin layout
- [x] Update tests to use Zustand store instead of localStorage
- [x] Enforce lint/test gates in CI/CD workflows
- [x] Enable ESLint enforcement in Next.js config
