# Fix: OAuth Domain Not Authorized

## Error Message
```
The current domain is not authorized for OAuth operations. 
Add your domain (averagedadathletics.com) to the OAuth redirect domains list 
in the Firebase console -> Authentication -> Settings -> Authorized domains tab.
```

## Quick Fix

### Step 1: Go to Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **average-dad-athletics-6bb32**
3. Go to **Authentication** → **Settings** tab
4. Scroll down to **Authorized domains** section

### Step 2: Add Your Domain
Click **Add domain** and add:
- `averagedadathletics.com` (your production domain)
- `www.averagedadathletics.com` (if you use www)
- Your Vercel preview domain (if using Vercel)

### Step 3: Default Domains (Already Included)
These are automatically included:
- `localhost` (for local development)
- `average-dad-athletics-6bb32.firebaseapp.com` (Firebase hosting)
- `average-dad-athletics-6bb32.web.app` (Firebase hosting)

### Step 4: For Vercel Deployments
If you're using Vercel, also add:
- `your-project.vercel.app` (Vercel preview domain)
- Your custom domain if you have one

## Why This Happens

Firebase requires you to explicitly authorize domains for OAuth operations (Google Sign In, Apple Sign In) for security reasons. This prevents unauthorized sites from using your Firebase project.

## After Adding Domain

1. Save the changes in Firebase Console
2. Wait a few minutes for changes to propagate
3. Try signing in again - it should work now!

## Common Domains to Add

- Production: `averagedadathletics.com`
- Vercel: `your-project.vercel.app`
- Custom domain: `www.yourdomain.com` (if different from root)
