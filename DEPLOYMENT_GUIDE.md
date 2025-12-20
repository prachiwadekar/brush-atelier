# Brush Atelier Deployment Guide

## Deploy to brushatelier.art on Vercel

### Step 1: Database Setup with Turso (SQLite-compatible cloud database)

Since your app uses SQLite, we'll use Turso which provides a hosted SQLite database.

1. **Install Turso CLI:**
```bash
curl -sSfL https://get.tur.so/install.sh | bash
```

2. **Sign up for Turso:**
```bash
turso auth signup
```

3. **Create a database:**
```bash
turso db create brush-atelier
```

4. **Get your database URL:**
```bash
turso db show brush-atelier --url
```
Copy this URL - you'll need it for environment variables.

5. **Get your auth token:**
```bash
turso db tokens create brush-atelier
```
Copy this token - you'll need it for environment variables.

6. **Migrate your existing database (optional, if you have data):**
```bash
# Export your current SQLite database
sqlite3 prisma/dev.db .dump > backup.sql

# Import to Turso
turso db shell brush-atelier < backup.sql
```

### Step 2: Update Database Configuration

Your database configuration files need to be updated to support both local development (SQLite) and production (Turso).

The following files have hardcoded database paths that need updating:
- `lib/prisma.ts`
- `app/api/coaching-session/route.ts`
- `app/api/coaching-session/resume/route.ts`
- `app/api/coaching-session/complete/route.ts`
- `app/api/portfolio/route.ts`
- `app/api/auth/signup/route.ts`
- `app/api/onboarding/route.ts`
- `app/dashboard/page.tsx`
- `app/onboarding/page.tsx`
- `lib/auth.ts`

I can help you update these files to use environment variables instead of hardcoded paths.

### Step 3: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 4: Prepare for Deployment

1. **Create a `.gitignore` entry for environment variables:**
Make sure `.env` is in `.gitignore` (it should already be there).

2. **Commit your code:**
```bash
git add .
git commit -m "Prepare for deployment"
```

### Step 5: Deploy to Vercel

1. **Login to Vercel:**
```bash
vercel login
```

2. **Deploy:**
```bash
cd /Users/prachiwadekar/brush-atelier
vercel
```

When prompted:
- Select "Set up and deploy"
- Choose your scope (personal account or team)
- Link to existing project: No
- Project name: brush-atelier
- Directory: ./
- Override settings: No

3. **Configure Environment Variables:**

After deployment, add your environment variables to Vercel:

```bash
# Required variables
vercel env add TURSO_DATABASE_URL
vercel env add TURSO_AUTH_TOKEN
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET
vercel env add ANTHROPIC_API_KEY
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
```

When prompted for environment (Development, Preview, Production), select "Production" for each.

**Important values:**
- `TURSO_DATABASE_URL`: Your Turso database URL from Step 1
- `TURSO_AUTH_TOKEN`: Your Turso auth token from Step 1
- `NEXTAUTH_URL`: `https://brushatelier.art`
- `NEXTAUTH_SECRET`: Generate a new secret with: `openssl rand -base64 32`
- `ANTHROPIC_API_KEY`: Your existing API key from `.env`
- `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret

4. **Deploy to production:**
```bash
vercel --prod
```

### Step 6: Connect Custom Domain

1. **Add domain to Vercel:**
```bash
vercel domains add brushatelier.art
```

Or via Vercel Dashboard:
- Go to your project on vercel.com
- Click "Settings" → "Domains"
- Add "brushatelier.art"

### Step 7: Configure DNS on GoDaddy

Vercel will provide you with DNS records. Add these to GoDaddy:

1. **Login to GoDaddy**
2. **Go to DNS Management for brushatelier.art**
3. **Add/Update the following records:**

**For root domain (brushatelier.art):**
- Type: A
- Name: @
- Value: 76.76.21.21
- TTL: 600

**For www subdomain:**
- Type: CNAME
- Name: www
- Value: cname.vercel-dns.com
- TTL: 600

**Alternative (if Vercel provides different IPs):**
Vercel may provide you with specific nameservers or A records. Use those instead.

4. **Wait for DNS propagation** (can take 5-48 hours, usually faster)

### Step 8: Update Google OAuth URLs

Since you're using Google OAuth, update your Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" → "Credentials"
4. Edit your OAuth 2.0 Client ID
5. Add authorized JavaScript origins:
   - `https://brushatelier.art`
6. Add authorized redirect URIs:
   - `https://brushatelier.art/api/auth/callback/google`

### Step 9: Test Your Deployment

1. Visit `https://brushatelier.art`
2. Test sign-in functionality
3. Test creating a coaching session
4. Check that all features work

### Troubleshooting

**If deployment fails:**
- Check Vercel logs: `vercel logs`
- Verify all environment variables are set
- Make sure build completes locally: `npm run build`

**If database connection fails:**
- Verify TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are correct
- Check Turso database status: `turso db show brush-atelier`

**If OAuth fails:**
- Verify redirect URLs in Google Cloud Console
- Check NEXTAUTH_URL is set to `https://brushatelier.art`
- Ensure NEXTAUTH_SECRET is set

### Production Checklist

- [ ] Turso database created and migrated
- [ ] All environment variables configured on Vercel
- [ ] Google OAuth URLs updated
- [ ] Custom domain connected
- [ ] DNS records configured on GoDaddy
- [ ] Test authentication
- [ ] Test coaching sessions
- [ ] Test portfolio features

### Important Notes

1. **Database Migrations:** When you update your Prisma schema, you'll need to run migrations against Turso:
   ```bash
   turso db shell brush-atelier "pragma table_info(your_table);"
   ```

2. **Environment Variables:** Never commit `.env` to git. Always use Vercel's environment variables for production.

3. **API Keys:** Your ANTHROPIC_API_KEY is currently in the codebase. Make sure it's also added to Vercel environment variables.

4. **Monitoring:** Set up Vercel Analytics and Error Tracking for production monitoring.

---

## Need Help?

If you need assistance with any step, I can help you:
1. Update the database configuration files
2. Set up Turso
3. Configure environment variables
4. Troubleshoot deployment issues

Just let me know which step you'd like help with!
