# LaraibCreative Implementation Roadmap 2025
## Hybrid Architecture: Supabase + TiDB Cloud

**Branch:** `integrate-tidb`  
**Timeline:** 12-16 Weeks  

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                 CLOUDFLARE CDN                       │
└─────────────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────────────┐
│          VERCEL (Next.js 15 Full-Stack)             │
│  Server Actions │ API Routes │ Edge Middleware       │
└─────────────────────────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
┌───────────────┐           ┌───────────────────┐
│   SUPABASE    │           │   TiDB CLOUD      │
│ • Auth        │  sync     │ • Products        │
│ • Profiles    │◄─────────►│ • Orders          │
│ • Cart        │           │ • Analytics       │
│ • Storage     │           │ • Reviews         │
│ • Realtime    │           │ • Inventory       │
└───────────────┘           └───────────────────┘
                        │
            ┌───────────────────┐
            │    CLOUDINARY     │
            │ Image Optimization│
            └───────────────────┘
```

---

## Data Distribution

| Data | Storage | Reason |
|------|---------|--------|
| Auth & Sessions | Supabase | Built-in, OAuth |
| User Profiles | Supabase | RLS, Realtime |
| Cart/Wishlist | Supabase | Realtime sync |
| Measurements | Supabase | User-specific RLS |
| Products | TiDB | Scale, Full-text search |
| Orders | TiDB | Analytics, History |
| Reviews | TiDB | Aggregations |
| Analytics | TiDB (TiFlash) | HTAP queries |
| Images | Cloudinary | CDN, Optimization |

---

## Phase Summary

| Phase | Description | Duration | Status |
|-------|-------------|----------|--------|
| 0 | Project Setup | Week 1 | Pending |
| 1 | Database Architecture | Week 1-2 | Pending |
| 2 | Authentication | Week 2-3 | Pending |
| 3 | Product Catalog | Week 3-4 | Pending |
| 4 | Cart & Checkout | Week 4-5 | Pending |
| 5 | Stitching & Orders | Week 5-6 | Pending |
| 6 | UI/UX Redesign | Week 6-9 | Pending |
| 7 | Advanced Features | Week 9-11 | Pending |
| 8 | Testing & Deploy | Week 11-12 | Pending |

---

## Detailed Phase Documents

- [Phase 0-1: Infrastructure](./PHASE_0_1_INFRASTRUCTURE.md)
- [Phase 2-3: Auth & Products](./PHASE_2_3_AUTH_PRODUCTS.md)
- [Phase 4-5: Cart & Orders](./PHASE_4_5_CART_ORDERS.md)
- [Phase 6: UI/UX Design](./PHASE_6_UI_UX.md)
- [Phase 7-8: Advanced & Deploy](./PHASE_7_8_ADVANCED.md)

---

## Tech Stack

### Frontend
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Zustand (State)
- React Query

### Backend
- Supabase (Auth, Realtime, Storage)
- TiDB Cloud (Products, Orders, Analytics)
- Cloudinary (Images)

### Deployment
- Vercel (Frontend)
- Cloudflare (CDN, DNS)

---

## Design System

### Colors
```css
--primary-gold: #D4AF37
--primary-rose: #E8B4B8
--secondary-champagne: #F7E7CE
--accent-coral: #FF7F7F
--neutral-cream: #FAF9F6
--neutral-charcoal: #36454F
```

### Typography
- Display: Playfair Display
- Heading: Cormorant Garamond
- Body: Inter
- Accent: Poppins

### Key Features
- Mobile-first responsive
- Glassmorphism effects
- Smooth animations
- Touch-friendly (44x44px minimum)
- < 3 second load time
