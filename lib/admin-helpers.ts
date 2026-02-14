/**
 * Admin helper functions
 */

'use client'

import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from './firebase-client'
import { User } from 'firebase/auth'

// List of admin emails (you can add more)
const ADMIN_EMAILS = [
  'jedcrisp@gmail.com', // Add your admin email here
  // Add more admin emails as needed
]

/**
 * Check if a user is an admin
 * Checks both the isAdmin field in Firestore and the admin emails list
 */
export async function isAdmin(user: User | null): Promise<boolean> {
  if (!user || !db) {
    return false
  }

  try {
    // Check admin emails list first (quick check)
    if (user.email && ADMIN_EMAILS.includes(user.email)) {
      return true
    }

    // Check Firestore user document for isAdmin field
    const userDoc = await getDoc(doc(db, 'users', user.uid))
    if (userDoc.exists()) {
      const userData = userDoc.data()
      return userData.isAdmin === true
    }

    return false
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

/**
 * Set a user as admin (for initial setup)
 * Call this function once to set yourself as admin
 */
export async function setUserAsAdmin(userId: string): Promise<void> {
  if (!db) {
    throw new Error('Firebase is not configured')
  }

  try {
    const userRef = doc(db, 'users', userId)
    await setDoc(userRef, {
      isAdmin: true,
      updatedAt: new Date().toISOString(),
    }, { merge: true })
  } catch (error) {
    console.error('Error setting user as admin:', error)
    throw error
  }
}
