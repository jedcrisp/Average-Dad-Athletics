// Firebase Admin SDK for server-side operations
// This bypasses Firestore security rules and is used for admin operations

import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getFirestore, Firestore } from 'firebase-admin/firestore'

let adminApp: App | null = null
let adminDb: Firestore | null = null

// Initialize Firebase Admin SDK
function initializeAdmin() {
  if (adminApp) {
    return adminApp
  }

  // Check if we have the required credentials
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL

  if (!projectId) {
    console.warn('Firebase Admin: NEXT_PUBLIC_FIREBASE_PROJECT_ID not set')
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
      console.error('Failed to initialize Firebase Admin SDK:', error)
      return null
    }
  }

  // Fallback: Try to initialize without credentials (uses Application Default Credentials)
  // This works if running on Google Cloud or if GOOGLE_APPLICATION_CREDENTIALS is set
  try {
    if (getApps().length === 0) {
      adminApp = initializeApp({
        projectId,
      })
      adminDb = getFirestore(adminApp)
      console.log('✅ Firebase Admin SDK initialized (using default credentials)')
      return adminApp
    } else {
      adminApp = getApps()[0]
      adminDb = getFirestore(adminApp)
      return adminApp
    }
  } catch (error) {
    console.warn('Firebase Admin SDK: Could not initialize. Using fallback client SDK.')
    console.warn('For server-side admin operations, set up Firebase Admin SDK credentials.')
    return null
  }
}

// Initialize on import
initializeAdmin()

export { adminApp, adminDb }
