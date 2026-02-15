// Firebase Admin SDK for server-side operations
// This bypasses Firestore security rules and is used for admin operations

import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getFirestore, Firestore } from 'firebase-admin/firestore'

let adminApp: App | null = null
let adminDb: Firestore | null = null
let initialized = false

// Initialize Firebase Admin SDK (only if credentials are available)
function initializeAdmin() {
  if (initialized) {
    return adminApp
  }
  initialized = true

  // Check if we have the required credentials
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL

  if (!projectId) {
    // Silently skip - Admin SDK is optional
    return null
  }

  // If we have private key and client email, use service account
  if (privateKey && clientEmail) {
    try {
      // Replace escaped newlines in private key
      const formattedPrivateKey = privateKey.replace(/\\n/g, '\n')
      
      adminApp = initializeApp({
        credential: cert({
          projectId,
          privateKey: formattedPrivateKey,
          clientEmail,
        }),
      })
      adminDb = getFirestore(adminApp)
      console.log('✅ Firebase Admin SDK initialized with service account')
      return adminApp
    } catch (error) {
      // Silently fail - Admin SDK is optional
      return null
    }
  }

  // Don't try to initialize without credentials - it will cause errors
  // Admin SDK is optional, regular SDK will be used instead
  return null
}

// Initialize on import (only if credentials are available)
try {
  initializeAdmin()
} catch (error) {
  // Silently fail - Admin SDK is optional
}

export { adminApp, adminDb }

