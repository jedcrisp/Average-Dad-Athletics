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
5. **Important:** Add all Firebase environment variables in Vercel's dashboard:
   - Go to **Settings** → **Environment Variables**
   - Add all 7 `NEXT_PUBLIC_FIREBASE_*` variables (see `VERCEL_SETUP.md` for detailed instructions)
   - Enable for: Production, Preview, and Development
6. Click "Deploy"
7. **After deployment:** Redeploy to ensure environment variables are loaded

**Note:** Vercel will automatically:
- Detect Next.js framework
- Build and deploy your app

**See `VERCEL_SETUP.md` for step-by-step instructions on adding environment variables.**

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

Authentication is handled entirely through Firebase. No additional environment variables are needed beyond the Firebase configuration.

### Setting up Google Sign In

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Authentication** → **Sign-in method**
4. Click on **Google**
5. Enable Google Sign In
6. Add your project's support email
7. Save

That's it! Firebase handles all OAuth configuration automatically.

### Setting up Apple Sign In

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Authentication** → **Sign-in method**
4. Click on **Apple**
5. Enable Apple Sign In
6. Follow the setup instructions in Firebase Console
7. Configure your Apple Developer account settings as prompted

Firebase will guide you through the Apple Developer setup process.

**Note:** All OAuth providers are configured directly in Firebase Console. No additional environment variables or API keys are needed!

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
