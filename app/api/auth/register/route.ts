import { NextResponse } from 'next/server'
import { initializeApp, getApps } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { getFirestore, doc, setDoc } from 'firebase/firestore'
import { firebaseConfig } from '@/lib/firebase-config'

// Initialize Firebase
let app
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApps()[0]
}

const auth = getAuth(app)
const db = getFirestore(app)

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Update the user's display name
    await updateProfile(user, {
      displayName: name
    })

    // Save additional user data to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      name,
      email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    return NextResponse.json(
      { 
        message: 'Registration successful. Please sign in.',
        userId: user.uid 
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Registration error:', error)
    
    // Handle Firebase Auth errors
    let errorMessage = 'Registration failed. Please try again.'
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'This email is already registered. Please sign in instead.'
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address.'
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak. Please use a stronger password.'
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    )
  }
}
