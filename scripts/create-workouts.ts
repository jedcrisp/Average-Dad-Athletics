/**
 * Script to create sample workouts in Firebase
 * Run with: npx tsx scripts/create-workouts.ts
 */

import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore'
import { firebaseConfig, isFirebaseConfigured } from '../lib/firebase-config'

const sampleWorkouts = [
  {
    title: 'Max Deadlift Challenge',
    date: new Date().toISOString().split('T')[0],
    duration: '45 min',
    exercises: ['Deadlifts', 'Accessory work', 'Core'],
    description: 'Test your max deadlift strength. One rep max competition.',
    competitionType: 'weight',
    competitionMetric: 'Max Weight',
    competitionUnit: 'lbs',
    competitionSort: 'desc',
  },
  {
    title: '5K Time Trial',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    duration: '30 min',
    exercises: ['Running', 'Warm-up', 'Cool-down'],
    description: 'Run 5K as fast as you can. Fastest time wins!',
    competitionType: 'time',
    competitionMetric: 'Fastest Time',
    competitionUnit: 'seconds',
    competitionSort: 'asc',
  },
  {
    title: 'Max Push-ups Challenge',
    date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
    duration: '20 min',
    exercises: ['Push-ups', 'Rest', 'Repeat'],
    description: 'How many push-ups can you do? Max reps competition.',
    competitionType: 'reps',
    competitionMetric: 'Total Reps',
    competitionUnit: 'reps',
    competitionSort: 'desc',
  },
  {
    title: 'Full Body Strength',
    date: new Date(Date.now() - 259200000).toISOString().split('T')[0],
    duration: '45 min',
    exercises: ['Squats', 'Push-ups', 'Deadlifts', 'Pull-ups', 'Planks'],
    description: 'A complete full-body workout focusing on compound movements. Perfect for building strength and muscle.',
    competitionType: 'none',
  },
  {
    title: 'Cardio Blast',
    date: new Date(Date.now() - 345600000).toISOString().split('T')[0],
    duration: '30 min',
    exercises: ['Running', 'Burpees', 'Jumping Jacks', 'Mountain Climbers'],
    description: 'High-intensity cardio workout to get your heart pumping and burn calories.',
    competitionType: 'none',
  },
]

async function createWorkouts() {
  if (!isFirebaseConfigured()) {
    console.error('❌ Firebase is not configured. Please set environment variables.')
    process.exit(1)
  }

  let app
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig)
  } else {
    app = getApps()[0]
  }

  const db = getFirestore(app)
  const workoutsRef = collection(db, 'workouts')

  console.log('🚀 Creating sample workouts...\n')

  const createdWorkouts = []

  for (const workout of sampleWorkouts) {
    try {
      const docRef = await addDoc(workoutsRef, {
        ...workout,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
      createdWorkouts.push({ id: docRef.id, ...workout })
      console.log(`✅ Created: ${workout.title} (ID: ${docRef.id})`)
    } catch (error: any) {
      console.error(`❌ Failed to create ${workout.title}:`, error.message)
    }
  }

  console.log(`\n✨ Successfully created ${createdWorkouts.length} workouts!`)
  console.log('\nWorkouts created:')
  createdWorkouts.forEach((w, i) => {
    console.log(`${i + 1}. ${w.title}${w.competitionType && w.competitionType !== 'none' ? ' 🏆' : ''}`)
  })
}

createWorkouts()
  .then(() => {
    console.log('\n🎉 Done! Check your workouts at http://localhost:3000/workouts')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
