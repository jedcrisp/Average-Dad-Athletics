/**
 * Firebase configuration - all values from environment variables
 * No hardcoded keys or fallbacks for security
 * 
 * Note: During build time, we allow missing env vars to prevent build failures.
 * Environment variables should be set in production/hosting platform.
 */

function getFirebaseConfig() {
  const requiredEnvVars = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  }

  // Check if we're in build mode (allowing build to complete without env vars)
  const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.VERCEL && !process.env.NEXT_PUBLIC_FIREBASE_API_KEY

  // Validate that all required environment variables are present
  const missingVars: string[] = []
  const envVarMap: Record<string, string> = {
    apiKey: 'NEXT_PUBLIC_FIREBASE_API_KEY',
    authDomain: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    projectId: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    storageBucket: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    messagingSenderId: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    appId: 'NEXT_PUBLIC_FIREBASE_APP_ID',
    measurementId: 'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID',
  }

  Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (!value) {
      missingVars.push(envVarMap[key])
    }
  })

  if (missingVars.length > 0) {
    const errorMessage = `Missing required Firebase environment variables: ${missingVars.join(', ')}\n\nPlease create a .env.local file with these variables. See env.example for reference.`
    
    // During build time, allow build to continue with empty values
    // This prevents build failures when env vars aren't set locally
    // They will be required at runtime in production
    if (isBuildTime || process.env.NEXT_PHASE === 'phase-production-build') {
      console.warn(`⚠️  ${errorMessage}\n⚠️  Build will continue, but Firebase features will not work until environment variables are set.`)
      return {
        apiKey: '',
        authDomain: '',
        projectId: '',
        storageBucket: '',
        messagingSenderId: '',
        appId: '',
        measurementId: '',
      }
    }
    
    if (typeof window === 'undefined') {
      // Server-side runtime: throw error
      throw new Error(errorMessage)
    } else {
      // Client-side: log error and return empty config (will fail gracefully)
      console.error(errorMessage)
      return {
        apiKey: '',
        authDomain: '',
        projectId: '',
        storageBucket: '',
        messagingSenderId: '',
        appId: '',
        measurementId: '',
      }
    }
  }

  return {
    apiKey: requiredEnvVars.apiKey!,
    authDomain: requiredEnvVars.authDomain!,
    projectId: requiredEnvVars.projectId!,
    storageBucket: requiredEnvVars.storageBucket!,
    messagingSenderId: requiredEnvVars.messagingSenderId!,
    appId: requiredEnvVars.appId!,
    measurementId: requiredEnvVars.measurementId!,
  }
}

export const firebaseConfig = getFirebaseConfig()
