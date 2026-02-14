# Fix: Show Custom Domain Instead of Firebase Domain

## Issue
Users see "Sign in to average-dad-athletics-6bb32.firebaseapp.com" instead of your custom domain.

## Solution Options

### Option 1: Configure Custom Domain in Firebase (Recommended)

Firebase allows you to use a custom domain for authentication:

1. **Go to Firebase Console:**
   - https://console.firebase.google.com/
   - Select project: **average-dad-athletics-6bb32**

2. **Go to Authentication → Settings:**
   - Click **Authentication** → **Settings** tab
   - Look for **Authorized domains** section

3. **Add Custom Domain:**
   - Your domain `averagedadathletics.com` should already be in authorized domains
   - Make sure it's listed

4. **Update OAuth Consent Screen (Google):**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Select your Firebase project
   - Go to **APIs & Services** → **OAuth consent screen**
   - Update **Application home page** to: `https://averagedadathletics.com`
   - Update **Authorized domains** to include: `averagedadathletics.com`

5. **Update OAuth Consent Screen (Apple):**
   - Go to [Apple Developer Portal](https://developer.apple.com/)
   - Navigate to your App ID
   - Update **Website URLs** to use: `https://averagedadathletics.com`

### Option 2: Use Custom Auth Domain (Advanced)

If you want to use a completely custom auth domain:

1. **Set up custom domain in Firebase:**
   - Firebase Console → **Hosting** → **Add custom domain**
   - Add `auth.averagedadathletics.com` (or similar subdomain)
   - Follow DNS configuration steps

2. **Update environment variable:**
   - Change `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` to your custom domain
   - Example: `auth.averagedadathletics.com`

**Note:** This requires DNS configuration and is more complex.

### Option 3: Update OAuth Redirect URIs

Make sure your OAuth providers (Google/Apple) have the correct redirect URIs:

**For Google:**
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- **APIs & Services** → **Credentials**
- Edit your OAuth 2.0 Client
- **Authorized redirect URIs** should include:
  - `https://averagedadathletics.com/__/auth/handler`
  - `https://averagedadathletics.com`

**For Apple:**
- Apple Developer Portal → Your Services ID
- **Return URLs** should include:
  - `https://averagedadathletics.com/__/auth/handler`

## Quick Fix (Most Common)

The OAuth consent screen is usually the culprit. Update it in Google Cloud Console:

1. Go to: https://console.cloud.google.com/
2. Select your Firebase project
3. **APIs & Services** → **OAuth consent screen**
4. Update:
   - **Application name**: Average Dad Athletics
   - **Application home page**: https://averagedadathletics.com
   - **Authorized domains**: averagedadathletics.com
5. Save

This will make the sign-in popup show your domain instead of the Firebase domain.

## After Making Changes

1. Wait 5-10 minutes for changes to propagate
2. Clear browser cache
3. Try signing in again
4. The popup should now show your custom domain
