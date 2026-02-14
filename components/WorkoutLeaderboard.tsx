'use client'

import { useEffect, useState } from 'react'
import { WorkoutSubmission } from '@/lib/firebase-helpers'
import { submissionHelpers } from '@/lib/firebase-helpers'
import { TrophyIcon } from '@heroicons/react/24/outline'

interface WorkoutLeaderboardProps {
  workoutId: string
  competitionType: 'time' | 'weight' | 'reps' | 'distance'
  competitionMetric: string
  competitionUnit: string
  competitionSort: 'asc' | 'desc'
  currentUserId?: string
}

export default function WorkoutLeaderboard({
  workoutId,
  competitionType,
  competitionMetric,
  competitionUnit,
  competitionSort,
  currentUserId
}: WorkoutLeaderboardProps) {
  const [submissions, setSubmissions] = useState<WorkoutSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [userSubmission, setUserSubmission] = useState<WorkoutSubmission | null>(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true)
        const topSubmissions = await submissionHelpers.getTopN(workoutId, 10, competitionSort)
        setSubmissions(topSubmissions)
        
        if (currentUserId) {
          const userSub = await submissionHelpers.getByUser(workoutId, currentUserId)
          setUserSubmission(userSub)
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [workoutId, competitionSort, currentUserId])

  const formatValue = (value: number, unit: string) => {
    if (unit === 'seconds') {
      const minutes = Math.floor(value / 60)
      const seconds = value % 60
      if (minutes > 0) {
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
      }
      return `${seconds}s`
    }
    return `${value} ${unit}`
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (submissions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrophyIcon className="w-6 h-6 text-primary-600" />
          Leaderboard
        </h3>
        <p className="text-gray-600 text-center py-8">
          No submissions yet. Be the first to compete!
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <TrophyIcon className="w-6 h-6 text-primary-600" />
        Leaderboard - {competitionMetric}
      </h3>
      
      <div className="space-y-2">
        {submissions.map((submission, index) => {
          const rank = index + 1
          const isCurrentUser = currentUserId && submission.userId === currentUserId
          
          return (
            <div
              key={submission.id}
              className={`flex items-center justify-between p-3 rounded-lg ${
                isCurrentUser
                  ? 'bg-primary-50 border-2 border-primary-500'
                  : rank <= 3
                  ? 'bg-gray-50'
                  : 'bg-white border border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-lg font-bold text-gray-700 w-8">
                  {getRankIcon(rank)}
                </div>
                <div>
                  <p className={`font-semibold ${isCurrentUser ? 'text-primary-900' : 'text-gray-900'}`}>
                    {submission.userName}
                    {isCurrentUser && <span className="ml-2 text-xs text-primary-600">(You)</span>}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-gray-900">
                  {formatValue(submission.metricValue, submission.unit)}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {userSubmission && !submissions.find(s => s.userId === userSubmission.userId) && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600 mb-2">Your submission:</p>
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
            <span className="font-semibold text-gray-700">{userSubmission.userName}</span>
            <span className="font-bold text-gray-900">
              {formatValue(userSubmission.metricValue, userSubmission.unit)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
