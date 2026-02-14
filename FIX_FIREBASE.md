# Quick Fix: Missing Firebase Environment Variables

## Error You're Seeing
```
Missing required Firebase environment variables: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
```

## Quick Fix Steps

### 1. Check Your `.env.local` File

Open `.env.local` in your editor and make sure you have ALL 7 variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-actual-value
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### 2. Get Your Firebase Values

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **average-dad-athletics-6bb32**
3. Click ⚙️ → **Project Settings**
4. Scroll to **Your apps** → Click your web app
5. Copy each value to your `.env.local` file

### 3. Common Issues

**Issue:** Variable name typo
- ✅ Correct: `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- ❌ Wrong: `NEXT_PUBLIC_FIREBASE_AUTHDOMAIN` (missing underscore)
- ❌ Wrong: `FIREBASE_AUTH_DOMAIN` (missing NEXT_PUBLIC_ prefix)

**Issue:** Empty value
- ❌ `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=` (empty)
- ✅ `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=average-dad-athletics-6bb32.firebaseapp.com`

**Issue:** Dev server not restarted
- After editing `.env.local`, you MUST restart your dev server:
  ```bash
  # Stop server (Ctrl+C)
  npm run dev
  ```

### 4. Verify All Variables Are Set

Your `.env.local` should have exactly 7 lines (one per variable), and each should have a value after the `=` sign.

### 5. Still Not Working?

1. **Double-check variable names** - They must match exactly (case-sensitive)
2. **Check for extra spaces** - No spaces around the `=` sign
3. **Restart dev server** - Environment variables only load on server start
4. **Check file location** - `.env.local` must be in the project root (same folder as `package.json`)

## Need Your Firebase Values?

If you don't have your Firebase config values, get them from:
- Firebase Console → Project Settings → Your apps → Web app config
