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
// Use lazy initialization to ensure app is ready
let _auth: Auth | null = null
let _db: Firestore | null = null
let _storage: FirebaseStorage | null = null

if (app) {
  try {
    _auth = getAuth(app)
    _db = getFirestore(app)
    _storage = getStorage(app)
  } catch (error) {
    console.error('Failed to initialize Firebase services:', error)
  }
}

export const auth: Auth | null = _auth
export const db: Firestore | null = _db
export const storage: FirebaseStorage | null = _storage
export { app, analytics }
