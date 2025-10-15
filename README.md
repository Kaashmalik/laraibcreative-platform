# LaraibCreative - Custom Ladies Suits E-Commerce Platform

> "We turn your thoughts & emotions into reality and happiness"

A full-stack e-commerce platform for custom ladies suit stitching services with online ordering, measurement management, and order tracking.

## 🚀 Tech Stack

**Frontend:**
- Next.js 14+ (App Router)
- React 18
- Tailwind CSS
- shadcn/ui Components
- Framer Motion
- Zustand (State Management)

**Backend:**
- Node.js
- Express.js
- MongoDB (with Mongoose)
- JWT Authentication
- Cloudinary (Image Storage)

**Deployment:**
- Frontend: Vercel
- Backend: Render / Railway
- Database: MongoDB Atlas
- CDN: Cloudflare

## 📋 Features

### Customer Features
- Browse products with advanced filtering
- Custom stitching order wizard
- Measurement form with saved profiles
- Shopping cart with persistent state
- Multi-step checkout process
- Manual payment (Bank transfer/COD)
- Real-time order tracking
- User account dashboard
- Wishlist functionality
- Product reviews and ratings
- Blog/Fashion hub

### Admin Features
- Comprehensive dashboard with analytics
- Product management (CRUD)
- Order management with status updates
- Payment verification system
- Customer management
- Inventory tracking
- Blog/Content management
- Sales reports and analytics
- Email/WhatsApp notifications

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18.x or higher
- npm or yarn
- MongoDB (local or Atlas account)
- Git

## 📦 Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/laraibcreative.git
cd laraibcreative
```

### 2. Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 3. Install Backend Dependencies
```bash
cd ../backend
npm install
```

### 4. Environment Variables Setup

#### Frontend (.env.local)
Create a `.env.local` file in the `frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

#### Backend (.env)
Create a `.env` file in the `backend` directory:
```env
# Server
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/laraibcreative
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/laraibcreative

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_characters
JWT_EXPIRE=1h
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=LaraibCreative <noreply@laraibcreative.com>

# WhatsApp (Optional - Twilio)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Admin
ADMIN_EMAIL=admin@laraibcreative.com
ADMIN_PASSWORD=SecureAdminPass123!
```

### 5. Database Setup

#### Option A: Local MongoDB
```bash
# Start MongoDB service
sudo systemctl start mongodb
# OR
mongod
```

#### Option B: MongoDB Atlas
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster (Free M0 tier)
3. Get connection string
4. Update MONGODB_URI in backend/.env

### 6. Seed Initial Data (Optional)
```bash
cd backend
npm run seed
```

This will create:
- Initial categories
- Sample products
- Admin user
- Default settings

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend runs on: http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on: http://localhost:3000

### Production Build

**Frontend:**
```bash
cd frontend
npm run build
npm start
```

**Backend:**
```bash
cd backend
npm run build  # if using TypeScript
npm start
```

## 📁 Project Structure

```
laraibcreative/
├── frontend/           # Next.js application
│   ├── src/
│   │   ├── app/       # App router pages
│   │   ├── components/# React components
│   │   ├── lib/       # Utilities
│   │   ├── hooks/     # Custom hooks
│   │   └── context/   # Context providers
│   └── public/        # Static assets
│
└── backend/           # Express API
    ├── src/
    │   ├── config/    # Configuration files
    │   ├── models/    # Mongoose models
    │   ├── controllers/# Route controllers
    │   ├── routes/    # API routes
    │   ├── middleware/# Custom middleware
    │   ├── utils/     # Helper functions
    │   └── services/  # Business logic
    └── uploads/       # Temporary uploads
```

## 🔑 Default Admin Credentials

After seeding the database:
- Email: admin@laraibcreative.com
- Password: SecureAdminPass123!

**⚠️ Change these immediately in production!**

## 📚 API Documentation

API endpoints are documented in `/docs/API.md`

Base URL: `http://localhost:5000/api`

### Key Endpoints:
- `POST /api/auth/register` - Customer registration
- `POST /api/auth/login` - Login
- `GET /api/products` - Get products
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details

## 🧪 Testing

```bash
# Run frontend tests
cd frontend
npm test

# Run backend tests
cd backend
npm test

# Run E2E tests
npm run test:e2e
```

## 🚢 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Backend (Render)
1. Create new Web Service
2. Connect GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables
6. Deploy

### Database (MongoDB Atlas)
1. Already set up in step 5
2. Whitelist Render IPs
3. Update connection string

Detailed deployment guide: `/docs/DEPLOYMENT.md`

## 🔒 Security

- JWT authentication with HTTP-only cookies
- Password hashing with bcrypt (12 rounds)
- Rate limiting on API endpoints
- Input sanitization and validation
- CORS configuration
- Helmet.js for security headers
- File upload restrictions
- XSS protection

## 📊 Performance

Target metrics:
- Lighthouse Score: 90+
- First Contentful Paint: <1.5s
- Time to Interactive: <3.5s
- Total Bundle Size: <200KB

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Developer

**Kashif Ahmed**
- Email: kashif@laraibcreative.com
- GitHub: [@kashiflaraib](https://github.com/kashiflaraib)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- shadcn for the beautiful UI components
- Vercel for hosting
- MongoDB Atlas for database

## 📞 Support

For issues and questions:
- GitHub Issues: https://github.com/yourusername/laraibcreative/issues
- Email: support@laraibcreative.com
- WhatsApp: +92-XXX-XXXXXXX

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core e-commerce functionality
- ✅ Custom order system
- ✅ Payment receipt upload

### Phase 2 (Next 3 months)
- [ ] Mobile app (React Native)
- [ ] AI measurement suggestions
- [ ] Real-time chat support
- [ ] Payment gateway integration

### Phase 3 (6-12 months)
- [ ] AR virtual try-on
- [ ] International shipping
- [ ] Loyalty program
- [ ] Multi-vendor support

---

**Made with ❤️ for the custom fashion industry**