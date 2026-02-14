'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { submissionHelpers } from '@/lib/firebase-helpers'
import { Workout } from '@/lib/firebase-helpers'

interface WorkoutSubmissionFormProps {
  workout: Workout
  onSuccess?: () => void
}

export default function WorkoutSubmissionForm({ workout, onSuccess }: WorkoutSubmissionFormProps) {
  const { user } = useAuth()
  const [metricValue, setMetricValue] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!workout.competitionType || workout.competitionType === 'none') {
    return null
  }

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600 text-center">
          <a href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign in
          </a> to submit your results
        </p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    const value = parseFloat(metricValue)
    if (isNaN(value) || value <= 0) {
      setError('Please enter a valid number')
      return
    }

    setSubmitting(true)

    try {
      await submissionHelpers.submit({
        workoutId: workout.id!,
        userId: user.uid,
        userName: user.displayName || user.email || 'Anonymous',
        userEmail: user.email || undefined,
        metricValue: value,
        unit: workout.competitionUnit || 'units'
      })

      setSuccess(true)
      setMetricValue('')
      
      if (onSuccess) {
        setTimeout(() => {
          onSuccess()
          setSuccess(false)
        }, 2000)
      }
    } catch (err: any) {
      console.error('Error submitting result:', err)
      setError(err.message || 'Failed to submit result. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const getInputLabel = () => {
    if (workout.competitionType === 'time') {
      return 'Time (seconds)'
    }
    return `${workout.competitionMetric} (${workout.competitionUnit})`
  }

  const getInputPlaceholder = () => {
    if (workout.competitionType === 'time') {
      return 'e.g., 300 for 5 minutes'
    }
    if (workout.competitionType === 'weight') {
      return 'e.g., 225'
    }
    if (workout.competitionType === 'reps') {
      return 'e.g., 50'
    }
    return 'Enter your result'
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Submit Your Result</h3>
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
          Result submitted successfully! Leaderboard will update shortly.
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="metricValue" className="block text-sm font-medium text-gray-700 mb-2">
            {getInputLabel()}
          </label>
          <input
            type="number"
            id="metricValue"
            step={workout.competitionType === 'time' ? '1' : '0.1'}
            min="0"
            value={metricValue}
            onChange={(e) => setMetricValue(e.target.value)}
            placeholder={getInputPlaceholder()}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          {workout.competitionType === 'time' && (
            <p className="mt-1 text-sm text-gray-500">
              Enter time in seconds (e.g., 300 = 5 minutes, 60 = 1 minute)
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting...' : 'Submit Result'}
        </button>
      </form>
    </div>
  )
}
