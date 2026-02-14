# Required Environment Variables

## 🔴 REQUIRED (Must Set)

### Firebase Configuration (7 variables)
These are **required** for Firebase to work. Get them from [Firebase Console](https://console.firebase.google.com/):
- Go to Project Settings > General > Your apps > Web app config

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### NextAuth.js Configuration (2 variables)
```
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXTAUTH_URL=http://localhost:3000
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

**Note:** For production, `NEXTAUTH_URL` should be your production domain (e.g., `https://yourdomain.com`)

---

## 🟡 OPTIONAL (Only if using these features)

### Google OAuth (2 variables)
Only needed if you want Google Sign In to work:
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Apple Sign In (2 variables)
Only needed if you want Apple Sign In to work:
```
APPLE_ID=your-apple-service-id
APPLE_SECRET=your-apple-private-key-jwt
```

---

## Quick Setup

1. **Copy the example file:**
   ```bash
   cp env.example .env.local
   ```

2. **Fill in your values:**
   - Get Firebase config from [Firebase Console](https://console.firebase.google.com/)
   - Generate `NEXTAUTH_SECRET` with: `openssl rand -base64 32`
   - Add OAuth credentials if using Google/Apple sign in

3. **For Vercel/Production:**
   - Add all these variables in your hosting platform's environment variables settings
   - Update `NEXTAUTH_URL` to your production domain

---

## Summary

**Minimum required:** 9 variables (7 Firebase + 2 NextAuth)
**With Google OAuth:** +2 variables = 11 total
**With Apple Sign In:** +2 variables = 13 total
**With both OAuth:** +4 variables = 13 total
