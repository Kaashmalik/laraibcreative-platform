# CORS Testing Guide
## LaraibCreative Backend

This guide helps you test the CORS configuration for your production domain.

---

## Quick Test

### Using the Test Script

```bash
# From the backend directory
cd backend
./test-cors.sh

# Or specify a custom backend URL
BACKEND_URL=https://your-backend-url.com ./test-cors.sh
```

---

## Manual Testing

### 1. Test Preflight Request (OPTIONS)

```bash
curl -X OPTIONS http://localhost:5000/api/products \
  -H "Origin: https://www.laraibcreative.studio" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -v
```

**Expected Response:**
- Status: `200` or `204`
- Headers should include:
  - `Access-Control-Allow-Origin: https://www.laraibcreative.studio`
  - `Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS`
  - `Access-Control-Allow-Headers: Content-Type, Authorization, ...`

### 2. Test Actual Request (GET)

```bash
curl -X GET http://localhost:5000/api/products \
  -H "Origin: https://www.laraibcreative.studio" \
  -H "Content-Type: application/json" \
  -v
```

**Expected Response:**
- Status: `200` (or appropriate status for the endpoint)
- Header: `Access-Control-Allow-Origin: https://www.laraibcreative.studio`

### 3. Test Unauthorized Origin (Should be Blocked)

```bash
curl -X GET http://localhost:5000/api/products \
  -H "Origin: https://malicious-site.com" \
  -H "Content-Type: application/json" \
  -v
```

**Expected Response (Production):**
- Status: `403` or CORS error
- Error message about CORS policy violation

**Note:** In development mode (`NODE_ENV=development`), all origins are allowed for easier testing.

---

## Browser Testing

### Using Browser Console

1. Open your browser's developer console (F12)
2. Navigate to `https://www.laraibcreative.studio`
3. Run this JavaScript:

```javascript
fetch('https://your-backend-url.com/api/products', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  },
  credentials: 'include'
})
.then(response => {
  console.log('✅ CORS working!', response);
  return response.json();
})
.then(data => console.log('Data:', data))
.catch(error => console.error('❌ CORS error:', error));
```

**Expected Result:**
- ✅ Request succeeds without CORS errors
- ✅ Data is returned

---

## Common CORS Issues

### Issue 1: "Access-Control-Allow-Origin" header missing

**Solution:**
- Check that `ALLOWED_ORIGINS` is set in `.env`
- Verify the origin matches exactly (including `https://` and no trailing `/`)
- Restart the server after changing `.env`

### Issue 2: Credentials not working

**Solution:**
- Ensure `credentials: true` is set in CORS config (already configured)
- Use `credentials: 'include'` in fetch requests
- Check that cookies are being sent

### Issue 3: Preflight request failing

**Solution:**
- Verify OPTIONS method is allowed
- Check that required headers are in `Access-Control-Allow-Headers`
- Ensure `maxAge` is set (already configured to 24 hours)

---

## Production Checklist

Before deploying to production:

- [ ] `ALLOWED_ORIGINS` is set in production environment
- [ ] `NODE_ENV=production` is set
- [ ] Test CORS from production domain
- [ ] Verify unauthorized origins are blocked
- [ ] Test with actual frontend application
- [ ] Check browser console for CORS errors

---

## Environment Variables

Make sure these are set in your `.env` file:

```bash
# CORS Configuration
ALLOWED_ORIGINS=https://www.laraibcreative.studio,https://laraibcreative.studio
FRONTEND_URL=https://www.laraibcreative.studio

# Server Mode
NODE_ENV=production
```

---

## Troubleshooting

### Check Current CORS Configuration

```bash
# Check if ALLOWED_ORIGINS is set
grep ALLOWED_ORIGINS backend/.env

# Check server logs for CORS warnings
# Look for: "CORS: Blocked request from unauthorized origin"
```

### Verify Server is Running

```bash
# Check if server is running
curl http://localhost:5000/api/health

# Or check process
ps aux | grep node
```

### Test from Different Origins

```bash
# Test from www domain
curl -H "Origin: https://www.laraibcreative.studio" http://localhost:5000/api/products

# Test from non-www domain
curl -H "Origin: https://laraibcreative.studio" http://localhost:5000/api/products

# Test from unauthorized domain (should fail in production)
curl -H "Origin: https://evil.com" http://localhost:5000/api/products
```

---

**Last Updated:** December 2024

