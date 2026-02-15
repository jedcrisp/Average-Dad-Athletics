/**
 * Firebase helper functions for common operations
 * 
 * Note: These functions should be used in client components only
 * For server-side usage, import db from './firebase' instead
 */

'use client'

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore'
import { db } from './firebase-client'

// Types
export interface Workout {
  id?: string
  title: string
  date: string
  duration: string
  exercises: string[]
  description: string
  // Competition fields
  competitionType?: 'time' | 'weight' | 'reps' | 'distance' | 'none'
  competitionMetric?: string // e.g., "Fastest Time", "Max Weight"
  competitionUnit?: string // e.g., "seconds", "lbs", "reps"
  competitionSort?: 'asc' | 'desc' // 'asc' for time (lower better), 'desc' for weight/reps (higher better)
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export interface WorkoutSubmission {
  id?: string
  workoutId: string
  userId: string
  userName: string
  userEmail?: string
  metricValue: number
  unit: string
  submittedAt?: Timestamp
  verified?: boolean
}

export interface ForumReply {
  id: string
  author: string
  authorId: string
  content: string
  createdAt: Timestamp
  updatedAt?: Timestamp
}

export interface ForumPost {
  id?: string
  title: string
  author: string
  authorId: string
  date: string
  replies: number
  category: string
  labels?: string[] // Tags/labels for routing to groups
  excerpt: string
  content?: string
  repliesList?: ForumReply[]
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

// Workout helpers
export const workoutHelpers = {
  // Get all workouts, sorted by date (newest first)
  async getAll(): Promise<Workout[]> {
    if (!db) throw new Error('Firebase is not configured')
    const workoutsRef = collection(db, 'workouts')
    const q = query(workoutsRef, orderBy('date', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Workout))
  },

  // Get a single workout by ID
  async getById(id: string): Promise<Workout | null> {
    if (!db) throw new Error('Firebase is not configured')
    const docRef = doc(db, 'workouts', id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Workout
    }
    return null
  },

  // Add a new workout
  async create(workout: Omit<Workout, 'id'>): Promise<string> {
    if (!db) throw new Error('Firebase is not configured')
    const workoutsRef = collection(db, 'workouts')
    const docRef = await addDoc(workoutsRef, {
      ...workout,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    })
    return docRef.id
  },

  // Update a workout
  async update(id: string, workout: Partial<Workout>): Promise<void> {
    if (!db) throw new Error('Firebase is not configured')
    const docRef = doc(db, 'workouts', id)
    await updateDoc(docRef, {
      ...workout,
      updatedAt: Timestamp.now()
    })
  },

  // Delete a workout
  async delete(id: string): Promise<void> {
    if (!db) throw new Error('Firebase is not configured')
    const docRef = doc(db, 'workouts', id)
    await deleteDoc(docRef)
  }
}

// Workout submission helpers
export const submissionHelpers = {
  // Get all submissions for a workout, sorted by metric value
  async getByWorkout(workoutId: string, sortOrder: 'asc' | 'desc' = 'desc'): Promise<WorkoutSubmission[]> {
    if (!db) throw new Error('Firebase is not configured')
    const submissionsRef = collection(db, 'workoutSubmissions')
    const q = query(
      submissionsRef,
      where('workoutId', '==', workoutId),
      orderBy('metricValue', sortOrder),
      orderBy('submittedAt', 'asc') // Tie-breaker: earlier submission wins
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as WorkoutSubmission))
  },

  // Get top N submissions for a workout
  async getTopN(workoutId: string, limit: number = 10, sortOrder: 'asc' | 'desc' = 'desc'): Promise<WorkoutSubmission[]> {
    const all = await this.getByWorkout(workoutId, sortOrder)
    return all.slice(0, limit)
  },

  // Get user's submission for a workout
  async getByUser(workoutId: string, userId: string): Promise<WorkoutSubmission | null> {
    if (!db) throw new Error('Firebase is not configured')
    const submissionsRef = collection(db, 'workoutSubmissions')
    const q = query(
      submissionsRef,
      where('workoutId', '==', workoutId),
      where('userId', '==', userId)
    )
    const snapshot = await getDocs(q)
    if (snapshot.empty) return null
    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data()
    } as WorkoutSubmission
  },

  // Create or update a submission
  async submit(submission: Omit<WorkoutSubmission, 'id'>): Promise<string> {
    if (!db) throw new Error('Firebase is not configured')
    
    // Check if user already has a submission
    const existing = await this.getByUser(submission.workoutId, submission.userId)
    
    if (existing && existing.id) {
      // Update existing submission
      const docRef = doc(db, 'workoutSubmissions', existing.id)
      await updateDoc(docRef, {
        metricValue: submission.metricValue,
        unit: submission.unit,
        submittedAt: Timestamp.now(),
        verified: false
      })
      return existing.id
    } else {
      // Create new submission
      const submissionsRef = collection(db, 'workoutSubmissions')
      const docRef = await addDoc(submissionsRef, {
        ...submission,
        submittedAt: Timestamp.now(),
        verified: false
      })
      return docRef.id
    }
  },

  // Delete a submission
  async delete(id: string): Promise<void> {
    if (!db) throw new Error('Firebase is not configured')
    const docRef = doc(db, 'workoutSubmissions', id)
    await deleteDoc(docRef)
  }
}

// Forum helpers
// Store Products helpers
export const storeProductHelpers = {
  /**
   * Get all store products from Firestore
   */
  async getAll(): Promise<any[]> {
    if (!db) throw new Error('Firebase is not configured')
    const snapshot = await getDocs(collection(db, 'storeProducts'))
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },

  /**
   * Get a single store product by ID
   */
  async getById(productId: string): Promise<any | null> {
    if (!db) throw new Error('Firebase is not configured')
    const productDoc = await getDoc(doc(db, 'storeProducts', productId))
    if (productDoc.exists()) {
      return { id: productDoc.id, ...productDoc.data() }
    }
    return null
  },
}

export const forumHelpers = {
  // Get all posts, optionally filtered by category
  async getAll(category?: string): Promise<ForumPost[]> {
    if (!db) throw new Error('Firebase is not configured')
    const postsRef = collection(db, 'forumPosts')
    let q
    
    if (category && category !== 'All') {
      q = query(postsRef, where('category', '==', category), orderBy('createdAt', 'desc'))
    } else {
      q = query(postsRef, orderBy('createdAt', 'desc'))
    }
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ForumPost))
  },

  // Get a single post by ID
  async getById(id: string): Promise<ForumPost | null> {
    if (!db) throw new Error('Firebase is not configured')
    const docRef = doc(db, 'forumPosts', id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as ForumPost
    }
    return null
  },

  // Create a new post
  async create(post: Omit<ForumPost, 'id'>): Promise<string> {
    if (!db) throw new Error('Firebase is not configured')
    const postsRef = collection(db, 'forumPosts')
    
    // Remove undefined values (Firestore doesn't allow them)
    const cleanPost: any = {
      ...post,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    }
    
    // Remove undefined fields
    Object.keys(cleanPost).forEach(key => {
      if (cleanPost[key] === undefined) {
        delete cleanPost[key]
      }
    })
    
    const docRef = await addDoc(postsRef, cleanPost)
    return docRef.id
  },

  // Update a post
  async update(id: string, post: Partial<ForumPost>): Promise<void> {
    if (!db) throw new Error('Firebase is not configured')
    const docRef = doc(db, 'forumPosts', id)
    await updateDoc(docRef, {
      ...post,
      updatedAt: Timestamp.now()
    })
  },

  // Delete a post
  async delete(id: string): Promise<void> {
    if (!db) throw new Error('Firebase is not configured')
    const docRef = doc(db, 'forumPosts', id)
    await deleteDoc(docRef)
  },

  // Add a reply to a post
  async addReply(postId: string, reply: Omit<ForumReply, 'id' | 'createdAt'>): Promise<void> {
    if (!db) throw new Error('Firebase is not configured')
    const postRef = doc(db, 'forumPosts', postId)
    const postSnap = await getDoc(postRef)
    
    if (!postSnap.exists()) {
      throw new Error('Post not found')
    }
    
    const postData = postSnap.data() as ForumPost
    const existingReplies = postData.repliesList || []
    
    const newReply: ForumReply = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...reply,
      createdAt: Timestamp.now()
    }
    
    const updatedReplies = [...existingReplies, newReply]
    
    await updateDoc(postRef, {
      repliesList: updatedReplies,
      replies: updatedReplies.length,
      updatedAt: Timestamp.now()
    })
  }
}
