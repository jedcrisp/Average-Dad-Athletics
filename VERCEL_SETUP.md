# Vercel Deployment Setup Guide

## Setting Up Environment Variables in Vercel

### Step 1: Get Your Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **average-dad-athletics-6bb32**
3. Click the gear icon ⚙️ → **Project Settings**
4. Scroll down to **Your apps** section
5. Click on your web app (or create one if you haven't)
6. You'll see your Firebase configuration object

### Step 2: Add Environment Variables in Vercel

1. Go to your Vercel project dashboard: https://vercel.com/dashboard
2. Select your project: **Average-Dad-Athletics**
3. Go to **Settings** → **Environment Variables**
4. Add each of these 7 variables one by one:

#### Required Firebase Variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCJ9ZrGCgA9MURVFXqhb3Q7MAapu8G8gCg
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=average-dad-athletics-6bb32.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=average-dad-athletics-6bb32
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=average-dad-athletics-6bb32.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=279593197182
NEXT_PUBLIC_FIREBASE_APP_ID=1:279593197182:web:143603867e2bb630bf422f
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-6CSJJW5JY9
```

### Step 3: How to Add Each Variable

For each variable above:

1. Click **Add New**
2. **Key**: Enter the variable name (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY`)
3. **Value**: Enter the value from your Firebase config
4. **Environment**: Select **Production**, **Preview**, and **Development** (or just Production if you prefer)
5. Click **Save**

**Important Notes:**
- ✅ All variables MUST start with `NEXT_PUBLIC_` to be accessible in the browser
- ✅ Add them to all environments (Production, Preview, Development) for consistency
- ✅ After adding variables, you need to **redeploy** for them to take effect

### Step 4: Redeploy Your Application

After adding all environment variables:

1. Go to **Deployments** tab
2. Click the **⋯** (three dots) on your latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger a new deployment

### Step 5: Verify Variables Are Set

After redeployment, check your deployment logs:

1. Go to **Deployments** → Click on your latest deployment
2. Check the **Build Logs**
3. You should NOT see the warning: `Missing required Firebase environment variables`
4. If you still see warnings, double-check that:
   - All 7 variables are added
   - Variable names match exactly (case-sensitive)
   - Variables are enabled for the correct environment

## Quick Checklist

- [ ] All 7 `NEXT_PUBLIC_FIREBASE_*` variables added
- [ ] Variables added to Production environment (at minimum)
- [ ] Variable names match exactly (including `NEXT_PUBLIC_` prefix)
- [ ] Application redeployed after adding variables
- [ ] No warnings in build logs about missing variables

## Troubleshooting

### Still seeing "Missing required Firebase environment variables"?

1. **Check variable names**: They must be EXACTLY:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

2. **Check environment scope**: Make sure variables are enabled for the environment you're deploying to

3. **Redeploy**: Variables only take effect after a new deployment

4. **Check for typos**: Copy-paste the variable names to avoid typos

### Variables not showing up?

- Make sure you clicked **Save** after adding each variable
- Check that you're looking at the correct project in Vercel
- Try redeploying after adding all variables

## Need Help?

If you're still having issues:
1. Check the Vercel deployment logs for specific error messages
2. Verify your Firebase project is active and accessible
3. Make sure your Firebase project has the web app configured
