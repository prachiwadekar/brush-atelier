# Quick Deployment to brushatelier.art

## What I've Done

I've updated all database configuration files to use environment variables instead of hardcoded paths. Your app is now deployment-ready!

## Changes Made:

1. ✅ Created `lib/db-config.ts` - Central database configuration
2. ✅ Updated all API routes to use `getDbPath()` function
3. ✅ Updated all page files to use environment variables
4. ✅ Updated authentication to use configurable database path
5. ✅ Build verified successfully

## Files Updated:
- `lib/db-config.ts` (NEW)
- `lib/prisma.ts`
- `lib/auth.ts`
- `app/api/coaching-session/route.ts`
- `app/api/coaching-session/resume/route.ts`
- `app/api/coaching-session/complete/route.ts`
- `app/api/portfolio/route.ts`
- `app/api/auth/signup/route.ts`
- `app/api/onboarding/route.ts`
- `app/dashboard/page.tsx`
- `app/onboarding/page.tsx`
- `.env` (added DB_PATH variable)

---

## Next Steps - Deploy in 3 Steps:

### Step 1: Install Vercel CLI (if not already installed)

```bash
npm install -g vercel
```

### Step 2: Deploy to Vercel

```bash
cd /Users/prachiwadekar/brush-atelier
vercel login
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? Choose your account
- Link to existing project? **No**
- Project name? **brush-atelier** (or your preferred name)
- In which directory is your code located? **./  ** (press Enter)
- Override settings? **No**

### Step 3: Add Environment Variables to Vercel

After deployment, add your environment variables:

```bash
# Set production environment variables
vercel env add NEXTAUTH_URL production
# Enter: https://brushatelier.art

vercel env add NEXTAUTH_SECRET production
# Generate and enter a secret: openssl rand -base64 32

vercel env add ANTHROPIC_API_KEY production
# Enter your Anthropic API key

vercel env add GOOGLE_CLIENT_ID production
# Enter your Google OAuth client ID

vercel env add GOOGLE_CLIENT_SECRET production
# Enter your Google OAuth client secret

vercel env add DB_PATH production
# Enter: ./prisma/dev.db
```

**Then redeploy with environment variables:**

```bash
vercel --prod
```

---

## Step 4: Connect Your Custom Domain

### Option A: Using Vercel CLI

```bash
vercel domains add brushatelier.art
```

### Option B: Using Vercel Dashboard

1. Go to https://vercel.com
2. Select your project (brush-atelier)
3. Go to Settings → Domains
4. Add domain: `brushatelier.art`
5. Vercel will provide DNS instructions

---

## Step 5: Configure DNS on GoDaddy

1. **Login to GoDaddy**: https://dcc.godaddy.com/domains
2. **Find brushatelier.art** and click "DNS"
3. **Add/Update DNS Records**:

**For the root domain:**
- Type: **A**
- Name: **@**
- Value: **76.76.21.21**
- TTL: **600**

**For www subdomain (optional):**
- Type: **CNAME**
- Name: **www**
- Value: **cname.vercel-dns.com**
- TTL: **600**

4. **Save changes** and wait for DNS propagation (5 minutes to 48 hours)

---

## Step 6: Update Google OAuth URLs

Since you're deploying to production, update your Google Cloud Console:

1. Go to https://console.cloud.google.com
2. Select your project
3. APIs & Services → Credentials
4. Edit your OAuth 2.0 Client ID
5. Add to **Authorized JavaScript origins**:
   - `https://brushatelier.art`
6. Add to **Authorized redirect URIs**:
   - `https://brushatelier.art/api/auth/callback/google`
7. Save changes

---

## Important Notes About Database

⚠️ **Current Setup**: Your app uses SQLite with better-sqlite3, which works locally but **has limitations on Vercel**:

- Vercel is serverless (no persistent file storage)
- Database resets on each deployment
- Not suitable for production with real users

### For Production (Recommended):

You have 2 options:

**Option 1: Turso (SQLite-compatible, easiest)**
- Cloud-hosted SQLite database
- Minimal code changes
- See detailed instructions in `DEPLOYMENT_GUIDE.md`

**Option 2: Vercel Postgres**
- Full PostgreSQL database
- Requires database migration
- Best for scaling

**For now**, the app will deploy and work, but **you'll need to set up Turso or Vercel Postgres before launching to real users**.

See the full guide in [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md) for detailed Turso setup instructions.

---

## Testing Your Deployment

After DNS propagation:

1. Visit `https://brushatelier.art`
2. Test sign-in with Google OAuth
3. Test creating a coaching session
4. Verify all features work

---

## Troubleshooting

**Deployment fails?**
```bash
vercel logs
```

**DNS not working?**
- Wait longer (can take up to 48 hours)
- Check DNS propagation: https://www.whatsmydns.net/#A/brushatelier.art

**OAuth errors?**
- Verify NEXTAUTH_URL is set to `https://brushatelier.art`
- Check Google Cloud Console redirect URLs
- Ensure NEXTAUTH_SECRET is set

---

## Quick Commands Reference

```bash
# Deploy to production
cd /Users/prachiwadekar/brush-atelier
vercel --prod

# View logs
vercel logs

# List environment variables
vercel env ls

# Open project in browser
vercel open
```

---

Need more details? See the comprehensive guide: [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md)
