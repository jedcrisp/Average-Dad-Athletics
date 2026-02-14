'use client'

import Link from 'next/link'
import { CalendarIcon, ClockIcon, FireIcon } from '@heroicons/react/24/outline'

interface Workout {
  id: string
  title: string
  date: string
  duration: string
  exercises: string[]
  description: string
  competitionType?: 'time' | 'weight' | 'reps' | 'distance' | 'none'
}

// Example workouts - replace with your actual workouts
// Workouts are automatically sorted by date (newest first)
const workouts: Workout[] = [
  {
    id: '1',
    title: 'Full Body Strength',
    date: '2024-01-15',
    duration: '45 min',
    exercises: ['Squats', 'Push-ups', 'Deadlifts', 'Pull-ups', 'Planks'],
    description: 'A complete full-body workout focusing on compound movements. Perfect for building strength and muscle.',
  },
  {
    id: '2',
    title: 'Cardio Blast',
    date: '2024-01-14',
    duration: '30 min',
    exercises: ['Running', 'Burpees', 'Jumping Jacks', 'Mountain Climbers'],
    description: 'High-intensity cardio workout to get your heart pumping and burn calories.',
  },
  // Add more workouts here - they will be sorted by date automatically
]

export default function WorkoutsPage() {
  // Sort workouts by date (newest first)
  const sortedWorkouts = [...workouts].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Workout Library
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Browse the latest workouts. Organized by date with the most recent workouts first.
          </p>
        </div>

        {/* Workouts Grid */}
        {sortedWorkouts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedWorkouts.map((workout) => (
              <Link
                key={workout.id}
                href={`/workouts/${workout.id}`}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow block"
              >
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{workout.title}</h3>
                </div>

                <p className="text-gray-600 mb-4">{workout.description}</p>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" />
                    {new Date(workout.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    {workout.duration}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <FireIcon className="w-5 h-5 text-primary-600" />
                    Exercises
                  </h4>
                  <ul className="space-y-1">
                    {workout.exercises.map((exercise, index) => (
                      <li key={index} className="text-gray-600 text-sm">
                        • {exercise}
                      </li>
                    ))}
                  </ul>
                </div>
                {workout.competitionType && workout.competitionType !== 'none' && (
                  <div className="mt-4 pt-4 border-t">
                    <span className="inline-flex items-center gap-1 text-sm text-primary-600 font-semibold">
                      🏆 Competition Active
                    </span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">No workouts yet. Check back soon!</p>
            <p className="text-gray-500">
              Workouts will appear here once you start posting them.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
