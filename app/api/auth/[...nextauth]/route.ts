import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import AppleProvider from 'next-auth/providers/apple'
import { initializeApp, getApps } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore'
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

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    AppleProvider({
      clientId: process.env.APPLE_ID || '',
      clientSecret: process.env.APPLE_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Sign in with Firebase Auth
          const userCredential = await signInWithEmailAndPassword(
            auth,
            credentials.email,
            credentials.password
          )
          const firebaseUser = userCredential.user

          // Get additional user data from Firestore
          let userData = null
          try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
            if (userDoc.exists()) {
              userData = userDoc.data()
            }
          } catch (error) {
            console.error('Error fetching user data:', error)
          }

          return {
            id: firebaseUser.uid,
            email: firebaseUser.email || credentials.email,
            name: firebaseUser.displayName || userData?.name || 'User',
          }
        } catch (error: any) {
          console.error('Firebase auth error:', error)
          // Return null to indicate authentication failed
          return null
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt' as const,
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production',
  callbacks: {
    async signIn({ user, account, profile }) {
      // Save OAuth users to Firestore
      if (account?.provider === 'google' || account?.provider === 'apple') {
        try {
          const userRef = doc(db, 'users', user.id)
          const userDoc = await getDoc(userRef)
          
          if (!userDoc.exists()) {
            // Create new user document if it doesn't exist
            await setDoc(userRef, {
              name: user.name || profile?.name || 'User',
              email: user.email,
              provider: account.provider,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })
          } else {
            // Update existing user
            await setDoc(userRef, {
              name: user.name || profile?.name || userDoc.data()?.name,
              email: user.email,
              updatedAt: new Date().toISOString(),
            }, { merge: true })
          }
        } catch (error) {
          console.error('Error saving OAuth user to Firestore:', error)
          // Don't block sign-in if Firestore save fails
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
