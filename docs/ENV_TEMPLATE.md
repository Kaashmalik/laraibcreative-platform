# Environment Variables Template

Copy these to your `.env.local` file in the `frontend/` directory.

```env
# ===========================================
# SUPABASE (Auth, Profiles, Cart, Storage)
# ===========================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ===========================================
# TIDB CLOUD (Products, Orders, Analytics)
# ===========================================
TIDB_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
TIDB_PORT=4000
TIDB_USER=your_tidb_username
TIDB_PASSWORD=your_tidb_password
TIDB_DATABASE=laraibcreative

# ===========================================
# CLOUDINARY (Public Images - Products, Banners)
# ===========================================
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your_api_secret

# ===========================================
# APP CONFIGURATION
# ===========================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=LaraibCreative
NEXT_PUBLIC_CURRENCY=PKR

# ===========================================
# PAYMENT GATEWAYS (Phase 4-5)
# ===========================================
# JazzCash
JAZZCASH_MERCHANT_ID=
JAZZCASH_PASSWORD=
JAZZCASH_INTEGRITY_SALT=
JAZZCASH_ENDPOINT=https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform

# EasyPaisa
EASYPAISA_STORE_ID=
EASYPAISA_HASH_KEY=

# ===========================================
# NOTIFICATIONS (Phase 5)
# ===========================================
# WhatsApp Business API
WHATSAPP_PHONE_ID=
WHATSAPP_TOKEN=
WHATSAPP_VERIFY_TOKEN=

# Email (Resend recommended)
RESEND_API_KEY=

# ===========================================
# ANALYTICS & MONITORING
# ===========================================
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
SENTRY_DSN=

# ===========================================
# SECURITY
# ===========================================
NEXTAUTH_SECRET=generate_a_random_32_char_string
ENCRYPTION_KEY=generate_a_random_32_char_string

# ===========================================
# AI CONTENT GENERATION (Google Gemini - FREE!)
# ===========================================
GEMINI_API_KEY=AIza-your-key-from-google-ai-studio
GEMINI_MODEL=gemini-1.5-flash
```

---

## Backend Environment Variables (`.env` in backend/)

```env
# ===========================================
# SERVER
# ===========================================
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# ===========================================
# TIDB CLOUD DATABASE
# ===========================================
TIDB_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
TIDB_PORT=4000
TIDB_USER=your_username
TIDB_PASSWORD=your_password
TIDB_DATABASE=laraibcreative

# ===========================================
# JWT AUTHENTICATION
# ===========================================
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars_long
JWT_REFRESH_SECRET=your_refresh_secret_key_at_least_32_chars
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# ===========================================
# CLOUDINARY
# ===========================================
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ===========================================
# AI CONTENT GENERATION (Google Gemini)
# ===========================================
GEMINI_API_KEY=AIza-your-key-from-google-ai-studio
GEMINI_MODEL=gemini-1.5-flash

# ===========================================
# EMAIL (Optional)
# ===========================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=LaraibCreative <noreply@laraibcreative.com>

# ===========================================
# WHATSAPP (Optional)
# ===========================================
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=
```

---

## Setup Instructions

### 1. Supabase Setup
1. Go to [supabase.com](https://supabase.com) → Create project
2. Settings → API → Copy URL and anon key
3. Run migrations from `/supabase/migrations/`

### 2. TiDB Cloud Setup
1. Go to [tidbcloud.com](https://tidbcloud.com) → Create Serverless cluster
2. Select region: **Singapore** (closest to Pakistan)
3. Create database: `laraibcreative`
4. Get connection details from Connect → Web SQL Editor
5. Run schema from `/docs/TIDB_SCHEMA.md`

### 3. Cloudinary Setup
1. Go to [cloudinary.com](https://cloudinary.com) → Sign up
2. Dashboard → Copy cloud name, API key, API secret
3. Create folders: `laraibcreative/products`, `laraibcreative/categories`

### 4. Supabase Storage Buckets
Create these buckets in Supabase Dashboard → Storage:

| Bucket | Public | Description |
|--------|--------|-------------|
| `review-images` | Yes | Customer review photos |
| `order-attachments` | No | Custom design references |
| `payment-receipts` | No | Bank transfer proofs |
| `profile-images` | Yes | User avatars |
| `custom-designs` | No | Admin uploaded designs |

---

## Verification Checklist

- [ ] Supabase project created
- [ ] Supabase migrations applied
- [ ] TiDB cluster created
- [ ] TiDB schema applied
- [ ] Cloudinary account set up
- [ ] Storage buckets created
- [ ] Environment variables added
- [ ] `npm run dev` works without errors
