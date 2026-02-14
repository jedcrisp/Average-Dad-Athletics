# Environment Variables Setup

Complete guide for setting up environment variables locally and on Vercel.

## Required Variables (7 total)

**Note:** All variables must start with `NEXT_PUBLIC_` prefix.

- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`
- `FIREBASE_MEASUREMENT_ID`

## Local Setup

1. **Copy the example file:**
   ```bash
   cp env.example .env.local
   ```

2. **Get your Firebase values:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Click ⚙️ → **Project Settings**
   - Scroll to **Your apps** → Click your web app
   - Copy each value to your `.env.local` file

3. **Your `.env.local` should look like:**
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your-actual-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   ```
   
   (See `env.example` for the exact format)

## Vercel Setup

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select your project → **Settings** → **Environment Variables**

2. **Add each variable:**
   - Click **Add New**
   - **Key**: Enter full variable name with `NEXT_PUBLIC_` prefix (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY`)
   - **Value**: Paste value from Firebase Console
   - **Environment**: Select Production, Preview, Development
   - Click **Save**
   - Repeat for all 7 variables

3. **Redeploy:**
   - Go to **Deployments** tab
   - Click **⋯** on latest deployment → **Redeploy**
   - Or push a new commit

4. **Verify:**
   - Check build logs
   - Should NOT see: `Missing required Firebase environment variables`

## Sign-In Providers (Optional)

Google and Apple Sign In are configured in Firebase Console, not via environment variables:

1. Go to Firebase Console → **Authentication** → **Sign-in method**
2. Enable **Google** or **Apple**
3. Follow Firebase setup instructions
4. No additional env vars needed!

## Quick Checklist

- [ ] All 7 Firebase variables set locally (with `NEXT_PUBLIC_` prefix)
- [ ] All 7 variables added to Vercel
- [ ] Variables enabled for correct environments
- [ ] Application redeployed (if on Vercel)
- [ ] No warnings in build logs

## Troubleshooting

### "Missing required Firebase environment variables"

1. **Check variable names** - Must match exactly (case-sensitive, include `NEXT_PUBLIC_` prefix):
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
   
   (See `env.example` for exact names)

2. **On Vercel:**
   - Make sure you clicked **Save** after adding each variable
   - Check environment scope (Production/Preview/Development)
   - Redeploy after adding variables

3. **Locally:**
   - File must be named `.env.local` (not `.env`)
   - Restart dev server after adding variables
   - Check for typos in variable names

## Summary

- **Required:** 7 Firebase variables
- **Optional:** Google/Apple Sign In (configured in Firebase Console)
- **Template:** See `env.example` for format
