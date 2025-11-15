# LaraibCreative Architecture Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRODUCTION DEPLOYMENT                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                           INTERNET                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTPS/TLS
                             ↓
                    ┌────────────────┐
                    │  DNS Provider  │
                    └────────┬───────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ↓              ↓              ↓
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │ Frontend     │ │ API Domain   │ │ Static CDN   │
    │ Domain       │ │ (API calls)  │ │ (Cloudinary) │
    │ laraib...com │ │ api.laraib...│ │ res.cloud... │
    └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
           │                │                │
           │ HTTP/2         │ HTTP/2         │
           ↓                ↓                │
    ┌────────────────────────────┐           │
    │      NGINX Reverse Proxy   │           │
    │   (Load Balancer/Cache)    │           │
    └────────────┬───────────────┘           │
                 │                           │
        ┌────────┴───────┐                   │
        │                │                   │
        ↓                ↓                   │
    ┌────────────┐  ┌─────────────┐          │
    │ Frontend   │  │  Backend    │          │
    │ Service    │  │  API        │          │
    │ (port 3000)│  │  (port 5000)│          │
    └────┬───────┘  └──────┬──────┘          │
         │                 │                 │
         │ Requests        │                 │
         └────────┬────────┘                 │
                  ↓                          │
         ┌────────────────┐                  │
         │   Express.js   │                  │
         │   API Server   │                  │
         └────────┬───────┘                  │
                  │                          │
    ┌─────────────┼─────────────┬───────────┐
    │             │             │           │
    ↓             ↓             ↓           ↓
┌────────┐  ┌─────────┐  ┌──────────┐  ┌───────────┐
│MongoDB │  │Nodemailer│  │Cloudinary│  │  Twilio  │
│Database│  │(Email)   │  │(Images)  │  │(WhatsApp) │
└────────┘  └─────────┘  └──────────┘  └───────────┘
```

## Local Development Setup

```
┌─────────────────────────────────────────────────────────────────┐
│                    LOCAL DEVELOPMENT                            │
└─────────────────────────────────────────────────────────────────┘

Terminal 1: Backend Development
┌─────────────────────────────────────────┐
│ $ npm run dev (backend/)                │
│ Express.js running on :5000             │
│ Nodemon watching for changes            │
│ Database: localhost:27017 (MongoDB)     │
└──────────────────┬──────────────────────┘
                   │
                   │ REST API
                   │ :5000/api/v1/*
                   │
Terminal 2: Frontend Development
┌──────────────────────────────────────────┐
│ $ npm run dev (frontend/)                │
│ Next.js Dev Server on :3000              │
│ Hot reload on file changes               │
│ Browser: http://localhost:3000           │
└──────────────────┬───────────────────────┘
                   │
                   │ Browser
                   │ Requests API calls
                   │
Terminal 3: Browser
┌──────────────────────────────────────────┐
│ $ open http://localhost:3000             │
│ - Browse products                        │
│ - Login/Register                         │
│ - Place orders                           │
│ - Access admin dashboard                 │
└──────────────────────────────────────────┘
```

## Docker Deployment

```
┌─────────────────────────────────────────────────────────────────┐
│               DOCKER COMPOSE STACK                              │
└─────────────────────────────────────────────────────────────────┘

$ docker-compose up -d

┌─────────────────────────────────────────────────────────────────┐
│                    Docker Network                               │
│              (laraib_network - bridge)                          │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  MongoDB     │  │  Backend     │  │  Frontend    │          │
│  │  Container   │  │  Container   │  │  Container   │          │
│  │  port 27017  │  │  port 5000   │  │  port 3000   │          │
│  │              │  │              │  │              │          │
│  │ Volumes:     │  │ Depends on:  │  │ Depends on:  │          │
│  │ - data/db    │  │ - MongoDB    │  │ - Backend    │          │
│  │ - data/cfg   │  │              │  │              │          │
│  └────────┬─────┘  └──────┬───────┘  └──────┬───────┘          │
│           │                │                │                  │
│           │ Network        │ Network        │ Network           │
│           └────────────────┼────────────────┘                  │
│                            │                                   │
│                    ┌───────┴────────┐                          │
│                    │                │                          │
│              ┌─────────────┐  ┌────────────┐                   │
│              │  Nginx      │  │  Health    │                   │
│              │  Reverse    │  │  Checks    │                   │
│              │  Proxy      │  │  (Monitor) │                   │
│              │ port 80/443 │  │            │                   │
│              └─────────────┘  └────────────┘                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Access:
- Frontend: http://localhost:3000
- Backend:  http://localhost:5000
- Database: localhost:27017
```

## Data Flow - User Authentication

```
User → Login Form
   │
   ├─→ Validate credentials
   │
   ├─→ POST /api/auth/login
   │   │
   │   └─→ Backend Express.js
   │       │
   │       ├─→ Hash password check (bcryptjs)
   │       │
   │       ├─→ Query MongoDB (User collection)
   │       │
   │       ├─→ Generate JWT token
   │       │
   │       └─→ Return token + user data
   │
   ├─→ Store token in localStorage
   │
   ├─→ Set Axios default header:
   │   Authorization: Bearer <token>
   │
   └─→ Redirect to dashboard
       All subsequent requests include token
```

## Data Flow - Order Placement

```
Customer → Add to Cart (CartContext)
   │
   ├─→ Store in state + localStorage
   │
Customer → Checkout
   │
   ├─→ Enter shipping address
   │
   ├─→ Select payment method (manual)
   │
   ├─→ POST /api/orders
   │   │
   │   └─→ Backend
   │       │
   │       ├─→ Validate order data
   │       │
   │       ├─→ Create Order document (MongoDB)
   │       │   Status: "Pending Payment"
   │       │
   │       ├─→ Send confirmation email (Nodemailer)
   │       │
   │       ├─→ Send WhatsApp notification (Twilio)
   │       │
   │       └─→ Return Order ID
   │
   ├─→ Show upload receipt form
   │
   ├─→ Upload receipt → Cloudinary
   │
   ├─→ PUT /api/orders/:id
   │   │
   │   └─→ Update order status:
   │       "Pending Verification"
   │
   └─→ Admin receives notification
       │
       ├─→ Admin verifies receipt
       │
       ├─→ PUT /api/orders/:id/status
       │   │
       │   └─→ Update status: "Processing"
       │
       ├─→ Customer gets email + WhatsApp update
       │
       └─→ Order ships & delivers
```

## File Upload Flow

```
Customer selects image
   │
   ├─→ react-dropzone component
   │
   ├─→ FormData with file
   │
   ├─→ POST /api/upload
   │   │
   │   └─→ Backend multer middleware
   │       │
   │       ├─→ Validate file (size, type)
   │       │
   │       ├─→ Upload to Cloudinary
   │       │
   │       ├─→ Get Cloudinary URL
   │       │
   │       └─→ Return { success: true, url: "..." }
   │
   └─→ Frontend stores URL
       └─→ Display in image preview
           └─→ Send URL when creating order/product
```

## Deployment Pipeline

```
┌────────────────────────────────────────────────────────────────┐
│                      CI/CD PIPELINE                            │
└────────────────────────────────────────────────────────────────┘

Developer
   │
   ├─→ git push origin main
   │
   ├─→ GitHub detects push
   │
   ├─→ Trigger GitHub Actions workflows
   │
   ├─→ BACKEND WORKFLOW (.github/workflows/backend.yml)
   │   ├─→ Setup Node.js 18
   │   ├─→ Install dependencies
   │   ├─→ Run ESLint
   │   ├─→ Run Jest tests
   │   ├─→ Build Docker image
   │   └─→ Deploy to production (if main branch)
   │
   ├─→ FRONTEND WORKFLOW (.github/workflows/frontend.yml)
   │   ├─→ Setup Node.js 18
   │   ├─→ Install dependencies
   │   ├─→ Run ESLint
   │   ├─→ Build Next.js app
   │   └─→ Deploy to Vercel (if main branch)
   │
   └─→ Deployment Complete
       ├─→ Backend running on production server
       └─→ Frontend served from CDN (Vercel)
```

## Database Schema Overview

```
┌──────────────────────────────────────────────────────────┐
│               MONGODB COLLECTIONS                        │
└──────────────────────────────────────────────────────────┘

┌─────────────┐
│   Users     │
├─────────────┤
│ _id         │ (ObjectId)
│ email       │ (unique)
│ password    │ (bcrypted)
│ fullName    │
│ role        │ (customer/admin)
│ addresses[] │ (embedded)
│ createdAt   │
└─────────────┘
      │
      │ One-to-Many
      ├─→ Orders[]
      ├─→ Measurements[]
      └─→ Reviews[]

┌─────────────┐
│  Products   │
├─────────────┤
│ _id         │
│ name        │
│ slug        │
│ price       │
│ category    │ → ref(Categories)
│ images[]    │ (Cloudinary URLs)
│ stock       │
│ createdAt   │
└─────────────┘
      │
      │ One-to-Many
      └─→ Reviews[]

┌─────────────┐
│   Orders    │
├─────────────┤
│ _id         │
│ orderNo     │ (unique, public)
│ user        │ → ref(Users)
│ items[]     │ (products + qty)
│ status      │ (Pending/Processing/Shipped)
│ receipt     │ (Cloudinary URL)
│ shipping    │
│ total       │
│ createdAt   │
└─────────────┘

┌─────────────────┐
│  Measurements   │
├─────────────────┤
│ _id             │
│ user            │ → ref(Users)
│ chest           │
│ waist           │
│ hip             │
│ shoulder        │
│ references[]    │ (images from Cloudinary)
│ createdAt       │
└─────────────────┘

┌─────────────┐
│ Categories  │
├─────────────┤
│ _id         │
│ name        │
│ slug        │
│ image       │
│ createdAt   │
└─────────────┘

┌─────────────┐
│   Reviews   │
├─────────────┤
│ _id         │
│ product     │ → ref(Products)
│ user        │ → ref(Users)
│ rating      │
│ comment     │
│ createdAt   │
└─────────────┘

┌─────────────┐
│    Blog     │
├─────────────┤
│ _id         │
│ title       │
│ slug        │
│ content     │
│ author      │ → ref(Users)
│ image       │
│ tags[]      │
│ createdAt   │
└─────────────┘

┌─────────────┐
│  Settings   │
├─────────────┤
│ _id         │
│ key         │ (siteName, seoTitle, etc)
│ value       │
│ updatedAt   │
└─────────────┘
```

## Deployment Options Comparison

```
┌─────────────────────────────────────────────────────────────┐
│         DEPLOYMENT OPTIONS COMPARISON                       │
└─────────────────────────────────────────────────────────────┘

┌──────────────┬──────────┬──────┬──────────┬──────────┐
│ Option       │ Ease     │ Cost │ Control  │ Scalable │
├──────────────┼──────────┼──────┼──────────┼──────────┤
│ Vercel+      │ ⭐⭐⭐⭐⭐│ $$$  │ ⭐⭐     │ ⭐⭐⭐⭐⭐│
│ Heroku       │          │      │          │          │
├──────────────┼──────────┼──────┼──────────┼──────────┤
│ DigitalOcean │ ⭐⭐⭐⭐ │ $$   │ ⭐⭐⭐⭐  │ ⭐⭐⭐⭐ │
│ Docker       │ +Docker  │      │          │          │
├──────────────┼──────────┼──────┼──────────┼──────────┤
│ AWS          │ ⭐⭐⭐   │ $$   │ ⭐⭐⭐⭐⭐│ ⭐⭐⭐⭐⭐│
│ ECS/EC2      │          │      │          │          │
├──────────────┼──────────┼──────┼──────────┼──────────┤
│ PM2 on VPS   │ ⭐⭐⭐   │ $    │ ⭐⭐⭐⭐⭐│ ⭐⭐⭐   │
│ Manual setup │          │      │          │          │
└──────────────┴──────────┴──────┴──────────┴──────────┘

⭐ = Rating (1 low to 5 high)
```

## Request/Response Lifecycle

```
Browser (Frontend)
   │
   ├─→ Make API Request
   │   (with Authorization header)
   │
   ├─→ Axios Interceptor
   │   ├─→ Add JWT token to header
   │   ├─→ Log request (dev mode)
   │   └─→ Add request ID
   │
   └─→ Nginx Reverse Proxy
       │
       ├─→ Rate limiting check
       │
       ├─→ CORS validation
       │
       └─→ Route to Backend
           │
           ├─→ Express.js
           │
           ├─→ Auth middleware (verify JWT)
           │
           ├─→ Validate request (Joi)
           │
           ├─→ Business logic
           │
           ├─→ Database query (MongoDB)
           │
           ├─→ Format response
           │
           └─→ Send response
               │
               ├─→ Nginx caches (if applicable)
               │
               └─→ Axios Response Interceptor
                   ├─→ Extract data
                   ├─→ Log response
                   ├─→ Handle errors
                   │
                   └─→ Return to Component
                       │
                       ├─→ Update state
                       │
                       ├─→ Render UI
                       │
                       └─→ Show toast notification
```

---

**These diagrams show the complete system architecture from local development through production deployment.**
