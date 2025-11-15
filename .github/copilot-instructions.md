# LaraibCreative Platform - AI Coding Instructions

Quick reference for AI agents helping develop this Next.js + Express + MongoDB e-commerce platform.

## Architecture Overview

**Monorepo Structure:**
- `frontend/` – Next.js 14 (App Router, SSR/SSG)
- `backend/` – Express.js API (REST, v1 versioning)
- `database/` – MongoDB schemas and migrations

**Key Integration:** Frontend API calls via Axios → Backend `/api/v1/*` → MongoDB. JWT auth tokens stored in localStorage (frontend) and validated on each request.

## System Boundaries & Data Flows

### Authentication Flow
1. User submits email/password to `/api/auth/login`
2. Backend validates, returns JWT token + user object
3. Frontend stores token in localStorage, sets Axios default header
4. Subsequent requests auto-include `Authorization: Bearer <token>`
5. Backend `auth.middleware.js` verifies JWT; expired tokens trigger 401 → redirect to `/auth/login`

**Key Files:** `frontend/src/context/AuthContext.jsx`, `backend/src/middleware/auth.middleware.js`, `frontend/src/lib/axios.js`

### Order-to-Fulfillment
1. Customer adds items to cart (CartContext) → stored in state + localStorage
2. Checkout flow: shipping address → payment method (manual upload)
3. POST `/api/orders` creates Order doc with status="Pending Payment"
4. For manual payments: Receipt uploaded via Cloudinary, status → "Pending Verification"
5. Admin verifies receipt, updates status → "Processing", "Shipped", "Delivered"
6. Customer tracks via `/api/orders/track/:orderNumber` (public endpoint)

**Key Files:** `backend/src/models/Order.js`, `backend/src/controllers/orderController.js`, `frontend/src/app/(customer)/orders/`

### Measurement System
- Custom stitching orders collect measurements separately from products
- Measurements stored in `Measurement` model linked to User for reusability
- `POST /api/measurements` stores body dimensions, reference images (via Cloudinary)
- Measurements retrieved and displayed in `/account/measurements`

**Key Files:** `backend/src/models/Measurement.js`, `frontend/src/app/(customer)/account/measurements/`

## Project-Specific Patterns & Conventions

### Backend (Express + MongoDB)

**File Structure:**
- `models/` – Mongoose schemas (User, Product, Order, Measurement, Category, Blog, Review, Settings)
- `controllers/` – Route handlers with business logic (use async/await)
- `routes/` – Route definitions; all mounted under `/api/v1/`
- `middleware/` – Auth, validation, error handling, logging
- `services/` – Business logic helpers (orderService, paymentService, analyticsService)
- `utils/` – Utilities (emailService, pdfGenerator, imageProcessor, validators)
- `config/` – DB connection, external APIs (Cloudinary, email, WhatsApp)

**Error Handling:**
- Use centralized `errorHandler.js` middleware (handles Mongoose, JWT, Multer errors)
- Return consistent JSON: `{ success: boolean, message: string, data?: object, error?: object }`
- HTTP status codes: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 404 (Not Found), 409 (Conflict), 422 (Validation), 500 (Server Error)

**Database Connection:**
- `src/config/db.js` manages MongoDB connection with retry logic
- Environment: `MONGODB_URI`, `NODE_ENV`, `JWT_SECRET`, `CLOUDINARY_*`, `SMTP_*`
- Connection pooling: maxPoolSize=10, retryWrites=true, compressors=['zlib']

**Key Middleware:**
- `auth.middleware.js` – Verifies JWT, attaches user to `req.user`
- `admin.middleware.js` – Checks if `req.user.role === 'admin'`
- `validate.middleware.js` – Validates request body against Joi schemas
- `rateLimiter.js` – Applied to `/api/` (100 req/15min), stricter on `/auth/login` (5 attempts/15min)
- `upload.middleware.js` – Multer config for Cloudinary uploads

**Validation Pattern:**
Use Joi for request body validation in routes, e.g.:
```javascript
const schema = Joi.object({ email: Joi.string().email().required() });
const { error, value } = schema.validate(req.body);
if (error) return res.status(400).json({ success: false, message: error.details[0].message });
```

### Frontend (Next.js 14 + React)

**App Router Structure:**
- `app/(customer)/` – Public routes (products, cart, checkout, account)
- `app/(admin)/` – Protected admin routes (dashboard, orders, products management)
- `app/api/` – Backend API routes (mostly unused; calls direct to `backend/` via Axios)

**Component Hierarchy:**
- `components/ui/` – Reusable headless UI (Button, Modal, Input, Card, etc.)
- `components/customer/` – Customer-facing components (Header, Footer, ProductCard, etc.)
- `components/admin/` – Admin panel components (AdminSidebar, DataTable, Charts)
- `components/shared/` – ProtectedRoute, ErrorBoundary, SEO

**State Management:**
- **Auth:** React Context + localStorage (see `AuthContext.jsx`)
- **Cart:** React Context + localStorage (see `CartContext.jsx`)
- **UI/Toast:** React Context (see `ToastContext.jsx`)
- **Zustand Stores:** `store/authStore.js`, `store/cartStore.js`, `store/uiStore.js` (optional, prefer Context for this codebase)

**Axios Configuration:**
- `frontend/src/lib/axios.js` – Interceptors for:
  - Auto-inject auth token in headers
  - Retry failed requests (2 retries, exponential backoff)
  - Handle 401 → clear token, redirect to login
  - Toast errors to user (via react-hot-toast)
  - Log requests/responses in dev mode

**Form Validation:**
- Use `react-hook-form` + Zod schemas (`frontend/src/lib/validations.js`)
- Example: `<input {...register('email')} />` with error display from `formState.errors`

**Styling:**
- Tailwind CSS with custom config (`tailwind.config.js`)
- Global styles in `globals.css`
- Use utility classes; minimize custom CSS

**SEO (App Router):**
- Export `generateMetadata()` in route segments (e.g., `app/(customer)/products/[id]/page.jsx`)
- Include title, description, openGraph, twitter cards
- Use `Metadata` type for type safety

**Next.js Image Optimization:**
- Currently disabled (`unoptimized: true` in next.config.js) due to build timeout issues
- To enable: ensure Cloudinary URLs are in `images.domains`, test locally

## Developer Workflows

### Getting Started (Local Development)

**Backend:**
```bash
cd backend
npm install
cp .env.example .env          # Edit MONGODB_URI, JWT_SECRET, etc.
npm run dev                    # Starts on http://localhost:5000
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env.local     # Edit NEXT_PUBLIC_API_URL=http://localhost:5000
npm run dev                    # Starts on http://localhost:3000
```

### Running Tests

**Backend:**
```bash
npm run test                   # Jest + coverage
npm run test:watch            # Watch mode
```

**Frontend:**
- No test suite currently configured (consider adding Jest + React Testing Library)

### Linting & Formatting

**Backend:**
```bash
npm run lint                   # ESLint check
npm run lint:fix              # Auto-fix
npm run format                # Prettier
```

**Frontend:**
```bash
npm run lint                   # Next.js ESLint
npm run lint:fix              # Auto-fix
npm run format                # Prettier
npm run type-check            # TypeScript check (if enabled)
```

### Building & Deployment

**Backend:**
```bash
npm start                      # Production start
# Logs to backend/logs/error.log and combined.log
```

**Frontend:**
```bash
npm run build                  # Build SSR/SSG bundle
npm run start                  # Serve production build
# Timeout issues: see next.config.js staticPageGenerationTimeout=300
```

**Health Checks:**
- Backend: `GET http://localhost:5000/health` → returns uptime, DB status, environment
- Frontend: Visit homepage; check browser console for API errors

### Database Seeding

```bash
cd backend
npm run seed                   # Run all seeds
npm run seed:categories       # Seed categories only
npm run seed:products         # Seed products only
npm run seed:settings         # Seed settings only
```

See `backend/src/seeds/` for seed data structure.

### Database Backups

```bash
cd backend
npm run backup                 # Backs up MongoDB to `database/backups/`
```

## Integration Points & External Services

### Cloudinary (Image Storage)
- Config: `backend/src/config/cloudinary.js`
- Upload via `multer-storage-cloudinary` in routes (e.g., `/api/upload`, product images, measurement references)
- Environment: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

### Email (Nodemailer)
- Config: `backend/src/config/email.js`
- Service: `backend/src/utils/emailService.js` (uses templates from `emailTemplates.js`)
- Used for: order confirmations, password resets, notifications
- SMTP environment: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`

### WhatsApp (Twilio)
- Config: `backend/src/config/whatsapp.js`
- Service: `backend/src/utils/whatsappService.js`
- Sends order status updates, payment reminders, shipping notifications
- Environment: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER`

### PDF Generation
- Utility: `backend/src/utils/pdfGenerator.js`
- Used for order invoices (generated on `GET /api/orders/:id/invoice`)

## Common Task Patterns

### Adding a New REST Endpoint

1. **Define Model** → `backend/src/models/NewThing.js` (Mongoose schema with timestamps, indexes)
2. **Create Controller** → `backend/src/controllers/newThingController.js` (export async functions)
3. **Create Route** → `backend/src/routes/newThing.routes.js` (define endpoints, middleware)
4. **Mount Route** → `backend/src/routes/index.js` (add `router.use('/v1/newThing', newThingRoutes)`)
5. **Test** → Use Postman or Jest tests in `backend/tests/`
6. **Update Frontend** → Add methods to `frontend/src/lib/api.js` (api.newThing.getAll(), etc.)

### Adding a New Frontend Page

1. **Create Route File** → `frontend/src/app/(customer)/newPage/page.jsx` or `app/(admin)/newPage/page.jsx`
2. **Add Metadata** → Export `generateMetadata()` in the page file
3. **Fetch Data** → Use Axios (`import api from '@/lib/api'`) inside `async` or useEffect
4. **Layout/Navigation** → Ensure links in Header/Sidebar point to new route
5. **Error Boundary** → Wrap async operations in try-catch; show ErrorBoundary fallback

### Protecting Admin Routes

- Use `ProtectedRoute.jsx` wrapper or manual role check in component
- Check `req.user.role === 'admin'` in backend routes via `admin.middleware.js`
- Example: `router.delete('/products/:id', protect, admin, deleteProduct)`

### Handling File Uploads

- Frontend: Use `react-dropzone` for file input
- Backend: Route middleware uses `multer-storage-cloudinary`
- Response includes Cloudinary URL for accessing the file
- Example: `POST /api/upload` with FormData → returns `{ success: true, url: '...' }`

## Critical Debugging Hints

### Build Failures

**Frontend `npm run build` timeout (Exit 124):**
- Issue: Static generation taking too long (next.config.js `staticPageGenerationTimeout=300`)
- Fix: Disable image optimization (`unoptimized: true`) or reduce page count
- Check: `npm run build` locally; see which pages are slow; optimize data fetching

**Backend connection issues:**
- MongoDB cluster paused or firewall blocking
- Solution: Check MongoDB Atlas Network Access (add 0.0.0.0/0 for development)
- Use MongoDB Compass to test connection string
- Check `.env` file has correct `MONGODB_URI`

### API Errors

- Always check response envelope: `{ success: boolean, error?: { code, message }, data?: object }`
- JWT errors: Token expired or invalid → manual localStorage.clear() + page reload
- Validation errors: Check Joi schema in controller; frontend validates before sending
- Rate limiting: 429 response after 100 requests/15 min (per IP); auth endpoints stricter

### CORS Issues

- Frontend calls blocked? Verify `backend/server.js` corsOptions includes frontend URL
- Dev: `http://localhost:3000` should be allowed; production: whitelist specific domain
- Check: `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, credentials

## Conventions to Follow

### Naming
- **Controllers/Models:** PascalCase (ProductController, Order.js)
- **Functions/Variables:** camelCase (getProductById, isUserAdmin)
- **Routes:** kebab-case (/api/v1/custom-orders, /api/v1/user-measurements)
- **Components:** PascalCase (ProductCard.jsx, AdminSidebar.jsx)
- **CSS Classes:** lowercase + hyphens (product-grid, admin-header)

### Commit Messages
- Use conventional commits: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `test:`
- Example: `feat: add custom order measurement form` or `fix: handle JWT expiry on login`

### Error Messages
- User-facing: Friendly, non-technical ("Please check your connection")
- Logs: Include stack traces, request ID, timestamp for debugging
- Never expose sensitive info (file paths, secrets, DB errors) to frontend

### Documentation
- Add JSDoc comments for complex functions (e.g., file upload, async operations)
- Document Mongoose schema fields (use field descriptions in comments)
- Reference related files when explaining workflows

## Quick Reference Links

- **Models:** `backend/src/models/`
- **API Endpoints:** `backend/src/routes/` + `backend/src/controllers/`
- **Frontend State:** `frontend/src/context/` + `frontend/src/store/`
- **Utilities:** `backend/src/utils/` + `frontend/src/lib/`
- **Configuration:** `backend/src/config/` + `frontend/` env files
- **Middleware:** `backend/src/middleware/`
- **Database Connection:** `backend/src/config/db.js`
- **Axios Instance:** `frontend/src/lib/axios.js`
