# Google OAuth Setup Guide

## Overview

Google Sign-In has been successfully implemented in your Brush Atelier application! This guide will help you configure it properly.

## What's Been Added

### 1. UI Components
- **Sign In Page** ([app/auth/signin/page.tsx](app/auth/signin/page.tsx)): Added "Sign in with Google" button
- **Sign Up Page** ([app/auth/signup/page.tsx](app/auth/signup/page.tsx)): Added "Sign up with Google" button

### 2. Backend Configuration
- **Auth Configuration** ([lib/auth.ts](lib/auth.ts)):
  - Enabled PrismaAdapter for OAuth support
  - Added JWT callbacks to handle both OAuth and credentials auth
  - Added event handler to set default "STUDENT" role for new Google sign-ups
  - Properly configured session management

### 3. Database
Your Prisma schema already has the required tables:
- `Account` table for OAuth provider data
- `Session` table for user sessions
- `User` table with OAuth-compatible fields

## Setup Instructions

### Step 1: Create Google OAuth Application

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable **Google+ API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. Create OAuth credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Web application"

5. Configure your OAuth consent screen:
   - App name: **Brush Atelier**
   - User support email: Your email
   - Developer contact information: Your email
   - Scopes: Add `email` and `profile`
   - Test users (for development): Add your test email addresses

6. Add authorized redirect URIs:

   **For Development:**
   ```
   http://localhost:3000/api/auth/callback/google
   ```

   **For Production:**
   ```
   https://brushatelier.art/api/auth/callback/google
   ```

7. Copy your credentials:
   - Client ID
   - Client Secret

### Step 2: Update Environment Variables

#### Local Development (.env)
```bash
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NEXTAUTH_URL="http://localhost:3000"
```

#### Production (Vercel)
Run these commands to set production environment variables:

```bash
vercel env add GOOGLE_CLIENT_ID production
# Paste your client ID when prompted

vercel env add GOOGLE_CLIENT_SECRET production
# Paste your client secret when prompted

vercel env add NEXTAUTH_URL production
# Enter: https://brushatelier.art
```

Or add them via Vercel Dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXTAUTH_URL` (set to `https://brushatelier.art`)

### Step 3: Database Migration (If Needed)

If your database doesn't have the OAuth tables yet, run:

```bash
npx prisma generate
npx prisma db push
```

This ensures the `Account` and `Session` tables exist.

### Step 4: Test Locally

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/auth/signin`

3. Click "Sign in with Google"

4. Verify:
   - Google OAuth popup appears
   - You can sign in with your Google account
   - You're redirected to `/dashboard` after successful sign-in
   - Your user is created in the database with role "STUDENT"

### Step 5: Deploy to Production

```bash
git add .
git commit -m "Add Google OAuth authentication"
git push origin main
vercel --prod
```

## How It Works

### Authentication Flow

1. **User clicks "Sign in with Google"**
   - Calls `signIn("google", { callbackUrl: "/dashboard" })`

2. **NextAuth redirects to Google**
   - User sees Google's OAuth consent screen
   - User approves access to email and profile

3. **Google redirects back to your app**
   - Callback URL: `/api/auth/callback/google`
   - NextAuth receives authorization code

4. **NextAuth processes the sign-in**
   - Creates/updates user in `User` table
   - Creates account in `Account` table
   - Creates session in `Session` table
   - Sets default role to "STUDENT" for new users

5. **User is redirected to dashboard**
   - Session is established
   - User can access protected routes

### Data Storage

**User Table:**
```
id: "cuid"
email: "user@gmail.com"
name: "User Name"
image: "https://lh3.googleusercontent.com/..."
role: "STUDENT"
emailVerified: DateTime
password: null (for OAuth users)
```

**Account Table:**
```
provider: "google"
providerAccountId: "12345678901234567890"
access_token: "ya29.a0..."
refresh_token: "1//0g..."
expires_at: 1234567890
```

## Security Considerations

1. **Client Secret**: Never commit your `GOOGLE_CLIENT_SECRET` to Git
2. **NEXTAUTH_SECRET**: Use a strong random secret:
   ```bash
   openssl rand -base64 32
   ```
3. **Redirect URIs**: Only add authorized domains to prevent OAuth hijacking
4. **Scopes**: Only request necessary permissions (email, profile)

## Troubleshooting

### Error: "redirect_uri_mismatch"
**Solution:** Make sure the redirect URI in Google Console exactly matches:
- Development: `http://localhost:3000/api/auth/callback/google`
- Production: `https://brushatelier.art/api/auth/callback/google`

### Error: "Access blocked: This app's request is invalid"
**Solution:** Complete the OAuth consent screen configuration in Google Console.

### Users redirected to sign-in after Google auth
**Solution:** Check that:
1. `NEXTAUTH_URL` is set correctly
2. `NEXTAUTH_SECRET` is set
3. Database connection is working
4. `Account` and `Session` tables exist

### "Session not found" or "User not found"
**Solution:** Run database migration:
```bash
npx prisma db push
```

## Testing Checklist

- [ ] Local development Google sign-in works
- [ ] New users get "STUDENT" role by default
- [ ] User profile (name, email, image) is populated from Google
- [ ] Dashboard displays user information correctly
- [ ] Sign out works properly
- [ ] Production Google sign-in works
- [ ] Existing credential-based sign-in still works

## Additional Resources

- [NextAuth.js Google Provider Documentation](https://next-auth.js.org/providers/google)
- [Google OAuth 2.0 Setup Guide](https://developers.google.com/identity/protocols/oauth2)
- [Prisma Adapter for NextAuth](https://authjs.dev/reference/adapter/prisma)

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Check server logs: `npm run dev` output
3. Verify environment variables are set correctly
4. Ensure Google Cloud Console configuration matches this guide
