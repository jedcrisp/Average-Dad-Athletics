// Import the functions you need from the SDKs you need
import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAnalytics, Analytics } from 'firebase/analytics'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getStorage, FirebaseStorage } from 'firebase/storage'
import { firebaseConfig } from './firebase-config'

// Initialize Firebase
let app: FirebaseApp
let analytics: Analytics | null = null
let auth: Auth
let db: Firestore
let storage: FirebaseStorage

if (typeof window !== 'undefined') {
  // Only initialize if not already initialized
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig)
    // Analytics only works in browser
    if (typeof window !== 'undefined') {
      analytics = getAnalytics(app)
    }
  } else {
    app = getApps()[0]
  }
  
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)
} else {
  // Server-side: create minimal app instance
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig)
  } else {
    app = getApps()[0]
  }
  
  // These will be initialized on the client side
  auth = {} as Auth
  db = {} as Firestore
  storage = {} as FirebaseStorage
}

export { app, analytics, auth, db, storage }
