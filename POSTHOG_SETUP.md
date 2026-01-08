# PostHog Analytics Integration

This document describes the PostHog analytics integration in Brush Atelier.

## Overview

PostHog is used for product analytics, session replay, and feature flags to understand user behavior and improve the application.

## Setup

### 1. Get Your PostHog API Key

1. Go to [PostHog](https://app.posthog.com/signup)
2. Create a new account or sign in
3. Create a new project or use an existing one
4. Go to Project Settings → API Keys
5. Copy your Project API Key

### 2. Add Environment Variables

Add the following to your `.env.local` file:

```bash
NEXT_PUBLIC_POSTHOG_KEY="your-project-api-key-here"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"  # or your self-hosted URL
```

For production (Vercel):
```bash
vercel env add NEXT_PUBLIC_POSTHOG_KEY
vercel env add NEXT_PUBLIC_POSTHOG_HOST
```

### 3. Features Enabled

- **Auto-capture**: Automatically tracks clicks, page views, and page leaves
- **Session Replay**: Records user sessions for debugging
- **Feature Flags**: Control feature rollouts
- **User Identification**: Associates events with authenticated users
- **Custom Events**: Track specific user actions

## Usage

### Basic Event Tracking

```typescript
import { analytics } from '@/lib/analytics';

// Track a custom event
analytics.coachingSessionStarted(sessionId, 'watercolor', 'beginner');
```

### Available Analytics Methods

#### Authentication Events
- `analytics.signupCompleted(userId, method)` - User completed signup
- `analytics.signinCompleted(userId, method)` - User signed in
- `analytics.signoutCompleted()` - User signed out

#### Onboarding Events
- `analytics.onboardingStarted()` - User started onboarding
- `analytics.onboardingCompleted(role, skillLevel, interests)` - User completed onboarding

#### Coaching Session Events
- `analytics.coachingSessionStarted(sessionId, medium, skillLevel)` - Session started
- `analytics.coachingStepCompleted(sessionId, stepNumber, totalSteps)` - Step completed
- `analytics.coachingSessionCompleted(sessionId, duration, stepsCompleted)` - Session finished
- `analytics.coachingSessionAbandoned(sessionId, lastStep, totalSteps)` - Session abandoned

#### Artwork Events
- `analytics.artworkUploaded(sessionId, fileSize, fileType)` - User uploaded artwork
- `analytics.artworkAnalyzed(sessionId, analysisType)` - Artwork analyzed

#### Engagement Events
- `analytics.colorGuideViewed(sessionId, stepNumber)` - Color guide opened
- `analytics.cautionViewed(sessionId, stepNumber)` - Caution section viewed
- `analytics.chatMessageSent(sessionId, messageLength)` - Chat message sent
- `analytics.portfolioViewed()` - Portfolio viewed

#### Feature Usage
- `analytics.newSessionClicked()` - New session button clicked
- `analytics.dashboardViewed(activeTab)` - Dashboard viewed

### User Identification

Users are automatically identified when they sign in through the AnalyticsProvider. You can also manually identify users:

```typescript
import { identifyUser } from '@/lib/analytics';

identifyUser(userId, {
  email: 'user@example.com',
  name: 'John Doe',
  plan: 'premium'
});
```

### Feature Flags

Check if a feature is enabled:

```typescript
import { isFeatureEnabled } from '@/lib/analytics';

if (isFeatureEnabled('new-coaching-flow')) {
  // Show new flow
} else {
  // Show old flow
}
```

## PostHog Dashboard

### Key Metrics to Track

1. **User Engagement**
   - Daily/Weekly/Monthly Active Users
   - Session duration
   - Pages per session

2. **Coaching Funnel**
   - Session start → Step completion → Session completion
   - Drop-off points
   - Time to complete sessions

3. **Feature Adoption**
   - Color guide usage
   - Chat engagement
   - Portfolio views

4. **User Journey**
   - Signup → Onboarding → First session → Return visits
   - Conversion points

### Creating Insights

1. Go to [PostHog Insights](https://app.posthog.com/insights)
2. Click "New Insight"
3. Choose event type and filters
4. Save to dashboard

### Session Replay

View user sessions:
1. Go to [Session Recordings](https://app.posthog.com/recordings)
2. Filter by user, date, or events
3. Watch recordings to understand user behavior

### Feature Flags

Create feature flags:
1. Go to [Feature Flags](https://app.posthog.com/feature_flags)
2. Click "New Feature Flag"
3. Set flag key and rollout percentage
4. Use `isFeatureEnabled(flagKey)` in code

## Privacy Considerations

- PostHog respects user privacy and GDPR compliance
- Session recordings can be disabled per user
- Personal data can be masked
- Users can opt out of tracking

To disable tracking for specific users:
```typescript
import posthog from 'posthog-js';
posthog.opt_out_capturing();
```

## Debugging

Enable debug mode in development:
- Debug mode is automatically enabled in development
- Check browser console for PostHog events
- Events are logged with full details

## Free Tier Limits

PostHog offers generous free tier:
- 1M events/month
- Unlimited session recordings (90 day retention)
- Unlimited feature flags
- 1 year data retention

## Support

- [PostHog Documentation](https://posthog.com/docs)
- [PostHog Community](https://posthog.com/questions)
- [PostHog GitHub](https://github.com/PostHog/posthog)
