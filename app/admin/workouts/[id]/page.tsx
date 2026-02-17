'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import { workoutHelpers, Workout } from '@/lib/firebase-helpers'
import { isAdmin } from '@/lib/admin-helpers'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

export default function EditWorkoutPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const workoutId = params.id as string
  
  const [userIsAdmin, setUserIsAdmin] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(true)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [duration, setDuration] = useState('')
  const [exercises, setExercises] = useState<Array<{movement: string, weight: string, time: string}>>([
    { movement: '', weight: '', time: '' }
  ])
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'scheduled' | 'active' | 'completed'>('active')
  const [hasCompetition, setHasCompetition] = useState(false)
  const [competitionType, setCompetitionType] = useState<'time' | 'weight' | 'reps' | 'distance'>('time')
  const [competitionMetric, setCompetitionMetric] = useState('')
  const [competitionUnit, setCompetitionUnit] = useState('')
  const [competitionSort, setCompetitionSort] = useState<'asc' | 'desc'>('desc')
  const [devBypass, setDevBypass] = useState(false)

  useEffect(() => {
    const checkAdmin = async () => {
      if (!authLoading && user) {
        try {
          const adminStatus = await isAdmin(user)
          setUserIsAdmin(adminStatus)
        } catch (error) {
          console.error('Error checking admin status:', error)
        } finally {
          setCheckingAdmin(false)
        }
      } else if (!authLoading && !user) {
        router.push(`/login?redirect=/admin/workouts/${workoutId}`)
        setCheckingAdmin(false)
      }
    }
    checkAdmin()
  }, [user, authLoading, router, workoutId])

  // Load workout data
  useEffect(() => {
    const loadWorkout = async () => {
      if (!workoutId || !userIsAdmin) return
      
      try {
        setLoading(true)
        const workout = await workoutHelpers.getById(workoutId)
        if (!workout) {
          setError('Workout not found')
          return
        }

        // Populate form with workout data
        setTitle(workout.title || '')
        setDate(workout.date || new Date().toISOString().split('T')[0])
        setDuration(workout.duration || '45 min')
        setDescription(workout.description || '')
        setStatus(workout.status || 'active')
        
        // Parse exercises back into form format
        if (workout.exercises && workout.exercises.length > 0) {
          const parsedExercises = workout.exercises.map(ex => {
            // Try to parse "Movement - Weightlbs - Time" format
            const parts = ex.split(' - ')
            if (parts.length >= 3) {
              return {
                movement: parts[0].trim(),
                weight: parts[1].replace('lbs', '').trim(),
                time: parts[2].trim()
              }
            } else if (parts.length === 2) {
              return {
                movement: parts[0].trim(),
                weight: parts[1].replace('lbs', '').trim(),
                time: ''
              }
            } else {
              return {
                movement: ex.trim(),
                weight: '',
                time: ''
              }
            }
          })
          setExercises(parsedExercises)
        }

        // Competition fields
        if (workout.competitionType && workout.competitionType !== 'none') {
          setHasCompetition(true)
          setCompetitionType(workout.competitionType)
          setCompetitionMetric(workout.competitionMetric || '')
          setCompetitionUnit(workout.competitionUnit || '')
          setCompetitionSort(workout.competitionSort || 'desc')
        }
      } catch (err: any) {
        console.error('Error loading workout:', err)
        setError('Failed to load workout')
      } finally {
        setLoading(false)
      }
    }

    if (userIsAdmin) {
      loadWorkout()
    }
  }, [workoutId, userIsAdmin])

  // Auto-update status based on date selection
  useEffect(() => {
    const selectedDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    selectedDate.setHours(0, 0, 0, 0)
    
    if (selectedDate > today) {
      setStatus('scheduled')
    } else if (selectedDate.getTime() === today.getTime()) {
      setStatus('active')
    } else {
      setStatus('active')
    }
  }, [date])

  const addExercise = () => {
    setExercises([...exercises, { movement: '', weight: '', time: '' }])
  }

  const updateExercise = (index: number, field: 'movement' | 'weight' | 'time', value: string) => {
    const newExercises = [...exercises]
    newExercises[index] = { ...newExercises[index], [field]: value }
    setExercises(newExercises)
  }

  const removeExercise = (index: number) => {
    if (exercises.length > 1) {
      setExercises(exercises.filter((_, i) => i !== index))
    }
  }

  const formatExercise = (exercise: {movement: string, weight: string, time: string}): string => {
    const parts: string[] = []
    if (exercise.movement.trim()) parts.push(exercise.movement.trim())
    if (exercise.weight.trim()) parts.push(`${exercise.weight.trim()}lbs`)
    if (exercise.time.trim()) parts.push(exercise.time.trim())
    return parts.join(' - ') || ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    const formattedExercises = exercises
      .map(ex => formatExercise(ex))
      .filter(ex => ex.trim() !== '')

    setSubmitting(true)

    try {
      // Check if workout date is today or in the past
      const workoutDate = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      workoutDate.setHours(0, 0, 0, 0)
      
      // If date is today or past, automatically set to active (even if status was scheduled)
      let finalStatus = status
      if (workoutDate <= today && status === 'scheduled') {
        finalStatus = 'active'
      }

      const workoutData: any = {
        title: title.trim(),
        date,
        status: finalStatus, // Use final status (auto-changed from scheduled to active if date has passed)
      }
      
      if (duration.trim()) {
        workoutData.duration = duration.trim()
      }
      if (formattedExercises.length > 0) {
        workoutData.exercises = formattedExercises
      }
      if (description.trim()) {
        workoutData.description = description.trim()
      }
      
      if (hasCompetition) {
        workoutData.competitionType = competitionType
        if (competitionMetric.trim()) {
          workoutData.competitionMetric = competitionMetric.trim()
        }
        if (competitionUnit.trim()) {
          workoutData.competitionUnit = competitionUnit.trim()
        }
        workoutData.competitionSort = competitionSort
      } else {
        workoutData.competitionType = 'none'
      }

      await workoutHelpers.update(workoutId, workoutData)
      
      setSuccess(true)
      
      setTimeout(() => {
        router.push(`/workouts/${workoutId}`)
      }, 1500)
    } catch (err: any) {
      console.error('Error updating workout:', err)
      setError(err.message || 'Failed to update workout. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (checkingAdmin || authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const isDevelopment = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

  if (!userIsAdmin && !devBypass) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. Admin access required.
          </p>
          {isDevelopment && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 mb-3">Development Mode</p>
              <button
                onClick={() => setDevBypass(true)}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors"
              >
                Bypass Admin Check
              </button>
            </div>
          )}
          <a
            href="/workouts"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to Workouts
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <a
            href={`/workouts/${workoutId}`}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to Workout
          </a>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Workout</h1>

          {/* Disclaimer Notice */}
          <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
            <p className="text-yellow-800 text-sm font-medium">
              <strong>Disclaimer:</strong> This program is for guidance only. Exercise at your own risk and train at your ability.
            </p>
            <p className="text-yellow-700 text-xs mt-1">
              This disclaimer will automatically appear on all workouts.
            </p>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              Workout updated successfully! Redirecting...
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
              
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Workout Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Max Deadlift Challenge"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Select a future date to schedule the workout
                  </p>
                </div>
                
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'scheduled' | 'active' | 'completed')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="scheduled">Scheduled (Future)</option>
                    <option value="active">Active (Current/Past)</option>
                    <option value="completed">Completed</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    {status === 'scheduled' && 'Workout will be scheduled for the selected date'}
                    {status === 'active' && 'Workout is currently active'}
                    {status === 'completed' && 'Workout has been completed'}
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., 45 min"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Describe the workout..."
                />
              </div>
            </div>

            {/* Exercises */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Exercises</h2>
                <button
                  type="button"
                  onClick={addExercise}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Exercise
                </button>
              </div>

              {exercises.map((exercise, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Movement
                    </label>
                    <input
                      type="text"
                      value={exercise.movement}
                      onChange={(e) => updateExercise(index, 'movement', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., Deadlift"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (lbs)
                    </label>
                    <input
                      type="text"
                      value={exercise.weight}
                      onChange={(e) => updateExercise(index, 'weight', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., 225"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time/Reps
                    </label>
                    <input
                      type="text"
                      value={exercise.time}
                      onChange={(e) => updateExercise(index, 'time', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., 5x5"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeExercise(index)}
                      disabled={exercises.length === 1}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Competition */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Competition (Optional)</h2>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasCompetition"
                  checked={hasCompetition}
                  onChange={(e) => setHasCompetition(e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="hasCompetition" className="text-sm font-medium text-gray-700">
                  Enable competition/leaderboard for this workout
                </label>
              </div>

              {hasCompetition && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label htmlFor="competitionType" className="block text-sm font-medium text-gray-700 mb-2">
                      Competition Type *
                    </label>
                    <select
                      id="competitionType"
                      value={competitionType}
                      onChange={(e) => {
                        const type = e.target.value as 'time' | 'weight' | 'reps' | 'distance'
                        setCompetitionType(type)
                        if (type === 'time') {
                          setCompetitionMetric('Fastest Time')
                          setCompetitionUnit('seconds')
                          setCompetitionSort('asc')
                        } else if (type === 'weight') {
                          setCompetitionMetric('Max Weight')
                          setCompetitionUnit('lbs')
                          setCompetitionSort('desc')
                        } else if (type === 'reps') {
                          setCompetitionMetric('Total Reps')
                          setCompetitionUnit('reps')
                          setCompetitionSort('desc')
                        } else if (type === 'distance') {
                          setCompetitionMetric('Distance')
                          setCompetitionUnit('miles')
                          setCompetitionSort('desc')
                        }
                      }}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="time">Time (Fastest wins)</option>
                      <option value="weight">Weight (Heaviest wins)</option>
                      <option value="reps">Reps (Most wins)</option>
                      <option value="distance">Distance (Farthest wins)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="competitionMetric" className="block text-sm font-medium text-gray-700 mb-2">
                      Metric Display Name *
                    </label>
                    <input
                      type="text"
                      id="competitionMetric"
                      value={competitionMetric}
                      onChange={(e) => setCompetitionMetric(e.target.value)}
                      required={hasCompetition}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., Fastest Time, Max Weight"
                    />
                  </div>

                  <div>
                    <label htmlFor="competitionUnit" className="block text-sm font-medium text-gray-700 mb-2">
                      Unit *
                    </label>
                    <input
                      type="text"
                      id="competitionUnit"
                      value={competitionUnit}
                      onChange={(e) => setCompetitionUnit(e.target.value)}
                      required={hasCompetition}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., seconds, lbs, reps"
                    />
                  </div>

                  <div>
                    <label htmlFor="competitionSort" className="block text-sm font-medium text-gray-700 mb-2">
                      Sort Order *
                    </label>
                    <select
                      id="competitionSort"
                      value={competitionSort}
                      onChange={(e) => setCompetitionSort(e.target.value as 'asc' | 'desc')}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="asc">Ascending (Lower is better - e.g., time)</option>
                      <option value="desc">Descending (Higher is better - e.g., weight, reps)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Updating...' : 'Update Workout'}
              </button>
              <button
                type="button"
                onClick={() => router.push(`/workouts/${workoutId}`)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
