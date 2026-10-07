# Quick Start Guide - LaraibCreative Platform

Get the LaraibCreative platform running locally in minutes.

## Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **MongoDB** (Local or [MongoDB Atlas](https://mongodb.com/cloud/atlas) - Free tier available)
- **Git**
- **npm** (comes with Node.js)

## Local Development (5 minutes)

### 1. Clone Repository
```bash
git clone https://github.com/Kaashmalik/laraibcreative-platform.git
cd laraibcreative-platform
```

### 2. Setup Environment Files
```bash
# Run setup script (creates .env files from examples)
bash setup-env.sh

# Or manually:
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

### 3. Configure Environment Variables

**Edit `backend/.env`:**
```bash
nano backend/.env
```

Update these critical values:
- `MONGODB_URI` → Get from [MongoDB Atlas](https://mongodb.com/cloud/atlas)
- `JWT_SECRET` → Generate a random 32+ char string
- `CLOUDINARY_*` → Get from [Cloudinary](https://cloudinary.com) (Free account)
- `SMTP_*` → Gmail or other email service

**Edit `frontend/.env.local`:**
```bash
nano frontend/.env.local
```

Update:
- `NEXT_PUBLIC_API_URL=http://localhost:5000/api`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` → Your Cloudinary name

### 4. Start Backend
```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:5000
```

### 5. Start Frontend (New Terminal)
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

### 6. Open in Browser
```
http://localhost:3000
```

**Done!** You should see the LaraibCreative homepage.

---

## Docker Deployment (2 minutes)

For containerized development or production deployment:

### Prerequisites
- Docker Desktop ([Download](https://www.docker.com/products/docker-desktop))

### Quick Start
```bash
# Create .env file for Docker
cp .env.example .env

# Edit with your values
nano .env

# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

**Access:**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- MongoDB: localhost:27017

### Stop Services
```bash
docker-compose down
```

### Reset Everything
```bash
docker-compose down -v  # Also removes volumes
```

---

## Testing

### Backend Tests
```bash
cd backend
npm run test              # Run all tests
npm run test:watch       # Watch mode
npm run test -- --coverage
```

### Linting
```bash
# Backend
cd backend && npm run lint

# Frontend  
cd frontend && npm run lint

# Fix issues automatically
npm run lint:fix
```

---

## Building for Production

### Build Backend
```bash
cd backend
npm run build  # If build script exists, otherwise skip
```

### Build Frontend
```bash
cd frontend
npm run build
npm start     # Test production build locally
```

---

## Common Issues & Solutions

### MongoDB Connection Error
```
Error: connect ENOTFOUND
```

**Solutions:**
1. Check `MONGODB_URI` in `.env`
2. If using MongoDB Atlas: Whitelist your IP (0.0.0.0/0 for dev)
3. Verify internet connection

### Port Already in Use
```
Error: EADDRINUSE: address already in use :::5000
```

**Solution:**
```bash
# Kill process using port
lsof -i :5000
kill -9 <PID>

# Or use different port
PORT=5001 npm start
```

### Frontend Build Timeout
```
Error: Exit code 124 (timeout)
```

**Solution:**
Already optimized in `next.config.js`. If still occurs:
- Use deployment-ready Docker image
- Reduce number of static pages
- Use ISR (Incremental Static Regeneration)

### CORS Errors
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
Check `backend/server.js` `corsOptions` includes your frontend URL

---

## API Documentation

### Health Check
```bash
curl http://localhost:5000/health
```

### Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Get Products
```bash
curl http://localhost:5000/api/v1/products
```

For full API documentation, see [API.md](./docs/API.md)

---

## Project Structure

```
laraibcreative/
├── frontend/           # Next.js 14 app
├── backend/            # Express.js API
├── database/           # DB schemas
├── docker-compose.yml  # Docker setup
├── DEPLOYMENT.md       # Deployment guide
└── setup-env.sh        # Setup script
```

---

## Next Steps

1. **Seed Database:** `cd backend && npm run seed`
2. **Create Admin User:** Check `backend/src/seeds/` for examples
3. **Configure Payments:** Add Stripe/JazzCash integration
4. **Setup Email:** Test with `SMTP_*` variables
5. **Deploy:** See [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## Need Help?

- **Docs:** Check [docs/](./docs/) folder
- **API Issues:** Test with Postman
- **Build Issues:** Check build logs
- **Database:** Use MongoDB Compass

---

## Key Commands Reference

```bash
# Backend
npm run dev              # Dev server with hot reload
npm run build            # Production build
npm start                # Production server
npm run test             # Run tests
npm run seed             # Seed database
npm run lint             # Check code quality

# Frontend
npm run dev              # Dev server
npm run build            # Production build
npm start                # Serve production build
npm run lint             # ESLint check
npm run type-check       # TypeScript check
npm run format           # Prettier format

# Docker
docker-compose up -d     # Start services
docker-compose down      # Stop services
docker-compose logs -f   # View logs
```

---

**Happy coding! 🚀**
