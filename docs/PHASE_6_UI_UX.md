# Phase 6: UI/UX Redesign (Week 6-9)

## Design System

### Color Palette

```css
/* Primary - Gold & Rose */
--primary-gold: #D4AF37;
--primary-gold-light: #E8C84A;
--primary-gold-dark: #B8941F;
--primary-rose: #E8B4B8;
--primary-rose-light: #F5D5D7;
--primary-rose-dark: #D49599;

/* Secondary - Champagne */
--secondary-champagne: #F7E7CE;
--secondary-cream: #FAF9F6;
--secondary-beige: #F5F5DC;

/* Accent */
--accent-coral: #FF7F7F;
--accent-emerald: #2DD4BF;

/* Neutral */
--neutral-charcoal: #36454F;
--neutral-gray: #6B7280;
--neutral-light: #F3F4F6;
--neutral-white: #FFFFFF;

/* Semantic */
--success: #22C55E;
--warning: #F59E0B;
--error: #EF4444;
--info: #3B82F6;
```

### Typography

```css
/* Font Families */
--font-display: 'Playfair Display', serif;   /* Headlines */
--font-heading: 'Cormorant Garamond', serif; /* Subheadings */
--font-body: 'Inter', sans-serif;            /* Body text */
--font-accent: 'Poppins', sans-serif;        /* Buttons, Labels */

/* Font Sizes (Mobile First) */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px - minimum for body */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
```

---

## Page Layouts

### Homepage Sections

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER                                                       │
│ [Logo] [Search] [Account] [Wishlist] [Cart]                 │
│ [Categories Menu - Sticky]                                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ HERO SECTION                                                 │
│ Full-width image/video                                       │
│ "New Collection 2025"                                        │
│ [Shop Now] CTA button                                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ CATEGORY CARDS (Mobile: 2 cols, Desktop: 4 cols)           │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│ │  Lawn   │ │ Chiffon │ │  Silk   │ │ Winter  │           │
│ │  Suits  │ │  Suits  │ │  Suits  │ │ Wear    │           │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ NEW ARRIVALS                                                 │
│ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐                    │
│ │Product│ │Product│ │Product│ │Product│                    │
│ │ Card  │ │ Card  │ │ Card  │ │ Card  │                    │
│ └───────┘ └───────┘ └───────┘ └───────┘                    │
│                    [View All]                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ STITCHING SERVICE BANNER                                     │
│ "Get Your Perfect Fit"                                       │
│ [Custom measurements] [Expert tailoring] [Quick delivery]   │
│ [Learn More]                                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ BEST SELLERS                                                 │
│ [Product Grid - 4 items]                                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ TRUST BADGES                                                 │
│ [Free Shipping 3000+] [7-Day Returns] [Secure Payment]      │
│ [Expert Stitching] [Quality Fabrics]                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ INSTAGRAM FEED                                               │
│ @laraibcreative                                             │
│ [Instagram images grid]                                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ NEWSLETTER                                                   │
│ "Get 10% Off Your First Order"                              │
│ [Email input] [Subscribe]                                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ FOOTER                                                       │
│ [About] [Customer Service] [Shop] [Follow Us]               │
│ [Payment methods] [Copyright]                               │
└─────────────────────────────────────────────────────────────┘
```

### Product Listing Page

```
┌─────────────────────────────────────────────────────────────┐
│ BREADCRUMB: Home > Category > Subcategory                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ CATEGORY HEADER                                              │
│ "Lawn Suits" (42 products)                                  │
└─────────────────────────────────────────────────────────────┘

┌───────────────────┬─────────────────────────────────────────┐
│ FILTERS (Desktop) │ SORT: [Newest ▾]  FILTERS (Mobile btn) │
│ ┌───────────────┐ ├─────────────────────────────────────────┤
│ │ Price Range   │ │ PRODUCT GRID                            │
│ │ [-----●-----] │ │ ┌───────┐ ┌───────┐ ┌───────┐          │
│ │ 1000 - 15000  │ │ │       │ │       │ │       │          │
│ └───────────────┘ │ │       │ │       │ │       │          │
│ ┌───────────────┐ │ │ Card  │ │ Card  │ │ Card  │          │
│ │ Colors        │ │ └───────┘ └───────┘ └───────┘          │
│ │ ● ● ● ● ●    │ │ ┌───────┐ ┌───────┐ ┌───────┐          │
│ └───────────────┘ │ │       │ │       │ │       │          │
│ ┌───────────────┐ │ │ Card  │ │ Card  │ │ Card  │          │
│ │ Size          │ │ └───────┘ └───────┘ └───────┘          │
│ │ [S][M][L][XL] │ │                                         │
│ └───────────────┘ │                                         │
│ ┌───────────────┐ │ PAGINATION                              │
│ │ Fabric Type   │ │ [1] [2] [3] ... [10] [Next]            │
│ │ □ Lawn        │ │                                         │
│ │ □ Chiffon     │ │                                         │
│ │ □ Cotton      │ │                                         │
│ └───────────────┘ │                                         │
└───────────────────┴─────────────────────────────────────────┘
```

### Product Detail Page

```
┌─────────────────────────────────────────────────────────────┐
│ BREADCRUMB: Home > Lawn Suits > Product Name                │
└─────────────────────────────────────────────────────────────┘

┌───────────────────────────┬─────────────────────────────────┐
│ IMAGE GALLERY             │ PRODUCT INFO                    │
│ ┌───────────────────────┐ │ ┌─────────────────────────────┐ │
│ │                       │ │ │ PRODUCT TITLE               │ │
│ │   [Main Image]        │ │ │ Design Code: LC-2025-001    │ │
│ │   (Swipe/Zoom)        │ │ │                             │ │
│ │                       │ │ │ ⭐⭐⭐⭐⭐ 4.8 (125 reviews) │ │
│ └───────────────────────┘ │ │                             │ │
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐  │ │ PKR 8,500  ̶P̶K̶R̶ ̶1̶0̶,̶0̶0̶0̶     │ │
│ │ 1 │ │ 2 │ │ 3 │ │ 4 │  │ │ (15% OFF)                   │ │
│ └───┘ └───┘ └───┘ └───┘  │ │                             │ │
│ (Thumbnail strip)        │ │ ✓ In Stock                   │ │
│                          │ └─────────────────────────────┘ │
│                          │ ┌─────────────────────────────┐ │
│                          │ │ SELECT COLOR                │ │
│                          │ │ ● ● ● ● ○                   │ │
│                          │ │ Maroon (selected)           │ │
│                          │ └─────────────────────────────┘ │
│                          │ ┌─────────────────────────────┐ │
│                          │ │ TYPE                        │ │
│                          │ │ [Unstitched] [Get Stitched] │ │
│                          │ │ + PKR 1,500 for stitching   │ │
│                          │ └─────────────────────────────┘ │
│                          │ ┌─────────────────────────────┐ │
│                          │ │ QUANTITY                    │ │
│                          │ │ [-]  2  [+]                 │ │
│                          │ └─────────────────────────────┘ │
│                          │ ┌─────────────────────────────┐ │
│                          │ │ [♡ Wishlist] [Share]        │ │
│                          │ │                             │ │
│                          │ │ [   ADD TO CART    ]        │ │
│                          │ │ [   BUY NOW        ]        │ │
│                          │ └─────────────────────────────┘ │
└───────────────────────────┴─────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ TABS: [Description] [Size & Fit] [Stitching] [Care]        │
├─────────────────────────────────────────────────────────────┤
│ Description content...                                       │
│ • Fabric: Premium Lawn                                       │
│ • Pieces: 3 (Shirt, Trouser, Dupatta)                       │
│ • Design: Embroidered front with printed back               │
│ • Color: Maroon with gold embroidery                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ CUSTOMER REVIEWS                                             │
│ ⭐⭐⭐⭐⭐ 4.8 out of 5 (125 reviews)                        │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ⭐⭐⭐⭐⭐ "Beautiful fabric quality!"                   │ │
│ │ Sarah K. - Verified Purchase                             │ │
│ │ The color is exactly as shown. Stitching was perfect... │ │
│ │ [Photos from customer]                                   │ │
│ └─────────────────────────────────────────────────────────┘ │
│ [Load More Reviews]                                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ YOU MAY ALSO LIKE                                            │
│ [Product Cards - 4 items]                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Library

### Core Components

```typescript
// components/ui/Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link'
  size: 'sm' | 'md' | 'lg' | 'icon'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

// components/ui/Input.tsx
interface InputProps {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

// components/ui/Card.tsx
interface CardProps {
  variant: 'default' | 'elevated' | 'outlined'
  padding: 'none' | 'sm' | 'md' | 'lg'
}
```

### Shop Components

```
components/shop/
├── ProductCard.tsx         # Product card with image, title, price
├── ProductGrid.tsx         # Responsive grid layout
├── ProductGallery.tsx      # Image gallery with zoom
├── ProductQuickView.tsx    # Quick view modal
├── ColorSwatch.tsx         # Color selection circles
├── SizeSelector.tsx        # Size buttons
├── PriceDisplay.tsx        # Price with discount
├── StockBadge.tsx          # In stock / Out of stock
├── RatingStars.tsx         # Star rating display
├── WishlistButton.tsx      # Heart icon button
├── AddToCartButton.tsx     # Add to cart with quantity
├── ProductFilters.tsx      # Filter sidebar/drawer
├── ProductSort.tsx         # Sort dropdown
├── CategoryCard.tsx        # Category image card
└── SearchBar.tsx           # Search with suggestions
```

### Checkout Components

```
components/checkout/
├── CheckoutWizard.tsx      # Multi-step checkout
├── StepIndicator.tsx       # Progress indicator
├── ShippingForm.tsx        # Address form
├── AddressCard.tsx         # Saved address card
├── MeasurementForm.tsx     # Measurement inputs
├── MeasurementGuide.tsx    # Visual guide
├── CustomizationPicker.tsx # Style selections
├── PaymentMethods.tsx      # Payment options
├── OrderSummary.tsx        # Order total breakdown
└── OrderConfirmation.tsx   # Success page
```

---

## Mobile-First Breakpoints

```css
/* Mobile First - Default styles are mobile */

/* Tablet */
@media (min-width: 640px) { /* sm */ }

/* Small Desktop */
@media (min-width: 768px) { /* md */ }

/* Desktop */
@media (min-width: 1024px) { /* lg */ }

/* Large Desktop */
@media (min-width: 1280px) { /* xl */ }

/* Extra Large */
@media (min-width: 1536px) { /* 2xl */ }
```

---

## Animation Guidelines

```typescript
// Framer Motion Variants
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 }
}

export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.4, ease: 'easeOut' }
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.2 }
}

export const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}
```

---

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| First Contentful Paint | < 1.5s | TBD |
| Largest Contentful Paint | < 2.5s | TBD |
| Time to Interactive | < 3.5s | TBD |
| Cumulative Layout Shift | < 0.1 | TBD |
| First Input Delay | < 100ms | TBD |
| Mobile PageSpeed Score | > 90 | TBD |

### Optimization Checklist
- [ ] Image optimization (WebP, responsive)
- [ ] Lazy loading (images, components)
- [ ] Code splitting (dynamic imports)
- [ ] Font optimization (preload, display: swap)
- [ ] Critical CSS extraction
- [ ] Service worker for caching
- [ ] CDN for static assets

---

## Deliverables Phase 6

### Week 6-7: Core UI
- [ ] Design system setup (Tailwind config)
- [ ] Base components (Button, Input, Card, etc.)
- [ ] Header component (responsive)
- [ ] Footer component
- [ ] Mobile menu drawer
- [ ] Homepage redesign

### Week 7-8: Shop Pages
- [ ] Product card component
- [ ] Product listing page
- [ ] Filter drawer (mobile)
- [ ] Filter sidebar (desktop)
- [ ] Product detail page
- [ ] Image gallery with zoom
- [ ] Quick view modal

### Week 8-9: Checkout & Account
- [ ] Cart drawer
- [ ] Checkout wizard
- [ ] Measurement form
- [ ] Order confirmation
- [ ] Account pages
- [ ] Order tracking
