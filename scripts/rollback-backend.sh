#!/bin/bash

# Backend Rollback Script for Render
# Helps with emergency rollback procedures

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "=========================================="
echo "Backend Rollback Script"
echo "=========================================="
echo ""

echo -e "${YELLOW}⚠️  WARNING: This script helps with rollback procedures.${NC}"
echo "For Render, rollback is done via the dashboard."
echo ""
echo "Options:"
echo "1. Rollback via Git (revert commit)"
echo "2. View rollback instructions"
echo ""

read -p "Choose option (1/2): " option

case $option in
  1)
    echo ""
    echo "Git Rollback:"
    echo "------------"
    read -p "Enter commit hash to revert to: " commit_hash
    
    if [ -z "$commit_hash" ]; then
      echo -e "${RED}❌ Commit hash required${NC}"
      exit 1
    fi
    
    echo ""
    echo "This will:"
    echo "1. Revert to commit: $commit_hash"
    echo "2. Create a new commit"
    echo "3. Push to main branch"
    echo "4. Trigger Render deployment"
    echo ""
    read -p "Continue? (yes/no): " confirm
    
    if [ "$confirm" = "yes" ]; then
      git revert $commit_hash --no-edit
      git push origin main
      echo -e "${GREEN}✅ Rollback commit created and pushed${NC}"
      echo "Render will automatically deploy the reverted version"
    else
      echo "Rollback cancelled"
    fi
    ;;
  2)
    echo ""
    echo "=========================================="
    echo "Render Rollback Instructions"
    echo "=========================================="
    echo ""
    echo "1. Go to Render Dashboard"
    echo "2. Select your service: laraibcreative-backend"
    echo "3. Click on 'Events' tab"
    echo "4. Find the previous good deployment"
    echo "5. Click '⋯' (three dots) menu"
    echo "6. Select 'Rollback to this deploy'"
    echo "7. Confirm the action"
    echo ""
    echo "The service will restart with the previous version."
    echo ""
    echo "For detailed instructions, see: ROLLBACK_PROCEDURES.md"
    ;;
  *)
    echo -e "${RED}Invalid option${NC}"
    exit 1
    ;;
esac

