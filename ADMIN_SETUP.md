# Admin Setup Guide

This guide explains how to set up admin access so you can create workouts from the website.

## Step 1: Set Yourself as Admin

You have two options:

### Option A: Add Your Email to Code (Quick)

1. Open `lib/admin-helpers.ts`
2. Find the `ADMIN_EMAILS` array
3. Add your email:
   ```typescript
   const ADMIN_EMAILS = [
     'jedcrisp@gmail.com',
     'your-email@example.com', // Add your email here
   ]
   ```

### Option B: Set Admin Flag in Firestore (Recommended)

1. **Go to Firebase Console:**
   - Visit [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Go to **Firestore Database**

2. **Find Your User Document:**
   - Open the `users` collection
   - Find the document with your user ID (your Firebase Auth UID)

3. **Add Admin Field:**
   - Click on your user document
   - Click **Add field**
   - **Field name**: `isAdmin`
   - **Field type**: `boolean`
   - **Value**: `true`
   - Click **Update**

## Step 2: Update Firestore Security Rules

1. **Go to Firebase Console:**
   - Firestore Database → **Rules** tab

2. **Update the rules** to include the admin check:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
             exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Users can read and write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Forum posts - authenticated users can read all, create their own
    match /forum/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Workouts - all authenticated users can read, only admins can write
    match /workouts/{workoutId} {
      allow read: if request.auth != null;
      allow create, update, delete: if isAdmin();
    }
    
    // Workout submissions - users can read all, create/update their own
    match /workoutSubmissions/{submissionId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Default: deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. **Click Publish**

## Step 3: Access Admin Page

1. **Sign in** to your website
2. **Look for "Admin" link** in the navbar (desktop and mobile)
3. **Click "Admin"** → You'll see the workout creation form
4. **Create workouts** directly from the website!

## How to Create a Workout

1. Go to `/admin/workouts` (or click "Admin" in navbar)
2. Fill in the form:
   - **Title**: Workout name
   - **Date**: When the workout was created
   - **Duration**: How long it takes
   - **Exercises**: Click "+ Add Exercise" to add multiple
   - **Description**: What the workout is about
   - **Competition**: Check the box to enable leaderboard
     - Select competition type (time, weight, reps, distance)
     - Fill in metric name and unit
3. Click **Create Workout**
4. The workout will appear on `/workouts` page immediately!

## Troubleshooting

**"Access Denied" message?**
- Make sure you've set `isAdmin: true` in your user document
- Or add your email to `ADMIN_EMAILS` in `lib/admin-helpers.ts`
- Sign out and sign back in

**Can't create workouts?**
- Check Firestore rules are updated (see Step 2)
- Make sure rules are published
- Check browser console for errors

**Admin link not showing?**
- Make sure you're signed in
- Check that admin check is working (see browser console)
- Try refreshing the page

## Adding More Admins

To add more admins, either:
1. Add their email to `ADMIN_EMAILS` in `lib/admin-helpers.ts`
2. Or set `isAdmin: true` in their user document in Firestore
