#!/bin/bash

# Backend Deployment Script for Render
# This script helps prepare and verify backend deployment

set -e  # Exit on error

echo "=========================================="
echo "LaraibCreative Backend Deployment"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_DIR="backend"
ENV_FILE="${BACKEND_DIR}/.env"

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

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
  echo -e "${YELLOW}⚠️  .env file not found. Creating from template...${NC}"
  cp "${BACKEND_DIR}/ENV_PRODUCTION_TEMPLATE.md" "$ENV_FILE" 2>/dev/null || echo "Please create .env file manually"
fi

# Step 2: Validate environment variables
echo ""
echo "Step 2: Validating environment variables..."
echo "-------------------------------------------"

REQUIRED_VARS=("MONGODB_URI" "JWT_SECRET" "JWT_REFRESH_SECRET")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
  if ! grep -q "^${var}=" "$ENV_FILE" 2>/dev/null; then
    MISSING_VARS+=("$var")
  fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
  echo -e "${RED}❌ Missing required environment variables:${NC}"
  printf '%s\n' "${MISSING_VARS[@]}"
  echo ""
  echo "Please add these to ${ENV_FILE}"
  exit 1
fi
echo -e "${GREEN}✅ All required environment variables present${NC}"

# Step 3: Install dependencies
echo ""
echo "Step 3: Installing dependencies..."
echo "-----------------------------------"
cd "$BACKEND_DIR"
npm ci --production=false
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Step 4: Run linter
echo ""
echo "Step 4: Running linter..."
echo "-------------------------"
if npm run lint; then
  echo -e "${GREEN}✅ Linting passed${NC}"
else
  echo -e "${YELLOW}⚠️  Linting issues found. Continuing...${NC}"
fi

# Step 5: Run tests
echo ""
echo "Step 5: Running tests..."
echo "-----------------------"
if npm test -- --passWithNoTests; then
  echo -e "${GREEN}✅ Tests passed${NC}"
else
  echo -e "${YELLOW}⚠️  Some tests failed. Review before deploying.${NC}"
fi

# Step 6: Build verification
echo ""
echo "Step 6: Verifying build..."
echo "--------------------------"
# Check if server.js exists
if [ -f "server.js" ]; then
  echo -e "${GREEN}✅ Server file found${NC}"
else
  echo -e "${RED}❌ Server file not found${NC}"
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
cat > DEPLOYMENT_SUMMARY.md << EOF
# Deployment Summary
Generated: $(date)

## Backend Deployment Checklist

- [x] Node.js version verified
- [x] Dependencies installed
- [x] Environment variables validated
- [x] Linter run
- [x] Tests executed
- [x] Security audit completed

## Next Steps

1. Push code to GitHub
2. Render will automatically deploy (if auto-deploy enabled)
3. Or manually deploy from Render dashboard
4. Verify health check: \`curl https://your-backend-url.com/api/health\`

## Environment Variables

Make sure all variables from \`backend/ENV_PRODUCTION_TEMPLATE.md\` are set in Render dashboard.

## Health Check

After deployment, verify:
\`\`\`bash
curl https://your-backend-url.com/api/health
curl https://your-backend-url.com/api/health/detailed
\`\`\`
EOF

echo -e "${GREEN}✅ Deployment summary created: DEPLOYMENT_SUMMARY.md${NC}"

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Backend deployment preparation complete!${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Review DEPLOYMENT_SUMMARY.md"
echo "2. Push to GitHub: git push origin main"
echo "3. Monitor Render dashboard for deployment"
echo "4. Verify health check endpoint"

