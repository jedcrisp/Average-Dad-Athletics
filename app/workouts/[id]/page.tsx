'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { workoutHelpers, Workout } from '@/lib/firebase-helpers'
import { isAdmin } from '@/lib/admin-helpers'
import { CalendarIcon, ClockIcon, FireIcon, PencilIcon } from '@heroicons/react/24/outline'
import WorkoutLeaderboard from '@/components/WorkoutLeaderboard'
import WorkoutSubmissionForm from '@/components/WorkoutSubmissionForm'
import Link from 'next/link'

// Helper function to format date string as local date (prevents timezone shift)
function formatWorkoutDate(dateString: string): string {
  // Parse date string (YYYY-MM-DD) as local date, not UTC
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day) // month is 0-indexed
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export default function WorkoutDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [userIsAdmin, setUserIsAdmin] = useState(false)

  useEffect(() => {
    const fetchWorkout = async () => {
      if (!params.id || typeof params.id !== 'string') return
      
      try {
        setLoading(true)
        const workoutData = await workoutHelpers.getById(params.id)
        if (workoutData) {
          // Check if workout should be active (date is today or past)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const workoutDate = new Date(workoutData.date)
          workoutDate.setHours(0, 0, 0, 0)
          
          // If workout is scheduled but date has passed, update it to active
          if (workoutData.status === 'scheduled' && workoutDate <= today && workoutData.id) {
            await workoutHelpers.update(workoutData.id, { status: 'active' })
            // Refetch the updated workout
            const updatedWorkout = await workoutHelpers.getById(params.id)
            setWorkout(updatedWorkout)
          } else {
            setWorkout(workoutData)
          }
        } else {
          router.push('/workouts')
        }
      } catch (error) {
        console.error('Error fetching workout:', error)
        router.push('/workouts')
      } finally {
        setLoading(false)
      }
    }

    fetchWorkout()
  }, [params.id, router])

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        try {
          const adminStatus = await isAdmin(user)
          setUserIsAdmin(adminStatus)
        } catch (error) {
          console.error('Error checking admin status:', error)
        }
      }
    }
    checkAdmin()
  }, [user])

  const handleSubmissionSuccess = () => {
    setRefreshKey(prev => prev + 1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workout...</p>
        </div>
      </div>
    )
  }

  if (!workout) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-6 text-primary-600 hover:text-primary-700 font-medium"
        >
          ← Back to Workouts
        </button>

        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{workout.title}</h1>
            {userIsAdmin && (
              <Link
                href={`/admin/workouts/${workout.id}`}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <PencilIcon className="w-4 h-4" />
                Edit
              </Link>
            )}
          </div>
          
          <p className="text-gray-600 mb-6 text-lg">{workout.description}</p>

          <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              {formatWorkoutDate(workout.date)}
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="w-5 h-5" />
              {workout.duration}
            </div>
          </div>

          {workout.competitionType && workout.competitionType !== 'none' && (
            <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
              <p className="text-primary-900 font-semibold mb-1">
                🏆 Competition: {workout.competitionMetric}
              </p>
              <p className="text-primary-700 text-sm">
                Submit your result to compete on the leaderboard!
              </p>
            </div>
          )}

          <div className="border-t pt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FireIcon className="w-6 h-6 text-primary-600" />
              Exercises
            </h2>
            <ul className="space-y-2">
              {workout.exercises.map((exercise, index) => (
                <li key={index} className="text-gray-700 text-lg">
                  • {exercise}
                </li>
              ))}
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-gray-600 italic">
              <strong>Disclaimer:</strong> This program is for guidance only. Exercise at your own risk and train at your ability.
            </p>
          </div>
        </div>

        {workout.competitionType && workout.competitionType !== 'none' && workout.id && (
          <>
            <div className="mb-6">
              <WorkoutSubmissionForm
                workout={workout}
                onSuccess={handleSubmissionSuccess}
              />
            </div>
            
            <div key={refreshKey}>
              <WorkoutLeaderboard
                workoutId={workout.id}
                competitionType={workout.competitionType}
                competitionMetric={workout.competitionMetric || 'Result'}
                competitionUnit={workout.competitionUnit || 'units'}
                competitionSort={workout.competitionSort || 'desc'}
                currentUserId={user?.uid}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
