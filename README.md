# Brush Atelier

A marketplace platform connecting talented artists with aspiring students for mentorship and creative growth.

## Features

- **Dual User Roles**: Sign up as an Artist (mentor) or Student (mentee)
- **Artist Verification**: Manual verification process for artist authenticity
- **Portfolio Management**: Upload and showcase artwork
- **Mentorship Matching**: Students can request mentorship from verified artists
- **Flexible Pricing**: Artists set their own hourly rates
- **Social Authentication**: Sign in with Google, Instagram, or Pinterest
- **Portfolio Import**: Automatically import artwork from Instagram and Pinterest
- **Secure Payments**: Stripe integration for payment processing (coming soon)

## Tech Stack

- **Frontend**: Next.js 14+ with TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (Auth.js v5)
- **Payment Processing**: Stripe (to be configured)
- **File Storage**: AWS S3 or Cloudinary (to be configured)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Google OAuth credentials (for social login)

### 1. Clone and Install

```bash
cd brush-atelier
npm install
```

### 2. Set Up Environment Variables

Copy the `.env.example` file to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Update the following variables in `.env`:

```env
# Database - Replace with your PostgreSQL connection string
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/brush_atelier?schema=public"

# NextAuth - Generate a random secret: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-here"

# Google OAuth - Get from https://console.cloud.google.com
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. Set Up OAuth Providers

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy the Client ID and Client Secret to your `.env` file

#### Instagram OAuth (Optional - for portfolio import)

1. Go to [Meta for Developers](https://developers.facebook.com)
2. Create a new app and add Instagram Basic Display
3. Configure OAuth redirect URI: `http://localhost:3000/api/auth/callback/instagram`
4. Add required permissions: `user_profile`, `user_media`
5. Copy the Instagram App ID and App Secret to your `.env` file

#### Pinterest OAuth (Optional - for portfolio import)

1. Go to [Pinterest Developers](https://developers.pinterest.com)
2. Create a new app
3. Configure redirect URI: `http://localhost:3000/api/auth/callback/pinterest`
4. Request scopes: `user_accounts:read`, `pins:read`, `boards:read`
5. Copy the App ID and App Secret to your `.env` file

### 4. Set Up the Database

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Optional: Open Prisma Studio to view your database
npx prisma studio
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Database Schema

The application uses the following main models:

- **User**: Core user model with role (ARTIST, STUDENT, ADMIN)
- **ArtistProfile**: Extended profile for artists with hourly rate, specialization, verification status
- **StudentProfile**: Extended profile for students with interests and skill level
- **PortfolioItem**: Artwork uploads for both artists and students
- **MentorshipRequest**: Requests from students to artists for mentorship

## Project Structure

```
brush-atelier/
├── app/
│   ├── api/              # API routes
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # User dashboard
│   ├── onboarding/       # User onboarding flow
│   └── page.tsx          # Landing page
├── components/
│   ├── onboarding/       # Onboarding form components
│   └── providers/        # React context providers
├── lib/
│   ├── auth.ts           # NextAuth configuration
│   └── prisma.ts         # Prisma client
├── prisma/
│   └── schema.prisma     # Database schema
└── types/                # TypeScript type definitions
```

## Next Steps

### Immediate To-Do

1. **Configure Stripe**:
   - Set up a Stripe account
   - Add Stripe keys to `.env`
   - Implement payment flows

2. **Configure File Upload**:
   - Choose between AWS S3 or Cloudinary
   - Add credentials to `.env`
   - Implement image upload functionality

3. **Complete Core Features**:
   - Artist discovery/browse page
   - Profile editing
   - Portfolio management
   - Mentorship request system
   - Admin verification dashboard

### Future Enhancements

- Real-time messaging between artists and students
- Session scheduling and calendar integration
- Reviews and ratings system
- Advanced search and filtering
- Mobile app with React Native
- Email notifications
- Payment escrow system

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npx prisma studio` - Open database GUI
- `npx prisma migrate dev` - Create and run migrations

## Contributing

This is a private project. For any questions or issues, please contact the development team.

## License

Proprietary - All rights reserved
