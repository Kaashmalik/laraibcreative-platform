# Vercel Domain Setup Guide - laraibcreative.studio

This guide explains how to connect your custom domain `laraibcreative.studio` to your Vercel deployment.

## Prerequisites

- Domain registered (laraibcreative.studio)
- Vercel account with deployed frontend project
- Admin access to domain registrar (where you registered the domain)

## Step 1: Add Domain in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your LaraibCreative Frontend project
3. Click on **Settings** → **Domains**
4. Click **Add Domain**
5. Enter: `laraibcreative.studio`
6. Click **Add**

You'll see Vercel generates nameservers:

```
NS1: ns1.vercel-dns.com
NS2: ns2.vercel-dns.com
NS3: ns3.vercel-dns.com
NS4: ns4.vercel-dns.com
```

## Step 2: Update Nameservers at Registrar

Go to your domain registrar (where you bought `laraibcreative.studio`):

1. Log into your registrar account
2. Find DNS/Nameserver settings
3. Replace current nameservers with Vercel's nameservers:
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`
   - `ns3.vercel-dns.com`
   - `ns4.vercel-dns.com`
4. Save changes

**Note:** DNS propagation can take 24-48 hours.

## Step 3: Configure Environment Variables

The project already has `vercel.json` configured, but ensure environment variables are set in Vercel:

1. In Vercel Project Settings → **Environment Variables**
2. Add/Update:
   ```
   NEXT_PUBLIC_APP_URL = https://laraibcreative.studio
   NEXT_PUBLIC_API_URL = https://laraibcreative-backend.onrender.com
   NEXT_PUBLIC_API_BASE_URL = https://laraibcreative-backend.onrender.com/api/v1
   NEXT_PUBLIC_SITE_URL = https://laraibcreative.studio
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = dkzqbo109
   ```

## Step 4: Add SSL Certificate

1. Vercel automatically provides free SSL certificates
2. Once domain is verified, check **Settings** → **Domains**
3. Status should show "Valid Configuration" with a green checkmark
4. SSL certificate auto-renews

## Step 5: Update Backend CORS

The backend at `laraibcreative-backend.onrender.com` needs to allow requests from your domain.

Check that `backend/.env.render` has:
```
CORS_ORIGIN=https://laraibcreative.studio
```

Then restart the Render backend deployment.

## Step 6: Verify DNS Records (Optional)

After nameservers are updated, Vercel should show in your DNS records:

- **Type:** A Record
  - **Name:** @
  - **Value:** 76.76.19.89

- **Type:** AAAA Record
  - **Name:** @
  - **Value:** 2606:4700:3111::681b:130

- **Type:** CNAME Record
  - **Name:** www
  - **Value:** cname.vercel-dns.com

## Step 7: Test Your Domain

Once DNS propagates (can take up to 48 hours):

1. Visit: `https://laraibcreative.studio`
2. Check browser console for any errors
3. Verify API calls are working:
   ```
   curl https://laraibcreative-backend.onrender.com/health
   ```

## Step 8: Configure Redirect (www to non-www)

In Vercel project settings, you can configure www redirect:

Option 1: **Automatic with Vercel**
- Vercel handles www → non-www automatically
- Both `laraibcreative.studio` and `www.laraibcreative.studio` work

Option 2: **Manual with vercel.json**
- Already configured in your `vercel.json`

## Troubleshooting

### Domain shows "Invalid Configuration"
- Check nameservers are correct at registrar
- Wait 24-48 hours for DNS propagation
- Use [DNS Checker](https://dnschecker.org/) to verify

### API calls fail with CORS error
- Verify `CORS_ORIGIN=https://laraibcreative.studio` in backend .env.render
- Restart the Render backend service
- Check browser console for specific error

### SSL certificate not working
- Vercel auto-provisions, takes ~5 minutes
- Clear browser cache and try HTTPS URL

### www subdomain not working
- Vercel automatically handles www redirect
- If issues persist, add explicit CNAME record for www → cname.vercel-dns.com

## Project Configuration Files

Key files updated for production:

1. **frontend/.env** - Production API URLs
2. **frontend/next.config.js** - Image domains
3. **backend/.env.render** - CORS and site URLs
4. **vercel.json** - Domain configuration and rewrites

## DNS Propagation Checker

Tools to check DNS propagation:
- [whatsmydns.net](https://whatsmydns.net/)
- [dnschecker.org](https://dnschecker.org/)

## After Domain is Live

1. **Update SSL Security**
   - Vercel provides free auto-renewing certificates
   - No additional action needed

2. **Monitor Performance**
   - Use Vercel Analytics
   - Monitor error rates in Vercel dashboard

3. **Keep Backups Updated**
   - Ensure MongoDB backups are running
   - Configure automatic backups if not already done

4. **Update Social Media**
   - Update links from old domain (if any) to laraibcreative.studio
   - Update business directory listings

## Support

- Vercel Support: https://vercel.com/support
- Domain Registrar Support: Contact your registrar
- MongoDB: https://www.mongodb.com/support
- Render: https://render.com/support

---

**Last Updated:** November 15, 2025
**Status:** Configuration Complete ✅
