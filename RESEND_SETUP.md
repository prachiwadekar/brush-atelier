# Resend Email Setup for Feedback

This guide explains how to set up Resend to send feedback emails directly to your inbox.

## What is Resend?

Resend is a modern email API service that makes it easy to send transactional emails from your application. It's developer-friendly and has a generous free tier (100 emails/day, 3,000/month).

## Setup Steps

### 1. Create a Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your API Key

1. Log into your Resend dashboard
2. Navigate to **API Keys** in the sidebar
3. Click **Create API Key**
4. Give it a name like "Brush Atelier Feedback"
5. Select the "Sending access" permission
6. Copy the API key (it starts with `re_`)

### 3. Add API Key to Environment Variables

Add the following to your `.env.local` file:

```bash
RESEND_API_KEY=re_your_api_key_here
```

### 4. Verify Domain (Optional but Recommended)

For production, you should verify your domain:

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter `brushatelier.art`
4. Follow the DNS configuration instructions
5. Wait for verification (usually takes a few minutes)

**Important:** Until your domain is verified, Resend will only send emails to the email address you signed up with. This is fine for testing!

### 5. Test the Feedback Form

1. Restart your development server: `npm run dev`
2. Navigate to `/feedback` in your browser
3. Fill out the feedback form
4. Submit it
5. Check your inbox at `prachiwadekar@gmail.com`

## How It Works

When a user submits feedback:

1. The form sends a POST request to `/api/feedback`
2. The API logs the feedback to the console
3. If `RESEND_API_KEY` is configured, it sends an email to `prachiwadekar@gmail.com`
4. The email includes:
   - The user's email (set as reply-to)
   - Timestamp
   - Full feedback message
   - Nicely formatted HTML

## Troubleshooting

### Email Not Sending

- Check that `RESEND_API_KEY` is set in `.env.local`
- Restart your development server after adding the key
- Check the terminal logs for error messages
- Verify you're using the correct API key format (starts with `re_`)

### Email Goes to Spam

- Verify your domain in Resend (see step 4 above)
- This is less of an issue with Resend compared to other services

### Free Tier Limits

The free tier includes:
- 100 emails per day
- 3,000 emails per month
- 1 verified domain

This should be more than enough for feedback emails!

## Cost

Resend pricing:
- **Free**: 100 emails/day, 3,000/month (perfect for feedback)
- **Pro**: $20/month for 50,000 emails/month (if you need more later)

## Alternative: No Resend Setup

If you don't set up Resend, the feedback form will still work:
- Feedback is logged to the console
- The form shows success to the user
- You just won't receive emails

You can check the server logs to see feedback submissions.
