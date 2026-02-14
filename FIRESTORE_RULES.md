# Firestore Security Rules Setup

## Problem
You're seeing the error: `FirebaseError: Missing or insufficient permissions`

This happens because Firestore security rules are blocking read/write operations.

## Solution

You need to configure Firestore security rules to allow authenticated users to:
1. Read their own user document
2. Write/update their own user document

## Steps

### 1. Go to Firebase Console
1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **average-dad-athletics-6bb32**
3. Click **Firestore Database** in the left sidebar
4. Click the **Rules** tab

### 2. Update Security Rules

Replace the default rules with these:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
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
    
    // Workouts - all authenticated users can read
    match /workouts/{workoutId} {
      allow read: if request.auth != null;
      allow write: if false; // Only admins can write (configure later)
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

### 3. Publish Rules

1. Click **Publish** button at the top
2. Rules will be active immediately

## What These Rules Do

- **Users collection**: Users can only read/write their own document (matching their `uid`)
- **Forum collection**: Users can read all posts, create posts, and edit/delete their own posts
- **Workouts collection**: Users can read workouts, but only admins can write (you can configure admin access later)
- **Workout submissions collection**: Users can read all submissions, create their own, and update/delete their own submissions
- **Everything else**: Denied by default for security

## Testing

After updating rules:
1. Sign in to your app
2. The permission error should disappear
3. User data will be saved to Firestore automatically

## Important Notes

- These rules allow users to manage their own data
- Forum posts are readable by all authenticated users
- Workouts are read-only for regular users
- Adjust rules as needed for your specific use case

## Need More Control?

If you need admin-only access or more complex rules, you can:
1. Add custom claims to user tokens (requires Cloud Functions)
2. Create an `admins` collection with admin user IDs
3. Check admin status in security rules

For now, the rules above should resolve the permission error you're seeing.
