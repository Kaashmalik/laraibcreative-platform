# Database Setup Guide - LaraibCreative Platform

Complete guide to set up Supabase (PostgreSQL) and TiDB Cloud databases.

---

## ✅ Prerequisites Checklist

- [x] Supabase CLI installed (`supabase --version`)
- [x] Environment variables configured (`.env.local`)
- [x] Supabase project created
- [ ] Migrations applied
- [ ] TiDB Cloud cluster ready
- [ ] Storage buckets configured

---

## Part 1: Supabase Setup (User Data, Auth, Realtime)

### Step 1: Verify Environment Variables

Your `.env.local` should have:
```env
NEXT_PUBLIC_SUPABASE_URL=https://ccuaofvscpnvzzfedwbd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

✅ **Status**: Already configured

### Step 2: Apply Supabase Migrations

We have 4 migration files to apply:

1. **00001_initial_schema.sql** - Core tables (profiles, addresses)
2. **00002_rls_policies.sql** - Row Level Security
3. **00003_cart_and_storage.sql** - Cart, measurements, storage
4. **00004_loyalty_referrals.sql** - Loyalty & referral system

#### Manual Application (Supabase Dashboard)

Since CLI linking requires additional permissions, apply via Dashboard:

1. Go to: https://supabase.com/dashboard/project/ccuaofvscpnvzzfedwbd
2. Navigate to: **SQL Editor**
3. Copy and execute each migration file in order:

```bash
# Run in Supabase SQL Editor (in order):
1. supabase/migrations/00001_initial_schema.sql
2. supabase/migrations/00002_rls_policies.sql
3. supabase/migrations/00003_cart_and_storage.sql
4. supabase/migrations/00004_loyalty_referrals.sql
```

### Step 3: Create Storage Buckets

In Supabase Dashboard → **Storage**:

#### Create Buckets:

1. **`review-images`** (Public)
   - Settings: Public bucket, Max file size: 5MB
   - Allowed types: `image/jpeg, image/png, image/webp`

2. **`order-attachments`** (Private)
   - Settings: Private, Max file size: 10MB
   - Auth users only

3. **`payment-receipts`** (Private)
   - Settings: Private, Max file size: 5MB
   - Auth users only

4. **`profile-images`** (Public)
   - Settings: Public, Max file size: 2MB
   - Allowed types: `image/jpeg, image/png, image/webp`

5. **`measurement-references`** (Private)
   - Settings: Private, Max file size: 5MB
   - Auth users only

### Step 4: Configure Storage Policies

RLS policies for storage are included in migration 00003. Verify in Dashboard → Storage → Policies.

### Step 5: Update TypeScript Types

Generate Supabase types:

```bash
cd frontend
npx supabase gen types typescript --project-id ccuaofvscpnvzzfedwbd > src/types/supabase-generated.ts
```

Then merge with existing `src/types/supabase.ts`.

---

## Part 2: TiDB Cloud Setup (Products, Orders, Analytics)

### Step 1: Create TiDB Cluster

1. Go to: https://tidbcloud.com/
2. Create a **Serverless Tier** cluster
3. Name: `laraibcreative-prod`
4. Region: Choose closest to your users

### Step 2: Get Connection Details

From TiDB Dashboard → **Connect**:

```env
TIDB_HOST=gateway01.us-east-1.prod.aws.tidbcloud.com
TIDB_PORT=4000
TIDB_USER=<your-username>
TIDB_PASSWORD=<your-password>
TIDB_DATABASE=laraibcreative
```

Add these to `.env.local`

### Step 3: Run TiDB Schema

1. TiDB Dashboard → **SQL Editor**
2. Execute the schema from: `docs/TIDB_SCHEMA.md`

Tables created:
- `categories` - Product categories
- `products` - Product catalog
- `product_variants` - Size/color variants
- `orders` - Order records
- `order_items` - Order line items
- `reviews` - Product reviews

### Step 4: Verify TiDB Connection

Test connection from frontend:

```bash
cd frontend
node -e "import('@/lib/tidb/connection').then(({tidb}) => tidb.execute('SELECT 1').then(() => console.log('TiDB Connected!')))"
```

---

## Part 3: Seed Data (Optional)

### Seed Categories & Products

```bash
cd backend
npm run seed:categories
npm run seed:products
```

Or manually insert via TiDB SQL Editor using seed data from `backend/src/seeds/`.

---

## Part 4: Verify Complete Setup

### Checklist:

- [ ] Supabase migrations applied (all 4)
- [ ] Storage buckets created (5 total)
- [ ] TiDB schema created (6 tables)
- [ ] Environment variables set
- [ ] TypeScript types generated
- [ ] Frontend builds without errors
- [ ] Can create user account
- [ ] Can add items to cart
- [ ] Products display on shop page

### Test Connections:

**Supabase:**
```bash
cd frontend
npm run dev
# Visit http://localhost:3000 and signup
```

**TiDB:**
```bash
# Should see products on shop page
```

---

## Part 5: Missing Tables in Supabase Types

Currently missing from `src/types/supabase.ts`:
- `loyalty_transactions`
- `cart_items`
- `referrals`
- `measurements`

These need to be added to fix TypeScript errors. See next section.

---

## Troubleshooting

### Supabase CLI Linking Issues

If `supabase link` fails with permission errors:
1. Use Supabase Dashboard SQL Editor instead
2. Or authenticate CLI: `supabase login`
3. Generate access token from: https://supabase.com/dashboard/account/tokens

### TiDB Connection Timeout

- Check firewall allows port 4000
- Verify credentials in `.env.local`
- Ensure cluster is running (not paused)

### TypeScript Errors

Run: `npm run type-check`

Common issues:
- Missing table types → regenerate types
- `never` type errors → tables not in schema

---

## Next Steps

1. Apply Supabase migrations (Dashboard SQL Editor)
2. Create storage buckets
3. Set up TiDB cluster and run schema
4. Generate and update TypeScript types
5. Seed initial data
6. Test user flow end-to-end

**Need help?** Check individual migration files in `supabase/migrations/` for detailed SQL.
