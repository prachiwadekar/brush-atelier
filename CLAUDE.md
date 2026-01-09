# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Brush Atelier is an AI-powered art coaching platform that helps adult learners and returning artists improve their painting skills through personalized, step-by-step guidance.

## Core Architecture

### Hybrid AI System (Critical)

The application uses a **two-stage AI pipeline** for coaching:

1. **Vision Analysis (GPT-4o)**: Analyzes uploaded artwork images to identify subject matter, composition, colors, complexity, and techniques
2. **Coaching Generation (Groq LLaMA 3.1 8B)**: Creates personalized coaching plans, color mixing guides, and conversational teaching based on the vision analysis

**Why this matters**: Never use a single AI model. The vision analysis output from GPT-4o must be passed as context to LLaMA for coaching plan generation. See `app/api/coaching-session/route.ts` for the implementation pattern.

### Database & Authentication

- **Database**: PostgreSQL with Prisma ORM (not SQLite in production)
- **Auth**: NextAuth.js v5 with Prisma adapter
- **User Roles**: `ARTIST`, `STUDENT`, `ADMIN` (enum in schema)
- **Coaching Sessions**: Stored with full coaching plan JSON, not regenerated on resume

### Key Data Models

```
User (core auth model)
├── CoachingSession (AI-generated plans, chat history)
├── ArtistProfile (for future mentor marketplace)
└── StudentProfile (skill level, interests)
```

**CoachingSession structure**:
- `coachPlan`: JSON array of 10-12 steps with `coaching_point`, `common_mistakes`, `color_mixing`, `canvas_state`
- `messages`: Chat history between user and AI coach
- `currentStep`: Progress tracker (0-indexed)

## Development Commands

```bash
# Development
npm run dev                    # Start Next.js dev server (port 3000)
npm run build                  # Production build (required before deployment)

# Database
npx prisma generate            # Generate Prisma client (runs on postinstall)
npx prisma migrate dev         # Create and run migrations
npx prisma studio              # Open database GUI

# Deployment
vercel --prod                  # Deploy to production (brushatelier.art)
vercel env ls                  # List environment variables
vercel env add VARIABLE_NAME   # Add environment variable
```

## Critical API Routes

### `/app/api/coaching-session/route.ts`
Main coaching engine. **Two-stage process**:
1. POST: GPT-4o analyzes image → LLaMA generates 10-12 step coaching plan
2. Returns: `{ coachPlan, materialsGuide, estimatedTime, firstMessage }`

### `/app/api/coaching-session/resume/route.ts`
Handles chat during coaching sessions. Uses existing `coachPlan` from database, doesn't regenerate.

### `/app/api/analyze-artwork/route.ts`
GPT-4o instant critique feature. Separate from coaching sessions.

## Environment Variables (Required)

```bash
# AI APIs (Both required - see HYBRID_AI_SETUP.md)
OPENAI_API_KEY=sk-...          # GPT-4o for vision
GROQ_API_KEY=gsk-...           # LLaMA 3.1 8B for coaching

# Database (PostgreSQL required for Vercel)
DATABASE_URL=postgresql://...

# NextAuth
NEXTAUTH_URL=http://localhost:3000  # or production URL
NEXTAUTH_SECRET=...                 # openssl rand -base64 32

# Analytics (see AMPLITUDE_SETUP.md)
NEXT_PUBLIC_AMPLITUDE_API_KEY=...   # Amplitude Analytics API key

# Optional OAuth providers
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

**Important**: `.env*` files are gitignored. Never commit API keys.

## UI/Component Patterns

### Dashboard Architecture
- **Layout**: `components/dashboard/dashboard-layout.tsx` - Sidebar navigation, user menu
- **Client Logic**: `components/dashboard/dashboard-client.tsx` - Main dashboard state management
- **Tabs**: `components/dashboard/dashboard-tabs.tsx` - Portfolio, New Artwork, Critique views

### Coaching UI Patterns
- Step-by-step navigation with numbered badges
- Collapsible sections: Coaching Point, Caution (not "Common Mistakes"), Color Mixing
- Real-time chat interface for Q&A during sessions
- Reference image display alongside coaching steps

### Color Scheme
- Primary: `#2563EB` (blue)
- Accent: `#C2410C` (orange/red)
- Background: `#FBF7F2` (cream)
- Text: `#1F2933` (dark gray)

## AI Prompting Guidelines

When generating coaching plans (in `coaching-session/route.ts`):

1. **Empathetic Tone**: Teaching adults who are anxious and rusty
2. **Separation of Concerns**:
   - `coaching_point`: Observation + technique + WHY (never include color ratios here)
   - `color_mixing`: Only color recipes using primaries (Red, Blue, Yellow, White, Black)
   - `common_mistakes`: Framed as normal and fixable, not judgmental
   - `canvas_state`: Visual description for progress tracking
3. **Always 10-12 steps**: From foundation to finishing touches
4. **Primary colors only**: Assume users only have basic supplies

## Deployment Notes

- **Platform**: Vercel (brushatelier.art)
- **Build**: Turbopack-powered Next.js 16
- **Database**: Neon PostgreSQL (not SQLite)
- **Environment variables**: Must be set in Vercel dashboard for production

## Analytics

The app uses **Amplitude Analytics** for tracking user behavior and product analytics. See [AMPLITUDE_SETUP.md](AMPLITUDE_SETUP.md) for setup instructions.

**Key analytics functions** (from `lib/analytics.ts`):
- `analytics.signupCompleted(userId, method)` - Track new signups
- `analytics.coachingSessionStarted(sessionId, medium, skillLevel)` - Track session starts
- `analytics.coachingStepCompleted(sessionId, stepNumber, totalSteps)` - Track progress
- `analytics.artworkUploaded(sessionId, fileSize, fileType)` - Track uploads
- `analytics.chatMessageSent(sessionId, messageLength)` - Track engagement

**Usage pattern**: Call analytics functions after successful actions, not before. Example:
```typescript
// After creating a coaching session
analytics.coachingSessionStarted(session.id, medium, skillLevel);
```

## Common Gotchas

1. **Don't regenerate coaching plans**: Use `CoachingSession.coachPlan` from database on resume
2. **Vision requires GPT-4o**: LLaMA cannot analyze images
3. **Prisma adapter**: Uses `@auth/prisma-adapter` v2, not the old one
4. **Mobile responsiveness**: All components must support small screens (sm: breakpoints)
5. **PostgreSQL vs SQLite**: Schema differs slightly, always use PostgreSQL adapter for production
6. **Analytics are optional**: App works without `NEXT_PUBLIC_AMPLITUDE_API_KEY` set
