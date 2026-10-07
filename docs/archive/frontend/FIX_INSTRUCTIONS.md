# 🔧 Fix Instructions

## What Happened?
The find-and-replace added duplicate lines and incorrectly added `export const dynamic` to component files (it should only be in page files).

## 🚀 Quick Fix (Run These Commands)

```bash
cd frontend

# Run the fix script
node fix-all-issues.js

# Then build
npm run build
```

## What the Script Does

1. ✅ Removes duplicate `'use client'` directives
2. ✅ Removes duplicate `export const dynamic` lines
3. ✅ Removes `export const dynamic` from components (only keeps in pages/layouts)
4. ✅ Fixes `dynamic` import conflicts by renaming to `dynamicImport`
5. ✅ Cleans up extra blank lines

## Expected Output

```
🚀 Starting comprehensive fix...

Found 150+ files to check

✅ 📄 Page: src/app/admin/dashboard/page.tsx
✅ 🧩 Component: src/components/customer/NewsletterForm.jsx
✅ 📄 Page: src/app/(customer)/checkout/page.tsx
...

====================================================
📊 Fix Summary:
   ✅ Fixed: 40+ files
   ❌ Errors: 0 files
   📁 Total checked: 150+ files
====================================================

✨ Fixes applied! Now run:
   npm run build
```

## If Script Fails

### Missing `glob` package?

```bash
npm install glob --save-dev
```

### Or use manual fix:

**For files with duplicates:**
1. Open the file
2. Remove duplicate `'use client'` (keep only the first one)
3. Remove duplicate `export const dynamic` (keep only the first one)

**For components (non-page files):**
1. Remove the entire line: `export const dynamic = 'force-dynamic';`
2. Components don't need this - only pages do

**For pages using `import dynamic from 'next/dynamic'`:**
1. Change: `import dynamic from 'next/dynamic'`
2. To: `import dynamicImport from 'next/dynamic'`
3. Replace all uses: `dynamic(...)` → `dynamicImport(...)`

## Files That Had Issues

Based on your errors:

### Pages (keep dynamic export, but rename import):
- `src/app/(customer)/custom-order/CustomOrderPage.tsx`
- `src/app/admin/dashboard/page.tsx`
- `src/app/(customer)/checkout/page.tsx`
- `src/app/admin/layout.js`
- `src/app/admin/products/page.js`

### Components (remove dynamic export completely):
- All files in `src/components/`
- All files in `src/context/`

## After Running the Script

```bash
npm run build
```

Should see:
```
✓ Compiled successfully
✓ Generating static pages (71/71)
```

## Still Having Issues?

Run type check to see remaining errors:
```bash
npm run type-check
```

Then share the output and I'll help fix the specific files.

---

**TL;DR:** Just run `node fix-all-issues.js` then `npm run build`

