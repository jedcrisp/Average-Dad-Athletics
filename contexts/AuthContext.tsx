'use client'

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react'
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

// Helper function to save user data to Firestore with offline handling
async function saveUserToFirestore(user: User, provider?: string, name?: string) {
  if (!db) {
    console.warn('Firestore not available, skipping user save')
    return
  }

  try {
    const userRef = doc(db, 'users', user.uid)
    const userDoc = await getDoc(userRef)
    
    const userName = name || user.displayName || 'User'
    const userData = {
      name: userName,
      email: user.email || '',
      updatedAt: new Date().toISOString(),
    }

    if (provider) {
      (userData as any).provider = provider
    }

    if (!userDoc.exists()) {
      // New user - create document
      await setDoc(userRef, {
        ...userData,
        createdAt: new Date().toISOString(),
      })
    } else {
      // Existing user - update document
      await setDoc(userRef, {
        ...userData,
        name: userName || userDoc.data()?.name || 'User',
      }, { merge: true })
    }
  } catch (error: any) {
    // Handle offline errors gracefully
    if (error?.code === 'unavailable' || error?.message?.includes('offline') || error?.message?.includes('Failed to get document because the client is offline')) {
      console.warn('Firestore is offline. User data will be saved when connection is restored.')
      // Firestore will automatically retry when online if persistence is enabled
      return
    }
    // Log other errors but don't throw - sign-in should still succeed
    console.error('Error saving user to Firestore:', error)
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const isOAuthInProgressRef = useRef(false)

  useEffect(() => {
    if (!isFirebaseConfigured() || !auth) {
      setLoading(false)
      return
    }

    // Wait a tick to ensure auth is fully initialized
    let mounted = true
    let unsubscribe: (() => void) | null = null

    const setupAuthListener = () => {
      try {
        // Check if auth is ready by accessing currentUser
        // This helps ensure auth is initialized
        if (!auth) {
          setLoading(false)
          return
        }

        unsubscribe = onAuthStateChanged(
          auth,
          async (firebaseUser) => {
            if (!mounted) return
            
            // Skip if OAuth is in progress to avoid race conditions
            if (isOAuthInProgressRef.current) {
              return
            }

            if (firebaseUser) {
              // Save user data to Firestore (non-blocking)
              // This will be retried automatically if offline
              saveUserToFirestore(firebaseUser).catch(() => {
                // Error already logged in helper function
              })
            }
            if (mounted) {
              setUser(firebaseUser)
              setLoading(false)
            }
          },
          (error) => {
            // Suppress internal assertion errors - these are Firebase bugs
            if (error?.message?.includes('INTERNAL ASSERTION FAILED')) {
              console.warn('Firebase Auth internal error (suppressed):', error.message)
              return
            }
            // Handle other auth state change errors
            console.error('Auth state change error:', error)
            if (mounted) {
              setLoading(false)
            }
          }
        )
      } catch (error: any) {
        // Suppress internal assertion errors during setup
        if (error?.message?.includes('INTERNAL ASSERTION FAILED')) {
          console.warn('Firebase Auth internal error during setup (suppressed):', error.message)
          if (mounted) {
            setLoading(false)
          }
          return
        }
        console.error('Error setting up auth listener:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    // Use setTimeout to ensure auth is ready
    const timeoutId = setTimeout(setupAuthListener, 0)

    return () => {
      mounted = false
      clearTimeout(timeoutId)
      if (unsubscribe) {
        unsubscribe()
      }
    }
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
    
    isOAuthInProgressRef.current = true
    
    try {
      const provider = new GoogleAuthProvider()
      // Add custom parameters if needed
      provider.setCustomParameters({
        prompt: 'select_account'
      })
      
      const result = await signInWithPopup(auth, provider)
      
      // Save user to Firestore (non-blocking - won't fail sign-in if offline)
      if (result.user) {
        await saveUserToFirestore(result.user, 'google')
      }
    } catch (error: any) {
      // Suppress internal assertion errors - these are Firebase bugs
      if (error?.message?.includes('INTERNAL ASSERTION FAILED')) {
        console.warn('Firebase Auth internal error (suppressed):', error.message)
        // Still throw a user-friendly error
        throw new Error('Sign-in encountered an issue. Please try again.')
      }
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
    } finally {
      isOAuthInProgressRef.current = false
    }
  }

  const signInWithApple = async () => {
    if (!auth) {
      throw new Error('Firebase Auth is not configured')
    }
    
    isOAuthInProgressRef.current = true
    
    try {
      const provider = new OAuthProvider('apple.com')
      const result = await signInWithPopup(auth, provider)
      
      // Save user to Firestore (non-blocking - won't fail sign-in if offline)
      if (result.user) {
        await saveUserToFirestore(result.user, 'apple')
      }
    } catch (error: any) {
      // Suppress internal assertion errors - these are Firebase bugs
      if (error?.message?.includes('INTERNAL ASSERTION FAILED')) {
        console.warn('Firebase Auth internal error (suppressed):', error.message)
        // Still throw a user-friendly error
        throw new Error('Sign-in encountered an issue. Please try again.')
      }
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
    } finally {
      isOAuthInProgressRef.current = false
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
    
    // Save to Firestore (non-blocking - won't fail registration if offline)
    // Pass name explicitly since displayName might not be immediately available
    await saveUserToFirestore(user, undefined, name)
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
