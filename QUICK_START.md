# ⚡ Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/laraibcreative-platform.git
cd laraibcreative-platform

# Install dependencies
cd frontend && npm install --legacy-peer-deps
cd ../backend && npm install
```

### 2. Configure Environment

#### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_GA_ID=your-ga-id
NEXT_PUBLIC_FB_PIXEL_ID=your-pixel-id
```

#### Backend (`.env`)
```env
MONGODB_URI=mongodb://localhost:27017/laraibcreative
JWT_SECRET=your-secret-key
PORT=5000
```

### 3. Start Development

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 4. Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Docs**: http://localhost:5000/api/v1

## 📚 Next Steps

1. **Read Documentation**
   - `README_SCALING.md` - Overview
   - `INTEGRATION_EXAMPLES.md` - Code examples
   - `MIGRATION_GUIDE.md` - Migration steps

2. **Explore Features**
   - Production Queue Dashboard
   - Business Metrics Dashboard
   - Referral & Loyalty Systems
   - i18n & Currency Support

3. **Deploy**
   - Follow `DEPLOYMENT_CHECKLIST.md`
   - Set up environment variables
   - Configure databases
   - Deploy to production

## 🎯 Key Features

- ✅ Type-safe API (tRPC)
- ✅ State management (Zustand)
- ✅ Multi-language (i18n)
- ✅ Multi-currency
- ✅ Production management
- ✅ Analytics & alerts
- ✅ Referral & loyalty

## 🆘 Need Help?

- Check `INTEGRATION_EXAMPLES.md` for code examples
- See `TESTING_GUIDE.md` for testing
- Review `MIGRATION_GUIDE.md` for migrations
- Read `DEPLOYMENT_CHECKLIST.md` for deployment

---

**Happy Coding!** 🎉

