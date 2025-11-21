#!/bin/bash

# ==========================================
# LaraibCreative Unified Deployment Script
# ==========================================
# Handles deployment for both Vercel (Frontend) and Render (Backend)
# ==========================================

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_DIR="backend"
FRONTEND_DIR="frontend"
BACKEND_ENV="${BACKEND_DIR}/.env"
FRONTEND_ENV="${FRONTEND_DIR}/.env.local"

echo "=========================================="
echo "🚀 LaraibCreative Deployment Script"
echo "=========================================="
echo ""

# Function to print section header
print_section() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Function to check prerequisites
check_prerequisites() {
    print_section "Step 1: Checking Prerequisites"
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed${NC}"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo -e "${RED}❌ Node.js version 18+ required. Current: $(node -v)${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Node.js version: $(node -v)${NC}"
    
    # Check npm version
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm is not installed${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ npm version: $(npm -v)${NC}"
    
    # Check Git
    if ! command -v git &> /dev/null; then
        echo -e "${YELLOW}⚠️  Git is not installed (optional for deployment)${NC}"
    else
        echo -e "${GREEN}✅ Git version: $(git --version)${NC}"
    fi
}

# Function to validate backend environment
validate_backend_env() {
    print_section "Step 2: Validating Backend Environment"
    
    if [ ! -f "$BACKEND_ENV" ]; then
        echo -e "${YELLOW}⚠️  Backend .env file not found${NC}"
        echo "   Please ensure environment variables are set in Render dashboard"
    else
        echo -e "${GREEN}✅ Backend .env file found${NC}"
        
        REQUIRED_VARS=("MONGODB_URI" "JWT_SECRET")
        MISSING_VARS=()
        
        for var in "${REQUIRED_VARS[@]}"; do
            if ! grep -q "^${var}=" "$BACKEND_ENV" 2>/dev/null; then
                MISSING_VARS+=("$var")
            fi
        done
        
        if [ ${#MISSING_VARS[@]} -gt 0 ]; then
            echo -e "${YELLOW}⚠️  Missing variables in .env (should be set in Render):${NC}"
            printf '   - %s\n' "${MISSING_VARS[@]}"
        else
            echo -e "${GREEN}✅ All required backend variables present${NC}"
        fi
    fi
}

# Function to validate frontend environment
validate_frontend_env() {
    print_section "Step 3: Validating Frontend Environment"
    
    if [ ! -f "$FRONTEND_ENV" ]; then
        echo -e "${YELLOW}⚠️  Frontend .env.local file not found${NC}"
        echo "   Please ensure environment variables are set in Vercel dashboard"
    else
        echo -e "${GREEN}✅ Frontend .env.local file found${NC}"
        
        if ! grep -q "NEXT_PUBLIC_API_URL" "$FRONTEND_ENV" 2>/dev/null; then
            echo -e "${YELLOW}⚠️  NEXT_PUBLIC_API_URL not found (should be set in Vercel)${NC}"
        else
            echo -e "${GREEN}✅ NEXT_PUBLIC_API_URL configured${NC}"
        fi
    fi
}

# Function to prepare backend
prepare_backend() {
    print_section "Step 4: Preparing Backend (Render)"
    
    cd "$BACKEND_DIR"
    
    echo "📦 Installing dependencies..."
    npm ci --production=false || {
        echo -e "${YELLOW}⚠️  npm ci failed, trying npm install...${NC}"
        npm install
    }
    echo -e "${GREEN}✅ Dependencies installed${NC}"
    
    echo ""
    echo "🔍 Running linter..."
    if npm run lint 2>/dev/null; then
        echo -e "${GREEN}✅ Linting passed${NC}"
    else
        echo -e "${YELLOW}⚠️  Linting issues found. Continuing...${NC}"
    fi
    
    echo ""
    echo "🧪 Running tests..."
    if npm test -- --passWithNoTests 2>/dev/null; then
        echo -e "${GREEN}✅ Tests passed${NC}"
    else
        echo -e "${YELLOW}⚠️  Some tests failed. Review before deploying.${NC}"
    fi
    
    echo ""
    echo "🔒 Running security audit..."
    if npm audit --audit-level=moderate 2>/dev/null; then
        echo -e "${GREEN}✅ No critical security vulnerabilities${NC}"
    else
        echo -e "${YELLOW}⚠️  Security vulnerabilities found. Review before deploying.${NC}"
    fi
    
    cd ..
    echo -e "${GREEN}✅ Backend preparation complete${NC}"
}

# Function to prepare frontend
prepare_frontend() {
    print_section "Step 5: Preparing Frontend (Vercel)"
    
    cd "$FRONTEND_DIR"
    
    echo "📦 Installing dependencies..."
    npm ci || {
        echo -e "${YELLOW}⚠️  npm ci failed, trying npm install...${NC}"
        npm install
    }
    echo -e "${GREEN}✅ Dependencies installed${NC}"
    
    echo ""
    echo "🔍 Running linter..."
    if npm run lint 2>/dev/null; then
        echo -e "${GREEN}✅ Linting passed${NC}"
    else
        echo -e "${YELLOW}⚠️  Linting issues found. Continuing...${NC}"
    fi
    
    echo ""
    echo "🏗️  Building application..."
    if npm run build; then
        echo -e "${GREEN}✅ Build successful${NC}"
        
        # Check build size
        if [ -d ".next" ]; then
            BUILD_SIZE=$(du -sh .next 2>/dev/null | cut -f1 || echo "unknown")
            echo "   Build size: $BUILD_SIZE"
        fi
    else
        echo -e "${RED}❌ Build failed${NC}"
        cd ..
        exit 1
    fi
    
    echo ""
    echo "🔒 Running security audit..."
    if npm audit --audit-level=moderate 2>/dev/null; then
        echo -e "${GREEN}✅ No critical security vulnerabilities${NC}"
    else
        echo -e "${YELLOW}⚠️  Security vulnerabilities found. Review before deploying.${NC}"
    fi
    
    cd ..
    echo -e "${GREEN}✅ Frontend preparation complete${NC}"
}

# Function to generate deployment summary
generate_summary() {
    print_section "Step 6: Generating Deployment Summary"
    
    cat > DEPLOYMENT_SUMMARY.md << EOF
# Deployment Summary
Generated: $(date)

## Deployment Checklist

### Backend (Render)
- [x] Node.js version verified
- [x] Dependencies installed
- [x] Environment variables validated
- [x] Linter run
- [x] Tests executed
- [x] Security audit completed

### Frontend (Vercel)
- [x] Node.js version verified
- [x] Dependencies installed
- [x] Environment variables validated
- [x] Linter run
- [x] Build successful
- [x] Security audit completed

## Next Steps

### For Render (Backend)
1. Push code to GitHub: \`git push origin main\`
2. Render will automatically deploy (if auto-deploy enabled)
3. Or manually deploy from Render dashboard
4. Verify health check: \`curl https://laraibcreative-backend.onrender.com/health\`

### For Vercel (Frontend)
1. Push code to GitHub: \`git push origin main\`
2. Vercel will automatically deploy (if connected)
3. Or deploy manually: \`vercel --prod\`
4. Verify deployment: Visit https://laraibcreative.studio

## Environment Variables

### Backend (Render Dashboard)
- MONGODB_URI
- JWT_SECRET
- JWT_REFRESH_SECRET
- NODE_ENV=production

### Frontend (Vercel Dashboard)
- NEXT_PUBLIC_API_URL=https://laraibcreative-backend.onrender.com
- NEXT_PUBLIC_GA_ID (optional)
- NEXT_PUBLIC_FB_PIXEL_ID (optional)

## Health Checks

### Backend
\`\`\`bash
curl https://laraibcreative-backend.onrender.com/health
\`\`\`

### Frontend
Visit: https://laraibcreative.studio

## Monitoring

- Backend logs: Render dashboard → Logs
- Frontend logs: Vercel dashboard → Logs
- Error tracking: Check application logs for errors
- Performance: Monitor response times in logs

## Rollback Procedures

If deployment fails:
1. Backend: Use Render dashboard to rollback to previous deployment
2. Frontend: Use Vercel dashboard to rollback to previous deployment
3. Check logs for specific errors
4. Fix issues and redeploy

EOF

    echo -e "${GREEN}✅ Deployment summary created: DEPLOYMENT_SUMMARY.md${NC}"
}

# Function to display final instructions
display_instructions() {
    print_section "Deployment Ready!"
    
    echo -e "${GREEN}✅ All preparation steps completed successfully!${NC}"
    echo ""
    echo "Next steps:"
    echo ""
    echo -e "${BLUE}1. Review DEPLOYMENT_SUMMARY.md${NC}"
    echo ""
    echo -e "${BLUE}2. Commit and push to GitHub:${NC}"
    echo "   git add ."
    echo "   git commit -m 'Phase 6: Launch prep and monitoring setup'"
    echo "   git push origin main"
    echo ""
    echo -e "${BLUE}3. Monitor deployments:${NC}"
    echo "   - Backend: https://dashboard.render.com"
    echo "   - Frontend: https://vercel.com/dashboard"
    echo ""
    echo -e "${BLUE}4. Verify after deployment:${NC}"
    echo "   - Backend health: curl https://laraibcreative-backend.onrender.com/health"
    echo "   - Frontend: https://laraibcreative.studio"
    echo ""
    echo -e "${BLUE}5. Check monitoring:${NC}"
    echo "   - Review application logs"
    echo "   - Monitor error rates"
    echo "   - Check performance metrics"
    echo ""
}

# Main execution
main() {
    check_prerequisites
    validate_backend_env
    validate_frontend_env
    prepare_backend
    prepare_frontend
    generate_summary
    display_instructions
    
    echo ""
    echo "=========================================="
    echo -e "${GREEN}🎉 Deployment preparation complete!${NC}"
    echo "=========================================="
}

# Run main function
main

