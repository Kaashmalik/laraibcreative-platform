# Dynamic Imports Implementation Guide

## Overview
Complete guide for implementing and using dynamic imports in the LaraibCreative platform.

**Date**: 2025-01-XX  
**Status**: ✅ Production Ready

---

## 🎯 When to Use Dynamic Imports

### Use Dynamic Imports For:

1. **Heavy Components (> 50KB)**
   - Large component files
   - Components with heavy dependencies
   - Examples: Charts, Rich text editors, Image galleries

2. **Route-Specific Components**
   - Components only used on specific pages
   - Examples: CustomOrderPage, Admin dashboard charts

3. **Below-the-Fold Content**
   - Content not visible on initial load
   - Examples: Footer components, Related products

4. **Third-Party Libraries**
   - Heavy libraries (recharts, framer-motion)
   - Client-only libraries
   - Examples: Chart libraries, Animation libraries

5. **Conditional Components**
   - Components shown based on user actions
   - Examples: Modals, Dropdowns, Tooltips

### Don't Use Dynamic Imports For:

1. **Small Components (< 20KB)**
   - Lightweight components
   - Frequently used components
   - Examples: Buttons, Inputs, Cards

2. **Above-the-Fold Content**
   - Critical initial content
   - SEO-important content
   - Examples: Hero sections, Product images

3. **Shared Components**
   - Components used across many pages
   - Examples: Header, Footer, Navigation

---

## 📋 Implementation Checklist

### Step 1: Identify Heavy Components
- [ ] Check component file size
- [ ] Check dependencies (libraries)
- [ ] Analyze bundle impact
- [ ] Determine if route-specific

### Step 2: Create Loading Component
- [ ] Design loading skeleton
- [ ] Match component layout
- [ ] Add smooth animations
- [ ] Test loading state

### Step 3: Implement Dynamic Import
- [ ] Use `next/dynamic`
- [ ] Add loading component
- [ ] Set `ssr` option correctly
- [ ] Add error boundary

### Step 4: Test Implementation
- [ ] Test loading state
- [ ] Test error handling
- [ ] Test performance
- [ ] Test on mobile

---

## 🔧 Implementation Patterns

### Pattern 1: Basic Dynamic Import
```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSkeleton />,
});
```

### Pattern 2: With SSR Disabled
```typescript
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSkeleton />,
  ssr: false, // Disable SSR for client-only components
});
```

### Pattern 3: With Error Boundary
```typescript
import { DynamicErrorBoundary } from '@/components/shared/DynamicErrorBoundary';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => (
    <DynamicErrorBoundary componentName="HeavyComponent">
      <LoadingSkeleton />
    </DynamicErrorBoundary>
  ),
  ssr: false,
});
```

### Pattern 4: Using Pre-configured Imports
```typescript
import { DynamicRichTextEditor } from '@/lib/dynamic-imports';

function MyComponent() {
  return <DynamicRichTextEditor value={content} onChange={handleChange} />;
}
```

---

## 🎨 Loading Component Best Practices

### 1. Match Component Layout
```typescript
// Good: Matches actual component structure
export function ProductCardLoading() {
  return (
    <div className="bg-white rounded-lg p-4">
      <div className="h-48 bg-gray-200 animate-pulse mb-4" />
      <div className="h-6 bg-gray-200 animate-pulse w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 animate-pulse w-1/2" />
    </div>
  );
}

// Bad: Generic placeholder
export function ProductCardLoading() {
  return <div className="animate-pulse">Loading...</div>;
}
```

### 2. Use Smooth Animations
```typescript
// Good: Smooth pulse animation
<div className="bg-gray-200 animate-pulse" />

// Bad: Jarring flash
<div className="bg-gray-200 animate-bounce" />
```

### 3. Maintain Aspect Ratios
```typescript
// Good: Maintains aspect ratio
<div className="relative aspect-[3/4] bg-gray-200 animate-pulse" />

// Bad: No aspect ratio
<div className="h-48 bg-gray-200 animate-pulse" />
```

---

## 🛡️ Error Boundary Best Practices

### 1. Always Wrap Dynamic Imports
```typescript
<DynamicErrorBoundary componentName="ComponentName">
  <DynamicComponent />
</DynamicErrorBoundary>
```

### 2. Provide Meaningful Error Messages
```typescript
<DynamicErrorBoundary
  componentName="CustomOrderPage"
  showRetry={true}
  onRetry={handleRetry}
>
  <DynamicComponent />
</DynamicErrorBoundary>
```

### 3. Log Errors in Production
```typescript
// In DynamicErrorBoundary componentDidCatch
if (process.env.NODE_ENV === 'production') {
  // Log to error tracking service
  Sentry.captureException(error, { extra: errorInfo });
}
```

---

## 📊 SSR Decision Guide

### Use `ssr: false` When:

1. **Browser APIs Required**
   ```typescript
   // Component uses window, document, localStorage
   const Component = dynamic(() => import('./Component'), {
     ssr: false, // ✅ Required
   });
   ```

2. **Third-Party Client Libraries**
   ```typescript
   // Library doesn't support SSR
   const Chart = dynamic(() => import('./Chart'), {
     ssr: false, // ✅ Required (recharts, framer-motion)
   });
   ```

3. **User-Specific Content**
   ```typescript
   // Component uses localStorage/sessionStorage
   const Component = dynamic(() => import('./Component'), {
     ssr: false, // ✅ Required
   });
   ```

### Use `ssr: true` (Default) When:

1. **SEO Critical**
   ```typescript
   // Component needed for search engines
   const Component = dynamic(() => import('./Component'), {
     ssr: true, // ✅ Default, can omit
   });
   ```

2. **Fast Initial Render**
   ```typescript
   // Component should render on server
   const Component = dynamic(() => import('./Component'), {
     ssr: true, // ✅ Default
   });
   ```

---

## 🚀 Performance Optimization Tips

### 1. Preload Likely Components
```typescript
import { preloadComponent } from '@/lib/dynamic-imports';

// Preload on hover
<button
  onMouseEnter={() => preloadComponent(() => import('./HeavyComponent'))}
>
  Open
</button>
```

### 2. Route-Based Code Splitting
```typescript
// Automatically splits by route
// pages/custom-order.js → custom-order chunk
// pages/admin/dashboard.js → admin-dashboard chunk
```

### 3. Component-Level Splitting
```typescript
// Split heavy components
const Chart = dynamic(() => import('./Chart'));
const Editor = dynamic(() => import('./Editor'));
```

### 4. Library Splitting
```typescript
// Split heavy libraries
const Recharts = dynamic(() => import('recharts'));
const FramerMotion = dynamic(() => import('framer-motion'));
```

---

## 📝 Code Examples

### Example 1: CustomOrderPage
```typescript
// ✅ Good: Dynamic import with error boundary
import dynamic from 'next/dynamic';
import { DynamicErrorBoundary } from '@/components/shared/DynamicErrorBoundary';

const CustomOrderPage = dynamic(() => import('./CustomOrderPage'), {
  loading: () => <CustomOrderLoading />,
  ssr: false, // Uses localStorage
});

export default function Page() {
  return (
    <DynamicErrorBoundary componentName="CustomOrderPage">
      <CustomOrderPage />
    </DynamicErrorBoundary>
  );
}
```

### Example 2: Chart Components
```typescript
// ✅ Good: Multiple charts dynamically imported
const RevenueChart = dynamic(() => import('./RevenueChart'), {
  loading: () => <ChartLoading height={350} />,
  ssr: false, // Charts require canvas
});

const OrdersPieChart = dynamic(() => import('./OrdersPieChart'), {
  loading: () => <ChartLoading height={350} />,
  ssr: false,
});
```

### Example 3: Conditional Loading
```typescript
// ✅ Good: Load only when needed
const [showEditor, setShowEditor] = useState(false);

const RichTextEditor = dynamic(() => import('./RichTextEditor'), {
  loading: () => <RichTextEditorLoading />,
  ssr: false,
});

return (
  <>
    <button onClick={() => setShowEditor(true)}>Edit</button>
    {showEditor && <RichTextEditor />}
  </>
);
```

---

## ⚠️ Common Mistakes

### Mistake 1: Over-Dynamic Importing
```typescript
// ❌ Bad: Small component doesn't need dynamic import
const Button = dynamic(() => import('./Button'));

// ✅ Good: Only heavy components
const HeavyChart = dynamic(() => import('./HeavyChart'));
```

### Mistake 2: Missing Loading State
```typescript
// ❌ Bad: No loading state
const Component = dynamic(() => import('./Component'));

// ✅ Good: With loading state
const Component = dynamic(() => import('./Component'), {
  loading: () => <LoadingSkeleton />,
});
```

### Mistake 3: Wrong SSR Setting
```typescript
// ❌ Bad: ssr: false for SEO-critical content
const ProductList = dynamic(() => import('./ProductList'), {
  ssr: false, // Bad: Products need SEO
});

// ✅ Good: ssr: true for SEO
const ProductList = dynamic(() => import('./ProductList'), {
  ssr: true, // Good: Products need SEO
});
```

### Mistake 4: No Error Handling
```typescript
// ❌ Bad: No error boundary
const Component = dynamic(() => import('./Component'));

// ✅ Good: With error boundary
<DynamicErrorBoundary componentName="Component">
  <DynamicComponent />
</DynamicErrorBoundary>
```

---

## 🧪 Testing

### Test Loading States
```typescript
// Simulate slow network
// Chrome DevTools → Network → Throttling → Slow 3G
// Verify loading skeleton appears
```

### Test Error Handling
```typescript
// Temporarily break component
// Verify error boundary catches error
// Verify retry button works
```

### Test Performance
```typescript
// Use Lighthouse
// Verify bundle size reduction
// Verify TTI improvement
```

---

## 📚 Resources

- [Next.js Dynamic Imports](https://nextjs.org/docs/advanced-features/dynamic-import)
- [React Code Splitting](https://react.dev/reference/react/lazy)
- [Web.dev Code Splitting](https://web.dev/code-splitting-suspense/)

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0.0

