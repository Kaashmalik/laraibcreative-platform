# Fix for Static Export Build Errors

## Problem
When running `npm run build` (for static export), the build fails with:
```
TypeError: (0 , a.useAuthStore) is not a function
TypeError: (0 , s.useAuthStore) is not a function
```

This happens because:
1. Next.js tries to pre-render all pages during build (SSR/SSG)
2. Zustand's `useAuthStore` tries to access `localStorage` 
3. `localStorage` doesn't exist during server-side rendering

## ✅ Solution 1: Fix Auth Store (SSR-Safe) - **COMPLETED**

The auth store has been updated to handle SSR properly:

```typescript
// frontend/src/store/authStore.ts
storage: createJSONStorage(() => {
  // Check if we're in the browser before accessing localStorage
  if (typeof window !== 'undefined') {
    return localStorage;
  }
  // Return a dummy storage for SSR
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
}),
skipHydration: typeof window === 'undefined',
```

## ✅ Solution 2: Disable Static Generation for Auth Pages

For pages that require authentication, you have two options:

### Option A: Force Dynamic Rendering (Recommended for Authenticated Pages)

Add to **every page** that uses `useAuth()` or authentication:

```javascript
'use client';

export const dynamic = 'force-dynamic';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
```

**Pages that need this:**
- All `/admin/*` pages
- All `/account/*` pages  
- `/auth/login`, `/auth/register`, etc.
- `/cart`, `/checkout`

### Option B: Convert to Client-Only Rendering

Wrap auth-dependent content in a client component:

```javascript
// page.js (Server Component)
import AuthContent from './AuthContent';

export default function Page() {
  return <AuthContent />;
}

// AuthContent.jsx (Client Component)
'use client';

export const dynamic = 'force-dynamic';

export default function AuthContent() {
  const { user } = useAuth();
  // ... rest of component
}
```

## ✅ Solution 3: Update Next.js Config for Static Export

If you want true static export, update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // For static HTML export
  output: 'export',
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  
  // Optional: Add custom export path
  distDir: 'out',
  
  // ... rest of config
};
```

**Note:** Static export has limitations:
- No API routes
- No server-side rendering
- No incremental static regeneration (ISR)
- No dynamic routes at build time

## ✅ Solution 4: Use Middleware for Auth (Best Practice)

Instead of client-side auth checks, use Next.js middleware:

```javascript
// frontend/src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!token && pathname !== '/admin/login') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Protect account routes
  if (pathname.startsWith('/account')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/account/:path*',
    '/checkout',
  ],
};
```

## 🎯 Recommended Approach

### For Production (Vercel/Netlify/Server):
```javascript
// next.config.js
module.exports = {
  output: 'standalone', // ✅ Current setting - GOOD!
  // This works with SSR and allows dynamic features
}
```

### For Static HTML Export (Static Hosting):
```javascript
// next.config.js
module.exports = {
  output: 'export',
  images: { unoptimized: true },
}
```

Then use middleware + force-dynamic on auth pages.

## 🚀 Implementation Steps

### Step 1: ✅ Auth Store Fixed (Already Done)

### Step 2: Add dynamic export to pages

Run this command to add to all admin pages:

```bash
cd frontend/src/app
find admin -name "page.js" -o -name "page.jsx" -o -name "page.ts" -o -name "page.tsx" | \
  xargs -I {} bash -c "grep -q \"'use client'\" {} && \
  grep -q 'export const dynamic' {} || \
  sed -i \"2i export const dynamic = 'force-dynamic';\" {}"
```

Or manually add to each page:

```javascript
'use client';

export const dynamic = 'force-dynamic';

export const dynamic = 'force-dynamic'; // Add this line

import { useState } from 'react';
// ... rest of imports
```

### Step 3: Create Middleware (Optional but Recommended)

Create `frontend/src/middleware.ts` with the code from Solution 4 above.

### Step 4: Test Build

```bash
cd frontend
npm run build
```

## 📋 Quick Fix Checklist

- [x] Update `authStore.ts` to be SSR-safe
- [ ] Add `export const dynamic = 'force-dynamic'` to admin pages
- [ ] Add `export const dynamic = 'force-dynamic'` to account pages
- [ ] Create middleware for auth (optional)
- [ ] Test build: `npm run build`
- [ ] Test production: `npm run start`

## 🔍 Pages That Need Updates

### Admin Pages (29 files):
```
app/admin/page.js
app/admin/dashboard/page.tsx
app/admin/login/page.js
app/admin/orders/page.tsx
app/admin/orders/[id]/page.tsx
app/admin/customers/page.js
app/admin/customers/[id]/page.js
app/admin/products/page.js
app/admin/products/new/page.js
app/admin/products/edit/[id]/page.js
app/admin/inventory/fabrics/page.js
app/admin/inventory/accessories/page.js
app/admin/content/homepage/page.js
app/admin/content/banners/page.js
app/admin/content/blog/page.js
app/admin/content/blog/new/page.js
app/admin/content/blog/edit/[id]/page.js
app/admin/communications/inquiries/page.js
app/admin/communications/notifications/page.js
app/admin/reports/sales/page.js
app/admin/reports/customers/page.js
app/admin/reports/products/page.js
app/admin/settings/page.js
app/admin/settings/general/page.js
app/admin/settings/email/page.js
app/admin/settings/seo/page.js
app/admin/settings/payment/page.js
app/admin/settings/shipping/page.js
app/admin/settings/users/page.js
```

### Customer Auth Pages:
```
app/(customer)/auth/login/page.js
app/(customer)/auth/register/page.js
app/(customer)/auth/forgot-password/page.js
app/(customer)/auth/reset-password/page.js
app/(customer)/auth/verify-email/page.js
app/(customer)/account/page.js
app/(customer)/account/profile/page.js
app/(customer)/account/orders/page.js
app/(customer)/account/measurements/page.js
app/(customer)/account/measurement-profiles/page.js
app/(customer)/account/wishlist/page.js
app/(customer)/account/addresses/page.js
app/(customer)/account/loyalty/page.js
app/(customer)/account/referrals/page.js
app/(customer)/cart/page.js
app/(customer)/checkout/page.tsx
```

## 💡 Alternative: Lazy Loading

Instead of forcing dynamic, you can lazy load auth components:

```javascript
'use client';

export const dynamic = 'force-dynamic';

import dynamic from 'next/dynamic';

const AuthContent = dynamic(() => import('./AuthContent'), {
  ssr: false,
  loading: () => <LoadingSpinner />
});

export default function Page() {
  return <AuthContent />;
}
```

## 📚 Resources

- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Zustand SSR Guide](https://github.com/pmndrs/zustand#readme)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

## ❓ FAQ

**Q: Why not just use `'use client'` everywhere?**
A: Client components can't use server-side features like data fetching at build time. It's best to use server components when possible for better performance and SEO.

**Q: Can I use static export with authentication?**
A: Yes, but you'll need to handle auth entirely client-side and use middleware to protect routes. Pages will be empty HTML shells that hydrate with client JavaScript.

**Q: What's the difference between `output: 'standalone'` and `output: 'export'`?**
- `standalone`: Server-side rendering, requires Node.js server, full Next.js features
- `export`: Pure static HTML/CSS/JS, can host on any static host, limited features

**Q: Do I need to fix all pages at once?**
A: No! The auth store fix alone might resolve most issues. Try rebuilding first, then fix specific pages that still fail.

