import { NextResponse } from 'next/server'
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

// Sample workouts with competitions
const sampleWorkouts = [
  {
    title: 'Max Deadlift Challenge',
    date: new Date().toISOString().split('T')[0], // Today's date
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
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
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
    date: new Date(Date.now() - 172800000).toISOString().split('T')[0], // 2 days ago
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
    date: new Date(Date.now() - 259200000).toISOString().split('T')[0], // 3 days ago
    duration: '45 min',
    exercises: ['Squats', 'Push-ups', 'Deadlifts', 'Pull-ups', 'Planks'],
    description: 'A complete full-body workout focusing on compound movements. Perfect for building strength and muscle.',
    competitionType: 'none',
  },
  {
    title: 'Cardio Blast',
    date: new Date(Date.now() - 345600000).toISOString().split('T')[0], // 4 days ago
    duration: '30 min',
    exercises: ['Running', 'Burpees', 'Jumping Jacks', 'Mountain Climbers'],
    description: 'High-intensity cardio workout to get your heart pumping and burn calories.',
    competitionType: 'none',
  },
]

export async function POST(request: Request) {
  try {
    if (!db) {
      return NextResponse.json(
        { error: 'Firebase is not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { action, workout } = body

    if (action === 'create-sample') {
      // Create all sample workouts
      const workoutsRef = collection(db, 'workouts')
      const createdWorkouts = []

      for (const sampleWorkout of sampleWorkouts) {
        const docRef = await addDoc(workoutsRef, {
          ...sampleWorkout,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        })
        createdWorkouts.push({ id: docRef.id, ...sampleWorkout })
      }

      return NextResponse.json({
        success: true,
        message: `Created ${createdWorkouts.length} sample workouts`,
        workouts: createdWorkouts,
      })
    } else if (action === 'create-custom' && workout) {
      // Create a custom workout
      const workoutsRef = collection(db, 'workouts')
      const docRef = await addDoc(workoutsRef, {
        ...workout,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })

      return NextResponse.json({
        success: true,
        message: 'Workout created successfully',
        workout: { id: docRef.id, ...workout },
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid action or missing workout data' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Error creating workouts:', error)
    return NextResponse.json(
      { error: 'Failed to create workouts', details: error.message },
      { status: 500 }
    )
  }
}

// GET endpoint to return sample workout data structure
export async function GET() {
  return NextResponse.json({
    sampleWorkouts,
    instructions: {
      createSample: 'POST to this endpoint with { "action": "create-sample" }',
      createCustom: 'POST to this endpoint with { "action": "create-custom", "workout": {...} }',
    },
  })
}
