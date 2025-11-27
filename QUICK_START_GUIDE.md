# 🚀 LaraibCreative - Quick Start Guide

## Project Structure

```
laraibcreative/
├── frontend/           ← MAIN APP (Run npm commands here!)
│   ├── package.json    ← Dependencies
│   ├── .env.local      ← Environment variables (create this!)
│   ├── next.config.js  ← Next.js config
│   ├── tailwind.config.js
│   └── src/
│       ├── app/        ← Pages & API routes
│       ├── components/ ← React components
│       ├── lib/        ← TiDB, Supabase, Cloudinary clients
│       ├── store/      ← Zustand stores (cart, wishlist)
│       └── context/    ← Auth context
│
├── supabase/           ← Database migrations
│   └── migrations/
│       ├── 00001_initial_schema.sql
│       ├── 00002_rls_policies.sql
│       ├── 00003_cart_and_storage.sql
│       └── 00004_loyalty_referrals.sql
│
├── docs/               ← Documentation
│   ├── TIDB_SCHEMA.md  ← TiDB Cloud schema (copy to TiDB)
│   ├── ENV_TEMPLATE.md ← Environment variables template
│   └── DEPLOYMENT_CHECKLIST.md
│
└── (root files)        ← Legacy docs, docker, nginx
```

---

## ⚡ Quick Start (3 Steps)

### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

### Step 2: Create Environment File
Create `frontend/.env.local`:
```env
# Supabase (Get from supabase.com dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# TiDB Cloud (Get from tidbcloud.com)
TIDB_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
TIDB_PORT=4000
TIDB_USER=your_username
TIDB_PASSWORD=your_password
TIDB_DATABASE=laraibcreative

# Cloudinary (Get from cloudinary.com)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Run Development Server
```bash
cd frontend
npm run dev
```
Open http://localhost:3000

---

## 📁 Key Configuration Files

| File | Location | Purpose |
|------|----------|---------|
| `package.json` | `frontend/` | Dependencies & scripts |
| `.env.local` | `frontend/` | Environment variables |
| `next.config.js` | `frontend/` | Next.js configuration |
| `tailwind.config.js` | `frontend/` | Tailwind CSS design system |
| `tsconfig.json` | `frontend/` | TypeScript configuration |
| `middleware.ts` | `frontend/src/` | Auth & route protection |

---

## 🗄️ Database Setup

### Supabase (Required First)
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to **Settings > API** to get keys
4. Run migrations:
```bash
# Option 1: Using Supabase CLI
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push

# Option 2: Manually in SQL Editor
# Copy content from supabase/migrations/*.sql
```

### TiDB Cloud (For Products/Orders)
1. Go to [tidbcloud.com](https://tidbcloud.com)
2. Create **Serverless** cluster (FREE)
3. Get connection string from dashboard
4. Run schema from `docs/TIDB_SCHEMA.md` in SQL Editor

---

## 📜 NPM Scripts

Run these from `frontend/` directory:

```bash
# Development
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run start        # Start production server

# Code Quality
npm run lint         # Check for errors
npm run lint:fix     # Auto-fix errors
npm run type-check   # TypeScript check

# Testing
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests (Playwright)
```

---

## 🔧 Common Issues

### "Cannot find module" errors
```bash
cd frontend
npm install
```

### Supabase type errors
```bash
npx supabase gen types typescript --project-id YOUR_ID > src/types/supabase.ts
```

### TiDB connection fails
- Check TIDB_* env vars are set
- Ensure TiDB cluster is active (not paused)
- Verify IP whitelist includes your IP

---

## 🏗️ Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                     Next.js 15 Frontend                       │
│                    (Vercel Deployment)                        │
└─────────────────────────┬────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│   SUPABASE    │ │  TIDB CLOUD   │ │  CLOUDINARY   │
│               │ │               │ │               │
│ • Auth        │ │ • Products    │ │ • Images      │
│ • Profiles    │ │ • Orders      │ │ • CDN         │
│ • Cart        │ │ • Reviews     │ │ • Transforms  │
│ • Wishlist    │ │ • Analytics   │ │               │
│ • Storage     │ │               │ │               │
└───────────────┘ └───────────────┘ └───────────────┘
```

---

## 📞 Need Help?

- **Supabase Docs**: https://supabase.com/docs
- **TiDB Cloud Docs**: https://docs.pingcap.com/tidbcloud
- **Next.js Docs**: https://nextjs.org/docs
- **Cloudinary Docs**: https://cloudinary.com/documentation
