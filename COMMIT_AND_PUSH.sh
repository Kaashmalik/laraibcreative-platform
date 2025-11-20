#!/bin/bash

# Git Commit and Push Script for Production Deployment
# This script helps commit and push deployment files to GitHub

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "=========================================="
echo "GitHub Deployment Commit Script"
echo "=========================================="
echo ""

# Step 1: Check Git status
echo "Step 1: Checking Git status..."
echo "-------------------------------"
if ! git status &> /dev/null; then
  echo -e "${RED}❌ Not a Git repository${NC}"
  exit 1
fi

git status
echo ""

# Step 2: Check for sensitive files
echo "Step 2: Checking for sensitive files..."
echo "---------------------------------------"
SENSITIVE_FILES=$(git status --porcelain | grep -E "\.env$|\.env\.|secret|password" | grep -v "template\|example" || true)

if [ -n "$SENSITIVE_FILES" ]; then
  echo -e "${RED}❌ WARNING: Sensitive files detected:${NC}"
  echo "$SENSITIVE_FILES"
  echo ""
  read -p "Continue anyway? (yes/no): " confirm
  if [ "$confirm" != "yes" ]; then
    echo "Aborted. Please remove sensitive files first."
    exit 1
  fi
else
  echo -e "${GREEN}✅ No sensitive files detected${NC}"
fi

# Step 3: Verify .gitignore
echo ""
echo "Step 3: Verifying .gitignore..."
echo "-------------------------------"
if grep -q "\.env" .gitignore 2>/dev/null; then
  echo -e "${GREEN}✅ .env files are in .gitignore${NC}"
else
  echo -e "${YELLOW}⚠️  .env files not found in .gitignore${NC}"
  echo "Consider adding: *.env, *.env.local, *.env.production"
fi

# Step 4: Stage files
echo ""
echo "Step 4: Staging files..."
echo "------------------------"

# Documentation files
echo "Staging documentation files..."
git add PRODUCTION_DEPLOYMENT_GUIDE.md 2>/dev/null || true
git add DEPLOYMENT_QUICK_START.md 2>/dev/null || true
git add DEPLOYMENT_CHECKLIST.md 2>/dev/null || true
git add DEPLOYMENT_INDEX.md 2>/dev/null || true
git add DEPLOYMENT_COMPLETE.md 2>/dev/null || true
git add PRODUCTION_DEPLOYMENT_SUMMARY.md 2>/dev/null || true
git add ROLLBACK_PROCEDURES.md 2>/dev/null || true
git add MONITORING_SETUP_GUIDE.md 2>/dev/null || true
git add PERFORMANCE_BASELINE.md 2>/dev/null || true
git add GITHUB_DEPLOYMENT_COMMIT_GUIDE.md 2>/dev/null || true

# Environment templates
echo "Staging environment templates..."
git add backend/ENV_PRODUCTION_TEMPLATE.md 2>/dev/null || true
git add frontend/ENV_PRODUCTION_TEMPLATE.md 2>/dev/null || true

# Scripts
echo "Staging scripts..."
git add scripts/*.sh 2>/dev/null || true

# Health check routes
echo "Staging health check routes..."
git add backend/src/routes/health.routes.js 2>/dev/null || true
git add backend/src/routes/index.js 2>/dev/null || true

# CI/CD workflows
echo "Staging CI/CD workflows..."
git add .github/workflows/deploy-production.yml 2>/dev/null || true
git add .github/workflows/deploy-render.yml 2>/dev/null || true
git add .github/workflows/deploy-vercel.yml 2>/dev/null || true

echo -e "${GREEN}✅ Files staged${NC}"

# Step 5: Show what will be committed
echo ""
echo "Step 5: Files to be committed..."
echo "----------------------------------"
git status --short

# Step 6: Commit
echo ""
read -p "Commit these changes? (yes/no): " commit_confirm

if [ "$commit_confirm" != "yes" ]; then
  echo "Aborted."
  exit 0
fi

echo ""
echo "Step 6: Committing changes..."
echo "-----------------------------"

COMMIT_MESSAGE="feat: Add comprehensive production deployment infrastructure

- Add step-by-step deployment guide (PRODUCTION_DEPLOYMENT_GUIDE.md)
- Add environment variable templates for Render and Vercel
- Add deployment scripts (backend, frontend, verification, migration)
- Implement health check endpoints (basic, detailed, ready, live, metrics)
- Add CI/CD workflows for automated deployment
- Add rollback procedures documentation
- Add performance baseline metrics
- Add monitoring setup guide
- Add deployment checklist and quick start guide

Platforms:
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

Features:
- Automated deployment pipelines
- Health check endpoints
- Database migration scripts
- SSL certificate configuration
- CDN setup (Cloudinary)
- Error tracking setup
- Analytics integration
- Backup strategy
- Monitoring dashboards"

git commit -m "$COMMIT_MESSAGE"

echo -e "${GREEN}✅ Changes committed${NC}"

# Step 7: Push
echo ""
read -p "Push to GitHub? (yes/no): " push_confirm

if [ "$push_confirm" != "yes" ]; then
  echo "Commit created. Push manually with: git push origin main"
  exit 0
fi

echo ""
echo "Step 7: Pushing to GitHub..."
echo "----------------------------"

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"

read -p "Push to '$CURRENT_BRANCH'? (yes/no): " branch_confirm

if [ "$branch_confirm" = "yes" ]; then
  git push origin "$CURRENT_BRANCH"
  echo -e "${GREEN}✅ Changes pushed to GitHub${NC}"
else
  echo "Push cancelled. Push manually with: git push origin $CURRENT_BRANCH"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Complete!${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Verify files on GitHub"
echo "2. Check CI/CD workflows in Actions tab"
echo "3. Review committed files for any sensitive data"
echo "4. Follow DEPLOYMENT_QUICK_START.md for deployment"


