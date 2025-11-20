#!/bin/bash

# Post-Deployment Verification Script
# Verifies that deployment was successful

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration (update with your URLs)
FRONTEND_URL="${FRONTEND_URL:-https://www.laraibcreative.studio}"
BACKEND_URL="${BACKEND_URL:-https://laraibcreative-backend.onrender.com}"

echo "=========================================="
echo "Post-Deployment Verification"
echo "=========================================="
echo ""
echo "Frontend URL: $FRONTEND_URL"
echo "Backend URL: $BACKEND_URL"
echo ""

# Test counters
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
  local name=$1
  local url=$2
  local expected_status=${3:-200}
  
  echo -n "Testing $name... "
  
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" || echo "000")
  
  if [ "$HTTP_CODE" = "$expected_status" ]; then
    echo -e "${GREEN}✅ PASS${NC} (Status: $HTTP_CODE)"
    ((PASSED++))
    return 0
  else
    echo -e "${RED}❌ FAIL${NC} (Status: $HTTP_CODE, Expected: $expected_status)"
    ((FAILED++))
    return 1
  fi
}

# Function to test endpoint with JSON response
test_json_endpoint() {
  local name=$1
  local url=$2
  
  echo -n "Testing $name... "
  
  RESPONSE=$(curl -s --max-time 10 "$url" || echo "")
  
  if echo "$RESPONSE" | grep -q "status"; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((PASSED++))
    return 0
  else
    echo -e "${RED}❌ FAIL${NC}"
    echo "   Response: $RESPONSE"
    ((FAILED++))
    return 1
  fi
}

# Backend Health Checks
echo "=========================================="
echo "Backend Health Checks"
echo "=========================================="
echo ""

test_endpoint "Backend Health Check" "$BACKEND_URL/api/health" 200
test_json_endpoint "Backend Detailed Health" "$BACKEND_URL/api/health/detailed"
test_endpoint "Backend Readiness" "$BACKEND_URL/api/health/ready" 200
test_endpoint "Backend Liveness" "$BACKEND_URL/api/health/live" 200
test_endpoint "Backend Metrics" "$BACKEND_URL/api/health/metrics" 200

# Backend API Endpoints
echo ""
echo "=========================================="
echo "Backend API Endpoints"
echo "=========================================="
echo ""

test_endpoint "API Root" "$BACKEND_URL/api" 200
test_endpoint "Products Endpoint" "$BACKEND_URL/api/v1/products" 200
test_endpoint "Categories Endpoint" "$BACKEND_URL/api/v1/categories" 200

# Frontend Checks
echo ""
echo "=========================================="
echo "Frontend Checks"
echo "=========================================="
echo ""

test_endpoint "Frontend Homepage" "$FRONTEND_URL" 200
test_endpoint "Frontend Products" "$FRONTEND_URL/products" 200
test_endpoint "Frontend API Route" "$FRONTEND_URL/api/health" 200

# CORS Check
echo ""
echo "=========================================="
echo "CORS Configuration"
echo "=========================================="
echo ""

echo -n "Testing CORS from frontend domain... "
CORS_HEADER=$(curl -s -I -X OPTIONS "$BACKEND_URL/api/health" \
  -H "Origin: $FRONTEND_URL" \
  -H "Access-Control-Request-Method: GET" \
  | grep -i "access-control-allow-origin" || echo "")

if echo "$CORS_HEADER" | grep -q "$FRONTEND_URL"; then
  echo -e "${GREEN}✅ PASS${NC}"
  echo "   CORS Header: $CORS_HEADER"
  ((PASSED++))
else
  echo -e "${YELLOW}⚠️  WARNING${NC}"
  echo "   CORS header not found or incorrect"
  echo "   This might be expected in development mode"
fi

# SSL Certificate Check
echo ""
echo "=========================================="
echo "SSL Certificate Check"
echo "=========================================="
echo ""

check_ssl() {
  local url=$1
  local name=$2
  
  echo -n "Checking SSL for $name... "
  
  SSL_INFO=$(echo | openssl s_client -servername $(echo $url | cut -d'/' -f3) -connect $(echo $url | cut -d'/' -f3):443 -showcerts 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || echo "")
  
  if [ -n "$SSL_INFO" ]; then
    echo -e "${GREEN}✅ PASS${NC}"
    echo "$SSL_INFO" | head -2
    ((PASSED++))
  else
    echo -e "${RED}❌ FAIL${NC}"
    ((FAILED++))
  fi
}

check_ssl "$FRONTEND_URL" "Frontend"
check_ssl "$BACKEND_URL" "Backend"

# Summary
echo ""
echo "=========================================="
echo "Verification Summary"
echo "=========================================="
echo ""
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All checks passed! Deployment verified.${NC}"
  exit 0
else
  echo -e "${YELLOW}⚠️  Some checks failed. Please review the output above.${NC}"
  exit 1
fi

