'use client'

// Client-side Firebase initialization
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getStorage, FirebaseStorage } from 'firebase/storage'
import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAnalytics, Analytics } from 'firebase/analytics'
import { firebaseConfig, isFirebaseConfigured } from './firebase-config'

// Initialize Firebase only if configured (client-side only)
let app: FirebaseApp | null = null
let analytics: Analytics | null = null

if (isFirebaseConfigured()) {
  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig)
      if (typeof window !== 'undefined') {
        analytics = getAnalytics(app)
      }
    } else {
      app = getApps()[0]
    }
  } catch (error) {
    console.error('Failed to initialize Firebase:', error)
    console.warn('Firebase is not configured. Please set Firebase environment variables.')
  }
} else {
  console.warn('Firebase is not configured. Please set Firebase environment variables.')
}

// Initialize Firebase services for client-side use (only if configured)
export const auth: Auth | null = app ? getAuth(app) : null
export const db: Firestore | null = app ? getFirestore(app) : null
export const storage: FirebaseStorage | null = app ? getStorage(app) : null
export { app, analytics }
