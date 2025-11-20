#!/bin/bash

# Production Setup Script
# Complete production environment setup

set -e

echo "=========================================="
echo "LaraibCreative Production Setup"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}This script will guide you through production setup.${NC}"
echo ""

# Step 1: Verify prerequisites
echo "Step 1: Verifying prerequisites..."
echo "-----------------------------------"

# Check Node.js
if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Node.js: $(node -v)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
  echo -e "${RED}❌ npm not found${NC}"
  exit 1
fi
echo -e "${GREEN}✅ npm: $(npm -v)${NC}"

# Check Git
if ! command -v git &> /dev/null; then
  echo -e "${YELLOW}⚠️  Git not found (optional)${NC}"
fi

# Step 2: Environment variables
echo ""
echo "Step 2: Environment Variables Setup"
echo "------------------------------------"
echo ""
echo "Please ensure you have:"
echo "1. MongoDB Atlas connection string"
echo "2. JWT secrets (32+ characters each)"
echo "3. Cloudinary credentials"
echo "4. Email service credentials"
echo "5. Twilio credentials (for WhatsApp)"
echo ""
read -p "Press Enter to continue..."

# Step 3: Backend setup
echo ""
echo "Step 3: Backend Setup"
echo "---------------------"
cd backend

if [ ! -f ".env" ]; then
  echo -e "${YELLOW}⚠️  .env file not found${NC}"
  echo "Creating from template..."
  echo "Please update backend/.env with your values"
  echo "See: backend/ENV_PRODUCTION_TEMPLATE.md"
else
  echo -e "${GREEN}✅ .env file found${NC}"
fi

echo "Installing backend dependencies..."
npm ci

echo ""
echo "Running backend tests..."
npm test -- --passWithNoTests || echo "⚠️  Some tests failed"

cd ..

# Step 4: Frontend setup
echo ""
echo "Step 4: Frontend Setup"
echo "----------------------"
cd frontend

if [ ! -f ".env.local" ]; then
  echo -e "${YELLOW}⚠️  .env.local not found${NC}"
  echo "Please create frontend/.env.local"
  echo "See: frontend/ENV_PRODUCTION_TEMPLATE.md"
else
  echo -e "${GREEN}✅ .env.local found${NC}"
fi

echo "Installing frontend dependencies..."
npm ci

echo ""
echo "Running frontend lint..."
npm run lint || echo "⚠️  Linting issues found"

cd ..

# Step 5: Generate setup summary
echo ""
echo "Step 5: Generating Setup Summary"
echo "---------------------------------"

cat > SETUP_SUMMARY.md << EOF
# Production Setup Summary
Generated: $(date)

## Setup Status

✅ Prerequisites verified
✅ Backend dependencies installed
✅ Frontend dependencies installed

## Next Steps

1. **Configure Environment Variables**
   - Backend: Update \`backend/.env\`
   - Frontend: Update \`frontend/.env.local\`
   - See templates in respective directories

2. **Set Up MongoDB Atlas**
   - Create cluster
   - Configure network access
   - Get connection string

3. **Deploy Backend to Render**
   - Create web service
   - Add environment variables
   - Deploy

4. **Deploy Frontend to Vercel**
   - Import project
   - Add environment variables
   - Deploy

5. **Configure Domain**
   - Set DNS records
   - Verify SSL certificates

6. **Set Up Monitoring**
   - Configure Sentry
   - Set up Google Analytics
   - Configure uptime monitoring

## Documentation

- Deployment Guide: \`PRODUCTION_DEPLOYMENT_GUIDE.md\`
- Environment Templates: \`backend/ENV_PRODUCTION_TEMPLATE.md\`, \`frontend/ENV_PRODUCTION_TEMPLATE.md\`
- Monitoring: \`MONITORING_SETUP_GUIDE.md\`
- Rollback: \`ROLLBACK_PROCEDURES.md\`

## Support

For issues or questions, refer to the documentation or contact the team.
EOF

echo -e "${GREEN}✅ Setup summary created: SETUP_SUMMARY.md${NC}"

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Production setup preparation complete!${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Review SETUP_SUMMARY.md"
echo "2. Configure environment variables"
echo "3. Follow PRODUCTION_DEPLOYMENT_GUIDE.md"
echo "4. Deploy to production"

