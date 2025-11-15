#!/bin/bash

# =============================================================================
# LARAIBCREATIVE ENVIRONMENT SETUP SCRIPT
# This script helps set up environment variables for local development
# =============================================================================

set -e

echo "=========================================="
echo "LaraibCreative - Environment Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

# =============================================================================
# BACKEND SETUP
# =============================================================================

echo -e "${BLUE}Setting up Backend Environment...${NC}"
echo ""

if [ -d "backend" ]; then
    cd backend
    
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            echo -e "${GREEN}✓ Created backend/.env from .env.example${NC}"
            echo -e "${YELLOW}⚠  IMPORTANT: Edit backend/.env with your actual values:${NC}"
            echo "   - MONGODB_URI: Your MongoDB connection string"
            echo "   - JWT_SECRET: A secure random string (min 32 characters)"
            echo "   - CLOUDINARY_*: Your Cloudinary credentials"
            echo "   - SMTP_*: Your email provider settings"
            echo "   - TWILIO_*: Your Twilio credentials (if using WhatsApp)"
            echo ""
            echo -e "${BLUE}To edit, run:${NC} nano backend/.env"
        else
            echo -e "${RED}Error: backend/.env.example not found${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}✓ backend/.env already exists${NC}"
    fi
    
    cd ..
fi

# =============================================================================
# FRONTEND SETUP
# =============================================================================

echo ""
echo -e "${BLUE}Setting up Frontend Environment...${NC}"
echo ""

if [ -d "frontend" ]; then
    cd frontend
    
    if [ ! -f ".env.local" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env.local
            echo -e "${GREEN}✓ Created frontend/.env.local from .env.example${NC}"
            echo -e "${YELLOW}⚠  IMPORTANT: Edit frontend/.env.local with your values:${NC}"
            echo "   - NEXT_PUBLIC_API_URL: Backend API URL (usually http://localhost:5000/api)"
            echo "   - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: Your Cloudinary cloud name"
            echo ""
            echo -e "${BLUE}To edit, run:${NC} nano frontend/.env.local"
        else
            echo -e "${RED}Error: frontend/.env.example not found${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}✓ frontend/.env.local already exists${NC}"
    fi
    
    cd ..
fi

# =============================================================================
# VALIDATION
# =============================================================================

echo ""
echo -e "${BLUE}Validating Setup...${NC}"
echo ""

VALID=true

# Check backend .env
if [ -f "backend/.env" ]; then
    if grep -q "MONGODB_URI=mongodb" backend/.env; then
        echo -e "${GREEN}✓ Backend: MONGODB_URI configured${NC}"
    else
        echo -e "${YELLOW}⚠  Backend: MONGODB_URI not configured (needs MongoDB connection string)${NC}"
        VALID=false
    fi
    
    if grep -q "JWT_SECRET=" backend/.env && [ $(grep "JWT_SECRET=" backend/.env | cut -d'=' -f2 | wc -c) -gt 33 ]; then
        echo -e "${GREEN}✓ Backend: JWT_SECRET configured (secure length)${NC}"
    else
        echo -e "${YELLOW}⚠  Backend: JWT_SECRET needs to be min 32 characters${NC}"
        VALID=false
    fi
else
    echo -e "${RED}✗ Backend: .env not found${NC}"
    VALID=false
fi

# Check frontend .env
if [ -f "frontend/.env.local" ]; then
    if grep -q "NEXT_PUBLIC_API_URL=" frontend/.env.local; then
        echo -e "${GREEN}✓ Frontend: NEXT_PUBLIC_API_URL configured${NC}"
    else
        echo -e "${YELLOW}⚠  Frontend: NEXT_PUBLIC_API_URL not configured${NC}"
        VALID=false
    fi
else
    echo -e "${RED}✗ Frontend: .env.local not found${NC}"
    VALID=false
fi

# =============================================================================
# SUMMARY
# =============================================================================

echo ""
echo "=========================================="
echo "Setup Summary"
echo "=========================================="

if [ "$VALID" = true ]; then
    echo -e "${GREEN}✓ All required environment files created${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Edit backend/.env with your configuration"
    echo "2. Edit frontend/.env.local with your configuration"
    echo "3. Run: cd backend && npm install && npm run dev"
    echo "4. In another terminal: cd frontend && npm install && npm run dev"
    echo "5. Open http://localhost:3000 in your browser"
else
    echo -e "${YELLOW}⚠  Some environment variables need attention${NC}"
    echo ""
    echo "Please edit the files mentioned above with actual values"
fi

echo ""
echo "=========================================="
echo ""
