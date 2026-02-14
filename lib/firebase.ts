// Import the functions you need from the SDKs you need
import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAnalytics, Analytics } from 'firebase/analytics'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getStorage, FirebaseStorage } from 'firebase/storage'
import { firebaseConfig, isFirebaseConfigured } from './firebase-config'

// Initialize Firebase only if configured
let app: FirebaseApp | null = null
let analytics: Analytics | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let storage: FirebaseStorage | null = null

if (isFirebaseConfigured()) {
  try {
    if (typeof window !== 'undefined') {
      // Client-side: Only initialize if not already initialized
      if (getApps().length === 0) {
        app = initializeApp(firebaseConfig)
        // Analytics only works in browser
        analytics = getAnalytics(app)
      } else {
        app = getApps()[0]
      }
      
      if (app) {
        auth = getAuth(app)
        db = getFirestore(app)
        storage = getStorage(app)
      }
    } else {
      // Server-side: create minimal app instance
      if (getApps().length === 0) {
        app = initializeApp(firebaseConfig)
      } else {
        app = getApps()[0]
      }
      
      // Server-side services will be initialized when needed
      if (app) {
        auth = getAuth(app)
        db = getFirestore(app)
        storage = getStorage(app)
      }
    }
  } catch (error) {
    console.error('Failed to initialize Firebase:', error)
    console.warn('Firebase is not configured. Please set Firebase environment variables.')
  }
} else {
  // Firebase not configured - export null values
  // Components should check before using
  console.warn('Firebase is not configured. Please set Firebase environment variables.')
}

export { app, analytics, auth, db, storage }
