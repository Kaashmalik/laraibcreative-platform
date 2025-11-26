# Phase 2-3: Authentication & Product Catalog

## Phase 2: Authentication System (Week 2-3)

### 2.1 Auth Features

| Feature | Implementation | Priority |
|---------|---------------|----------|
| Email/Password | Supabase Auth | P0 |
| Google OAuth | Supabase Auth | P1 |
| Phone OTP | Supabase + Twilio | P2 |
| Guest Checkout | Session-based | P0 |
| Password Reset | Supabase Auth | P0 |
| Admin 2FA | Supabase MFA | P2 |

### 2.2 Auth Context

```typescript
// context/AuthContext.tsx
'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: 'customer' | 'admin' | 'super-admin'
  customer_type: 'new' | 'returning' | 'vip'
  profile_image: string | null
  loyalty_points: number
  is_active: boolean
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  isLoading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (data: SignUpData) => Promise<{ error: Error | null }>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
  updateProfile: (data: Partial<Profile>) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const supabase = createClient()

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (!error && data) {
      setProfile(data)
    }
    return data
  }, [supabase])

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setUser(session.user)
        setSession(session)
        await fetchProfile(session.user.id)
      }
      setIsLoading(false)
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, fetchProfile])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signUp = async (data: SignUpData) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          phone: data.phone,
        },
      },
    })

    if (!error && authData.user) {
      await supabase.from('profiles').upsert({
        id: authData.user.id,
        email: data.email,
        full_name: data.fullName,
        phone: data.phone || null,
        role: 'customer',
        customer_type: 'new',
      })
    }

    return { error }
  }

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setSession(null)
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    return { error }
  }

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return { error: new Error('Not authenticated') }

    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', user.id)

    if (!error) {
      await fetchProfile(user.id)
    }

    return { error: error ? new Error(error.message) : null }
  }

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super-admin'

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        isAdmin,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

### 2.3 Auth Pages Structure

```
app/
├── (auth)/
│   ├── layout.tsx          # Auth layout (centered, branded)
│   ├── login/
│   │   └── page.tsx        # Login form
│   ├── register/
│   │   └── page.tsx        # Registration form
│   ├── forgot-password/
│   │   └── page.tsx        # Password reset request
│   ├── reset-password/
│   │   └── page.tsx        # New password form
│   └── callback/
│       └── route.ts        # OAuth callback handler
```

### 2.4 Middleware Protection

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options) => response.cookies.set({ name, value, ...options }),
        remove: (name, options) => response.cookies.set({ name, value: '', ...options }),
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  const pathname = request.nextUrl.pathname

  // Admin routes protection
  if (pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login?redirect=/admin', request.url))
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
    
    if (!profile || !['admin', 'super-admin'].includes(profile.role)) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Account routes protection
  if (pathname.startsWith('/account')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login?redirect=' + pathname, request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*', '/checkout'],
}
```

---

## Phase 3: Product Catalog (Week 3-4)

### 3.1 Product Data Service

```typescript
// lib/tidb/products.ts
import { tidb } from './connection'

export interface ProductFilters {
  category?: string
  priceMin?: number
  priceMax?: number
  colors?: string[]
  sizes?: string[]
  fabric?: string[]
  availability?: string
  isFeatured?: boolean
  isNewArrival?: boolean
}

export async function getProducts(options: {
  page?: number
  limit?: number
  search?: string
  filters?: ProductFilters
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'popular'
}) {
  const { page = 1, limit = 20, search, filters, sort = 'newest' } = options
  const offset = (page - 1) * limit
  const params: any[] = []

  let whereClause = 'WHERE p.is_active = true AND p.is_deleted = false'

  if (filters?.category) {
    whereClause += ' AND c.slug = ?'
    params.push(filters.category)
  }

  if (search) {
    whereClause += ' AND MATCH(p.title, p.description) AGAINST(? IN NATURAL LANGUAGE MODE)'
    params.push(search)
  }

  if (filters?.priceMin) {
    whereClause += " AND JSON_EXTRACT(p.pricing, '$.base') >= ?"
    params.push(filters.priceMin)
  }

  if (filters?.priceMax) {
    whereClause += " AND JSON_EXTRACT(p.pricing, '$.base') <= ?"
    params.push(filters.priceMax)
  }

  if (filters?.isFeatured) {
    whereClause += ' AND p.is_featured = true'
  }

  if (filters?.isNewArrival) {
    whereClause += ' AND p.is_new_arrival = true'
  }

  const sortMap = {
    'newest': 'p.created_at DESC',
    'price-asc': "JSON_EXTRACT(p.pricing, '$.base') ASC",
    'price-desc': "JSON_EXTRACT(p.pricing, '$.base') DESC",
    'popular': 'p.purchases DESC, p.views DESC'
  }

  const query = `
    SELECT 
      p.id, p.title, p.slug, p.short_description,
      p.pricing, p.primary_image, p.thumbnail_image,
      p.is_featured, p.is_new_arrival, p.is_best_seller,
      p.availability, p.average_rating, p.total_reviews,
      c.name as category_name, c.slug as category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ${whereClause}
    ORDER BY ${sortMap[sort]}
    LIMIT ? OFFSET ?
  `
  
  params.push(limit, offset)

  const products = await tidb.execute(query, params)

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total 
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ${whereClause}
  `
  const countResult = await tidb.execute(countQuery, params.slice(0, -2))

  return {
    products,
    pagination: {
      page,
      limit,
      total: countResult[0]?.total || 0,
      totalPages: Math.ceil((countResult[0]?.total || 0) / limit)
    }
  }
}

export async function getProductBySlug(slug: string) {
  const product = await tidb.execute(`
    SELECT 
      p.*,
      c.name as category_name,
      c.slug as category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.slug = ? AND p.is_active = true AND p.is_deleted = false
  `, [slug])

  if (!product.length) return null

  // Get images
  const images = await tidb.execute(
    'SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order',
    [product[0].id]
  )

  // Get variants
  const variants = await tidb.execute(
    'SELECT * FROM product_variants WHERE product_id = ? AND is_available = true',
    [product[0].id]
  )

  // Get reviews summary
  const reviewStats = await tidb.execute(`
    SELECT 
      COUNT(*) as total,
      AVG(rating) as average,
      SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
      SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
      SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
      SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
      SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
    FROM reviews 
    WHERE product_id = ? AND is_approved = true
  `, [product[0].id])

  // Increment view count (fire and forget)
  tidb.execute('UPDATE products SET views = views + 1 WHERE id = ?', [product[0].id])

  return {
    ...product[0],
    images,
    variants,
    reviewStats: reviewStats[0]
  }
}

export async function getRelatedProducts(productId: string, categoryId: string, limit = 4) {
  return tidb.execute(`
    SELECT id, title, slug, pricing, thumbnail_image, average_rating
    FROM products 
    WHERE category_id = ? 
      AND id != ? 
      AND is_active = true 
      AND is_deleted = false
    ORDER BY purchases DESC
    LIMIT ?
  `, [categoryId, productId, limit])
}
```

### 3.2 Server Actions

```typescript
// app/actions/products.ts
'use server'

import { getProducts, getProductBySlug, getRelatedProducts } from '@/lib/tidb/products'
import { getCategoriesTree } from '@/lib/tidb/categories'

export async function fetchProducts(options: ProductQueryOptions) {
  return await getProducts(options)
}

export async function fetchProduct(slug: string) {
  return await getProductBySlug(slug)
}

export async function fetchCategories() {
  return await getCategoriesTree()
}

export async function fetchRelatedProducts(productId: string, categoryId: string) {
  return await getRelatedProducts(productId, categoryId)
}

export async function trackProductView(productId: string, sessionId: string) {
  // Track in analytics
  await tidb.execute(`
    INSERT INTO analytics_events (event_type, product_id, session_id, data, created_at)
    VALUES ('product_view', ?, ?, '{}', NOW())
  `, [productId, sessionId])
}
```

### 3.3 Product Components

```
components/shop/
├── ProductCard.tsx           # Product card for grids
├── ProductGrid.tsx           # Responsive product grid
├── ProductGallery.tsx        # Image gallery with zoom
├── ProductInfo.tsx           # Title, price, rating
├── ProductFilters.tsx        # Filter sidebar/drawer
├── ProductSort.tsx           # Sort dropdown
├── QuickView.tsx             # Quick view modal
├── ColorSwatch.tsx           # Color selection
├── SizeSelector.tsx          # Size buttons
├── PriceDisplay.tsx          # Price with discount
├── StockBadge.tsx            # In stock/Out of stock
├── WishlistButton.tsx        # Add to wishlist
├── AddToCartButton.tsx       # Add to cart with quantity
└── ReviewsSummary.tsx        # Star rating display
```

### Deliverables Phase 2-3
- [ ] Auth context with all methods
- [ ] Login/Register pages
- [ ] Google OAuth working
- [ ] Password reset flow
- [ ] Route protection middleware
- [ ] TiDB product queries
- [ ] Product listing page
- [ ] Product detail page
- [ ] Search functionality
- [ ] Filters and sorting
- [ ] Category navigation
