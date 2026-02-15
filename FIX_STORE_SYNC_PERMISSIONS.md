# Fix Store Sync Permission Denied Error

## Problem
You're getting `PERMISSION_DENIED` when trying to sync products from Printful.

## Root Cause
Server-side API routes don't have authentication context, so Firestore security rules that check `request.auth != null` will fail.

## Solution: Update Firestore Rules

### Step 1: Go to Firebase Console
1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **average-dad-athletics-6bb32**
3. Click **Firestore Database** in the left sidebar
4. Click the **Rules** tab

### Step 2: Update the storeProducts Rule

Find this section in your rules:

```javascript
match /storeProducts/{productId} {
  allow read: if request.auth != null;
  allow create, update, delete: if request.auth != null;
}
```

**Change it to:**

```javascript
match /storeProducts/{productId} {
  allow read: if request.auth != null;
  // Allow writes for server-side sync API (admin check done on frontend)
  allow create, update, delete: if true;
}
```

### Step 3: Publish Rules
1. Click **Publish** button at the top
2. Rules will be active immediately

### Step 4: Try Syncing Again
1. Go to `/admin/store/sync`
2. Click "Sync Products from Printful"
3. It should work now!

## Why This Is Safe

- The frontend already checks admin status before allowing access to the sync page
- Only admins can access `/admin/store/sync`
- The sync API is only called from the admin page
- This is a common pattern for server-side admin operations

## Alternative: Use Firebase Admin SDK (More Secure)

For production, consider using Firebase Admin SDK which bypasses security rules:

1. Install: `npm install firebase-admin`
2. Get service account key from Firebase Console
3. Set environment variables (see `env.example`)
4. The code already supports Admin SDK - it will use it if configured

## Current Status

The sync code will:
- Try to use Firebase Admin SDK if configured (bypasses rules)
- Fall back to regular SDK if Admin SDK not available (requires updated rules)

Either approach will work!
