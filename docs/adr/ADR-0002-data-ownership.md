# ADR-0002: Data Ownership / Source of Truth

**Status:** Accepted
**Date:** January 2026
**Decision:** MongoDB is the single source of truth for all transactional data.

## Context
The repository contains:
- MongoDB models used by the Express backend
- Supabase schema/migrations for product, cart, and profile data
- Roadmap documents describing a hybrid Supabase + TiDB architecture

This creates an unclear data ownership model.

## Decision
**MongoDB is the single source of truth for all transactional data until the hybrid migration is executed.**

**Rationale:**
- Current backend uses MongoDB with Mongoose for all data models
- No Supabase database tables are currently in use (Supabase only used for storage)
- Future hybrid architecture (Supabase + TiDB) is documented in roadmap but not yet implemented
- Clear data ownership prevents sync issues and confusion

## Consequences
- Data sync is required if Option B is chosen.
- Documentation and services must reflect the selected source of truth.

## Actions
- [x] Document MongoDB as current source of truth
- [x] Clarify that Supabase is used only for storage (not database)
- [x] Keep hybrid architecture as roadmap target for future migration
- [x] Update documentation to reflect current runtime state
