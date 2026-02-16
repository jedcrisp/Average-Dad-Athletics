'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CalendarIcon, ClockIcon, FireIcon } from '@heroicons/react/24/outline'
import { workoutHelpers, Workout } from '@/lib/firebase-helpers'

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setLoading(true)
        const fetchedWorkouts = await workoutHelpers.getAll()
        setWorkouts(fetchedWorkouts)
        setError('')
      } catch (err: any) {
        console.error('Error fetching workouts:', err)
        setError('Failed to load workouts. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchWorkouts()
  }, [])

  // Sort workouts: scheduled first (by date ascending), then active/completed (by date descending)
  const sortedWorkouts = [...workouts].sort((a, b) => {
    const aDate = new Date(a.date).getTime()
    const bDate = new Date(b.date).getTime()
    const aScheduled = a.status === 'scheduled'
    const bScheduled = b.status === 'scheduled'
    
    // Scheduled workouts come first, sorted by date (earliest first)
    if (aScheduled && !bScheduled) return -1
    if (!aScheduled && bScheduled) return 1
    if (aScheduled && bScheduled) return aDate - bDate
    
    // Other workouts sorted by date (newest first)
    return bDate - aDate
  })
  
  // Separate scheduled and active workouts
  const scheduledWorkouts = sortedWorkouts.filter(w => w.status === 'scheduled')
  const activeWorkouts = sortedWorkouts.filter(w => w.status !== 'scheduled')

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
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading workouts...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Try again
            </button>
          </div>
        ) : sortedWorkouts.length > 0 ? (
          <div className="space-y-8">
            {/* Scheduled Workouts Section */}
            {scheduledWorkouts.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CalendarIcon className="w-6 h-6 text-primary-600" />
                  Scheduled Workouts
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {scheduledWorkouts.map((workout) => (
                    <Link
                      key={workout.id}
                      href={`/workouts/${workout.id}`}
                      className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow block border-l-4 border-blue-500"
                    >
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{workout.title}</h3>
                          <span className="px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded">
                            Scheduled
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">{workout.description}</p>

                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          {new Date(workout.date).toLocaleDateString()}
                        </div>
                        {workout.duration && (
                          <div className="flex items-center gap-1">
                            <ClockIcon className="w-4 h-4" />
                            {workout.duration}
                          </div>
                        )}
                      </div>

                      {workout.exercises && workout.exercises.length > 0 && (
                        <div className="border-t pt-4">
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <FireIcon className="w-5 h-5 text-primary-600" />
                            Exercises
                          </h4>
                          <ul className="space-y-1">
                            {workout.exercises.slice(0, 3).map((exercise, index) => (
                              <li key={index} className="text-gray-600 text-sm">
                                • {exercise}
                              </li>
                            ))}
                            {workout.exercises.length > 3 && (
                              <li className="text-gray-500 text-sm">
                                + {workout.exercises.length - 3} more
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Active/Completed Workouts Section */}
            {activeWorkouts.length > 0 && (
              <div>
                {scheduledWorkouts.length > 0 && (
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FireIcon className="w-6 h-6 text-primary-600" />
                    Active Workouts
                  </h2>
                )}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeWorkouts.map((workout) => (
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
                        {workout.duration && (
                          <div className="flex items-center gap-1">
                            <ClockIcon className="w-4 h-4" />
                            {workout.duration}
                          </div>
                        )}
                      </div>

                      {workout.exercises && workout.exercises.length > 0 && (
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
                      )}
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
              </div>
            )}
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
