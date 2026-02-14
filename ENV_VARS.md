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

**Note:** All Firebase variables must start with `NEXT_PUBLIC_` to be accessible in the browser.

---

## 🟡 OPTIONAL (Configure in Firebase Console)

### Google Sign In
- Enable in Firebase Console > Authentication > Sign-in method > Google
- No additional environment variables needed - Firebase handles OAuth automatically!

### Apple Sign In
- Enable in Firebase Console > Authentication > Sign-in method > Apple
- Configure your Apple Developer account settings
- No additional environment variables needed - Firebase handles OAuth automatically!

---

## Quick Setup

1. **Copy the example file:**
   ```bash
   cp env.example .env.local
   ```

2. **Fill in your Firebase values:**
   - Get Firebase config from [Firebase Console](https://console.firebase.google.com/)
   - Copy all 7 `NEXT_PUBLIC_FIREBASE_*` variables to your `.env.local` file

3. **Enable OAuth providers (optional):**
   - Go to Firebase Console > Authentication > Sign-in method
   - Enable Google and/or Apple Sign In
   - Follow the setup instructions in Firebase Console

4. **For Vercel/Production:**
   - Add all Firebase environment variables in your hosting platform's settings
   - Make sure all variables start with `NEXT_PUBLIC_`

---

## Summary

**Minimum required:** 7 variables (Firebase configuration only)
**OAuth providers:** Configured in Firebase Console, no additional env vars needed!
