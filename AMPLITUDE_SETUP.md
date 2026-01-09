# Amplitude Analytics Setup Guide

This guide will help you set up Amplitude Analytics for Brush Atelier to track user behavior and product analytics.

## What is Amplitude?

Amplitude is a product analytics platform that helps you understand user behavior, track conversions, and optimize your product. It provides:

- **Event Tracking**: Track user actions and custom events automatically
- **Session Replay**: Watch real user sessions to understand behavior
- **User Identification**: Link events to specific users
- **Behavioral Cohorts**: Group users based on actions
- **Funnel Analysis**: Understand conversion paths
- **Retention Analysis**: Track user engagement over time
- **Web Vitals**: Monitor Core Web Vitals and performance metrics
- **Real-time Analytics**: See events as they happen

## Free Tier Benefits

Amplitude's free Starter plan includes:
- 10M events/month tracked
- Unlimited user seats
- 30 days of data history
- Core analytics features (funnels, retention, user streams)
- Session replay with 1,000 sessions/month
- Basic integrations

## Step 1: Create an Amplitude Account

1. Go to [https://amplitude.com](https://amplitude.com)
2. Click "Get Started Free"
3. Sign up with your email or Google account
4. Choose "Starter" plan (free)

## Step 2: Create a New Project

1. After logging in, you'll be prompted to create a project
2. Enter project details:
   - **Project Name**: "Brush Atelier"
   - **Project Type**: "Web App"
   - **Industry**: "Education" or "Consumer Apps"
3. Click "Create Project"

## Step 3: Get Your API Key

1. In your Amplitude dashboard, click on **Settings** (gear icon in bottom-left)
2. Click on **Projects** in the left sidebar
3. Find your project and click on it
4. Copy the **API Key** (this is your `NEXT_PUBLIC_AMPLITUDE_API_KEY`)

## Step 4: Add Environment Variables

### For Local Development

1. Create a `.env.local` file in your project root (if it doesn't exist)
2. Add your Amplitude API key:

```bash
NEXT_PUBLIC_AMPLITUDE_API_KEY=your_api_key_here
```

**Note**: The `.env.local` file is gitignored and won't be committed to version control.

### For Vercel Deployment

1. Go to your Vercel project dashboard
2. Click on **Settings** → **Environment Variables**
3. Add a new environment variable:
   - **Name**: `NEXT_PUBLIC_AMPLITUDE_API_KEY`
   - **Value**: Your Amplitude API key from Step 3
   - **Environment**: Select all (Production, Preview, Development)
4. Click **Save**
5. Redeploy your application for changes to take effect

## Step 5: Verify Integration

1. Start your development server: `npm run dev`
2. Open your browser and navigate to your app
3. Open browser DevTools and check the Network tab - you should see requests to `amplitude.com`
4. Sign in or create an account
5. Navigate around the app (dashboard, coaching sessions, etc.)
6. Go back to your Amplitude dashboard
7. Click on **User Lookup** in the left sidebar
8. You should see events appearing in real-time

## How It Works

The app uses Amplitude's **script-based integration** with full auto-capture enabled:

### Auto-Captured Events
Amplitude automatically tracks:
- **Page Views**: Every page navigation
- **Sessions**: User sessions with duration
- **Element Interactions**: Clicks on buttons, links, etc.
- **Form Interactions**: Form submissions and field changes
- **File Downloads**: Any file downloads
- **Network Tracking**: API requests and responses
- **Web Vitals**: Core Web Vitals (LCP, FID, CLS)
- **Frustration Interactions**: Rage clicks, dead clicks

### Custom Events
The app also tracks custom events for specific user actions:

### Authentication Events
- `signup_completed` - When a user creates an account
- `signin_completed` - When a user logs in
- `signout_completed` - When a user logs out

### Onboarding Events
- `onboarding_started` - When onboarding begins
- `onboarding_completed` - When user completes profile setup

### Coaching Session Events
- `coaching_session_started` - When a new coaching session begins
- `coaching_step_completed` - When user completes a coaching step
- `coaching_session_completed` - When user finishes all steps
- `coaching_session_abandoned` - When user leaves mid-session

### Artwork Events
- `artwork_uploaded` - When user uploads an image
- `artwork_analyzed` - When AI analyzes the artwork

### Engagement Events
- `color_guide_viewed` - When user expands color mixing guide
- `caution_viewed` - When user expands common mistakes section
- `chat_message_sent` - When user asks a question during coaching
- `portfolio_viewed` - When user views their portfolio
- `new_session_clicked` - When user clicks to start new session
- `dashboard_viewed` - When user views dashboard

## Using Amplitude Dashboard

### View User Activity
1. Go to **User Lookup**
2. Enter a user ID or email
3. See all events for that user in chronological order
4. Click on any event to see properties and context

### Watch Session Replays
1. Go to **Session Replay**
2. See a list of recorded sessions
3. Click on any session to watch it
4. See mouse movements, clicks, scrolls, and page navigations
5. Use this to debug issues and understand user behavior

### Create Funnels
1. Go to **Analytics** → **Funnels**
2. Click **New Funnel**
3. Add steps (e.g., `signup_completed` → `coaching_session_started` → `coaching_session_completed`)
4. See conversion rates between steps
5. Identify where users drop off

### Analyze Retention
1. Go to **Analytics** → **Retention**
2. Select a starting event (e.g., `signup_completed`)
3. Select a return event (e.g., `coaching_session_started`)
4. See how many users return over time (day 1, day 7, day 30)

### Monitor Web Vitals
1. Go to **Analytics** → **Web Vitals**
2. See Core Web Vitals metrics (LCP, FID, CLS)
3. Identify performance issues
4. Track improvements over time

### Export Data
1. Go to **Analytics** → **Event Segmentation**
2. Create a chart with the events you want
3. Click **Export** to download CSV

## Troubleshooting

### Events Not Showing Up

1. **Check API Key**: Verify the environment variable is set correctly
2. **Restart Server**: After adding the API key, restart your dev server
3. **Check Browser Console**: Look for Amplitude-related errors
4. **Check Network Tab**: Look for requests to `cdn.amplitude.com`
5. **Verify HTTPS**: Amplitude requires HTTPS in production
6. **Clear Cache**: Try clearing browser cache and reloading
7. **Check Ad Blockers**: Some ad blockers may block analytics

### User Not Identified

- Make sure you're signed in to the app
- Check that the session is authenticated
- User identification happens automatically when signed in
- Check browser console for any errors

### Session Replay Not Working

- Session replay is enabled with 100% sampling (`sampleRate: 1`)
- Requires user interactions to record
- Check Amplitude dashboard under **Session Replay**
- May take a few minutes to process and appear

### Duplicate Events

- This can happen during development with hot reloading
- Events in production should not duplicate
- If duplicates persist, check browser console for multiple Amplitude initializations

## Best Practices

1. **Don't Track Sensitive Data**: Never send passwords, payment info, or PII in custom events
2. **Use Consistent Naming**: Keep event names lowercase with underscores
3. **Add Context**: Include relevant properties with events (session_id, step_number, etc.)
4. **Test Locally First**: Verify events are working in development before deploying
5. **Monitor Quota**: Keep an eye on your monthly event limit (10M for free tier)
6. **Review Session Replays**: Watch user sessions to understand pain points
7. **Set Up Alerts**: Create alerts for important events (e.g., high abandonment rate)

## Privacy Considerations

- Session replay captures user interactions but masks sensitive data by default
- No passwords or credit card information is captured
- User emails are sent to Amplitude for user identification
- Amplitude is GDPR and CCPA compliant
- Users can opt-out of tracking via browser settings

## Additional Resources

- [Amplitude Documentation](https://www.docs.developers.amplitude.com/)
- [Amplitude Script Installation Guide](https://www.docs.developers.amplitude.com/data/sdks/marketing-analytics-browser/)
- [Session Replay Guide](https://help.amplitude.com/hc/en-us/articles/13858522148123-Session-Replay-Get-started)
- [Amplitude Best Practices](https://help.amplitude.com/hc/en-us/articles/229313067-Tracking-plan-best-practices)

## Support

If you need help:
- [Amplitude Help Center](https://help.amplitude.com/)
- [Amplitude Community](https://community.amplitude.com/)
- [Contact Support](https://amplitude.com/contact-us)
