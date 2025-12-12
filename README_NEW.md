# 🎨 LaraibCreative - Complete E-Commerce Platform

![Build Status](https://img.shields.io/github/actions/workflow/status/Kaashmalik/laraibcreative-platform/backend.yml?branch=main&label=Backend&logo=github)
![Build Status](https://img.shields.io/github/actions/workflow/status/Kaashmalik/laraibcreative-platform/frontend.yml?branch=main&label=Frontend&logo=github)
![License](https://img.shields.io/badge/License-MIT-green.svg)
![Node Version](https://img.shields.io/badge/Node-18%2B-blue.svg)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-green.svg)

A **production-ready** e-commerce platform for bespoke Pakistani fashion with custom tailoring orders, admin dashboard, and comprehensive analytics.

🔗 **Live Demo:** [laraibcreative.com](https://laraibcreative.com)

---

## ✨ Key Features

### 👥 Customer Features
- 🛍️ **Full E-commerce** - Browse, filter, and purchase ready-to-wear products
- ✂️ **Custom Orders** - Place bespoke tailoring orders with measurements & fabric selection
- 👤 **User Accounts** - Profile management, saved addresses, order history
- 📦 **Order Tracking** - Real-time status updates and delivery tracking
- 💬 **Reviews & Ratings** - Customer feedback and product reviews
- 📝 **Blog & Resources** - Educational content, style guides, sizing info
- ❤️ **Wishlist** - Save favorite items for later

### 🔧 Admin Features
- 📊 **Analytics Dashboard** - Revenue, orders, popular products, customer insights
- 📋 **Order Management** - View, update status, verify payments, generate invoices
- 🛒 **Product Management** - Create/edit products, manage inventory and images
- 🤖 **AI Content Generator** - Auto-generate descriptions, SEO keywords, meta content
- 👨‍💼 **Customer Management** - CRM features, order history, measurements
- 📝 **Content Management** - Blog posts, homepage content, site settings
- 📧 **Notifications** - Email and WhatsApp communications
- 💳 **Payment Verification** - Receipt validation and order confirmation

---

## 🏗️ Architecture

**Monorepo Structure:**
```
laraibcreative/
├── frontend/                 # Next.js 14 SPA
├── backend/                  # Express.js REST API
├── database/                 # MongoDB schemas
├── docker-compose.yml        # Docker orchestration
├── nginx.conf               # Production reverse proxy
└── docs/                    # Documentation
```

**Tech Stack:**
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14, React 18, Tailwind CSS | User interface, SSR/SSG |
| Backend | Express.js, Node.js 18 | REST API, business logic |
| Database | MongoDB, Mongoose | Data persistence, schemas |
| File Storage | Cloudinary | Image optimization & CDN |
| Email | Nodemailer | Transactional emails |
| Messaging | Twilio | WhatsApp notifications |
| Deployment | Docker, Vercel, PM2 | Containerization & hosting |

---

## 🚀 Quick Start

### 5-Minute Local Setup

**Prerequisites:** Node.js 18+, MongoDB (local or cloud), Git

```bash
# Clone repository
git clone https://github.com/Kaashmalik/laraibcreative-platform.git
cd laraibcreative-platform

# Setup environment
bash setup-env.sh

# Start backend (Terminal 1)
cd backend && npm install && npm run dev

# Start frontend (Terminal 2)
cd frontend && npm install && npm run dev

# Open browser
open http://localhost:3000
```

**👉 See [QUICKSTART.md](./QUICKSTART.md) for detailed setup & troubleshooting**

---

## 🐳 Docker Deployment

**One-command deployment:**

```bash
# Setup environment
cp .env.example .env
nano .env  # Configure values

# Start all services
docker-compose up -d

# Access
# Frontend: http://localhost:3000
# Backend:  http://localhost:5000
```

---

## 📦 Installation & Setup

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit configuration
nano .env

# Run migrations (if any)
npm run migrate

# Seed database with sample data
npm run seed

# Start development server
npm run dev
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Update API URL
# NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Start development server
npm run dev
```

---

## 🧪 Testing & Quality

```bash
# Backend Tests
cd backend
npm run test              # Run all tests
npm run test:watch       # Watch mode with coverage
npm run lint             # ESLint check
npm run lint:fix         # Auto-fix issues

# Frontend Linting
cd frontend
npm run lint             # Next.js ESLint
npm run lint:fix         # Auto-fix
```

---

## 🏢 Production Deployment

### Option 1: Vercel (Recommended for Frontend)

```bash
cd frontend
vercel --prod
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full guide.

### Option 2: Docker on VPS/Cloud

```bash
docker-compose -f docker-compose.yml up -d
```

### Option 3: Traditional PM2 Deployment

```bash
# Backend
cd backend && npm install
pm2 start server.js --name "laraib-backend"

# Frontend
cd frontend && npm run build
pm2 start "npm start" --name "laraib-frontend"
```

**👉 See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment guide**

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [QUICKSTART.md](./QUICKSTART.md) | 5-minute setup guide |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Production deployment guide |
| [docs/AI_SETUP_GUIDE.md](./docs/AI_SETUP_GUIDE.md) | AI content generation setup |
| [.github/copilot-instructions.md](./.github/copilot-instructions.md) | AI agent guidelines |
| [docs/API.md](./docs/API.md) | API endpoint documentation |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System design & data flows |

---

## 🔄 Data Flows

### User Authentication
```
User → Login Form → Backend Auth → JWT Token → localStorage → Authorized Requests
```

### Order Placement
```
Cart (ClientContext) → Checkout Form → POST /api/orders → MongoDB Order Doc → Email Confirmation
```

### Custom Order
```
Order Form → Measurements + Images → Cloudinary → Database → Admin Verification → Order Processing
```

---

## 📝 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/laraibcreative
JWT_SECRET=your_secure_random_key_min_32_chars
CLOUDINARY_CLOUD_NAME=your_cloud_name
SMTP_HOST=smtp.gmail.com
TWILIO_ACCOUNT_SID=your_twilio_sid

# AI Content Generation (Google Gemini - FREE!)
GEMINI_API_KEY=AIza-your-key-from-google-ai-studio
GEMINI_MODEL=gemini-1.5-flash
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_APP_URL=https://laraibcreative.com
```

---

## 🛠️ Key Commands

### Backend
```bash
npm run dev              # Development server with auto-reload
npm run build            # Production build
npm start                # Start production server
npm run test             # Run tests with coverage
npm run seed             # Populate database with sample data
npm run lint             # Code quality checks
npm run lint:fix         # Auto-fix linting issues
npm run backup            # Backup MongoDB database
```

### Frontend
```bash
npm run dev              # Development server with hot reload
npm run build            # Production-ready build
npm start                # Serve production build
npm run lint             # ESLint & Next.js lint
npm run lint:fix         # Auto-fix linting issues
npm run type-check       # TypeScript type checking
npm run format           # Prettier code formatting
```

### Docker
```bash
docker-compose up -d     # Start all services in background
docker-compose down      # Stop all services
docker-compose logs -f   # View live logs
docker-compose ps        # Show service status
```

---

## 📊 API Overview

**Base URL:** `http://localhost:5000/api/v1`

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout
- `GET /auth/verify-token` - Verify JWT token

### Products
- `GET /products` - List all products (paginated)
- `GET /products/:id` - Get product details
- `POST /products` - Create product (admin)
- `PUT /products/:id` - Update product (admin)
- `DELETE /products/:id` - Delete product (admin)

### Orders
- `GET /orders` - User's orders
- `POST /orders` - Create order
- `GET /orders/:id` - Order details
- `PUT /orders/:id/status` - Update order status (admin)
- `GET /orders/track/:orderNumber` - Public order tracking

### Measurements
- `POST /measurements` - Save measurements
- `GET /measurements` - User's measurements
- `PUT /measurements/:id` - Update measurements

**Full API docs:** See [docs/API.md](./docs/API.md)

---

## 🏪 Admin Panel

Access at: `http://localhost:3000/admin/dashboard`

**Features:**
- 📈 Real-time analytics and KPIs
- 📦 Order management and fulfillment
- 🛒 Product catalog management
- 👥 Customer relationship management (CRM)
- 📝 Blog and content management
- ⚙️ System settings and configurations

---

## 🔐 Security Features

- ✅ JWT token-based authentication
- ✅ Password hashing with bcryptjs
- ✅ CORS configuration for API security
- ✅ Rate limiting on auth endpoints
- ✅ MongoDB injection prevention
- ✅ XSS and CSRF protection headers
- ✅ Environment variable validation
- ✅ HTTPS/TLS support in production

---

## 📈 Performance Optimizations

- 🚀 Next.js Image optimization with Cloudinary
- 🗜️ Gzip compression on API responses
- 📦 Code splitting and lazy loading
- 💾 MongoDB connection pooling
- ⚡ Redis caching (optional)
- 🔄 Incremental Static Regeneration (ISR)
- 📊 Bundled with SWC for fast builds

---

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error**
```bash
# Check connection string in .env
# Whitelist IP in MongoDB Atlas (0.0.0.0/0 for dev)
# Verify internet connection
```

**Port Already in Use**
```bash
# Find and kill process
lsof -i :5000 && kill -9 <PID>
# Or use different port
PORT=5001 npm start
```

**Build Timeout**
```bash
# Already optimized - timeout set to 600s
# If still fails, reduce static pages or use ISR
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for more troubleshooting.

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file for details.

---

## 👨‍💻 Author

**Kaash Malik**
- GitHub: [@Kaashmalik](https://github.com/Kaashmalik)
- Portfolio: [laraibcreative.com](https://laraibcreative.com)

---

## 🙏 Acknowledgments

- Next.js team for amazing framework
- Express.js community for lightweight server
- Cloudinary for image optimization
- MongoDB for flexible database
- All contributors and supporters

---

## 📞 Support

- 📧 Email: support@laraibcreative.com
- 💬 WhatsApp: +923038111297
- 🐛 Issues: [GitHub Issues](https://github.com/Kaashmalik/laraibcreative-platform/issues)

---

## 🚀 Roadmap

- [ ] Payment gateway integration (Stripe, JazzCash)
- [ ] Multi-language support (Urdu)
- [ ] Mobile app (React Native)
- [x] AI-powered content generation (descriptions, keywords, SEO)
- [ ] AI-powered product recommendations
- [ ] Subscription services
- [ ] GraphQL API
- [ ] Real-time notifications (WebSocket)
- [ ] Advanced analytics with reporting

---

**Made with ❤️ by LaraibCreative**

[⬆ Back to Top](#-laraibcreative---complete-e-commerce-platform)
