# Average Dad Athletics - Website

A modern website for Average Dad Athletics, a brand inspiring average dads to push themselves and get better.

## Features

- 🎥 **YouTube Integration** - Display and play YouTube videos
- 💪 **Workout Library** - Browse and share workouts
- 💬 **Community Forum** - Connect with other dads (ready for implementation)
- 📱 **Responsive Design** - Works on all devices
- 🎨 **Modern UI** - Beautiful, inspiring design

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with navbar and footer
│   ├── page.tsx            # Homepage
│   ├── videos/             # YouTube videos page
│   ├── workouts/           # Workout library page
│   └── forum/              # Community forum page
├── components/
│   ├── Navbar.tsx          # Navigation component
│   └── Footer.tsx          # Footer component
└── public/                 # Static assets
```

## Customization

### Adding YouTube Videos

Edit `app/videos/page.tsx` and add your YouTube video IDs to the `videos` array:

```typescript
const videos: Video[] = [
  {
    id: 'YOUR_VIDEO_ID',
    title: 'Your Video Title',
    description: 'Video description',
    thumbnail: '',
  },
]
```

### Adding Workouts

Edit `app/workouts/page.tsx` and add your workouts to the `workouts` array.

### Styling

The project uses Tailwind CSS. Customize colors in `tailwind.config.js`.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub (already done!)
2. Go to [Vercel](https://vercel.com) and sign in
3. Click "Add New Project"
4. Import your GitHub repository: `jedcrisp/Average-Dad-Athletics`
5. **Important:** Add all environment variables in Vercel's dashboard:
   - All `NEXT_PUBLIC_FIREBASE_*` variables
   - `NEXTAUTH_SECRET` (generate with: `openssl rand -base64 32`)
   - `NEXTAUTH_URL` (will be auto-set to your Vercel domain, but you can override)
   - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (if using Google OAuth)
   - `APPLE_ID` and `APPLE_SECRET` (if using Apple Sign In)
6. Click "Deploy"

**Note:** Vercel will automatically:
- Detect Next.js framework
- Set `NEXTAUTH_URL` to your deployment URL
- Build and deploy your app

After deployment, update your OAuth redirect URIs to include your Vercel domain.

### Other Platforms

Build the project:
```bash
npm run build
```

Then deploy the `.next` folder to your hosting provider.

## Firebase Setup

Firebase is configured and ready to use. The configuration is in `lib/firebase.ts`.

### Firebase Services Available

- **Authentication** (`auth`) - User authentication
- **Firestore Database** (`db`) - NoSQL database for storing data
- **Storage** (`storage`) - File storage for images, videos, etc.
- **Analytics** (`analytics`) - User analytics (client-side only)

### Using Firebase in Your Components

```typescript
// Client-side components
import { auth, db, storage } from '@/lib/firebase-client'

// Server-side or shared
import { auth, db, storage } from '@/lib/firebase'
```

### Firebase Environment Variables (Required)

**All Firebase configuration values are now required via environment variables. No hardcoded keys are in the source code for security.**

Create a `.env.local` file in the root directory with your Firebase configuration:

```env
# Firebase Configuration (Required)
# Get these from Firebase Console: https://console.firebase.google.com/
# Project Settings > General > Your apps > Web app config
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

**See `env.example` for a complete template of all required environment variables.**

## Authentication Setup

### Additional Environment Variables

Add these to your `.env.local` file:

```env
# NextAuth.js
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (optional but recommended)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Apple OAuth (optional but recommended)
APPLE_ID=your-apple-service-id
APPLE_SECRET=your-apple-private-key-jwt
# Note: APPLE_TEAM_ID should be included in the JWT secret, not as a separate variable
```

### Setting up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Choose "Web application"
6. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google` (for development)
7. For production, add: `https://yourdomain.com/api/auth/callback/google`
8. Copy the Client ID and Client Secret to your `.env.local` file

### Setting up Apple Sign In

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Navigate to "Certificates, Identifiers & Profiles"
3. Create a new **Services ID** (or use existing)
   - Register a new Services ID
   - Enable "Sign in with Apple"
   - Add your domain and redirect URLs:
     - `http://localhost:3000/api/auth/callback/apple` (development)
     - `https://yourdomain.com/api/auth/callback/apple` (production)
4. Create a **Key** for Sign in with Apple:
   - Go to "Keys" → Create a new key
   - Enable "Sign in with Apple"
   - Download the `.p8` key file (you can only download it once!)
   - Note your Key ID and Team ID
5. Generate a JWT (JSON Web Token) for the `APPLE_SECRET`:
   - Use a tool like [jwt.io](https://jwt.io/) or a library
   - Header: `{"alg": "ES256", "kid": "YOUR_KEY_ID"}`
   - Payload: `{"iss": "YOUR_TEAM_ID", "iat": timestamp, "exp": timestamp, "aud": "https://appleid.apple.com", "sub": "YOUR_SERVICE_ID"}`
   - Sign with your `.p8` private key
6. Add to `.env.local`:
   - `APPLE_ID` = Your Services ID
   - `APPLE_SECRET` = The JWT you generated (must include your Team ID in the JWT payload)

**Note:** The Apple secret (JWT) needs to be regenerated periodically as it expires. Consider using a library or script to generate it automatically.

### Generating NEXTAUTH_SECRET

Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

## Next Steps

- [x] Implement user authentication for forum
- [x] Add Google OAuth sign-in
- [x] Add Apple Sign In
- [x] Set up Firebase (Auth, Firestore, Storage, Analytics)
- [ ] Connect workouts to Firestore database
- [ ] Connect forum posts to Firestore database
- [ ] Add YouTube API integration for automatic video fetching
- [ ] Implement workout submission form with Firebase
- [ ] Add email newsletter signup

## License

All rights reserved - Average Dad Athletics
