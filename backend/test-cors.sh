#!/bin/bash

# CORS Test Script for LaraibCreative Backend
# Tests CORS configuration from production domain

echo "=========================================="
echo "CORS Configuration Test"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get backend URL from environment or use default
BACKEND_URL=${BACKEND_URL:-"http://localhost:5000"}
API_URL="${BACKEND_URL}/api"

echo "Testing CORS from: https://www.laraibcreative.studio"
echo "Backend URL: ${BACKEND_URL}"
echo ""

# Test 1: Preflight OPTIONS request
echo "Test 1: Preflight OPTIONS Request"
echo "-----------------------------------"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS "${API_URL}/products" \
  -H "Origin: https://www.laraibcreative.studio" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization")

if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "204" ]; then
  echo -e "${GREEN}✅ Preflight request successful (Status: $RESPONSE)${NC}"
else
  echo -e "${RED}❌ Preflight request failed (Status: $RESPONSE)${NC}"
fi

# Test 2: Actual GET request with Origin header
echo ""
echo "Test 2: GET Request with Origin Header"
echo "--------------------------------------"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "${API_URL}/products" \
  -H "Origin: https://www.laraibcreative.studio" \
  -H "Content-Type: application/json")

if [ "$RESPONSE" = "200" ]; then
  echo -e "${GREEN}✅ GET request successful (Status: $RESPONSE)${NC}"
else
  echo -e "${YELLOW}⚠️  GET request returned status: $RESPONSE${NC}"
  echo "   (This might be expected if the endpoint requires authentication)"
fi

# Test 3: Check CORS headers in response
echo ""
echo "Test 3: CORS Headers Verification"
echo "----------------------------------"
HEADERS=$(curl -s -I -X GET "${API_URL}/products" \
  -H "Origin: https://www.laraibcreative.studio")

if echo "$HEADERS" | grep -q "Access-Control-Allow-Origin"; then
  ALLOWED_ORIGIN=$(echo "$HEADERS" | grep -i "Access-Control-Allow-Origin" | cut -d' ' -f2 | tr -d '\r')
  echo -e "${GREEN}✅ CORS headers present${NC}"
  echo "   Access-Control-Allow-Origin: $ALLOWED_ORIGIN"
  
  if echo "$ALLOWED_ORIGIN" | grep -q "laraibcreative.studio"; then
    echo -e "${GREEN}✅ Correct origin allowed${NC}"
  else
    echo -e "${RED}❌ Unexpected origin in header${NC}"
  fi
else
  echo -e "${RED}❌ CORS headers missing${NC}"
fi

# Test 4: Test unauthorized origin (should be blocked)
echo ""
echo "Test 4: Unauthorized Origin (Should be Blocked)"
echo "-----------------------------------------------"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "${API_URL}/products" \
  -H "Origin: https://malicious-site.com" \
  -H "Content-Type: application/json")

if [ "$RESPONSE" = "403" ] || [ "$RESPONSE" = "401" ]; then
  echo -e "${GREEN}✅ Unauthorized origin correctly blocked (Status: $RESPONSE)${NC}"
else
  echo -e "${YELLOW}⚠️  Unauthorized origin test returned: $RESPONSE${NC}"
  echo "   (In development mode, all origins are allowed)"
fi

echo ""
echo "=========================================="
echo "Test Complete"
echo "=========================================="
echo ""
echo "Note: If running in development mode (NODE_ENV=development),"
echo "all origins are allowed. Set NODE_ENV=production to test"
echo "strict CORS enforcement."

