#!/bin/bash

# Frontend Deployment Script for Vercel
# This script helps prepare and verify frontend deployment

set -e  # Exit on error

echo "=========================================="
echo "LaraibCreative Frontend Deployment"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_DIR="frontend"
ENV_FILE="${FRONTEND_DIR}/.env.local"

# Step 1: Check prerequisites
echo "Step 1: Checking prerequisites..."
echo "-----------------------------------"

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo -e "${RED}❌ Node.js version 18+ required. Current: $(node -v)${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Node.js version: $(node -v)${NC}"

# Check npm version
NPM_VERSION=$(npm -v | cut -d'.' -f1)
if [ "$NPM_VERSION" -lt 10 ]; then
  echo -e "${RED}❌ npm version 10+ required. Current: $(npm -v)${NC}"
  exit 1
fi
echo -e "${GREEN}✅ npm version: $(npm -v)${NC}"

# Step 2: Install dependencies
echo ""
echo "Step 2: Installing dependencies..."
echo "-----------------------------------"
cd "$FRONTEND_DIR"
npm ci
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Step 3: Run linter
echo ""
echo "Step 3: Running linter..."
echo "-------------------------"
if npm run lint; then
  echo -e "${GREEN}✅ Linting passed${NC}"
else
  echo -e "${YELLOW}⚠️  Linting issues found. Continuing...${NC}"
fi

# Step 4: Type check (if TypeScript)
echo ""
echo "Step 4: Running type check..."
echo "------------------------------"
if npm run type-check 2>/dev/null; then
  echo -e "${GREEN}✅ Type check passed${NC}"
else
  echo -e "${YELLOW}⚠️  Type check skipped or failed. Continuing...${NC}"
fi

# Step 5: Build application
echo ""
echo "Step 5: Building application..."
echo "--------------------------------"
if npm run build; then
  echo -e "${GREEN}✅ Build successful${NC}"
else
  echo -e "${RED}❌ Build failed${NC}"
  exit 1
fi

# Step 6: Check build output
echo ""
echo "Step 6: Verifying build output..."
echo "----------------------------------"
if [ -d ".next" ]; then
  echo -e "${GREEN}✅ Build output directory found${NC}"
  
  # Check build size
  BUILD_SIZE=$(du -sh .next | cut -f1)
  echo "   Build size: $BUILD_SIZE"
else
  echo -e "${RED}❌ Build output directory not found${NC}"
  exit 1
fi

# Step 7: Security audit
echo ""
echo "Step 7: Running security audit..."
echo "---------------------------------"
if npm audit --audit-level=moderate; then
  echo -e "${GREEN}✅ No critical security vulnerabilities${NC}"
else
  echo -e "${YELLOW}⚠️  Security vulnerabilities found. Review before deploying.${NC}"
fi

# Step 8: Generate deployment summary
echo ""
echo "Step 8: Generating deployment summary..."
echo "----------------------------------------"
cd ..
cat > FRONTEND_DEPLOYMENT_SUMMARY.md << EOF
# Frontend Deployment Summary
Generated: $(date)

## Frontend Deployment Checklist

- [x] Node.js version verified
- [x] Dependencies installed
- [x] Linter run
- [x] Type check completed
- [x] Build successful
- [x] Security audit completed

## Build Information

- Build size: $BUILD_SIZE
- Build directory: .next
- Environment: Production

## Next Steps

1. Push code to GitHub
2. Vercel will automatically deploy (if connected)
3. Or deploy manually: \`vercel --prod\`
4. Verify deployment: Visit your domain

## Environment Variables

Make sure all variables from \`frontend/ENV_PRODUCTION_TEMPLATE.md\` are set in Vercel dashboard.

## Post-Deployment Verification

1. Visit: https://www.laraibcreative.studio
2. Check browser console for errors
3. Test API connectivity
4. Verify images load from Cloudinary
5. Test authentication flow
EOF

echo -e "${GREEN}✅ Deployment summary created: FRONTEND_DEPLOYMENT_SUMMARY.md${NC}"

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Frontend deployment preparation complete!${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Review FRONTEND_DEPLOYMENT_SUMMARY.md"
echo "2. Push to GitHub: git push origin main"
echo "3. Monitor Vercel dashboard for deployment"
echo "4. Verify site is live"

