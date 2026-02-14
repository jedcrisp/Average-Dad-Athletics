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
  createdAt?: Timestamp
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
  excerpt: string
  content?: string
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

// Forum helpers
export const forumHelpers = {
  // Get all posts, optionally filtered by category
  async getAll(category?: string): Promise<ForumPost[]> {
    if (!db) throw new Error('Firebase is not configured')
    const postsRef = collection(db, 'forumPosts')
    let q = query(postsRef, orderBy('date', 'desc'))
    
    if (category && category !== 'All') {
      q = query(postsRef, where('category', '==', category), orderBy('date', 'desc'))
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
    const docRef = await addDoc(postsRef, {
      ...post,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    })
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
  }
}
