'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase-client'
import { isFirebaseConfigured } from '@/lib/firebase-config'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithApple: () => Promise<void>
  signOut: () => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseConfigured() || !auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get additional user data from Firestore
        try {
          if (db) {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
            if (!userDoc.exists() && firebaseUser.email) {
              // Create user document if it doesn't exist
              await setDoc(doc(db, 'users', firebaseUser.uid), {
                name: firebaseUser.displayName || 'User',
                email: firebaseUser.email,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              })
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
        }
      }
      setUser(firebaseUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!auth) {
      throw new Error('Firebase Auth is not configured')
    }
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signInWithGoogle = async () => {
    if (!auth) {
      throw new Error('Firebase Auth is not configured')
    }
    
    try {
      const provider = new GoogleAuthProvider()
      // Add custom parameters if needed
      provider.setCustomParameters({
        prompt: 'select_account'
      })
      
      const result = await signInWithPopup(auth, provider)
      
      // Save user to Firestore
      if (db && result.user) {
        try {
          const userRef = doc(db, 'users', result.user.uid)
          const userDoc = await getDoc(userRef)
          
          if (!userDoc.exists()) {
            await setDoc(userRef, {
              name: result.user.displayName || 'User',
              email: result.user.email,
              provider: 'google',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })
          } else {
            await setDoc(userRef, {
              name: result.user.displayName || userDoc.data()?.name,
              email: result.user.email,
              updatedAt: new Date().toISOString(),
            }, { merge: true })
          }
        } catch (error) {
          console.error('Error saving user to Firestore:', error)
        }
      }
    } catch (error: any) {
      // Handle specific Firebase Auth errors
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in popup was closed. Please try again.')
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup was blocked by your browser. Please allow popups for this site.')
      } else if (error.code === 'auth/cancelled-popup-request') {
        throw new Error('Another sign-in attempt is already in progress. Please wait.')
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your connection and try again.')
      } else {
        console.error('Google sign-in error:', error)
        throw new Error('Failed to sign in with Google. Please try again.')
      }
    }
  }

  const signInWithApple = async () => {
    if (!auth) {
      throw new Error('Firebase Auth is not configured')
    }
    
    try {
      const provider = new OAuthProvider('apple.com')
      const result = await signInWithPopup(auth, provider)
      
      // Save user to Firestore
      if (db && result.user) {
        try {
          const userRef = doc(db, 'users', result.user.uid)
          const userDoc = await getDoc(userRef)
          
          if (!userDoc.exists()) {
            await setDoc(userRef, {
              name: result.user.displayName || 'User',
              email: result.user.email,
              provider: 'apple',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })
          } else {
            await setDoc(userRef, {
              name: result.user.displayName || userDoc.data()?.name,
              email: result.user.email,
              updatedAt: new Date().toISOString(),
            }, { merge: true })
          }
        } catch (error) {
          console.error('Error saving user to Firestore:', error)
        }
      }
    } catch (error: any) {
      // Handle specific Firebase Auth errors
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in popup was closed. Please try again.')
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup was blocked by your browser. Please allow popups for this site.')
      } else if (error.code === 'auth/cancelled-popup-request') {
        throw new Error('Another sign-in attempt is already in progress. Please wait.')
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your connection and try again.')
      } else {
        console.error('Apple sign-in error:', error)
        throw new Error('Failed to sign in with Apple. Please try again.')
      }
    }
  }

  const register = async (name: string, email: string, password: string) => {
    if (!auth) {
      throw new Error('Firebase Auth is not configured')
    }
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    
    // Update display name
    await updateProfile(user, { displayName: name })
    
    // Save to Firestore
    if (db) {
      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }
  }

  const signOut = async () => {
    if (!auth) {
      throw new Error('Firebase Auth is not configured')
    }
    await firebaseSignOut(auth)
  }

  const value = {
    user,
    loading,
    signIn,
    signInWithGoogle,
    signInWithApple,
    signOut,
    register,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
