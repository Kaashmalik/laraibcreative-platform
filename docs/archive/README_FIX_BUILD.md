# 🔧 Fix Build Errors - Complete Guide

## Problem
Build fails with: `TypeError: (0 , a.useAuthStore) is not a function`

## ✅ Solution Summary

### 1. Auth Store Fixed (✅ ALREADY DONE)
The `authStore.ts` has been updated to handle SSR properly.

### 2. Add Dynamic Export to Pages

You need to add this line to **every page** that uses authentication:

```javascript
'use client';

export const dynamic = 'force-dynamic';

export const dynamic = 'force-dynamic';  // ← Add this line

import { useState } from 'react';
// ... rest of imports
```

## 📝 Manual Fix Instructions

### Quick Fix (Copy-Paste Method)

For each file listed below, open it and add the line after `'use client';`:

```javascript
export const dynamic = 'force-dynamic';
```

### Files That Need Fixing (Total: ~54 files)

#### Admin Pages (29 files):
```
src/app/admin/page.js
src/app/admin/dashboard/page.tsx
src/app/admin/login/page.js
src/app/admin/orders/page.tsx
src/app/admin/orders/[id]/page.tsx
src/app/admin/customers/page.js
src/app/admin/customers/[id]/page.js
src/app/admin/products/page.js
src/app/admin/products/new/page.js
src/app/admin/products/edit/[id]/page.js
src/app/admin/inventory/fabrics/page.js
src/app/admin/inventory/accessories/page.js
src/app/admin/content/homepage/page.js
src/app/admin/content/banners/page.js
src/app/admin/content/blog/page.js
src/app/admin/content/blog/new/page.js
src/app/admin/content/blog/edit/[id]/page.js
src/app/admin/communications/inquiries/page.js
src/app/admin/communications/notifications/page.js
src/app/admin/reports/sales/page.js
src/app/admin/reports/customers/page.js
src/app/admin/reports/products/page.js
src/app/admin/settings/page.js
src/app/admin/settings/general/page.js
src/app/admin/settings/email/page.js
src/app/admin/settings/seo/page.js
src/app/admin/settings/payment/page.js
src/app/admin/settings/shipping/page.js
src/app/admin/settings/users/page.js
```

#### Customer Auth/Account Pages (25 files):
```
src/app/(customer)/auth/login/page.js
src/app/(customer)/auth/register/page.js
src/app/(customer)/auth/forgot-password/page.js
src/app/(customer)/auth/reset-password/page.js
src/app/(customer)/auth/verify-email/page.js
src/app/(customer)/account/page.js
src/app/(customer)/account/profile/page.js
src/app/(customer)/account/orders/page.js
src/app/(customer)/account/measurements/page.js
src/app/(customer)/account/measurement-profiles/page.js
src/app/(customer)/account/wishlist/page.js
src/app/(customer)/account/addresses/page.js
src/app/(customer)/account/loyalty/page.tsx
src/app/(customer)/account/referrals/page.js
src/app/(customer)/cart/page.tsx
src/app/(customer)/checkout/page.tsx  ✅ (ALREADY FIXED)
```

## 🚀 Automated Fix (Recommended)

### Option 1: Using Find & Replace in VS Code

1. Press `Ctrl+Shift+H` (Windows) or `Cmd+Shift+H` (Mac)
2. Enable regex mode (click `.*` button)
3. **Find:** `^'use client';\n`
4. **Replace:** `'use client';\n\nexport const dynamic = 'force-dynamic';\n`
5. **Files to include:** `src/app/**/*.{ts,tsx,js,jsx}`
6. Click "Replace All"

### Option 2: Using Git Bash (Windows)

```bash
cd frontend

# Fix all admin pages
find src/app/admin -name "page.*" -type f -exec sed -i "/'use client';/a\\
export const dynamic = 'force-dynamic';" {} +

# Fix all account pages
find src/app/\(customer\)/account -name "page.*" -type f -exec sed -i "/'use client';/a\\
export const dynamic = 'force-dynamic';" {} +

# Fix all auth pages
find src/app/\(customer\)/auth -name "page.*" -type f -exec sed -i "/'use client';/a\\
export const dynamic = 'force-dynamic';" {} +
```

### Option 3: Using Node.js Script

Create `fix.js` in frontend folder:

```javascript
const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/app/**/page.{js,jsx,ts,tsx}');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Skip if already has dynamic export
  if (content.includes("export const dynamic = 'force-dynamic'")) {
    return;
  }
  
  // Add after 'use client'
  if (content.includes("'use client'")) {
    content = content.replace(
      "'use client';",
      "'use client';\n\nexport const dynamic = 'force-dynamic';"
    );
    fs.writeFileSync(file, content);
    console.log('✅', file);
  }
});
```

Run: `node fix.js`

## 🧪 Test the Fix

```bash
cd frontend
npm run build
```

If successful, you should see:
```
✓ Generating static pages (71/71)
✓ Compiled successfully
```

## ❓ Common Issues

### Issue 1: Still getting errors after fix?

**Solution:** Make sure EVERY page that uses `useAuth()` has the dynamic export.

Check with:
```bash
grep -r "useAuth" src/app --include="*.jsx" --include="*.tsx" -l
```

### Issue 2: Some pages don't have 'use client'?

**Solution:** Add both lines at the top:
```javascript
'use client';

export const dynamic = 'force-dynamic';

export const dynamic = 'force-dynamic';
```

### Issue 3: Want to skip admin routes entirely?

**Solution:** Add to `next.config.js`:
```javascript
experimental: {
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
},
```

## 📚 What This Does

- `'use client'`: Marks component as Client Component (runs in browser)
- `export const dynamic = 'force-dynamic'`: Tells Next.js to NOT pre-render this page during build

This prevents the Zustand store from trying to access `localStorage` during build time.

## 🎯 After Fixing

1. ✅ All pages build successfully
2. ✅ Authentication still works
3. ✅ No loss of functionality
4. ✅ Slightly slower initial page load (acceptable trade-off)

## 💡 Future Improvement

Consider migrating to:
- **Next.js Middleware** for auth (better approach)
- **Server Actions** for data mutations
- **Cookies** instead of localStorage for auth tokens

See `STATIC_EXPORT_FIX.md` for detailed guide.

## 🆘 Need Help?

If you're stuck, you can:
1. Manually fix just the failing pages (check build output)
2. Use the find-and-replace method in VS Code
3. Ask for help with specific error messages

---

**Status:**
- ✅ Auth Store Fixed
- ✅ Checkout Page Fixed
- ⏳ Other pages need fixing (see list above)

