'use client'

// Client-side Firebase initialization
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getStorage, FirebaseStorage } from 'firebase/storage'
import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAnalytics, Analytics } from 'firebase/analytics'
import { firebaseConfig } from './firebase-config'

// Initialize Firebase (client-side only)
let app: FirebaseApp
let analytics: Analytics | null = null

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig)
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app)
  }
} else {
  app = getApps()[0]
}

// Initialize Firebase services for client-side use
export const auth: Auth = getAuth(app)
export const db: Firestore = getFirestore(app)
export const storage: FirebaseStorage = getStorage(app)
export { app, analytics }
