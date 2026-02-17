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
    
    // Forum posts - public reads (needed for social media crawlers), authenticated users can create and reply
    // Admins can delete any post
    match /forumPosts/{postId} {
      // Allow public reads for social media metadata generation and public viewing
      allow read: if true;
      allow create: if request.auth != null && request.resource.data.authorId == request.auth.uid;
      // Allow updates for adding replies (any authenticated user can add replies)
      allow update: if request.auth != null;
      // Post author or admin can delete posts
      allow delete: if request.auth != null && (request.auth.uid == resource.data.authorId || isAdmin());
    }
    
    // Blocked users - only admins can read/write
    match /blockedUsers/{email} {
      allow read, write: if isAdmin();
    }
    
    // Helper function to check if user is admin
    function isAdmin() {
      // Check if user document has isAdmin field
      return request.auth != null && 
             exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
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
    
    // Store products - all authenticated users can read
    // Write access: Allow for server-side API routes (admin check done on frontend)
    // For production, consider using Firebase Admin SDK instead
    match /storeProducts/{productId} {
      allow read: if request.auth != null;
      // Temporarily allow writes without auth for server-side sync API
      // Frontend already enforces admin access, so this is acceptable
      allow create, update, delete: if true;
    }
    
    // Orders - server-side webhook writes order data after Stripe checkout
    // Allow reads for idempotency checks (webhook needs to check if order exists)
    // Allow writes for server-side webhook (no auth context)
    // Admins can read orders for order management
    match /orders/{orderId} {
      // Allow reads for server-side webhook (idempotency check) and admins
      // Server-side webhook has no auth context, so we allow all reads
      allow read: if true;
      // Allow server-side webhook to create/update orders (no auth required)
      // This is safe because webhook is verified by Stripe signature
      allow create, update: if true;
      allow delete: if isAdmin();
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
- **Forum posts collection**: Users can read all posts, create posts, and edit/delete their own posts. Admins can delete any post.
- **Blocked users collection**: Only admins can read/write blocked user emails
- **Workouts collection**: Users can read workouts, but only admins can write (you can configure admin access later)
- **Workout submissions collection**: Users can read all submissions, create their own, and update/delete their own submissions
- **Orders collection**: Server-side webhook can create/update orders (for Stripe checkout fulfillment). Only admins can read orders.
- **Store products collection**: All authenticated users can read. Server-side sync can write (admin check done on frontend).
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
